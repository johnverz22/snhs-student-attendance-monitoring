/**
 * Script to fix existing attendance logs to use configured timezone
 * This converts all UTC timestamps to the configured timezone
 */

const dbManager = require('../models/database');
const { getConfiguredTimezone, getTimezoneOffset } = require('../utils/timezone');

async function fixTimezoneData() {
  console.log('\n' + '='.repeat(70));
  console.log('  Fix Timezone Data - Convert UTC to Local Time');
  console.log('='.repeat(70) + '\n');

  try {
    // Initialize database
    dbManager.initialize();
    const db = dbManager.getConnection();
    
    // Get configured timezone
    const timezone = getConfiguredTimezone();
    const offsetHours = getTimezoneOffset(timezone);
    
    console.log('📍 Configuration:');
    console.log(`   Timezone: ${timezone}`);
    console.log(`   Offset: UTC${offsetHours >= 0 ? '+' : ''}${offsetHours}\n`);
    
    // Get count of attendance logs
    const { total } = db.prepare('SELECT COUNT(*) as total FROM attendance_logs').get();
    
    if (total === 0) {
      console.log('ℹ️  No attendance logs found. Nothing to fix.\n');
      return;
    }
    
    console.log(`📊 Found ${total} attendance log(s) to update\n`);
    
    // Ask for confirmation
    console.log('⚠️  WARNING: This will modify all attendance timestamps!');
    console.log(`   All times will be adjusted by ${offsetHours >= 0 ? '+' : ''}${offsetHours} hours\n`);
    
    // Show sample of what will change
    const samples = db.prepare(`
      SELECT id, entry_time 
      FROM attendance_logs 
      ORDER BY entry_time DESC 
      LIMIT 3
    `).all();
    
    console.log('📝 Sample changes:');
    samples.forEach(log => {
      const oldTime = new Date(log.entry_time + 'Z');
      const newTime = new Date(oldTime.getTime() + (offsetHours * 60 * 60 * 1000));
      const newTimeStr = newTime.toISOString().slice(0, 19).replace('T', ' ');
      console.log(`   ID ${log.id}: ${log.entry_time} → ${newTimeStr}`);
    });
    
    console.log('\n⏳ Updating timestamps...\n');
    
    // Update all attendance logs
    // SQLite datetime function: datetime(entry_time, '+X hours')
    const result = db.prepare(`
      UPDATE attendance_logs 
      SET entry_time = datetime(entry_time, '${offsetHours >= 0 ? '+' : ''}${offsetHours} hours')
    `).run();
    
    console.log(`✅ Updated ${result.changes} attendance log(s)\n`);
    
    // Show updated samples
    const updatedSamples = db.prepare(`
      SELECT id, entry_time 
      FROM attendance_logs 
      WHERE id IN (${samples.map(s => s.id).join(',')})
      ORDER BY entry_time DESC
    `).all();
    
    console.log('📝 Verification (updated records):');
    updatedSamples.forEach(log => {
      console.log(`   ID ${log.id}: ${log.entry_time}`);
    });
    
    console.log('\n✅ Timezone data fix completed successfully!\n');
    console.log('💡 Note: Future attendance logs will automatically use the configured timezone.\n');
    
  } catch (error) {
    console.error('❌ Error fixing timezone data:', error);
    process.exit(1);
  } finally {
    dbManager.close();
  }
}

// Run fix
fixTimezoneData();
