import 'package:qr_code_scanner/qr_code_scanner.dart';

/// Service for handling QR code scanning functionality
class QRScannerService {
  QRViewController? _controller;
  bool _isScanning = false;

  /// Initialize the QR scanner controller
  void initController(QRViewController controller) {
    _controller = controller;
  }

  /// Start scanning for QR codes
  void startScanning() {
    if (_controller != null && !_isScanning) {
      _controller!.resumeCamera();
      _isScanning = true;
    }
  }

  /// Pause scanning
  void pauseScanning() {
    if (_controller != null && _isScanning) {
      _controller!.pauseCamera();
      _isScanning = false;
    }
  }

  /// Stop scanning and dispose resources
  void stopScanning() {
    if (_controller != null) {
      _controller!.dispose();
      _controller = null;
      _isScanning = false;
    }
  }

  /// Toggle flash/torch
  Future<void> toggleFlash() async {
    if (_controller != null) {
      await _controller!.toggleFlash();
    }
  }

  /// Flip camera (front/back)
  Future<void> flipCamera() async {
    if (_controller != null) {
      await _controller!.flipCamera();
    }
  }

  /// Get flash status
  Future<bool?> getFlashStatus() async {
    if (_controller != null) {
      return await _controller!.getFlashStatus();
    }
    return null;
  }

  /// Check if currently scanning
  bool get isScanning => _isScanning;

  /// Get the controller
  QRViewController? get controller => _controller;
}
