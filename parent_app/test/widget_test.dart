import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:parent_app/main.dart';
import 'package:parent_app/screens/login_screen.dart';
import 'package:parent_app/screens/registration_screen.dart';
import 'package:provider/provider.dart';
import 'package:parent_app/services/auth_provider.dart';

void main() {
  testWidgets('Parent App loads successfully', (WidgetTester tester) async {
    // Build our app and trigger a frame
    await tester.pumpWidget(const ParentApp());

    // Wait for a few frames (not full settle due to async initialization)
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 100));

    // Verify that the app loads (either loading indicator or login screen)
    expect(find.byType(MaterialApp), findsOneWidget);
  });

  testWidgets('Login screen displays correctly', (WidgetTester tester) async {
    // Create a test app with just the login screen
    await tester.pumpWidget(
      ChangeNotifierProvider(
        create: (_) => AuthProvider(),
        child: MaterialApp(home: const LoginScreen()),
      ),
    );

    // Verify that the login screen is displayed
    expect(find.text('Parent Portal'), findsOneWidget);
    expect(find.text('Monitor your child\'s attendance'), findsOneWidget);

    // Verify the family icon is displayed
    expect(find.byIcon(Icons.family_restroom), findsOneWidget);

    // Verify login form fields are present
    expect(find.text('Email'), findsOneWidget);
    expect(find.text('Password'), findsOneWidget);
    expect(find.widgetWithText(FilledButton, 'Login'), findsOneWidget);
  });

  testWidgets('Login screen has register link', (WidgetTester tester) async {
    await tester.pumpWidget(
      ChangeNotifierProvider(
        create: (_) => AuthProvider(),
        child: MaterialApp(home: const LoginScreen()),
      ),
    );

    // Verify register link is present
    expect(find.text("Don't have an account? "), findsOneWidget);
    expect(find.widgetWithText(TextButton, 'Register'), findsOneWidget);
  });

  testWidgets('Can navigate to registration screen', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      ChangeNotifierProvider(
        create: (_) => AuthProvider(),
        child: MaterialApp(home: const LoginScreen()),
      ),
    );

    // Tap the register button
    await tester.tap(find.widgetWithText(TextButton, 'Register'));
    await tester.pumpAndSettle();

    // Verify registration screen is displayed
    expect(find.text('Create Parent Account'), findsOneWidget);
    expect(find.text('Register as Parent'), findsOneWidget);
    expect(find.text('Link Students'), findsOneWidget);
  });

  testWidgets('Registration screen has required fields', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      ChangeNotifierProvider(
        create: (_) => AuthProvider(),
        child: MaterialApp(home: const RegistrationScreen()),
      ),
    );

    // Verify parent information section
    expect(find.text('Parent Information'), findsOneWidget);
    expect(find.text('Full Name'), findsOneWidget);
    expect(find.text('Email'), findsOneWidget);
    expect(find.text('Password'), findsOneWidget);

    // Verify student linking section
    expect(find.text('Link Students'), findsOneWidget);
    expect(find.text('Student 1'), findsOneWidget);
    expect(find.text('Student ID'), findsOneWidget);

    // Verify add student button exists
    expect(find.text('Add Student'), findsOneWidget);
  });
}
