# Student Attendance App

Flutter mobile application for students to log attendance by scanning QR codes with GPS verification.

## Features Implemented

### ✅ Task 17: Authentication System (COMPLETED)

- **Login Screen** - Material Design 3 interface with email/password authentication
- **Registration Screen** - Complete student registration with validation
- **AuthService** - JWT token management and API communication
- **AuthProvider** - State management using Provider pattern
- **Secure Storage** - Token persistence using shared_preferences
- **Session Management** - Automatic authentication state handling

## Project Structure

```
lib/
├── main.dart                      # App entry point with Provider setup
├── models/
│   ├── student.dart              # Student data model
│   └── auth_response.dart        # Authentication response model
├── screens/
│   ├── login_screen.dart         # Login UI (Material Design 3)
│   ├── registration_screen.dart  # Registration UI
│   ├── home_screen.dart          # Main dashboard
│   └── README.md                 # Screen documentation
├── services/
│   ├── auth_service.dart         # API communication
│   ├── auth_provider.dart        # State management
│   └── README.md                 # Service documentation
└── widgets/                       # Reusable UI components (future)
```

## Dependencies

- **qr_code_scanner** (^1.0.1) - QR code scanning functionality
- **geolocator** (^13.0.2) - GPS location services
- **http** (^1.2.2) - HTTP client for API communication
- **shared_preferences** (^2.3.3) - Local data storage for tokens
- **provider** (^6.1.2) - State management

## Setup Instructions

### Prerequisites

- Flutter SDK (3.9.2 or higher)
- Dart SDK
- Android Studio / Xcode for mobile development
- Running backend server (Node.js)

### Installation

1. Install dependencies:
   ```bash
   flutter pub get
   ```

2. **Configure backend URL**:
   - Open `lib/services/auth_service.dart`
   - Update the `baseUrl` constant with your server URL:
   ```dart
   static const String baseUrl = 'http://your-server-url:3000/api';
   ```
   - For Android emulator: `http://10.0.2.2:3000/api`
   - For iOS simulator: `http://localhost:3000/api`
   - For physical device: `http://your-computer-ip:3000/api`

3. Run the app:
   ```bash
   flutter run
   ```

4. Analyze code:
   ```bash
   flutter analyze
   ```

## Authentication Flow

1. **App Launch** → Check for stored token
2. **Token Found** → Navigate to HomeScreen
3. **No Token** → Show LoginScreen
4. **Login/Register** → Store token → Navigate to HomeScreen
5. **Logout** → Clear token → Navigate to LoginScreen

## API Endpoints Used

- `POST /api/auth/student/login` - Student login
- `POST /api/auth/student/register` - Student registration

## UI Design

Following Material Design 3 guidelines:

- **Primary Color**: Blue (#2196F3)
- **Typography**: System default with appropriate weights
- **Components**: Filled buttons, outlined text fields, cards
- **Spacing**: Consistent 8px grid system (8, 16, 24, 32, 48)
- **Transitions**: Smooth page navigation
- **Input Fields**: Rounded corners (12px), filled background
- **Icons**: Outlined style for consistency

## Permissions

### Android
The following permissions are configured in `android/app/src/main/AndroidManifest.xml`:
- Camera access for QR code scanning
- Fine and coarse location access for GPS verification
- Internet access for API communication

### iOS
The following permissions are configured in `ios/Runner/Info.plist`:
- NSCameraUsageDescription - Camera access for QR code scanning
- NSLocationWhenInUseUsageDescription - Location access for attendance verification
- NSLocationAlwaysUsageDescription - Location access for attendance verification

## Requirements Addressed

### Task 17 Requirements (COMPLETED):
- **Requirement 1.1**: Student App provides registration interface ✅
- **Requirement 1.2**: Validates required fields before account creation ✅
- **Requirement 1.3**: Provides login interface accepting credentials ✅
- **Requirement 1.4**: Grants access to main features when credentials valid ✅
- **Requirement 1.5**: Stores authentication tokens securely ✅
- **Requirement 18.1**: Consistent color scheme throughout application ✅
- **Requirement 18.2**: Smooth transitions between screens ✅
- **Requirement 18.3**: Clear typography with appropriate sizes ✅
- **Requirement 18.4**: Intuitive navigation with recognizable icons ✅
- **Requirement 18.5**: Follows Flutter Material Design guidelines ✅

## Testing

Run Flutter analyzer:
```bash
flutter analyze
```

Run tests:
```bash
flutter test
```

## Next Steps

Upcoming features (from implementation plan):

- [ ] Task 18: Profile management
- [ ] Task 19: QR scanner functionality
- [ ] Task 20: Location service and attendance submission
- [ ] Task 21: Attendance confirmation and history
- [ ] Task 22: Navigation and UI polish

## Troubleshooting

**Issue**: Network error when logging in
- **Solution**: Ensure backend server is running and URL is correct in `auth_service.dart`

**Issue**: Token not persisting
- **Solution**: Check shared_preferences permissions

**Issue**: Build errors
- **Solution**: Run `flutter clean` then `flutter pub get`

**Issue**: Cannot connect from Android emulator
- **Solution**: Use `http://10.0.2.2:3000/api` instead of `localhost`

## Resources

- [Flutter Documentation](https://docs.flutter.dev/)
- [Material Design 3](https://m3.material.io/)
- [Provider Package](https://pub.dev/packages/provider)
- [Shared Preferences](https://pub.dev/packages/shared_preferences)
