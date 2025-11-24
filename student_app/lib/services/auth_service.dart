import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/student.dart';
import '../models/auth_response.dart';
import '../config/api_config.dart';

class AuthService {
  static const String _tokenKey = 'auth_token';
  static const String _studentKey = 'student_data';

  // Login method
  Future<AuthResponse> login(String email, String password) async {
    try {
      print('🔐 Attempting login to: ${ApiConfig.authLogin}');

      final response = await http
          .post(
            Uri.parse(ApiConfig.authLogin),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({'email': email, 'password': password}),
          )
          .timeout(const Duration(seconds: 30));

      print('📡 Response status: ${response.statusCode}');
      print('📦 Response body: ${response.body}');

      final data = jsonDecode(response.body);

      if (response.statusCode == 200 && data['success'] == true) {
        // Extract data from nested structure
        final responseData = data['data'] ?? {};
        // Backend returns 'accessToken', not 'token'
        final token = responseData['accessToken'] ?? responseData['token'];
        final studentData = responseData['student'];

        // Store token and student data
        if (token != null) {
          await _saveToken(token);
        }
        if (studentData != null) {
          await _saveStudent(Student.fromJson(studentData));
        }

        // Return flattened response for compatibility
        return AuthResponse(
          success: true,
          token: token,
          student: studentData != null ? Student.fromJson(studentData) : null,
          message: data['message'],
        );
      } else {
        print('❌ Login failed: ${data['message']}');
        return AuthResponse(
          success: false,
          error: data['error'] ?? 'LOGIN_FAILED',
          message:
              data['message'] ?? 'Login failed. Please check your credentials.',
        );
      }
    } catch (e) {
      print('🚨 Login error: $e');
      return AuthResponse(
        success: false,
        error: 'NETWORK_ERROR',
        message: 'Network error: ${e.toString()}',
      );
    }
  }

  // Register method
  Future<AuthResponse> register({
    required String studentId,
    required String name,
    required String email,
    required String password,
    String? grade,
    String? section,
    String? phone,
  }) async {
    try {
      print('📝 Attempting registration to: ${ApiConfig.authRegister}');

      final response = await http
          .post(
            Uri.parse(ApiConfig.authRegister),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({
              'student_id': studentId,
              'name': name,
              'email': email,
              'password': password,
              'grade': grade,
              'section': section,
              'phone': phone,
            }),
          )
          .timeout(const Duration(seconds: 30));

      print('📡 Response status: ${response.statusCode}');
      print('📦 Response body: ${response.body}');

      final data = jsonDecode(response.body);

      if (response.statusCode == 201 && data['success'] == true) {
        // Extract data from nested structure
        final responseData = data['data'] ?? {};
        // Backend returns 'accessToken', not 'token'
        final token = responseData['accessToken'] ?? responseData['token'];
        final studentData = responseData['student'];

        // Store token and student data
        if (token != null) {
          await _saveToken(token);
        }
        if (studentData != null) {
          await _saveStudent(Student.fromJson(studentData));
        }

        // Return flattened response for compatibility
        return AuthResponse(
          success: true,
          token: token,
          student: studentData != null ? Student.fromJson(studentData) : null,
          message: data['message'],
        );
      } else {
        print('❌ Registration failed: ${data['message']}');
        return AuthResponse(
          success: false,
          error: data['error'] ?? 'REGISTRATION_FAILED',
          message: data['message'] ?? 'Registration failed. Please try again.',
        );
      }
    } catch (e) {
      print('🚨 Registration error: $e');
      return AuthResponse(
        success: false,
        error: 'NETWORK_ERROR',
        message: 'Network error: ${e.toString()}',
      );
    }
  }

  // Save token to secure storage
  Future<void> _saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
  }

  // Save student data to storage
  Future<void> _saveStudent(Student student) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_studentKey, jsonEncode(student.toJson()));
  }

  // Get stored token
  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenKey);
  }

  // Get stored student data
  Future<Student?> getStudent() async {
    final prefs = await SharedPreferences.getInstance();
    final studentJson = prefs.getString(_studentKey);

    if (studentJson != null) {
      return Student.fromJson(jsonDecode(studentJson));
    }
    return null;
  }

  // Check if user is logged in
  Future<bool> isLoggedIn() async {
    final token = await getToken();
    return token != null && token.isNotEmpty;
  }

  // Logout method
  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    await prefs.remove(_studentKey);
  }

  // Get authorization header
  Future<Map<String, String>> getAuthHeaders() async {
    final token = await getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }
}
