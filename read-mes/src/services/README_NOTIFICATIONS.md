# Push Notification Service

This document describes the push notification service implementation using Firebase Cloud Messaging (FCM).

## Overview

The notification service handles real-time push notifications to parent devices when students log attendance. It includes:

- Device token registration and management
- Push notification delivery via Firebase Cloud Messaging
- Automatic retry logic for failed notifications
- Notification triggering on successful attendance logs

## Configuration

### 1. Setup Firebase

1. Create a Firebase project at https://console.firebase.google.com
2. Add Android app with package name: `com.schoolattendance.parent_app`
3. Download `google-services.json` → place in `parent_app/android/app/`
4. Generate service account key → save as `firebase-service-account.json`
5. See `FIREBASE_SETUP_GUIDE.md` for detailed instructions

### 2. Configure Environment Variable

Add Firebase configuration to the `.env` file:

```env
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
```

## API Endpoints

### Register Device Token

Register a device for push notifications.

**Endpoint:** `POST /api/parent/device-token`

**Authentication:** Required (Parent JWT token)

**Request Body:**
```json
{
  "deviceToken": "fcm_device_token_from_mobile_app",
  "platform": "android"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Device token registered successfully",
  "tokenId": 1
}
```

### Unregister Device Token

Unregister a device from push notifications.

**Endpoint:** `DELETE /api/parent/device-token`

**Authentication:** Required (Parent JWT token)

**Request Body:**
```json
{
  "deviceToken": "fcm_device_token_from_mobile_app"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Device token unregistered successfully"
}
```

## Notification Flow

1. **Student scans QR code** → Attendance logged successfully
2. **Server triggers notification** → `sendAttendanceNotification()` called
3. **Find linked parents** → Query parent_student_links table
4. **Get device tokens** → Retrieve active tokens for each parent
5. **Send notifications** → Call Firebase Admin SDK for each device token
6. **Retry on failure** → Up to 3 retry attempts with exponential backoff
7. **Log results** → Track success/failure for monitoring

## Notification Payload

When a student logs attendance, parents receive a notification with:

**Notification:**
```json
{
  "title": "Student Arrival",
  "body": "John Doe arrived at school at 8:30 AM"
}
```

**Data (all values as strings):**
```json
{
  "type": "attendance",
  "studentId": "123",
  "studentName": "John Doe",
  "entryTime": "2024-11-18T08:30:15Z",
  "gateName": "Main Gate",
  "attendanceId": "456",
  "timestamp": "2024-11-18T08:30:15Z"
}
```

**Platform-specific:**
```json
{
  "android": {
    "priority": "high",
    "notification": {
      "sound": "default",
      "channelId": "attendance_notifications"
    }
  },
  "apns": {
    "payload": {
      "aps": {
        "sound": "default",
        "badge": 1
      }
    }
  }
}
```

## Service Methods

### `registerDeviceToken(parentId, deviceToken, platform)`

Register a device token for push notifications.

**Parameters:**
- `parentId` (number): Parent's database ID
- `deviceToken` (string): FCM device token
- `platform` (string): 'ios' or 'android'

**Returns:** Registration result object

### `unregisterDeviceToken(parentId, deviceToken)`

Unregister a device token.

**Parameters:**
- `parentId` (number): Parent's database ID
- `deviceToken` (string): Device token to unregister

**Returns:** Unregistration result object

### `sendAttendanceNotification(studentId, attendanceData)`

Send attendance notification to all linked parents.

**Parameters:**
- `studentId` (number): Student's database ID
- `attendanceData` (object): Attendance log data

**Returns:** Notification result with success/failure counts

### `sendPushNotificationWithRetry(deviceToken, notification, data, retryCount)`

Send push notification with automatic retry logic.

**Parameters:**
- `deviceToken` (string): Target FCM device token
- `notification` (object): Notification payload
- `data` (object): Additional data payload (all values converted to strings)
- `retryCount` (number): Current retry attempt (default: 0)

**Returns:** Send result object

## Retry Logic

The service implements exponential backoff for failed notifications:

- **Max retries:** 3 attempts
- **Initial delay:** 1 second
- **Backoff:** Exponential (1s, 2s, 4s)
- **Total max time:** ~7 seconds

## Error Handling

### Common Errors

| Error Code | Description | Solution |
|------------|-------------|----------|
| `FIREBASE_NOT_INITIALIZED` | Firebase Admin SDK not initialized | Check service account path in .env |
| `messaging/invalid-registration-token` | Invalid FCM token | Token should be removed from database |
| `messaging/registration-token-not-registered` | Token no longer registered | Token should be removed from database |
| `messaging/invalid-argument` | Invalid message payload | Check data values are strings |

### Failure Logging

Failed notifications are logged with:
- Timestamp
- Parent ID
- Device token
- Error code and message

Example log:
```
[2024-11-18T08:30:15Z] Notification failure: parent=123, token=abc123, error=messaging/invalid-registration-token
```

## Database Schema

### push_tokens Table

