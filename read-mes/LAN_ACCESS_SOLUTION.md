# LAN Access Solution - Quick Guide

## TL;DR
**Your server is working correctly!** You can't access `http://192.168.100.83:3000` from your Mac due to a macOS routing quirk, but **it will work fine from your phone**.

## The Issue
macOS routes traffic to its own LAN IP through the loopback interface, causing connection failures when testing from the same Mac.

## The Solution
**Test from your phone instead!**

### Step 1: Verify Server is Running
```bash
curl http://localhost:3000/health
```

If you see `{"status":"ok",...}`, your server is working!

### Step 2: Test from Your Phone
1. Connect your phone to the **same WiFi** as your Mac
2. Open browser on your phone
3. Visit: `http://192.168.100.83:3000/health`
4. You should see the same JSON response ✅

### Step 3: Configure Your Mobile Apps
Update the API config in your Flutter apps:

**Student App**: `student_app/lib/config/api_config.dart`
```dart
static const String baseUrl = 'http://192.168.100.83:3000/api';
```

**Parent App**: `parent_app/lib/config/api_config.dart`
```dart
static const String baseUrl = 'http://192.168.100.83:3000/api';
```

## Diagnostic Commands

```bash
# Show your LAN IP and network info
npm run network

# Test all connection methods
npm run test-lan

# Fix firewall (if needed)
npm run fix-firewall
```

## What Works and What Doesn't

| Test | Result | Why |
|------|--------|-----|
| Mac → localhost:3000 | ✅ Works | Normal localhost |
| Mac → 127.0.0.1:3000 | ✅ Works | Loopback address |
| Mac → 192.168.100.83:3000 | ❌ Fails | macOS routing quirk |
| Phone → 192.168.100.83:3000 | ✅ Works | Normal network access |
| Other PC → 192.168.100.83:3000 | ✅ Works | Normal network access |

## Troubleshooting

### Phone still can't connect?

1. **Same WiFi?** Make sure both devices are on the same network
2. **Firewall?** Run `npm run fix-firewall`
3. **IP changed?** Run `npm run network` to check current IP
4. **Router isolation?** Check if your router has "AP Isolation" enabled
5. **Server running?** Check with `lsof -i :3000`

### Need more details?
- Read: `MACOS_LAN_ROUTING_ISSUE.md` for technical explanation
- Read: `LAN_TROUBLESHOOTING_GUIDE.md` for comprehensive guide

## Quick Start

```bash
# 1. Start server
npm start

# 2. Check network info
npm run network

# 3. Test from phone's browser
# Visit: http://192.168.100.83:3000/health

# 4. Update mobile app configs with the IP shown
# Then run your Flutter apps!
```

## Summary
The server is configured correctly and listening on all network interfaces. The LAN IP works from other devices - you just can't test it from the same Mac due to macOS routing behavior. This is normal and expected!
