/**
 * Test script to verify timezone functionality
 */

const dbManager = require('../models/database');
const { 
  getConfiguredTimezone, 
  getTimezoneOffset, 
  getCurrentTimestamp,
  convertToLocalTime,
  formatTimestamp 
} = require('../utils/timezone');

async function testTimezone() {
  console.log('\n' + '='.repeat(70));
  console.log('  Timezone Configuration Test');
  console.log('='.repeat(70) + '\n');

  try {
    // Initialize database
    dbManager.initialize();
    
    // Get configured timezone
    const timezone = getConfiguredTimezone();
    const offset = getTimezoneOffset(timezone);
    
    console.log('📍 Current Configuration:');
    console.log(`   Timezone: ${timezone}`);
    console.log(`   Offset: UTC${offset >= 0 ? '+' : ''}${offset}\n`);
    
    // Get current timestamp in configured timezone
    const localTime = getCurrentTimestamp();
    console.log('🕐 Current Time:');
    console.log(`   Local Time (${timezone}): ${localTime}`);
    console.log(`   UTC Time: ${new Date().toISOString().slice(0, 19).replace('T', ' ')}\n`);
    
    // Test with sample attendance log
    const db = dbManager.getConnection();
    const sampleLog = db.prepare(`
      SELECT entry_time 
      FROM attendance_logs 
      ORDER BY entry_time DESC 
      LIMIT 1
    `).get();
    
    if (sampleLog) {
      console.log('📝 Sample Attendance Log:');
      console.log(`   Stored Time: ${sampleLog.entry_time}`);
      console.log(`   Formatted: ${formatTimestamp(sampleLog.entry_time)}\n`);
    } else {
      console.log('📝 No attendance logs found in database\n');
    }
    
    // Show time difference
    const utcNow = new Date();
    const localNow = new Date(utcNow.getTime() + (offset * 60 * 60 * 1000));
    
    console.log('⏰ Time Difference:');
    console.log(`   UTC: ${utcNow.toISOString()}`);
    console.log(`   ${timezone}: ${localNow.toISOString()}`);
    console.log(`   Difference: ${offset} hours\n`);
    
    console.log('✅ Timezone test completed successfully\n');
    
  } catch (error) {
    console.error('❌ Error testing timezone:', error);
    process.exit(1);
  } finally {
    dbManager.close();
  }
}

// Run test
testTimezone();
