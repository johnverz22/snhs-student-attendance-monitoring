# Pushy Notification Troubleshooting Guide

## ✅ What's Working
- Device token registered: `593c78cf5a761462c52878`
- Pushy API accepting notifications
- Backend sending notifications successfully
- Pushy dashboard shows device connected

## ❌ Problem
- Notifications showing as "pending" in Pushy dashboard
- Device not receiving notifications

## 🔍 Common Causes & Solutions

### 1. App is Force-Stopped or Closed
**Cause**: Android kills background processes when app is force-stopped

**Solution**:
- Open the app (don't just install it)
- Keep app running in background
- Don't swipe away from recent apps
- Don't force-stop the app

### 2. Battery Optimization Killing App
**Cause**: Android's battery optimization stops background services

**Solution**:
```
Settings → Apps → SNHS Attendance - Parent → Battery → Unrestricted
```

Or:
```
Settings → Battery → Battery Optimization → All Apps → 
Find "SNHS Attendance - Parent" → Don't Optimize
```

### 3. Notification Permissions
**Cause**: App doesn't have notification permission

**Solution**:
```
Settings → Apps → SNHS Attendance - Parent → Notifications → 
Enable "All notifications"
```

### 4. Background Data Restricted
**Cause**: App can't receive data in background

**Solution**:
```
Settings → Apps → SNHS Attendance - Parent → Mobile Data → 
Enable "Background data"
```

### 5. Do Not Disturb Mode
**Cause**: Phone is in DND mode

**Solution**:
- Disable Do Not Disturb
- Or add app to DND exceptions

### 6. App Not Running Pushy Service
**Cause**: Pushy service not started properly

**Solution**:
1. Uninstall the app completely
2. Reinstall the APK
3. Open the app
4. Login
5. Keep app open for 1 minute
6. Send test notification

### 7. Wrong Pushy App ID
**Cause**: App ID mismatch between app and dashboard

**Solution**:
Check AndroidManifest.xml has:
```xml
<meta-data
    android:name="pushy.appId"
    android:value="app" />
```

This must match your Pushy dashboard app ID.

## 🧪 Testing Steps

### Step 1: Verify App is Running
1. Open the parent app
2. Login successfully
3. Leave app open (don't close it)
4. Check device stays connected in Pushy dashboard

### Step 2: Send Test Notification
```bash
node src/scripts/diagnosePushyIssue.js
```

This will:
- Show registered device token
- Send a test notification
- Display results

### Step 3: Check Device Logs
If you have the device connected via USB:
```bash
# In parent_app directory
flutter logs | grep -i pushy
```

Look for:
- "Pushy device token: ..."
- "Notification received: ..."
- Any error messages

### Step 4: Manual Test from Pushy Dashboard
1. Go to https://dashboard.pushy.me
2. Click on your app
3. Go to "Send Notification"
4. Enter device token: `593c78cf5a761462c52878`
5. Add title and message
6. Click "Send Push"
7. Check if device receives it

## 📱 Device-Specific Issues

### Samsung Devices
Samsung has aggressive battery optimization:
```
Settings → Device Care → Battery → App Power Management → 
Apps that won't be put to sleep → Add "SNHS Attendance - Parent"
```

### Xiaomi/MIUI Devices
MIUI kills background apps aggressively:
```
Settings → Apps → Manage Apps → SNHS Attendance - Parent →
- Autostart: Enable
- Battery Saver: No restrictions
- Permissions: Allow all
```

### Huawei Devices
```
Settings → Battery → App Launch → SNHS Attendance - Parent →
Manage Manually → Enable all three options
```

### OnePlus/OxygenOS
```
Settings → Battery → Battery Optimization → 
SNHS Attendance - Parent → Don't Optimize
```

## 🔧 Quick Fixes

### Fix 1: Reinstall App
```bash
# Uninstall from device
# Then reinstall
adb install parent_app/build/app/outputs/flutter-apk/app-release.apk

# Or transfer APK and install manually
```

### Fix 2: Clear App Data
```
Settings → Apps → SNHS Attendance - Parent → Storage → Clear Data
```
Then login again.

### Fix 3: Restart Device
Sometimes a simple restart fixes notification issues.

### Fix 4: Check Internet Connection
- Ensure device has active internet (WiFi or mobile data)
- Try opening a website to verify
- Check if app can connect to backend

## 📊 Diagnostic Checklist

Run through this checklist:

- [ ] App is installed and opened
- [ ] User is logged in
- [ ] App is not force-stopped
- [ ] Notification permission granted
- [ ] Battery optimization disabled for app
- [ ] Background data enabled
- [ ] Device has internet connection
- [ ] Do Not Disturb is off
- [ ] Pushy App ID matches in manifest
- [ ] Device token registered in database
- [ ] Backend can send notifications (test script works)

## 🎯 Most Likely Solutions

Based on "pending notification" status:

### Solution 1: Keep App Running
The most common issue - app needs to be running:
1. Open the app
2. Login
3. Press home button (don't swipe away)
4. Send test notification
5. Should receive it within seconds

### Solution 2: Disable Battery Optimization
Android kills the app to save battery:
1. Go to Settings → Battery
2. Find Battery Optimization
3. Select "All Apps"
4. Find "SNHS Attendance - Parent"
5. Select "Don't Optimize"
6. Restart app

### Solution 3: Check Notification Settings
Ensure notifications are enabled:
1. Long-press app icon
2. Tap "App Info"
3. Tap "Notifications"
4. Enable all notification categories

## 🚀 Quick Test

Try this quick test:
1. **Open the app** on your device
2. **Keep it open** (don't minimize)
3. **Run**: `node src/scripts/diagnosePushyIssue.js`
4. **Check device** - notification should appear immediately

If it works when app is open but not when closed:
→ Battery optimization is killing the app

## 📞 Still Not Working?

If notifications still don't work after trying everything:

1. **Check app logs**:
   ```bash
   flutter logs
   ```
   Look for Pushy-related errors

2. **Verify Pushy SDK version**:
   Check `parent_app/pubspec.yaml` has:
   ```yaml
   pushy_flutter: ^2.0.40
   ```

3. **Check Android version**:
   - Android 13+ requires runtime notification permission
   - Check if permission was granted

4. **Test with different device**:
   - Try on another Android device
   - Rules out device-specific issues

## 💡 Pro Tips

1. **During development**: Keep app open to receive notifications
2. **For production**: Implement proper background service
3. **Test regularly**: Send test notifications to verify setup
4. **Monitor dashboard**: Check Pushy dashboard for delivery stats
5. **Handle failures**: Implement retry logic in backend

---

**Current Status**: 
- ✅ Backend sending notifications
- ✅ Device registered
- ⏳ Device not receiving (likely battery optimization or app closed)

**Next Step**: Try Solution 1 (Keep App Running) and Solution 2 (Disable Battery Optimization)
