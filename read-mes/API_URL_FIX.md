# API URL Fix - Student & Parent Apps

## Problem
The mobile apps were getting "404 Not Found" errors because the API base URL was missing `/api` at the end.

## What Was Wrong

### Student App
**Before:**
```dart
static const String baseUrl = 'https://snhs-student-attendance-monitoring.vercel.app';
```

**After:**
```dart
static const String baseUrl = 'https://snhs-student-attendance-monitoring-glw2kktxl.vercel.app/api';
```

### Parent App
**Before:**
```dart
static const String baseUrl = 'https://snhs-student-attendance-monitoring.vercel.app';
```

**After:**
```dart
static const String baseUrl = 'https://snhs-student-attendance-monitoring-glw2kktxl.vercel.app/api';
```

## Changes Made

1. ✅ Added `/api` to the end of the base URL
2. ✅ Fixed the domain to match your actual Vercel deployment: `snhs-student-attendance-monitoring-glw2kktxl.vercel.app`

## Files Updated

- `student_app/lib/config/api_config.dart`
- `parent_app/lib/config/api_config.dart`

## How This Affects Endpoints

### Before (Wrong)
- Login: `https://snhs-student-attendance-monitoring.vercel.app/auth/student/login` ❌
- Register: `https://snhs-student-attendance-monitoring.vercel.app/auth/student/register` ❌

### After (Correct)
- Login: `https://snhs-student-attendance-monitoring-glw2kktxl.vercel.app/api/auth/student/login` ✅
- Register: `https://snhs-student-attendance-monitoring-glw2kktxl.vercel.app/api/auth/student/register` ✅

## Next Steps

1. **Rebuild your Flutter apps:**
   ```bash
   # Student App
   cd student_app
   flutter clean
   flutter pub get
   flutter run
   
   # Parent App
   cd parent_app
   flutter clean
   flutter pub get
   flutter run
   ```

2. **Test the login:**
   - Open the student app
   - Try logging in with a test account
   - Should now connect successfully

3. **Create test accounts if needed:**
   - Use the admin panel to create student accounts
   - Or use the registration feature in the apps

## Verify the Fix

Test the endpoint directly:
```bash
curl -X POST https://snhs-student-attendance-monitoring-glw2kktxl.vercel.app/api/auth/student/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

Expected response (if credentials are wrong):
```json
{
  "success": false,
  "error": "AUTH_INVALID_CREDENTIALS",
  "message": "Invalid email or password"
}
```

This confirms the endpoint exists and is working!
