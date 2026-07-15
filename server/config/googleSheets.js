const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

/**
 * Appends absentees to the configured Google Sheet
 * @param {Array} absenteesList Array of objects: { date, teacherName, className, rollNo, name, status }
 */
exports.appendAbsentees = async (absenteesList) => {
  if (!absenteesList || absenteesList.length === 0) {
    return { success: true, message: 'No absentees to sync' };
  }

  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  console.log(`[Google Sheets Service] Syncing ${absenteesList.length} absentees...`);

  // Resolve path relative to server root if it's relative
  let resolvedCredentialsPath = credentialsPath;
  if (credentialsPath && !path.isAbsolute(credentialsPath)) {
    resolvedCredentialsPath = path.resolve(__dirname, '..', credentialsPath);
  }

  // Graceful fallback to mock log if Google Sheets is not configured
  const isConfigured = spreadsheetId && resolvedCredentialsPath && fs.existsSync(resolvedCredentialsPath);

  if (!isConfigured) {
    console.warn(`[Google Sheets Sync] Sync credentials or Spreadsheet ID missing. Simulating sync to a local file.`);
    
    try {
      const logDir = path.join(__dirname, '../uploads');
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      
      const logPath = path.join(logDir, 'google_sheet_mock.log');
      const logEntries = absenteesList.map(a => 
        `[${new Date().toISOString()}] DATE: ${a.date} | TEACHER: ${a.teacherName} | CLASS: ${a.className} | ROLL NO: ${a.rollNo} | STUDENT: ${a.name} | STATUS: ${a.status}`
      ).join('\n') + '\n';
      
      fs.appendFileSync(logPath, logEntries);
      console.log(`[Google Sheets Mock] Appended absentees successfully to local file: ${logPath}`);
      return { success: true, simulated: true, message: 'Simulated sync logged locally.' };
    } catch (err) {
      console.error(`[Google Sheets Mock Error] Failed to write simulation log: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: resolvedCredentialsPath,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    // Prepare values for Google Sheet
    // Columns: Date, Teacher, Class, Roll No, Student Name, Status, Timestamp
    const values = absenteesList.map(a => [
      a.date,
      a.teacherName,
      a.className,
      a.rollNo,
      a.name,
      a.status,
      new Date().toLocaleString()
    ]);

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A:G',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values,
      },
    });

    console.log(`[Google Sheets Sync] Appended ${absenteesList.length} absentees to spreadsheet.`);
    return { success: true, response: response.data };
  } catch (error) {
    console.error(`[Google Sheets Sync Error] API call failed: ${error.message}`);
    // Do not throw so that Mongoose transaction completes; just return error status
    return { success: false, error: error.message };
  }
};