```sql
CREATE TABLE push_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  parent_id INTEGER NOT NULL,
  device_token TEXT NOT NULL,
  platform TEXT NOT NULL,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE,
  UNIQUE(parent_id, device_token)
);
```

## Testing

### Test Notification Service

Run the notification service test:

```bash
node src/scripts/testNotificationService.js
```

This tests:
- Device token registration
- Duplicate token handling
- Token retrieval
- Notification sending
- Attendance notifications
- Token unregistration

### Test Parent Endpoints

Start the server and run:

```bash
npm start
# In another terminal:
node src/scripts/testParentEndpoints.js
```

## Mobile App Integration

### Flutter (Parent App)

1. **Install Firebase packages:**
```yaml
dependencies:
  firebase_core: ^3.6.0
  firebase_messaging: ^15.1.3
```

2. **Initialize Firebase:**
```dart
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

// Initialize Firebase
await Firebase.initializeApp();

// Request permissions
NotificationSettings settings = await FirebaseMessaging.instance.requestPermission();

// Get FCM token
String? token = await FirebaseMessaging.instance.getToken();

// Register with backend
await api.registerDeviceToken(token, 'android');
```

3. **Handle notifications:**
```dart
// Foreground messages
FirebaseMessaging.onMessage.listen((RemoteMessage message) {
  print('Received notification: ${message.data}');
  
  if (message.data['type'] == 'attendance') {
    showAttendanceNotification(
      studentName: message.data['studentName'],
      entryTime: message.data['entryTime'],
      gateName: message.data['gateName'],
    );
  }
});

// Background/terminated app opened via notification
FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
  // Handle notification tap
  navigateToAttendanceDetails(message.data);
});
```

4. **Background message handler (top-level function):**
```dart
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  print('Background message: ${message.messageId}');
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
  runApp(MyApp());
}
```

## Monitoring

### Success Metrics

Monitor these metrics for notification health:

- **Delivery rate:** Successful notifications / Total attempts
- **Retry rate:** Notifications requiring retries / Total notifications
- **Failure rate:** Failed notifications / Total attempts
- **Average latency:** Time from attendance log to notification delivery

### Logs to Monitor

```bash
# Successful notifications
grep "Push notification sent successfully" logs/app.log

# Failed notifications
grep "Notification failure" logs/app.log

# Retry attempts
grep "Retrying notification" logs/app.log

# Firebase initialization
grep "Firebase Admin SDK initialized" logs/app.log
```

## Troubleshooting

### Notifications not received

1. **Check Firebase setup:** Verify service account JSON exists and is valid
2. **Check device token:** Ensure token is registered and active
3. **Check parent-student link:** Verify relationship exists
4. **Check logs:** Look for error messages in server logs
5. **Test from Firebase Console:** Use Cloud Messaging test feature

### High failure rate

1. **Verify service account:** Check Firebase Console for valid credentials
2. **Check token validity:** FCM tokens can expire or become invalid
3. **Validate data payload:** Ensure all values are strings
4. **Check network:** Verify server can reach Firebase APIs

### Duplicate notifications

1. **Check token registration:** Ensure no duplicate tokens
2. **Check parent links:** Verify no duplicate parent-student links
3. **Check attendance logs:** Ensure no duplicate attendance entries

### "Firebase not initialized" error

1. **Check file path:** Verify FIREBASE_SERVICE_ACCOUNT_PATH in .env
2. **Check file exists:** Ensure firebase-service-account.json is present
3. **Check file format:** Verify JSON is valid
4. **Restart server:** Firebase initializes on startup

## Best Practices

1. **Token Management:**
   - Unregister tokens when user logs out
   - Reactivate tokens on re-login
   - Clean up invalid tokens (FCM will report them)
   - Handle token refresh in mobile app

2. **Error Handling:**
   - Always use retry logic for transient failures
   - Log all failures for monitoring
   - Don't block attendance logging on notification failures
   - Remove invalid tokens from database

3. **Performance:**
   - Send notifications asynchronously
   - Don't wait for notification delivery before responding
   - Use Firebase Admin SDK connection pooling
   - Convert all data values to strings before sending

4. **Security:**
   - Never commit service account JSON to version control
   - Never expose service account to clients
   - Validate device tokens before registration
   - Verify parent-student relationships before sending
   - Restrict API keys in Firebase Console

## Key Differences from Pushy

1. **Token Format:** FCM tokens are longer JWT-like strings
2. **Data Payload:** All values must be strings in FCM
3. **Permissions:** Explicit permission request required on Android 13+
4. **Background Handler:** Must be top-level function in Flutter
5. **Setup:** Requires google-services.json and service account
6. **Cost:** Free tier with generous limits

## References

- [Firebase Cloud Messaging Documentation](https://firebase.google.com/docs/cloud-messaging)
- [Firebase Admin SDK for Node.js](https://firebase.google.com/docs/admin/setup)
- [FlutterFire Messaging](https://firebase.flutter.dev/docs/messaging/overview)
- [FCM HTTP v1 API](https://firebase.google.com/docs/reference/fcm/rest/v1/projects.messages)
