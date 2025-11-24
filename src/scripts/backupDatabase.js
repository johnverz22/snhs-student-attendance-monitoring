#!/usr/bin/env node

/**
 * Database Backup Script
 * 
 * This script creates a backup of the database
 * Usage: node src/scripts/backupDatabase.js
 */

const dbManager = require('../models/database');
const config = require('../config');
const path = require('path');
const fs = require('fs');

console.log('=== Database Backup Script ===\n');

try {
  // Initialize database connection
  dbManager.initialize();
  
  // Create backup directory if it doesn't exist
  const backupDir = config.database.backupPath;
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  // Generate backup filename with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFilename = `attendance_backup_${timestamp}.db`;
  const backupPath = path.join(backupDir, backupFilename);
  
  console.log(`Creating backup: ${backupPath}`);
  
  // Perform backup
  dbManager.backup(backupPath);
  
  // Get backup file size
  const stats = fs.statSync(backupPath);
  const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
  
  console.log(`\n✓ Backup completed successfully`);
  console.log(`  File: ${backupFilename}`);
  console.log(`  Size: ${fileSizeInMB} MB`);
  
  // Close connection
  dbManager.close();
  process.exit(0);
} catch (error) {
  console.error('\n✗ Backup failed:', error.message);
  process.exit(1);
}
