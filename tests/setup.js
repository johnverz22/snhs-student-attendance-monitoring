const db = require('../src/models/database');
const path = require('path');
const fs = require('fs');
const { seedTestData, clearTestData } = require('./helpers/seedTestData');

// Use a test database
process.env.NODE_ENV = 'test';
process.env.DB_PATH = path.join(__dirname, '../data/test.db');

// Setup before all tests
beforeAll(async () => {
  // Ensure test database directory exists
  const dbDir = path.dirname(process.env.DB_PATH);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  
  // Initialize test database
  db.initialize();
  
  // Seed test data
  await seedTestData();
});

// Cleanup after each test
afterEach(async () => {
  // Clear attendance logs between tests
  const connection = db.getConnection();
  connection.prepare('DELETE FROM attendance_logs').run();
  connection.prepare('DELETE FROM push_tokens').run();
  
  // Re-seed test data to ensure consistency
  await seedTestData();
});

// Cleanup after all tests
afterAll(() => {
  // Close database connection
  db.close();
  
  // Remove test database
  if (fs.existsSync(process.env.DB_PATH)) {
    fs.unlinkSync(process.env.DB_PATH);
  }
});
