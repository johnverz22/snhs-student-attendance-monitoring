# PostgreSQL Migration - Remaining Tasks

## ✅ Completed
- [x] Updated `package.json` dependencies (removed SQLite, added pg)
- [x] Updated `.env` and `.env.example` with PostgreSQL config
- [x] Updated `src/config/index.js` for PostgreSQL
- [x] Rewrote `src/models/database.js` for PostgreSQL with connection pooling
- [x] Created `src/utils/dbHelpers.js` for query helpers
- [x] Updated `src/services/attendanceService.js` to use PostgreSQL
- [x] Updated `src/index.js` for async database initialization
- [x] Created migration script `src/scripts/migrateSQLiteToPostgres.js`
- [x] Started PostgreSQL Docker container
- [x] Verified database connection and schema creation

## 🔄 Files That Need Updating

The following files still use SQLite syntax and need to be updated to use PostgreSQL:

### High Priority (Core Services)
1. **src/services/notificationService.js**
   - Uses `db.prepare().get()` and `.run()` and `.all()`
   - Update to use `queryOne()`, `queryAll()`, `execute()` from dbHelpers
   - Change `?` placeholders to `$1`, `$2`, etc.

2. **src/services/reportService.js**
   - Likely uses SQLite query patterns
   - Update to async/await with PostgreSQL

3. **src/services/locationService.js**
   - Check if it uses database queries
   - Update if needed

### Medium Priority (Routes)
4. **src/routes/admin.js**
   - May have direct database queries
   - Update to async/await patterns

5. **src/routes/student.js**
   - Update any direct database access

6. **src/routes/parent.js**
   - Update any direct database access

7. **src/routes/auth.js**
   - Update authentication queries

### Low Priority (Scripts)
8. **src/scripts/initDatabase.js**
   - Update to use PostgreSQL
   - Or remove if no longer needed (schema auto-creates)

9. **src/scripts/testParentNotifications.js**
   - Update SQLite queries to PostgreSQL

10. **src/scripts/verifyPushySetup.js**
    - Update SQLite queries to PostgreSQL

11. **src/scripts/diagnoseFCMIssue.js**
    - Update SQLite queries to PostgreSQL

12. **src/scripts/diagnosePushyIssue.js**
    - Update SQLite queries to PostgreSQL

## 📝 Update Pattern

For each file, follow this pattern:

### 1. Add imports
```javascript
const { queryOne, queryAll, execute, transaction } = require('../utils/dbHelpers');
```

### 2. Remove SQLite imports
```javascript
// Remove this:
const Database = require('better-sqlite3');
```

### 3. Update query patterns

**Before (SQLite):**
```javascript
const db = dbManager.getConnection();
const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
```

**After (PostgreSQL):**
```javascript
const user = await queryOne('SELECT * FROM users WHERE id = $1', [userId]);
```

**Before (SQLite):**
```javascript
const users = db.prepare('SELECT * FROM users WHERE active = ?').all(1);
```

**After (PostgreSQL):**
```javascript
const users = await queryAll('SELECT * FROM users WHERE active = $1', [true]);
```

**Before (SQLite):**
```javascript
const result = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)').run(name, email);
const userId = result.lastInsertRowid;
```

**After (PostgreSQL):**
```javascript
const result = await execute(
  'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id',
  [name, email]
);
const userId = result.rows[0].id;
```

### 4. Update boolean handling
- SQLite: `is_active = 1` or `is_active = 0`
- PostgreSQL: `is_active = TRUE` or `is_active = FALSE`

### 5. Make functions async
```javascript
// Before
function getUser(id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

// After
async function getUser(id) {
  return await queryOne('SELECT * FROM users WHERE id = $1', [id]);
}
```

## 🧪 Testing Checklist

After updating each file:
- [ ] Check for syntax errors
- [ ] Verify all `?` placeholders changed to `$1`, `$2`, etc.
- [ ] Ensure all database functions are `async`
- [ ] Verify all database calls use `await`
- [ ] Test the functionality works
- [ ] Check for proper error handling

## 🚀 Quick Commands

```bash
# Start PostgreSQL
docker-compose up -d postgres

# Check PostgreSQL status
docker exec school_attendance_db pg_isready -U school_admin -d school_attendance

# View logs
docker-compose logs -f postgres

# Start application
npm start

# Run migration (if you have SQLite data)
npm run db:migrate:sqlite

# Connect to database
docker exec -it school_attendance_db psql -U school_admin school_attendance
```

## 📚 Resources

- [node-postgres documentation](https://node-postgres.com/)
- [PostgreSQL documentation](https://www.postgresql.org/docs/)
- [SQLite to PostgreSQL migration guide](https://wiki.postgresql.org/wiki/Converting_from_other_Databases_to_PostgreSQL#SQLite)

## ⚠️ Important Notes

1. **Async/Await**: All database operations are now asynchronous
2. **Parameter Placeholders**: Use `$1`, `$2` instead of `?`
3. **Boolean Values**: Use `TRUE`/`FALSE` instead of `1`/`0`
4. **RETURNING Clause**: Use `RETURNING *` to get inserted/updated data
5. **Transactions**: Use the `transaction()` helper for multi-query operations
6. **Connection Pooling**: Already configured, no need to manage connections manually
