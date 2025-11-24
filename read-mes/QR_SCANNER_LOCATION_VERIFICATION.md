# QR Scanner Location Verification

## Overview

Enhanced the QR scanner to verify GPS location services and permissions BEFORE allowing any QR code scanning. This ensures students cannot bypass location verification.

## Key Improvements

### 1. Pre-Scan Location Check

**Before (Issue):**
- Location was only checked AFTER scanning QR code
- Students could scan QR codes even if location was disabled
- Location errors appeared after the scan

**After (Fixed):**
- Location services checked immediately when scanner opens
- Scanning is blocked until location requirements are met
- Clear visual feedback about location status
- Cannot proceed without location enabled

### 2. Location Requirements

The scanner now enforces these requirements:

1. **Location Services Enabled**
   - GPS/Location services must be turned on
   - Shows dialog to open location settings if disabled

2. **Location Permission Granted**
   - App must have location permission
   - Shows dialog to open app settings if denied
   - Handles "denied forever" case separately

3. **Real-time Status**
   - Visual indicator shows location readiness
   - Orange warning if location not ready
   - Green/ready state when location is available

## Implementation Details

### State Management

Added new state variables:
```dart
bool _locationReady = false;      // Tracks if location is ready
String? _locationError;           // Stores error message if any
```

### Initialization Flow

```dart
@override
void initState() {
  super.initState();
  _checkLocationRequirements();  // Check immediately on load
}
```

### Location Check Process

1. **Check Location Services**
   ```dart
   final serviceEnabled = await _locationService.isLocationServiceEnabled();
   ```
   - If disabled → Show dialog with "Open Settings" button
   - Opens device location settings

2. **Check Permissions**
   ```dart
   final permission = await _locationService.checkPermission();
   ```
   - If denied → Request permission
   - If denied forever → Show dialog with "Open App Settings"
   - Opens app-specific settings

3. **Set Ready State**
   ```dart
   setState(() {
     _locationReady = true;
     _locationError = null;
   });
   ```

### Scan Prevention

QR codes are only processed if location is ready:

```dart
controller.scannedDataStream.listen((scanData) {
  if (!_hasScanned && !_isProcessing && _locationReady && scanData.code != null) {
    // Process scan
  } else if (!_locationReady && scanData.code != null) {
    // Show warning
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Location services must be enabled to scan'),
        backgroundColor: Colors.orange,
      ),
    );
  }
});
```

## User Experience

### Location Ready State
- **Top Banner**: "Position the QR code within the frame" (black background)
- **Bottom Indicator**: "Ready to scan" with location icon and spinner
- **Scanner**: Active and ready to scan

### Location Not Ready State
- **Top Banner**: Orange background with warning
  - Location off icon
  - Error message (e.g., "Location services are disabled")
  - "Retry" button
- **Bottom Indicator**: Hidden (not ready to scan)
- **Scanner**: Camera active but scans are blocked

### Dialog Prompts

#### Location Services Disabled
```
Title: "Location Services Required"
Message: "Please enable location services to scan attendance QR codes."
Actions: [Open Settings] [Cancel]
```

#### Permission Denied
```
Title: "Location Permission Required"
Message: "Location access is required to verify you are at school when scanning QR codes."
Actions: [Open Settings] [Cancel]
```

#### Permission Denied Forever
```
Title: "Location Permission Required"
Message: "Location access is required to verify you are at school when scanning QR codes."
Actions: [Open Settings] [Cancel]
Note: Opens app-specific settings page
```

## Security Benefits

1. **Cannot Bypass Location**
   - Scanning is completely blocked without location
   - No way to submit attendance without GPS verification

2. **Clear User Guidance**
   - Users know exactly what's needed
   - Direct links to settings
   - Retry mechanism after fixing issues

3. **Persistent Verification**
   - Location checked on every screen load
   - Status continuously monitored
   - Visual feedback at all times

## Testing Scenarios

### Scenario 1: Location Services Disabled
1. Open QR scanner
2. See orange warning banner
3. Tap "Open Settings" or retry button
4. Enable location services
5. Return to app
6. Scanner becomes ready automatically

### Scenario 2: Permission Denied
1. Open QR scanner
2. Permission dialog appears
3. Deny permission
4. See orange warning banner
5. Tap "Open Settings"
6. Grant permission in app settings
7. Return to app
8. Scanner becomes ready

### Scenario 3: All Requirements Met
1. Open QR scanner
2. Location check passes immediately
3. See "Ready to scan" indicator
4. Scan QR code normally
5. Location is verified during submission

### Scenario 4: Try to Scan Without Location
1. Disable location after scanner opens
2. Try to scan QR code
3. See warning: "Location services must be enabled to scan"
4. Scan is blocked
5. Must enable location to proceed

## Files Modified

- `student_app/lib/screens/qr_scanner_screen.dart`
  - Added location pre-check in `initState()`
  - Added `_checkLocationRequirements()` method
  - Added `_showLocationRequiredDialog()` method
  - Updated `_onQRViewCreated()` to check `_locationReady`
  - Enhanced UI with location status indicators
  - Added retry mechanism

## Dependencies Used

- `geolocator` package for location services
- `LocationService` class for permission handling
- Built-in Flutter dialogs and snackbars

## Error Handling

All location errors are handled gracefully:
- Service disabled → Open location settings
- Permission denied → Request permission
- Permission denied forever → Open app settings
- Timeout → Show retry option
- Unknown errors → Display error message with retry

## Conclusion

The QR scanner now properly enforces location requirements BEFORE allowing any scanning. This ensures:
- ✅ Students must have location enabled
- ✅ Students must grant location permission
- ✅ Location is verified before and during scanning
- ✅ Clear feedback about what's needed
- ✅ Easy path to fix issues
- ✅ No way to bypass location verification
