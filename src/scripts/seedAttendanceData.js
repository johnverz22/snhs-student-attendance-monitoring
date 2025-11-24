const dbManager = require('../models/database');

async function seedAttendanceData() {
  console.log('🌱 Seeding attendance data for dashboard testing...\n');

  try {
    // Initialize database
    await dbManager.initialize();
    const db = dbManager.getConnection();

    // Get existing students
    const students = db.prepare('SELECT id, student_id, name FROM students WHERE is_archived = 0').all();
    console.log(`Found ${students.length} students`);

    if (students.length === 0) {
      console.log('❌ No students found. Please add students first.');
      return;
    }

    // Get existing QR codes
    const qrCodes = db.prepare('SELECT id, code, gate_name FROM qr_codes WHERE is_active = 1').all();
    console.log(`Found ${qrCodes.length} QR codes`);

    if (qrCodes.length === 0) {
      console.log('❌ No active QR codes found. Creating test QR codes...');
      
      // Create test QR codes
      const testQRCodes = [
        { code: 'GATE_A_2024', gate_name: 'Main Gate A' },
        { code: 'GATE_B_2024', gate_name: 'Side Gate B' }
      ];

      for (const qr of testQRCodes) {
        db.prepare(`
          INSERT INTO qr_codes (code, gate_name, is_active, created_at)
          VALUES (?, ?, 1, CURRENT_TIMESTAMP)
        `).run(qr.code, qr.gate_name);
      }

      // Re-fetch QR codes
      const newQRCodes = db.prepare('SELECT id, code, gate_name FROM qr_codes WHERE is_active = 1').all();
      console.log(`Created ${newQRCodes.length} QR codes`);
      qrCodes.push(...newQRCodes);
    }

    // Generate attendance data for the last 30 days
    const today = new Date();
    const attendanceData = [];

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Skip weekends (Saturday = 6, Sunday = 0)
      if (date.getDay() === 0 || date.getDay() === 6) {
        continue;
      }

      // Generate random attendance for 30-70% of students
      const attendanceRate = 0.3 + Math.random() * 0.4; // 30-70%
      const attendingStudents = Math.floor(students.length * attendanceRate);
      
      // Randomly select students for this day
      const shuffledStudents = [...students].sort(() => Math.random() - 0.5);
      const selectedStudents = shuffledStudents.slice(0, attendingStudents);

      for (const student of selectedStudents) {
        // Random time between 7:00 AM and 8:30 AM
        const hour = 7 + Math.floor(Math.random() * 2); // 7 or 8
        const minute = Math.floor(Math.random() * 60);
        
        const entryTime = new Date(date);
        entryTime.setHours(hour, minute, 0, 0);

        // Random QR code
        const qrCode = qrCodes[Math.floor(Math.random() * qrCodes.length)];

        // Random location (mostly valid, some invalid)
        const locationValid = Math.random() > 0.1; // 90% valid
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
      }
    }

    console.log(`\nGenerating ${attendanceData.length} attendance records...`);

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
        // Skip duplicates or other errors
        console.log(`Skipped record for student ${record.student_id}: ${error.message}`);
      }
    }

    console.log(`✅ Successfully inserted ${inserted} attendance records`);

    // Show some statistics
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total_records,
        COUNT(DISTINCT student_id) as unique_students,
        COUNT(DISTINCT DATE(entry_time)) as unique_days,
        SUM(location_valid) as valid_locations
      FROM attendance_logs
    `).get();

    console.log('\n📊 Database Statistics:');
    console.log(`Total attendance records: ${stats.total_records}`);
    console.log(`Unique students with attendance: ${stats.unique_students}`);
    console.log(`Days with attendance: ${stats.unique_days}`);
    console.log(`Valid location records: ${stats.valid_locations}`);

    // Show today's attendance
    const todayStats = db.prepare(`
      SELECT COUNT(*) as today_count
      FROM attendance_logs
      WHERE DATE(entry_time) = DATE('now')
    `).get();

    console.log(`Today's attendance: ${todayStats.today_count}`);

    console.log('\n🎉 Attendance data seeding completed!');

  } catch (error) {
    console.error('❌ Error seeding attendance data:', error);
    process.exit(1);
  }
}

seedAttendanceData();