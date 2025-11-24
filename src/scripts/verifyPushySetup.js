/**
 * Verify Pushy Push Notification Setup
 * This script checks if Pushy is properly configured
 */

const axios = require('axios');
const config = require('../config');

console.log('🔔 Verifying Pushy Push Notification Setup\n');

// Check 1: API Key
console.log('1️⃣ Checking Pushy API Key...');
if (!config.pushy.apiKey) {
  console.log('   ❌ PUSHY_API_KEY not found in .env file');
  process.exit(1);
}
console.log(`   ✅ API Key found: ${config.pushy.apiKey.substring(0, 20)}...`);

// Check 2: Test API Key with Pushy
console.log('\n2️⃣ Testing API Key with Pushy API...');

async function testPushyAPI() {
  try {
    // Test with a dummy device token to verify API key works
    const response = await axios.post(
      'https://api.pushy.me/push?api_key=' + config.pushy.apiKey,
      {
        to: 'test-device-token-for-verification',
        data: {
          message: 'Test notification',
        },
        notification: {
          title: 'Test',
          body: 'This is a test',
        },
      },
      {
        validateStatus: () => true, // Accept any status
      }
    );

    // Even if device token is invalid, a valid API key will return specific error
    if (response.status === 400 && response.data.error === 'Please specify a valid device token.') {
      console.log('   ✅ API Key is valid (Pushy API responded correctly)');
      return true;
    } else if (response.status === 401) {
      console.log('   ❌ API Key is invalid (Unauthorized)');
      console.log('   Please check your PUSHY_API_KEY in .env file');
      return false;
    } else if (response.data.success) {
      console.log('   ✅ API Key is valid');
      return true;
    } else {
      console.log(`   ⚠️  Unexpected response: ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error testing API: ${error.message}`);
    return false;
  }
}

async function checkDatabase() {
  console.log('\n3️⃣ Checking Database Tables...');
  
  const Database = require('better-sqlite3');
  const path = require('path');
  const dbPath = path.join(__dirname, '../../data/attendance.db');
  
  try {
    const db = new Database(dbPath);
    
    // Check push_tokens table
    const pushTokensTable = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='push_tokens'
    `).get();
    
    if (pushTokensTable) {
      console.log('   ✅ push_tokens table exists');
      
      const tokenCount = db.prepare('SELECT COUNT(*) as count FROM push_tokens').get();
      console.log(`   📊 Registered device tokens: ${tokenCount.count}`);
    } else {
      console.log('   ❌ push_tokens table not found');
    }
    
    // Check parent_notifications table
    const notificationsTable = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='parent_notifications'
    `).get();
    
    if (notificationsTable) {
      console.log('   ✅ parent_notifications table exists');
      
      const notifCount = db.prepare('SELECT COUNT(*) as count FROM parent_notifications').get();
      console.log(`   📊 Total notifications: ${notifCount.count}`);
    } else {
      console.log('   ❌ parent_notifications table not found');
    }
    
    db.close();
  } catch (error) {
    console.log(`   ❌ Database error: ${error.message}`);
  }
}

async function main() {
  const apiValid = await testPushyAPI();
  await checkDatabase();
  
  console.log('\n📋 Summary:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (apiValid) {
    console.log('✅ Backend: Pushy is properly configured');
    console.log('\n📱 Parent App Configuration:');
    console.log('   • App ID in AndroidManifest.xml: "app"');
    console.log('   • Pushy SDK initialized in NotificationService');
    console.log('   • Device token registration endpoint: /api/parent/device-token');
    
    console.log('\n🧪 Testing Steps:');
    console.log('   1. Build parent app APK: cd parent_app && flutter build apk --release');
    console.log('   2. Install on physical device (Pushy requires real device)');
    console.log('   3. Login to parent app');
    console.log('   4. Check logs for "Pushy device token: ..."');
    console.log('   5. Send test notification:');
    console.log('      node src/scripts/sendTestPushNotification.js <device-token>');
    
    console.log('\n💡 Note: Pushy notifications will NOT work on emulators!');
    console.log('   They require Google Play Services on a physical device.');
  } else {
    console.log('❌ Pushy configuration has issues');
    console.log('\n🔧 Fix:');
    console.log('   1. Check PUSHY_API_KEY in .env file');
    console.log('   2. Verify API key at https://dashboard.pushy.me');
    console.log('   3. Ensure you created an app with ID "app"');
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main();
