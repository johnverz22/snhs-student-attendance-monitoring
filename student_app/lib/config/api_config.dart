/// API Configuration
///
/// This file contains the base URL for the backend API.
/// Update this file when deploying to different environments.
class ApiConfig {
  // ============================================================================
  // DEPLOYMENT CONFIGURATION
  // ============================================================================
  //
  // Update the baseUrl below based on your deployment environment:
  //
  // LOCAL DEVELOPMENT (Android Emulator):
  //   static const String baseUrl = 'http://10.0.2.2:3000/api';
  //
  // LOCAL DEVELOPMENT (iOS Simulator):
  //   static const String baseUrl = 'http://localhost:3000/api';
  //
  // LOCAL DEVELOPMENT (Physical Device on same network):
  //   static const String baseUrl = 'http://YOUR_COMPUTER_IP:3000/api';
  //   Example: static const String baseUrl = 'http://192.168.1.100:3000/api';
  //
  // PRODUCTION:
  //   static const String baseUrl = 'https://your-domain.com/api';
  //
  // ============================================================================

  /// Base URL for the backend API
  ///
  /// **IMPORTANT**: Change this URL before deployment!
  ///
  /// **Troubleshooting Network Errors:**
  /// - If you get "Connection refused" or "Network error":
  ///   1. Verify backend server is running (node src/index.js)
  ///   2. Check this URL matches your environment (see comments above)
  ///   3. For physical devices, use your computer's IP address
  ///   4. Ensure firewall allows connections on port 3000
  ///
  /// See NETWORK_TROUBLESHOOTING.md for detailed help
  // static const String baseUrl = 'http://10.0.2.2:3000/api'; // Android Emulator
  // static const String baseUrl =
  //     'http://192.168.100.83:3000/api'; // Physical Device
  static const String baseUrl = 'https://srnhs-attendance.vercel.app/api';

  // API Endpoints
  static const String authLogin = '$baseUrl/auth/student/login';
  static const String authRegister = '$baseUrl/auth/student/register';
  static const String studentProfile = '$baseUrl/student/profile';
  static const String attendanceScan = '$baseUrl/student/attendance/scan';
  static const String attendanceHistory = '$baseUrl/student/attendance/history';

  /// Check if running in production mode
  static bool get isProduction => baseUrl.startsWith('https://');

  /// Check if running in development mode
  static bool get isDevelopment => !isProduction;
}
