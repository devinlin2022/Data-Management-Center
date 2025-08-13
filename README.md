# Data Management Center

A Google Apps Script-powered web application for centrally managing and synchronizing data across multiple Google Sheets.

## Description

The Data Management Center provides a user-friendly web interface to solve the complex task of keeping data consistent across various Google Sheets. Instead of manually copying and pasting or managing complex individual scripts, this tool allows you to define all your data sync jobs in one "Control Center" sheet. The web app then reads your configuration and handles the execution, logging, and error reporting, streamlining your entire data workflow.

## Features

  * **Web-Based UI**: A simple and clean interface to start and monitor data management tasks.
  * **Centralized Configuration**: Manage all data sync jobs from a single "Control Center" Google Sheet.
  * **Flexible Data Sync**: Synchronize entire tabs or specific column ranges between source and target sheets.
  * **Automated Logging**: All operations and errors are automatically logged to a designated log sheet for easy tracking and debugging.
  * **Secure Deployment**: Runs entirely within your Google account, leveraging Google's secure infrastructure.

## Technical Architecture

This project uses a hybrid architecture, combining a web-based user interface (HTML/JavaScript) with a powerful Google Apps Script backend. The frontend provides a user-friendly way to interact with the system, while the backend handles all the heavy lifting and data manipulation within Google Sheets.

  * **Frontend (Client-Side)**: A custom web page (`index.html`, styled with CSS and powered by client-side JavaScript) that is served to the user. This interface communicates with the backend using the `google.script.run` API to execute tasks without reloading the page.
  * **Backend (Server-Side)**: The `Code.gs` script runs on Google's servers. It serves the web app, exposes functions to the frontend, and contains the core logic for all Google Sheet interactions (reading, writing, and logging).
  * **Data Layer (Google Sheets)**: Google Sheets act as the database, storing the configuration, source data, and operational logs.

## Code Structure

```
.
├── Code.gs             # Backend: Server-side logic, serves the UI, interacts with Google Sheets.
├── index.html          # Frontend: The main HTML file for the web application's structure.
├── js/
│   └── modules/        # Frontend: Client-side JavaScript for UI interactivity and API calls.
├── styles/
│   └── main.css        # Frontend: CSS styles for the web application.
└── appsscript.json     # Project manifest file for Apps Script.
```

## Setup & Deployment

To get this project running, you need to set up the Google Sheets and deploy the script as a web app.

### Step 1: Set Up the "Control Center" Sheet

1.  Create a new Google Sheet. This will be your main **Control Center**.
2.  Rename a tab in this sheet to `Control Center` (or a name of your choice).
3.  Set up the following headers in the first row of this tab:
      * `SourceSheetID`: The ID of the source Google Sheet.
      * `SourceTabName`: The name of the tab in the source sheet.
      * `TargetSheetID`: The ID of the target Google Sheet.
      * `TargetTabName`: The name of the tab in the target sheet.
      * `UpdateCol`: The columns to update (e.g., "A:C"). Leave blank to sync all data.
      * `IfCLEARDATA`: Set to `TRUE` to clear the target tab before writing new data.
      * `LogSheetID`: The ID of the Google Sheet for logging.
      * `LogTabName`: The name of the tab in the log sheet.
      * `Status`: This will be updated by the script with the operation status.

### Step 2: Deploy the Google Apps Script

1.  Create a new Google Apps Script project.
2.  Copy the contents of the files from this repository (`Code.gs`, `index.html`, etc.) into your Apps Script project, creating new files as needed.
3.  From the script editor, click **Deploy** \> **New deployment**.
4.  Click the gear icon next to "Select type" and choose **Web app**.
5.  In the configuration, set the following:
      * **Description**: (Optional) `Data Management Center v1`
      * **Execute as**: `Me`
      * **Who has access**: `Only myself` (or `Anyone within [Your Domain]`)
6.  Click **Deploy**.
7.  **Authorize permissions**: The first time you deploy, Google will ask for permission for the script to manage your Google Sheets. Review and **Allow** access.
8.  Copy the **Web app URL**. This is the link to your application.

## Usage

1.  Navigate to the **Web app URL** you received after deployment.
2.  The web interface will load.
3.  Use the buttons or forms in the UI to start the data synchronization process.
4.  Monitor the results by checking the "Status" column in your "Control Center" sheet and the detailed logs in your designated log sheet.
