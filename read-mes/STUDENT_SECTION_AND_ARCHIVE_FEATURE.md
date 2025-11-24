# Student Section and Archive Feature Implementation

## Overview
Added section field to student records and student management system for admins with archive functionality.

## Database Changes

### Migration v2
- Added `section` field to students table (TEXT, nullable)
- Added `is_archived` field to students table (BOOLEAN, default 0)
- Created indexes for performance:
  - `idx_students_archived` on `is_archived`
  - `idx_students_grade_section` on `grade, section`

### Migration Command
The migration runs automatically on server start. To manually trigger:
```bash
node src/scripts/initDatabase.js
```

## Backend Changes

### 1. Auth Routes (`src/routes/auth.js`)
- **Student Registration**: Now accepts `section` field
- **Student Login**: Checks if student is archived and blocks login with error message
- **Response**: Includes `section` in student data

### 2. Student Routes (`src/routes/student.js`)
- **Profile Endpoint**: Returns `section` field
- **Update Profile**: Can update `section` field

### 3. Parent Routes (`src/routes/parent.js`)
- **Get Students**: Returns `section` field and filters out archived students
- **Link Student**: Works with active students only

### 4. Admin Routes (`src/routes/admin.js`)
New endpoints added:

**GET /api/admin/students**
- List all students with pagination
- Filters: grade, section, archived status, search
- Returns available grades and sections for filter dropdowns
- Query params:
  - `page` (default: 1)
  - `limit` (default: 50, max: 100)
  - `grade` (optional)
  - `section` (optional)
  - `archived` (default: 'false')
  - `search` (optional)

**PUT /api/admin/students/:id**
- Update student information
- Fields: name, email, grade, section, phone
- Validates uniqueness of email

**POST /api/admin/students/:id/archive**
- Archive a student
- Prevents login after archiving
- Cannot archive already archived student

**POST /api/admin/students/:id/unarchive**
- Restore archived student
- Allows login again
- Cannot unarchive active student

## Frontend Changes

### Admin Web Interface

**New Page: `public/admin/students.html`**
- Full student management interface
- Features:
  - Search by name, ID, or email
  - Filter by grade, section, and status
  - Pagination (20 students per page)
  - Edit student details
  - Archive/unarchive students
  - Autocomplete for grade and section

**New Script: `public/admin/js/students.js`**
- Handles all student management operations
- Real-time search with debouncing
- Modal for editing student details
- Confirmation dialogs for archive operations
- Toast notifications for success/error

### Student App (Flutter)

**Files to Update:**
1. `student_app/lib/screens/registration_screen.dart`
   - Add section field with autocomplete
   - Fetch available sections from API

2. `student_app/lib/screens/profile_screen.dart`
   - Display section field
   - Allow editing section

3. `student_app/lib/models/student.dart`
   - Add section property

4. `student_app/lib/services/auth_service.dart`
   - Handle section in registration
   - Handle archived account error

### Parent App (Flutter)

**Files to Update:**
1. `parent_app/lib/screens/home_screen.dart`
   - Display student section

2. `parent_app/lib/screens/attendance_history_screen.dart`
   - Show section in student info

3. `parent_app/lib/models/student.dart`
   - Add section property

## Autocomplete Implementation

### Backend
- GET `/api/admin/students` returns unique grades and sections
- Automatically populated from existing student records
- No manual configuration needed

### Frontend (Admin)
- HTML5 `<datalist>` for autocomplete
- Dynamically populated from API response
- Allows free text entry for new values

### Frontend (Flutter Apps)
- Use `Autocomplete` widget
- Fetch options from API
- Cache locally for offline use

## Archive Functionality

### Behavior
- Archived students:
  - Cannot log in (403 error with message)
  - Not shown in parent's linked students
  - Not included in active student lists
  - Can be filtered and viewed in admin panel
  - Can be unarchived to restore access

### Use Cases
- Graduated students
- Transferred students
- Inactive accounts
- Data retention without deletion

## Testing

### Test Archive Feature
```bash
# Archive a student
curl -X POST http://localhost:3000/api/admin/students/1/archive \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Try to login as archived student (should fail)
curl -X POST http://localhost:3000/api/auth/student/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com","password":"password"}'

# Unarchive student
curl -X POST http://localhost:3000/api/admin/students/1/unarchive \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Test Section Field
```bash
# Register with section
curl -X POST http://localhost:3000/api/auth/student/register \
  -H "Content-Type: application/json" \
  -d '{
    "student_id":"2024001",
    "name":"John Doe",
    "email":"john@example.com",
    "password":"password123",
    "grade":"Grade 10",
    "section":"A"
  }'

# Update section
curl -X PUT http://localhost:3000/api/admin/students/1 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"section":"B"}'
```

## Admin Interface Access

Navigate to: `http://localhost:3000/admin/students.html`

Features:
1. View all students with filters
2. Search by name, ID, or email
3. Filter by grade and section
4. Toggle between active and archived
5. Edit student details
6. Archive/unarchive students

## Error Messages

### Archived Account Login
```json
{
  "success": false,
  "error": "ACCOUNT_ARCHIVED",
  "message": "Your account has been archived. Please contact the school administrator."
}
```

### Already Archived
```json
{
  "success": false,
  "error": "ALREADY_ARCHIVED",
  "message": "Student is already archived"
}
```

## Next Steps

1. Update Flutter apps to include section field
2. Add section to registration forms
3. Display section in profile screens
4. Test archive functionality end-to-end
5. Add section to attendance reports
6. Update documentation

## Notes

- Section field is optional (can be null)
- Autocomplete options grow automatically as new sections are added
- Archive is soft delete (data preserved)
- Unarchive restores full functionality
- Grade and section are free-text fields for flexibility
- Consider adding grade/section validation if needed
