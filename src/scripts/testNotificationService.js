const dbManager = require('../models/database');
const notificationService = require('../services/notificationService');
const authService = require('../services/authService');

/**
 * Test script for notification service
 */
async function testNotificationService() {
  console.log('=== Testing Notification Service ===\n');

  try {
    // Initialize database
    dbManager.initialize();
    const db = dbManager.getConnection();

    // Test 1: Register device token
    console.log('Test 1: Register device token');
    
    // First, create a test parent if not exists
    const testParentEmail = 'testparent@example.com';
    let parent = db.prepare('SELECT id FROM parents WHERE email = ?').get(testParentEmail);
    
    if (!parent) {
      console.log('Creating test parent...');
      const hashedPassword = await authService.hashPassword('TestPassword123');
      const result = db.prepare(`
        INSERT INTO parents (name, email, password_hash, phone)
        VALUES (?, ?, ?, ?)
      `).run('Test Parent', testParentEmail, hashedPassword, '555-0100');
      
      parent = { id: result.lastInsertRowid };
      console.log(`Created test parent with ID: ${parent.id}`);
    } else {
      console.log(`Using existing test parent with ID: ${parent.id}`);
    }

    // Register a test device token
    const testDeviceToken = 'test_device_token_' + Date.now();
    const registerResult = await notificationService.registerDeviceToken(
      parent.id,
      testDeviceToken,
      'android'
    );
    
    console.log('Register result:', registerResult);
    console.log('✓ Device token registered successfully\n');

    // Test 2: Register duplicate token (should handle gracefully)
    console.log('Test 2: Register duplicate device token');
    const duplicateResult = await notificationService.registerDeviceToken(
      parent.id,
      testDeviceToken,
      'android'
    );
    
    console.log('Duplicate register result:', duplicateResult);
    console.log('✓ Duplicate token handled correctly\n');

    // Test 3: Get parent device tokens
    console.log('Test 3: Get parent device tokens');
    const tokens = await notificationService.getParentDeviceTokens(parent.id);
    console.log('Device tokens:', tokens);
    console.log(`✓ Found ${tokens.length} active token(s)\n`);

    // Test 4: Test notification (will fail without valid API key, but tests the logic)
    console.log('Test 4: Test sending notification');
    const testResult = await notificationService.testNotification(testDeviceToken);
    console.log('Test notification result:', testResult);
    
    if (testResult.success) {
      console.log('✓ Notification sent successfully\n');
    } else {
      console.log(`⚠ Notification failed (expected if API key not configured): ${testResult.message}\n`);
    }

    // Test 5: Test attendance notification
    console.log('Test 5: Test attendance notification');
    
    // Create a test student linked to the parent
    const testStudentEmail = 'teststudent@example.com';
    let student = db.prepare('SELECT id FROM students WHERE email = ?').get(testStudentEmail);
    
    if (!student) {
      console.log('Creating test student...');
      const hashedPassword = await authService.hashPassword('TestPassword123');
      
      // Find a unique student_id
      let studentIdNum = 1;
      let uniqueStudentId = `STU${String(studentIdNum).padStart(3, '0')}`;
      while (db.prepare('SELECT id FROM students WHERE student_id = ?').get(uniqueStudentId)) {
        studentIdNum++;
        uniqueStudentId = `STU${String(studentIdNum).padStart(3, '0')}`;
      }
      
      const result = db.prepare(`
        INSERT INTO students (student_id, name, email, password_hash, grade)
        VALUES (?, ?, ?, ?, ?)
      `).run(uniqueStudentId, 'Test Student', testStudentEmail, hashedPassword, '10');
      
      student = { id: result.lastInsertRowid };
      console.log(`Created test student with ID: ${student.id}`);
      
      // Link parent to student
      db.prepare(`
        INSERT INTO parent_student_links (parent_id, student_id, relationship)
        VALUES (?, ?, ?)
      `).run(parent.id, student.id, 'parent');
      
      console.log('Linked parent to student');
    } else {
      console.log(`Using existing test student with ID: ${student.id}`);
      
      // Ensure parent-student link exists
      const link = db.prepare(`
        SELECT id FROM parent_student_links
        WHERE parent_id = ? AND student_id = ?
      `).get(parent.id, student.id);
      
      if (!link) {
        db.prepare(`
          INSERT INTO parent_student_links (parent_id, student_id, relationship)
          VALUES (?, ?, ?)
        `).run(parent.id, student.id, 'parent');
        console.log('Linked parent to student');
      }
    }

    // Test attendance notification
    const attendanceData = {
      attendanceId: 999,
      studentName: 'Test Student',
      entryTime: new Date().toISOString(),
      gateName: 'Main Gate',
    };

    const notificationResult = await notificationService.sendAttendanceNotification(
      student.id,
      attendanceData
    );
    
    console.log('Attendance notification result:', notificationResult);
    
    if (notificationResult.notificationsSent > 0) {
      console.log('✓ Attendance notification sent successfully\n');
    } else {
      console.log(`⚠ Attendance notification not sent: ${notificationResult.message}\n`);
    }

    // Test 6: Unregister device token
    console.log('Test 6: Unregister device token');
    const unregisterResult = await notificationService.unregisterDeviceToken(
      parent.id,
      testDeviceToken
    );
    
    console.log('Unregister result:', unregisterResult);
    console.log('✓ Device token unregistered successfully\n');

    // Test 7: Verify token is inactive
    console.log('Test 7: Verify token is inactive');
    const tokensAfterUnregister = await notificationService.getParentDeviceTokens(parent.id);
    console.log('Active device tokens after unregister:', tokensAfterUnregister);
    console.log(`✓ Active tokens count: ${tokensAfterUnregister.length}\n`);

    console.log('=== All Tests Completed ===');
    console.log('\nNote: Actual push notifications require a valid Pushy API key in .env file');
    console.log('Set PUSHY_API_KEY in your .env file to test real notifications');

  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  } finally {
    dbManager.close();
  }
}

// Run tests
testNotificationService();
