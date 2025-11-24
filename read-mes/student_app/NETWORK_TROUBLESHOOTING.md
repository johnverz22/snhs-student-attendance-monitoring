# Network Troubleshooting Guide

## Common Network Errors and Solutions

### 1. Connection Refused / Network Error on Login

#### Symptoms:
- "Network error" message when trying to login
- "Connection refused" error
- App cannot reach the backend server

#### Solutions:

**A. Check API Base URL Configuration**

1. Open `lib/config/api_config.dart`
2. Verify the `baseUrl` matches your setup:

   **For Android Emulator:**
   ```dart
   static const String baseUrl = 'http://10.0.2.2:3000/api';
   ```
   
   **For iOS Simulator:**
   ```dart
   static const String baseUrl = 'http://localhost:3000/api';
   ```
   
   **For Physical Device (same WiFi network):**
   ```dart
   static const String baseUrl = 'http://YOUR_COMPUTER_IP:3000/api';
   ```

**B. Find Your Computer's IP Address**

- **macOS/Linux:**
  ```bash
  ifconfig | grep "inet " | grep -v 127.0.0.1
  ```
  
- **Windows:**
  ```bash
  ipconfig
  ```
  Look for "IPv4 Address" under your active network adapter.

**C. Verify Backend Server is Running**

```bash
# In the project root directory
node src/index.js
```

Server should show: `Server running on port 3000`

**D. Test Backend Connectivity**

From your terminal:
```bash
# Replace with your actual IP if using physical device
curl http://10.0.2.2:3000/api/health
```

**E. Check Firewall Settings**

- Ensure your firewall allows connections on port 3000
- On macOS: System Preferences → Security & Privacy → Firewall
- On Windows: Windows Defender Firewall → Allow an app

**F. Rebuild the App**

After changing the API URL:
```bash
cd student_app
flutter clean
flutter run
```

### 2. SSL/Certificate Errors

#### Symptoms:
- "Certificate verification failed"
- "SSL handshake failed"

#### Solutions:

**For Development (HTTP):**
- The app is already configured to allow HTTP traffic
- Network security config is set in `android/app/src/main/res/xml/network_security_config.xml`

**For Production (HTTPS):**
- Ensure your backend has a valid SSL certificate
- Update `baseUrl` to use `https://`
- Remove `cleartextTrafficPermitted="true"` from network_security_config.xml

### 3. Timeout Errors

#### Symptoms:
- Request takes too long and times out
- "Connection timeout" error

#### Solutions:

1. **Check Network Speed:**
   - Ensure stable internet/WiFi connection
   - Try moving closer to WiFi router

2. **Increase Timeout (if needed):**
   Edit service files to add timeout:
   ```dart
   final response = await http.post(
     Uri.parse(ApiConfig.authLogin),
     headers: headers,
     body: body,
   ).timeout(const Duration(seconds: 30));
   ```

### 4. CORS Errors (Web Only)

If running on web, you may see CORS errors. The backend should already have CORS enabled, but verify:

```javascript
// In src/index.js
app.use(cors());
```

### 5. Physical Device Cannot Connect

#### Checklist:

- [ ] Device and computer are on the same WiFi network
- [ ] Used computer's IP address (not localhost or 10.0.2.2)
- [ ] Firewall allows incoming connections on port 3000
- [ ] Backend server is running
- [ ] No VPN is interfering with local network

#### Test Connection:

On your phone's browser, navigate to:
```
http://YOUR_COMPUTER_IP:3000
```

You should see a response from the server.

## Quick Diagnostic Commands

```bash
# 1. Check if backend is running
curl http://localhost:3000/api/health

# 2. Check if port 3000 is in use
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# 3. Test from emulator (run in terminal)
adb shell
curl http://10.0.2.2:3000/api/health

# 4. View Flutter logs
flutter logs
```

## Network Security Configuration

The app includes a network security configuration file that allows HTTP traffic for development:

**Location:** `android/app/src/main/res/xml/network_security_config.xml`

**⚠️ IMPORTANT:** Before deploying to production:
1. Change `baseUrl` to use HTTPS
2. Update network_security_config.xml to restrict cleartext traffic
3. Remove `android:usesCleartextTraffic="true"` from AndroidManifest.xml

## Still Having Issues?

1. **Check Flutter Doctor:**
   ```bash
   flutter doctor -v
   ```

2. **Clear App Data:**
   - Uninstall the app from device/emulator
   - Reinstall with `flutter run`

3. **Check Logs:**
   ```bash
   flutter logs | grep -i error
   ```

4. **Verify Backend Logs:**
   - Check terminal where backend is running
   - Look for incoming request logs
   - Check for any error messages

## Production Deployment Checklist

Before deploying to production:

- [ ] Update `baseUrl` to production HTTPS URL
- [ ] Remove or restrict cleartext traffic in network_security_config.xml
- [ ] Test all API endpoints with production URL
- [ ] Verify SSL certificate is valid
- [ ] Test on both Android and iOS
- [ ] Test on physical devices
- [ ] Monitor backend logs for errors
