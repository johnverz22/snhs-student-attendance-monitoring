#!/usr/bin/env node

/**
 * Database Status Script
 * 
 * This script displays the current database status and statistics
 * Usage: node src/scripts/dbStatus.js
 */

const dbManager = require('../models/database');
const config = require('../config');
const fs = require('fs');

console.log('=== Database Status ===\n');

try {
  // Check if database file exists
  const dbExists = fs.existsSync(config.database.path);
  console.log(`Database file: ${config.database.path}`);
  console.log(`Exists: ${dbExists ? '✓' : '✗'}`);
  
  if (!dbExists) {
    console.log('\nDatabase not initialized. Run: npm run db:init');
    process.exit(0);
  }
  
  // Get file size
  const stats = fs.statSync(config.database.path);
  const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`Size: ${fileSizeInMB} MB`);
  
  // Initialize connection
  dbManager.initialize();
  const db = dbManager.getConnection();
  
  // Get schema version
  const version = dbManager.getCurrentVersion();
  console.log(`\nSchema version: ${version}`);
  
  // Get table counts
  console.log('\nTable Statistics:');
  const tables = ['students', 'parents', 'parent_student_links', 'attendance_logs', 
                  'qr_codes', 'school_config', 'push_tokens', 'admins'];
  
  tables.forEach(table => {
    const count = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get();
    console.log(`  ${table.padEnd(25)} ${count.count} rows`);
  });
  
  // Get school config
  const schoolConfig = db.prepare('SELECT * FROM school_config WHERE id = 1').get();
  if (schoolConfig) {
    console.log('\nSchool Configuration:');
    console.log(`  Name: ${schoolConfig.school_name}`);
    console.log(`  Location: ${schoolConfig.latitude}, ${schoolConfig.longitude}`);
    console.log(`  Radius: ${schoolConfig.radius_meters}m`);
  }
  
  console.log('\n✓ Database is operational');
  
  dbManager.close();
  process.exit(0);
} catch (error) {
  console.error('\n✗ Error:', error.message);
  process.exit(1);
}
