# LAN Access - Quick Summary

## ✅ What Changed

The Node.js server is now accessible via LAN for testing on physical devices.

### Server Changes

**File: `src/index.js`**
- Server now listens on `0.0.0.0` (all network interfaces)
- Displays LAN IP addresses on startup
- Shows mobile app configuration examples

**New File: `src/scripts/showNetworkInfo.js`**
- Utility script to display network information
- Run with: `npm run network`

**Updated: `package.json`**
- Added `network` script command

## 🚀 How to Use

### 1. Start Server
```bash
npm start
```

Server will display:
```
📡 LAN Access (for mobile devices):
   1. http://192.168.1.100:3000

📱 Mobile App Config (use in api_config.dart):
   Physical Device: http://192.168.1.100:3000/api
```

### 2. Update Mobile App

Edit `student_app/lib/config/api_config.dart`:
```dart
static const String baseUrl = 'http://192.168.1.100:3000/api';
```
(Use your actual IP address shown by the server)

### 3. Rebuild App
```bash
cd student_app
flutter clean
flutter run
```

## 📋 Quick Commands

| Command | Purpose |
|---------|---------|
| `npm start` | Start server (shows network info) |
| `npm run network` | Show network info only |
| `ifconfig` (Mac/Linux) | Find your IP address |
| `ipconfig` (Windows) | Find your IP address |

## 🔥 Firewall Setup

### macOS
```bash
# Allow Node.js through firewall
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/local/bin/node
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblockapp /usr/local/bin/node
```

### Windows (Admin Command Prompt)
```cmd
netsh advfirewall firewall add rule name="Node.js Server" dir=in action=allow protocol=TCP localport=3000
```

### Linux
```bash
sudo ufw allow 3000/tcp
```

## ✓ Testing Checklist

- [ ] Server starts and shows LAN IP addresses
- [ ] Can access `http://localhost:3000` in browser
- [ ] Can access `http://YOUR_LAN_IP:3000` in browser
- [ ] Mobile device is on same WiFi network
- [ ] Updated mobile app config with LAN IP
- [ ] Firewall allows port 3000
- [ ] Mobile app can login successfully

## 🐛 Quick Troubleshooting

**Can't connect from phone?**
1. Check both devices are on same WiFi
2. Test in phone browser: `http://YOUR_LAN_IP:3000`
3. Check firewall settings
4. Verify correct IP address in app config

**Multiple IP addresses shown?**
- Use the one starting with `192.168.x.x` or `10.0.x.x`
- Avoid `169.254.x.x` (link-local addresses)

**Still not working?**
- See full guide: `LAN_SETUP_GUIDE.md`
- Check: `student_app/NETWORK_TROUBLESHOOTING.md`

## 📚 Documentation

- **Full LAN Setup Guide:** `LAN_SETUP_GUIDE.md`
- **Network Troubleshooting:** `student_app/NETWORK_TROUBLESHOOTING.md`
- **API Configuration:** `student_app/DEPLOYMENT_CONFIG.md`
- **Quick Start:** `student_app/QUICK_START.md`

## 🔒 Security Note

LAN access is safe for development on trusted networks. For production:
- Use HTTPS with valid SSL certificate
- Configure proper firewall rules
- Use reverse proxy (nginx, Apache)
- See `LAN_SETUP_GUIDE.md` for production checklist
