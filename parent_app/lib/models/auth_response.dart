import 'parent.dart';
import 'linked_student.dart';

class AuthResponse {
  final bool success;
  final String? token;
  final Parent? parent;
  final List<LinkedStudent>? students;
  final String? message;
  final String? error;

  AuthResponse({
    required this.success,
    this.token,
    this.parent,
    this.students,
    this.message,
    this.error,
  });

  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    List<LinkedStudent>? studentsList;
    if (json['students'] != null) {
      studentsList = (json['students'] as List)
          .map((s) => LinkedStudent.fromJson(s))
          .toList();
    }

    return AuthResponse(
      success: json['success'] ?? false,
      token: json['token'],
      parent: json['parent'] != null ? Parent.fromJson(json['parent']) : null,
      students: studentsList,
      message: json['message'],
      error: json['error'],
    );
  }
}
