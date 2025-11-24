/**
 * Test script to create sample notifications for parent app testing
 * This simulates what would happen when push notifications are sent
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../../data/attendance.db');
const db = new Database(dbPath);

console.log('🔔 Creating test notifications for parent app...\n');

// Get a parent ID (use the test parent we created)
const parent = db.prepare('SELECT id, name, email FROM parents ORDER BY id DESC LIMIT 1').get();

if (!parent) {
  console.log('❌ No parent found. Please register a parent first.');
  process.exit(1);
}

console.log(`📱 Parent: ${parent.name} (${parent.email})`);

// Get linked students
const students = db.prepare(`
  SELECT s.id, s.student_id, s.name 
  FROM students s
  JOIN parent_student_links psl ON s.id = psl.student_id
  WHERE psl.parent_id = ?
`).all(parent.id);

if (students.length === 0) {
  console.log('❌ No linked students found.');
  process.exit(1);
}

console.log(`👨‍👩‍👧‍👦 Linked students: ${students.map(s => s.name).join(', ')}\n`);

// Create sample notifications
const notifications = [
  {
    type: 'attendance_logged',
    title: 'Attendance Logged',
    message: `${students[0].name} has checked in at Main Gate A`,
    data: JSON.stringify({
      student_id: students[0].id,
      student_name: students[0].name,
      gate: 'Main Gate A',
      time: new Date().toISOString(),
    }),
  },
  {
    type: 'attendance_alert',
    title: 'Late Arrival',
    message: `${students[0].name} arrived after 8:00 AM`,
    data: JSON.stringify({
      student_id: students[0].id,
      student_name: students[0].name,
      arrival_time: '8:15 AM',
    }),
  },
  {
    type: 'system',
    title: 'Welcome to Parent App',
    message: 'You can now monitor your children\'s attendance in real-time',
    data: JSON.stringify({}),
  },
];

const insertStmt = db.prepare(`
  INSERT INTO parent_notifications (parent_id, type, title, message, data, is_read)
  VALUES (?, ?, ?, ?, ?, 0)
`);

console.log('Creating notifications...\n');

for (const notif of notifications) {
  try {
    insertStmt.run(
      parent.id,
      notif.type,
      notif.title,
      notif.message,
      notif.data
    );
    console.log(`✅ ${notif.title}`);
    console.log(`   ${notif.message}\n`);
  } catch (error) {
    console.error(`❌ Error creating notification: ${error.message}`);
  }
}

// Show summary
const totalNotifications = db.prepare(
  'SELECT COUNT(*) as count FROM parent_notifications WHERE parent_id = ?'
).get(parent.id);

const unreadNotifications = db.prepare(
  'SELECT COUNT(*) as count FROM parent_notifications WHERE parent_id = ? AND is_read = 0'
).get(parent.id);

console.log('📊 Summary:');
console.log(`   Total notifications: ${totalNotifications.count}`);
console.log(`   Unread notifications: ${unreadNotifications.count}`);
console.log('\n✨ Test notifications created successfully!');
console.log('\n💡 To test:');
console.log('   1. Login to the parent app');
console.log('   2. Check the notifications tab (should show badge)');
console.log('   3. Tap on notifications to mark as read');

db.close();
