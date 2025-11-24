const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';

async function testLogsPage() {
  console.log('=== Testing Logs Page Functionality ===\n');

  try {
    // Test if logs.html is accessible
    console.log('Step 1: Testing logs.html accessibility');
    const logsPageResponse = await fetch(`${BASE_URL}/admin/logs.html`);
    
    if (logsPageResponse.ok) {
      console.log('✓ Logs page is accessible');
    } else {
      console.log('❌ Logs page is not accessible:', logsPageResponse.status);
    }

    // Test if logs.js is accessible
    console.log('\nStep 2: Testing logs.js accessibility');
    const logsJsResponse = await fetch(`${BASE_URL}/admin/js/logs.js`);
    
    if (logsJsResponse.ok) {
      console.log('✓ logs.js is accessible');
    } else {
      console.log('❌ logs.js is not accessible:', logsJsResponse.status);
    }

    // Test API endpoint directly
    console.log('\nStep 3: Testing API endpoint with authentication');
    
    // Login first
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
    console.log('✓ Admin authentication successful');

    // Test logs endpoint with various parameters
    const testCases = [
      { name: 'No filters', params: { limit: 5, page: 1 } },
      { name: 'With date range', params: { limit: 5, page: 1, startDate: '2025-11-20', endDate: '2025-11-22' } },
      { name: 'With student filter', params: { limit: 5, page: 1, studentId: 1 } }
    ];

    for (const testCase of testCases) {
      console.log(`\nTesting: ${testCase.name}`);
      
      const queryString = new URLSearchParams(testCase.params).toString();
      const response = await fetch(`${BASE_URL}/api/admin/attendance/logs?${queryString}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        console.log(`✓ ${testCase.name}: ${data.data.logs.length} records returned`);
        
        // Check data structure
        if (data.data.logs.length > 0) {
          const log = data.data.logs[0];
          const requiredFields = ['id', 'studentId', 'studentName', 'entryTime', 'gateName', 'locationValid'];
          const missingFields = requiredFields.filter(field => !(field in log));
          
          if (missingFields.length === 0) {
            console.log(`  ✓ All required fields present`);
          } else {
            console.log(`  ❌ Missing fields: ${missingFields.join(', ')}`);
          }
          
          // Test date parsing
          try {
            const entryTime = new Date(log.entryTime);
            if (!isNaN(entryTime.getTime())) {
              console.log(`  ✓ Date parsing successful: ${entryTime.toLocaleString()}`);
            } else {
              console.log(`  ❌ Invalid date: ${log.entryTime}`);
            }
          } catch (e) {
            console.log(`  ❌ Date parsing error: ${e.message}`);
          }
        }
      } else {
        console.log(`❌ ${testCase.name}: ${data.message || 'Unknown error'}`);
      }
    }

    console.log('\n=== Logs page functionality test completed ===');

  } catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
  }
}

testLogsPage();