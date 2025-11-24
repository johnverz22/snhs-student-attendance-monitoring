# Error Handling and Validation System

This document describes the comprehensive error handling and validation system implemented for the School Attendance System.

## Overview

The error handling system provides:
- Centralized error handling middleware
- Request validation for all endpoints
- Standardized error response format
- Rate limiting on authentication endpoints
- Comprehensive error logging

## Components

### 1. Error Handler Middleware (`errorHandler.js`)

**Features:**
- Custom `AppError` class for application-specific errors
- Centralized error logging with context information
- Standardized error response format
- Special handling for JWT, validation, database, and syntax errors
- Development vs production error details
- Stack traces in development mode only

**Usage:**
```javascript
const { errorHandler, notFoundHandler, asyncHandler, AppError } = require('./middleware/errorHandler');

// Wrap async route handlers
router.get('/route', asyncHandler(async (req, res) => {
  // Your code here
  // Errors are automatically caught and passed to error handler
}));

// Throw custom errors
throw new AppError('Resource not found', 404, 'RESOURCE_NOT_FOUND');
```

**Error Response Format:**
```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human-readable error message",
  "details": { /* Optional additional context */ }
}
```

### 2. Rate Limiting Middleware (`rateLimiter.js`)

**Rate Limiters:**

- **authRateLimiter**: 5 attempts per 15 minutes (login endpoints)
- **registrationRateLimiter**: 3 registrations per hour
- **apiRateLimiter**: 100 requests per 15 minutes (general API)
- **strictRateLimiter**: 3 attempts per hour (sensitive operations)

**Usage:**
```javascript
const { authRateLimiter, registrationRateLimiter } = require('./middleware/rateLimiter');

router.post('/login', authRateLimiter, loginHandler);
router.post('/register', registrationRateLimiter, registerHandler);
```

**Configuration:**
- Uses IP address for rate limiting
- Returns 429 status code when limit exceeded
- Includes `RateLimit-*` headers in response
- Configurable time windows and limits

### 3. Validation Middleware (`validation.js`)

**Features:**
- Request validation using express-validator
- Comprehensive validation rules for all endpoints
- Formatted validation error responses
- Field-level error details

**Available Validation Rules:**
- `studentRegistrationRules`
- `studentLoginRules`
- `studentProfileUpdateRules`
- `parentRegistrationRules`
- `parentLoginRules`
- `attendanceScanRules`
- `qrCodeCreateRules`
- `qrCodeUpdateRules`
- `validateSchoolConfig`
- `deviceTokenRegistrationRules`

**Usage:**
```javascript
const { validate, studentRegistrationRules } = require('./middleware/validation');

router.post('/register', studentRegistrationRules, validate, handler);
```

### 4. Logger Utility (`utils/logger.js`)

**Features:**
- Structured JSON logging
- Log levels: ERROR, WARN, INFO, DEBUG
- Context-aware logging
- Special methods for API requests, auth events, security events
- Development vs production logging

**Usage:**
```javascript
const Logger = require('../utils/logger');

Logger.error('Error message', error, { context: 'value' });
Logger.warn('Warning message', { context: 'value' });
Logger.info('Info message', { context: 'value' });
Logger.debug('Debug message', { context: 'value' });

// Special logging methods
Logger.logRequest(req);
Logger.logResponse(req, res, responseTime);
Logger.logAuthEvent('login', userId, role, success, context);
Logger.logSecurityEvent('suspicious_activity', 'high', context);
```

### 5. Request Logger Middleware (`requestLogger.js`)

**Features:**
- Logs all incoming requests
- Logs all responses with timing
- Tracks response time
- Only enabled in development mode

## Error Codes

### Authentication Errors
- `AUTH_NO_TOKEN` - No authorization token provided
- `AUTH_INVALID_FORMAT` - Invalid authorization header format
- `AUTH_INVALID_TOKEN` - Invalid JWT token
- `AUTH_TOKEN_EXPIRED` - JWT token has expired
- `AUTH_INVALID_CREDENTIALS` - Invalid login credentials
- `AUTH_UNAUTHORIZED` - Authentication required
- `AUTH_FORBIDDEN` - Insufficient permissions

