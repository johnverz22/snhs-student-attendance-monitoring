# LAN Setup Guide - Physical Device Testing

## Overview

The server is now configured to be accessible via LAN, allowing you to test the mobile app on physical devices connected to the same WiFi network.

## Quick Start

### 1. Start the Server

```bash
npm start
```

The server will automatically display all available network addresses.

### 2. Find Your LAN IP Address

The server startup will show your LAN IP addresses. Look for something like:

```
📡 LAN Access (for mobile devices):
   1. http://192.168.1.100:3000
```

**Or run this command:**
```bash
npm run network
```

**Or find it manually:**

**macOS/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your active WiFi adapter.

### 3. Update Mobile App Configuration

1. Open `student_app/lib/config/api_config.dart`
2. Update the `baseUrl` with your LAN IP:

```dart
static const String baseUrl = 'http://192.168.1.100:3000/api';
```

Replace `192.168.1.100` with your actual IP address.

### 4. Rebuild and Run the App

```bash
cd student_app
flutter clean
flutter run
```

## Configuration Summary

### Server Configuration

**File:** `src/index.js`

The server now listens on `0.0.0.0` (all network interfaces) instead of just `localhost`:

```javascript
const HOST = '0.0.0.0'; // Listen on all network interfaces
app.listen(PORT, HOST, () => { ... });
```

This allows connections from:
- Localhost (127.0.0.1)
- LAN devices (192.168.x.x)
- Other network interfaces

### Mobile App Configuration

**File:** `student_app/lib/config/api_config.dart`

Update based on your testing environment:

| Environment | Configuration |
|------------|---------------|
| **Android Emulator** | `http://10.0.2.2:3000/api` |
| **iOS Simulator** | `http://localhost:3000/api` |
| **Physical Device** | `http://YOUR_LAN_IP:3000/api` |

## Firewall Configuration

### macOS

1. Open **System Preferences** → **Security & Privacy** → **Firewall**
2. Click **Firewall Options**
3. Ensure Node.js is allowed, or add it
4. Alternatively, allow incoming connections on port 3000

**Via Terminal:**
```bash
# Allow Node.js
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/local/bin/node
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblockapp /usr/local/bin/node
```

### Windows

1. Open **Windows Defender Firewall**
2. Click **Advanced settings**
3. Click **Inbound Rules** → **New Rule**
4. Select **Port** → **TCP** → Specific port: **3000**
5. Allow the connection
6. Apply to all profiles (Domain, Private, Public)

**Via Command Prompt (Admin):**
```cmd
netsh advfirewall firewall add rule name="Node.js Server" dir=in action=allow protocol=TCP localport=3000
```

### Linux (Ubuntu/Debian)

```bash
# UFW
sudo ufw allow 3000/tcp

# iptables
sudo iptables -A INPUT -p tcp --dport 3000 -j ACCEPT
```

## Testing the Connection

### From Your Computer

```bash
# Test localhost
curl http://localhost:3000/health

# Test LAN IP
curl http://192.168.1.100:3000/health
```

### From Mobile Device

1. **Open browser on your phone**
2. Navigate to: `http://YOUR_LAN_IP:3000`
3. You should see a response from the server

If this works, the mobile app will work too!

### From Another Computer on Same Network

```bash
curl http://192.168.1.100:3000/health
```

## Troubleshooting

### Cannot Connect from Mobile Device

**Checklist:**

- [ ] Server is running (`npm start`)
- [ ] Mobile device is on the same WiFi network
- [ ] Used correct LAN IP address (not localhost or 10.0.2.2)
- [ ] Firewall allows connections on port 3000
- [ ] No VPN is active on either device
- [ ] Router doesn't block device-to-device communication

**Test Steps:**

1. **Verify server is accessible locally:**
   ```bash
   curl http://localhost:3000/health
   ```

2. **Verify server is accessible via LAN IP:**
   ```bash
   curl http://YOUR_LAN_IP:3000/health
   ```

3. **Test from mobile browser:**
   - Open browser on phone
   - Go to `http://YOUR_LAN_IP:3000`
   - Should see server response

4. **Check firewall:**
   - Temporarily disable firewall to test
   - If it works, add firewall rule for port 3000

5. **Check router settings:**
   - Some routers have "AP Isolation" or "Client Isolation"
   - This prevents devices from communicating with each other
   - Disable this feature in router settings

### Wrong IP Address

If the server shows multiple IP addresses, use the one that matches your WiFi network:

- Usually starts with `192.168.x.x` or `10.0.x.x`
- Avoid addresses starting with `169.254.x.x` (link-local)
- If unsure, try each one

### Connection Timeout

- Increase timeout in mobile app if needed
- Check if antivirus is blocking connections
- Verify no proxy settings on mobile device

### Server Shows No LAN Addresses

- Ensure you're connected to WiFi (not just ethernet)
- Check network adapter is enabled
- Restart network adapter
- Try connecting to a different WiFi network

## Network Commands Reference

### View Network Information

```bash
# Show all network info
npm run network

# macOS/Linux - Show IP addresses
ifconfig

# macOS/Linux - Show only IPv4 addresses
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows - Show IP addresses
ipconfig

# Check if port 3000 is in use
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows
```

### Test Connectivity

```bash
# Test from same machine
curl http://localhost:3000/health

# Test from LAN
curl http://YOUR_LAN_IP:3000/health

# Test with verbose output
curl -v http://YOUR_LAN_IP:3000/health

# Test from mobile device (in terminal app)
curl http://YOUR_LAN_IP:3000/health
```

## Security Considerations

### Development

- LAN access is safe for development on trusted networks
- Only devices on your local network can access the server
- Firewall provides additional protection

### Production

For production deployment:

1. **Use HTTPS** with valid SSL certificate
2. **Configure proper firewall rules**
3. **Use environment variables** for sensitive config
4. **Enable authentication** on all endpoints
5. **Use reverse proxy** (nginx, Apache)
6. **Implement rate limiting** (already included)
7. **Monitor access logs**

## Advanced Configuration

### Custom Port

To use a different port, update `.env`:

```env
PORT=8080
```

Then update mobile app config accordingly.

### Multiple Network Interfaces

If you have multiple network adapters (WiFi, Ethernet, VPN), the server will listen on all of them. Use the IP address of the interface your mobile device can reach.

### Docker/Container Setup

If running in Docker, ensure port mapping:

```bash
docker run -p 3000:3000 your-image
```

And use host machine's IP address, not container IP.

## Quick Reference

| Scenario | Server Command | Mobile App Config |
|----------|---------------|-------------------|
| **Android Emulator** | `npm start` | `http://10.0.2.2:3000/api` |
| **iOS Simulator** | `npm start` | `http://localhost:3000/api` |
| **Physical Device** | `npm start` | `http://YOUR_LAN_IP:3000/api` |
| **Show Network Info** | `npm run network` | - |

## Support

If you're still having issues:

1. Check server logs for errors
2. Check mobile app logs: `flutter logs`
3. Verify network connectivity: `ping YOUR_LAN_IP`
4. Test with browser first before mobile app
5. Review `NETWORK_TROUBLESHOOTING.md` in student_app folder
