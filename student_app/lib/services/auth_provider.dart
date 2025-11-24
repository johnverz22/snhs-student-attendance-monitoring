import 'package:flutter/foundation.dart';
import '../models/student.dart';
import 'auth_service.dart';

class AuthProvider with ChangeNotifier {
  final AuthService _authService = AuthService();

  Student? _student;
  bool _isAuthenticated = false;
  bool _isLoading = false;
  String? _errorMessage;

  Student? get student => _student;
  bool get isAuthenticated => _isAuthenticated;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  // Initialize authentication state
  Future<void> initialize() async {
    _isLoading = true;
    notifyListeners();

    try {
      final isLoggedIn = await _authService.isLoggedIn();
      if (isLoggedIn) {
        _student = await _authService.getStudent();
        _isAuthenticated = true;
      }
    } catch (e) {
      _errorMessage = 'Failed to initialize authentication';
    }

    _isLoading = false;
    notifyListeners();
  }

  // Login
  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _errorMessage = null;
    _isAuthenticated = false; // Reset authentication state
    notifyListeners();

    try {
      final response = await _authService.login(email, password);

      if (response.success) {
        _student = response.student;
        _isAuthenticated = true;
        debugPrint('✅ Login successful - isAuthenticated: $_isAuthenticated');
      } else {
        _errorMessage = response.message;
        _student = null;
        debugPrint('❌ Login failed: $_errorMessage');
      }
    } catch (e) {
      _errorMessage = 'An unexpected error occurred';
      _student = null;
      debugPrint('❌ Login error: $e');
    }

    _isLoading = false;
    notifyListeners();
    debugPrint(
      '🔄 Login complete - isAuthenticated: $_isAuthenticated, isLoading: $_isLoading',
    );
    return _isAuthenticated;
  }

  // Register
  Future<bool> register({
    required String studentId,
    required String name,
    required String email,
    required String password,
    String? grade,
    String? section,
    String? phone,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    _isAuthenticated = false; // Reset authentication state
    notifyListeners();

    try {
      final response = await _authService.register(
        studentId: studentId,
        name: name,
        email: email,
        password: password,
        grade: grade,
        section: section,
        phone: phone,
      );

      if (response.success) {
        _student = response.student;
        _isAuthenticated = true;
      } else {
        _errorMessage = response.message;
        _student = null;
      }
    } catch (e) {
      _errorMessage = 'An unexpected error occurred';
      _student = null;
    }

    _isLoading = false;
    notifyListeners();
    return _isAuthenticated;
  }

  // Logout
  Future<void> logout() async {
    await _authService.logout();
    _student = null;
    _isAuthenticated = false;
    _errorMessage = null;
    notifyListeners();
  }

  // Clear error message
  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  // Update student data
  void updateStudent(Student student) {
    _student = student;
    notifyListeners();
  }
}