### Validation Errors
- `VALIDATION_ERROR` - Request validation failed
- `VALIDATION_DUPLICATE` - Duplicate entry (email, student ID, etc.)
- `VALIDATION_REQUIRED_FIELD` - Missing required field
- `VALIDATION_INVALID_FORMAT` - Invalid data format

### Business Logic Errors
- `QR_CODE_INVALID` - QR code not recognized
- `QR_CODE_EXPIRED` - QR code has expired
- `QR_CODE_EXISTS` - QR code already exists
- `QR_CODE_NOT_FOUND` - QR code not found
- `LOCATION_INVALID` - GPS coordinates outside school boundary
- `ATTENDANCE_DUPLICATE` - Already logged attendance recently
- `STUDENT_NOT_FOUND` - Student record not found
- `CONFIG_NOT_FOUND` - Configuration not found

### System Errors
- `DATABASE_ERROR` - Database operation failed
- `DATABASE_CONSTRAINT_ERROR` - Database constraint violation
- `NOTIFICATION_FAILED` - Push notification delivery failed
- `INTERNAL_ERROR` - Unexpected server error
- `INVALID_JSON` - Malformed JSON in request body
- `NOT_FOUND` - Route not found
- `RATE_LIMIT_EXCEEDED` - Too many requests

## Implementation in Routes

### Before (without error handling):
```javascript
router.post('/endpoint', async (req, res, next) => {
  try {
    // Route logic
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});
```

### After (with error handling):
```javascript
const { asyncHandler } = require('../middleware/errorHandler');
const { authRateLimiter } = require('../middleware/rateLimiter');
const { validate, validationRules } = require('../middleware/validation');

router.post(
  '/endpoint',
  authRateLimiter,
  validationRules,
  validate,
  asyncHandler(async (req, res) => {
    // Route logic - errors automatically caught
    res.json({ success: true, data: result });
  })
);
```

## Testing

Run the error handling test suite:
```bash
node src/scripts/testErrorHandling.js
```

This tests:
1. Invalid JSON handling
2. Missing required fields validation
3. Invalid email format validation
4. Weak password validation
5. 404 Not Found handling
6. Rate limiting
7. Unauthorized access
8. Invalid token format
9. Invalid GPS coordinates
10. Standardized error response format

## Best Practices

1. **Always use asyncHandler** for async route handlers
2. **Apply rate limiting** to authentication and sensitive endpoints
3. **Use validation rules** for all endpoints that accept input
4. **Throw AppError** for application-specific errors with proper codes
5. **Log security events** for suspicious activities
6. **Return user-friendly messages** in production (hide internal details)
7. **Include context** in error logs for debugging
8. **Use appropriate HTTP status codes**:
   - 400: Bad Request (validation errors)
   - 401: Unauthorized (authentication required)
   - 403: Forbidden (insufficient permissions)
   - 404: Not Found
   - 409: Conflict (duplicate entries)
   - 429: Too Many Requests (rate limit)
   - 500: Internal Server Error

## Configuration

### Rate Limiting
Adjust rate limits in `src/middleware/rateLimiter.js`:
```javascript
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Time window
  max: 5, // Max requests per window
  // ...
});
```

### Logging
Configure logging behavior in `src/utils/logger.js` and `src/config/index.js`.

### Trust Proxy
For rate limiting behind a reverse proxy, ensure trust proxy is enabled in `src/index.js`:
```javascript
app.set('trust proxy', 1);
```

## Production Considerations

1. **Logging Service**: Integrate with Winston, Sentry, CloudWatch, or Datadog
2. **Error Monitoring**: Set up error tracking and alerting
3. **Rate Limiting**: Consider Redis-based rate limiting for distributed systems
4. **Security**: Review and adjust rate limits based on traffic patterns
5. **Performance**: Monitor error rates and response times
6. **Compliance**: Ensure error logs don't contain sensitive data (PII)

## Requirements Satisfied

This implementation satisfies the following requirements from the design document:

- **20.1**: Validates all incoming API requests for required fields and data types
- **20.2**: Returns appropriate HTTP error codes with descriptive messages
- **20.3**: Logs all errors with timestamps and context information
- **20.4**: Handles database connection failures with retry logic
- **20.5**: Returns user-friendly error messages to client applications
- **21.4**: Implements authentication middleware for protected endpoints

Rate limiting specifically addresses security requirement 1.5 (preventing brute force attacks on authentication).
