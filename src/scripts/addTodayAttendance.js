const dbManager = require('../models/database');

async function addTodayAttendance() {
  console.log('📅 Adding attendance for today to test dashboard...\n');

  try {
    // Initialize database
    await dbManager.initialize();
    const db = dbManager.getConnection();

    // Get some students
    const students = db.prepare('SELECT id, student_id, name FROM students WHERE is_archived = 0 LIMIT 5').all();
    console.log(`Found ${students.length} students`);

    if (students.length === 0) {
      console.log('❌ No students found.');
      return;
    }

    // Get QR codes
    const qrCodes = db.prepare('SELECT id, code, gate_name FROM qr_codes WHERE is_active = 1').all();
    console.log(`Found ${qrCodes.length} QR codes`);

    if (qrCodes.length === 0) {
      console.log('❌ No active QR codes found.');
      return;
    }

    // Generate attendance for today
    const today = new Date();
    const attendanceData = [];

    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      
      // Random time between 7:00 AM and 8:30 AM today
      const hour = 7 + Math.floor(Math.random() * 2); // 7 or 8
      const minute = Math.floor(Math.random() * 60);
      
      const entryTime = new Date(today);
      entryTime.setHours(hour, minute, 0, 0);

      // Random QR code
      const qrCode = qrCodes[Math.floor(Math.random() * qrCodes.length)];

      // Mostly valid locations
      const locationValid = Math.random() > 0.2; // 80% valid
      const latitude = locationValid ? 16.848534 + (Math.random() - 0.5) * 0.001 : 16.848534 + (Math.random() - 0.5) * 0.01;
      const longitude = locationValid ? 120.37076 + (Math.random() - 0.5) * 0.001 : 120.37076 + (Math.random() - 0.5) * 0.01;

      attendanceData.push({
        student_id: student.id,
        qr_code_id: qrCode.id,
        entry_time: entryTime.toISOString().replace('T', ' ').slice(0, 19),
        latitude,
        longitude,
        location_valid: locationValid ? 1 : 0
      });

      console.log(`✓ Generated attendance for ${student.name} at ${entryTime.toLocaleTimeString()}`);
    }

    // Insert attendance data
    const insertStmt = db.prepare(`
      INSERT INTO attendance_logs (student_id, qr_code_id, entry_time, latitude, longitude, location_valid)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    let inserted = 0;
    for (const record of attendanceData) {
      try {
        insertStmt.run(
          record.student_id,
          record.qr_code_id,
          record.entry_time,
          record.latitude,
          record.longitude,
          record.location_valid
        );
        inserted++;
      } catch (error) {
        console.log(`Skipped record for student ${record.student_id}: ${error.message}`);
      }
    }

    console.log(`\n✅ Successfully inserted ${inserted} attendance records for today`);

    // Show today's statistics
    const todayStats = db.prepare(`
      SELECT 
        COUNT(*) as total_entries,
        COUNT(DISTINCT student_id) as unique_students,
        SUM(location_valid) as valid_locations
      FROM attendance_logs
      WHERE DATE(entry_time) = DATE('now')
    `).get();

    console.log('\n📊 Today\'s Statistics:');
    console.log(`Total entries: ${todayStats.total_entries}`);
    console.log(`Unique students: ${todayStats.unique_students}`);
    console.log(`Valid locations: ${todayStats.valid_locations}`);

    console.log('\n🎉 Today\'s attendance data added successfully!');
    console.log('You can now refresh the dashboard to see updated statistics.');

  } catch (error) {
    console.error('❌ Error adding today\'s attendance:', error);
    process.exit(1);
  }
}

addTodayAttendance();