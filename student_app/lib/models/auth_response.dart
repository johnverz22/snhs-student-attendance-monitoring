import 'student.dart';

class AuthResponse {
  final bool success;
  final String? token;
  final Student? student;
  final String? message;
  final String? error;

  AuthResponse({
    required this.success,
    this.token,
    this.student,
    this.message,
    this.error,
  });

  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    return AuthResponse(
      success: json['success'] ?? false,
      token: json['token'],
      student: json['student'] != null
          ? Student.fromJson(json['student'])
          : null,
      message: json['message'],
      error: json['error'],
    );
  }
}
