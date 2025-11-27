# 🔧 QR Scan Error Fix

## Problem
Mobile app gets error when scanning QR code, but curl test works fine.

## Root Cause
The mobile app was using a different Vercel URL that has an internal server error on the attendance scan endpoint.

## Test Results

### Mobile App URL (BROKEN)
```
URL: https://snhs-student-attendance-monitoring-glw2kktxl.vercel.app/api
Login: ✅ Works (HTTP 200)
Attendance Scan: ❌ Fails (HTTP 500 - Internal Server Error)
```

### Working URL
```
URL: https://snhs-student-attendance-monitoring.vercel.app/api
Login: ✅ Works (HTTP 200)
Attendance Scan: ✅ Works (HTTP 200)
```

## Solution Applied

### 1. Updated API Config
**File:** `student_app/lib/config/api_config.dart`

**Changed from:**
```dart
static const String baseUrl =
    'https://snhs-student-attendance-monitoring-glw2kktxl.vercel.app/api';
```

**Changed to:**
```dart
static const String baseUrl =
    'https://snhs-student-attendance-monitoring.vercel.app/api';
```

### 2. Rebuild the App
After changing the API URL, you need to rebuild the Flutter app:

```bash
cd student_app

# For Android
flutter build apk --release

# Or for development
flutter run
```

## Verification

Test the QR scan with the updated app:

1. Login with john@gmail.com / Password1
2. Tap "Scan QR Code"
3. Scan QR code "Gate 1"
4. Should successfully log attendance

Expected response:
```json
{
  "success": true,
  "message": "Attendance logged successfully",
  "data": {
    "attendanceId": 3,
    "studentName": "John Doe",
    "entryTime": "2025-11-26T20:25:48.451Z",
    "gateName": "Gate 1",
    "locationValid": true
  }
}
```

## Why Two URLs?

Vercel creates multiple URLs for deployments:
- **Production URL:** `snhs-student-attendance-monitoring.vercel.app` (stable)
- **Preview URL:** `snhs-student-attendance-monitoring-glw2kktxl.vercel.app` (temporary)

The preview URL may have:
- Different environment variables
- Different database connection
- Older code version
- Configuration issues

**Always use the production URL** for mobile apps.

## Additional Checks

### Check Vercel Deployment
1. Go to Vercel dashboard
2. Check which deployment is set as "Production"
3. Ensure environment variables are set correctly:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `FIREBASE_SERVICE_ACCOUNT` (optional)

### Check Backend Logs
If the error persists, check Vercel function logs:
1. Go to Vercel dashboard
2. Click on your project
3. Go to "Logs" tab
4. Look for errors in `/api/student/attendance/scan` endpoint

Common errors:
- Database connection timeout
- Missing environment variables
- Invalid QR code in database
- Location service configuration

## Testing Script

Use this script to test both URLs:

```bash
./test-both-urls.sh
```

This will show you which URL is working and which is broken.

## Status

✅ **FIXED** - API URL updated to working production URL

---

**Date:** November 26, 2025  
**Issue:** QR scan returns 500 error on mobile app  
**Fix:** Updated API URL from preview to production deployment
