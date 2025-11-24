# Parent App Setup Guide

This guide covers the initial setup completed for the Parent App Flutter project.

## ✅ Completed Setup Tasks

### 1. Project Initialization
- Created Flutter project with package name: `com.schoolattendance.parent_app`
- Configured project structure with proper organization

### 2. Dependencies Added
The following packages have been added to `pubspec.yaml`:

- **http** (^1.1.0) - HTTP client for REST API communication
- **shared_preferences** (^2.2.2) - Local storage for authentication tokens
- **pushy_flutter** (^2.0.15) - Push notification service integration
- **provider** (^6.1.1) - State management solution
- **intl** (^0.19.0) - Date and time formatting utilities

### 3. Directory Structure
Created the following directory structure under `lib/`:

```
lib/
├── config/          # API configuration and constants
│   └── api_config.dart
├── models/          # Data models (ready for implementation)
├── screens/         # UI screens (ready for implementation)
├── services/        # Business logic and API services (ready for implementation)
├── widgets/         # Reusable UI components (ready for implementation)
└── main.dart        # Application entry point with placeholder UI
```

### 4. Push Notification Permissions

#### Android Permissions (AndroidManifest.xml)
Added the following permissions:
- `INTERNET` - Network communication
- `POST_NOTIFICATIONS` - Display notifications (Android 13+)
- `WAKE_LOCK` - Keep device awake for notifications
- `RECEIVE_BOOT_COMPLETED` - Restart service after device reboot

#### iOS Configuration
- iOS push notifications are configured through Xcode capabilities
- Background modes will need to be enabled in Xcode for remote notifications

### 5. API Configuration
Created `lib/config/api_config.dart` with:
- Base URL configuration (default: `http://10.0.2.2:3000/api` for Android emulator)
- All parent-related API endpoints
- Helper methods for URL construction

### 6. Basic App Structure
- Created placeholder main.dart with Material Design 3 theme
- Set up blue color scheme matching the design requirements
- Added placeholder screen to verify setup

## 🔧 Configuration Required

Before implementing features, you'll need to:

1. **Update API Base URL** in `lib/config/api_config.dart`:
   - For physical Android device: Use your computer's IP address
   - For iOS simulator: Use `localhost` or `127.0.0.1`
   - For production: Use your server's domain

2. **Configure Pushy**:
   - Sign up at https://pushy.me
   - Get your Pushy App Key
   - Add initialization code in the app

3. **iOS Setup** (if targeting iOS):
   - Open `ios/Runner.xcworkspace` in Xcode
   - Enable Push Notifications capability
   - Enable Background Modes > Remote notifications
   - Configure signing and provisioning

## 📋 Next Implementation Tasks

The project is now ready for the following tasks:

- **Task 24**: Implement parent authentication with student linking
- **Task 25**: Implement push notification service
- **Task 26**: Implement notifications dashboard
- **Task 27**: Implement student attendance history view
- **Task 28**: Implement UI polish and navigation

## 🧪 Testing

Run the basic widget test to verify setup:
```bash
flutter test
```

Run the app to see the placeholder screen:
```bash
flutter run
```

## 📦 Dependencies Installation

Dependencies have been installed. To reinstall or update:
```bash
flutter pub get
```

## 🔍 Code Analysis

The project passes Flutter analysis with no issues:
```bash
flutter analyze
```

## 📱 Platform Support

The project is configured for:
- ✅ Android (API 21+)
- ✅ iOS (iOS 12+)
- ⚠️ Web (not configured for push notifications)
- ⚠️ Desktop (not configured for push notifications)

## Requirements Addressed

This setup addresses:
- **Requirement 6.1**: Foundation for parent account creation and authentication
- **Requirement 7.3**: Push notification device registration infrastructure

## Notes

- The project uses Material Design 3 for a modern, clean interface
- Provider is set up for state management (can be replaced with Riverpod if preferred)
- All directories have `.gitkeep` files to ensure they're tracked in version control
- The placeholder UI demonstrates the app theme and basic structure
