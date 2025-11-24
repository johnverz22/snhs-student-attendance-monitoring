# School Attendance System

A comprehensive attendance logging system with QR code scanning, GPS verification, and real-time parent notifications.

## Features

- Student mobile app with QR code scanning
- GPS-based location verification
- Real-time push notifications to parents
- Admin web interface for reporting
- SQLite database for data storage

## Prerequisites

- Node.js v18 or higher
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Copy `.env.example` to `.env` and configure your environment variables:
```bash
cp .env.example .env
```

4. Initialize the database:
```bash
npm run db:init
```

5. Start the development server:
```bash
npm run dev
```

The server will display network information including LAN IP addresses for mobile device testing.

## Mobile App Testing

### LAN Access for Physical Devices

The server is configured to be accessible via LAN. When you start the server, it will display:

```
📡 LAN Access (for mobile devices):
   1. http://192.168.1.100:3000

📱 Mobile App Config:
   Physical Device: http://192.168.1.100:3000/api
```

**Quick Setup:**
1. Start server: `npm start`
2. Note your LAN IP address
3. Update `student_app/lib/config/api_config.dart` with your IP
4. Ensure mobile device is on same WiFi network

**View network info anytime:**
```bash
npm run network
```

**Test LAN connectivity:**
```bash
npm run test-lan
```

**⚠️ macOS Users:** You cannot test the LAN IP from the same Mac due to a routing quirk. Test from your phone instead! See `LAN_ACCESS_SOLUTION.md` for details.

**⚠️ Physical Phone Users:** Use your LAN IP (`192.168.100.83`), NOT `10.0.2.2`! The `10.0.2.2` address only works in Android emulators. See `DEVICE_TYPE_IP_GUIDE.md` and `IP_ADDRESS_VISUAL_GUIDE.md`.

**Full documentation:** See `LAN_SETUP_GUIDE.md`, `LAN_ACCESS_SUMMARY.md`, `MACOS_LAN_ROUTING_ISSUE.md`, and `DEVICE_TYPE_IP_GUIDE.md`

## Project Structure

```
├── src/
│   ├── config/         # Configuration files
│   ├── routes/         # API route handlers
│   ├── services/       # Business logic services
│   ├── middleware/     # Express middleware
│   ├── models/         # Data models
│   └── index.js        # Application entry point
├── data/               # SQLite database files
├── .env                # Environment variables
└── package.json        # Project dependencies
```

## API Endpoints

### Authentication
- `POST /api/auth/student/register` - Student registration
- `POST /api/auth/student/login` - Student login
- `POST /api/auth/parent/register` - Parent registration
- `POST /api/auth/parent/login` - Parent login
- `POST /api/auth/admin/login` - Admin login

### Student
- `GET /api/student/profile` - Get student profile
- `PUT /api/student/profile` - Update student profile
- `POST /api/student/attendance/scan` - Log attendance
- `GET /api/student/attendance/history` - Get attendance history

### Parent
- `GET /api/parent/students` - Get linked students
- `GET /api/parent/student/:studentId/attendance` - Get student attendance

### Admin
- `GET /api/admin/reports/daily` - Daily attendance report
- `GET /api/admin/reports/weekly` - Weekly attendance report
- `GET /api/admin/reports/monthly` - Monthly attendance report
- `GET /api/admin/students/search` - Search students
- `GET /api/admin/attendance/logs` - View attendance logs

## Authentication

The system uses JWT (JSON Web Tokens) for authentication with role-based access control.

### Roles
- `student` - Students who scan QR codes
- `parent` - Parents who receive notifications
- `admin` - Administrators who manage the system

### Token Types
- **Access Token**: Short-lived token (24h) for API requests
- **Refresh Token**: Long-lived token (7d) for obtaining new access tokens

### Using Authentication

Include the access token in the Authorization header:
```
Authorization: Bearer <your-access-token>
```

### Protected Routes

Use the authentication middleware to protect routes:

```javascript
const { authenticate, authorize } = require('./middleware/auth');

// Require authentication only
app.get('/api/protected', authenticate, handler);

// Require specific role
app.get('/api/admin/data', authenticate, authorize('admin'), handler);

// Allow multiple roles
app.get('/api/data', authenticate, authorize('student', 'parent'), handler);
```

## Database Management

```bash
# Initialize database schema
npm run db:init

# Check database status
npm run db:status

# Create database backup
npm run db:backup

# Run database migrations
npm run db:migrate
```

## Development

```bash
# Start development server with auto-reload
npm run dev

# Run tests
npm test

# Start production server
npm start
```

## License

ISC
