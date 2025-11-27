# PostgreSQL Migration Guide

This project has been successfully migrated from SQLite to PostgreSQL.

## What Changed

### Database
- **Before**: SQLite (file-based database at `./data/attendance.db`)
- **After**: PostgreSQL (running in Docker container)

### Dependencies
- **Removed**: `better-sqlite3`, `sqlite3`
- **Added**: `pg` (node-postgres)

### Configuration
All database configuration is now in `.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=school_attendance
DB_USER=school_admin
DB_PASSWORD=school_password_123
DB_SSL=false
```

## Quick Start

### 1. Start PostgreSQL (Docker)
```bash
docker-compose up -d postgres
```

### 2. Verify Database is Running
```bash
docker exec school_attendance_db pg_isready -U school_admin -d school_attendance
```

### 3. Start the Application
```bash
npm start
```

The database schema will be automatically created on first run.

## Migrating Existing Data

If you have existing data in SQLite that you want to migrate to PostgreSQL:

### Option 1: Using the Migration Script
```bash
# Make sure PostgreSQL is running
docker-compose up -d postgres

# Run the migration script
npm run db:migrate:sqlite
```

This will:
- Read data from `./data/attendance.db`
- Transfer all tables to PostgreSQL
- Preserve all IDs and relationships
- Update sequences for auto-increment fields

### Option 2: Manual Migration
If you prefer to start fresh, just start the application and the schema will be created automatically.

## Database Management

### View Database Logs
```bash
docker-compose logs -f postgres
```

### Connect to PostgreSQL CLI
```bash
docker exec -it school_attendance_db psql -U school_admin -d school_attendance
```

### Useful PostgreSQL Commands
```sql
-- List all tables
\dt

-- Describe a table
\d students

-- Count records
SELECT COUNT(*) FROM students;

-- View recent attendance logs
SELECT * FROM attendance_logs ORDER BY entry_time DESC LIMIT 10;

-- Exit
\q
```

### Backup Database
```bash
# Backup to file
docker exec school_attendance_db pg_dump -U school_admin school_attendance > backup.sql

# Restore from file
docker exec -i school_attendance_db psql -U school_admin school_attendance < backup.sql
```

### Stop PostgreSQL
```bash
docker-compose down
```

### Reset Database (Delete All Data)
```bash
# Stop and remove containers and volumes
docker-compose down -v

# Start fresh
docker-compose up -d postgres
npm start
```

## Key Differences from SQLite

### 1. Async/Await
All database operations are now asynchronous:

**Before (SQLite):**
```javascript
const student = db.prepare('SELECT * FROM students WHERE id = ?').get(id);
```

**After (PostgreSQL):**
```javascript
const student = await queryOne('SELECT * FROM students WHERE id = $1', [id]);
```

### 2. Parameter Placeholders
- SQLite uses `?` for parameters
- PostgreSQL uses `$1`, `$2`, `$3`, etc.

### 3. Boolean Values
- SQLite stores booleans as 0/1
- PostgreSQL has native boolean type (TRUE/FALSE)

### 4. Auto-increment
- SQLite uses `AUTOINCREMENT`
- PostgreSQL uses `SERIAL` (automatically creates sequences)

### 5. RETURNING Clause
PostgreSQL supports `RETURNING` to get inserted data:
```sql
INSERT INTO students (...) VALUES (...) RETURNING id, name, email;
```

## Production Deployment

### Environment Variables for Production
Update your `.env` for production:

```env
DB_HOST=your-postgres-host.com
DB_PORT=5432
DB_NAME=school_attendance
DB_USER=your_db_user
DB_PASSWORD=your_secure_password
DB_SSL=true
```

### Using Managed PostgreSQL
For production, consider using managed PostgreSQL services:
- **Vercel Postgres**: Integrated with Vercel deployments
- **AWS RDS**: Managed PostgreSQL on AWS
- **Google Cloud SQL**: Managed PostgreSQL on GCP
- **DigitalOcean Managed Databases**: Simple and affordable
- **Supabase**: PostgreSQL with additional features

### Connection Pooling
The application uses connection pooling (max 20 connections) for optimal performance.

## Troubleshooting

### Connection Refused
```bash
# Check if PostgreSQL is running
docker ps | grep school_attendance_db

# Check logs
docker-compose logs postgres

# Restart container
docker-compose restart postgres
```

### Permission Denied
```bash
# Ensure correct credentials in .env
# Check docker-compose.yml matches .env values
```

### Schema Not Created
```bash
# Check init-db.sql was executed
docker-compose logs postgres | grep "init-db.sql"

# Manually run schema
docker exec -i school_attendance_db psql -U school_admin school_attendance < init-db.sql
```

### Port Already in Use
```bash
# Change port in docker-compose.yml and .env
# Or stop the conflicting service
lsof -ti:5432 | xargs kill -9
```

## Performance Tips

1. **Indexes**: Already created for frequently queried fields
2. **Connection Pooling**: Configured with 20 max connections
3. **Prepared Statements**: Automatically used by node-postgres
4. **Transactions**: Use for multiple related operations

## Support

For issues or questions:
1. Check PostgreSQL logs: `docker-compose logs postgres`
2. Check application logs
3. Verify `.env` configuration
4. Ensure Docker is running

## Next Steps

- [ ] Test all API endpoints
- [ ] Verify mobile app connectivity
- [ ] Run data migration if needed
- [ ] Update production environment variables
- [ ] Set up database backups
- [ ] Configure monitoring and alerts
