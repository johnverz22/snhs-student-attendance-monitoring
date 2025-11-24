# Design Document

## Overview

The School Attendance Logging System is a distributed application consisting of three main components:

1. **Student Mobile App** (Flutter) - Enables QR code scanning with GPS verification
2. **Parent Mobile App** (Flutter) - Receives real-time attendance notifications
3. **Backend Server** (Node.js + Express.js + SQLite) - Processes attendance, validates location, manages data
4. **Admin Web Interface** (HTML/CSS/JS) - Provides reporting and monitoring capabilities

The system uses QR codes placed at school gates combined with GPS verification to ensure students are physically present when logging attendance. Parents receive instant notifications via Pushy, and administrators can generate comprehensive reports.

## Architecture

### System Architecture Diagram

```
┌─────────────────┐         ┌─────────────────┐
│  Student App    │         │   Parent App    │
│   (Flutter)     │         │   (Flutter)     │
└────────┬────────┘         └────────┬────────┘
         │                           │
         │ HTTPS/REST                │ HTTPS/REST
         │                           │ Pushy SDK
         ▼                           ▼
    ┌────────────────────────────────────┐
    │         Node.js Server             │
    │      (Express.js + SQLite)         │
    │                                    │
    │  ┌──────────────────────────┐     │
    │  │   Authentication Layer   │     │
    │  └──────────────────────────┘     │
    │  ┌──────────────────────────┐     │
    │  │   Business Logic Layer   │     │
    │  │  - QR Validation         │     │
    │  │  - GPS Verification      │     │
    │  │  - Attendance Logging    │     │
    │  └──────────────────────────┘     │
    │  ┌──────────────────────────┐     │
    │  │    Data Access Layer     │     │
    │  └──────────────────────────┘     │
    └────────────┬───────────────────────┘
                 │
                 ▼
         ┌───────────────┐
         │SQLite Database│
         └───────────────┘
                 ▲
                 │
         ┌───────┴────────┐
         │  Admin Web UI  │
         │ (HTML/CSS/JS)  │
         └────────────────┘
```



### Technology Stack

**Student App & Parent App:**
- Framework: Flutter (Dart)
- QR Scanner: qr_code_scanner package
- Location: geolocator package
- HTTP Client: http or dio package
- Push Notifications: pushy_flutter package
- State Management: Provider or Riverpod
- Local Storage: shared_preferences

**Backend Server:**
- Runtime: Node.js (v18+)
- Framework: Express.js
- Database: SQLite3 with better-sqlite3 driver
- Authentication: JWT (jsonwebtoken)
- Password Hashing: bcrypt
- Push Notifications: Pushy REST API
- Validation: express-validator
- CORS: cors middleware

**Admin Interface:**
- HTML5 for structure
- CSS3 for styling (modern, clean design)
- Vanilla JavaScript for interactivity
- Fetch API for server communication
- No external frameworks (lightweight approach)

## Components and Interfaces

### 1. Student Mobile App

#### Screen Structure

1. **Authentication Screens**
   - Login Screen
   - Registration Screen
   - Password Reset Screen

2. **Main Screens**
   - Home/Dashboard Screen
   - QR Scanner Screen
   - Profile Screen
   - Attendance History Screen

#### Key Components

**AuthService**
- Handles login, registration, token management
- Stores JWT tokens securely
- Manages session state

**QRScannerService**
- Initializes camera for QR scanning
- Decodes QR codes
- Captures GPS coordinates
- Sends attendance request to server

**LocationService**
- Requests location permissions
- Retrieves current GPS coordinates
- Handles location errors

**AttendanceService**
- Communicates with server API
- Submits attendance logs
- Retrieves attendance history



#### UI Design Principles

