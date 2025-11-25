/**
 * Create an admin account for Vercel deployment
 * This script connects directly to your Vercel Postgres database
 * 
 * Usage: node create-admin-vercel.js [username] [email] [password]
 * 
 * Make sure you have these environment variables set:
 * - POSTGRES_HOST (or DB_HOST)
 * - POSTGRES_DATABASE (or DB_NAME)
 * - POSTGRES_USER (or DB_USER)
 * - POSTGRES_PASSWORD (or DB_PASSWORD)
 */

require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

async function createAdmin() {
  // Get credentials from command line or use defaults
  const username = process.argv[2] || 'admin';
  const email = process.argv[3] || 'admin@school.com';
  const password = process.argv[4] || 'Admin123!';

  console.log('🔐 Creating admin account for Vercel deployment...\n');

  // Create database connection
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
    // Test connection
    console.log('📡 Connecting to database...');
    const client = await pool.connect();
    console.log('✅ Connected to database\n');

    // Check if admin already exists
    const existing = await client.query(
      'SELECT id, username, email FROM admins WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existing.rows.length > 0) {
      console.log('❌ Admin account already exists:');
      console.log(`   Username: ${existing.rows[0].username}`);
      console.log(`   Email: ${existing.rows[0].email}`);
      console.log('\n💡 To create a different admin, use:');
      console.log('   node create-admin-vercel.js <username> <email> <password>');
      client.release();
      await pool.end();
      process.exit(1);
    }

    // Hash password
    console.log('🔒 Hashing password...');
    const bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
    const passwordHash = await bcrypt.hash(password, bcryptRounds);

    // Create admin
    console.log('💾 Creating admin account...');
    const result = await client.query(
      `INSERT INTO admins (username, email, password_hash, created_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       RETURNING id, username, email, created_at`,
      [username, email, passwordHash]
    );

    const admin = result.rows[0];

    console.log('\n✅ Admin account created successfully!\n');
    console.log('═'.repeat(60));
    console.log('📋 Account Details:');
    console.log('═'.repeat(60));
    console.log(`   ID:       ${admin.id}`);
    console.log(`   Username: ${admin.username}`);
    console.log(`   Email:    ${admin.email}`);
    console.log(`   Created:  ${admin.created_at}`);
    console.log('\n' + '═'.repeat(60));
    console.log('🔑 Login Credentials:');
    console.log('═'.repeat(60));
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password}`);
    console.log('\n' + '═'.repeat(60));
    console.log('🌐 Login URLs:');
    console.log('═'.repeat(60));
    console.log('   Vercel:  https://snhs-student-attendance-monitoring-glw2kktxl.vercel.app/admin');
    console.log('   Local:   http://localhost:3000/admin');
    console.log('\n⚠️  IMPORTANT: Change the password after first login!\n');

    client.release();
    await pool.end();

  } catch (error) {
    console.error('\n❌ Failed to create admin:', error.message);
    console.error('\n🔍 Troubleshooting:');
    console.error('   1. Check your .env file has correct database credentials');
    console.error('   2. Ensure the database is accessible');
    console.error('   3. Verify the admins table exists');
    console.error('\n💡 Database connection details:');
    console.error(`   Host: ${process.env.POSTGRES_HOST || process.env.DB_HOST || 'not set'}`);
    console.error(`   Database: ${process.env.POSTGRES_DATABASE || process.env.DB_NAME || 'not set'}`);
    console.error(`   User: ${process.env.POSTGRES_USER || process.env.DB_USER || 'not set'}`);
    await pool.end();
    process.exit(1);
  }
}

createAdmin();
