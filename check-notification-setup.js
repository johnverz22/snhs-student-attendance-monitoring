#!/usr/bin/env node
/**
 * Check notification setup for a student
 * Usage: node check-notification-setup.js <student_id>
 */

const dbManager = require('./src/models/database');
const { queryOne, queryAll } = require('./src/utils/dbHelpers');

async function checkNotificationSetup(studentId) {
  try {
    console.log('\n=== Notification Setup Check ===\n');
    
    // Initialize database
    await dbManager.initialize();
    console.log('✓ Database connected\n');

    // Check if student exists
    const student = await queryOne(
      'SELECT id, student_id, name FROM students WHERE id = $1',
      [studentId]
    );

    if (!student) {
      console.log(`✗ Student with ID ${studentId} not found`);
      process.exit(1);
    }

    console.log(`✓ Student found: ${student.name} (${student.student_id})\n`);

    // Check parent-student links
    const parentLinks = await queryAll(
      `SELECT psl.id, psl.parent_id, p.name as parent_name, p.email
       FROM parent_student_links psl
       JOIN parents p ON psl.parent_id = p.id
       WHERE psl.student_id = $1`,
      [studentId]
    );

    if (parentLinks.length === 0) {
      console.log('✗ No parents linked to this student');
      console.log('  → Parents need to be linked to receive notifications\n');
      process.exit(1);
    }

    console.log(`✓ Found ${parentLinks.length} parent(s) linked:\n`);
    
    for (const link of parentLinks) {
      console.log(`  - ${link.parent_name} (${link.email})`);
      
      // Check FCM tokens for this parent
      const tokens = await queryAll(
        `SELECT id, device_token, platform, is_active, created_at
         FROM push_tokens
         WHERE parent_id = $1`,
        [link.parent_id]
      );

      if (tokens.length === 0) {
        console.log(`    ✗ No FCM tokens registered`);
        console.log(`    → Parent needs to log in to the app to register device\n`);
      } else {
        const activeTokens = tokens.filter(t => t.is_active);
        console.log(`    ✓ ${activeTokens.length} active token(s) / ${tokens.length} total`);
        
        for (const token of tokens) {
          const status = token.is_active ? '✓ ACTIVE' : '✗ INACTIVE';
          console.log(`      ${status} - ${token.platform} - ${token.device_token.substring(0, 20)}...`);
        }
        console.log('');
      }
    }

    // Check Firebase configuration
    console.log('Firebase Configuration:');
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      console.log('  ✓ FIREBASE_SERVICE_ACCOUNT environment variable is set');
    } else {
      const config = require('./src/config');
      if (config.firebase && config.firebase.serviceAccountPath) {
        console.log(`  ✓ Firebase service account path: ${config.firebase.serviceAccountPath}`);
      } else {
        console.log('  ✗ Firebase not configured');
        console.log('    → Set FIREBASE_SERVICE_ACCOUNT env var or configure serviceAccountPath');
      }
    }

    console.log('\n=== Summary ===');
    const hasParents = parentLinks.length > 0;
    const hasTokens = parentLinks.some(async (link) => {
      const tokens = await queryAll(
        'SELECT id FROM push_tokens WHERE parent_id = $1 AND is_active = TRUE',
        [link.parent_id]
      );
      return tokens.length > 0;
    });

    if (hasParents && hasTokens) {
      console.log('✓ Notifications should work for this student');
    } else {
      console.log('✗ Notifications will NOT work - see issues above');
    }

    await dbManager.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Get student ID from command line
const studentId = process.argv[2];

if (!studentId) {
  console.log('Usage: node check-notification-setup.js <student_id>');
  console.log('Example: node check-notification-setup.js 1');
  process.exit(1);
}

checkNotificationSetup(parseInt(studentId, 10));
