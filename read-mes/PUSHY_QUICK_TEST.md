# Quick Pushy Test Guide

## ✅ Your Setup is Ready!

**Backend**: API Key configured and valid
**Parent App**: App ID "app" configured in AndroidManifest.xml

## Quick Test (5 minutes)

### 1. Build APK
```bash
cd parent_app
flutter build apk --release
```

### 2. Install on Phone
- Copy `parent_app/build/app/outputs/flutter-apk/app-release.apk` to phone
- Install it
- Make sure phone is on same WiFi (192.168.100.x network)

### 3. Login
- Open app
- Register or login with test account
- App will automatically register for push notifications

### 4. Get Device Token
Option A - From phone logs (if connected via USB):
```bash
flutter logs | grep "Pushy device token"
```

Option B - From database:
```bash
sqlite3 data/attendance.db "SELECT device_token FROM push_tokens ORDER BY id DESC LIMIT 1;"
```

### 5. Send Test Notification
```bash
node src/scripts/sendTestPushNotification.js <paste-device-token-here>
```

### 6. Check Phone
- You should see a notification appear!
- Open app → Notifications tab
- Badge should show "1"

## ⚠️ Important

- **MUST use physical device** (emulators don't support Pushy)
- Phone needs internet connection
- Backend server must be running (`npm start`)

## If It Doesn't Work

1. Check backend is running: `curl http://localhost:3000/api/health`
2. Verify API key: `node src/scripts/verifyPushySetup.js`
3. Check phone can reach server: Open app and try to login
4. Look at backend logs for errors

## Success Indicators

✅ App logs show: "Pushy device token: ..."
✅ Database has entry: `SELECT * FROM push_tokens;`
✅ Test script says: "Notification sent successfully!"
✅ Phone receives notification
✅ App shows notification in notifications tab

That's it! Your Pushy setup is verified and ready to use.
