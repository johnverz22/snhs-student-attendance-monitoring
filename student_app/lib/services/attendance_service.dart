import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:geolocator/geolocator.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';
import 'auth_service.dart';

/// Response model for attendance scan
class AttendanceResponse {
  final bool success;
  final String? message;
  final String? error;
  final AttendanceData? data;

  AttendanceResponse({
    required this.success,
    this.message,
    this.error,
    this.data,
  });

  factory AttendanceResponse.fromJson(Map<String, dynamic> json) {
    return AttendanceResponse(
      success: json['success'] ?? false,
      message: json['message'],
      error: json['error'],
      data: json['data'] != null ? AttendanceData.fromJson(json['data']) : null,
    );
  }
}

/// Attendance data model
class AttendanceData {
  final int? attendanceId;
  final String? studentName;
  final String? entryTime;
  final String? gateName;
  final double? distanceFromSchool;
  final double? maxAllowedDistance;

  AttendanceData({
    this.attendanceId,
    this.studentName,
    this.entryTime,
    this.gateName,
    this.distanceFromSchool,
    this.maxAllowedDistance,
  });

  factory AttendanceData.fromJson(Map<String, dynamic> json) {
    return AttendanceData(
      attendanceId: json['attendanceId'],
      studentName: json['studentName'],
      entryTime: json['entryTime'],
      gateName: json['gateName'],
      distanceFromSchool: json['distanceFromSchool']?.toDouble(),
      maxAllowedDistance: json['maxAllowedDistance']?.toDouble(),
    );
  }
}

/// Attendance history entry model
class AttendanceEntry {
  final int id;
  final String entryTime;
  final String? gateName;
  final bool locationValid;
  final double? latitude;
  final double? longitude;

  AttendanceEntry({
    required this.id,
    required this.entryTime,
    this.gateName,
    required this.locationValid,
    this.latitude,
    this.longitude,
  });

  factory AttendanceEntry.fromJson(Map<String, dynamic> json) {
    return AttendanceEntry(
      id: json['id'],
      entryTime: json['entry_time'] ?? json['entryTime'],
      gateName: json['gate_name'] ?? json['gateName'],
      locationValid: json['location_valid'] ?? json['locationValid'] ?? false,
      latitude: json['latitude']?.toDouble(),
      longitude: json['longitude']?.toDouble(),
    );
  }
}

/// Service for handling attendance operations
class AttendanceService {
  final AuthService _authService = AuthService();
  static const String _cacheKey = 'cached_attendance_entries';
  static const int _maxCacheSize = 50;

  /// Submit attendance scan with QR code and GPS data
  Future<AttendanceResponse> submitAttendanceScan({
    required String qrCode,
    required Position position,
  }) async {
    try {
      // Get auth headers
      final headers = await _authService.getAuthHeaders();

      // Prepare request body
      final body = jsonEncode({
        'qrCode': qrCode,
        'latitude': position.latitude,
        'longitude': position.longitude,
        'timestamp': DateTime.now().toUtc().toIso8601String(),
      });

      // Make POST request
      final response = await http.post(
        Uri.parse(ApiConfig.attendanceScan),
        headers: headers,
        body: body,
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200 || response.statusCode == 201) {
        return AttendanceResponse.fromJson(data);
      } else {
        return AttendanceResponse(
          success: false,
          error: data['error'] ?? 'ATTENDANCE_FAILED',
          message: data['message'] ?? 'Failed to log attendance',
          data: data['data'] != null
              ? AttendanceData.fromJson(data['data'])
              : null,
        );
      }
    } on http.ClientException catch (e) {
      return AttendanceResponse(
        success: false,
        error: 'NETWORK_ERROR',
        message: 'Network error: ${e.message}',
      );
    } catch (e) {
      return AttendanceResponse(
        success: false,
        error: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred: ${e.toString()}',
      );
    }
  }

