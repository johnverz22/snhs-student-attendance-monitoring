# Quick Start: Firebase Cloud Messaging

## 🚀 Get Started in 5 Minutes

### 1. Get Firebase Files (2 min)

**Backend:**
- Go to https://console.firebase.google.com
- Project Settings → Service Accounts → Generate new private key
- Save as `firebase-service-account.json` in project root

**Flutter:**
- Firebase Console → Add Android app
- Package: `com.schoolattendance.parent_app`
- Download `google-services.json`
- Place in `parent_app/android/app/`

### 2. Install (1 min)

```bash
npm install
cd parent_app && flutter pub get
```

### 3. Configure (30 sec)

Update `.env`:
```env
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
```

### 4. Test (1 min)

```bash
# Start backend
npm start
# Should see: "Firebase Admin SDK initialized successfully"

# Run app
cd parent_app && flutter run
# After login, check for: "FCM device token: ..."
```

### 5. Send Test Notification (30 sec)

```bash
# Get token from app logs, then:
node src/scripts/sendTestPushNotification.js YOUR_FCM_TOKEN
```

## ✅ Done!

If all steps worked, you're ready to use FCM!

## 🆘 Issues?

```bash
# Run diagnostics
node src/scripts/diagnoseFCMIssue.js
```

## 📚 More Info

- Full setup: `FIREBASE_SETUP_GUIDE.md`
- Checklist: `FCM_SETUP_CHECKLIST.md`
- Quick ref: `FCM_QUICK_REFERENCE.md`
