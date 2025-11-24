# Server Startup Checklist

## Before Starting the Server

- [ ] Node.js is installed (`node --version`)
- [ ] Dependencies are installed (`npm install`)
- [ ] Database is initialized (`npm run db:init`)
- [ ] `.env` file is configured
- [ ] Port 3000 is available (or change in `.env`)

## Starting the Server

```bash
npm start
```

## What to Check After Startup

### ✅ Server Started Successfully

You should see:
```
🎓 School Attendance System - Server Started
═══════════════════════════════════════════

📍 Port: 3000
🌍 Environment: development

💻 Local Access:
   http://localhost:3000
   http://127.0.0.1:3000

📡 LAN Access (for mobile devices):
   1. http://192.168.1.100:3000

📱 Mobile App Config (use in api_config.dart):
   Android Emulator: http://10.0.2.2:3000/api
   iOS Simulator:    http://localhost:3000/api
   Physical Device:  http://192.168.1.100:3000/api

🌐 Admin Interface:
   http://localhost:3000/admin
   http://192.168.1.100:3000/admin
```

### ✅ Test Server is Responding

**In browser:**
- Navigate to `http://localhost:3000/admin`
- You should see the admin login page

**In terminal:**
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{"status":"ok","timestamp":"2024-11-19T..."}
```

### ✅ LAN Access is Working

**From another device on same network:**
```bash
curl http://YOUR_LAN_IP:3000/health
```

**Or open in browser:**
- Navigate to `http://YOUR_LAN_IP:3000`

## Mobile App Configuration

### For Android Emulator
```dart
// student_app/lib/config/api_config.dart
static const String baseUrl = 'http://10.0.2.2:3000/api';
```

### For iOS Simulator
```dart
// student_app/lib/config/api_config.dart
static const String baseUrl = 'http://localhost:3000/api';
```

### For Physical Device
```dart
// student_app/lib/config/api_config.dart
static const String baseUrl = 'http://192.168.1.100:3000/api';
```
(Replace with your actual LAN IP shown at server startup)

## Common Issues

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Find process using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process or change port in .env
```

### No LAN IP Addresses Shown

**Possible causes:**
- Not connected to WiFi
- Network adapter disabled
- VPN is active

**Solution:**
- Connect to WiFi network
- Disable VPN temporarily
- Check network adapter settings

### Cannot Access from Mobile Device

**Checklist:**
- [ ] Server is running
- [ ] Mobile device on same WiFi network
- [ ] Correct IP address in mobile app config
- [ ] Firewall allows port 3000
- [ ] No VPN on either device
- [ ] Router doesn't have AP isolation enabled

**Test:**
1. Open browser on phone
2. Navigate to `http://YOUR_LAN_IP:3000`
3. Should see server response

### Database Errors

**Error:** `Database not initialized` or `SQLITE_ERROR`

**Solution:**
```bash
npm run db:init
```

## Useful Commands

| Command | Purpose |
|---------|---------|
| `npm start` | Start server (production mode) |
| `npm run dev` | Start server (development mode with auto-reload) |
| `npm run network` | Show network information |
| `npm run db:init` | Initialize database |
| `npm run db:status` | Check database status |
| `npm test` | Run tests |

## Firewall Configuration

### macOS
```bash
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/local/bin/node
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblockapp /usr/local/bin/node
```

### Windows (Admin)
```cmd
netsh advfirewall firewall add rule name="Node.js Server" dir=in action=allow protocol=TCP localport=3000
```

### Linux
```bash
sudo ufw allow 3000/tcp
```

## Next Steps

After server is running:

1. **Test Admin Interface:**
   - Go to `http://localhost:3000/admin`
   - Login with admin credentials (see `DUMMY_ACCOUNT.md`)

2. **Configure Mobile App:**
   - Update `student_app/lib/config/api_config.dart`
   - Run `flutter clean && flutter run`

3. **Test Mobile App:**
   - Try login with test credentials
   - Test QR code scanning
   - Verify attendance logging

## Documentation

- **LAN Setup:** `LAN_SETUP_GUIDE.md`
- **LAN Summary:** `LAN_ACCESS_SUMMARY.md`
- **Network Troubleshooting:** `student_app/NETWORK_TROUBLESHOOTING.md`
- **Mobile Quick Start:** `student_app/QUICK_START.md`
- **API Configuration:** `student_app/DEPLOYMENT_CONFIG.md`

## Support

If you encounter issues:
1. Check server logs in terminal
2. Run `npm run network` to verify network setup
3. Review relevant documentation above
4. Check firewall settings
5. Verify all devices on same network
