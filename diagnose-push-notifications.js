#!/usr/bin/env node
/**
 * Diagnose Push Notification Issues
 */

const dbManager = require('./src/models/database');
const notificationService = require('./src/services/notificationService');
const { queryOne, queryAll } = require('./src/utils/dbHelpers');

async function diagnosePushNotifications() {
  try {
    console.log('\n🔍 Push Notification Diagnostic\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Initialize database
    await dbManager.initialize();
    console.log('✅ Database connected\n');

    // Check Firebase initialization
    console.log('🔥 Firebase Status:');
    if (notificationService.initialized) {
      console.log('   ✅ Firebase Admin SDK initialized');
    } else {
      console.log('   ❌ Firebase Admin SDK NOT initialized');
      console.log('   → Check FIREBASE_SERVICE_ACCOUNT_PATH in .env');
      console.log('   → Verify firebase-service-account.json exists');
    }
    console.log('');

    // Check for students and parents
    const studentCount = await queryOne('SELECT COUNT(*) as count FROM students');
    const parentCount = await queryOne('SELECT COUNT(*) as count FROM parents');
    const linkCount = await queryOne('SELECT COUNT(*) as count FROM parent_student_links');
    
    console.log('👥 Database Status:');
    console.log(`   Students: ${studentCount.count}`);
    console.log(`   Parents: ${parentCount.count}`);
    console.log(`   Parent-Student Links: ${linkCount.count}`);
    console.log('');

    // Check push tokens
    const tokenStats = await queryAll(`
      SELECT 
        platform,
        is_active,
        COUNT(*) as count
      FROM push_tokens 
      GROUP BY platform, is_active
      ORDER BY platform, is_active DESC
    `);

    console.log('📱 Push Token Status:');
    if (tokenStats.length === 0) {
      console.log('   ❌ No push tokens registered');
      console.log('   → Parents need to log into the mobile app');
    } else {
      for (const stat of tokenStats) {
        const status = stat.is_active ? 'ACTIVE' : 'INACTIVE';
        console.log(`   ${stat.platform}: ${stat.count} ${status} tokens`);
      }
    }
    console.log('');

    // Get latest tokens for testing
    const latestTokens = await queryAll(`
      SELECT 
        pt.device_token,
        pt.platform,
        pt.is_active,
        pt.created_at,
        p.name as parent_name,
        p.email
      FROM push_tokens pt
      JOIN parents p ON pt.parent_id = p.id
      ORDER BY pt.created_at DESC
      LIMIT 5
    `);

    if (latestTokens.length > 0) {
      console.log('🔔 Latest Push Tokens:');
      for (const token of latestTokens) {
        const status = token.is_active ? '✅' : '❌';
        const shortToken = token.device_token.substring(0, 20) + '...';
        console.log(`   ${status} ${token.parent_name} (${token.platform}) - ${shortToken}`);
      }
      console.log('');

      // Test notification if Firebase is initialized
      if (notificationService.initialized && latestTokens[0].is_active) {
        console.log('🧪 Testing Notification:');
        console.log(`   Sending test to: ${latestTokens[0].parent_name}`);
        
        try {
          const result = await notificationService.testNotification(latestTokens[0].device_token);
          
          if (result.success) {
            console.log('   ✅ Test notification sent successfully!');
            console.log(`   Message ID: ${result.messageId}`);
          } else {
            console.log('   ❌ Test notification failed');
            console.log(`   Error: ${result.error} - ${result.message}`);
          }
        } catch (error) {
          console.log('   ❌ Test notification error:', error.message);
        }
      } else if (!notificationService.initialized) {
        console.log('🧪 Cannot test - Firebase not initialized');
      } else {
        console.log('🧪 Cannot test - No active tokens found');
      }
    } else {
      console.log('🔔 No push tokens found in database');
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Summary:');
    
    if (!notificationService.initialized) {
      console.log('   ❌ CRITICAL: Firebase not initialized');
      console.log('   → Fix Firebase configuration first');
    } else if (latestTokens.length === 0) {
      console.log('   ❌ ISSUE: No device tokens registered');
      console.log('   → Parents need to log into mobile app');
    } else if (latestTokens.filter(t => t.is_active).length === 0) {
      console.log('   ❌ ISSUE: No active device tokens');
      console.log('   → Check if tokens are expired or invalid');
    } else {
      console.log('   ✅ Push notification system appears configured');
      console.log('   → Check test result above');
    }

    await dbManager.close();
  } catch (error) {
    console.error('❌ Diagnostic error:', error);
    process.exit(1);
  }
}

diagnosePushNotifications();