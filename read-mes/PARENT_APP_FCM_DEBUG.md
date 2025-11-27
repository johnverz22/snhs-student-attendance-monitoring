# 🔧 Parent App FCM Token Registration - Debug Guide

## Issue
Parent app is not registering FCM token after login.

## Changes Made
Added detailed debug logging to identify the issue.

### Files Updated:
1. `parent_app/lib/screens/main_navigation.dart` - Better error logging
2. `parent_app/lib/services/notification_service.dart` - FCM token request logging

## How to Debug

### Step 1: Rebuild the Parent App
```bash
cd parent_app

# Clean build
flutter clean
flutter pub get

# Build and install
flutter run --release
# OR
flutter build apk --release
# Then install the APK on your phone
```

### Step 2: Check Logs After Login

After logging in, you should see these logs in order:

**✅ Success Flow:**
```
🔔 Initializing notification service...
User granted notification permission
📱 Requesting FCM token from Firebase...
✅ FCM device token received: fK8xN2pQR3y:APA91bH_xxxxxxxxxx...
✅ Notification service initialized
🔑 Registering device token with backend...
✅ Device token registered successfully
```

**❌ Error Scenarios:**

**Scenario 1: Firebase Not Initialized**
```
❌ Error initializing notifications: [firebase_core/no-app] No Firebase App...
```
**Fix:** Firebase.initializeApp() failed. Check google-services.json

**Scenario 2: FCM Token is Null**
```
📱 Requesting FCM token from Firebase...
❌ FCM token is null! Firebase might not be configured properly.
   Check: google-services.json (Android) or GoogleService-Info.plist (iOS)
```
**Fix:** Firebase project not configured correctly

**Scenario 3: Permission Denied**
```
User declined or has not accepted notification permission
```
**Fix:** User needs to allow notifications

**Scenario 4: Backend Registration Failed**
```
🔑 Registering device token with backend...
❌ Failed to register device token
```
**Fix:** Check network connection and backend API

### Step 3: View Logs

**Android (via USB debugging):**
```bash
# View all logs
adb logcat | grep -i flutter

# View only debug prints
adb logcat | grep "D/flutter"

# Clear and view fresh logs
adb logcat -c && adb logcat | grep flutter
```

**Android (via Android Studio):**
1. Open Android Studio
2. Run → Flutter Run
3. View logs in "Run" tab at bottom

**iOS (via Xcode):**
1. Open Xcode
2. Window → Devices and Simulators
3. Select your device
4. View device logs

### Step 4: Common Issues & Fixes

#### Issue 1: google-services.json Not Found or Invalid

**Check:**
```bash
ls -la parent_app/android/app/google-services.json
```

**Should contain:**
```json
{
  "project_info": {
    "project_number": "...",
    "project_id": "your-firebase-project",
    ...
  },
  "client": [
    {
      "client_info": {
        "mobilesdk_app_id": "1:...:android:...",
        "android_client_info": {
          "package_name": "com.school.parent_app"
        }
      },
      ...
    }
  ]
}
```

**Fix:** Download correct google-services.json from Firebase Console

#### Issue 2: Package Name Mismatch

**Check package name in:**
```
parent_app/android/app/build.gradle
```

Should match package name in google-services.json:
```gradle
defaultConfig {
    applicationId "com.school.parent_app"  // Must match Firebase
    ...
}
```

#### Issue 3: Firebase Dependencies Missing

**Check:**
```
parent_app/pubspec.yaml
```

Should have:
```yaml
dependencies:
  firebase_core: ^2.24.2
  firebase_messaging: ^14.7.9
```

**Fix:**
```bash
cd parent_app
flutter pub add firebase_core firebase_messaging
flutter pub get
```

#### Issue 4: Permissions Not Granted

**Android:** Check AndroidManifest.xml
```xml
<uses-permission android:name="android.permission.INTERNET"/>
<uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
```

**iOS:** Check Info.plist has notification permissions

#### Issue 5: Firebase Not Initialized in main.dart

**Check:**
```dart
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();  // ← Must be here
  runApp(const ParentApp());
}
```

### Step 5: Manual Test

If automatic registration fails, you can manually test:

1. Get FCM token from logs
2. Manually register via API:

```bash
# Login as parent
curl -X POST "https://snhs-student-attendance-monitoring.vercel.app/api/auth/parent/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"parent@gmail.com","password":"Password1"}'

# Copy the accessToken from response

# Register FCM token
curl -X POST "https://snhs-student-attendance-monitoring.vercel.app/api/parent/device-token" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"deviceToken":"YOUR_FCM_TOKEN_HERE","platform":"android"}'
```

## Expected Result

After successful setup:

1. **App logs show:**
   ```
   ✅ FCM device token received: fK8xN2pQR3y:APA91bH...
   ✅ Device token registered successfully
   ```

2. **Database has token:**
   ```sql
   SELECT * FROM push_tokens WHERE parent_id = 2;
   -- Should show real FCM token, not test token
   ```

3. **Vercel logs show (after QR scan):**
   ```
   Push notification sent successfully to fK8xN2pQR3y:APA91bH...
   Attendance notifications: 1 sent, 0 failed
   ```

4. **Parent receives notification!**

## Troubleshooting Checklist

- [ ] google-services.json exists in parent_app/android/app/
- [ ] Package name matches between build.gradle and google-services.json
- [ ] Firebase dependencies in pubspec.yaml
- [ ] Firebase.initializeApp() in main.dart
- [ ] Notification permissions granted
- [ ] App rebuilt after changes
- [ ] Logs show FCM token received
- [ ] Logs show token registered with backend
- [ ] Database has real FCM token (not test token)

## Next Steps

1. Rebuild parent app with new logging
2. Install on phone
3. Login and check logs
4. Share the logs here if still not working
5. We'll identify the exact issue from the logs

---

**Status:** Debug logging added  
**Next:** Rebuild app and check logs  
**Date:** November 26, 2025
