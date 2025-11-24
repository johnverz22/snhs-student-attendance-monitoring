# Firebase Cloud Messaging Setup Checklist

Use this checklist to ensure proper FCM setup after migration from Pushy.

## ✅ Pre-Setup

- [ ] Read `MIGRATION_COMPLETE.md`
- [ ] Read `FIREBASE_SETUP_GUIDE.md`
- [ ] Have Google account ready
- [ ] Have Firebase Console access

## ✅ Firebase Console Setup

- [ ] Created/selected Firebase project
- [ ] Added Android app to project
- [ ] Used package name: `com.schoolattendance.parent_app`
- [ ] Downloaded `google-services.json`
- [ ] Generated service account private key
- [ ] Saved as `firebase-service-account.json`

## ✅ File Placement

- [ ] `google-services.json` → `parent_app/android/app/google-services.json`
- [ ] `firebase-service-account.json` → project root
- [ ] Both files added to `.gitignore`
- [ ] Both files NOT committed to git

## ✅ Configuration

- [ ] Updated `.env` with `FIREBASE_SERVICE_ACCOUNT_PATH`
- [ ] Removed old `PUSHY_API_KEY` from `.env`
- [ ] Verified `.env.example` is updated
- [ ] Checked `.gitignore` includes Firebase files

## ✅ Backend Setup

- [ ] Ran `npm install`
- [ ] Verified `firebase-admin` in `package.json`
- [ ] Started server: `npm start`
- [ ] Saw log: "Firebase Admin SDK initialized successfully"
- [ ] No errors in server logs

## ✅ Flutter App Setup

- [ ] Ran `cd parent_app && flutter pub get`
- [ ] Verified `firebase_core` and `firebase_messaging` in `pubspec.yaml`
- [ ] Ran `flutter clean`
- [ ] Built app: `flutter build apk` or `flutter run`
- [ ] No build errors

## ✅ Testing - First Run

- [ ] Installed app on physical device
- [ ] Opened app
- [ ] Logged in with parent credentials
- [ ] Checked logs for "FCM device token: ..."
- [ ] Token appears (150+ characters)
- [ ] No errors in app logs

## ✅ Testing - Token Registration

- [ ] Token automatically registered with backend
- [ ] Checked database: `SELECT * FROM push_tokens;`
- [ ] Token exists in database
- [ ] Token matches app logs
- [ ] `is_active` = 1

## ✅ Testing - Notifications

### Test 1: Script Test
- [ ] Got FCM token from logs or database
- [ ] Ran: `node src/scripts/sendTestPushNotification.js <token>`
- [ ] Saw "Notification sent successfully"
- [ ] Received notification on device

### Test 2: Firebase Console Test
- [ ] Opened Firebase Console → Cloud Messaging
- [ ] Clicked "Send test message"
- [ ] Pasted FCM token
- [ ] Sent test notification
- [ ] Received notification on device

### Test 3: Attendance Notification
- [ ] Logged attendance for linked student
- [ ] Parent received notification
- [ ] Notification shows correct student name
- [ ] Notification shows correct time
- [ ] Tapping notification opens app

## ✅ Testing - Different States

### Foreground (App Open)
- [ ] App is open and visible
- [ ] Sent test notification
- [ ] Notification appears in app
- [ ] Notification added to history

### Background (App Minimized)
- [ ] App is minimized
- [ ] Sent test notification
- [ ] Notification appears in system tray
- [ ] Tapping opens app

### Terminated (App Closed)
- [ ] Force-closed app
- [ ] Sent test notification
- [ ] Notification appears in system tray
- [ ] Tapping opens app

## ✅ Diagnostics (If Issues)

- [ ] Ran: `node src/scripts/diagnoseFCMIssue.js`
- [ ] Reviewed diagnostic output
- [ ] Fixed any reported issues
- [ ] Re-tested after fixes

## ✅ Cleanup

- [ ] Removed old Pushy tokens from database (optional)
- [ ] Cleared old app data on test devices
- [ ] Updated any custom documentation
- [ ] Informed team of migration

## ✅ Production Readiness

- [ ] All tests passing
- [ ] No errors in logs
- [ ] Notifications working reliably
- [ ] Multiple devices tested
- [ ] Both Android platforms tested (if applicable)
- [ ] Token refresh tested (reinstall app)
- [ ] Logout/login tested

## 🚨 Common Issues

### "Firebase not initialized"
- Check `FIREBASE_SERVICE_ACCOUNT_PATH` in `.env`
- Verify `firebase-service-account.json` exists
- Check JSON file is valid
- Restart server

### "No FCM token"
- Check `google-services.json` is in correct location
- Verify package name matches
- Run `flutter clean && flutter pub get`
- Reinstall app

### "Invalid registration token"
- Token might be from old Pushy setup
- Clear app data and login again
- Check token length (should be 150+ chars)
- Verify app has Firebase initialized

### "Notifications not received"
- Check device notification permissions
- Verify token is registered in database
- Test from Firebase Console directly
- Check device has internet connection
- Ensure app has been opened at least once

## 📚 Reference Documents

- `FIREBASE_SETUP_GUIDE.md` - Detailed setup instructions
- `FCM_QUICK_REFERENCE.md` - Quick commands and tips
- `MIGRATION_COMPLETE.md` - Migration summary
- `src/services/README_NOTIFICATIONS.md` - Service documentation

## 🎉 Success Criteria

You're ready for production when:
- ✅ Backend starts without errors
- ✅ Firebase Admin SDK initializes
- ✅ App generates FCM tokens
- ✅ Tokens register with backend
- ✅ Test notifications work
- ✅ Attendance notifications work
- ✅ Notifications work in all app states
- ✅ Multiple devices tested successfully

## 📞 Need Help?

1. Check diagnostic script: `node src/scripts/diagnoseFCMIssue.js`
2. Review logs: `flutter logs` and server logs
3. Test from Firebase Console
4. Review documentation in project root
5. Check Firebase Console for errors

---

**Last Updated:** After Pushy to FCM migration
**Status:** Ready for setup and testing
