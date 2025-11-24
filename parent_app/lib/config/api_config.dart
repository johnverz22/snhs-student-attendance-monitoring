// API Configuration for Parent App
//
// This file contains the base URL and endpoints for the backend server.
// Update the baseUrl to match your server's address.

class ApiConfig {
  // Base URL for the backend server
  // For local development on physical device, use your computer's IP address
  // For Android emulator, use 10.0.2.2
  // For iOS simulator, use localhost or 127.0.0.1
  static const String baseUrl = 'http://10.0.2.2:3000/api'; // Android Emulator
  // static const String baseUrl =
  //     'http://192.168.100.83:3000/api'; // Physical Device

  // Authentication endpoints
  static const String parentRegister = '/auth/parent/register';
  static const String parentLogin = '/auth/parent/login';
  static const String refreshToken = '/auth/refresh-token';

  // Parent endpoints
  static const String getStudents = '/parent/students';
  static const String getNotifications = '/parent/notifications';
  static const String linkStudent = '/parent/link-student';
  static String unlinkStudent(int studentId) =>
      '/parent/unlink-student/$studentId';
  static String getStudentAttendance(int studentId) =>
      '/parent/student/$studentId/attendance';

  // Push notification endpoints
  static const String registerPushToken = '/parent/device-token';
  static const String unregisterPushToken = '/parent/device-token';

  // Helper method to get full URL
  static String getFullUrl(String endpoint) {
    return '$baseUrl$endpoint';
  }
}