  /// Get attendance history for the logged-in student
  Future<List<AttendanceEntry>> getAttendanceHistory({
    String? startDate,
    String? endDate,
    int? limit,
  }) async {
    try {
      // Get auth headers
      final headers = await _authService.getAuthHeaders();

      // Build query parameters
      final queryParams = <String, String>{};
      if (startDate != null) queryParams['startDate'] = startDate;
      if (endDate != null) queryParams['endDate'] = endDate;
      if (limit != null) queryParams['limit'] = limit.toString();

      final uri = Uri.parse(
        ApiConfig.attendanceHistory,
      ).replace(queryParameters: queryParams.isNotEmpty ? queryParams : null);

      // Make GET request
      final response = await http.get(uri, headers: headers);

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);

        if (data['success'] == true && data['data'] != null) {
          final List<dynamic> entries = data['data'];
          final attendanceList = entries
              .map((entry) => AttendanceEntry.fromJson(entry))
              .toList();

          // Cache the results
          await _cacheAttendanceEntries(attendanceList);

          return attendanceList;
        }
      }

      // If request fails, try to return cached data
      return await _getCachedAttendanceEntries();
    } catch (e) {
      // Return cached data on error
      return await _getCachedAttendanceEntries();
    }
  }

  /// Cache attendance entries locally
  Future<void> _cacheAttendanceEntries(List<AttendanceEntry> entries) async {
    try {
      final prefs = await SharedPreferences.getInstance();

      // Limit cache size
      final entriesToCache = entries.take(_maxCacheSize).toList();

      // Convert to JSON
      final jsonList = entriesToCache
          .map(
            (entry) => {
              'id': entry.id,
              'entry_time': entry.entryTime,
              'gate_name': entry.gateName,
              'location_valid': entry.locationValid,
              'latitude': entry.latitude,
              'longitude': entry.longitude,
            },
          )
          .toList();

      await prefs.setString(_cacheKey, jsonEncode(jsonList));
    } catch (e) {
      // Silently fail if caching fails
    }
  }

  /// Get cached attendance entries
  Future<List<AttendanceEntry>> _getCachedAttendanceEntries() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final cachedData = prefs.getString(_cacheKey);

      if (cachedData != null) {
        final List<dynamic> jsonList = jsonDecode(cachedData);
        return jsonList.map((json) => AttendanceEntry.fromJson(json)).toList();
      }
    } catch (e) {
      // Return empty list if cache read fails
    }

    return [];
  }

  /// Add a new entry to the cache (called after successful scan)
  Future<void> addToCacheAfterScan(AttendanceResponse response) async {
    if (response.success && response.data != null) {
      try {
        // Get existing cache
        final cachedEntries = await _getCachedAttendanceEntries();

        // Create new entry from response
        final newEntry = AttendanceEntry(
          id: response.data!.attendanceId ?? 0,
          entryTime:
              response.data!.entryTime ?? DateTime.now().toIso8601String(),
          gateName: response.data!.gateName,
          locationValid: true,
          latitude: null,
          longitude: null,
        );

        // Add to beginning of list
        final updatedEntries = [newEntry, ...cachedEntries];

        // Cache updated list
        await _cacheAttendanceEntries(updatedEntries);
      } catch (e) {
        // Silently fail if caching fails
      }
    }
  }

  /// Get user-friendly error message from error code
  String getErrorMessage(String? errorCode) {
    switch (errorCode) {
      case 'QR_CODE_INVALID':
        return 'Invalid QR code. Please scan a valid school gate QR code.';
      case 'QR_CODE_EXPIRED':
        return 'This QR code has expired. Please contact administration.';
      case 'LOCATION_INVALID':
        return 'You are not within school boundaries. Please move closer to the school.';
      case 'ATTENDANCE_DUPLICATE':
        return 'You have already logged attendance recently.';
      case 'AUTH_TOKEN_EXPIRED':
        return 'Your session has expired. Please log in again.';
      case 'AUTH_UNAUTHORIZED':
        return 'You are not authorized to perform this action.';
      case 'NETWORK_ERROR':
        return 'Network error. Please check your internet connection.';
      case 'LOCATION_SERVICE_DISABLED':
        return 'Location services are disabled. Please enable them in settings.';
      case 'LOCATION_PERMISSION_DENIED':
        return 'Location permission denied. Please grant permission in settings.';
      default:
        return 'An error occurred. Please try again.';
    }
  }
}
