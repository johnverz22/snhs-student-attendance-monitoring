import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../config/api_config.dart';
import '../services/auth_service.dart';

/// Test screen for FCM token registration
/// Add this to test Firebase manually
class TestFCMScreen extends StatefulWidget {
  const TestFCMScreen({super.key});

  @override
  State<TestFCMScreen> createState() => _TestFCMScreenState();
}

class _TestFCMScreenState extends State<TestFCMScreen> {
  String _status = 'Ready to test';
  String? _fcmToken;
  bool _isLoading = false;

  Future<void> _testFCM() async {
    setState(() {
      _isLoading = true;
      _status = 'Testing FCM...';
    });

    try {
      // Step 1: Request notification permission
      setState(() => _status = 'Step 1: Requesting permission...');
      final messaging = FirebaseMessaging.instance;
      final settings = await messaging.requestPermission(
        alert: true,
        badge: true,
        sound: true,
      );

      if (settings.authorizationStatus == AuthorizationStatus.authorized) {
        setState(() => _status = 'Step 1: ✅ Permission granted');
      } else {
        setState(() => _status = 'Step 1: ❌ Permission denied');
        return;
      }

      await Future.delayed(const Duration(seconds: 1));

      // Step 2: Get FCM token
      setState(() => _status = 'Step 2: Getting FCM token...');
      final token = await messaging.getToken();

      if (token != null) {
        setState(() {
          _fcmToken = token;
          _status = 'Step 2: ✅ Got FCM token\n${token.substring(0, 50)}...';
        });
      } else {
        setState(() => _status = 'Step 2: ❌ FCM token is null');
        return;
      }

      await Future.delayed(const Duration(seconds: 1));

      // Step 3: Register with backend
      setState(() => _status = 'Step 3: Registering with backend...');
      final authService = AuthService();
      final authToken = await authService.getToken();

      if (authToken == null) {
        setState(() => _status = 'Step 3: ❌ Not logged in');
        return;
      }

      final response = await http.post(
        Uri.parse(ApiConfig.getFullUrl(ApiConfig.registerPushToken)),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $authToken',
        },
        body: jsonEncode({'deviceToken': token, 'platform': 'android'}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] == true) {
          setState(
            () =>
                _status = 'Step 3: ✅ Registered successfully!\n\nAll done! 🎉',
          );
        } else {
          setState(
            () => _status = 'Step 3: ❌ Backend error: ${data['message']}',
          );
        }
      } else {
        setState(() => _status = 'Step 3: ❌ HTTP ${response.statusCode}');
      }
    } catch (e, stackTrace) {
      setState(
        () => _status =
            '❌ Error: $e\n\nStack: ${stackTrace.toString().substring(0, 200)}',
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Test FCM')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'FCM Token Test',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(_status, style: const TextStyle(fontSize: 14)),
                    if (_fcmToken != null) ...[
                      const SizedBox(height: 16),
                      const Text(
                        'Full Token:',
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      SelectableText(
                        _fcmToken!,
                        style: const TextStyle(fontSize: 12),
                      ),
                      const SizedBox(height: 8),
                      ElevatedButton.icon(
                        onPressed: () {
                          Clipboard.setData(ClipboardData(text: _fcmToken!));
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Token copied!')),
                          );
                        },
                        icon: const Icon(Icons.copy),
                        label: const Text('Copy Token'),
                      ),
                    ],
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            FilledButton(
              onPressed: _isLoading ? null : _testFCM,
              child: _isLoading
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Text('Test FCM Registration'),
            ),
            const SizedBox(height: 16),
            const Card(
              color: Colors.blueAccent,
              child: Padding(
                padding: EdgeInsets.all(12.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Instructions:',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    SizedBox(height: 8),
                    Text(
                      '1. Tap "Test FCM Registration"\n'
                      '2. Allow notifications if prompted\n'
                      '3. Watch the status messages\n'
                      '4. If successful, token is registered!',
                      style: TextStyle(fontSize: 13),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
