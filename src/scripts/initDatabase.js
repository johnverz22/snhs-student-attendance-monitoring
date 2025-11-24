#!/usr/bin/env node

/**
 * Database Initialization Script
 * 
 * This script initializes the database schema and can be run independently
 * Usage: node src/scripts/initDatabase.js
 */

const dbManager = require('../models/database');

console.log('=== Database Initialization Script ===\n');

try {
  // Initialize database
  dbManager.initialize();
  
  // Display current schema version
  const version = dbManager.getCurrentVersion();
  console.log(`\nCurrent schema version: ${version}`);
  
  // Display table information
  const db = dbManager.getConnection();
  const tables = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' 
    AND name NOT LIKE 'sqlite_%'
    ORDER BY name
  `).all();
  
  console.log('\nCreated tables:');
  tables.forEach(table => {
    const count = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get();
    console.log(`  - ${table.name} (${count.count} rows)`);
  });
  
  console.log('\n✓ Database initialization completed successfully');
  
  // Close connection
  dbManager.close();
  process.exit(0);
} catch (error) {
  console.error('\n✗ Database initialization failed:', error.message);
  process.exit(1);
}
