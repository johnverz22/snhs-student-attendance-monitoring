const dbManager = require('../models/database');
const authService = require('../services/authService');

/**
 * Seed admin user for testing
 */
async function seedAdmin() {
  console.log('=== Seeding Admin User ===\n');

  try {
    // Initialize database
    dbManager.initialize();
    const db = dbManager.getConnection();

    // Check if admin already exists
    const existingAdmin = db.prepare('SELECT id FROM admins WHERE username = ?').get('admin');

    if (existingAdmin) {
      console.log('Admin user already exists');
      console.log('Username: admin');
      console.log('Password: Admin123!');
      return;
    }

    // Hash password
    const passwordHash = await authService.hashPassword('Admin123!');

    // Insert admin
    const result = db.prepare(`
      INSERT INTO admins (username, email, password_hash)
      VALUES (?, ?, ?)
    `).run('admin', 'admin@school.com', passwordHash);

    console.log('Admin user created successfully!');
    console.log('ID:', result.lastInsertRowid);
    console.log('Username: admin');
    console.log('Email: admin@school.com');
    console.log('Password: Admin123!');
    console.log('\nYou can now use these credentials to test admin endpoints.');
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  } finally {
    dbManager.close();
  }
}

seedAdmin();
