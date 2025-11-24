const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Test data
let studentToken = '';
let testStudentId = '';

/**
 * Test student login
 */
async function testStudentLogin() {
  console.log('\n=== Testing Student Login ===');
  try {
    const response = await axios.post(`${BASE_URL}/auth/student/login`, {
      email: 'john.doe@school.com',
      password: 'Password123',
    });

    if (response.data.success) {
      studentToken = response.data.data.token;
      testStudentId = response.data.data.student.id;
      console.log('✓ Student login successful');
      console.log(`  Token: ${studentToken.substring(0, 20)}...`);
      console.log(`  Student ID: ${testStudentId}`);
      return true;
    }
  } catch (error) {
    console.error('✗ Student login failed:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test attendance scan - successful
 */
async function testAttendanceScanSuccess() {
  console.log('\n=== Testing Attendance Scan (Success) ===');
  try {
    const response = await axios.post(
      `${BASE_URL}/student/attendance/scan`,
      {
        qrCode: 'GATE_A_2024',
        latitude: 40.7128,
        longitude: -74.0060,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          Authorization: `Bearer ${studentToken}`,
        },
      }
    );

    if (response.data.success) {
      console.log('✓ Attendance scan successful');
      console.log('  Data:', JSON.stringify(response.data.data, null, 2));
      return true;
    }
  } catch (error) {
    console.error('✗ Attendance scan failed:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test attendance scan - duplicate entry
 */
async function testAttendanceScanDuplicate() {
  console.log('\n=== Testing Attendance Scan (Duplicate) ===');
  try {
    const response = await axios.post(
      `${BASE_URL}/student/attendance/scan`,
      {
        qrCode: 'GATE_A_2024',
        latitude: 40.7128,
        longitude: -74.0060,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          Authorization: `Bearer ${studentToken}`,
        },
      }
    );

    console.log('✗ Should have failed with duplicate error');
    return false;
  } catch (error) {
    if (error.response?.data?.error === 'ATTENDANCE_DUPLICATE') {
      console.log('✓ Duplicate entry correctly rejected');
      console.log('  Error:', error.response.data.message);
      return true;
    }
    console.error('✗ Unexpected error:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test attendance scan - invalid QR code
 */
async function testAttendanceScanInvalidQR() {
  console.log('\n=== Testing Attendance Scan (Invalid QR Code) ===');
  try {
    const response = await axios.post(
      `${BASE_URL}/student/attendance/scan`,
      {
        qrCode: 'INVALID_QR_CODE_12345',
        latitude: 40.7128,
        longitude: -74.0060,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          Authorization: `Bearer ${studentToken}`,
        },
      }
    );

    console.log('✗ Should have failed with invalid QR code error');
    return false;
  } catch (error) {
    if (error.response?.data?.error === 'QR_CODE_INVALID') {
      console.log('✓ Invalid QR code correctly rejected');
      console.log('  Error:', error.response.data.message);
      return true;
    }
    console.error('✗ Unexpected error:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test attendance scan - invalid location
 */
async function testAttendanceScanInvalidLocation() {
  console.log('\n=== Testing Attendance Scan (Invalid Location) ===');
  try {
    const response = await axios.post(
      `${BASE_URL}/student/attendance/scan`,
      {
        qrCode: 'GATE_A_2024',
        latitude: 34.0522, // Los Angeles (far from school)
        longitude: -118.2437,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          Authorization: `Bearer ${studentToken}`,
        },
      }
    );

    console.log('✗ Should have failed with invalid location error');
    return false;
  } catch (error) {
    if (error.response?.data?.error === 'LOCATION_INVALID') {
      console.log('✓ Invalid location correctly rejected');
      console.log('  Error:', error.response.data.message);
      console.log('  Distance:', error.response.data.data?.distanceFromSchool, 'meters');
      return true;
    }
    console.error('✗ Unexpected error:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test attendance history
 */
async function testAttendanceHistory() {
  console.log('\n=== Testing Attendance History ===');
  try {
    const response = await axios.get(`${BASE_URL}/student/attendance/history`, {
      headers: {
        Authorization: `Bearer ${studentToken}`,
      },
      params: {
        limit: 10,
        offset: 0,
      },
    });

    if (response.data.success) {
      console.log('✓ Attendance history retrieved successfully');
      console.log(`  Total entries: ${response.data.data.pagination.total}`);
      console.log(`  Entries returned: ${response.data.data.logs.length}`);
      if (response.data.data.logs.length > 0) {
        console.log('  Latest entry:', JSON.stringify(response.data.data.logs[0], null, 2));
      }
      return true;
    }
  } catch (error) {
    console.error('✗ Attendance history failed:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test attendance history with date filter
 */
async function testAttendanceHistoryWithDateFilter() {
  console.log('\n=== Testing Attendance History (Date Filter) ===');
  try {
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    
    const response = await axios.get(`${BASE_URL}/student/attendance/history`, {
      headers: {
        Authorization: `Bearer ${studentToken}`,
      },
      params: {
        limit: 10,
        offset: 0,
        startDate: startDate,
      },
    });

    if (response.data.success) {
      console.log('✓ Attendance history with date filter retrieved successfully');
      console.log(`  Total entries today: ${response.data.data.pagination.total}`);
      console.log(`  Entries returned: ${response.data.data.logs.length}`);
      return true;
    }
  } catch (error) {
    console.error('✗ Attendance history with date filter failed:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('Starting Attendance Endpoints Tests...');
  console.log('Make sure the server is running on http://localhost:3000');
  
  const results = [];

  // Login first
  const loginSuccess = await testStudentLogin();
  if (!loginSuccess) {
    console.log('\n❌ Cannot proceed without successful login');
    return;
  }

  // Run tests
  results.push(await testAttendanceScanSuccess());
  results.push(await testAttendanceScanDuplicate());
  results.push(await testAttendanceScanInvalidQR());
  results.push(await testAttendanceScanInvalidLocation());
  results.push(await testAttendanceHistory());
  results.push(await testAttendanceHistoryWithDateFilter());

  // Summary
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log('\n' + '='.repeat(50));
  console.log(`Test Results: ${passed}/${total} passed`);
  console.log('='.repeat(50));

  if (passed === total) {
    console.log('✓ All tests passed!');
  } else {
    console.log(`✗ ${total - passed} test(s) failed`);
  }
}

// Run tests
runTests().catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});
