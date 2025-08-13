/**
 * Medical Training Consultancy Dashboard - Google Apps Script Backend
 * Manages data persistence, authentication, and server-side logic
 */

// Configuration Constants
const CONFIG = {
  SPREADSHEET_ID: '1rGIVYqJ2-gq9yDBdJbpSwGES13ZUJgXIdS7cxymULFA', // Set your Google Sheets ID here
  SHEETS: {
    BRANCHES: 'Hospital_Branches',
    TRAINEES: 'Trainees',
    COURSES: 'Courses',
    TRAINERS: 'Trainers',
    SCHEDULE: 'Schedule',
    USERS: 'Users',
    LOGS: 'Activity_Logs'
  },
  VERSION: '1.0.0'
};

/**
 * Main function to serve the HTML application
 */
function doGet(e) {
  try {
    // Initialize sheets if they don't exist
    initializeDatabase();
    
    // Serve the main HTML file
    const template = HtmlService.createTemplateFromFile('index');
    const html = template.evaluate()
      .setTitle('Medical Training Consultancy Dashboard')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
    
    return html;
  } catch (error) {
    console.error('Error in doGet:', error);
    return HtmlService.createHtmlOutput('<h1>Error loading application</h1><p>' + error.toString() + '</p>');
  }
}

/**
 * Include external files (CSS, JS)
 */
function include(filename) {
  try {
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
  } catch (error) {
    console.error('Error including file:', filename, error);
    return '';
  }
}

/**
 * Initialize database sheets
 */