- Material Design 3 components
- Primary color scheme: Blue (#2196F3) with complementary accents
- Card-based layouts for content organization
- Bottom navigation for main sections
- Floating action button for QR scanner access
- Smooth page transitions and loading states
- Clear success/error feedback with snackbars

### 2. Parent Mobile App

#### Screen Structure

1. **Authentication Screens**
   - Login Screen
   - Registration Screen (with student linking)

2. **Main Screens**
   - Notifications Dashboard
   - Student Attendance History
   - Settings Screen

#### Key Components

**AuthService**
- Handles parent authentication
- Links parent to student accounts
- Manages JWT tokens

**NotificationService**
- Initializes Pushy SDK
- Registers device for push notifications
- Handles incoming notifications
- Stores notification history locally

**AttendanceViewService**
- Fetches student attendance records
- Filters by date range
- Displays attendance statistics

#### UI Design Principles

- Simplified interface focused on notifications
- Large, readable text for quick scanning
- Timeline view for attendance history
- Color-coded status indicators (green for success, red for issues)
- Pull-to-refresh for latest data



### 3. Backend Server

#### API Endpoints

**Authentication Endpoints**
```
POST /api/auth/student/register
POST /api/auth/student/login
POST /api/auth/parent/register
POST /api/auth/parent/login
POST /api/auth/admin/login
POST /api/auth/refresh-token
```

**Student Endpoints**
```
GET  /api/student/profile
PUT  /api/student/profile
POST /api/student/attendance/scan
GET  /api/student/attendance/history
```

**Parent Endpoints**
```
GET  /api/parent/students
GET  /api/parent/notifications
GET  /api/parent/student/:studentId/attendance
```

**Admin Endpoints**
```
GET  /api/admin/reports/daily?date=YYYY-MM-DD
GET  /api/admin/reports/weekly?startDate=YYYY-MM-DD
GET  /api/admin/reports/monthly?month=YYYY-MM
GET  /api/admin/reports/student/:studentId
GET  /api/admin/students/search?query=text
GET  /api/admin/attendance/logs
POST /api/admin/qr-codes
GET  /api/admin/school/config
PUT  /api/admin/school/config
```

#### Middleware Stack

1. **CORS Middleware** - Enable cross-origin requests
2. **Body Parser** - Parse JSON request bodies
3. **Authentication Middleware** - Verify JWT tokens
4. **Validation Middleware** - Validate request data
5. **Error Handler** - Centralized error handling

#### Service Layer Architecture

**AuthService**
- User registration and login
- JWT token generation and verification
- Password hashing and comparison
- Role-based access control

**AttendanceService**
- Process QR scan requests
- Validate QR codes against database
- Verify GPS coordinates within school boundaries
- Log attendance entries
- Prevent duplicate entries within time window

**LocationService**
- Calculate distance between two GPS coordinates (Haversine formula)
- Validate if coordinates fall within school boundary
- Store and retrieve school location configuration

**NotificationService**
- Send push notifications via Pushy API
- Queue notifications for delivery
- Handle notification failures with retry logic
- Log notification delivery status

**ReportService**
- Generate daily, weekly, monthly reports
- Calculate attendance statistics
- Format data for CSV export
- Query attendance by various filters



### 4. Admin Web Interface

#### Page Structure

1. **Login Page** (`/admin/login.html`)
2. **Dashboard** (`/admin/dashboard.html`)
3. **Attendance Logs** (`/admin/logs.html`)
4. **Reports** (`/admin/reports.html`)
5. **Students** (`/admin/students.html`)
6. **Settings** (`/admin/settings.html`)

#### Design System

**Color Palette:**
- Primary: #3498db (Blue)
- Secondary: #2ecc71 (Green)
- Accent: #e74c3c (Red)
- Background: #f8f9fa (Light Gray)
- Text: #2c3e50 (Dark Gray)
- Border: #dee2e6 (Light Border)

**Typography:**
- Font Family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
- Headings: 600 weight
- Body: 400 weight
- Font sizes: 14px base, 24px h1, 20px h2, 16px h3

**Spacing:**
- Base unit: 8px
- Container padding: 24px
- Card padding: 16px
- Element margins: 16px vertical, 8px horizontal

**Components:**
- Cards with subtle shadows
- Tables with hover effects
- Buttons with smooth transitions
- Form inputs with focus states
- Modal dialogs for confirmations
- Toast notifications for feedback

#### JavaScript Modules

**api.js** - Handles all API communication
**auth.js** - Manages admin authentication
**reports.js** - Generates and downloads reports
**search.js** - Implements search functionality
**charts.js** - Renders attendance statistics (optional: Chart.js)



## Data Models

### Database Schema

#### Students Table
```sql
CREATE TABLE students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  grade TEXT,
  phone TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Parents Table
```sql
CREATE TABLE parents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  phone TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Parent_Student_Links Table
```sql
CREATE TABLE parent_student_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  parent_id INTEGER NOT NULL,
  student_id INTEGER NOT NULL,
  relationship TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  UNIQUE(parent_id, student_id)
);
```

#### Attendance_Logs Table
```sql
CREATE TABLE attendance_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  qr_code_id INTEGER NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  location_valid BOOLEAN NOT NULL,
  entry_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (qr_code_id) REFERENCES qr_codes(id)
);
```

#### QR_Codes Table
```sql
CREATE TABLE qr_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  gate_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME
);
```

#### School_Config Table
```sql
CREATE TABLE school_config (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  school_name TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  radius_meters INTEGER NOT NULL,
  timezone TEXT DEFAULT 'UTC',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Push_Tokens Table
```sql
CREATE TABLE push_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  parent_id INTEGER NOT NULL,
  device_token TEXT NOT NULL,
  platform TEXT NOT NULL,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE,
  UNIQUE(parent_id, device_token)
);
```

#### Admins Table
```sql
CREATE TABLE admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```



### API Request/Response Models

#### Attendance Scan Request
```json
{
  "qrCode": "GATE_A_2024_XYZ123",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "timestamp": "2024-11-18T08:30:00Z"
}
```

#### Attendance Scan Response (Success)
```json
{
  "success": true,
  "message": "Attendance logged successfully",
  "data": {
    "attendanceId": 12345,
    "studentName": "John Doe",
    "entryTime": "2024-11-18T08:30:15Z",
    "gateName": "Main Gate A"
  }
}
```

#### Attendance Scan Response (Failure)
```json
{
  "success": false,
  "error": "LOCATION_INVALID",
  "message": "You are not within school boundaries",
  "data": {
    "distanceFromSchool": 250,
    "maxAllowedDistance": 100
  }
}
```

#### Push Notification Payload
```json
{
  "to": "device_token_here",
  "notification": {
    "title": "Student Arrival",
    "body": "John Doe arrived at school at 8:30 AM",
    "sound": "default"
  },
  "data": {
    "type": "attendance",
    "studentId": "12345",
    "studentName": "John Doe",
    "entryTime": "2024-11-18T08:30:15Z"
  }
}
```



## Error Handling

### Error Categories

1. **Authentication Errors**
   - Invalid credentials
   - Expired tokens
   - Insufficient permissions

2. **Validation Errors**
   - Missing required fields
   - Invalid data format
   - Constraint violations

3. **Business Logic Errors**
   - Invalid QR code
   - Location out of bounds
   - Duplicate attendance entry
   - Student not found

4. **System Errors**
   - Database connection failures
   - External service failures (Pushy)
   - Network timeouts

### Error Response Format

```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human-readable error message",
  "details": {
    "field": "Additional context"
  }
}
```

### Error Codes

- `AUTH_INVALID_CREDENTIALS` - Login failed
- `AUTH_TOKEN_EXPIRED` - JWT token expired
- `AUTH_UNAUTHORIZED` - Insufficient permissions
- `VALIDATION_REQUIRED_FIELD` - Missing required field
- `VALIDATION_INVALID_FORMAT` - Data format invalid
- `QR_CODE_INVALID` - QR code not recognized
- `QR_CODE_EXPIRED` - QR code has expired
- `LOCATION_INVALID` - GPS coordinates outside school boundary
- `ATTENDANCE_DUPLICATE` - Already logged attendance recently
- `STUDENT_NOT_FOUND` - Student record not found
- `DATABASE_ERROR` - Database operation failed
- `NOTIFICATION_FAILED` - Push notification delivery failed
- `INTERNAL_ERROR` - Unexpected server error

### Client-Side Error Handling

**Student App:**
- Display user-friendly error messages
- Retry logic for network failures
- Offline mode with queue for pending scans
- Clear visual feedback for validation errors

**Parent App:**
- Graceful degradation if notifications fail
- Cache attendance data locally
- Retry failed API requests

**Admin Interface:**
- Toast notifications for errors
- Form validation feedback
- Retry buttons for failed operations



## Testing Strategy

### Unit Testing

**Backend (Node.js):**
- Test framework: Jest
- Test services independently with mocked dependencies
- Test database operations with in-memory SQLite
- Test location calculation algorithms
- Test JWT token generation and validation
- Coverage target: 80%+

**Flutter Apps:**
- Test framework: flutter_test
- Unit test services and business logic
- Mock HTTP clients and external dependencies
- Test state management logic
- Coverage target: 70%+

### Integration Testing

**Backend:**
- Test API endpoints with supertest
- Test complete request/response cycles
- Test database transactions
- Test authentication flows
- Test notification delivery

**Flutter Apps:**
- Widget testing for UI components
- Test navigation flows
- Test form validation
- Test QR scanner integration

### End-to-End Testing

- Test complete attendance flow: scan → validate → log → notify
- Test report generation workflows
- Test admin interface operations
- Manual testing on physical devices for GPS and camera

### Performance Testing

- Load testing for concurrent attendance scans
- Database query optimization
- API response time monitoring
- Mobile app memory usage profiling

### Security Testing

- SQL injection prevention
- JWT token security
- Password hashing verification
- HTTPS enforcement
- Input sanitization
- Rate limiting on API endpoints



## Security Considerations

### Authentication & Authorization

- JWT tokens with 24-hour expiration
- Refresh tokens for extended sessions
- Role-based access control (student, parent, admin)
- Password requirements: minimum 8 characters, mixed case, numbers
- Bcrypt for password hashing (10 rounds)
- Rate limiting on login endpoints (5 attempts per 15 minutes)

### Data Protection

- HTTPS/TLS for all API communication
- Encrypted storage for sensitive data on mobile devices
- SQL parameterized queries to prevent injection
- Input validation and sanitization
- CORS configuration to restrict origins

### Privacy

- Minimal data collection (only necessary information)
- GPS coordinates stored only for validation purposes
- Parent access limited to their linked students
- Admin access logged for audit trail
- Data retention policy (configurable)

### Mobile App Security

- Secure token storage using platform-specific secure storage
- Certificate pinning for API communication (optional)
- Biometric authentication option for app access
- Session timeout after inactivity

## Deployment Considerations

### Server Deployment

- Node.js server on VPS or cloud platform (AWS, DigitalOcean, etc.)
- PM2 for process management and auto-restart
- Nginx as reverse proxy
- SSL certificate (Let's Encrypt)
- Environment variables for configuration
- Database backups scheduled daily
- Log rotation and monitoring

### Mobile App Deployment

- Student App: Google Play Store and Apple App Store
- Parent App: Google Play Store and Apple App Store
- Version management and update notifications
- Crash reporting (Firebase Crashlytics)
- Analytics for usage tracking (optional)

### Admin Interface Deployment

- Served as static files from Node.js server
- Accessible at `/admin` path
- Protected by authentication
- Responsive design for tablet access

## Scalability Considerations

- SQLite suitable for single school (up to 5000 students)
- For multiple schools, consider PostgreSQL or MySQL
- Horizontal scaling with load balancer if needed
- Caching layer (Redis) for frequently accessed data
- CDN for static assets
- Database indexing on frequently queried fields
- Connection pooling for database access

## Monitoring & Logging

- Application logs with Winston or similar
- Error tracking with Sentry or similar service
- API request logging
- Database query performance monitoring
- Push notification delivery tracking
- Attendance statistics dashboard
- System health checks and alerts
