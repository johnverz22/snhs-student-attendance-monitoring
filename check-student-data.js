/**
 * Check student data and attendance logs
 * Usage: node check-student-data.js <student_email>
 */

require('dotenv').config();
const { Pool } = require('pg');

async function checkStudentData() {
  const email = process.argv[2];

  if (!email) {
    console.log('❌ Usage: node check-student-data.js <student_email>');
    console.log('\nExample:');
    console.log('   node check-student-data.js student@example.com');
    process.exit(1);
  }

  const pool = new Pool({
    host: process.env.POSTGRES_HOST || process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.POSTGRES_DATABASE || process.env.DB_NAME,
    user: process.env.POSTGRES_USER || process.env.DB_USER,
    password: process.env.POSTGRES_PASSWORD || process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' || process.env.NODE_ENV === 'production' 
      ? { rejectUnauthorized: false } 
      : false,
  });

  try {
    console.log('📡 Connecting to database...\n');
    const client = await pool.connect();

    // Get student info
    const student = await client.query(
      'SELECT id, student_id, name, email, grade, section, created_at FROM students WHERE email = $1',
      [email]
    );

    if (student.rows.length === 0) {
      console.log(`❌ No student found with email: ${email}`);
      client.release();
      await pool.end();
      process.exit(1);
    }

    const studentData = student.rows[0];
    console.log('👤 Student Information:');
    console.log('═'.repeat(60));
    console.log(`   Database ID:  ${studentData.id}`);
    console.log(`   Student ID:   ${studentData.student_id}`);
    console.log(`   Name:         ${studentData.name}`);
    console.log(`   Email:        ${studentData.email}`);
    console.log(`   Grade:        ${studentData.grade || 'N/A'}`);
    console.log(`   Section:      ${studentData.section || 'N/A'}`);
    console.log(`   Created:      ${studentData.created_at}`);
    console.log('═'.repeat(60));

    // Get attendance logs for this student
    const attendance = await client.query(
      `SELECT 
        al.id,
        al.entry_time,
        al.latitude,
        al.longitude,
        al.location_valid,
        qr.gate_name,
        qr.code as qr_code
      FROM attendance_logs al
      JOIN qr_codes qr ON al.qr_code_id = qr.id
      WHERE al.student_id = $1
      ORDER BY al.entry_time DESC`,
      [studentData.id]
    );

    console.log(`\n📊 Attendance Logs: ${attendance.rows.length} records\n`);

    if (attendance.rows.length > 0) {
      console.log('═'.repeat(60));
      attendance.rows.forEach((log, index) => {
        console.log(`\n${index + 1}. Log ID: ${log.id}`);
        console.log(`   Time:     ${log.entry_time}`);
        console.log(`   Gate:     ${log.gate_name}`);
        console.log(`   Location: ${log.latitude}, ${log.longitude}`);
        console.log(`   Valid:    ${log.location_valid ? 'Yes' : 'No'}`);
      });
      console.log('\n' + '═'.repeat(60));

      // Ask if user wants to delete these logs
      console.log('\n⚠️  This student has attendance logs.');
      console.log('\n💡 To delete all attendance logs for this student, run:');
      console.log(`   node delete-student-attendance.js ${email}`);
    } else {
      console.log('✅ No attendance logs found for this student.');
    }

    // Check all students in database
    const allStudents = await client.query(
      'SELECT id, student_id, name, email, created_at FROM students ORDER BY created_at DESC LIMIT 10'
    );

    console.log(`\n\n📋 Recent Students in Database: ${allStudents.rows.length}\n`);
    console.log('═'.repeat(60));
    allStudents.rows.forEach((s, index) => {
      console.log(`${index + 1}. ${s.name} (${s.email})`);
      console.log(`   Student ID: ${s.student_id}, DB ID: ${s.id}`);
      console.log(`   Created: ${s.created_at}\n`);
    });

    client.release();
    await pool.end();

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

checkStudentData();
