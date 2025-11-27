#!/usr/bin/env node
/**
 * Test push notification to a specific device token
 * Usage: node test-notification.js
 */

const notificationService = require('./src/services/notificationService');

async function testNotification() {
  const deviceToken = 'fpg7be96T02Sz_mMt5tYiH:APA91bGMeuoiocLqXZGckMMOAGdOFW7xYWj9_zdwX_Qsfhc9pIud55K5_iphqr9RgrKEN8yCWRIMVSz2wMo34Y0amGTgTMsiSfLJ2GxQbH2UiSyqNzVMWJQ';

  console.log('\n=== Testing Push Notification ===\n');
  console.log(`Device Token: ${deviceToken.substring(0, 30)}...`);
  console.log('Sending test notification...\n');

  try {
    // Test with a simple notification
    const result = await notificationService.testNotification(deviceToken);

    console.log('Result:', JSON.stringify(result, null, 2));

    if (result.success) {
      console.log('\n✓ Notification sent successfully!');
      console.log('Check your device for the notification.');
    } else {
      console.log('\n✗ Notification failed');
      console.log('Error:', result.error);
      console.log('Message:', result.message);
    }
  } catch (error) {
    console.error('\n✗ Error:', error.message);
    console.error(error);
  }

  console.log('\n=== Test Complete ===\n');
}

testNotification();
