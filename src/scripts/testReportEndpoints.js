const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Test configuration
let adminToken = null;
let testStudentId = null;

/**
 * Test admin login
 */
async function testAdminLogin() {
  console.log('\n=== Testing Admin Login ===');
  try {
    const response = await axios.post(`${BASE_URL}/auth/admin/login`, {
      username: 'admin',
      password: 'Admin123!',
    });

    if (response.data.success) {
      adminToken = response.data.data.accessToken;
      console.log('✓ Admin login successful');
      console.log('  Token:', adminToken.substring(0, 20) + '...');
      return true;
    }
  } catch (error) {
    console.error('✗ Admin login failed:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test daily report generation
 */
async function testDailyReport() {
  console.log('\n=== Testing Daily Report ===');
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Test JSON format
    const response = await axios.get(`${BASE_URL}/admin/reports/daily`, {
      params: { date: today },
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    if (response.data.success) {
      console.log('✓ Daily report generated successfully');
      console.log('  Date:', response.data.data.date);
      console.log('  Total Entries:', response.data.data.statistics.totalEntries);
      console.log('  Unique Students:', response.data.data.statistics.uniqueStudents);
      
      // Test CSV format
      const csvResponse = await axios.get(`${BASE_URL}/admin/reports/daily`, {
        params: { date: today, format: 'csv' },
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      
      if (csvResponse.headers['content-type'].includes('text/csv')) {
        console.log('✓ CSV export working');
        console.log('  CSV length:', csvResponse.data.length, 'bytes');
      }
      
      return true;
    }
  } catch (error) {
    console.error('✗ Daily report failed:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test weekly report generation
 */
async function testWeeklyReport() {
  console.log('\n=== Testing Weekly Report ===');
  try {
    // Get Monday of current week
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    const startDate = monday.toISOString().split('T')[0];
    
    const response = await axios.get(`${BASE_URL}/admin/reports/weekly`, {
      params: { startDate },
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    if (response.data.success) {
      console.log('✓ Weekly report generated successfully');
      console.log('  Start Date:', response.data.data.startDate);
      console.log('  End Date:', response.data.data.endDate);
      console.log('  Total Entries:', response.data.data.statistics.totalEntries);
      console.log('  Daily Summary:', response.data.data.dailySummary.length, 'days');
      return true;
    }
  } catch (error) {
    console.error('✗ Weekly report failed:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test monthly report generation
 */
async function testMonthlyReport() {
  console.log('\n=== Testing Monthly Report ===');
  try {
    const today = new Date();
    const month = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    
    const response = await axios.get(`${BASE_URL}/admin/reports/monthly`, {
      params: { month },
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    if (response.data.success) {
      console.log('✓ Monthly report generated successfully');
      console.log('  Month:', response.data.data.month);
      console.log('  Total Entries:', response.data.data.statistics.totalEntries);
      console.log('  Days with Attendance:', response.data.data.statistics.daysWithAttendance);
      console.log('  Attendance Percentage:', response.data.data.statistics.attendancePercentage + '%');
      return true;
    }
  } catch (error) {
    console.error('✗ Monthly report failed:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test student report generation
 */
async function testStudentReport() {
  console.log('\n=== Testing Student Report ===');
  try {
    // First, get a student ID
    const searchResponse = await axios.get(`${BASE_URL}/admin/students/search`, {
      params: { query: 'student' },
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    if (searchResponse.data.success && searchResponse.data.data.students.length > 0) {
      testStudentId = searchResponse.data.data.students[0].id;
      console.log('  Using student ID:', testStudentId);
      
      const response = await axios.get(`${BASE_URL}/admin/reports/student/${testStudentId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      if (response.data.success) {
        console.log('✓ Student report generated successfully');
        console.log('  Student:', response.data.data.student.name);
        console.log('  Total Entries:', response.data.data.statistics.totalEntries);
        console.log('  Unique Days:', response.data.data.statistics.uniqueDays);
        return true;
      }
    } else {
      console.log('⚠ No students found for testing');
      return true;
    }
  } catch (error) {
    console.error('✗ Student report failed:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test attendance logs endpoint
 */
async function testAttendanceLogs() {
  console.log('\n=== Testing Attendance Logs ===');
  try {
    const response = await axios.get(`${BASE_URL}/admin/attendance/logs`, {
      params: { page: 1, limit: 10 },
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    if (response.data.success) {
      console.log('✓ Attendance logs retrieved successfully');
      console.log('  Total logs:', response.data.data.pagination.total);
      console.log('  Current page:', response.data.data.pagination.page);
      console.log('  Logs returned:', response.data.data.logs.length);
      return true;
    }
  } catch (error) {
    console.error('✗ Attendance logs failed:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test student search endpoint
 */
async function testStudentSearch() {
  console.log('\n=== Testing Student Search ===');
  try {
    const response = await axios.get(`${BASE_URL}/admin/students/search`, {
      params: { query: 'student' },
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    if (response.data.success) {
      console.log('✓ Student search successful');
      console.log('  Students found:', response.data.data.count);
      if (response.data.data.students.length > 0) {
        console.log('  First result:', response.data.data.students[0].name);
      }
      return true;
    }
  } catch (error) {
    console.error('✗ Student search failed:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test error handling
 */
async function testErrorHandling() {
  console.log('\n=== Testing Error Handling ===');
  let passed = 0;
  let total = 0;

  // Test missing date parameter
  total++;
  try {
    await axios.get(`${BASE_URL}/admin/reports/daily`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✓ Missing date parameter handled correctly');
      passed++;
    }
  }

  // Test invalid date format
  total++;
  try {
    await axios.get(`${BASE_URL}/admin/reports/daily`, {
      params: { date: 'invalid-date' },
      headers: { Authorization: `Bearer ${adminToken}` },
    });
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✓ Invalid date format handled correctly');
      passed++;
    }
  }

  // Test invalid student ID
  total++;
  try {
    await axios.get(`${BASE_URL}/admin/reports/student/99999`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('✓ Invalid student ID handled correctly');
      passed++;
    }
  }

  // Test unauthorized access
  total++;
  try {
    await axios.get(`${BASE_URL}/admin/reports/daily`, {
      params: { date: '2024-01-01' },
    });
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✓ Unauthorized access handled correctly');
      passed++;
    }
  }

  console.log(`\nError handling: ${passed}/${total} tests passed`);
  return passed === total;
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('===========================================');
  console.log('  Admin Report Endpoints Test Suite');
  console.log('===========================================');

  const results = [];

  // Login first
  const loginSuccess = await testAdminLogin();
  if (!loginSuccess) {
    console.log('\n✗ Cannot proceed without admin login');
    process.exit(1);
  }

  // Run all tests
  results.push(await testDailyReport());
  results.push(await testWeeklyReport());
  results.push(await testMonthlyReport());
  results.push(await testStudentReport());
  results.push(await testAttendanceLogs());
  results.push(await testStudentSearch());
  results.push(await testErrorHandling());

  // Summary
  const passed = results.filter(r => r).length;
  const total = results.length;

  console.log('\n===========================================');
  console.log(`  Test Results: ${passed}/${total} passed`);
  console.log('===========================================');

  if (passed === total) {
    console.log('\n✓ All tests passed!');
    process.exit(0);
  } else {
    console.log('\n✗ Some tests failed');
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('Test suite error:', error);
  process.exit(1);
});
