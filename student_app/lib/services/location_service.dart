import 'dart:async';
import 'package:geolocator/geolocator.dart';

/// Service for handling GPS location functionality
class LocationService {
  /// Check if location services are enabled
  Future<bool> isLocationServiceEnabled() async {
    return await Geolocator.isLocationServiceEnabled();
  }

  /// Check and request location permissions
  Future<LocationPermission> checkPermission() async {
    LocationPermission permission = await Geolocator.checkPermission();

    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }

    return permission;
  }

  /// Get current GPS coordinates
  /// Throws exceptions if location services are disabled or permission is denied
  Future<Position> getCurrentLocation() async {
    try {
      // Check if location services are enabled
      bool serviceEnabled = await isLocationServiceEnabled();
      if (!serviceEnabled) {
        throw LocationServiceDisabledException();
      }

      // Check permissions
      LocationPermission permission = await checkPermission();

      if (permission == LocationPermission.denied) {
        throw PermissionDeniedException('Location permission denied');
      }

      if (permission == LocationPermission.deniedForever) {
        throw PermissionDeniedException(
          'Location permissions are permanently denied. Please enable them in settings.',
        );
      }

      // Try to get last known position first (faster)
      Position? lastPosition;
      try {
        lastPosition = await Geolocator.getLastKnownPosition();
        // If last position is recent (within 5 minutes), use it
        if (lastPosition != null) {
          final age = DateTime.now().difference(lastPosition.timestamp);
          if (age.inMinutes < 5) {
            return lastPosition;
          }
        }
      } catch (e) {
        // Ignore errors getting last position, will get current position
      }

      // Get current position with medium accuracy for faster response
      Position position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.medium,
          distanceFilter: 0,
          timeLimit: Duration(seconds: 15),
        ),
      );

      return position;
    } catch (e) {
      rethrow;
    }
  }

  /// Get current location with timeout
  Future<Position> getCurrentLocationWithTimeout({
    Duration timeout = const Duration(seconds: 20),
  }) async {
    try {
      return await getCurrentLocation().timeout(
        timeout,
        onTimeout: () {
          throw LocationTimeoutException(
            'Location request timed out. Please ensure GPS is enabled and you have a clear view of the sky.',
          );
        },
      );
    } catch (e) {
      rethrow;
    }
  }

  /// Open location settings
  Future<bool> openLocationSettings() async {
    return await Geolocator.openLocationSettings();
  }

  /// Open app settings
  Future<bool> openAppSettings() async {
    return await Geolocator.openAppSettings();
  }
}

/// Exception thrown when location request times out
class LocationTimeoutException implements Exception {
  final String message;

  LocationTimeoutException([this.message = 'Request timed out']);

  @override
  String toString() => message;
}
