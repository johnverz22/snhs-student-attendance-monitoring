# Timezone Fix Guide - Manila/Philippines (UTC+8)

## Problem Summary

The attendance system was storing timestamps in UTC but not converting them to the configured timezone (Manila/Philippines UTC+8). This caused all attendance times to appear 8 hours behind the actual time.

## Solution Implemented

### 1. Created Timezone Utility (`src/utils/timezone.js`)

A new utility module that handles all timezone conversions:

- **`getConfiguredTimezone()`** - Gets timezone from school config
- **`getTimezoneOffset(timezone)`** - Converts timezone string to hour offset
- **`getCurrentTimestamp()`** - Returns current time in configured timezone
- **`convertToLocalTime(utcTimestamp)`** - Converts UTC to local time
- **`formatTimestamp(timestamp)`** - Formats timestamps for display

### 2. Updated Attendance Service

Modified `src/services/attendanceService.js` to:
- Use `getCurrentTimestamp()` when logging attendance
- Use timezone-aware time for duplicate checking

### 3. Improved Settings UI

Updated `public/admin/settings.html` to:
- Changed timezone input from text field to dropdown
- Added common timezone options including:
  - **UTC+8** (Philippines/Manila) ← Recommended for Philippines
  - Asia/Manila (same as UTC+8)
  - Other common timezones

### 4. Fixed Existing Data

Created script to update all existing attendance logs from UTC to Manila time.

## How to Use

### Step 1: Set Your Timezone

1. Open Admin Dashboard: `http://localhost:3000/admin`
2. Go to **Settings** page
3. In the **School Configuration** section, select timezone:
   - Choose **"UTC+8"** or **"Asia/Manila"** for Philippines
4. Click **Save Changes**

### Step 2: Fix Existing Attendance Data (One-time)

If you have existing attendance logs that were recorded in UTC, run this command once:

```bash
npm run fix-timezone
```

This will:
- Add 8 hours to all existing attendance timestamps
- Convert them from UTC to Manila time
- Show you a preview before making changes

**⚠️ Warning:** Only run this once! Running it multiple times will add 8 hours each time.

### Step 3: Verify the Fix

Test that timezone is working correctly:

```bash
npm run test-timezone
```

This will show:
- Current configured timezone
- Current time in both UTC and local timezone
- Sample attendance log with correct time

### Step 4: Restart Your Server

After changing timezone settings, restart the server:

```bash
npm start
```

## Expected Behavior

### Before Fix
- Student scans QR at 3:00 PM Manila time
- System records: `2025-11-22 07:00:00` (UTC)
- Dashboard shows: `07:00:00` (wrong!)

### After Fix
- Student scans QR at 3:00 PM Manila time
- System records: `2025-11-22 15:00:00` (Manila time)
- Dashboard shows: `15:00:00` (correct!)

## Supported Timezones

The system supports these timezone formats:

### UTC Offset Format
- `UTC+8` - Philippines, Singapore, Hong Kong, Malaysia
- `UTC+9` - Japan, South Korea
- `UTC-5` - US Eastern Time
- `UTC-8` - US Pacific Time

### Named Timezone Format
- `Asia/Manila` - Philippines
- `Asia/Singapore` - Singapore
- `Asia/Hong_Kong` - Hong Kong
- `Asia/Tokyo` - Japan
- `America/New_York` - US Eastern
- `America/Los_Angeles` - US Pacific
- `Europe/London` - UK

## Testing

### Test Current Timezone Configuration
```bash
npm run test-timezone
```

### Test Attendance Logging
1. Use student app to scan QR code
2. Check admin dashboard → Attendance Logs
3. Verify time matches your local time

### Manual Database Check
```bash
sqlite3 data/school_attendance.db
```

```sql
-- Check timezone setting
SELECT timezone FROM school_config WHERE id = 1;

-- Check recent attendance logs
SELECT id, entry_time, student_id 
FROM attendance_logs 
ORDER BY entry_time DESC 
LIMIT 5;
```

## Troubleshooting

### Times Still Wrong After Fix

1. **Check timezone setting:**
   ```bash
   npm run test-timezone
   ```

2. **Verify you ran the fix script:**
   ```bash
   npm run fix-timezone
   ```

3. **Restart the server:**
   ```bash
   npm start
   ```

### Times Are 8 Hours Ahead Now

You may have run the fix script multiple times. To revert:

```bash
sqlite3 data/school_attendance.db
```

```sql
-- Subtract 8 hours from all logs
UPDATE attendance_logs 
SET entry_time = datetime(entry_time, '-8 hours');
```

Then run `npm run fix-timezone` only once.

### Different Timezone Needed

1. Go to Admin → Settings
2. Select your timezone from dropdown
3. If not listed, you can manually add it to `public/admin/settings.html`
4. Run fix script with your timezone:
   ```bash
   npm run fix-timezone
   ```

## Technical Details

### How It Works

1. **Storage**: All timestamps are stored in the configured timezone (not UTC)
2. **Display**: Timestamps are displayed as-is from database
3. **Comparison**: Time-based queries use the same timezone for consistency

### Database Schema

The `school_config` table has a `timezone` field:

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

### Attendance Logs

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

The `entry_time` field now stores time in the configured timezone.

## Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run test-timezone` | Test timezone configuration |
| `npm run fix-timezone` | Fix existing attendance data (one-time) |
| `npm start` | Start server with timezone support |

## Summary

✅ Timezone utility created  
✅ Attendance service updated  
✅ Settings UI improved  
✅ Existing data fixed  
✅ Test scripts provided  

Your attendance system now properly handles Manila/Philippines timezone (UTC+8)!
