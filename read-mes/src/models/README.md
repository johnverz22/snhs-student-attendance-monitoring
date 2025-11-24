# Database Module

## Overview

This module manages the SQLite database for the School Attendance System using better-sqlite3.

## Features

- Automatic schema initialization
- Migration system for schema updates
- Database connection management with error handling
- Indexed tables for optimal query performance
- Backup functionality
- Transaction support

## Usage

### Initialize Database

```javascript
const dbManager = require('./models/database');
dbManager.initialize();
const db = dbManager.getConnection();
```

### Execute Queries

```javascript
// Get all records
const students = dbManager.executeQuery('SELECT * FROM students WHERE grade = ?', ['10']);

// Get single record
const student = dbManager.executeQuerySingle('SELECT * FROM students WHERE id = ?', [1]);

// Insert/Update/Delete
const result = dbManager.executeUpdate('INSERT INTO students (name, email) VALUES (?, ?)', ['John', 'john@example.com']);
```

### Transactions

```javascript
const transaction = dbManager.beginTransaction(() => {
  dbManager.executeUpdate('INSERT INTO students ...');
  dbManager.executeUpdate('INSERT INTO attendance_logs ...');
});
transaction();
```

## Scripts

- `npm run db:init` - Initialize database schema
- `npm run db:migrate` - Run pending migrations
- `npm run db:backup` - Create database backup

## Schema Version

Current version: 1

## Tables

- students
- parents
- parent_student_links
- attendance_logs
- qr_codes
- school_config
- push_tokens
- admins
- schema_version (migration tracking)
