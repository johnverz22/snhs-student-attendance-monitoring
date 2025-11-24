# Quick Start Guide - Student App

## 🚀 Get Started in 3 Steps

### Step 1: Start the Backend Server
```bash
# In the project root directory
node src/index.js
```

You should see: `Server running on port 3000`

### Step 2: Configure API URL (if needed)

**Android Emulator:** Already configured ✅ (skip this step)

**iOS Simulator or Physical Device:**
1. Open `student_app/lib/config/api_config.dart`
2. Update line ~37:
   ```dart
   // For iOS Simulator:
   static const String baseUrl = 'http://localhost:3000/api';
   
   // For Physical Device (replace with your IP):
   static const String baseUrl = 'http://192.168.1.100:3000/api';
   ```

### Step 3: Run the App
```bash
cd student_app
flutter run
```

## ✅ Verify It Works

1. **App launches** - You should see the login screen
2. **Theme is correct** - Blue primary color (#3498db)
3. **Test login** - Use test credentials from DUMMY_ACCOUNT.md
4. **No network errors** - Login should work

## 🐛 Quick Troubleshooting

### "Network Error" on Login?

**Quick Fix:**
```bash
# 1. Check backend is running
curl http://localhost:3000/api/health

# 2. Rebuild app
cd student_app
flutter clean
flutter run
```

**Still not working?** See `NETWORK_TROUBLESHOOTING.md`

### Theme Doesn't Look Right?

```bash
# Full restart (not hot reload)
flutter clean
flutter run
```

Press `R` (capital R) in terminal for full restart

### Can't Find Your IP Address?

```bash
# macOS/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig
```

Look for "IPv4 Address"

## 📱 Test Credentials

See `DUMMY_ACCOUNT.md` in project root for test accounts

## 📚 Full Documentation

- **Network Issues:** `NETWORK_TROUBLESHOOTING.md`
- **API Configuration:** `DEPLOYMENT_CONFIG.md`
- **Theme & Network Fixes:** `THEME_AND_NETWORK_FIXES.md`
- **API Quick Reference:** `API_CONFIG_QUICK_REFERENCE.txt`

## 🎨 Theme Colors

The app now matches the admin dashboard:
- Primary: #3498db (Blue)
- Secondary: #2ecc71 (Green)
- Error: #e74c3c (Red)

## 🔒 Security Note

HTTP connections are enabled for development. Before production:
1. Change API URL to HTTPS
2. Update network security config
3. See `DEPLOYMENT_CONFIG.md`

## Need Help?

1. Check the troubleshooting guides above
2. Run `flutter doctor -v` to check your setup
3. Check `flutter logs` for errors
4. Verify backend logs in terminal
