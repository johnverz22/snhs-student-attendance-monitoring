import 'dart:io';
import 'package:flutter/material.dart';
import 'package:qr_code_scanner/qr_code_scanner.dart';
import 'package:geolocator/geolocator.dart';
import '../services/qr_scanner_service.dart';
import '../services/location_service.dart';
import '../services/attendance_service.dart';

class QRScannerScreen extends StatefulWidget {
  const QRScannerScreen({super.key});

  @override
  State<QRScannerScreen> createState() => _QRScannerScreenState();
}

class _QRScannerScreenState extends State<QRScannerScreen> {
  final GlobalKey qrKey = GlobalKey(debugLabel: 'QR');
  final QRScannerService _scannerService = QRScannerService();
  final LocationService _locationService = LocationService();
  final AttendanceService _attendanceService = AttendanceService();

  bool _isFlashOn = false;
  bool _hasScanned = false;
  bool _isProcessing = false;
  bool _locationReady = false;
  String? _locationError;

  @override
  void initState() {
    super.initState();
    _checkLocationRequirements();
  }

  @override
  void reassemble() {
    super.reassemble();
    // Hot reload support
    if (Platform.isAndroid) {
      _scannerService.controller?.pauseCamera();
    }
    _scannerService.controller?.resumeCamera();
  }

  @override
  void dispose() {
    _scannerService.stopScanning();
    super.dispose();
  }

  Future<void> _checkLocationRequirements() async {
    try {
      // Check if location services are enabled
      final serviceEnabled = await _locationService.isLocationServiceEnabled();
      if (!serviceEnabled) {
        setState(() {
          _locationError = 'Location services are disabled';
        });
        _showLocationRequiredDialog(
          'Location Services Required',
          'Please enable location services to scan attendance QR codes.',
          showLocationSettings: true,
        );
        return;
      }

      // Check location permissions
      final permission = await _locationService.checkPermission();
      if (permission == LocationPermission.denied ||
          permission == LocationPermission.deniedForever) {
        setState(() {
          _locationError = 'Location permission denied';
        });
        _showLocationRequiredDialog(
          'Location Permission Required',
          'Location access is required to verify you are at school when scanning QR codes.',
          showAppSettings: permission == LocationPermission.deniedForever,
        );
        return;
      }

      // All checks passed
      setState(() {
        _locationReady = true;
        _locationError = null;
      });
    } catch (e) {
      setState(() {
        _locationError = 'Location check failed: ${e.toString()}';
      });
    }
  }