function initializeDatabase() {
  try {
    let spreadsheet = getOrCreateSpreadsheet();
    
    // Initialize all required sheets
    Object.values(CONFIG.SHEETS).forEach(sheetName => {
      let sheet = spreadsheet.getSheetByName(sheetName);
      if (!sheet) {
        sheet = spreadsheet.insertSheet(sheetName);
        initializeSheetHeaders(sheet, sheetName);
      }
    });
    
    // Add sample data if sheets are empty
    addSampleDataIfEmpty();
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

/**
 * Get or create the main spreadsheet
 */
function getOrCreateSpreadsheet() {
  try {
    if (CONFIG.SPREADSHEET_ID) {
      return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    } else {
      // Create new spreadsheet
      const spreadsheet = SpreadsheetApp.create('Medical Training Consultancy Data');
      console.log('Created new spreadsheet:', spreadsheet.getId());
      return spreadsheet;
    }
  } catch (error) {
    console.error('Error accessing spreadsheet:', error);
    throw error;
  }
}

/**
 * Initialize sheet headers based on sheet type
 */
function initializeSheetHeaders(sheet, sheetName) {
  const headers = {
    [CONFIG.SHEETS.BRANCHES]: [
      'ID', 'Name', 'Location', 'Phone', 'Email', 'Active Trainees', 
      'Courses Offered', 'Trainers Assigned', 'Admin Assigned', 'Capacity', 
      'Status', 'Created Date', 'Updated Date'
    ],
    [CONFIG.SHEETS.TRAINEES]: [
      'ID', 'Name', 'CNIC', 'Phone', 'Email', 'Hospital Branch', 
      'Course Enrolled', 'Trainer', 'Enrollment Date', 'Status', 'Progress', 
      'Completed Modules', 'Total Modules', 'Certificates Earned', 'Created Date', 'Updated Date'
    ],
    [CONFIG.SHEETS.COURSES]: [
      'ID', 'Title', 'Duration', 'Mode', 'Total Sessions', 'Trainees Enrolled', 
      'Assigned Trainers', 'Objectives', 'Curriculum', 'Rating', 'Status', 
      'Start Date', 'End Date', 'Materials', 'Completion Rate', 'Created Date', 'Updated Date'
    ],
    [CONFIG.SHEETS.TRAINERS]: [
      'ID', 'Name', 'Specialty', 'Courses Handled', 'Branch Assigned', 'Rating', 
      'Phone', 'Email', 'Qualifications', 'Experience', 'Status', 'Total Trainees', 
      'Completed Courses', 'Availability', 'Created Date', 'Updated Date'
    ],
    [CONFIG.SHEETS.SCHEDULE]: [
      'ID', 'Title', 'Course', 'Trainer', 'Branch', 'Date', 'Time', 
      'Attendees', 'Type', 'Status', 'Room', 'Notes', 'Created Date', 'Updated Date'
    ],
    [CONFIG.SHEETS.USERS]: [
      'ID', 'Email', 'Name', 'Role', 'Permissions', 'Last Login', 'Status', 'Created Date'
    ],
    [CONFIG.SHEETS.LOGS]: [
      'ID', 'Timestamp', 'User', 'Action', 'Module', 'Details', 'IP Address'
    ]
  };
  
  if (headers[sheetName]) {
    sheet.getRange(1, 1, 1, headers[sheetName].length).setValues([headers[sheetName]]);
    sheet.getRange(1, 1, 1, headers[sheetName].length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
}

/**
 * Add sample data if sheets are empty
 */
function addSampleDataIfEmpty() {
  // Add sample branches
  if (getSheetData(CONFIG.SHEETS.BRANCHES).length === 0) {
    addSampleBranches();
  }
  
  // Add sample courses
  if (getSheetData(CONFIG.SHEETS.COURSES).length === 0) {
    addSampleCourses();
  }
  
  // Add sample trainers
  if (getSheetData(CONFIG.SHEETS.TRAINERS).length === 0) {
    addSampleTrainers();
  }
  
  // Add sample trainees
  if (getSheetData(CONFIG.SHEETS.TRAINEES).length === 0) {
    addSampleTrainees();
  }
}

/**
 * CRUD Operations - Generic Functions
 */

// Create
function createRecord(tableName, data) {
  try {
    const sheet = getSheet(tableName);
    const id = generateId();
    const timestamp = new Date();
    
    data.id = id;
    data.createdDate = timestamp;
    data.updatedDate = timestamp;
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const rowData = headers.map(header => data[camelCase(header)] || '');
    
    sheet.appendRow(rowData);
    logActivity('CREATE', tableName, `Created record with ID: ${id}`);
    
    return { success: true, id: id, data: data };
  } catch (error) {
    console.error('Error creating record:', error);
    return { success: false, error: error.toString() };
  }
}

// Read
function getRecords(tableName, filters = {}) {
  try {
    const data = getSheetData(tableName);
    let filteredData = data;
    
    // Apply filters
    if (Object.keys(filters).length > 0) {
      filteredData = data.filter(record => {
        return Object.keys(filters).every(key => {
          if (filters[key] === 'all' || filters[key] === '') return true;
          return record[key] && record[key].toString().toLowerCase().includes(filters[key].toString().toLowerCase());
        });
      });
    }
    
    return { success: true, data: filteredData };
  } catch (error) {
    console.error('Error reading records:', error);
    return { success: false, error: error.toString() };
  }
}

// Update
function updateRecord(tableName, id, data) {
  try {
    const sheet = getSheet(tableName);
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const allData = sheet.getDataRange().getValues();
    
    const rowIndex = allData.findIndex(row => row[0].toString() === id.toString());
    if (rowIndex === -1) {
      return { success: false, error: 'Record not found' };
    }
    
    data.updatedDate = new Date();
    const rowData = headers.map(header => {
      const camelKey = camelCase(header);
      return data.hasOwnProperty(camelKey) ? data[camelKey] : allData[rowIndex][headers.indexOf(header)];
    });
    
    sheet.getRange(rowIndex + 1, 1, 1, headers.length).setValues([rowData]);
    logActivity('UPDATE', tableName, `Updated record with ID: ${id}`);
    
    return { success: true, id: id };
  } catch (error) {
    console.error('Error updating record:', error);
    return { success: false, error: error.toString() };
  }
}

// Delete
function deleteRecord(tableName, id) {
  try {
    const sheet = getSheet(tableName);
    const allData = sheet.getDataRange().getValues();
    
    const rowIndex = allData.findIndex(row => row[0].toString() === id.toString());
    if (rowIndex === -1) {
      return { success: false, error: 'Record not found' };
    }
    
    sheet.deleteRow(rowIndex + 1);
    logActivity('DELETE', tableName, `Deleted record with ID: ${id}`);
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting record:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Module-specific API Functions
 */

// Hospital Branches
function getBranches(filters = {}) {
  return getRecords(CONFIG.SHEETS.BRANCHES, filters);
}

function createBranch(data) {
  return createRecord(CONFIG.SHEETS.BRANCHES, data);
}

function updateBranch(id, data) {
  return updateRecord(CONFIG.SHEETS.BRANCHES, id, data);
}

function deleteBranch(id) {
  return deleteRecord(CONFIG.SHEETS.BRANCHES, id);
}

// Trainees
function getTrainees(filters = {}) {
  return getRecords(CONFIG.SHEETS.TRAINEES, filters);
}

function createTrainee(data) {
  return createRecord(CONFIG.SHEETS.TRAINEES, data);
}

function updateTrainee(id, data) {
  return updateRecord(CONFIG.SHEETS.TRAINEES, id, data);
}

function deleteTrainee(id) {
  return deleteRecord(CONFIG.SHEETS.TRAINEES, id);
}

// Courses
function getCourses(filters = {}) {
  return getRecords(CONFIG.SHEETS.COURSES, filters);
}

function createCourse(data) {
  return createRecord(CONFIG.SHEETS.COURSES, data);
}

function updateCourse(id, data) {
  return updateRecord(CONFIG.SHEETS.COURSES, id, data);
}

function deleteCourse(id) {
  return deleteRecord(CONFIG.SHEETS.COURSES, id);
}

// Trainers
function getTrainers(filters = {}) {
  return getRecords(CONFIG.SHEETS.TRAINERS, filters);
}

function createTrainer(data) {
  return createRecord(CONFIG.SHEETS.TRAINERS, data);
}

function updateTrainer(id, data) {
  return updateRecord(CONFIG.SHEETS.TRAINERS, id, data);
}

function deleteTrainer(id) {
  return deleteRecord(CONFIG.SHEETS.TRAINERS, id);
}

// Schedule
function getSchedule(filters = {}) {
  return getRecords(CONFIG.SHEETS.SCHEDULE, filters);
}

function createScheduleSession(data) {
  return createRecord(CONFIG.SHEETS.SCHEDULE, data);
}

function updateScheduleSession(id, data) {
  return updateRecord(CONFIG.SHEETS.SCHEDULE, id, data);
}

function deleteScheduleSession(id) {
  return deleteRecord(CONFIG.SHEETS.SCHEDULE, id);
}

/**
 * Dashboard Statistics
 */
function getDashboardStats() {
  try {
    const branches = getSheetData(CONFIG.SHEETS.BRANCHES);
    const trainees = getSheetData(CONFIG.SHEETS.TRAINEES);
    const courses = getSheetData(CONFIG.SHEETS.COURSES);
    const trainers = getSheetData(CONFIG.SHEETS.TRAINERS);
    const schedule = getSheetData(CONFIG.SHEETS.SCHEDULE);
    
    const stats = {
      totalBranches: branches.length,
      activeBranches: branches.filter(b => b.status === 'Active').length,
      totalTrainees: trainees.length,
      activeTrainees: trainees.filter(t => t.status === 'Active').length,
      completedTrainees: trainees.filter(t => t.status === 'Completed').length,
      totalCourses: courses.length,
      activeCourses: courses.filter(c => c.status === 'Active').length,
      totalTrainers: trainers.length,
      activeTrainers: trainers.filter(t => t.status === 'Active').length,
      upcomingSessions: schedule.filter(s => {
        const sessionDate = new Date(s.date);
        const today = new Date();
        return sessionDate >= today && s.status === 'Scheduled';
      }).length,
      todaySessions: schedule.filter(s => {
        const sessionDate = new Date(s.date);
        const today = new Date();
        return sessionDate.toDateString() === today.toDateString();
      }).length
    };
    
    return { success: true, data: stats };
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Utility Functions
 */
function getSheet(sheetName) {
  const spreadsheet = getOrCreateSpreadsheet();
  return spreadsheet.getSheetByName(sheetName);
}

function getSheetData(sheetName) {
  const sheet = getSheet(sheetName);
  if (!sheet || sheet.getLastRow() <= 1) return [];
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
  
  return data.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[camelCase(header)] = row[index];
    });
    return obj;
  });
}

function generateId() {
  return Utilities.getUuid().substring(0, 8);
}

function camelCase(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
    return index === 0 ? word.toLowerCase() : word.toUpperCase();
  }).replace(/\s+/g, '');
}

function logActivity(action, module, details) {
  try {
    const sheet = getSheet(CONFIG.SHEETS.LOGS);
    const user = Session.getActiveUser().getEmail();
    const timestamp = new Date();
    const id = generateId();
    
    sheet.appendRow([id, timestamp, user, action, module, details, '']);
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}

/**
 * Authentication and User Management
 */
function getCurrentUser() {
  try {
    const user = Session.getActiveUser();
    return {
      success: true,
      data: {
        email: user.getEmail(),
        name: user.getEmail().split('@')[0],
        role: 'admin' // Default role, can be enhanced
      }
    };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

/**
 * Sample Data Functions
 */
function addSampleBranches() {
  const sampleBranches = [
    {
      name: 'Downtown Medical Center',
      location: 'Lahore, Punjab',
      phone: '+92-42-111-2233',
      email: 'downtown@hospital.com',
      activeTrainees: 45,
      coursesOffered: 8,
      trainersAssigned: 12,
      adminAssigned: 'Dr. Ahmed Khan',
      capacity: 50,
      status: 'Active'
    },
    {
      name: 'City General Hospital',
      location: 'Karachi, Sindh',
      phone: '+92-21-111-4455',
      email: 'citygeneral@hospital.com',
      activeTrainees: 38,
      coursesOffered: 6,
      trainersAssigned: 9,
      adminAssigned: 'Dr. Fatima Ali',
      capacity: 40,
      status: 'Active'
    }
  ];
  
  sampleBranches.forEach(branch => createRecord(CONFIG.SHEETS.BRANCHES, branch));
}

function addSampleCourses() {
  const sampleCourses = [
    {
      title: 'Advanced Cardiology',
      duration: '8 weeks',
      mode: 'Hybrid',
      totalSessions: 16,
      traineesEnrolled: 24,
      assignedTrainers: 'Dr. Ahmed Hassan, Dr. Sarah Khan',
      objectives: 'Master advanced cardiac diagnosis and treatment procedures',
      curriculum: 'ECG Interpretation, Cardiac Catheterization, Heart Surgery Basics, Emergency Cardiology',
      rating: 4.8,
      status: 'Active',
      startDate: '2024-02-01',
      endDate: '2024-03-29',
      materials: 12,
      completionRate: 85
    }
  ];
  
  sampleCourses.forEach(course => createRecord(CONFIG.SHEETS.COURSES, course));
}

function addSampleTrainers() {
  const sampleTrainers = [
    {
      name: 'Dr. Ahmed Hassan',
      specialty: 'Cardiology',
      coursesHandled: 'Advanced Cardiology, Basic ECG Reading',
      branchAssigned: 'Downtown Medical Center',
      rating: 4.8,
      phone: '+92-300-1111111',
      email: 'ahmed.hassan@hospital.com',
      qualifications: 'MBBS, MD Cardiology, FCPS',
      experience: '12 years',
      status: 'Active',
      totalTrainees: 45,
      completedCourses: 8,
      availability: 'Full-time'
    }
  ];
  
  sampleTrainers.forEach(trainer => createRecord(CONFIG.SHEETS.TRAINERS, trainer));
}

function addSampleTrainees() {
  const sampleTrainees = [
    {
      name: 'Dr. Aisha Khan',
      cnic: '12345-6789012-3',
      phone: '+92-300-1234567',
      email: 'aisha.khan@email.com',
      hospitalBranch: 'Downtown Medical Center',
      courseEnrolled: 'Advanced Cardiology',
      trainer: 'Dr. Ahmed Hassan',
      enrollmentDate: '2024-01-15',
      status: 'Active',
      progress: 75,
      completedModules: 6,
      totalModules: 8,
      certificatesEarned: 2
    }
  ];
  
  sampleTrainees.forEach(trainee => createRecord(CONFIG.SHEETS.TRAINEES, trainee));
}

/**
 * Data Export Functions
 */
function exportData(tableName, format = 'csv') {
  try {
    const data = getSheetData(tableName);
    if (format === 'json') {
      return { success: true, data: JSON.stringify(data, null, 2) };
    }
    // Default CSV export
    const sheet = getSheet(tableName);
    const blob = sheet.getAs('text/csv');
    return { success: true, data: blob.getDataAsString() };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

/**
 * Backup Functions
 */
function createBackup() {
  try {
    const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd_HH-mm-ss');
    const backupName = `Medical_Training_Backup_${timestamp}`;
    const originalSpreadsheet = getOrCreateSpreadsheet();
    const backup = originalSpreadsheet.copy(backupName);
    
    return { success: true, backupId: backup.getId(), backupName: backupName };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

/**
 * System Information
 */
function getSystemInfo() {
  return {
    version: CONFIG.VERSION,
    timestamp: new Date(),
    user: Session.getActiveUser().getEmail(),
    spreadsheetId: getOrCreateSpreadsheet().getId()
  };
}
