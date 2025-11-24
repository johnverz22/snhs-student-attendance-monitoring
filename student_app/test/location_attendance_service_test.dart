import 'package:flutter_test/flutter_test.dart';
import 'package:student_app/services/location_service.dart';
import 'package:student_app/services/attendance_service.dart';

void main() {
  group('LocationService', () {
    late LocationService service;

    setUp(() {
      service = LocationService();
    });

    test('service should be instantiated', () {
      expect(service, isNotNull);
    });
  });

  group('AttendanceService', () {
    late AttendanceService service;

    setUp(() {
      service = AttendanceService();
    });

    test('service should be instantiated', () {
      expect(service, isNotNull);
    });

    test('getErrorMessage should return user-friendly messages', () {
      expect(
        service.getErrorMessage('QR_CODE_INVALID'),
        contains('Invalid QR code'),
      );
      expect(
        service.getErrorMessage('LOCATION_INVALID'),
        contains('not within school boundaries'),
      );
      expect(
        service.getErrorMessage('NETWORK_ERROR'),
        contains('Network error'),
      );
      expect(
        service.getErrorMessage('UNKNOWN_CODE'),
        contains('error occurred'),
      );
    });
  });

  group('AttendanceResponse', () {
    test('should parse success response from JSON', () {
      final json = {
        'success': true,
        'message': 'Attendance logged',
        'data': {
          'attendanceId': 123,
          'studentName': 'John Doe',
          'entryTime': '2024-11-19T08:30:00Z',
          'gateName': 'Main Gate',
        },
      };

      final response = AttendanceResponse.fromJson(json);

      expect(response.success, true);
      expect(response.message, 'Attendance logged');
      expect(response.data, isNotNull);
      expect(response.data!.attendanceId, 123);
      expect(response.data!.studentName, 'John Doe');
      expect(response.data!.gateName, 'Main Gate');
    });

    test('should parse error response from JSON', () {
      final json = {
        'success': false,
        'error': 'LOCATION_INVALID',
        'message': 'Not within school boundaries',
        'data': {'distanceFromSchool': 250.0, 'maxAllowedDistance': 100.0},
      };

      final response = AttendanceResponse.fromJson(json);

      expect(response.success, false);
      expect(response.error, 'LOCATION_INVALID');
      expect(response.message, 'Not within school boundaries');
      expect(response.data, isNotNull);
      expect(response.data!.distanceFromSchool, 250.0);
      expect(response.data!.maxAllowedDistance, 100.0);
    });
  });

  group('AttendanceEntry', () {
    test('should parse from JSON', () {
      final json = {
        'id': 1,
        'entry_time': '2024-11-19T08:30:00Z',
        'gate_name': 'Main Gate',
        'location_valid': true,
        'latitude': 40.7128,
        'longitude': -74.0060,
      };

      final entry = AttendanceEntry.fromJson(json);

      expect(entry.id, 1);
      expect(entry.entryTime, '2024-11-19T08:30:00Z');
      expect(entry.gateName, 'Main Gate');
      expect(entry.locationValid, true);
      expect(entry.latitude, 40.7128);
      expect(entry.longitude, -74.0060);
    });
  });
}
