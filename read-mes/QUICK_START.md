# 🚀 Quick Start Guide - PostgreSQL Setup

## Prerequisites
- Docker installed and running
- Node.js installed

## 1. Start PostgreSQL

```bash
docker-compose up -d postgres
```

Wait a few seconds for PostgreSQL to initialize.

## 2. Verify Database

```bash
./check-postgres.sh
```

You should see:
```
✅ PostgreSQL container is running
✅ PostgreSQL is accepting connections
```

## 3. Start the Server

```bash
npm start
```

You should see:
```
Database connection established
Database initialized successfully
Server started on 0.0.0.0:3000
```

## 4. Test Login

```bash
./test-login.sh
```

You should see:
```
✅ Registration successful!
✅ Login successful!
✅ Profile fetch successful!
```

## 5. Connect Your Mobile Apps

Update your mobile app configuration:

**For Physical Devices:**
```dart
// In api_config.dart
static const String baseUrl = 'http://192.168.100.83:3000/api';
```

**For Android Emulator:**
```dart
static const String baseUrl = 'http://10.0.2.2:3000/api';
```

**For iOS Simulator:**
```dart
static const String baseUrl = 'http://localhost:3000/api';
```

## Test Credentials

**Student Account:**
- Email: `test@student.com`
- Password: `Password123`

## Common Commands

```bash
# Check status
./check-postgres.sh

# View logs
docker-compose logs -f postgres

# Stop everything
docker-compose down

# Reset database (delete all data)
docker-compose down -v
docker-compose up -d postgres

# Connect to database
docker exec -it school_attendance_db psql -U school_admin school_attendance

# Backup database
docker exec school_attendance_db pg_dump -U school_admin school_attendance > backup.sql

# Restore database
docker exec -i school_attendance_db psql -U school_admin school_attendance < backup.sql
```

## Troubleshooting

### PostgreSQL won't start
```bash
docker-compose logs postgres
docker-compose restart postgres
```

### Server won't start
```bash
# Check if port 3000 is in use
lsof -ti:3000 | xargs kill -9

# Check .env file has correct credentials
cat .env | grep DB_
```

### Can't connect from mobile app
1. Make sure your computer and phone are on the same WiFi
2. Check firewall isn't blocking port 3000
3. Use the correct IP address (run `npm run network` to see options)
4. Try `http://` not `https://`

### Login fails
```bash
# Check database has data
docker exec school_attendance_db psql -U school_admin school_attendance -c "SELECT COUNT(*) FROM students;"

# Check server logs
docker-compose logs -f
```

## File Structure

```
.
├── docker-compose.yml          # PostgreSQL container config
├── .env                        # Database credentials
├── init-db.sql                 # Database schema
├── src/
│   ├── models/database.js      # PostgreSQL connection
│   ├── utils/dbHelpers.js      # Query helpers
│   ├── routes/                 # API endpoints
│   └── services/               # Business logic
├── check-postgres.sh           # Status check script
└── test-login.sh              # Login test script
```

## Documentation

- **POSTGRESQL_MIGRATION.md** - Complete migration guide
- **MIGRATION_TODO.md** - Remaining tasks
- **LOGIN_FIXED.md** - Login fix details
- **MIGRATION_COMPLETE.md** - Migration summary

## Support

If you encounter issues:
1. Run `./check-postgres.sh` to verify PostgreSQL
2. Check server logs for errors
3. Verify `.env` configuration matches `docker-compose.yml`
4. Ensure Docker is running

---

**Quick Test**: Run `./test-login.sh` - if you see all ✅, everything is working!
