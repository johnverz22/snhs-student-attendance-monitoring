# LAN Access Troubleshooting Guide

## Problem: Cannot access server via LAN IP address

Your server is configured correctly to listen on `0.0.0.0:3000`, but macOS firewall is blocking incoming connections from other devices.

## Current Status
- ✅ Server is running on port 3000
- ✅ Server is listening on all interfaces (0.0.0.0)
- ✅ LAN IP detected: `192.168.100.83`
- ✅ Localhost access works: `http://localhost:3000`
- ❌ LAN access blocked: `http://192.168.100.83:3000`

## Root Cause
**macOS Routing Quirk**: When you try to access your own LAN IP (192.168.100.83) from the same Mac, macOS routes the traffic through the loopback interface (lo0) instead of the network interface (en1). This causes connection failures.

**Important**: This is ONLY an issue when testing from the same Mac. Other devices on your network (like your phone) will be able to access the server just fine!

---

## Solutions

### Solution 1: Test from Another Device (Recommended)
**The LAN IP will work fine from other devices!**

The connection issue only affects testing from the same Mac. To verify your server is accessible:

1. **From your phone** (connected to same WiFi):
   - Open browser and visit: `http://192.168.100.83:3000/health`
   - You should see: `{"status":"ok","timestamp":"..."}`

2. **From another computer** on the same network:
   - Same test as above

This is the proper way to test LAN access since that's how your mobile apps will connect.

---

### Solution 2: Test from Your Mac (Workaround)
If you need to test from the same Mac, use localhost instead:

```bash
curl http://localhost:3000/health
curl http://127.0.0.1:3000/health
```

---

### Solution 3: Run Diagnostic Tool
```bash
node src/scripts/testLANAccess.js
```

This will test all connection methods and show you what's working.

---

### Solution 4: Manual Firewall Configuration (If Needed)

1. Open **System Settings** (or **System Preferences** on older macOS)
2. Navigate to:
   - **macOS Ventura+**: Network → Firewall
   - **macOS Monterey and earlier**: Security & Privacy → Firewall
3. Click the **lock icon** 🔒 and authenticate
4. Click **Options** or **Firewall Options**
5. Click the **+** button
6. Navigate to `/usr/local/bin/node` (or wherever your Node.js is installed)
7. Select it and click **Add**
8. Ensure it's set to **Allow incoming connections**
9. Click **OK**

---

### Solution 3: Command Line (Manual)

```bash
# Add Node.js to firewall allowlist
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/local/bin/node
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblockapp /usr/local/bin/node
```

---

### Solution 4: Temporarily Disable Firewall (Testing Only)

**⚠️ Warning: This disables your firewall completely. Only use for testing!**

```bash
# Disable firewall
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate off

# Test your connection...

# Re-enable firewall when done
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate on
```

---

## Verification Steps

After applying any solution above:

### 1. Test from your Mac
```bash
curl http://192.168.100.83:3000/health
```

Expected response:
```json
{"status":"ok","timestamp":"2025-11-22T..."}
```

### 2. Test from mobile device
Open a browser on your phone (connected to same WiFi) and visit:
```
http://192.168.100.83:3000/health
```

### 3. Test admin interface
```
http://192.168.100.83:3000/admin
```

---

## Additional Checks

### Check if server is running
```bash
lsof -i :3000
```

### View network information
```bash
npm run network
```

### Check firewall status
```bash
/usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate
```

### List firewall applications
```bash
/usr/libexec/ApplicationFirewall/socketfilterfw --listapps
```

---

## Mobile App Configuration

After fixing firewall access, update your mobile app config:

### Student App
File: `student_app/lib/config/api_config.dart`

```dart
static const String baseUrl = 'http://192.168.100.83:3000/api';
```

### Parent App
File: `parent_app/lib/config/api_config.dart`

```dart
static const String baseUrl = 'http://192.168.100.83:3000/api';
```

---

## Common Issues

### Issue: "Connection refused" error
- **Cause**: Server is not running
- **Solution**: Start the server with `npm start`

### Issue: "No route to host" error
- **Cause**: Firewall is blocking the connection
- **Solution**: Follow one of the solutions above

### Issue: "Network unreachable" error
- **Cause**: Devices are on different networks
- **Solution**: Ensure both devices are on the same WiFi network

### Issue: Works on Mac but not on phone
- **Cause**: Firewall is blocking external connections
- **Solution**: Add Node.js to firewall allowlist (Solution 1, 2, or 3)

### Issue: LAN IP keeps changing
- **Cause**: DHCP is assigning dynamic IPs
- **Solution**: Configure a static IP in your router settings for your Mac

---

## Network Requirements

For LAN access to work:
1. ✅ Server must be running
2. ✅ Server must listen on `0.0.0.0` (not just `localhost`)
3. ✅ Firewall must allow incoming connections
4. ✅ Both devices must be on the same WiFi network
5. ✅ Mobile device must use the correct LAN IP address

---

## Quick Reference

| Access Type | URL |
|------------|-----|
| Local (Mac) | `http://localhost:3000` |
| LAN (Phone) | `http://192.168.100.83:3000` |
| Android Emulator | `http://10.0.2.2:3000` |
| iOS Simulator | `http://localhost:3000` |

---

## Need More Help?

1. Check server logs for errors
2. Verify your LAN IP hasn't changed: `npm run network`
3. Test with curl first before testing with mobile app
4. Check router settings for any device isolation features
5. Ensure WiFi is not in "Guest" or "Isolation" mode
