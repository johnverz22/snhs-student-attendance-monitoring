# Fix: School Configuration Update Error

## The Problem

In the admin panel, updating school configuration fails with "Failed to update configuration" error.

## Root Cause

The `updateSchoolConfig` method in `src/services/locationService.js` had incorrect SQL parameter counting.

### The Bug

```javascript
// BROKEN CODE:
const fields = [];
fields.push('school_name = ?');
fields.push('latitude = ?');
fields.push('updated_at = CURRENT_TIMESTAMP'); // No parameter!

values.push('School Name');
values.push(40.7128);
values.push(1); // id

// Problem: fields.length = 3, but only 2 have parameters
const query = `UPDATE school_config SET ... WHERE id = $${fields.length + 1}`;
// Results in: WHERE id = $4
// But we only have 3 values!
```

The code was counting `updated_at = CURRENT_TIMESTAMP` as a field with a parameter, but it doesn't have one!

## The Fix

✅ **Fixed in `src/services/locationService.js`**

Changed from:
- Using `?` placeholders and replacing them
- Counting fields incorrectly

To:
- Using `$1, $2, $3...` directly
- Tracking parameter index separately
- Not counting `updated_at` in parameter count

### Fixed Code

```javascript
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

// Add updated_at (no parameter)
updateFields.push('updated_at = CURRENT_TIMESTAMP');

// Add id parameter
values.push(1);
const query = `UPDATE school_config SET ${updateFields.join(', ')} WHERE id = $${paramIndex}`;
```

## Testing

### Test the Fix

1. **Login to admin panel:**
   ```
   https://snhs-student-attendance-monitoring-glw2kktxl.vercel.app/admin
   ```

2. **Go to School Configuration**

3. **Try updating any field:**
   - School Name
   - Latitude
   - Longitude
   - Radius
   - Timezone

4. **Should see success message**

### Test with curl

```bash
curl -X PUT https://snhs-student-attendance-monitoring-glw2kktxl.vercel.app/api/admin/school-config \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "school_name": "Sto. Rosario National High School",
    "latitude": 14.5995,
    "longitude": 120.9842,
    "radius_meters": 150
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "School configuration updated successfully",
  "data": {
    "config": {
      "id": 1,
      "school_name": "Sto. Rosario National High School",
      "latitude": 14.5995,
      "longitude": 120.9842,
      "radius_meters": 150,
      "timezone": "UTC",
      "updated_at": "2024-..."
    }
  }
}
```

## Deployment

Deploy the fix:

```bash
git add src/services/locationService.js
git commit -m "Fix school config update SQL parameter counting"
git push
```

Vercel will automatically deploy the changes.

## What Was Fixed

| File | Issue | Fix |
|------|-------|-----|
| `src/services/locationService.js` | Wrong SQL parameter count | Use paramIndex counter, don't count CURRENT_TIMESTAMP |

## Related Issues Fixed

This was part of the PostgreSQL migration issues. Other related fixes:
- ✅ `src/utils/timezone.js` - Fixed async/await
- ✅ `src/services/attendanceService.js` - Added await calls
- ✅ `src/services/locationService.js` - Fixed SQL placeholders

## Verification Checklist

After deploying:

- [ ] Admin can update school name
- [ ] Admin can update latitude/longitude
- [ ] Admin can update radius
- [ ] Admin can update timezone
- [ ] Changes are saved to database
- [ ] Changes reflect immediately in admin panel
- [ ] Attendance scanning still works with new config

## Debug Logs

The fixed code includes debug logs:
```javascript
console.log('Executing query:', query);
console.log('With values:', values);
```

Check Vercel logs to see the actual SQL being executed if you encounter issues.

## Common Configuration Values

### Philippines (Manila)
```json
{
  "school_name": "Your School Name",
  "latitude": 14.5995,
  "longitude": 120.9842,
  "radius_meters": 100,
  "timezone": "Asia/Manila"
}
```

### Radius Guidelines
- **50m**: Very small school, single building
- **100m**: Small to medium school (recommended)
- **150m**: Medium to large school
- **200m**: Large campus
- **300m+**: Very large campus or multiple buildings

## Troubleshooting

### Still Getting Error?

1. **Check Vercel logs:**
   - Dashboard → Deployments → Functions tab
   - Look for SQL errors

2. **Verify database connection:**
   ```bash
   node check-postgres.sh
   ```

3. **Check school_config table:**
   ```sql
   SELECT * FROM school_config WHERE id = 1;
   ```

4. **Test with minimal update:**
   ```bash
   curl -X PUT .../api/admin/school-config \
     -H "Authorization: Bearer TOKEN" \
     -d '{"school_name":"Test"}'
   ```

### Error: "No valid fields to update"

You're sending an empty request. Include at least one field to update.

### Error: "Latitude must be between -90 and 90"

Check your latitude value. Valid range: -90 to 90.

### Error: "Longitude must be between -180 and 180"

Check your longitude value. Valid range: -180 to 180.
