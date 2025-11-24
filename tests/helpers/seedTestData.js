const db = require('../../src/models/database');
const authService = require('../../src/services/authService');

/**
 * Seed test data for integration tests
 */
async function seedTestData() {
  const connection = db.getConnection();

  // Seed admin user
  const adminPasswordHash = await authService.hashPassword('Admin123!');
  connection.prepare(`
    INSERT OR IGNORE INTO admins (username, email, password_hash)
    VALUES (?, ?, ?)
  `).run('admin', 'admin@school.com', adminPasswordHash);

  // Seed test student
  const studentPasswordHash = await authService.hashPassword('Password123');
  const studentResult = connection.prepare(`
    INSERT OR IGNORE INTO students (student_id, name, email, password_hash, grade, phone)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run('STU001', 'John Doe', 'john.doe@school.com', studentPasswordHash, '10', '1234567890');

  // Seed test parent
  const parentPasswordHash = await authService.hashPassword('Password123');
  const parentResult = connection.prepare(`
    INSERT OR IGNORE INTO parents (name, email, password_hash, phone)
    VALUES (?, ?, ?, ?)
  `).run('Jane Doe', 'jane.doe@example.com', parentPasswordHash, '9876543210');

  // Link parent to student
  const student = connection.prepare('SELECT id FROM students WHERE email = ?').get('john.doe@school.com');
  const parent = connection.prepare('SELECT id FROM parents WHERE email = ?').get('jane.doe@example.com');
  
  if (student && parent) {
    connection.prepare(`
      INSERT OR IGNORE INTO parent_student_links (parent_id, student_id, relationship)
      VALUES (?, ?, ?)
    `).run(parent.id, student.id, 'parent');
  }

  // Seed QR codes
  connection.prepare(`
    INSERT OR IGNORE INTO qr_codes (code, gate_name, is_active)
    VALUES (?, ?, ?)
  `).run('GATE_A_2024', 'Main Gate A', 1);

  connection.prepare(`
    INSERT OR IGNORE INTO qr_codes (code, gate_name, is_active)
    VALUES (?, ?, ?)
  `).run('GATE_B_2024', 'Side Gate B', 1);

  // Seed school config
  connection.prepare(`
    INSERT OR REPLACE INTO school_config (id, school_name, latitude, longitude, radius_meters, timezone)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(1, 'Test School', 40.7128, -74.0060, 100, 'UTC');
}

/**
 * Clear test data
 */
function clearTestData() {
  const connection = db.getConnection();
  
  connection.prepare('DELETE FROM attendance_logs').run();
  connection.prepare('DELETE FROM parent_student_links').run();
  connection.prepare('DELETE FROM push_tokens').run();
  connection.prepare('DELETE FROM students').run();
  connection.prepare('DELETE FROM parents').run();
  connection.prepare('DELETE FROM admins').run();
  connection.prepare('DELETE FROM qr_codes').run();
}

module.exports = {
  seedTestData,
  clearTestData
};
