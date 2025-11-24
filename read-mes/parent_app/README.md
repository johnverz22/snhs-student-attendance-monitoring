# Parent App - School Attendance System

The Parent App allows parents to monitor their children's school attendance and receive real-time notifications when students check in at school.

## Features

- Parent authentication with student linking
- Real-time push notifications for student attendance
- View attendance history for linked students
- Filter attendance by date range
- Simple, modern interface optimized for quick information access

## Project Structure

```
lib/
├── config/          # API configuration
├── models/          # Data models (Parent, Student, Attendance, Notification)
├── screens/         # UI screens
├── services/        # Business logic and API communication
├── widgets/         # Reusable UI components
└── main.dart        # Application entry point
```

## Dependencies

- **http**: HTTP client for API communication
- **shared_preferences**: Local storage for tokens and preferences
- **pushy_flutter**: Push notification service
- **provider**: State management
- **intl**: Date and time formatting

## Configuration

### API Configuration

Update `lib/config/api_config.dart` with your server's address:

```dart
static const String baseUrl = 'http://YOUR_SERVER_IP:3000/api';
```

- For Android emulator: `http://10.0.2.2:3000/api`
- For iOS simulator: `http://localhost:3000/api`
- For physical devices: `http://YOUR_COMPUTER_IP:3000/api`

### Push Notifications

The app uses Pushy for push notifications. You'll need to:

1. Sign up for a Pushy account at https://pushy.me
2. Get your Pushy App Key
3. Configure the Pushy SDK in the app initialization

## Permissions

### Android
- `INTERNET`: Network communication
- `POST_NOTIFICATIONS`: Display push notifications (Android 13+)
- `WAKE_LOCK`: Keep device awake for notifications
- `RECEIVE_BOOT_COMPLETED`: Restart notification service after reboot

### iOS
- Push notifications are configured through Xcode capabilities
- Background modes for remote notifications

## Getting Started

1. Install dependencies:
   ```bash
   flutter pub get
   ```

2. Run the app:
   ```bash
   flutter run
   ```

3. For Android:
   ```bash
   flutter run -d android
   ```

4. For iOS:
   ```bash
   flutter run -d ios
   ```

## Building for Production

### Android
```bash
flutter build apk --release
```

### iOS
```bash
flutter build ios --release
```

## Requirements Addressed

This setup addresses the following requirements:
- **Requirement 6.1**: Parent account creation and authentication
- **Requirement 7.3**: Push notification device registration

## Next Steps

The following tasks will implement the full functionality:
- Task 24: Parent authentication with student linking
- Task 25: Push notification service
- Task 26: Notifications dashboard
- Task 27: Student attendance history view
- Task 28: UI polish and navigation
