# Deployment Configuration Guide

## API Base URL Configuration

The Student App's API base URL is centralized in a single file for easy deployment configuration.

### Configuration File Location

```
student_app/lib/config/api_config.dart
```

### How to Update the API URL

1. Open `student_app/lib/config/api_config.dart`
2. Locate the `baseUrl` constant (around line 30)
3. Update it based on your deployment environment:

#### Local Development (Android Emulator)
```dart
static const String baseUrl = 'http://10.0.2.2:3000/api';
```

#### Local Development (iOS Simulator)
```dart
static const String baseUrl = 'http://localhost:3000/api';
```

#### Local Development (Physical Device)
Replace `YOUR_COMPUTER_IP` with your computer's local IP address:
```dart
static const String baseUrl = 'http://192.168.1.100:3000/api';
```

To find your computer's IP:
- **macOS/Linux**: Run `ifconfig` or `ip addr`
- **Windows**: Run `ipconfig`

#### Production Deployment
```dart
static const String baseUrl = 'https://your-domain.com/api';
```

### After Changing the URL

1. Save the file
2. Rebuild the app:
   ```bash
   flutter clean
   flutter run
   ```

### Quick Deployment Checklist

- [ ] Update `baseUrl` in `lib/config/api_config.dart`
- [ ] Ensure backend server is running and accessible
- [ ] Test authentication (login/register)
- [ ] Test QR code scanning
- [ ] Test profile updates
- [ ] Test attendance history

### Environment-Specific Builds

For production builds, always use HTTPS:
```bash
# Build for Android
flutter build apk --release

# Build for iOS
flutter build ios --release
```

### Troubleshooting

**Connection Refused Error:**
- Verify the backend server is running
- Check firewall settings
- Ensure the IP address/domain is correct
- For physical devices, ensure they're on the same network

**SSL/Certificate Errors (Production):**
- Ensure your SSL certificate is valid
- Check that the domain matches the certificate
- Verify HTTPS is properly configured on the backend

### Security Notes

- Never commit production URLs with sensitive information to version control
- Use environment variables or build configurations for sensitive data
- Always use HTTPS in production
- Consider using different API keys for development and production
