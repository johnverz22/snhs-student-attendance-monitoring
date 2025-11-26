const { getCurrentTimestamp, getConfiguredTimezone, getTimezoneOffset } = require('./src/utils/timezone');

async function test() {
  console.log('🕐 Testing Timezone Functions');
  console.log('==============================\n');
  
  // Test 1: Get configured timezone
  const timezone = await getConfiguredTimezone();
  console.log('1️⃣ Configured Timezone:', timezone);
  
  // Test 2: Get timezone offset
  const offset = getTimezoneOffset(timezone);
  console.log('2️⃣ Timezone Offset:', offset, 'hours');
  
  // Test 3: Get current timestamp
  const currentTime = await getCurrentTimestamp();
  console.log('3️⃣ Current Timestamp (from function):', currentTime);
  
  // Test 4: Compare with actual times
  const now = new Date();
  const utcTime = now.toISOString();
  const phTime = new Date(now.getTime() + (8 * 60 * 60 * 1000)).toISOString();
  
  console.log('\n📊 Comparison:');
  console.log('   UTC Time:', utcTime);
  console.log('   PH Time (UTC+8):', phTime);
  console.log('   Function returned:', currentTime);
  
  // Test 5: Parse and display
  const parsedTime = new Date(currentTime);
  console.log('\n🕐 Parsed Time:');
  console.log('   ISO String:', parsedTime.toISOString());
  console.log('   Local String:', parsedTime.toLocaleString('en-PH', { timeZone: 'Asia/Manila' }));
  
  process.exit(0);
}

test().catch(console.error);
