# Student Linking Feature

## Overview
Parents can now link and unlink students to their account after registration.

## Features Added

### 1. Backend API Endpoints

**Link Student**
- **Endpoint:** `POST /api/parent/link-student`
- **Auth:** Required (Parent role)
- **Body:**
  ```json
  {
    "studentId": "STUDENT_ID",
    "relationship": "Mother" // Optional, defaults to "Parent"
  }
  ```
- **Response:** Success message with linked student details

**Unlink Student**
- **Endpoint:** `DELETE /api/parent/unlink-student/:studentId`
- **Auth:** Required (Parent role)
- **Response:** Success message

### 2. Parent App UI

**Manage Students Screen**
- New dedicated screen for managing student links
- Form to link new students by Student ID
- List of currently linked students
- Ability to unlink students with confirmation dialog
- Real-time updates after linking/unlinking

**Access Points:**
1. **Settings Screen:** Tap on the linked students count
2. **Home Screen:** 
   - "Link Student" button when no students are linked
   - "+" icon button in the header when students exist

### 3. User Flow

**Linking a Student:**
1. Navigate to Manage Students screen
2. Enter the Student ID
3. Optionally enter relationship (Mother, Father, Guardian, etc.)
4. Tap "Link Student"
5. Student appears in the list immediately

**Unlinking a Student:**
1. Navigate to Manage Students screen
2. Tap the delete icon on a student card
3. Confirm the action in the dialog
4. Student is removed from the list

## Validation

- Student ID must exist in the system
- Cannot link the same student twice
- Only the parent who linked a student can unlink them
- Confirmation required before unlinking

## Error Handling

- Student not found
- Already linked
- Network errors
- Invalid input

## UI/UX Features

- Loading states during API calls
- Success/error messages via SnackBars
- Confirmation dialogs for destructive actions
- Empty state with helpful message
- Real-time list updates
- Smooth navigation

## Testing

To test the feature:
1. Register as a parent
2. Navigate to Settings → Linked Students
3. Enter a valid Student ID
4. Verify the student appears in the list
5. Try unlinking and relinking
6. Test error cases (invalid ID, already linked, etc.)

## Notes

- Parents can link multiple students
- Each link can have a custom relationship label
- Students must be registered in the system first
- The feature works seamlessly with existing attendance monitoring
