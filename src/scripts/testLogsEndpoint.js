const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testLogsEndpoint() {
  console.log('=== Testing Attendance Logs Endpoint ===\n');

  try {
    // First, login to get admin token
    console.log('Step 1: Admin login');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        password: 'Admin123!'
      })
    });

    const loginData = await loginResponse.json();
    
    if (!loginData.success) {
      throw new Error('Login failed: ' + loginData.message);
    }

    const token = loginData.data.accessToken;
    console.log('✓ Admin logged in successfully\n');

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Test attendance logs without filters
    console.log('Step 2: Testing attendance logs (no filters)');
    const logsResponse1 = await fetch(`${BASE_URL}/api/admin/attendance/logs?limit=5&page=1`, {
      headers
    });
    const logsData1 = await logsResponse1.json();
    console.log('Logs Response (no filters):');
    console.log(JSON.stringify(logsData1, null, 2));

    // Test attendance logs with date filters
    console.log('\nStep 3: Testing attendance logs (with date filters)');
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const startDate = weekAgo.toISOString().split('T')[0];

    const logsResponse2 = await fetch(`${BASE_URL}/api/admin/attendance/logs?limit=10&page=1&startDate=${startDate}&endDate=${today}`, {
      headers
    });
    const logsData2 = await logsResponse2.json();
    console.log('Logs Response (with date filters):');
    console.log(JSON.stringify(logsData2, null, 2));

    // Test with specific student filter
    console.log('\nStep 4: Testing attendance logs (with student filter)');
    const logsResponse3 = await fetch(`${BASE_URL}/api/admin/attendance/logs?limit=5&page=1&studentId=1`, {
      headers
    });
    const logsData3 = await logsResponse3.json();
    console.log('Logs Response (student filter):');
    console.log(JSON.stringify(logsData3, null, 2));

    console.log('\n=== All logs endpoint tests completed ===');

  } catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
  }
}

testLogsEndpoint();