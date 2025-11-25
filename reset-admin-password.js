/**
 * Reset admin password
 * Usage: node reset-admin-password.js <username> <new-password>
 */

require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

async function resetPassword() {
  const username = process.argv[2];
  const newPassword = process.argv[3];

  if (!username || !newPassword) {
    console.log('❌ Usage: node reset-admin-password.js <username> <new-password>');
    console.log('\nExample:');
    console.log('   node reset-admin-password.js admin NewSecurePass123');
    process.exit(1);
  }

  console.log('🔐 Resetting admin password...\n');

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
    console.log('📡 Connecting to database...');
    const client = await pool.connect();
    console.log('✅ Connected\n');

    // Check if admin exists
    const existing = await client.query(
      'SELECT id, username, email FROM admins WHERE username = $1',
      [username]
    );

    if (existing.rows.length === 0) {
      console.log(`❌ Admin user "${username}" not found`);
      console.log('\n💡 Available admins:');
      const allAdmins = await client.query('SELECT username, email FROM admins');
      allAdmins.rows.forEach(admin => {
        console.log(`   - ${admin.username} (${admin.email})`);
      });
      client.release();
      await pool.end();
      process.exit(1);
    }

    const admin = existing.rows[0];

    // Hash new password
    console.log('🔒 Hashing new password...');
    const bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
    const passwordHash = await bcrypt.hash(newPassword, bcryptRounds);

    // Update password
    console.log('💾 Updating password...');
    await client.query(
      'UPDATE admins SET password_hash = $1 WHERE id = $2',
      [passwordHash, admin.id]
    );

    console.log('\n✅ Password reset successfully!\n');
    console.log('═'.repeat(60));
    console.log('📋 Account Details:');
    console.log('═'.repeat(60));
    console.log(`   Username: ${admin.username}`);
    console.log(`   Email:    ${admin.email}`);
    console.log('\n' + '═'.repeat(60));
    console.log('🔑 New Login Credentials:');
    console.log('═'.repeat(60));
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${newPassword}`);
    console.log('\n' + '═'.repeat(60));
    console.log('🌐 Login URL:');
    console.log('═'.repeat(60));
    console.log('   https://snhs-student-attendance-monitoring-glw2kktxl.vercel.app/admin');
    console.log('\n⚠️  Keep this password secure!\n');

    client.release();
    await pool.end();

  } catch (error) {
    console.error('\n❌ Failed to reset password:', error.message);
    await pool.end();
    process.exit(1);
  }
}

resetPassword();
