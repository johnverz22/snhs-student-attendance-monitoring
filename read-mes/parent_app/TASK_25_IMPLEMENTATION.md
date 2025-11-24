# Task 25: Push Notification Service Implementation

## Overview
This document describes the implementation of the push notification service for the Parent App, enabling real-time attendance notifications using Pushy.

## Implementation Summary

### 1. Notification Model (`lib/models/notification.dart`)
Created a comprehensive notification model that:
- Represents attendance notifications with all relevant data
- Supports parsing from both API responses and push notification payloads
- Includes read/unread status tracking
- Provides JSON serialization for local storage

**Key Features:**
- `fromJson()` - Parse from API response
- `fromPushPayload()` - Parse from Pushy notification payload
- `toJson()` - Serialize for storage
- `copyWith()` - Create modified copies (for marking as read)

### 2. Notification Service (`lib/services/notification_service.dart`)
Implemented a full-featured notification service that:
- Initializes Pushy SDK
- Registers device tokens with the backend
- Listens for incoming push notifications
- Stores notification history locally
- Manages read/unread status
- Provides notification filtering by student

**Key Methods:**
- `initialize()` - Initialize Pushy SDK and set up listeners
- `registerDeviceToken()` - Register device with backend server
- `markAsRead()` - Mark individual notification as read
- `markAllAsRead()` - Mark all notifications as read
- `getNotificationsForStudent()` - Filter notifications by student
- `clearStoredData()` - Clear all data on logout

**Storage:**
- Notification history stored in SharedPreferences
- Maximum 100 notifications kept in history
- Device token cached locally

### 3. Integration with Main App (`lib/main.dart`)
Updated the app initialization to:
- Add NotificationService as a provider
- Make it available throughout the app via Provider pattern
- Use MultiProvider to manage both AuthProvider and NotificationService

### 4. Home Screen Integration (`lib/screens/home_screen.dart`)
Enhanced the home screen to:
- Initialize notification service on screen load
- Register device token with backend after initialization
- Display notification badge with unread count
- Clear notification data on logout
- Show notification icon in app bar

**UI Features:**
- Notification bell icon in app bar
- Red badge showing unread count
- Automatic initialization on first load
- Error handling with user feedback

### 5. API Configuration (`lib/config/api_config.dart`)
Updated to use the correct backend endpoint:
- Changed from `/parent/push-token` to `/parent/device-token`
- Matches the actual backend implementation

## Backend Integration

The service integrates with the following backend endpoint:
- **POST** `/api/parent/device-token` - Register device token
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ "deviceToken": "...", "platform": "android|ios" }`

## Notification Flow

1. **App Launch:**
   - User logs in
   - HomeScreen initializes
   - NotificationService.initialize() is called
   - Pushy SDK registers device and gets token
   - Token is sent to backend server

2. **Receiving Notifications:**
   - Student scans QR code at school
   - Backend validates and logs attendance
   - Backend sends push notification via Pushy
   - Pushy delivers to parent's device
   - NotificationService receives and stores notification
   - UI updates with new unread count

3. **Notification Storage:**
   - Notifications stored in SharedPreferences
   - Persists across app restarts
   - Limited to 100 most recent notifications
   - Includes read/unread status

## Platform Configuration

### Android
Permissions already configured in `AndroidManifest.xml`:
- `android.permission.INTERNET`
- `android.permission.POST_NOTIFICATIONS`
- `android.permission.WAKE_LOCK`
- `android.permission.RECEIVE_BOOT_COMPLETED`

### iOS
Standard iOS notification permissions handled by Pushy SDK automatically.

## Testing Recommendations

To test the notification service:

1. **Device Registration:**
   - Log in to the app
   - Check console for "Pushy device token: ..." message
   - Verify token is sent to backend

2. **Notification Reception:**
   - Have a student scan QR code
   - Verify notification appears on parent's device
   - Check notification badge updates
   - Verify notification is stored in history

3. **Notification Management:**
   - Test marking notifications as read
   - Test clearing all notifications
   - Test filtering by student
   - Verify persistence across app restarts

## Future Enhancements

The following features are planned for future tasks:
- Notifications dashboard screen (Task 26)
- Notification detail view
- Notification filtering and search
- Custom notification sounds
- Notification preferences/settings

## Dependencies

- `pushy_flutter: ^2.0.15` - Push notification SDK
- `shared_preferences: ^2.2.2` - Local storage
- `http: ^1.1.0` - HTTP client for API calls
- `provider: ^6.1.1` - State management

## Files Created/Modified

### Created:
- `lib/models/notification.dart` - Notification data model
- `lib/services/notification_service.dart` - Notification service implementation
- `parent_app/TASK_25_IMPLEMENTATION.md` - This documentation

### Modified:
- `lib/main.dart` - Added NotificationService provider
- `lib/screens/home_screen.dart` - Added notification initialization and UI
- `lib/config/api_config.dart` - Fixed endpoint path

## Requirements Satisfied

This implementation satisfies the following requirements:

- **7.1** - Notification triggering on successful attendance log
- **7.2** - Push notification delivery via Pushy Service
- **7.3** - Device registration with Pushy Service
- **7.4** - Notification display with student name and timestamp
- **7.5** - Notification history storage within application

## Notes

- The notification service is initialized automatically when the user logs in
- Device token registration happens in the background
- Notifications are stored locally for offline access
- The service handles errors gracefully with user feedback
- All notification data is cleared on logout for privacy
