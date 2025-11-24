/**
 * Diagnose Pushy Push Notification Issues
 */

const axios = require('axios');
const config = require('../config');
const Database = require('better-sqlite3');
const path = require('path');

console.log('🔍 Diagnosing Pushy Push Notification Issues\n');

const dbPath = path.join(__dirname, '../../data/attendance.db');
const db = new Database(dbPath);

// Get registered tokens
const tokens = db.prepare(`
  SELECT id, parent_id, device_token, platform, is_active, created_at 
  FROM push_tokens 
  ORDER BY id DESC 
  LIMIT 5
`).all();

console.log('📱 Registered Device Tokens:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
if (tokens.length === 0) {
  console.log('   ❌ No device tokens registered');
} else {
  tokens.forEach(token => {
    console.log(`   ID: ${token.id}`);
    console.log(`   Parent ID: ${token.parent_id}`);
    console.log(`   Token: ${token.device_token}`);
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
  
  // Pushy device tokens should be 20-40 characters
  if (latestToken.device_token.length < 20) {
    console.log('   ⚠️  WARNING: Token seems too short!');
    console.log('   Expected: 20-40 characters');
    console.log(`   Actual: ${latestToken.device_token.length} characters`);
    console.log('\n   💡 This might be truncated. Check database column size.');
  } else {
    console.log('   ✅ Token length looks good');
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
      if (size < 255) {
        console.log('   ❌ This is too small! Should be at least 255');
      }
    }
  }
}

// Test sending to latest token
async function testNotification() {
  if (tokens.length === 0) {
    console.log('\n❌ No tokens to test');
    return;
  }

  const latestToken = tokens[0];
  
  console.log('\n📤 Testing Notification Send:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`   Token: ${latestToken.device_token}`);
  console.log(`   API Key: ${config.pushy.apiKey.substring(0, 20)}...`);
  
  try {
    const response = await axios.post(
      `https://api.pushy.me/push?api_key=${config.pushy.apiKey}`,
      {
        to: latestToken.device_token,
        data: {
          type: 'test',
          message: 'Diagnostic test notification',
        },
        notification: {
          title: '🔔 Test Notification',
          body: 'If you see this, Pushy is working!',
          badge: 1,
          sound: 'default',
        },
      },
      {
        validateStatus: () => true,
      }
    );

    console.log(`\n   Response Status: ${response.status}`);
    console.log(`   Response Data:`, JSON.stringify(response.data, null, 2));

    if (response.data.success) {
      console.log('\n   ✅ Notification sent successfully!');
      console.log('   📱 Check your device now');
    } else if (response.data.error) {
      console.log(`\n   ❌ Error: ${response.data.error}`);
      
      if (response.data.error.includes('device token')) {
        console.log('\n   💡 Possible causes:');
        console.log('      1. Token is truncated/incomplete');
        console.log('      2. Device uninstalled the app');
        console.log('      3. Token expired');
        console.log('      4. Wrong Pushy app ID');
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
  
  if (tokens.length === 0) {
    console.log('   1. Make sure app is installed and opened');
    console.log('   2. Login to the app');
    console.log('   3. Check app logs for "Pushy device token"');
  } else if (tokens[0].device_token.length < 20) {
    console.log('   1. ⚠️  Device token appears truncated!');
    console.log('   2. Check database column size for device_token');
    console.log('   3. May need to alter table to increase size');
    console.log('   4. Uninstall and reinstall app to get new token');
  } else {
    console.log('   1. Make sure app is running (not force-stopped)');
    console.log('   2. Check device has internet connection');
    console.log('   3. Verify Pushy App ID matches in AndroidManifest.xml');
    console.log('   4. Check device notification permissions');
  }
  
  console.log('\n💡 Next Steps:');
  console.log('   • Check app logs: flutter logs');
  console.log('   • Verify token in database matches app logs');
  console.log('   • Test with script: node src/scripts/sendTestPushNotification.js <token>');
  
  db.close();
}

main();
