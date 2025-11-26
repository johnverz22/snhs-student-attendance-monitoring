# 📱 Push Notification Setup Guide

## Why You Didn't Receive a Notification

When student **John Doe (ID: 1001)** scanned the QR code, the attendance was successfully logged, but **no push notification was sent** because:

### ❌ Missing Requirements:
1. **No parent account linked** to student 1001
2. **No FCM device token registered** (parent hasn't logged into mobile app)
3. Parent needs to register and link to the student

---

## 🔄 How Push Notifications Work

```
┌─────────────────────────────────────────────────────────────────┐
│                    Push Notification Flow                        │
└─────────────────────────────────────────────────────────────────┘

1. Student scans QR code
   ↓
2. Backend validates QR + GPS location
   ↓
3. Attendance logged to database
   ↓
4. Backend checks: "Does this student have linked parents?"
   ├─ NO → Skip notification (current situation)
   └─ YES → Continue to step 5
   ↓
5. Backend queries: "What are the parent's FCM device tokens?"
   ├─ NO TOKENS → Skip notification
   └─ HAS TOKENS → Continue to step 6
   ↓
6. Backend sends notification via Firebase Cloud Messaging
   ↓
7. Parent receives push notification on their phone
   "John Doe arrived at school at 3:45 PM"
```

---

## ✅ Setup Steps to Enable Notifications

### Step 1: Create Parent Account

**Option A: Via Parent Mobile App**
1. Open Parent mobile app
2. Tap "Register"
3. Fill in details:
   - Name: Parent's name
   - Email: parent@example.com
   - Password: Password123
   - Phone: 1234567890
   - Student ID: **1001** (John Doe)
   - Relationship: Parent/Guardian

**Option B: Via API (for testing)**
```bash
curl -X POST "https://snhs-student-attendance-monitoring.vercel.app/api/auth/parent/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Parent",
    "email": "parent.john@example.com",
    "password": "Password123",
    "phone": "1234567890",
    "studentIds": ["1001"],
    "relationships": ["Parent"]
  }'
```

### Step 2: Parent Logs Into Mobile App

1. Parent opens the Parent mobile app
2. Logs in with credentials
3. **App automatically registers FCM device token** with backend
4. Token stored in `push_tokens` table

### Step 3: Grant Notification Permissions

- Android: Allow notifications when prompted
- iOS: Allow notifications when prompted
- Ensure app has notification permission in phone settings

### Step 4: Test the Setup

1. Student scans QR code again
2. Parent should receive notification within seconds
3. Notification shows:
   - Title: "Student Arrival"
   - Body: "John Doe arrived at school at [time]"
   - Data: Gate name, entry time, attendance ID

---

## 🔧 Technical Details

### Backend Code Flow

**File: `src/services/attendanceService.js`**
```javascript
// After attendance is logged successfully
this.sendAttendanceNotification(studentId, attendanceResult.data).catch(error => {
  console.error('Failed to send attendance notification:', error);
});
```

**File: `src/services/notificationService.js`**
```javascript
async sendAttendanceNotification(studentId, attendanceData) {
  // 1. Get parent IDs linked to this student
  const parentLinks = await queryAll(`
    SELECT parent_id FROM parent_student_links
    WHERE student_id = $1
  `, [studentId]);

  if (parentLinks.length === 0) {
    console.log('No parents linked, skipping notification');
    return;
  }

  // 2. Get FCM device tokens for each parent
  for (const link of parentLinks) {
    const tokens = await this.getParentDeviceTokens(link.parent_id);
    
    // 3. Send notification to each device
    for (const token of tokens) {
      await this.sendPushNotificationWithRetry(
        token.deviceToken,
        notification,
        data
      );
    }
  }
}
```

### Database Tables Involved

**`parent_student_links`** - Links parents to students
```sql
parent_id | student_id | relationship
----------|------------|-------------
1         | 1          | Parent
```

**`push_tokens`** - Stores FCM device tokens
```sql
id | parent_id | device_token | platform | is_active
---|-----------|--------------|----------|----------
1  | 1         | fcm_token... | android  | true
```

### Firebase Configuration

Backend requires Firebase Admin SDK credentials:

**Environment Variable (Vercel):**
```
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"..."}
```

**Local Development:**
```javascript
// config/index.js
firebase: {
  serviceAccountPath: './firebase-service-account.json'
}
```

---

## 📊 Notification Payload

When a notification is sent, it includes:

**Notification:**
```json
{
  "title": "Student Arrival",
  "body": "John Doe arrived at school at 3:45 PM",
  "sound": "default"
}
```

**Data:**
```json
{
  "type": "attendance",
  "studentId": "1",
  "studentName": "John Doe",
  "entryTime": "2025-11-26T19:45:45.451Z",
  "gateName": "Gate 1",
  "attendanceId": "1",
  "timestamp": "2025-11-26T19:45:45.451Z"
}
```

---

## 🧪 Testing Notifications

### Test 1: Check if Parent is Linked
```bash
# Login as admin
curl -X POST "https://snhs-student-attendance-monitoring.vercel.app/api/auth/admin/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"gogoSNHS123"}'

# Search for student
curl -X GET "https://snhs-student-attendance-monitoring.vercel.app/api/admin/students/search?query=1001" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Test 2: Check Parent's Device Tokens
```bash
# Login as parent
curl -X POST "https://snhs-student-attendance-monitoring.vercel.app/api/auth/parent/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"parent@example.com","password":"Password123"}'

# Check if token is registered (done automatically by app)
```

### Test 3: Send Test Notification
```bash
# Via admin panel or API
POST /api/admin/test-notification
{
  "deviceToken": "FCM_TOKEN_HERE"
}
```

---

## 🐛 Troubleshooting

### Issue: No notification received

**Check 1: Is parent linked to student?**
- Query `parent_student_links` table
- Ensure student_id matches

**Check 2: Does parent have active device token?**
- Query `push_tokens` table
- Check `is_active = true`

**Check 3: Is Firebase configured?**
- Check backend logs for Firebase initialization
- Verify `FIREBASE_SERVICE_ACCOUNT` env var

**Check 4: Are notifications enabled on phone?**
- Check app notification settings
- Check phone notification settings

### Issue: Notification sent but not received

**Possible causes:**
- Invalid FCM token (expired or revoked)
- Phone is offline
- App is force-stopped
- Battery optimization blocking notifications
- Firebase project misconfigured

### Backend Logs to Check

```
[2025-11-26T19:45:45.451Z] Attendance logged: student=1, gate=Gate 1
[2025-11-26T19:45:45.500Z] No parents linked to student 1, skipping notification
```

or

```
[2025-11-26T19:45:45.451Z] Attendance logged: student=1, gate=Gate 1
[2025-11-26T19:45:45.500Z] Push notification sent successfully to fcm_token...
[2025-11-26T19:45:45.600Z] Attendance notifications: 1 sent, 0 failed
```

---

## 📱 Parent App Integration

The Parent mobile app must implement:

### 1. FCM Token Registration
```dart
// When parent logs in
final fcmToken = await FirebaseMessaging.instance.getToken();

// Register with backend
await http.post(
  Uri.parse('$baseUrl/parent/device-token'),
  headers: {'Authorization': 'Bearer $token'},
  body: jsonEncode({
    'deviceToken': fcmToken,
    'platform': Platform.isAndroid ? 'android' : 'ios',
  }),
);
```

### 2. Handle Incoming Notifications
```dart
FirebaseMessaging.onMessage.listen((RemoteMessage message) {
  // Show notification when app is in foreground
  showNotification(
    title: message.notification?.title,
    body: message.notification?.body,
    data: message.data,
  );
});
```

### 3. Handle Notification Tap
```dart
FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
  // Navigate to attendance details
  if (message.data['type'] == 'attendance') {
    navigateToAttendanceDetails(message.data['attendanceId']);
  }
});
```

---

## ✅ Summary

**Current Status:**
- ✅ Attendance logging works perfectly
- ✅ Backend notification code is implemented
- ❌ No parent linked to student 1001
- ❌ No FCM tokens registered

**To Enable Notifications:**
1. Create parent account
2. Link parent to student 1001
3. Parent logs into mobile app
4. App registers FCM token
5. Future scans will trigger notifications

**No separate API route needed** - notifications are sent automatically after successful attendance logging!

---

**Last Updated:** November 26, 2025  
**Student:** John Doe (ID: 1001)  
**Status:** Attendance working, notifications pending parent setup
