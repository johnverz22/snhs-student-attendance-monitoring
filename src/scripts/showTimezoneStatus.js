/**
 * Quick status check for timezone configuration
 */

const dbManager = require('../models/database');
const { getConfiguredTimezone, getTimezoneOffset, getCurrentTimestamp } = require('../utils/timezone');

async function showStatus() {
  try {
    dbManager.initialize();
    const db = dbManager.getConnection();
    
    const timezone = getConfiguredTimezone();
    const offset = getTimezoneOffset(timezone);
    const localTime = getCurrentTimestamp();
    const utcTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    const { total } = db.prepare('SELECT COUNT(*) as total FROM attendance_logs').get();
    const latest = db.prepare('SELECT entry_time FROM attendance_logs ORDER BY entry_time DESC LIMIT 1').get();
    
    console.log('\n📍 Timezone Status');
    console.log('─'.repeat(50));
    console.log(`Configured: ${timezone} (UTC${offset >= 0 ? '+' : ''}${offset})`);
    console.log(`Local Time: ${localTime}`);
    console.log(`UTC Time:   ${utcTime}`);
    console.log(`\n📊 Attendance Logs: ${total} total`);
    if (latest) {
      console.log(`Latest:     ${latest.entry_time}`);
    }
    console.log('');
    
    dbManager.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

showStatus();
