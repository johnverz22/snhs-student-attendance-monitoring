const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testReportsDataStructure() {
  console.log('=== Testing Reports Data Structure ===\n');

  try {
    // Login first
    console.log('Step 1: Admin authentication');
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
    console.log('✓ Admin authentication successful\n');

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Test daily report structure
    console.log('Step 2: Testing daily report data structure');
    const today = new Date().toISOString().split('T')[0];
    const dailyResponse = await fetch(`${BASE_URL}/api/admin/reports/daily?date=${today}`, {
      headers
    });
    const dailyData = await dailyResponse.json();
    
    console.log('Daily Report Structure:');
    console.log(JSON.stringify(dailyData, null, 2));

    // Test weekly report structure
    console.log('\nStep 3: Testing weekly report data structure');
    const weekStart = getWeekStart(new Date()).toISOString().split('T')[0];
    const weeklyResponse = await fetch(`${BASE_URL}/api/admin/reports/weekly?startDate=${weekStart}`, {
      headers
    });
    const weeklyData = await weeklyResponse.json();
    
    console.log('Weekly Report Structure:');
    console.log(JSON.stringify(weeklyData, null, 2));

    // Test monthly report structure
    console.log('\nStep 4: Testing monthly report data structure');
    const month = new Date().toISOString().slice(0, 7);
    const monthlyResponse = await fetch(`${BASE_URL}/api/admin/reports/monthly?month=${month}`, {
      headers
    });
    const monthlyData = await monthlyResponse.json();
    
    console.log('Monthly Report Structure:');
    console.log(JSON.stringify(monthlyData, null, 2));

    // Test student report structure
    console.log('\nStep 5: Testing student report data structure');
    const studentResponse = await fetch(`${BASE_URL}/api/admin/reports/student/1`, {
      headers
    });
    const studentData = await studentResponse.json();
    
    console.log('Student Report Structure:');
    console.log(JSON.stringify(studentData, null, 2));

    console.log('\n=== Data structure analysis completed ===');

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

testReportsDataStructure();