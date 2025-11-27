# 🧪 FCM Test Button - Quick Guide

## What I Added

A test screen with a button to manually test FCM token registration.

### Files Created/Modified:
1. ✅ `parent_app/lib/screens/test_fcm_screen.dart` - New test screen
2. ✅ `parent_app/lib/screens/home_screen.dart` - Added bug icon button in app bar

## How to Use

### Step 1: Rebuild Parent App
```bash
cd parent_app
flutter clean
flutter pub get
flutter build apk --release
```

### Step 2: Install and Open App
1. Install the new APK on your phone
2. Login with parent@gmail.com / Password1
3. You'll see a **bug icon** (🐛) in the top-right corner of the home screen

### Step 3: Test FCM
1. Tap the **bug icon** in the app bar
2. You'll see the "Test FCM" screen
3. Tap **"Test FCM Registration"** button
4. Watch the status messages

### What You'll See

**✅ Success Flow:**
```
Step 1: ✅ Permission granted
Step 2: ✅ Got FCM token
fK8xN2pQR3y:APA91bH_xxxxxxxxxx...
Step 3: ✅ Registered successfully!

All done! 🎉
```

**❌ If Permission Denied:**
```
Step 1: ❌ Permission denied
```
**Fix:** Allow notifications in phone settings

**❌ If FCM Token is Null:**
```
Step 2: ❌ FCM token is null
```
**Fix:** Google Play Services issue or Firebase not configured

**❌ If Backend Fails:**
```
Step 3: ❌ Backend error: [message]
```
**Fix:** Check network connection or backend API

### Step 4: Copy Token (Optional)

If you get a token, you can:
1. Tap **"Copy Token"** button
2. Share it for debugging
3. Manually register it via API if needed

## What This Tests

1. ✅ Notification permission request
2. ✅ Firebase SDK initialization
3. ✅ FCM token generation
4. ✅ Backend API registration
5. ✅ Network connectivity

## Expected Result

After successful test:
- Token is registered in database
- Student can scan QR code
- Parent receives notification!

## Troubleshooting

### "FCM token is null"
**Causes:**
- Google Play Services not installed/updated
- Firebase project misconfigured
- Device doesn't support FCM (emulator without Google Play)

**Solutions:**
- Update Google Play Services
- Use real device (not emulator)
- Check Firebase Console settings

### "Backend error"
**Causes:**
- Not logged in
- Network issue
- Backend API down

**Solutions:**
- Ensure you're logged in
- Check internet connection
- Verify backend is running

### "Permission denied"
**Causes:**
- User tapped "Don't allow"
- Notifications disabled in settings

**Solutions:**
- Go to phone Settings → Apps → Parent App → Notifications
- Enable notifications
- Try test again

## Next Steps

1. Rebuild app with test button
2. Run the test
3. Share the result (success or error message)
4. We'll fix any issues based on what you see

---

**Added:** Test FCM screen with manual registration button  
**Location:** Bug icon in home screen app bar  
**Purpose:** Debug FCM token registration issues
