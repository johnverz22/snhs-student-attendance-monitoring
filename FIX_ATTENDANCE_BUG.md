# Fix: Newly Registered Student Has Attendance Logs

## The Issue

A newly registered student is seeing attendance logs that they didn't create.

## Possible Causes

1. **Test data in database** - There might be old test attendance logs
2. **Wrong student ID mapping** - The JWT token might have the wrong student ID
3. **Database ID collision** - A new student got the same database ID as an old deleted student

## Diagnosis Steps

### Step 1: Check the Student's Data

Run this command with the student's email:

```bash
node check-student-data.js student@example.com
```

This will show:
- Student's database ID
- Student's information
- All attendance logs for this student
- Recent students in the database

### Step 2: Verify the Issue

The script will tell you:
- How many attendance logs exist
- When they were created
- Which gates they were logged at

## Solutions

### Solution 1: Delete the Attendance Logs

If the logs are from test data or shouldn't exist:

```bash
node delete-student-attendance.js student@example.com
```

This will:
1. Show you the student's info
2. Count the attendance logs
3. Ask for confirmation
4. Delete all attendance logs for that student

### Solution 2: Check for Database ID Reuse

If a student was deleted and a new student got the same ID:

```sql
-- Check if there are orphaned attendance logs
SELECT al.id, al.entry_time, al.student_id, qr.gate_name
FROM attendance_logs al
LEFT JOIN students s ON al.student_id = s.id
JOIN qr_codes qr ON al.qr_code_id = qr.id
WHERE s.id IS NULL;
```

If you find orphaned logs, delete them:

```sql
DELETE FROM attendance_logs
WHERE student_id NOT IN (SELECT id FROM students);
```

### Solution 3: Clean All Test Data

To start fresh and remove all test data:

```sql
-- Delete all attendance logs
DELETE FROM attendance_logs;

-- Delete all students (except specific ones you want to keep)
DELETE FROM students WHERE email LIKE '%test%' OR email LIKE '%example%';

-- Delete all parents
DELETE FROM parents WHERE email LIKE '%test%' OR email LIKE '%example%';
```

## Prevention

To prevent this in the future:

### 1. Use Proper Test Accounts

Create dedicated test accounts with obvious names:
- `test-student-1@test.com`
- `test-student-2@test.com`

### 2. Clean Test Data Regularly

Run cleanup scripts before production:

```bash
# Delete all test students and their data
node cleanup-test-data.js
```

### 3. Use Database Constraints

The database already has proper foreign key constraints:
```sql
FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
```

This means when a student is deleted, their attendance logs are automatically deleted.

## Verify the Fix

After cleaning up:

1. **Login to the student app** with the affected student
2. **Check attendance history** - should be empty
3. **Scan a QR code** - should create a new log
4. **Check history again** - should show only the new log

## Quick Commands Reference

```bash
# Check student data
node check-student-data.js student@example.com

# Delete student's attendance logs
node delete-student-attendance.js student@example.com

# Check all students
node check-student-data.js

# Create admin to access admin panel
node create-admin-vercel.js
```

## Need More Help?

If the issue persists:

1. **Check the JWT token:**
   - Login to the student app
   - Check the token payload (decode at jwt.io)
   - Verify the `id` field matches the student's database ID

2. **Check the API response:**
   - Use the student app's debug logs
   - Look for the attendance history API call
   - Verify it's using the correct student ID

3. **Check database directly:**
   ```sql
   -- Get student by email
   SELECT * FROM students WHERE email = 'student@example.com';
   
   -- Get their attendance logs
   SELECT * FROM attendance_logs WHERE student_id = <student_db_id>;
   ```
