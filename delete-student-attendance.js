/**
 * Delete all attendance logs for a specific student
 * Usage: node delete-student-attendance.js <student_email>
 */

require('dotenv').config();
const { Pool } = require('pg');
const readline = require('readline');

async function deleteStudentAttendance() {
  const email = process.argv[2];

  if (!email) {
    console.log('❌ Usage: node delete-student-attendance.js <student_email>');
    console.log('\nExample:');
    console.log('   node delete-student-attendance.js student@example.com');
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
      'SELECT id, student_id, name, email FROM students WHERE email = $1',
      [email]
    );

    if (student.rows.length === 0) {
      console.log(`❌ No student found with email: ${email}`);
      client.release();
      await pool.end();
      process.exit(1);
    }

    const studentData = student.rows[0];
    console.log('👤 Student: ' + studentData.name);
    console.log(`   Email: ${studentData.email}`);
    console.log(`   Student ID: ${studentData.student_id}`);

    // Count attendance logs
    const count = await client.query(
      'SELECT COUNT(*) as total FROM attendance_logs WHERE student_id = $1',
      [studentData.id]
    );

    const total = parseInt(count.rows[0].total);

    if (total === 0) {
      console.log('\n✅ No attendance logs to delete.');
      client.release();
      await pool.end();
      process.exit(0);
    }

    console.log(`\n⚠️  Found ${total} attendance log(s) for this student.`);

    // Ask for confirmation
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('\n❓ Are you sure you want to delete ALL attendance logs for this student? (yes/no): ', async (answer) => {
      rl.close();

      if (answer.toLowerCase() !== 'yes') {
        console.log('\n❌ Cancelled. No logs were deleted.');
        client.release();
        await pool.end();
        process.exit(0);
      }

      // Delete attendance logs
      console.log('\n🗑️  Deleting attendance logs...');
      const result = await client.query(
        'DELETE FROM attendance_logs WHERE student_id = $1',
        [studentData.id]
      );

      console.log(`\n✅ Deleted ${result.rowCount} attendance log(s).`);
      console.log('\n💡 The student can now scan QR codes to create new attendance logs.');

      client.release();
      await pool.end();
    });

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

deleteStudentAttendance();
