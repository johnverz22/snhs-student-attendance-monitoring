import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/attendance_record.dart';
import '../config/api_config.dart';
import 'auth_service.dart';

class AttendanceService {
  final AuthService _authService = AuthService();

  /// Fetch attendance records for a specific student
  /// Optional date range filtering with startDate and endDate
  Future<List<AttendanceRecord>> getStudentAttendance(
    int studentId, {
    DateTime? startDate,
    DateTime? endDate,
  }) async {
    try {
      final headers = await _authService.getAuthHeaders();

      // Build URL with optional query parameters
      String url = ApiConfig.getFullUrl(
        ApiConfig.getStudentAttendance(studentId),
      );

      final queryParams = <String, String>{};
      if (startDate != null) {
        queryParams['startDate'] = startDate.toIso8601String().split('T')[0];
      }
      if (endDate != null) {
        queryParams['endDate'] = endDate.toIso8601String().split('T')[0];
      }

      if (queryParams.isNotEmpty) {
        final queryString = queryParams.entries
            .map((e) => '${e.key}=${Uri.encodeComponent(e.value)}')
            .join('&');
        url = '$url?$queryString';
      }

      final response = await http
          .get(Uri.parse(url), headers: headers)
          .timeout(const Duration(seconds: 30));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);

        if (data['success'] == true) {
          final attendanceList = data['data']['logs'] as List;
          return attendanceList
              .map((record) => AttendanceRecord.fromJson(record))
              .toList();
        } else {
          throw Exception(data['message'] ?? 'Failed to fetch attendance');
        }
      } else if (response.statusCode == 401) {
        throw Exception('Unauthorized. Please login again.');
      } else {
        final data = jsonDecode(response.body);
        throw Exception(data['message'] ?? 'Failed to fetch attendance');
      }
    } catch (e) {
      if (e.toString().contains('Unauthorized')) {
        rethrow;
      }
      throw Exception('Network error: ${e.toString()}');
    }
  }

  /// Get attendance statistics for a student
  Future<Map<String, dynamic>> getAttendanceStats(
    int studentId, {
    DateTime? startDate,
    DateTime? endDate,
  }) async {
    try {
      final records = await getStudentAttendance(
        studentId,
        startDate: startDate,
        endDate: endDate,
      );

      final totalDays = records.length;
      final validLocationCount = records.where((r) => r.locationValid).length;
      final invalidLocationCount = totalDays - validLocationCount;

      // Group by date to get unique days
      final uniqueDates = <String>{};
      for (var record in records) {
        uniqueDates.add(record.formattedDate);
      }

      return {
        'totalEntries': totalDays,
        'uniqueDays': uniqueDates.length,
        'validLocation': validLocationCount,
        'invalidLocation': invalidLocationCount,
        'validPercentage': totalDays > 0
            ? (validLocationCount / totalDays * 100).toStringAsFixed(1)
            : '0.0',
      };
    } catch (e) {
      rethrow;
    }
  }
}
