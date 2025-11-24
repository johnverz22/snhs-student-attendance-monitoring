import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/student.dart';
import '../config/api_config.dart';
import 'auth_service.dart';

class ProfileService {
  final AuthService _authService = AuthService();
  static const String _studentKey = 'student_data';

  /// Save student data to local storage
  Future<void> _saveStudent(Student student) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_studentKey, jsonEncode(student.toJson()));
  }

  /// Fetch the current student's profile from the server
  Future<ProfileResponse> getProfile() async {
    try {
      final headers = await _authService.getAuthHeaders();
      final response = await http.get(
        Uri.parse(ApiConfig.studentProfile),
        headers: headers,
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200 && data['success'] == true) {
        final student = Student.fromJson(data['data']['student']);

        // Update local storage with fresh data
        await _saveStudent(student);

        return ProfileResponse(success: true, student: student);
      } else {
        return ProfileResponse(
          success: false,
          error: data['error'] ?? 'FETCH_FAILED',
          message: data['message'] ?? 'Failed to fetch profile',
        );
      }
    } catch (e) {
      return ProfileResponse(
        success: false,
        error: 'NETWORK_ERROR',
        message: 'Network error. Please check your connection.',
      );
    }
  }

  /// Update the current student's profile
  Future<ProfileResponse> updateProfile({
    String? name,
    String? grade,
    String? section,
    String? phone,
  }) async {
    try {
      final headers = await _authService.getAuthHeaders();

      // Build request body with only provided fields
      final Map<String, dynamic> body = {};
      if (name != null && name.isNotEmpty) body['name'] = name;
      if (grade != null && grade.isNotEmpty) body['grade'] = grade;
      if (section != null && section.isNotEmpty) body['section'] = section;
      if (phone != null && phone.isNotEmpty) body['phone'] = phone;

      if (body.isEmpty) {
        return ProfileResponse(
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'No fields provided for update',
        );
      }

      final response = await http.put(
        Uri.parse(ApiConfig.studentProfile),
        headers: headers,
        body: jsonEncode(body),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200 && data['success'] == true) {
        final student = Student.fromJson(data['data']['student']);

        // Update local storage with updated data
        await _saveStudent(student);

        return ProfileResponse(
          success: true,
          student: student,
          message: data['message'] ?? 'Profile updated successfully',
        );
      } else {
        return ProfileResponse(
          success: false,
          error: data['error'] ?? 'UPDATE_FAILED',
          message: data['message'] ?? 'Failed to update profile',
        );
      }
    } catch (e) {
      return ProfileResponse(
        success: false,
        error: 'NETWORK_ERROR',
        message: 'Network error. Please check your connection.',
      );
    }
  }

  /// Sync local profile with server
  Future<ProfileResponse> syncProfile() async {
    return await getProfile();
  }
}

class ProfileResponse {
  final bool success;
  final Student? student;
  final String? message;
  final String? error;

  ProfileResponse({
    required this.success,
    this.student,
    this.message,
    this.error,
  });
}
