# Flutter Apps Section Field Update

## Summary
Updated both Student and Parent Flutter apps to include the `section` field across all relevant screens and models.

## Student App Changes

### 1. Model (`student_app/lib/models/student.dart`)
✅ Added `section` field to Student model
- Added to constructor
- Added to `fromJson` factory
- Added to `toJson` method

### 2. Registration Screen (`student_app/lib/screens/registration_screen.dart`)
✅ Added section input field
- New `_sectionController` TextEditingController
- Section field between Grade and Phone
- Placeholder: "e.g., A, B, Einstein"
- Optional field
- Proper disposal in dispose method

### 3. Auth Service (`student_app/lib/services/auth_service.dart`)
✅ Updated register method
- Added `section` parameter
- Sends section to backend API

### 4. Auth Provider (`student_app/lib/services/auth_provider.dart`)
✅ Updated register method
- Added `section` parameter
- Passes section to auth service

### 5. Profile Service (`student_app/lib/services/profile_service.dart`)
✅ Updated updateProfile method
- Added `section` parameter
- Sends section in update request

### 6. Profile Screen (`student_app/lib/screens/profile_screen.dart`)
✅ Added section field
- New `_sectionController` TextEditingController
- Section card between Grade and Phone
- Editable when in edit mode
- Validation (max 20 characters)
- Syncs with server
- Proper disposal

### 7. Home Screen (`student_app/lib/screens/home_screen.dart`)
✅ Updated display
- Shows both grade and section
- Format: "Grade: X • Section: Y"
- Only shows if values exist

## Parent App Changes

### 1. Model (`parent_app/lib/models/linked_student.dart`)
✅ Added `section` field to LinkedStudent model
- Added to constructor
- Added to `fromJson` factory
- Added to `toJson` method

### 2. Home Screen (`parent_app/lib/screens/home_screen.dart`)
✅ Updated student card display
- Shows both grade and section
- Format: "Grade: X • Section: Y"
- Only shows if values exist

### 3. Attendance History Screen
The section will automatically appear in student info since the model is updated.

## Backend Integration

All Flutter changes are compatible with the backend updates:
- Registration endpoint accepts `section`
- Login response includes `section`
- Profile endpoints handle `section`
- Parent endpoints return `section` for linked students

## Testing Checklist

### Student App
- [ ] Register new student with section
- [ ] Register new student without section
- [ ] Login and verify section displays on home screen
- [ ] Edit profile and update section
- [ ] View profile and verify section shows correctly
- [ ] Verify section persists after logout/login

### Parent App
- [ ] Link student and verify section displays
- [ ] View student card on home screen
- [ ] Check attendance history shows section
- [ ] Verify section updates when student updates profile

## UI/UX Notes

### Display Format
- When both grade and section exist: "Grade: 10 • Section: A"
- When only grade exists: "Grade: 10"
- When only section exists: "Section: A"
- When neither exists: Field not shown

### Input Fields
- Both grade and section are optional
- No strict validation (free text)
- Max length: 20 characters
- Placeholder examples provided
- Icon: Grade uses school icon, Section uses group icon

## Migration Notes

### Existing Users
- Existing students without section will have `null` value
- Apps handle null gracefully (field not displayed)
- Users can add section via profile edit

### Data Consistency
- Section field is optional in database
- No default value
- Can be updated anytime
- No impact on existing functionality

## Error Handling

### Archived Account
The student app already handles the archived account error from the backend:
- Error code: `ACCOUNT_ARCHIVED`
- Message: "Your account has been archived. Please contact the school administrator."
- Prevents login for archived students

## Next Steps

1. Test registration with section field
2. Test profile updates
3. Verify display in both apps
4. Test with null/empty section values
5. Verify backend integration
6. Update any documentation
7. Consider adding autocomplete in future (fetch from API)

## Future Enhancements

### Autocomplete (Optional)
Could add autocomplete for section field:
1. Fetch available sections from API
2. Use `Autocomplete` widget in Flutter
3. Cache options locally
4. Allow free text entry for new sections

### Implementation Example:
```dart
Autocomplete<String>(
  optionsBuilder: (TextEditingValue textEditingValue) {
    return availableSections.where((String option) {
      return option.toLowerCase().contains(
        textEditingValue.text.toLowerCase(),
      );
    });
  },
  onSelected: (String selection) {
    _sectionController.text = selection;
  },
  fieldViewBuilder: (context, controller, focusNode, onFieldSubmitted) {
    return TextFormField(
      controller: controller,
      focusNode: focusNode,
      decoration: InputDecoration(
        labelText: 'Section',
        hintText: 'e.g., A, B, Einstein',
      ),
    );
  },
)
```

## Files Modified

### Student App (7 files)
1. `lib/models/student.dart`
2. `lib/screens/registration_screen.dart`
3. `lib/screens/home_screen.dart`
4. `lib/screens/profile_screen.dart`
5. `lib/services/auth_service.dart`
6. `lib/services/auth_provider.dart`
7. `lib/services/profile_service.dart`

### Parent App (2 files)
1. `lib/models/linked_student.dart`
2. `lib/screens/home_screen.dart`

## Compatibility

- ✅ Backward compatible with existing data
- ✅ Works with backend API v2
- ✅ Handles null values gracefully
- ✅ No breaking changes
- ✅ Optional field (no required validation)
