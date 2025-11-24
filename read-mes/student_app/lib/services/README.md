# Student App Services

## Authentication Service

The authentication system consists of two main components:

### 1. AuthService (`auth_service.dart`)

Handles all API communication for authentication:

- **login()** - Authenticates student with email and password
- **register()** - Creates new student account
- **getToken()** - Retrieves stored JWT token
- **getStudent()** - Retrieves stored student data
- **isLoggedIn()** - Checks if user has valid session
- **logout()** - Clears stored credentials
- **getAuthHeaders()** - Returns headers with Bearer token for API calls

**Configuration:**
Update the `baseUrl` constant in `auth_service.dart` to match your backend server URL.

```dart
static const String baseUrl = 'http://your-server-url:3000/api';
```

### 2. AuthProvider (`auth_provider.dart`)

State management for authentication using Provider pattern:

- Manages authentication state across the app
- Provides reactive updates to UI components
- Handles loading states and error messages
- Exposes methods: `login()`, `register()`, `logout()`, `initialize()`

**Usage in widgets:**
```dart
final authProvider = Provider.of<AuthProvider>(context);

// Check authentication state
if (authProvider.isAuthenticated) {
  // User is logged in
}

// Access current student
final student = authProvider.student;

// Show loading indicator
if (authProvider.isLoading) {
  // Show loading UI
}

// Display error message
if (authProvider.errorMessage != null) {
  // Show error
}
```

## Token Storage

Authentication tokens are securely stored using `shared_preferences`:

- JWT tokens are stored locally on the device
- Tokens persist across app restarts
- Tokens are cleared on logout

## Error Handling

The authentication service returns structured error responses:

- `NETWORK_ERROR` - Connection issues
- `LOGIN_FAILED` - Invalid credentials
- `REGISTRATION_FAILED` - Registration error
- Custom error messages from backend

## Security Considerations

- Passwords are never stored locally
- JWT tokens are used for API authentication
- HTTPS should be used in production
- Tokens should have appropriate expiration times


## Profile Service (`profile_service.dart`)

Manages student profile data and synchronization with the server.

**Key Methods:**
- `getProfile()` - Fetch current profile from server
- `updateProfile(student)` - Update profile on server
- `refreshProfile()` - Sync local data with server

## QR Scanner Service (`qr_scanner_service.dart`)

Handles QR code scanning functionality.

**Key Methods:**
- `initController(controller)` - Initialize QR scanner
- `startScanning()` - Begin scanning for QR codes
- `pauseScanning()` - Pause scanning
- `stopScanning()` - Stop and cleanup scanner
- `toggleFlash()` - Toggle camera flash
- `flipCamera()` - Switch between front/back camera

## Location Service (`location_service.dart`)

Manages GPS location functionality and permissions.

**Key Methods:**
- `getCurrentLocation()` - Get current GPS coordinates
- `getCurrentLocationWithTimeout(timeout)` - Get location with timeout
- `isLocationServiceEnabled()` - Check if location services are enabled
- `checkPermission()` - Check and request location permissions
- `openLocationSettings()` - Open device location settings
- `openAppSettings()` - Open app settings

**Exceptions:**
- `LocationServiceDisabledException` - Location services disabled
- `PermissionDeniedException` - Location permission denied
- `TimeoutException` - Location request timed out

**Usage:**
```dart
final locationService = LocationService();

try {
  final position = await locationService.getCurrentLocationWithTimeout(
    timeout: Duration(seconds: 10),
  );
  print('Lat: ${position.latitude}, Lng: ${position.longitude}');
} on LocationServiceDisabledException catch (e) {
  // Handle disabled location services
  await locationService.openLocationSettings();
} on PermissionDeniedException catch (e) {
  // Handle permission denied
  await locationService.openAppSettings();
} on TimeoutException catch (e) {
  // Handle timeout
}
```

## Attendance Service (`attendance_service.dart`)

Handles attendance operations and API communication.

**Key Methods:**
- `submitAttendanceScan(qrCode, position)` - Submit attendance with QR and GPS
- `getAttendanceHistory(...)` - Fetch attendance history
- `getErrorMessage(errorCode)` - Get user-friendly error messages

**Models:**
- `AttendanceResponse` - Response from attendance submission
- `AttendanceData` - Attendance details
- `AttendanceEntry` - Historical attendance entry

**Usage:**
```dart
final attendanceService = AttendanceService();
final locationService = LocationService();

// Get current location
final position = await locationService.getCurrentLocation();

// Submit attendance
final response = await attendanceService.submitAttendanceScan(
  qrCode: 'GATE_A_123',
  position: position,
);

if (response.success) {
  print('Attendance logged: ${response.data?.entryTime}');
} else {
  print('Error: ${response.message}');
}

// Get attendance history
final history = await attendanceService.getAttendanceHistory(
  limit: 10,
);
```

**Error Codes:**
- `QR_CODE_INVALID` - Invalid QR code
- `QR_CODE_EXPIRED` - QR code has expired
- `LOCATION_INVALID` - Not within school boundaries
- `ATTENDANCE_DUPLICATE` - Already logged attendance recently
- `AUTH_TOKEN_EXPIRED` - Session expired
- `NETWORK_ERROR` - Connection issues

## Permissions Required

### Android (`AndroidManifest.xml`)
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.INTERNET" />
```

### iOS (`Info.plist`)
```xml
<key>NSCameraUsageDescription</key>
<string>Camera access is required to scan QR codes for attendance</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>Location access is required to verify you are at school</string>
```
