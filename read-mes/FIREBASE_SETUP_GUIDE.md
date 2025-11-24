# Firebase Cloud Messaging Setup Guide

This guide will help you migrate from Pushy to Firebase Cloud Messaging (FCM) for push notifications.

## Prerequisites

- A Google account
- Access to Firebase Console (https://console.firebase.google.com)

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project" or select an existing project
3. Enter project name (e.g., "School Attendance System")
4. Follow the setup wizard (you can disable Google Analytics if not needed)

## Step 2: Add Android App to Firebase

1. In Firebase Console, click the Android icon to add an Android app
2. Enter the package name: `com.schoolattendance.parent_app`
3. Enter app nickname (optional): "Parent App"
4. Click "Register app"

## Step 3: Download google-services.json

1. Download the `google-services.json` file
2. Place it in: `parent_app/android/app/google-services.json`

**Important:** Add this file to `.gitignore` to keep your Firebase credentials secure!

## Step 4: Get Firebase Service Account Key (Backend)

1. In Firebase Console, go to Project Settings (gear icon)
2. Go to "Service accounts" tab
3. Click "Generate new private key"
4. Save the JSON file as `firebase-service-account.json` in your project root
5. Update `.env` file:
   ```
   FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
   ```

**Important:** Add this file to `.gitignore` to keep your credentials secure!

## Step 5: Update .gitignore

Add these lines to your `.gitignore`:

```
# Firebase credentials
firebase-service-account.json
parent_app/android/app/google-services.json
```

## Step 6: Install Dependencies

### Backend (Node.js)
```bash
npm install
```

### Flutter App
```bash
cd parent_app
flutter pub get
```

## Step 7: Update .env File

Update your `.env` file (copy from `.env.example` if needed):

```env
# Firebase Configuration
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
```

Remove the old Pushy configuration:
```env
# Remove this line:
# PUSHY_API_KEY=your-pushy-api-key
```

## Step 8: Test the Setup

### Test Backend
```bash
npm start
```

The server should log: "Firebase Admin SDK initialized successfully"

### Test Flutter App
```bash
cd parent_app
flutter run
```

After login, check the logs for: "FCM device token: ..."

## Step 9: Configure Android Notification Channel

The app automatically creates a notification channel called "attendance_notifications". You can customize this in the notification service if needed.

## Troubleshooting

### "Firebase not initialized" error
- Verify `firebase-service-account.json` exists and path is correct in `.env`
- Check file permissions
- Restart the server

### "google-services.json not found" error
- Verify the file is in `parent_app/android/app/google-services.json`
- Run `flutter clean` and rebuild

### No FCM token received
- Check Android permissions in AndroidManifest.xml
- Verify google-services.json package name matches your app
- Check device has Google Play Services installed

### Notifications not received
- Verify FCM token is registered with backend
- Check server logs for send errors
- Test with Firebase Console's "Cloud Messaging" test feature

## Key Differences from Pushy

1. **Token Format**: FCM tokens are longer and different format
2. **Data Payload**: All values must be strings in FCM
3. **Permissions**: FCM requires explicit permission request on Android 13+
4. **Background Handler**: Must be a top-level function in Flutter
5. **Service Account**: Backend uses Firebase Admin SDK with service account

## Security Notes

- Never commit `firebase-service-account.json` or `google-services.json`
- Rotate service account keys periodically
- Use environment variables for sensitive configuration
- Restrict API keys in Firebase Console to your app's package name

## Additional Resources

- [Firebase Cloud Messaging Documentation](https://firebase.google.com/docs/cloud-messaging)
- [FlutterFire Documentation](https://firebase.flutter.dev/docs/messaging/overview)
- [Firebase Admin SDK for Node.js](https://firebase.google.com/docs/admin/setup)
