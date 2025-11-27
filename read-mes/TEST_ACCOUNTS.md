# 🔑 Test Accounts - PostgreSQL Database

## Current Accounts in Database

### ✅ Admin Account
- **Username**: `admin`
- **Email**: `admin@school.com`
- **Password**: `Admin123`
- **Login URL**: http://localhost:3000/admin/login.html
- **API Endpoint**: `POST /api/auth/admin/login`

**Login Payload:**
```json
{
  "username": "admin",
  "password": "Admin123"
}
```

### ✅ Student Account
- **Email**: `test@student.com`
- **Password**: `Password123`
- **Student ID**: `TEST001`
- **Name**: Test Student
- **Grade**: 10
- **Section**: A
- **API Endpoint**: `POST /api/auth/student/login`

**Login Payload:**
```json
{
  "email": "test@student.com",
  "password": "Password123"
}
```

### ✅ Parent Account
- **Email**: `parent@test.com`
- **Password**: `Password123`
- **Name**: Test Parent
- **Phone**: 1234567890
- **Linked Students**: TEST001 (Test Student)
- **API Endpoint**: `POST /api/auth/parent/login`

**Login Payload:**
```json
{
  "email": "parent@test.com",
  "password": "Password123"
}
```

## Creating Additional Accounts

### Create Another Admin
```bash
# Using script
npm run create-admin

# Or with custom credentials
node create-admin.js myusername admin@example.com MyPassword123
```

### Create Another Student
```bash
curl -X POST http://localhost:3000/api/auth/student/register \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": "STU002",
    "name": "Another Student",
    "email": "student2@test.com",
    "password": "Password123",
    "grade": "11",
    "section": "B"
  }'
```

## Verify Accounts in Database

```bash
# Check all admins
docker exec school_attendance_db psql -U school_admin school_attendance \
  -c "SELECT id, username, email FROM admins;"

# Check all students
docker exec school_attendance_db psql -U school_admin school_attendance \
  -c "SELECT id, student_id, name, email, grade, section FROM students;"

# Check all parents
docker exec school_attendance_db psql -U school_admin school_attendance \
  -c "SELECT id, name, email, phone FROM parents;"

# Check parent-student links
docker exec school_attendance_db psql -U school_admin school_attendance \
  -c "SELECT p.name as parent, s.name as student, psl.relationship FROM parent_student_links psl JOIN parents p ON psl.parent_id = p.id JOIN students s ON psl.student_id = s.id;"
```

## Password Requirements

All passwords must:
- Be at least 8 characters long
- Contain at least one uppercase letter
- Contain at least one lowercase letter
- Contain at least one number

**Valid Examples:**
- `Password123`
- `Admin123`
- `MyPass123`

**Invalid Examples:**
- `password` (no uppercase, no number)
- `PASSWORD123` (no lowercase)
- `Password` (no number)
- `Pass1` (too short)

## Test Login Scripts

### Test Student Login
```bash
./test-login.sh
```

### Test Admin Login
```bash
curl -X POST http://localhost:3000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "Admin123"
  }'
```

## Mobile App Configuration

### Student App
```dart
// In student_app/lib/config/api_config.dart
static const String baseUrl = 'http://192.168.100.83:3000/api';

// Test login with:
// Email: test@student.com
// Password: Password123
```

### Parent App
```dart
// In parent_app/lib/config/api_config.dart
static const String baseUrl = 'http://192.168.100.83:3000/api';

// Create parent account first via API
```

## School Configuration

Current school settings in database:
- **Name**: Sto. Rosario National High School
- **Latitude**: 14.5995
- **Longitude**: 120.9842
- **Radius**: 100 meters
- **Timezone**: Asia/Manila

## Quick Reference

| Account Type | Username/Email | Password | Status |
|-------------|----------------|----------|--------|
| Admin | admin | Admin123 | ✅ Created |
| Student | test@student.com | Password123 | ✅ Created |
| Parent | parent@test.com | Password123 | ✅ Created |

## Security Notes

⚠️ **IMPORTANT**: These are test accounts for development only!

For production:
1. Change all default passwords
2. Use strong, unique passwords
3. Enable SSL/TLS
4. Set up proper authentication
5. Implement rate limiting
6. Add 2FA for admin accounts

## Troubleshooting

### Can't login?
```bash
# Check if account exists
docker exec school_attendance_db psql -U school_admin school_attendance \
  -c "SELECT * FROM admins WHERE username = 'admin';"

# Check server logs
docker-compose logs -f

# Verify password is correct (case-sensitive!)
```

### Need to reset password?
```bash
# Connect to database
docker exec -it school_attendance_db psql -U school_admin school_attendance

# Update password (you'll need to hash it first)
# Better to delete and recreate the account
DELETE FROM admins WHERE username = 'admin';
\q

# Then recreate
npm run create-admin
```

---

**Last Updated**: After PostgreSQL migration  
**Database**: PostgreSQL 15.14  
**Total Accounts**: 1 admin, 1 student, 0 parents
