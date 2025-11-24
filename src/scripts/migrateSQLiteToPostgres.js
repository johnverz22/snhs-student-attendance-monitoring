/**
 * Migration script to transfer data from SQLite to PostgreSQL
 * Run this script to migrate existing data from SQLite database to PostgreSQL
 */

const Database = require('better-sqlite3');
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

// SQLite database path
const SQLITE_DB_PATH = path.join(__dirname, '../../data/attendance.db');

// PostgreSQL connection
const pgPool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'school_attendance',
  user: process.env.DB_USER || 'school_admin',
  password: process.env.DB_PASSWORD || 'school_password_123',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function migrateSQLiteToPostgres() {
  console.log('🔄 Starting migration from SQLite to PostgreSQL...\n');

  // Check if SQLite database exists
  if (!fs.existsSync(SQLITE_DB_PATH)) {
    console.log('❌ SQLite database not found at:', SQLITE_DB_PATH);
    console.log('ℹ️  No data to migrate. Starting fresh with PostgreSQL.');
    process.exit(0);
  }

  const sqlite = new Database(SQLITE_DB_PATH, { readonly: true });
  const pgClient = await pgPool.connect();

  try {
    await pgClient.query('BEGIN');

    // Migrate students
    console.log('📚 Migrating students...');
    const students = sqlite.prepare('SELECT * FROM students').all();
    for (const student of students) {
      await pgClient.query(`
        INSERT INTO students (id, student_id, name, email, password_hash, grade, section, phone, is_archived, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (id) DO NOTHING
      `, [
        student.id,
        student.student_id,
        student.name,
        student.email,
        student.password_hash,
        student.grade,
        student.section,
        student.phone,
        student.is_archived || false,
        student.created_at,
        student.updated_at
      ]);
    }
    console.log(`   ✅ Migrated ${students.length} students`);

    // Update sequence for students
    if (students.length > 0) {
      const maxId = Math.max(...students.map(s => s.id));
      await pgClient.query(`SELECT setval('students_id_seq', $1, true)`, [maxId]);
    }

    // Migrate parents
    console.log('👨‍👩‍👧‍👦 Migrating parents...');
    const parents = sqlite.prepare('SELECT * FROM parents').all();
    for (const parent of parents) {
      await pgClient.query(`
        INSERT INTO parents (id, name, email, password_hash, phone, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO NOTHING
      `, [
        parent.id,
        parent.name,
        parent.email,
        parent.password_hash,
        parent.phone,
        parent.created_at,
        parent.updated_at
      ]);
    }
    console.log(`   ✅ Migrated ${parents.length} parents`);

    // Update sequence for parents
    if (parents.length > 0) {
      const maxId = Math.max(...parents.map(p => p.id));
      await pgClient.query(`SELECT setval('parents_id_seq', $1, true)`, [maxId]);
    }

    // Migrate parent-student links
    console.log('🔗 Migrating parent-student links...');
    const links = sqlite.prepare('SELECT * FROM parent_student_links').all();
    for (const link of links) {
      await pgClient.query(`
        INSERT INTO parent_student_links (id, parent_id, student_id, relationship, created_at)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO NOTHING
      `, [
        link.id,
        link.parent_id,
        link.student_id,
        link.relationship,
        link.created_at
      ]);
    }
    console.log(`   ✅ Migrated ${links.length} parent-student links`);

    // Update sequence for parent_student_links
    if (links.length > 0) {
      const maxId = Math.max(...links.map(l => l.id));
      await pgClient.query(`SELECT setval('parent_student_links_id_seq', $1, true)`, [maxId]);
    }

    // Migrate QR codes
    console.log('📱 Migrating QR codes...');
    const qrCodes = sqlite.prepare('SELECT * FROM qr_codes').all();
    for (const qr of qrCodes) {
      await pgClient.query(`
        INSERT INTO qr_codes (id, code, gate_name, is_active, expires_at, created_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO NOTHING
      `, [
        qr.id,
        qr.code,
        qr.gate_name,
        qr.is_active === 1,
        qr.expires_at,
        qr.created_at
      ]);
    }
    console.log(`   ✅ Migrated ${qrCodes.length} QR codes`);

    // Update sequence for qr_codes
    if (qrCodes.length > 0) {
      const maxId = Math.max(...qrCodes.map(q => q.id));
      await pgClient.query(`SELECT setval('qr_codes_id_seq', $1, true)`, [maxId]);
    }

    // Migrate attendance logs
    console.log('📝 Migrating attendance logs...');
    const logs = sqlite.prepare('SELECT * FROM attendance_logs').all();
    for (const log of logs) {
      await pgClient.query(`
        INSERT INTO attendance_logs (id, student_id, qr_code_id, latitude, longitude, location_valid, entry_time, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO NOTHING
      `, [
        log.id,
        log.student_id,
        log.qr_code_id,
        log.latitude,
        log.longitude,
        log.location_valid === 1,
        log.entry_time,
        log.created_at
      ]);
    }
    console.log(`   ✅ Migrated ${logs.length} attendance logs`);

    // Update sequence for attendance_logs
    if (logs.length > 0) {
      const maxId = Math.max(...logs.map(l => l.id));
      await pgClient.query(`SELECT setval('attendance_logs_id_seq', $1, true)`, [maxId]);
    }

    // Migrate admins
    console.log('👤 Migrating admins...');
    const admins = sqlite.prepare('SELECT * FROM admins').all();
    for (const admin of admins) {
      await pgClient.query(`
        INSERT INTO admins (id, username, password_hash, email, created_at)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO NOTHING
      `, [
        admin.id,
        admin.username,
        admin.password_hash,
        admin.email,
        admin.created_at
      ]);
    }
    console.log(`   ✅ Migrated ${admins.length} admins`);

    // Update sequence for admins
    if (admins.length > 0) {
      const maxId = Math.max(...admins.map(a => a.id));
      await pgClient.query(`SELECT setval('admins_id_seq', $1, true)`, [maxId]);
    }

    // Migrate push tokens if table exists
    try {
      console.log('🔔 Migrating push tokens...');
      const pushTokens = sqlite.prepare('SELECT * FROM push_tokens').all();
      for (const token of pushTokens) {
        await pgClient.query(`
          INSERT INTO push_tokens (id, parent_id, device_token, platform, is_active, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (id) DO NOTHING
        `, [
          token.id,
          token.parent_id,
          token.device_token,
          token.platform,
          token.is_active === 1,
          token.created_at,
          token.updated_at
        ]);
      }
      console.log(`   ✅ Migrated ${pushTokens.length} push tokens`);

      // Update sequence for push_tokens
      if (pushTokens.length > 0) {
        const maxId = Math.max(...pushTokens.map(t => t.id));
        await pgClient.query(`SELECT setval('push_tokens_id_seq', $1, true)`, [maxId]);
      }
    } catch (error) {
      console.log('   ⚠️  Push tokens table not found in SQLite, skipping...');
    }

    // Migrate school config
    console.log('🏫 Migrating school config...');
    const schoolConfig = sqlite.prepare('SELECT * FROM school_config WHERE id = 1').get();
    if (schoolConfig) {
      await pgClient.query(`
        INSERT INTO school_config (id, school_name, latitude, longitude, radius_meters, timezone, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO UPDATE SET
          school_name = EXCLUDED.school_name,
          latitude = EXCLUDED.latitude,
          longitude = EXCLUDED.longitude,
          radius_meters = EXCLUDED.radius_meters,
          timezone = EXCLUDED.timezone,
          updated_at = EXCLUDED.updated_at
      `, [
        schoolConfig.id,
        schoolConfig.school_name,
        schoolConfig.latitude,
        schoolConfig.longitude,
        schoolConfig.radius_meters,
        schoolConfig.timezone || 'UTC',
        schoolConfig.updated_at
      ]);
      console.log('   ✅ Migrated school config');
    }

    await pgClient.query('COMMIT');
    console.log('\n✅ Migration completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Students: ${students.length}`);
    console.log(`   Parents: ${parents.length}`);
    console.log(`   Parent-Student Links: ${links.length}`);
    console.log(`   QR Codes: ${qrCodes.length}`);
    console.log(`   Attendance Logs: ${logs.length}`);
    console.log(`   Admins: ${admins.length}`);

  } catch (error) {
    await pgClient.query('ROLLBACK');
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    sqlite.close();
    pgClient.release();
    await pgPool.end();
  }
}

// Run migration
migrateSQLiteToPostgres()
  .then(() => {
    console.log('\n🎉 All done! You can now start your application with PostgreSQL.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration error:', error);
    process.exit(1);
  });
