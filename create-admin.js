/**
 * Create an admin account
 * Usage: node create-admin.js [username] [email] [password]
 */

require('dotenv').config();
const dbManager = require('./src/models/database');
const authService = require('./src/services/authService');
const { execute } = require('./src/utils/dbHelpers');

async function createAdmin() {
  // Get credentials from command line or use defaults
  const username = process.argv[2] || 'admin';
  const email = process.argv[3] || 'admin@school.com';
  const password = process.argv[4] || 'Admin123';

  console.log('🔐 Creating admin account...\n');

  try {
    // Initialize database
    await dbManager.initialize();

    // Check if admin already exists
    const existing = await dbManager.queryOne(
      'SELECT id, username FROM admins WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existing) {
      console.log('❌ Admin account already exists:');
      console.log(`   Username: ${existing.username}`);
      console.log('\n💡 To create a different admin, use:');
      console.log('   node create-admin.js <username> <email> <password>');
      process.exit(1);
    }

    // Hash password
    const passwordHash = await authService.hashPassword(password);

    // Create admin
    const result = await execute(
      `INSERT INTO admins (username, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, username, email, created_at`,
      [username, email, passwordHash]
    );

    const admin = result.rows[0];

    console.log('✅ Admin account created successfully!\n');
    console.log('📋 Account Details:');
    console.log(`   ID: ${admin.id}`);
    console.log(`   Username: ${admin.username}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Created: ${admin.created_at}`);
    console.log('\n🔑 Login Credentials:');
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password}`);
    console.log('\n🌐 Login URL:');
    console.log('   http://localhost:3000/admin');
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');

  } catch (error) {
    console.error('❌ Failed to create admin:', error.message);
    process.exit(1);
  } finally {
    await dbManager.close();
  }
}

createAdmin();
