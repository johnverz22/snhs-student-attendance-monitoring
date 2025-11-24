/**
 * Test PostgreSQL connection and basic operations
 */

require('dotenv').config();
const dbManager = require('../models/database');

async function testConnection() {
  console.log('🔍 Testing PostgreSQL Connection...\n');

  try {
    // Initialize database
    console.log('1️⃣ Initializing database connection...');
    await dbManager.initialize();
    console.log('   ✅ Database initialized\n');

    // Test query
    console.log('2️⃣ Testing basic query...');
    const result = await dbManager.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('   ✅ Query successful');
    console.log('   📅 Server time:', result[0].current_time);
    console.log('   🐘 PostgreSQL version:', result[0].pg_version.split(',')[0], '\n');

    // Check tables
    console.log('3️⃣ Checking database tables...');
    const tables = await dbManager.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    console.log('   ✅ Found', tables.length, 'tables:');
    tables.forEach(t => console.log('      -', t.table_name));
    console.log('');

    // Check schema version
    console.log('4️⃣ Checking schema version...');
    const version = await dbManager.queryOne('SELECT version FROM schema_version ORDER BY version DESC LIMIT 1');
    console.log('   ✅ Schema version:', version ? version.version : 'Not found');
    console.log('');

    // Count records in each table
    console.log('5️⃣ Counting records...');
    const counts = await Promise.all([
      dbManager.queryOne('SELECT COUNT(*) as count FROM students'),
      dbManager.queryOne('SELECT COUNT(*) as count FROM parents'),
      dbManager.queryOne('SELECT COUNT(*) as count FROM parent_student_links'),
      dbManager.queryOne('SELECT COUNT(*) as count FROM qr_codes'),
      dbManager.queryOne('SELECT COUNT(*) as count FROM attendance_logs'),
      dbManager.queryOne('SELECT COUNT(*) as count FROM admins'),
      dbManager.queryOne('SELECT COUNT(*) as count FROM push_tokens'),
    ]);

    console.log('   📊 Record counts:');
    console.log('      - Students:', counts[0].count);
    console.log('      - Parents:', counts[1].count);
    console.log('      - Parent-Student Links:', counts[2].count);
    console.log('      - QR Codes:', counts[3].count);
    console.log('      - Attendance Logs:', counts[4].count);
    console.log('      - Admins:', counts[5].count);
    console.log('      - Push Tokens:', counts[6].count);
    console.log('');

    // Check school config
    console.log('6️⃣ Checking school configuration...');
    const config = await dbManager.queryOne('SELECT * FROM school_config WHERE id = 1');
    if (config) {
      console.log('   ✅ School config found:');
      console.log('      - Name:', config.school_name);
      console.log('      - Location:', config.latitude, ',', config.longitude);
      console.log('      - Radius:', config.radius_meters, 'meters');
      console.log('      - Timezone:', config.timezone);
    } else {
      console.log('   ⚠️  No school config found');
    }
    console.log('');

    // Test connection pool
    console.log('7️⃣ Testing connection pool...');
    const pool = dbManager.getConnection();
    console.log('   ✅ Pool info:');
    console.log('      - Total connections:', pool.totalCount);
    console.log('      - Idle connections:', pool.idleCount);
    console.log('      - Waiting requests:', pool.waitingCount);
    console.log('');

    console.log('✅ All tests passed! PostgreSQL is working correctly.\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await dbManager.close();
    console.log('🔌 Database connection closed.');
  }
}

// Run tests
testConnection();
