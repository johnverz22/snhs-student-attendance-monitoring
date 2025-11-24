import 'package:flutter/foundation.dart';
import '../models/parent.dart';
import '../models/linked_student.dart';
import 'auth_service.dart';

class AuthProvider with ChangeNotifier {
  final AuthService _authService = AuthService();

  Parent? _parent;
  List<LinkedStudent> _students = [];
  bool _isAuthenticated = false;
  bool _isLoading = false;
  String? _errorMessage;

  Parent? get parent => _parent;
  List<LinkedStudent> get students => _students;
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
        _parent = await _authService.getParent();
        _students = await _authService.getStudents();
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
        _parent = response.parent;
        _students = response.students ?? [];
        _isAuthenticated = true;
        debugPrint('✅ Login successful - isAuthenticated: $_isAuthenticated');
      } else {
        _errorMessage = response.message;
        _parent = null;
        _students = [];
        debugPrint('❌ Login failed: $_errorMessage');
      }
    } catch (e) {
      _errorMessage = 'An unexpected error occurred';
      _parent = null;
      _students = [];
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
    required String name,
    required String email,
    required String password,
    String? phone,
    required List<String> studentIds,
    required List<String> relationships,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await _authService.register(
        name: name,
        email: email,
        password: password,
        phone: phone,
        studentIds: studentIds,
        relationships: relationships,
      );

      if (response.success) {
        _parent = response.parent;
        _students = response.students ?? [];
        _isAuthenticated = true;
      } else {
        _errorMessage = response.message;
      }
    } catch (e) {
      _errorMessage = 'An unexpected error occurred';
    }

    _isLoading = false;
    notifyListeners();
    return _isAuthenticated;
  }

  // Logout
  Future<void> logout() async {
    await _authService.logout();
    _parent = null;
    _students = [];
    _isAuthenticated = false;
    _errorMessage = null;
    notifyListeners();
  }

  // Clear error message
  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  // Update parent data
  void updateParent(Parent parent) {
    _parent = parent;
    notifyListeners();
  }

  // Update students list
  void updateStudents(List<LinkedStudent> students) {
    _students = students;
    notifyListeners();
  }

  // Get token
  Future<String?> getToken() async {
    return await _authService.getToken();
  }

  // Refresh students list from API
  Future<void> refreshStudents() async {
    try {
      _students = await _authService.fetchStudentsFromAPI();
      notifyListeners();
      debugPrint('✅ Students refreshed: ${_students.length} students');
    } catch (e) {
      _errorMessage = 'Failed to refresh students';
      debugPrint('❌ Failed to refresh students: $e');
    }
  }
}
