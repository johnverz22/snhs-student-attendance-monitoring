# QR Code Management Implementation

## Overview
This document describes the QR code validation and management system implemented for the School Attendance System.

## Components

### 1. AttendanceService (`src/services/attendanceService.js`)
Handles QR code validation and CRUD operations.

#### Key Methods:

**validateQRCode(qrCode)**
- Validates QR code against database
- Checks if code exists, is active, and not expired
- Returns validation result with error codes:
  - `QR_CODE_INVALID`: Code not found in database
  - `QR_CODE_INACTIVE`: Code exists but is deactivated
  - `QR_CODE_EXPIRED`: Code has passed expiration date

**createQRCode(code, gateName, expiresAt)**
- Creates new QR code entry
- Validates uniqueness
- Optional expiration date support

**getAllQRCodes(activeOnly)**
- Retrieves all QR codes
- Optional filtering for active codes only

**getQRCodeById(id)**
- Retrieves single QR code by ID

**updateQRCode(id, updates)**
- Updates QR code properties
- Supports updating: code, gateName, isActive, expiresAt

**deleteQRCode(id)**
- Removes QR code from database

### 2. Admin API Endpoints (`src/routes/admin.js`)

All endpoints require admin authentication.

#### POST /api/admin/qr-codes
Create a new QR code.

**Request Body:**
```json
{
  "code": "GATE_A_2024_XYZ123",
  "gateName": "Main Gate A",
  "expiresAt": "2025-12-31T23:59:59Z" // Optional
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "QR code created successfully",
  "data": {
    "id": 1,
    "code": "GATE_A_2024_XYZ123",
    "gateName": "Main Gate A",
    "isActive": true,
    "expiresAt": "2025-12-31T23:59:59Z",
    "createdAt": "2025-11-18T12:00:00Z"
  }
}
```

#### GET /api/admin/qr-codes
Get all QR codes.

**Query Parameters:**
- `activeOnly=true` - Return only active QR codes

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "GATE_A_2024_XYZ123",
      "gateName": "Main Gate A",
      "isActive": true,
      "expiresAt": null,
      "createdAt": "2025-11-18T12:00:00Z"
    }
  ]
}
```

#### GET /api/admin/qr-codes/:id
Get a single QR code by ID.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "code": "GATE_A_2024_XYZ123",
    "gateName": "Main Gate A",
    "isActive": true,
    "expiresAt": null,
    "createdAt": "2025-11-18T12:00:00Z"
  }
}
```

#### PUT /api/admin/qr-codes/:id
Update a QR code.

**Request Body:**
```json
{
  "code": "GATE_A_2024_UPDATED",
  "gateName": "Main Gate A - Updated",
  "isActive": false,
  "expiresAt": "2025-12-31T23:59:59Z"
}
```

All fields are optional.

**Response (200):**
```json
{
  "success": true,
  "message": "QR code updated successfully",
  "data": {
    "id": 1,
    "code": "GATE_A_2024_UPDATED",
    "gateName": "Main Gate A - Updated",
    "isActive": false,
    "expiresAt": "2025-12-31T23:59:59Z",
    "createdAt": "2025-11-18T12:00:00Z"
  }
}
```

#### DELETE /api/admin/qr-codes/:id
Delete a QR code.

**Response (200):**
```json
{
  "success": true,
  "message": "QR code deleted successfully"
}
```

### 3. Validation Rules (`src/middleware/validation.js`)

**qrCodeCreateRules**
- `code`: Required, 3-200 characters
- `gateName`: Required, 2-100 characters
- `expiresAt`: Optional, must be valid ISO 8601 date in the future

**qrCodeUpdateRules**
- `code`: Optional, 3-200 characters
- `gateName`: Optional, 2-100 characters
- `isActive`: Optional, boolean
- `expiresAt`: Optional, valid ISO 8601 date or null

## Database Schema

The `qr_codes` table structure:
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

## Error Codes

- `QR_CODE_INVALID`: QR code not found in database
- `QR_CODE_INACTIVE`: QR code exists but is deactivated
- `QR_CODE_EXPIRED`: QR code has expired
- `QR_CODE_EXISTS`: Attempting to create duplicate QR code
- `QR_CODE_NOT_FOUND`: QR code ID not found (for update/delete)
- `VALIDATION_ERROR`: Invalid input data

## Testing

Two test scripts are provided:

1. **testQRCodeEndpoints.js** - Tests all CRUD API endpoints
2. **testQRCodeValidation.js** - Tests validation logic

Run tests:
```bash
# Start server first
npm start

# In another terminal
node src/scripts/testQRCodeEndpoints.js
node src/scripts/testQRCodeValidation.js
```

## Requirements Coverage

This implementation satisfies Requirement 9:

1. ✅ Store valid QR code identifiers in SQLite Database
2. ✅ Verify QR code against stored valid codes
3. ✅ Reject unrecognized QR codes
4. ✅ Check QR code expiration timestamps
5. ✅ Proceed to location verification on success

## Usage Example

```javascript
const attendanceService = require('./services/attendanceService');

// Validate a QR code
const result = await attendanceService.validateQRCode('GATE_A_2024_XYZ123');

if (result.isValid) {
  console.log('QR code is valid:', result.qrCodeData);
  // Proceed with location validation
} else {
  console.log('QR code validation failed:', result.error, result.message);
}
```
