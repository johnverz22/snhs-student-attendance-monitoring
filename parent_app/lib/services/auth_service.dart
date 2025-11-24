import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/parent.dart';
import '../models/linked_student.dart';
import '../models/auth_response.dart';
import '../config/api_config.dart';

class AuthService {
  static const String _tokenKey = 'auth_token';
  static const String _parentKey = 'parent_data';
  static const String _studentsKey = 'linked_students';

  // Login method
  Future<AuthResponse> login(String email, String password) async {
    try {
      final response = await http
          .post(
            Uri.parse(ApiConfig.getFullUrl(ApiConfig.parentLogin)),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({'email': email, 'password': password}),
          )
          .timeout(const Duration(seconds: 30));

      final data = jsonDecode(response.body);

      if (response.statusCode == 200 && data['success'] == true) {
        // Extract data from nested structure
        final responseData = data['data'] ?? {};
        final token = responseData['accessToken'];
        final parentData = responseData['parent'];
        final studentsData = responseData['linkedStudents'];

        // Store token, parent data, and linked students
        if (token != null) {
          await _saveToken(token);
        }
        if (parentData != null) {
          await _saveParent(Parent.fromJson(parentData));
        }
        if (studentsData != null) {
          final students = (studentsData as List)
              .map((s) => LinkedStudent.fromJson(s))
              .toList();
          await _saveStudents(students);
        }

        // Return flattened response
        return AuthResponse(
          success: true,
          token: token,
          parent: parentData != null ? Parent.fromJson(parentData) : null,
          students: studentsData != null
              ? (studentsData as List)
                    .map((s) => LinkedStudent.fromJson(s))
                    .toList()
              : null,
          message: data['message'],
        );
      } else {
        return AuthResponse(
          success: false,
          error: data['error'] ?? 'LOGIN_FAILED',
          message:
              data['message'] ?? 'Login failed. Please check your credentials.',
        );
      }
    } catch (e) {
      return AuthResponse(
        success: false,
        error: 'NETWORK_ERROR',
        message: 'Network error: ${e.toString()}',
      );
    }
  }

  // Register method with student linking
  Future<AuthResponse> register({
    required String name,
    required String email,
    required String password,
    String? phone,
    required List<String> studentIds,
    required List<String> relationships,
  }) async {
    try {
      final response = await http
          .post(
            Uri.parse(ApiConfig.getFullUrl(ApiConfig.parentRegister)),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({
              'name': name,
              'email': email,
              'password': password,
              'phone': phone,
              'studentIds': studentIds,
              'relationships': relationships,
            }),
          )
          .timeout(const Duration(seconds: 30));

      final data = jsonDecode(response.body);

      if (response.statusCode == 201 && data['success'] == true) {
        // Extract data from nested structure
        final responseData = data['data'] ?? {};
        final token = responseData['accessToken'];
        final parentData = responseData['parent'];
        final studentsData = responseData['linkedStudents'];

        // Store token, parent data, and linked students
        if (token != null) {
          await _saveToken(token);
        }
        if (parentData != null) {
          await _saveParent(Parent.fromJson(parentData));
        }
        if (studentsData != null) {
          final linkedStudents = (studentsData as List)
              .map((s) => LinkedStudent.fromJson(s))
              .toList();
          await _saveStudents(linkedStudents);
        }

        // Return flattened response
        return AuthResponse(
          success: true,
          token: token,
          parent: parentData != null ? Parent.fromJson(parentData) : null,
          students: studentsData != null
              ? (studentsData as List)
                    .map((s) => LinkedStudent.fromJson(s))
                    .toList()
              : null,
          message: data['message'],
        );
      } else {
        return AuthResponse(
          success: false,
          error: data['error'] ?? 'REGISTRATION_FAILED',
          message: data['message'] ?? 'Registration failed. Please try again.',
        );
      }
    } catch (e) {
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

  // Save parent data to storage
  Future<void> _saveParent(Parent parent) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_parentKey, jsonEncode(parent.toJson()));
  }

  // Save linked students to storage
  Future<void> _saveStudents(List<LinkedStudent> students) async {
    final prefs = await SharedPreferences.getInstance();
    final studentsJson = students.map((s) => s.toJson()).toList();
    await prefs.setString(_studentsKey, jsonEncode(studentsJson));
  }

  // Get stored token
  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenKey);
  }

  // Get stored parent data
  Future<Parent?> getParent() async {
    final prefs = await SharedPreferences.getInstance();
    final parentJson = prefs.getString(_parentKey);

    if (parentJson != null) {
      return Parent.fromJson(jsonDecode(parentJson));
    }
    return null;
  }

  // Get stored linked students
  Future<List<LinkedStudent>> getStudents() async {
    final prefs = await SharedPreferences.getInstance();
    final studentsJson = prefs.getString(_studentsKey);

    if (studentsJson != null) {
      final List<dynamic> decoded = jsonDecode(studentsJson);
      return decoded.map((s) => LinkedStudent.fromJson(s)).toList();
    }
    return [];
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
    await prefs.remove(_parentKey);
    await prefs.remove(_studentsKey);
  }

  // Get authorization header
  Future<Map<String, String>> getAuthHeaders() async {
    final token = await getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }

  // Fetch linked students from API
  Future<List<LinkedStudent>> fetchStudentsFromAPI() async {
    try {
      final token = await getToken();
      if (token == null) {
        throw Exception('Not authenticated');
      }

      final response = await http
          .get(
            Uri.parse(ApiConfig.getFullUrl(ApiConfig.getStudents)),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $token',
            },
          )
          .timeout(const Duration(seconds: 30));

      final data = jsonDecode(response.body);

      if (response.statusCode == 200 && data['success'] == true) {
        final studentsData = data['data']['students'] as List;
        final students = studentsData
            .map((s) => LinkedStudent.fromJson(s))
            .toList();

        // Save to local storage
        await _saveStudents(students);

        return students;
      } else {
        throw Exception(data['message'] ?? 'Failed to fetch students');
      }
    } catch (e) {
      throw Exception('Failed to fetch students: ${e.toString()}');
    }
  }
}
