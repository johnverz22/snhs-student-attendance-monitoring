# Device Type IP Address Guide

## Quick Reference

| Device Type | IP Address | File to Edit |
|------------|------------|--------------|
| **Physical Android Phone** | `http://192.168.100.83:3000/api` | `*_app/lib/config/api_config.dart` |
| **Physical iPhone** | `http://192.168.100.83:3000/api` | `*_app/lib/config/api_config.dart` |
| **Android Emulator** | `http://10.0.2.2:3000/api` | `*_app/lib/config/api_config.dart` |
| **iOS Simulator** | `http://localhost:3000/api` | `*_app/lib/config/api_config.dart` |

## Understanding the IP Addresses

### 192.168.100.83 (Your LAN IP)
- **What it is**: Your Mac's actual IP address on your WiFi network
- **Who can use it**: Any device on the same WiFi network
- **Use for**: Physical phones, tablets, other computers
- **How to find it**: Run `npm run network`

### 10.0.2.2 (Android Emulator Special Address)
- **What it is**: A special address that Android emulators use to reach the host machine
- **Who can use it**: ONLY Android emulators running on your Mac
- **Use for**: Testing in Android Studio emulator
- **Does NOT work on**: Physical Android phones, iPhones, iOS simulators

### localhost (iOS Simulator)
- **What it is**: The standard loopback address
- **Who can use it**: iOS simulators (they share the host's network)
- **Use for**: Testing in Xcode iOS simulator
- **Does NOT work on**: Physical devices, Android emulators

## Current Configuration

Both apps are now configured for **physical devices**:

### Student App
File: `student_app/lib/config/api_config.dart`
```dart
static const String baseUrl = 'http://192.168.100.83:3000/api'; // Physical Device
```

### Parent App
File: `parent_app/lib/config/api_config.dart`
```dart
static const String baseUrl = 'http://192.168.100.83:3000/api'; // Physical Device
```

## How to Switch Between Device Types

### For Physical Android/iOS Phone:
```dart
static const String baseUrl = 'http://192.168.100.83:3000/api';
```

### For Android Emulator:
```dart
static const String baseUrl = 'http://10.0.2.2:3000/api';
```

### For iOS Simulator:
```dart
static const String baseUrl = 'http://localhost:3000/api';
```

## Testing Your Configuration

### Step 1: Check Your Server's LAN IP
```bash
npm run network
```

This will show your current LAN IP. If it's different from `192.168.100.83`, update the config files.

### Step 2: Test from Phone's Browser
Before running your Flutter app, test the connection:

1. Open browser on your phone
2. Visit: `http://192.168.100.83:3000/health`
3. You should see: `{"status":"ok","timestamp":"..."}`

If this works, your Flutter app will work too!

### Step 3: Run Your Flutter App
```bash
cd student_app  # or parent_app
flutter run
```

## Troubleshooting

### "Connection refused" on Physical Phone
- ✅ Check: Is your phone on the same WiFi as your Mac?
- ✅ Check: Is the server running? (`lsof -i :3000`)
- ✅ Check: Did you update the IP in `api_config.dart`?
- ✅ Check: Is the IP correct? Run `npm run network`
- ✅ Check: Firewall allows Node.js? Run `npm run fix-firewall`

### "Connection refused" on Android Emulator
- ✅ Check: Are you using `10.0.2.2` (not `192.168.x.x`)?
- ✅ Check: Is the server running on your Mac?
- ✅ Check: Did you rebuild the app after changing config?

### "Connection refused" on iOS Simulator
- ✅ Check: Are you using `localhost` (not `10.0.2.2`)?
- ✅ Check: Is the server running on your Mac?
- ✅ Check: Did you rebuild the app after changing config?

## Important Notes

1. **10.0.2.2 is NOT a real IP address** - it's a special address that only exists in the Android emulator's virtual network

2. **Physical phones need your real LAN IP** - they're on your actual WiFi network, not a virtual one

3. **Your LAN IP can change** - if your router assigns a new IP, you'll need to update the config files

4. **Always rebuild after changing config** - Flutter needs to recompile with the new URL

5. **Test with browser first** - before debugging your Flutter app, verify the server is accessible from your phone's browser

## Quick Commands

```bash
# Find your current LAN IP
npm run network

# Test LAN connectivity
npm run test-lan

# Fix firewall (if needed)
npm run fix-firewall

# Start server
npm start
```

## Summary

- **Physical Android phone debugging**: Use `192.168.100.83` (your LAN IP)
- **Android emulator**: Use `10.0.2.2` (emulator special address)
- **iOS simulator**: Use `localhost`
- **Physical iPhone**: Use `192.168.100.83` (your LAN IP)

The `10.0.2.2` address will NOT work on physical phones - it's only for emulators!
