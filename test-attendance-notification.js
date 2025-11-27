#!/usr/bin/env node
/**
 * Test attendance notification for a specific student
 * Usage: node test-attendance-notification.js <student_id>
 */

const dbManager = require('./src/models/database');
const notificationService = require('./src/services/notificationService');

async function testAttendanceNotification(studentId) {
  try {
    console.log('\n=== Testing Attendance Notification ===\n');
    
    // Initialize database
    await dbManager.initialize();
    console.log('✓ Database connected\n');

    // Mock attendance data
    const attendanceData = {
      attendanceId: 999,
      studentName: 'Test Student',
      entryTime: new Date().toISOString(),
      gateName: 'Main Gate',
      locationValid: true,
    };

    console.log(`Sending attendance notification for student ${studentId}...`);
    console.log('Attendance data:', JSON.stringify(attendanceData, null, 2));
    console.log('');

    // Send notification
    const result = await notificationService.sendAttendanceNotification(
      studentId,
      attendanceData
    );

    console.log('\nNotification Result:');
    console.log(JSON.stringify(result, null, 2));

    if (result.success) {
      console.log(`\n✓ Notifications sent: ${result.notificationsSent}`);
      console.log(`✗ Notifications failed: ${result.notificationsFailed}`);
      
      if (result.results && result.results.length > 0) {
        console.log('\nDetailed Results:');
        result.results.forEach((r, i) => {
          console.log(`\n  ${i + 1}. Parent ID: ${r.parentId}`);
          console.log(`     Platform: ${r.platform}`);
          console.log(`     Token: ${r.deviceToken.substring(0, 30)}...`);
          console.log(`     Success: ${r.success ? '✓' : '✗'}`);
          if (!r.success) {
            console.log(`     Error: ${r.error}`);
          }
        });
      }
    } else {
      console.log('\n✗ Notification failed');
    }

    await dbManager.close();
    console.log('\n=== Test Complete ===\n');
  } catch (error) {
    console.error('\n✗ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Get student ID from command line
const studentId = process.argv[2];

if (!studentId) {
  console.log('Usage: node test-attendance-notification.js <student_id>');
  console.log('Example: node test-attendance-notification.js 1');
  process.exit(1);
}

testAttendanceNotification(parseInt(studentId, 10));
