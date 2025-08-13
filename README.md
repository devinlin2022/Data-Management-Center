# Data Management Center

The Data Management Center is a Google Apps Script project designed to streamline data management tasks within the Google ecosystem. It provides a centralized interface for managing data between Google Sheets, with functionalities for data synchronization, updates, and logging.

## Features

* **Data Synchronization:** Automatically syncs data between a "Control Center" Google Sheet and various "source" and "target" sheets.
* **Selective Data Updates:** Allows for updating specific columns of data, providing flexibility in data management.
* **Error Logging:** Logs any errors encountered during the data synchronization process to a designated "log sheet" for easy debugging.
* **Custom Menu:** Adds a custom menu to the Google Sheet UI for easy execution of the data management functions.
* **Configuration-driven:** All settings, including source/target sheet IDs, tab names, and column mappings, are managed from a central "Control Center" sheet.

## How It Works

The script is triggered by a custom menu in the "Control Center" Google Sheet. When a user runs the "Start" function, the script reads the configuration from the "Control Center" sheet. For each entry in the "Control Center":

1.  It opens the source and target Google Sheets using their IDs.
2.  It retrieves the data from the specified tab in the source sheet.
3.  It clears the content of the target tab (if configured to do so).
4.  It writes the data to the target tab in the target sheet.
5.  It logs the status of the operation (success or error) in the "Control Center" sheet.

## Setup

1.  **Create a new Google Sheet** that will serve as your "Control Center".
2.  **Create a new Google Apps Script project** and copy the code from the `.gs` files in this repository into the script editor.
3.  **Configure the "Control Center" sheet:** The sheet should have the following columns:
    * `SourceSheetID`: The ID of the source Google Sheet.
    * `SourceTabName`: The name of the tab in the source sheet to get data from.
    * `TargetSheetID`: The ID of the target Google Sheet to write data to.
    * `TargetTabName`: The name of the tab in the target sheet.
    * `UpdateCol`: The columns to update (e.g., "A:C" to update columns A, B, and C).
    * `IfCLEARDATA`:  Set to `TRUE` if you want to clear the target sheet before writing new data.
    * `LogSheetID`: The ID of the Google Sheet where logs should be written.
    * `LogTabName`: The name of the tab in the log sheet.
    * `Status`: This column will be updated by the script with the status of the operation.

4.  **Authorize the script:** The first time you run the script, you will need to grant it permission to access your Google Sheets.

## Usage

1.  Open the "Control Center" Google Sheet.
2.  A new menu item called "Data Management" should appear in the UI.
3.  Click on "Data Management" and then "Start" to begin the data synchronization process.
4.  Check the "Status" column in the "Control Center" sheet and the "log sheet" for the results of the operation.

## Code Structure

* `Main.gs`: Contains the main logic for reading the "Control Center" and processing the data synchronization tasks.
* `Setting.gs`: Contains the `onOpen()` function that creates the custom menu in the Google Sheet UI.
* `Sheet.gs`: Contains utility functions for interacting with Google Sheets, such as getting and writing data.

---

Feel free to modify this README to better fit your project's specific needs. You can add more details about the project's purpose, a "Contributing" section if you want others to contribute, and a "License" section.
