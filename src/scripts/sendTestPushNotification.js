/**
 * Send Test Push Notification via Firebase Cloud Messaging
 * Usage: node src/scripts/sendTestPushNotification.js <device-token>
 */

const notificationService = require('../services/notificationService');

const deviceToken = process.argv[2];

if (!deviceToken) {
  console.log('❌ Please provide a device token');
  console.log('Usage: node src/scripts/sendTestPushNotification.js <device-token>');
  console.log('\nTo get device token:');
  console.log('1. Login to parent app on physical device');
  console.log('2. Check app logs for "FCM device token: ..."');
  console.log('3. Or query database: SELECT device_token FROM push_tokens;');
  process.exit(1);
}

console.log('📤 Sending test push notification via Firebase...\n');
console.log(`Device Token: ${deviceToken.substring(0, 50)}...\n`);

async function sendNotification() {
  try {
    const result = await notificationService.testNotification(deviceToken);

    if (result.success) {
      console.log('✅ Notification sent successfully!');
      console.log(`   Message ID: ${result.messageId}`);
      console.log('\n📱 Check your device for the notification');
    } else {
      console.log('❌ Failed to send notification');
      console.log(`   Error: ${result.error}`);
      console.log(`   Message: ${result.message}`);
      
      if (result.error === 'FIREBASE_NOT_INITIALIZED') {
        console.log('\n💡 Firebase not initialized. Check:');
        console.log('   1. FIREBASE_SERVICE_ACCOUNT_PATH in .env');
        console.log('   2. firebase-service-account.json exists');
        console.log('   3. Service account JSON is valid');
      } else if (result.error === 'messaging/invalid-registration-token' ||
                 result.error === 'messaging/registration-token-not-registered') {
        console.log('\n💡 Device token is invalid or unregistered');
        console.log('   1. Get a fresh token from the app');
        console.log('   2. Ensure app has been opened and initialized');
      }
    }
  } catch (error) {
    console.log('❌ Error sending notification:');
    console.log(`   ${error.message}`);
  }
}

sendNotification();
