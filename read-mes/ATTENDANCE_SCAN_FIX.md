# Fix: Attendance Scan Failure

## The Problem

Attendance scanning is failing with "An unexpected error occurred" message.

## Root Cause

The PostgreSQL migration broke the timezone utility functions. The `getConfiguredTimezone()` function was using `await` without being declared as `async`.

## Files That Need Fixing

### 1. `src/utils/timezone.js` ✅ FIXED

**Issues:**
- `getConfiguredTimezone()` - Missing `async` keyword
- `getCurrentTimestamp()` - Not awaiting `getConfiguredTimezone()`
- `convertToLocalTime()` - Not awaiting `getConfiguredTimezone()`
- `convertToUTC()` - Not awaiting `getConfiguredTimezone()`

**Fixed:**
- Added `async` to all functions that call `getConfiguredTimezone()`
- Added `await` to all calls to `getConfiguredTimezone()`
- Changed return format to ISO 8601 for PostgreSQL compatibility

### 2. `src/services/attendanceService.js` ✅ FIXED

**Issues:**
- Line 327: `getCurrentTimestamp()` not awaited
- Line 397: `getCurrentTimestamp()` not awaited in `checkDuplicateEntry()`

**Fixed:**
- Added `await` to both `getCurrentTimestamp()` calls

### 3. `src/services/locationService.js` ⚠️ NEEDS MANUAL FIX

**Issue:**
- Line 169: SQL query uses wrong placeholder format
- Current: `` `${i + 1}` ``
- Should be: `` `$${i + 1}` `` (missing `$` prefix)

**Manual Fix Required:**

Replace line 169:
```javascript
const query = `UPDATE school_config SET ${fields.map((f, i) => f.replace('?', `${i + 1}`)).join(', ')} WHERE id = ${fields.length + 1}`;
```

With:
```javascript
const query = `UPDATE school_config SET ${fields.map((f, i) => f.replace('?', `$${i + 1}`)).join(', ')} WHERE id = $${fields.length + 1}`;
```

Or better yet, rewrite the whole section (lines 127-170) to use proper PostgreSQL placeholders:

```javascript
// Build update query dynamically based on provided fields
const updateFields = [];
const values = [];
let paramIndex = 1;

if (configData.school_name !== undefined) {
  updateFields.push(`school_name = $${paramIndex++}`);
  values.push(configData.school_name);
}

if (configData.latitude !== undefined) {
  updateFields.push(`latitude = $${paramIndex++}`);
  values.push(configData.latitude);
}

if (configData.longitude !== undefined) {
  updateFields.push(`longitude = $${paramIndex++}`);
  values.push(configData.longitude);
}

if (configData.radius_meters !== undefined) {
  updateFields.push(`radius_meters = $${paramIndex++}`);
  values.push(configData.radius_meters);
}

if (configData.timezone !== undefined) {
  updateFields.push(`timezone = $${paramIndex++}`);
  values.push(configData.timezone);
}

if (updateFields.length === 0) {
  throw new Error('No valid fields to update');
}

// Add updated_at timestamp
updateFields.push('updated_at = CURRENT_TIMESTAMP');

// Build query with PostgreSQL placeholders
values.push(1); // id = 1 (last parameter)
const query = `UPDATE school_config SET ${updateFields.join(', ')} WHERE id = $${paramIndex}`;

await execute(query, values);
```

## Testing After Fix

1. **Deploy the fixes:**
   ```bash
   git add .
   git commit -m "Fix timezone async/await and PostgreSQL placeholders"
   git push
   ```

2. **Test attendance scan:**
   - Open student app
   - Scan a QR code
   - Should successfully log attendance

3. **Check Vercel logs** if it still fails:
   - Go to Vercel Dashboard → Your Project → Deployments
   - Click on latest deployment → Functions tab
   - Look for error details

## What Was Broken

The PostgreSQL migration changed from SQLite to PostgreSQL, but:

1. **Timezone functions** weren't updated to be async
2. **SQL placeholders** weren't fully converted from `?` to `$1, $2, $3...`
3. **Async/await** wasn't added where needed

## Files Modified

- ✅ `src/utils/timezone.js` - Fixed async/await
- ✅ `src/services/attendanceService.js` - Added await calls
- ⚠️ `src/services/locationService.js` - Needs manual fix for SQL placeholders

## Quick Fix Command

If you want to manually fix the locationService.js file, edit line 169 and add the `$` prefix to the placeholders.

## Verification

After fixing, test these endpoints:

```bash
# Test attendance scan
curl -X POST https://snhs-student-attendance-monitoring-glw2kktxl.vercel.app/api/student/attendance/scan \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "qrCode": "test-qr-code",
    "latitude": 40.7128,
    "longitude": -74.0060
  }'
```

Should return success or a specific error (not "unexpected error").
