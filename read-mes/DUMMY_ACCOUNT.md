## Admin Login (PostgreSQL)
- **Username**: admin
- **Password**: Admin123
- **Email**: admin@school.com
- **Access**: Admin web interface at http://localhost:3000/admin/login.html
- **API Endpoint**: POST http://localhost:3000/api/auth/admin/login
## Student Login (PostgreSQL)
- **Email**: test@student.com
- **Password**: Password123
- **Student ID**: TEST001
- **Name**: Test Student
- **Grade**: 10
- **Section**: A
- **Access**: Student mobile app API endpoints
- **API Endpoint**: POST http://localhost:3000/api/auth/student/login
## Parent Login (PostgreSQL)
- **Email**: (No parent account created yet)
- **Password**: (Use Password123 format when creating)
- **Access**: Parent mobile app API endpoints
- **API Endpoint**: POST http://localhost:3000/api/auth/parent/login
- **Create Account**: POST http://localhost:3000/api/auth/parent/register
## Test QR Codes
- **GATE_A_2024** - Main Gate A
- **GATE_B_2024** - Side Gate B
- (Create QR codes via admin interface)

## School Location (for GPS testing)
- **Name**: Sto. Rosario National High School
- **Latitude**: 14.5995
- **Longitude**: 120.9842
- **Radius**: 100 meters
- **Timezone**: Asia/Manila

## Quick Commands

### Create Admin Account
```bash
node create-admin.js [username] [email] [password]
# Default: node create-admin.js admin admin@school.com Admin123
```

### Test Login
```bash
./test-login.sh
```

### Check Database
```bash
docker exec school_attendance_db psql -U school_admin school_attendance -c "SELECT * FROM admins;"
docker exec school_attendance_db psql -U school_admin school_attendance -c "SELECT * FROM students;"
docker exec school_attendance_db psql -U school_admin school_attendance -c "SELECT * FROM parents;"
```

## Database Access
```bash
# Connect to PostgreSQL
docker exec -it school_attendance_db psql -U school_admin school_attendance

# Inside psql:
\dt                    # List tables
\d students           # Describe students table
SELECT * FROM admins; # View all admins
\q                    # Exit
```