# Timezone Handling Guide

## Problem Summary

The attendance system was experiencing timezone confusion due to inconsistent handling of timestamps between:
- Database storage (PostgreSQL TIMESTAMP fields)
- Backend logging (UTC timestamps)
- Mobile app display (local timezone conversion)
- Server timezone vs configured school timezone

## Solution: Consistent "Naive" Timestamp Approach

### Core Strategy

1. **Database Storage**: Store "naive" timestamps (no timezone info) in the configured school timezone
2. **Logging**: Use UTC timestamps for consistent server logs
3. **Mobile Apps**: Display stored timestamps as-is without conversion
4. **No Double Conversion**: Eliminate timezone conversion confusion

### Implementation Details

#### Backend (`src/utils/timezone.js`)

```javascript
// Store attendance time in configured timezone (e.g., Philippine time)
getCurrentTimestamp() → "2025-12-10T19:39:29.027" (no Z suffix)

// Log server events in UTC for consistency
getCurrentLogTimestamp() → "2025-12-10T11:39:29.025Z"

// Convert client UTC time to local storage format
convertToLocalStorage(utcTime) → naive local timestamp

// Display stored time (already in correct timezone)
convertToLocalTime(dbTime) → formatted display time
```

#### Database Schema

```sql
-- PostgreSQL TIMESTAMP (without timezone)
entry_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

**Note**: `CURRENT_TIMESTAMP` returns server time, but our app explicitly sets the time using `getCurrentTimestamp()` which returns the configured timezone.

#### Mobile Apps (Dart)

```dart
// Parse stored timestamp without timezone conversion
final entryTime = DateTime.parse(timeString); // No .toUtc() call
```

### Benefits

1. **No Double Conversion**: Eliminates confusion about whether time is UTC or local
2. **Consistent Display**: Mobile apps show exactly what was stored
3. **Clear Logging**: Server logs always use UTC for debugging
4. **Timezone Independence**: Works regardless of server timezone
5. **Simple Logic**: Straightforward conversion rules

### Migration Notes

- Existing data in database may need timezone adjustment if previously stored in UTC
- Mobile apps updated to remove `.toUtc()` conversion
- All logging statements now use `getCurrentLogTimestamp()` for consistency

### Testing

Run the timezone test to verify consistency:

```bash
node test-timezone-handling.js
```

### Key Functions

| Function | Purpose | Returns |
|----------|---------|---------|
| `getCurrentTimestamp()` | Database storage | Naive local timestamp |
| `getCurrentLogTimestamp()` | Server logging | UTC timestamp |
| `convertToLocalTime()` | Display formatting | ISO string for display |
| `convertToLocalStorage()` | Client→DB conversion | Naive local timestamp |
| `formatTimestamp()` | Human-readable format | "YYYY-MM-DD HH:MM:SS" |

### Example Flow

1. **Student scans QR code**:
   - Mobile app sends UTC timestamp: `2025-12-10T11:39:29.027Z`
   - Backend converts to local: `2025-12-10T19:39:29.027` (Philippine time)
   - Database stores: `2025-12-10T19:39:29.027`

2. **Parent views attendance**:
   - Database returns: `2025-12-10T19:39:29.027`
   - Mobile app displays: `Dec 10, 2025 at 07:39 PM`

3. **Server logging**:
   - All logs use UTC: `[2025-12-10T11:39:29.025Z] Attendance logged...`

This approach ensures that when apps give current time as local time, you don't need to worry about conversion - the database saves the correct local time, and mobile apps display it correctly.