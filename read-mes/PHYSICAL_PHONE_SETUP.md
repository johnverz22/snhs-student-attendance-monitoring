# Physical Phone Setup - Quick Start

## For Physical Android/iOS Phones

### Step 1: Update API Configuration

Both apps are already configured for physical devices!

**Student App**: `student_app/lib/config/api_config.dart`
```dart
static const String baseUrl = 'http://192.168.100.83:3000/api';
```

**Parent App**: `parent_app/lib/config/api_config.dart`
```dart
static const String baseUrl = 'http://192.168.100.83:3000/api';
```

### Step 2: Verify Your LAN IP

Your IP might change, so verify it:
```bash
npm run network
```

If the IP shown is different from `192.168.100.83`, update both config files.

### Step 3: Start the Server

```bash
npm start
```

### Step 4: Test from Phone's Browser

Before running the Flutter app, test the connection:

1. Connect your phone to the **same WiFi** as your Mac
2. Open browser on your phone (Safari/Chrome)
3. Visit: `http://192.168.100.83:3000/health`
4. You should see: `{"status":"ok","timestamp":"..."}`

✅ If this works, your Flutter app will work!
❌ If this fails, see troubleshooting below

### Step 5: Run Your Flutter App

```bash
cd student_app  # or parent_app
flutter clean
flutter run
```

## Important: 10.0.2.2 vs LAN IP

```
❌ WRONG for Physical Phone:
   http://10.0.2.2:3000/api

✅ CORRECT for Physical Phone:
   http://192.168.100.83:3000/api
```

**Why?** `10.0.2.2` is a special address that ONLY works in Android emulators. Physical phones need your real LAN IP address.

## Troubleshooting

### "Connection refused" on Phone

1. **Check WiFi**: Are both devices on the same network?
   ```bash
   # On Mac, check your network
   ifconfig | grep "inet "
   ```

2. **Check Server**: Is it running?
   ```bash
   lsof -i :3000
   ```
   Should show node process listening

3. **Check Firewall**: Is Node.js allowed?
   ```bash
   npm run fix-firewall
   ```

4. **Check IP**: Has it changed?
   ```bash
   npm run network
   ```

5. **Test from Browser**: Before debugging Flutter app
   - Open phone's browser
   - Visit: `http://192.168.100.83:3000/health`

### "Network unreachable"

- Your phone might be on a different WiFi network
- Check if your router has "AP Isolation" or "Client Isolation" enabled
- Try disabling VPN on your phone

### Server works on Mac but not on phone

- This is the macOS routing quirk (see `MACOS_LAN_ROUTING_ISSUE.md`)
- Test from phone's browser to verify it actually works
- The Flutter app will work even if curl from Mac doesn't

## Quick Reference

| What | Command/Action |
|------|----------------|
| Find LAN IP | `npm run network` |
| Test connectivity | `npm run test-lan` |
| Fix firewall | `npm run fix-firewall` |
| Start server | `npm start` |
| Test from phone | Visit `http://192.168.100.83:3000/health` |

## Network Requirements

✅ Server running on Mac
✅ Phone connected to same WiFi as Mac
✅ Firewall allows Node.js
✅ Correct IP in `api_config.dart`
✅ Not using guest/isolated WiFi network

## Switching Between Devices

### For Physical Phone:
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

Always run `flutter clean` after changing the config!

## See Also

- `DEVICE_TYPE_IP_GUIDE.md` - Detailed guide for all device types
- `IP_ADDRESS_VISUAL_GUIDE.md` - Visual diagrams and explanations
- `LAN_ACCESS_SOLUTION.md` - LAN access troubleshooting
- `MACOS_LAN_ROUTING_ISSUE.md` - Why Mac can't test its own LAN IP
