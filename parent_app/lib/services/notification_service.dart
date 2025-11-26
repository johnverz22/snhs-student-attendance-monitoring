import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../models/notification.dart';

class NotificationService extends ChangeNotifier {
  static const String _notificationHistoryKey = 'notification_history';
  static const String _pushTokenKey = 'push_token';
  static const int _maxHistorySize = 100;

  List<AttendanceNotification> _notifications = [];
  String? _deviceToken;
  bool _isInitialized = false;
  final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;

  List<AttendanceNotification> get notifications => _notifications;
  String? get deviceToken => _deviceToken;
  bool get isInitialized => _isInitialized;

  int get unreadCount => _notifications.where((n) => !n.isRead).length;

  /// Initialize Firebase Cloud Messaging and set up notification listeners
  Future<void> initialize() async {
    if (_isInitialized) {
      debugPrint('NotificationService already initialized');
      return;
    }

    try {
      // Load notification history from local storage
      await _loadNotificationHistory();

      // Request notification permissions
      NotificationSettings settings = await _firebaseMessaging
          .requestPermission(
            alert: true,
            badge: true,
            sound: true,
            provisional: false,
          );

      if (settings.authorizationStatus == AuthorizationStatus.authorized) {
        debugPrint('User granted notification permission');
      } else if (settings.authorizationStatus ==
          AuthorizationStatus.provisional) {
        debugPrint('User granted provisional notification permission');
      } else {
        debugPrint('User declined or has not accepted notification permission');
      }

      // Get FCM token
      debugPrint('📱 Requesting FCM token from Firebase...');
      _deviceToken = await _firebaseMessaging.getToken();

      if (_deviceToken != null) {
        debugPrint(
          '✅ FCM device token received: ${_deviceToken!.substring(0, 50)}...',
        );
        await _saveDeviceToken(_deviceToken!);
      } else {
        debugPrint(
          '❌ FCM token is null! Firebase might not be configured properly.',
        );
        debugPrint(
          '   Check: google-services.json (Android) or GoogleService-Info.plist (iOS)',
        );
      }

      // Listen for token refresh
      _firebaseMessaging.onTokenRefresh.listen((newToken) {
        debugPrint('FCM token refreshed: $newToken');
        _deviceToken = newToken;
        _saveDeviceToken(newToken);
      });

      // Set up foreground message handler
      FirebaseMessaging.onMessage.listen(_onForegroundMessage);

      // Set up background message click handler
      FirebaseMessaging.onMessageOpenedApp.listen(_onMessageOpenedApp);

      // Check if app was opened from a terminated state via notification
      RemoteMessage? initialMessage = await _firebaseMessaging
          .getInitialMessage();
      if (initialMessage != null) {
        _handleNotificationClick(initialMessage);
      }

      _isInitialized = true;
      notifyListeners();

      debugPrint('NotificationService initialized successfully');
    } catch (e) {
      debugPrint('Error initializing NotificationService: $e');
      rethrow;
    }
  }

  /// Register device token with backend server
  Future<bool> registerDeviceToken(String authToken) async {
    if (_deviceToken == null) {
      debugPrint('No device token available');
      return false;
    }

    try {
      final url = Uri.parse(ApiConfig.getFullUrl(ApiConfig.registerPushToken));
      final response = await http.post(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $authToken',
        },
        body: jsonEncode({
          'deviceToken': _deviceToken,
          'platform': defaultTargetPlatform == TargetPlatform.iOS
              ? 'ios'
              : 'android',
        }),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = jsonDecode(response.body);
        debugPrint('Device token registered successfully: ${data['message']}');
        return true;
      } else {
        debugPrint('Failed to register device token: ${response.statusCode}');
        debugPrint('Response: ${response.body}');
        return false;
      }
    } catch (e) {
      debugPrint('Error registering device token: $e');
      return false;
    }
  }

  /// Handle foreground messages
  void _onForegroundMessage(RemoteMessage message) {
    debugPrint('Foreground message received: ${message.messageId}');
    debugPrint('Notification: ${message.notification?.title}');
    debugPrint('Data: ${message.data}');

    try {
      final notification = AttendanceNotification.fromFCMMessage(message);
      _addNotification(notification);
    } catch (e) {
      debugPrint('Error processing foreground message: $e');
    }
  }

  /// Handle notification opened from background
  void _onMessageOpenedApp(RemoteMessage message) {
    debugPrint('Notification opened app: ${message.messageId}');
    _handleNotificationClick(message);
  }

  /// Handle notification click
  void _handleNotificationClick(RemoteMessage message) {
    debugPrint('Notification clicked: ${message.data}');

    try {
      final notification = AttendanceNotification.fromFCMMessage(message);
      // Mark as read when clicked
      markAsRead(notification.studentId, notification.timestamp);
    } catch (e) {
      debugPrint('Error processing notification click: $e');
    }
  }

  /// Add a notification to the history
  void _addNotification(AttendanceNotification notification) {
    // Add to the beginning of the list (most recent first)
    _notifications.insert(0, notification);

    // Limit history size
    if (_notifications.length > _maxHistorySize) {
      _notifications = _notifications.sublist(0, _maxHistorySize);
    }

    // Save to local storage
    _saveNotificationHistory();

    notifyListeners();
  }

  /// Mark a notification as read
  void markAsRead(int studentId, DateTime timestamp) {
    final index = _notifications.indexWhere(
      (n) => n.studentId == studentId && n.timestamp == timestamp,
    );

    if (index != -1) {
      _notifications[index] = _notifications[index].copyWith(isRead: true);
      _saveNotificationHistory();
      notifyListeners();
    }
  }

  /// Mark all notifications as read
  void markAllAsRead() {
    _notifications = _notifications
        .map((n) => n.copyWith(isRead: true))
        .toList();
    _saveNotificationHistory();
    notifyListeners();
  }

  /// Clear all notifications
  void clearAll() {
    _notifications.clear();
    _saveNotificationHistory();
    notifyListeners();
  }

  /// Get notifications for a specific student
  List<AttendanceNotification> getNotificationsForStudent(int studentId) {
    return _notifications.where((n) => n.studentId == studentId).toList();
  }

  /// Load notification history from local storage
  Future<void> _loadNotificationHistory() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final historyJson = prefs.getString(_notificationHistoryKey);

      if (historyJson != null) {
        final List<dynamic> decoded = jsonDecode(historyJson);
        _notifications = decoded
            .map((json) => AttendanceNotification.fromJson(json))
            .toList();
        debugPrint(
          'Loaded ${_notifications.length} notifications from storage',
        );
      }
    } catch (e) {
      debugPrint('Error loading notification history: $e');
      _notifications = [];
    }
  }

  /// Save notification history to local storage
  Future<void> _saveNotificationHistory() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final historyJson = jsonEncode(
        _notifications.map((n) => n.toJson()).toList(),
      );
      await prefs.setString(_notificationHistoryKey, historyJson);
    } catch (e) {
      debugPrint('Error saving notification history: $e');
    }
  }

  /// Save device token to local storage
  Future<void> _saveDeviceToken(String token) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_pushTokenKey, token);
    } catch (e) {
      debugPrint('Error saving device token: $e');
    }
  }

  /// Clear all stored data (for logout)
  Future<void> clearStoredData() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_notificationHistoryKey);
      await prefs.remove(_pushTokenKey);
      _notifications.clear();
      _deviceToken = null;
      _isInitialized = false;
      notifyListeners();
    } catch (e) {
      debugPrint('Error clearing notification data: $e');
    }
  }
}
