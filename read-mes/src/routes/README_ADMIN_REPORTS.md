# Admin Report Endpoints Documentation

This document describes the admin authentication and reporting endpoints implemented for the School Attendance System.

## Authentication

### POST /api/auth/admin/login

Login with admin credentials.

**Request Body:**
```json
{
  "username": "admin",
  "password": "Admin123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "admin": {
      "id": 1,
      "username": "admin",
      "email": "admin@school.com"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

## Report Endpoints

All report endpoints require admin authentication. Include the access token in the Authorization header:
```
Authorization: Bearer <accessToken>
```

### GET /api/admin/reports/daily

Generate a daily attendance report for a specific date.

**Query Parameters:**
- `date` (required): Date in YYYY-MM-DD format
- `format` (optional): Set to 'csv' for CSV export

**Example Request:**
```
GET /api/admin/reports/daily?date=2025-11-18
GET /api/admin/reports/daily?date=2025-11-18&format=csv
```

**JSON Response:**
```json
{
  "success": true,
  "data": {
    "date": "2025-11-18",
    "statistics": {
      "totalEntries": 45,
      "uniqueStudents": 42,
      "locationValidCount": 44,
      "locationInvalidCount": 1
    },
    "entries": [
      {
        "id": 123,
        "studentId": "STU001",
        "studentName": "John Doe",
        "grade": "10A",
        "entryTime": "2025-11-18 08:15:23",
        "gateName": "Main Gate",
        "locationValid": true,
        "latitude": 40.7128,
        "longitude": -74.0060
      }
    ]
  }
}
```

### GET /api/admin/reports/weekly

Generate a weekly attendance report starting from a specific date.

**Query Parameters:**
- `startDate` (required): Start date in YYYY-MM-DD format (typically Monday)
- `format` (optional): Set to 'csv' for CSV export

**Example Request:**
```
GET /api/admin/reports/weekly?startDate=2025-11-16
```

**JSON Response:**
```json
{
  "success": true,
  "data": {
    "startDate": "2025-11-16",
    "endDate": "2025-11-22",
    "statistics": {
      "totalEntries": 210,
      "uniqueStudents": 45,
      "locationValidCount": 208,
      "locationInvalidCount": 2,
      "averageEntriesPerDay": "42.00"
    },
    "dailySummary": [
      {
        "date": "2025-11-16",
        "totalEntries": 42,
        "uniqueStudents": 40,
        "locationValidCount": 42,
        "locationInvalidCount": 0
      }
    ],
    "entries": [...]
  }
}
```

### GET /api/admin/reports/monthly

Generate a monthly attendance report for a specific month.

**Query Parameters:**
- `month` (required): Month in YYYY-MM format
- `format` (optional): Set to 'csv' for CSV export

**Example Request:**
```
GET /api/admin/reports/monthly?month=2025-11
```

**JSON Response:**
```json
{
  "success": true,
  "data": {
    "month": "2025-11",
    "startDate": "2025-11-01",
    "endDate": "2025-11-30",
    "statistics": {
      "totalEntries": 850,
      "uniqueStudents": 48,
      "locationValidCount": 845,
      "locationInvalidCount": 5,
      "daysWithAttendance": 20,
      "workingDays": 21,
      "attendancePercentage": 95.24,
      "averageEntriesPerDay": "42.50"
    },
    "dailySummary": [...],
    "entries": [...]
  }
}
```

### GET /api/admin/reports/student/:studentId

Generate a per-student attendance report.

**Path Parameters:**
- `studentId` (required): Student database ID

**Query Parameters:**
- `startDate` (optional): Filter from this date (YYYY-MM-DD)
- `endDate` (optional): Filter to this date (YYYY-MM-DD)
- `format` (optional): Set to 'csv' for CSV export

**Example Request:**
```
GET /api/admin/reports/student/5
GET /api/admin/reports/student/5?startDate=2025-11-01&endDate=2025-11-30
```

**JSON Response:**
```json
{
  "success": true,
  "data": {
    "student": {
      "id": 5,
      "studentId": "STU005",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "grade": "11B",
      "phone": "555-0123"
    },
    "dateRange": {
      "startDate": "2025-11-01",
      "endDate": "2025-11-30"
    },
    "statistics": {
      "totalEntries": 18,
      "uniqueDays": 18,
      "locationValidCount": 18,
      "locationInvalidCount": 0
    },
    "entries": [...],
    "dailyAttendance": {
      "2025-11-18": [
        {
          "id": 123,
          "entryTime": "2025-11-18 08:15:23",
          "gateName": "Main Gate",
          "locationValid": true
        }
      ]
    }
  }
}
```

## Attendance Log Management

### GET /api/admin/attendance/logs

Get attendance logs with pagination and filtering.

**Query Parameters:**
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 50, max: 100): Items per page
- `studentId` (optional): Filter by student database ID
- `startDate` (optional): Filter from this date (YYYY-MM-DD)
- `endDate` (optional): Filter to this date (YYYY-MM-DD)
- `sortBy` (optional, default: 'entry_time'): Sort column (entry_time, student_name, gate_name)
- `sortOrder` (optional, default: 'DESC'): Sort order (ASC, DESC)

**Example Request:**
```
GET /api/admin/attendance/logs?page=1&limit=20
GET /api/admin/attendance/logs?studentId=5&startDate=2025-11-01
```

**Response:**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": 123,
        "studentId": "STU001",
        "studentName": "John Doe",
        "grade": "10A",
        "entryTime": "2025-11-18 08:15:23",
        "gateName": "Main Gate",
        "locationValid": true,
        "latitude": 40.7128,
        "longitude": -74.0060
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 850,
      "totalPages": 43,
      "hasMore": true
    }
  }
}
```

## Student Search

### GET /api/admin/students/search

Search for students by ID, name, or email.

**Query Parameters:**
- `query` (required): Search term
- `limit` (optional, default: 20, max: 100): Maximum results

**Example Request:**
```
GET /api/admin/students/search?query=john
GET /api/admin/students/search?query=STU001
```

**Response:**
```json
{
  "success": true,
  "data": {
    "students": [
      {
        "id": 1,
        "studentId": "STU001",
        "name": "John Doe",
        "email": "john@example.com",
        "grade": "10A",
        "phone": "555-0100",
        "createdAt": "2025-11-01 10:00:00"
      }
    ],
    "count": 1
  }
}
```

## Error Responses

All endpoints return standardized error responses:

```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human-readable error message"
}
```

Common error codes:
- `AUTH_INVALID_CREDENTIALS`: Invalid login credentials
- `AUTH_UNAUTHORIZED`: Missing or invalid authentication token
- `VALIDATION_ERROR`: Invalid request parameters
- `STUDENT_NOT_FOUND`: Student ID not found
- `INTERNAL_ERROR`: Server error

## CSV Export

All report endpoints support CSV export by adding `format=csv` to the query parameters. The response will have:
- Content-Type: `text/csv`
- Content-Disposition: `attachment; filename="report-name.csv"`

## Testing

Run the test suite to verify all endpoints:

```bash
node src/scripts/testReportEndpoints.js
```

Make sure the server is running before executing tests.