  void _showLocationRequiredDialog(
    String title,
    String message, {
    bool showLocationSettings = false,
    bool showAppSettings = false,
  }) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        icon: const Icon(Icons.location_off, color: Colors.orange, size: 64),
        title: Text(title),
        content: Text(message),
        actions: [
          if (showLocationSettings)
            TextButton(
              onPressed: () async {
                Navigator.of(context).pop();
                await _locationService.openLocationSettings();
                // Recheck after user returns
                await Future.delayed(const Duration(seconds: 1));
                _checkLocationRequirements();
              },
              child: const Text('Open Settings'),
            ),
          if (showAppSettings)
            TextButton(
              onPressed: () async {
                Navigator.of(context).pop();
                await _locationService.openAppSettings();
                // Recheck after user returns
                await Future.delayed(const Duration(seconds: 1));
                _checkLocationRequirements();
              },
              child: const Text('Open Settings'),
            ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              Navigator.of(context).pop(); // Exit scanner screen
            },
            child: const Text('Cancel'),
          ),
          if (!showLocationSettings && !showAppSettings)
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
                _checkLocationRequirements();
              },
              child: const Text('Retry'),
            ),
        ],
      ),
    );
  }

  void _onQRViewCreated(QRViewController controller) {
    _scannerService.initController(controller);

    controller.scannedDataStream.listen((scanData) {
      // Only process if location is ready
      if (!_hasScanned &&
          !_isProcessing &&
          _locationReady &&
          scanData.code != null) {
        setState(() {
          _hasScanned = true;
          _isProcessing = true;
        });

        // Pause scanning after successful scan
        _scannerService.pauseScanning();

        // Process the scanned QR code
        _processQRCode(scanData.code!);
      } else if (!_locationReady && scanData.code != null) {
        // Show error if trying to scan without location
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Location services must be enabled to scan'),
            backgroundColor: Colors.orange,
          ),
        );
      }
    });
  }

  Future<void> _processQRCode(String qrCode) async {
    try {
      // Show processing dialog
      if (mounted) {
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (context) => const Center(
            child: Card(
              child: Padding(
                padding: EdgeInsets.all(24.0),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    CircularProgressIndicator(),
                    SizedBox(height: 16),
                    Text('Processing attendance...'),
                  ],
                ),
              ),
            ),
          ),
        );
      }

      // Get current location
      Position position;
      try {
        position = await _locationService.getCurrentLocationWithTimeout(
          timeout: const Duration(seconds: 20),
        );
      } catch (e) {
        if (mounted) {
          Navigator.of(context).pop(); // Close processing dialog
          _showErrorDialog(
            'Location Error',
            _getLocationErrorMessage(e),
            showSettingsButton: e is! LocationTimeoutException,
            showRetryButton: true,
          );
        }
        return;
      }

      // Submit attendance
      final response = await _attendanceService.submitAttendanceScan(
        qrCode: qrCode,
        position: position,
      );

      if (mounted) {
        Navigator.of(context).pop(); // Close processing dialog

        if (response.success) {
          _showSuccessDialog(response);
        } else {
          _showErrorDialog(
            'Attendance Failed',
            response.message ??
                _attendanceService.getErrorMessage(response.error),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        Navigator.of(context).pop(); // Close processing dialog
        _showErrorDialog(
          'Error',
          'An unexpected error occurred: ${e.toString()}',
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isProcessing = false;
        });
      }
    }
  }

  String _getLocationErrorMessage(dynamic error) {
    if (error is LocationServiceDisabledException) {
      return 'Location services are disabled. Please enable them in settings.';
    } else if (error is PermissionDeniedException) {
      return error.message ?? 'Location permission denied';
    } else if (error is LocationTimeoutException) {
      return 'Location request timed out. Try moving to an area with better GPS signal (near a window or outdoors) and scan again.';
    } else {
      return 'Unable to get your location. Please check your settings and try again.';
    }
  }

  void _showSuccessDialog(AttendanceResponse response) async {
    // Cache the successful attendance entry
    await _attendanceService.addToCacheAfterScan(response);

    // Show success snackbar
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(Icons.check_circle, color: Colors.white),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Attendance Logged',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                    if (response.data?.entryTime != null)
                      Text(
                        'Time: ${_formatTime(response.data!.entryTime!)}',
                        style: const TextStyle(fontSize: 14),
                      ),
                  ],
                ),
              ),
            ],
          ),
          backgroundColor: Colors.green,
          duration: const Duration(seconds: 4),
          behavior: SnackBarBehavior.floating,
          action: SnackBarAction(
            label: 'View',
            textColor: Colors.white,
            onPressed: () {
              _showSuccessDetailsDialog(response);
            },
          ),
        ),
      );

      // Return to previous screen after a short delay
      await Future.delayed(const Duration(milliseconds: 500));
      if (mounted) {
        Navigator.of(context).pop(true);
      }
    }
  }

  void _showSuccessDetailsDialog(AttendanceResponse response) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        icon: const Icon(Icons.check_circle, color: Colors.green, size: 64),
        title: const Text('Attendance Logged'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              response.message ??
                  'Your attendance has been successfully recorded.',
              textAlign: TextAlign.center,
            ),
            if (response.data != null) ...[
              const SizedBox(height: 16),
              const Divider(),
              const SizedBox(height: 8),
              if (response.data!.studentName != null)
                _buildInfoRow('Student', response.data!.studentName!),
              if (response.data!.gateName != null)
                _buildInfoRow('Gate', response.data!.gateName!),
              if (response.data!.entryTime != null)
                _buildInfoRow('Time', _formatTime(response.data!.entryTime!)),
            ],
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  void _showErrorDialog(
    String title,
    String message, {
    bool showSettingsButton = false,
    bool showRetryButton = false,
  }) {
    // Show error snackbar
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.error_outline, color: Colors.white),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                  Text(
                    message,
                    style: const TextStyle(fontSize: 14),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ],
        ),
        backgroundColor: Colors.red,
        duration: const Duration(seconds: 5),
        behavior: SnackBarBehavior.floating,
        action: SnackBarAction(
          label: showRetryButton ? 'Retry' : 'Details',
          textColor: Colors.white,
          onPressed: () {
            if (showRetryButton) {
              // Retry scanning
              setState(() {
                _hasScanned = false;
              });
              _scannerService.startScanning();
            } else {
              _showErrorDetailsDialog(title, message, showSettingsButton);
            }
          },
        ),
      ),
    );

    // Allow retry after showing snackbar
    setState(() {
      _hasScanned = false;
    });
    _scannerService.startScanning();
  }

  void _showErrorDetailsDialog(
    String title,
    String message,
    bool showSettingsButton,
  ) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        icon: const Icon(Icons.error_outline, color: Colors.red, size: 64),
        title: Text(title),
        content: Text(message),
        actions: [
          if (showSettingsButton)
            TextButton(
              onPressed: () async {
                Navigator.of(context).pop();
                await _locationService.openAppSettings();
              },
              child: const Text('Open Settings'),
            ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            '$label:',
            style: const TextStyle(
              fontWeight: FontWeight.w500,
              color: Colors.grey,
            ),
          ),
          Text(value, style: const TextStyle(fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  String _formatTime(String isoTime) {
    try {
      // Backend already stores time in Philippine timezone (UTC+8)
      // Do NOT call toLocal() as it would add another 8 hours
      final dateTime = DateTime.parse(isoTime);
      return '${dateTime.hour.toString().padLeft(2, '0')}:${dateTime.minute.toString().padLeft(2, '0')}';
    } catch (e) {
      return isoTime;
    }
  }

  Future<void> _toggleFlash() async {
    await _scannerService.toggleFlash();
    final flashStatus = await _scannerService.getFlashStatus();
    setState(() {
      _isFlashOn = flashStatus ?? false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Scan QR Code'),
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
      ),
      body: Stack(
        children: [
          // QR Scanner View
          QRView(
            key: qrKey,
            onQRViewCreated: _onQRViewCreated,
            overlay: QrScannerOverlayShape(
              borderColor: theme.colorScheme.primary,
              borderRadius: 16,
              borderLength: 40,
              borderWidth: 8,
              cutOutSize: MediaQuery.of(context).size.width * 0.7,
            ),
            onPermissionSet: (ctrl, hasPermission) {
              if (!hasPermission) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text(
                      'Camera permission is required to scan QR codes',
                    ),
                    backgroundColor: Colors.red,
                  ),
                );
              }
            },
          ),

          // Instructions overlay
          Positioned(
            top: 20,
            left: 20,
            right: 20,
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: _locationReady
                    ? Colors.black.withValues(alpha: 0.7)
                    : Colors.orange.withValues(alpha: 0.9),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (!_locationReady) ...[
                    const Icon(
                      Icons.location_off,
                      color: Colors.white,
                      size: 32,
                    ),
                    const SizedBox(height: 8),
                  ],
                  Text(
                    _locationReady
                        ? 'Position the QR code within the frame'
                        : _locationError ?? 'Checking location services...',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  if (!_locationReady) ...[
                    const SizedBox(height: 12),
                    ElevatedButton.icon(
                      onPressed: _checkLocationRequirements,
                      icon: const Icon(Icons.refresh, size: 18),
                      label: const Text('Retry'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: Colors.orange,
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),

          // Flash toggle button
          Positioned(
            bottom: 100,
            left: 0,
            right: 0,
            child: Center(
              child: FloatingActionButton(
                onPressed: _toggleFlash,
                backgroundColor: _isFlashOn
                    ? theme.colorScheme.primary
                    : Colors.white.withValues(alpha: 0.9),
                child: Icon(
                  _isFlashOn ? Icons.flash_on : Icons.flash_off,
                  color: _isFlashOn ? Colors.white : Colors.black,
                ),
              ),
            ),
          ),

          // Scanning indicator
          if (!_hasScanned && _locationReady)
            Positioned(
              bottom: 30,
              left: 0,
              right: 0,
              child: Center(
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 24,
                    vertical: 12,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.black.withValues(alpha: 0.7),
                    borderRadius: BorderRadius.circular(24),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.location_on,
                        color: theme.colorScheme.primary,
                        size: 16,
                      ),
                      const SizedBox(width: 8),
                      SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation<Color>(
                            theme.colorScheme.primary,
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      const Text(
                        'Ready to scan',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
