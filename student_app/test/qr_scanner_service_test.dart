import 'package:flutter_test/flutter_test.dart';
import 'package:student_app/services/qr_scanner_service.dart';

void main() {
  group('QRScannerService', () {
    late QRScannerService service;

    setUp(() {
      service = QRScannerService();
    });

    test('initial state should not be scanning', () {
      expect(service.isScanning, false);
      expect(service.controller, isNull);
    });

    test('controller should be null before initialization', () {
      expect(service.controller, isNull);
    });

    test('isScanning should return false initially', () {
      expect(service.isScanning, false);
    });
  });
}
