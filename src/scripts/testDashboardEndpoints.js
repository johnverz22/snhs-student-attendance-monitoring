const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testDashboardEndpoints() {
  console.log('=== Testing Dashboard Endpoints ===\n');

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
    console.log('Login Response:', JSON.stringify(loginData, null, 2));
    
    if (!loginData.success) {
      throw new Error('Login failed: ' + loginData.message);
    }

    const token = loginData.data.accessToken;
    console.log('✓ Admin logged in successfully');
    console.log('Token:', token.substring(0, 20) + '...\n');

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Test daily report
    console.log('Step 2: Testing daily report');
    const today = new Date().toISOString().split('T')[0];
    const dailyResponse = await fetch(`${BASE_URL}/api/admin/reports/daily?date=${today}`, {
      headers
    });
    const dailyData = await dailyResponse.json();
    console.log('Daily Report Response:', JSON.stringify(dailyData, null, 2));

    // Test weekly report
    console.log('\nStep 3: Testing weekly report');
    const weekStart = getWeekStart(new Date()).toISOString().split('T')[0];
    const weeklyResponse = await fetch(`${BASE_URL}/api/admin/reports/weekly?startDate=${weekStart}`, {
      headers
    });
    const weeklyData = await weeklyResponse.json();
    console.log('Weekly Report Response:', JSON.stringify(weeklyData, null, 2));

    // Test monthly report
    console.log('\nStep 4: Testing monthly report');
    const month = new Date().toISOString().slice(0, 7);
    const monthlyResponse = await fetch(`${BASE_URL}/api/admin/reports/monthly?month=${month}`, {
      headers
    });
    const monthlyData = await monthlyResponse.json();
    console.log('Monthly Report Response:', JSON.stringify(monthlyData, null, 2));

    // Test students endpoint
    console.log('\nStep 5: Testing students endpoint');
    const studentsResponse = await fetch(`${BASE_URL}/api/admin/students?limit=100&archived=false`, {
      headers
    });
    const studentsData = await studentsResponse.json();
    console.log('Students Response:', JSON.stringify(studentsData, null, 2));

    // Test attendance logs
    console.log('\nStep 6: Testing attendance logs');
    const logsResponse = await fetch(`${BASE_URL}/api/admin/attendance/logs?limit=10&page=1`, {
      headers
    });
    const logsData = await logsResponse.json();
    console.log('Attendance Logs Response:', JSON.stringify(logsData, null, 2));

    console.log('\n=== All dashboard endpoint tests completed ===');

  } catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
  }
}

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

testDashboardEndpoints();