#!/usr/bin/env node
/**
 * Clean up invalid push tokens from the database
 */

const dbManager = require('./src/models/database');
const notificationService = require('./src/services/notificationService');
const { queryOne, queryAll, execute } = require('./src/utils/dbHelpers');

async function cleanupInvalidTokens() {
  try {
    console.log('\n🧹 Cleaning up invalid push tokens\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Initialize database
    await dbManager.initialize();
    console.log('✅ Database connected\n');

    if (!notificationService.initialized) {
      console.log('❌ Firebase not initialized, cannot test tokens');
      process.exit(1);
    }

    // Get all active tokens
    const activeTokens = await queryAll(`
      SELECT 
        pt.id,
        pt.device_token,
        pt.platform,
        pt.parent_id,
        p.name as parent_name
      FROM push_tokens pt
      JOIN parents p ON pt.parent_id = p.id
      WHERE pt.is_active = TRUE
      ORDER BY pt.created_at DESC
    `);

    console.log(`📱 Found ${activeTokens.length} active tokens to test\n`);

    let validCount = 0;
    let invalidCount = 0;
    const invalidTokenIds = [];

    // Test each token
    for (const token of activeTokens) {
      const shortToken = token.device_token.substring(0, 20) + '...';
      process.stdout.write(`Testing ${token.parent_name} (${shortToken}): `);

      try {
        const result = await notificationService.testNotification(token.device_token);
        
        if (result.success) {
          console.log('✅ VALID');
          validCount++;
        } else if (result.error === 'messaging/registration-token-not-registered' || 
                   result.error === 'messaging/invalid-registration-token') {
          console.log('❌ INVALID - will be removed');
          invalidCount++;
          invalidTokenIds.push(token.id);
        } else {
          console.log(`⚠️  ERROR: ${result.error}`);
          // Don't remove tokens with other errors (might be temporary)
        }
      } catch (error) {
        console.log(`⚠️  EXCEPTION: ${error.message}`);
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Results:');
    console.log(`   ✅ Valid tokens: ${validCount}`);
    console.log(`   ❌ Invalid tokens: ${invalidCount}`);

    // Remove invalid tokens
    if (invalidTokenIds.length > 0) {
      console.log('\n🗑️  Removing invalid tokens...');
      
      const result = await execute(`
        UPDATE push_tokens 
        SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
        WHERE id = ANY($1)
      `, [invalidTokenIds]);

      console.log(`   ✅ Deactivated ${invalidTokenIds.length} invalid tokens`);
    } else {
      console.log('\n✨ No invalid tokens found - all tokens are valid!');
    }

    console.log('\n🎉 Cleanup complete!');
    console.log('\n💡 Tip: Parents should log into the mobile app again to register fresh tokens.');

    await dbManager.close();
  } catch (error) {
    console.error('❌ Cleanup error:', error);
    process.exit(1);
  }
}

cleanupInvalidTokens();