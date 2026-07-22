const dotenv = require('dotenv');
const googleSheets = require('./config/googleSheets');

dotenv.config();

const run = async () => {
  console.log('Starting Google Sheets API test...');
  console.log('Env variables:');
  console.log('GOOGLE_SPREADSHEET_ID:', process.env.GOOGLE_SPREADSHEET_ID);
  console.log('GOOGLE_APPLICATION_CREDENTIALS:', process.env.GOOGLE_APPLICATION_CREDENTIALS);

  const result = await googleSheets.appendAbsentees([
    {
      date: new Date().toLocaleDateString('en-GB'),
      teacherName: 'Test Teacher',
      className: 'Test Class',
      rollNo: 'TEST-999',
      name: 'Test Student',
      status: 'Absent'
    }
  ]);

  console.log('\n--- TEST RESULT ---');
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
};

run();
