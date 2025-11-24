# Building Parent App APK

## Quick Build Command

```bash
cd parent_app
flutter build apk --release
```

The APK will be created at:
```
parent_app/build/app/outputs/flutter-apk/app-release.apk
```

## Installation on Physical Device

### Option 1: USB Cable
1. Enable USB debugging on your Android phone
2. Connect phone to computer via USB
3. Run:
```bash
flutter install
```

### Option 2: Transfer APK
1. Copy the APK to your phone (via USB, email, cloud storage, etc.)
2. On your phone, open the APK file
3. Allow installation from unknown sources if prompted
4. Install the app

## Testing Checklist

### Before Testing:
- [ ] Backend server is running (`npm start`)
- [ ] Your phone is on the same WiFi network as your computer
- [ ] API config has correct IP address (192.168.100.83:3000)
- [ ] Test notifications created (run `node src/scripts/testParentNotifications.js`)

### Features to Test:
- [ ] Registration with student linking
- [ ] Login
- [ ] View linked students on home screen
- [ ] View recent attendance logs per student
- [ ] Tap student card to see full attendance history
- [ ] View notifications (if test data created)
- [ ] Mark notifications as read
- [ ] Settings screen
- [ ] Logout

## Push Notifications (Pushy)

### Current Status:
- Pushy SDK is integrated but will fail silently without API key
- Notifications work via database (can be tested with script)
- For real push notifications, you need:
  1. Pushy account and API key
  2. Update `.env` with `PUSHY_SECRET_API_KEY`
  3. Rebuild APK

### Testing Without Pushy:
You can test the notification UI by creating test notifications:

```bash
# Create sample notifications in database
node src/scripts/testParentNotifications.js

# Then refresh the app or restart it
# Notifications will appear in the notifications tab
```

## Network Configuration

### If Connection Fails:

1. **Check your computer's IP:**
```bash
# macOS/Linux
ifconfig | grep "inet "

# Windows
ipconfig
```

2. **Update API config:**
Edit `parent_app/lib/config/api_config.dart`:
```dart
static const String baseUrl = 'http://YOUR_IP:3000/api';
```

3. **Rebuild APK:**
```bash
flutter build apk --release
```

### Firewall Issues:
If your phone can't connect, ensure your firewall allows connections on port 3000:
```bash
# macOS
sudo pfctl -d  # Disable firewall temporarily for testing
```

## Troubleshooting

### "Unable to connect to server"
- Verify backend is running: `curl http://localhost:3000/api/health`
- Check IP address is correct
- Ensure phone and computer are on same network
- Try disabling firewall temporarily

### "Registration failed"
- Check backend logs for errors
- Verify student ID exists in database
- Check network connectivity

### "No attendance records"
- Create test attendance data:
```bash
node src/scripts/testParentNotifications.js
```

### App crashes on startup
- Check Flutter version compatibility
- Rebuild with `flutter clean && flutter build apk --release`
- Check device logs: `adb logcat`

## Production Build (Optional)

For a production-ready APK with signing:

1. Generate keystore (one-time):
```bash
keytool -genkey -v -keystore ~/parent-app-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias parent-app
```

2. Create `parent_app/android/key.properties`:
```properties
storePassword=your_password
keyPassword=your_password
keyAlias=parent-app
storeFile=/path/to/parent-app-key.jks
```

3. Build signed APK:
```bash
flutter build apk --release
```

## Quick Test Script

```bash
#!/bin/bash
# Quick build and install script

echo "🏗️  Building Parent App APK..."
cd parent_app
flutter clean
flutter build apk --release

echo "📱 Installing on connected device..."
flutter install

echo "✅ Done! App installed on device."
echo "💡 Make sure backend server is running: npm start"
```

Save as `build-parent-app.sh` and run with `bash build-parent-app.sh`
