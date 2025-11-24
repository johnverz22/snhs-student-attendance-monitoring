#!/usr/bin/env node

/**
 * Database Migration Script
 * 
 * This script runs pending database migrations
 * Usage: node src/scripts/migrate.js
 */

const dbManager = require('../models/database');

console.log('=== Database Migration Script ===\n');

try {
  // Initialize database (this will run migrations)
  dbManager.initialize();
  
  const currentVersion = dbManager.getCurrentVersion();
  console.log(`\nDatabase is now at version: ${currentVersion}`);
  
  console.log('\n✓ Migration completed successfully');
  
  // Close connection
  dbManager.close();
  process.exit(0);
} catch (error) {
  console.error('\n✗ Migration failed:', error.message);
  process.exit(1);
}
