# Firebase Cloud Messaging - Quick Reference

## Setup (One-time)

1. **Get Firebase Files**
   - `google-services.json` → `parent_app/android/app/`
   - `firebase-service-account.json` → project root

2. **Update .env**
   ```env
   FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
   ```

3. **Install**
   ```bash
   npm install
   cd parent_app && flutter pub get
   ```

## Testing Notifications

### Send Test from Backend
```javascript
const notificationService = require('./src/services/notificationService');

// Test notification
await notificationService.testNotification('FCM_TOKEN_HERE');
```

### Check FCM Token (Flutter)
Look for this in app logs after login:
```
FCM device token: [long token string]
```

### Manual Test via Firebase Console
1. Go to Firebase Console → Cloud Messaging
2. Click "Send test message"
3. Paste FCM token
4. Send

## Common Issues

### Backend: "Firebase not initialized"
```bash
# Check file exists
ls firebase-service-account.json

# Check .env
cat .env | grep FIREBASE

# Restart server
npm start
```

### Flutter: No token received
```bash
# Clean and rebuild
cd parent_app
flutter clean
flutter pub get
flutter run
```

### Notifications not showing
- Check Android notification permissions
- Verify token is registered with backend
- Check server logs for send errors

## Code Snippets

### Register Token (Flutter)
```dart
final notificationService = Provider.of<NotificationService>(context);
await notificationService.initialize();
await notificationService.registerDeviceToken(authToken);
```

### Send Notification (Backend)
```javascript
await notificationService.sendAttendanceNotification(studentId, {
  studentName: 'John Doe',
  entryTime: new Date().toISOString(),
  gateName: 'Main Gate',
  attendanceId: 123
});
```

## File Locations

```
project-root/
├── firebase-service-account.json          # Backend credentials
├── .env                                   # Config
└── parent_app/
    ├── android/app/google-services.json   # Android credentials
    └── lib/services/notification_service.dart
```

## Important Notes

- FCM tokens are device-specific and can change
- All data values must be strings in FCM
- Background handler must be top-level function
- Tokens expire and refresh automatically
- Free tier: 10M messages/month

## Quick Commands

```bash
# Start backend
npm start

# Run Flutter app
cd parent_app && flutter run

# Check logs
tail -f logs/app.log

# Test notification endpoint
curl -X POST http://localhost:3000/api/parent/test-notification \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```
