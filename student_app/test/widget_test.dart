import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:student_app/services/auth_provider.dart';
import 'package:student_app/screens/login_screen.dart';
import 'package:student_app/screens/registration_screen.dart';
import 'package:student_app/screens/profile_screen.dart';
import 'package:student_app/screens/attendance_history_screen.dart';
import 'package:student_app/screens/qr_scanner_screen.dart';

void main() {
  group('Authentication Flow Tests', () {
    testWidgets('Login screen displays all required fields', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider(
            create: (_) => AuthProvider(),
            child: const LoginScreen(),
          ),
        ),
      );
      await tester.pump();

      // Verify form fields
      expect(find.text('Student Login'), findsOneWidget);
      expect(find.text('Email'), findsOneWidget);
      expect(find.text('Password'), findsOneWidget);
      expect(find.text('Login'), findsWidgets);
    });

    testWidgets('Login button is present', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider(
            create: (_) => AuthProvider(),
            child: const LoginScreen(),
          ),
        ),
      );
      await tester.pump();

      expect(find.widgetWithText(ElevatedButton, 'Login'), findsOneWidget);
    });

    testWidgets('Login screen has link to registration', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider(
            create: (_) => AuthProvider(),
            child: const LoginScreen(),
          ),
        ),
      );
      await tester.pump();

      expect(find.text('Create Account'), findsOneWidget);
    });

    testWidgets('Login form validates empty email', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider(
            create: (_) => AuthProvider(),
            child: const LoginScreen(),
          ),
        ),
      );
      await tester.pump();

      // Tap login without entering data
      await tester.tap(find.widgetWithText(ElevatedButton, 'Login'));
      await tester.pump();

      // Verify validation error
      expect(find.text('Please enter your email'), findsOneWidget);
    });

    testWidgets('Login form validates invalid email format', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider(
            create: (_) => AuthProvider(),
            child: const LoginScreen(),
          ),
        ),
      );
      await tester.pump();

      // Enter invalid email
      await tester.enterText(
        find.widgetWithText(TextFormField, 'Email'),
        'invalidemail',
      );
      await tester.tap(find.widgetWithText(ElevatedButton, 'Login'));
      await tester.pump();

      // Verify validation error
      expect(find.text('Please enter a valid email'), findsOneWidget);
    });

    testWidgets('Registration screen displays all required fields', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider(
            create: (_) => AuthProvider(),
            child: const RegistrationScreen(),
          ),
        ),
      );
      await tester.pump();

      // Verify form fields
      expect(find.text('Register as Student'), findsOneWidget);
      expect(find.text('Student ID'), findsOneWidget);
      expect(find.text('Full Name'), findsOneWidget);
      expect(find.text('Email'), findsOneWidget);
      expect(find.text('Password'), findsOneWidget);
      expect(find.text('Confirm Password'), findsOneWidget);
    });

    testWidgets('Registration form validates password match', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider(
            create: (_) => AuthProvider(),
            child: const RegistrationScreen(),
          ),
        ),
      );
      await tester.pump();

      // Scroll to make password fields visible
      await tester.ensureVisible(
        find.widgetWithText(TextFormField, 'Password'),
      );
      await tester.pump();

      // Enter mismatched passwords
      await tester.enterText(
        find.widgetWithText(TextFormField, 'Password'),
        'password123',
      );
      await tester.enterText(
        find.widgetWithText(TextFormField, 'Confirm Password'),
        'password456',
      );

      // Scroll to register button
      await tester.ensureVisible(find.widgetWithText(FilledButton, 'Register'));
      await tester.pump();

      await tester.tap(find.widgetWithText(FilledButton, 'Register'));
      await tester.pump();

      // Verify validation error
      expect(find.text('Passwords do not match'), findsOneWidget);
    });

    testWidgets('Registration form validates password length', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider(
            create: (_) => AuthProvider(),
            child: const RegistrationScreen(),
          ),
        ),
      );
      await tester.pump();

      // Scroll to password field
      await tester.ensureVisible(
        find.widgetWithText(TextFormField, 'Password'),
      );
      await tester.pump();

      // Enter short password
      await tester.enterText(
        find.widgetWithText(TextFormField, 'Password'),
        'short',
      );

      // Scroll to register button
      await tester.ensureVisible(find.widgetWithText(FilledButton, 'Register'));
      await tester.pump();

      await tester.tap(find.widgetWithText(FilledButton, 'Register'));
      await tester.pump();

      // Verify validation error
      expect(
        find.text('Password must be at least 8 characters'),
        findsOneWidget,
      );
    });

    testWidgets('Password visibility toggle works', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider(
            create: (_) => AuthProvider(),
            child: const LoginScreen(),
          ),
        ),
      );
      await tester.pump();

      // Find password field
      final passwordField = find.widgetWithText(TextFormField, 'Password');
      expect(passwordField, findsOneWidget);

      // Find visibility toggle button
      final visibilityToggle = find.descendant(
        of: passwordField,
        matching: find.byType(IconButton),
      );
      expect(visibilityToggle, findsOneWidget);

      // Tap to toggle visibility
      await tester.tap(visibilityToggle);
      await tester.pump();

      // Verify icon changed
      expect(find.byIcon(Icons.visibility_off_outlined), findsOneWidget);
    });
  });

  group('Profile Management Tests', () {
    testWidgets('Profile screen displays student information', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider(
            create: (_) => AuthProvider(),
            child: const ProfileScreen(),
          ),
        ),
      );
      await tester.pump();

      // Verify profile screen elements
      expect(find.text('Profile'), findsOneWidget);
      expect(find.text('Profile Information'), findsOneWidget);
      expect(find.text('Student ID'), findsOneWidget);
    });

    testWidgets('Profile screen has edit button', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider(
            create: (_) => AuthProvider(),
            child: const ProfileScreen(),
          ),
        ),
      );
      await tester.pump();

      // Wait for loading to complete
      await tester.pumpAndSettle(const Duration(seconds: 2));

      // Verify edit button exists
      expect(find.byIcon(Icons.edit), findsOneWidget);
    });

    testWidgets('Profile edit mode enables form fields', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider(
            create: (_) => AuthProvider(),
            child: const ProfileScreen(),
          ),
        ),
      );
      await tester.pump();

      // Wait for loading to complete
      await tester.pumpAndSettle(const Duration(seconds: 2));

      // Tap edit button
      await tester.tap(find.byIcon(Icons.edit));
      await tester.pump();

      // Verify save button appears
      expect(find.text('Save Changes'), findsOneWidget);
      // Verify cancel icon appears
      expect(find.byIcon(Icons.close), findsOneWidget);
    });

    testWidgets('Profile validates name field', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider(
            create: (_) => AuthProvider(),
            child: const ProfileScreen(),
          ),
        ),
      );
      await tester.pump();

      // Wait for loading to complete
      await tester.pumpAndSettle(const Duration(seconds: 2));

      // Enter edit mode
      await tester.tap(find.byIcon(Icons.edit));
      await tester.pump();

      // Clear name field
      final nameField = find.widgetWithText(TextFormField, 'Name');
      await tester.enterText(nameField, '');

      // Try to save
      await tester.tap(find.text('Save Changes'));
      await tester.pump();

      // Verify validation error
      expect(find.text('Name is required'), findsOneWidget);
    });

    testWidgets('Profile screen supports pull to refresh', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider(
            create: (_) => AuthProvider(),
            child: const ProfileScreen(),
          ),
        ),
      );
      await tester.pump();

      // Wait for loading to complete
      await tester.pumpAndSettle(const Duration(seconds: 2));

      // Verify RefreshIndicator exists
      expect(find.byType(RefreshIndicator), findsOneWidget);
    });
  });

  group('Attendance History Tests', () {
    testWidgets('Attendance history screen displays title', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        const MaterialApp(home: AttendanceHistoryScreen()),
      );
      await tester.pump();

      // Verify screen title
      expect(find.text('Attendance History'), findsOneWidget);
    });

    testWidgets('Attendance history shows loading indicator initially', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        const MaterialApp(home: AttendanceHistoryScreen()),
      );
      await tester.pump();

      // Verify loading indicator
      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });

    testWidgets('Attendance history shows empty state when no records', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        const MaterialApp(home: AttendanceHistoryScreen()),
      );
      await tester.pump();

      // Wait for loading to complete
      await tester.pumpAndSettle(const Duration(seconds: 2));

      // Verify empty state
      expect(find.text('No Attendance Records'), findsOneWidget);
      expect(find.byIcon(Icons.history), findsOneWidget);
    });

    testWidgets('Attendance history has refresh button', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        const MaterialApp(home: AttendanceHistoryScreen()),
      );
      await tester.pump();

      // Wait for loading to complete
      await tester.pumpAndSettle(const Duration(seconds: 2));

      // Verify refresh button exists
      expect(find.text('Refresh'), findsOneWidget);
    });

    testWidgets('Attendance history supports pull to refresh', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        const MaterialApp(home: AttendanceHistoryScreen()),
      );
      await tester.pump();

      // Wait for loading to complete
      await tester.pumpAndSettle(const Duration(seconds: 2));

      // Verify RefreshIndicator exists
      expect(find.byType(RefreshIndicator), findsOneWidget);
    });
  });

  group('QR Scanner Integration Tests', () {
    testWidgets('QR scanner screen displays title', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(const MaterialApp(home: QRScannerScreen()));
      await tester.pump();

      // Verify screen title
      expect(find.text('Scan QR Code'), findsOneWidget);
    });

    testWidgets('QR scanner shows instructions', (WidgetTester tester) async {
      await tester.pumpWidget(const MaterialApp(home: QRScannerScreen()));
      await tester.pump();

      // Verify instructions
      expect(
        find.text('Position the QR code within the frame'),
        findsOneWidget,
      );
    });

    testWidgets('QR scanner has flash toggle button', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(const MaterialApp(home: QRScannerScreen()));
      await tester.pump();

      // Verify flash toggle exists
      expect(find.byIcon(Icons.flash_off), findsOneWidget);
    });

    testWidgets('QR scanner shows scanning indicator', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(const MaterialApp(home: QRScannerScreen()));
      await tester.pump();

      // Verify scanning indicator
      expect(find.text('Scanning...'), findsOneWidget);
    });
  });
}
