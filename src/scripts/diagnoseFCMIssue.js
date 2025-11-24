/**
 * Diagnose Firebase Cloud Messaging Issues
 */

const notificationService = require('../services/notificationService');
const Database = require('better-sqlite3');
const path = require('path');

console.log('🔍 Diagnosing Firebase Cloud Messaging Issues\n');

const dbPath = path.join(__dirname, '../../data/attendance.db');
const db = new Database(dbPath);

// Check Firebase initialization
console.log('🔥 Firebase Status:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
if (notificationService.initialized) {
  console.log('   ✅ Firebase Admin SDK initialized');
} else {
  console.log('   ❌ Firebase Admin SDK NOT initialized');
  console.log('   💡 Check:');
  console.log('      1. FIREBASE_SERVICE_ACCOUNT_PATH in .env');
  console.log('      2. firebase-service-account.json exists');
  console.log('      3. Service account JSON is valid');
}

// Get registered tokens
const tokens = db.prepare(`
  SELECT id, parent_id, device_token, platform, is_active, created_at 
  FROM push_tokens 
  ORDER BY id DESC 
  LIMIT 5
`).all();

console.log('\n📱 Registered Device Tokens:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
if (tokens.length === 0) {
  console.log('   ❌ No device tokens registered');
  console.log('   💡 Steps to register:');
  console.log('      1. Open parent app on device');
  console.log('      2. Login with parent credentials');
  console.log('      3. Check logs for "FCM device token"');
} else {
  tokens.forEach(token => {
    console.log(`   ID: ${token.id}`);
    console.log(`   Parent ID: ${token.parent_id}`);
    console.log(`   Token: ${token.device_token.substring(0, 50)}...`);
    console.log(`   Token Length: ${token.device_token.length} characters`);
    console.log(`   Platform: ${token.platform}`);
    console.log(`   Active: ${token.is_active ? 'Yes' : 'No'}`);
    console.log(`   Created: ${token.created_at}`);
    console.log('   ─────────────────────────────────────');
  });
}

// Check token validity
console.log('\n🔐 Token Validity Check:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

if (tokens.length > 0) {
  const latestToken = tokens[0];
  
  // FCM tokens are typically 150+ characters
  if (latestToken.device_token.length < 100) {
    console.log('   ⚠️  WARNING: Token seems too short for FCM!');
    console.log('   Expected: 150+ characters');
    console.log(`   Actual: ${latestToken.device_token.length} characters`);
    console.log('\n   💡 This might be:');
    console.log('      1. Truncated in database');
    console.log('      2. Old Pushy token (not FCM)');
    console.log('      3. Invalid token');
  } else {
    console.log('   ✅ Token length looks good for FCM');
  }
}

// Check database schema
console.log('\n📊 Database Schema Check:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const schema = db.prepare(`
  SELECT sql FROM sqlite_master 
  WHERE type='table' AND name='push_tokens'
`).get();

if (schema) {
  console.log('   Table Definition:');
  console.log('   ' + schema.sql.replace(/\n/g, '\n   '));
  
  // Check if device_token column has size limit
  if (schema.sql.includes('VARCHAR')) {
    const match = schema.sql.match(/device_token\s+VARCHAR\((\d+)\)/i);
    if (match) {
      const size = parseInt(match[1]);
      console.log(`\n   ⚠️  device_token column limited to ${size} characters`);
      if (size < 500) {
        console.log('   ❌ This is too small for FCM! Should be at least 500');
        console.log('   💡 FCM tokens are typically 150-200 characters');
      }
    }
  } else {
    console.log('\n   ✅ device_token is TEXT (no size limit)');
  }
}

// Test sending to latest token
async function testNotification() {
  if (!notificationService.initialized) {
    console.log('\n❌ Cannot test - Firebase not initialized');
    return;
  }

  if (tokens.length === 0) {
    console.log('\n❌ No tokens to test');
    return;
  }

  const latestToken = tokens[0];
  
  console.log('\n📤 Testing Notification Send:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`   Token: ${latestToken.device_token.substring(0, 50)}...`);
  
  try {
    const result = await notificationService.testNotification(latestToken.device_token);

    if (result.success) {
      console.log('\n   ✅ Notification sent successfully!');
      console.log(`   Message ID: ${result.messageId}`);
      console.log('   📱 Check your device now');
    } else {
      console.log(`\n   ❌ Error: ${result.error}`);
      console.log(`   Message: ${result.message}`);
      
      if (result.error === 'messaging/invalid-registration-token' ||
          result.error === 'messaging/registration-token-not-registered') {
        console.log('\n   💡 Token is invalid or unregistered:');
        console.log('      1. Device may have uninstalled app');
        console.log('      2. Token may have expired');
        console.log('      3. App may not have initialized FCM');
        console.log('      4. Token might be from old Pushy setup');
      } else if (result.error === 'messaging/invalid-argument') {
        console.log('\n   💡 Invalid message format:');
        console.log('      1. Check all data values are strings');
        console.log('      2. Verify message structure');
      }
    }
  } catch (error) {
    console.log(`\n   ❌ Request failed: ${error.message}`);
  }
}

// Run diagnostics
async function main() {
  await testNotification();
  
  console.log('\n📋 Recommendations:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (!notificationService.initialized) {
    console.log('   1. ⚠️  Firebase not initialized!');
    console.log('   2. Check FIREBASE_SERVICE_ACCOUNT_PATH in .env');
    console.log('   3. Verify firebase-service-account.json exists');
    console.log('   4. Restart the server after fixing');
  } else if (tokens.length === 0) {
    console.log('   1. Install and open parent app on device');
    console.log('   2. Login with parent credentials');
    console.log('   3. Check app logs for "FCM device token"');
    console.log('   4. Verify google-services.json is in android/app/');
  } else if (tokens[0].device_token.length < 100) {
    console.log('   1. ⚠️  Token appears to be from old Pushy setup!');
    console.log('   2. Clear app data or reinstall app');
    console.log('   3. Login again to get new FCM token');
    console.log('   4. Verify app has Firebase dependencies');
  } else {
    console.log('   1. Make sure app is running (not force-stopped)');
    console.log('   2. Check device has internet connection');
    console.log('   3. Verify google-services.json package name matches');
    console.log('   4. Check device notification permissions');
    console.log('   5. Try sending from Firebase Console directly');
  }
  
  console.log('\n💡 Next Steps:');
  console.log('   • Check app logs: flutter logs | grep FCM');
  console.log('   • Verify token in database matches app logs');
  console.log('   • Test with script: node src/scripts/sendTestPushNotification.js <token>');
  console.log('   • Test from Firebase Console: Cloud Messaging → Send test message');
  
  console.log('\n📚 Documentation:');
  console.log('   • Setup Guide: FIREBASE_SETUP_GUIDE.md');
  console.log('   • Quick Reference: FCM_QUICK_REFERENCE.md');
  console.log('   • Service Docs: src/services/README_NOTIFICATIONS.md');
  
  db.close();
}

main();
