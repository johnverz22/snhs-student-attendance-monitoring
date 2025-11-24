# Phone Format Update Summary

## Philippine Mobile Format: 09XX XXX XXXX

Updated phone number validation across the entire system to enforce Philippine mobile number format.

## Format Requirements

- **Pattern**: `09XX XXX XXXX`
- **Length**: 11 digits
- **Prefix**: Must start with `09`
- **Spaces**: Allowed (automatically removed during validation)
- **Optional**: Field remains optional

## Valid Examples
- `09123456789` ✅
- `0912 345 6789` ✅
- `09XX XXX XXXX` (with actual digits) ✅

## Invalid Examples
- `12345678901` ❌ (doesn't start with 09)
- `091234567` ❌ (too short)
- `091234567890` ❌ (too long)
- `0812345678` ❌ (starts with 08)
- `09XX XXX XXXX` ❌ (contains letters)

## Changes Made

### Backend Validation

#### `src/middleware/validation.js`
Updated both `studentRegistrationRules` and `studentProfileUpdateRules`:

```javascript
body('phone')
  .optional()
  .trim()
  .custom((value) => {
    if (!value) return true; // Optional field
    // Remove spaces for validation
    const cleanPhone = value.replace(/\s/g, '');
    // Philippine mobile format: 09XX XXX XXXX (11 digits starting with 09)
    if (!/^09\d{9}$/.test(cleanPhone)) {
      throw new Error('Phone format must be 09XX XXX XXXX');
    }
    return true;
  }),
```

**Features:**
- Removes spaces before validation
- Validates 11 digits starting with 09
- Clear error message
- Optional field (empty allowed)

### Frontend Validation

#### `student_app/lib/screens/profile_screen.dart`
Updated phone field validator:

```dart
validator: (value) {
  if (value != null && value.isNotEmpty) {
    // Remove spaces for validation
    final cleanPhone = value.replaceAll(' ', '');
    // Philippine mobile format: 09XX XXX XXXX (11 digits starting with 09)
    final phoneRegex = RegExp(r'^09\d{9}$');
    if (!phoneRegex.hasMatch(cleanPhone)) {
      return 'Format: 09XX XXX XXXX';
    }
  }
  return null;
},
```

**Features:**
- Removes spaces before validation
- Shows format hint: `09XX XXX XXXX`
- Clear error message
- Optional field

#### `student_app/lib/screens/registration_screen.dart`
Added phone validation to registration:

```dart
validator: (value) {
  if (value != null && value.isNotEmpty) {
    // Remove spaces for validation
    final cleanPhone = value.replaceAll(' ', '');
    // Philippine mobile format: 09XX XXX XXXX (11 digits starting with 09)
    final phoneRegex = RegExp(r'^09\d{9}$');
    if (!phoneRegex.hasMatch(cleanPhone)) {
      return 'Format: 09XX XXX XXXX';
    }
  }
  return null;
},
```

**UI Updates:**
- Hint text changed to: `09XX XXX XXXX`
- Consistent validation across registration and profile

## Testing

Created `src/scripts/testPhoneValidation.js` to verify:

### Test Results
```
✅ PASS: Valid format without spaces (09123456789)
✅ PASS: Valid format with spaces (0912 345 6789)
✅ PASS: Invalid - contains letters (rejected)
✅ PASS: Invalid - does not start with 09 (rejected)
✅ PASS: Invalid - too short (rejected)
✅ PASS: Invalid - too long (rejected)
✅ PASS: Invalid - starts with 08 (rejected)
✅ PASS: Empty (optional field - accepted)

🎉 All tests passed!
```

## User Experience

### Registration Screen
- Hint text shows format: `09XX XXX XXXX`
- Real-time validation on submit
- Clear error message if format is wrong
- Optional field (can be left empty)

### Profile Screen
- Hint text shows format when editing: `09XX XXX XXXX`
- Validation on save
- Clear error message: "Format: 09XX XXX XXXX"
- Optional field (can be cleared)

### Backend API
- Validates on registration
- Validates on profile update
- Returns clear error: "Phone format must be 09XX XXX XXXX"
- Accepts spaces (automatically removed)

## Files Modified

1. `src/middleware/validation.js` - Backend validation rules
2. `student_app/lib/screens/profile_screen.dart` - Profile phone validation
3. `student_app/lib/screens/registration_screen.dart` - Registration phone validation
4. `src/scripts/testPhoneValidation.js` - Test script (created)

## Backward Compatibility

- Existing phone numbers in database are not affected
- Validation only applies to new entries and updates
- Empty phone numbers remain valid (optional field)
- Spaces in existing numbers are handled gracefully

## Notes

- Format is specific to Philippine mobile numbers
- Landline numbers are not supported
- International format (+63) is not supported
- Users can type with or without spaces
- Validation removes spaces automatically
