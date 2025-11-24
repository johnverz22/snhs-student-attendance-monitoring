# Integration Tests

This directory contains integration tests for the School Attendance System API endpoints.

## Test Structure

- `tests/integration/auth.test.js` - Authentication flow tests
- `tests/integration/attendance.test.js` - Attendance logging and QR/GPS validation tests
- `tests/integration/notifications.test.js` - Push notification system tests
- `tests/integration/reports.test.js` - Report generation and admin endpoint tests
- `tests/helpers/seedTestData.js` - Test data seeding utilities
- `tests/setup.js` - Global test setup and teardown

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- --testPathPattern=auth.test.js

# Run with coverage
npm test -- --coverage

# Run in watch mode (for development)
npm test -- --watch
```

## Test Coverage

The integration tests cover:

### Authentication Flows
- Student registration and login
- Parent registration and login
- Admin login
- Duplicate email validation
- Invalid credentials handling

### Attendance Logging
- QR code scanning with GPS validation
- Invalid QR code rejection
- Location boundary validation
- Duplicate entry prevention
- Attendance history retrieval
- Date range filtering

### Notification System
- Device token registration
- Notification triggering on attendance
- Notification history retrieval

### Report Generation
- Daily attendance reports
- Weekly attendance reports
- Monthly attendance reports
- Per-student attendance logs
- CSV export functionality
- Search and filtering
- Authorization checks

## Test Database

Tests use a separate SQLite database (`data/test.db`) that is:
- Created before all tests run
- Seeded with test data
- Cleaned up after each test
- Removed after all tests complete

## Test Data

The following test data is seeded:
- Admin user: `admin` / `Admin123!`
- Student: `john.doe@school.com` / `Password123`
- Parent: `jane.doe@example.com` / `Password123`
- QR Codes: `GATE_A_2024`, `GATE_B_2024`
- School location: 40.7128, -74.0060 (100m radius)
