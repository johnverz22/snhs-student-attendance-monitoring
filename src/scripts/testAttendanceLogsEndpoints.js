#!/usr/bin/env node

/**
 * Test script for admin attendance logs and search endpoints
 */

const http = require('http');
const config = require('../config');

// Test configuration
const BASE_URL = `http://localhost:${config.server.port}`;
let adminToken = null;

/**
 * Make HTTP request
 */
function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const response = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, data: response });
        } catch (error) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

/**
 * Test admin login
 */
async function testAdminLogin() {
  console.log('\n=== Testing Admin Login ===');
  
  const response = await makeRequest('POST', '/api/auth/admin/login', {
    username: 'admin',
    password: 'admin123',
  });

  if (response.status === 200 && response.data.success) {
    adminToken = response.data.data.token;
    console.log('✓ Admin login successful');
    return true;
  } else {
    console.log('✗ Admin login failed:', response.data.message);
    return false;
  }
}

/**
 * Test GET /api/admin/attendance/logs with pagination
 */
async function testAttendanceLogsPagination() {
  console.log('\n=== Testing Attendance Logs with Pagination ===');
  
  const response = await makeRequest('GET', '/api/admin/attendance/logs?page=1&limit=10', null, adminToken);

  if (response.status === 200 && response.data.success) {
    console.log('✓ Attendance logs retrieved successfully');
    console.log(`  Total logs: ${response.data.data.pagination.total}`);
    console.log(`  Page: ${response.data.data.pagination.page}`);
    console.log(`  Limit: ${response.data.data.pagination.limit}`);
    console.log(`  Total pages: ${response.data.data.pagination.totalPages}`);
    console.log(`  Logs returned: ${response.data.data.logs.length}`);
    
    if (response.data.data.logs.length > 0) {
      console.log('\n  Sample log entry:');
      const log = response.data.data.logs[0];
      console.log(`    Student: ${log.studentName} (${log.studentId})`);
      console.log(`    Entry Time: ${log.entryTime}`);
      console.log(`    Gate: ${log.gateName}`);
      console.log(`    Location Valid: ${log.locationValid}`);
    }
    return true;
  } else {
    console.log('✗ Failed to retrieve attendance logs:', response.data.message);
    return false;
  }
}

/**
 * Test GET /api/admin/attendance/logs with student filter
 */
async function testAttendanceLogsStudentFilter() {
  console.log('\n=== Testing Attendance Logs with Student Filter ===');
  
  // First, get a student ID from the logs
  const logsResponse = await makeRequest('GET', '/api/admin/attendance/logs?page=1&limit=1', null, adminToken);
  
  if (logsResponse.data.data.logs.length === 0) {
    console.log('⊘ No logs available to test student filter');
    return true;
  }
  
  const studentDbId = logsResponse.data.data.logs[0].id; // Using log id as a proxy
  
  // Get the actual student ID from students search
  const searchResponse = await makeRequest('GET', `/api/admin/students/search?query=${logsResponse.data.data.logs[0].studentName}`, null, adminToken);
  
  if (searchResponse.data.data.students.length > 0) {
    const studentId = searchResponse.data.data.students[0].id;
    
    const response = await makeRequest('GET', `/api/admin/attendance/logs?studentId=${studentId}`, null, adminToken);

    if (response.status === 200 && response.data.success) {
      console.log('✓ Attendance logs filtered by student successfully');
      console.log(`  Logs for student ID ${studentId}: ${response.data.data.logs.length}`);
      return true;
    } else {
      console.log('✗ Failed to filter attendance logs by student:', response.data.message);
      return false;
    }
  } else {
    console.log('⊘ No students found to test filter');
    return true;
  }
}

/**
 * Test GET /api/admin/attendance/logs with date range filter
 */
async function testAttendanceLogsDateFilter() {
  console.log('\n=== Testing Attendance Logs with Date Range Filter ===');
  
  const today = new Date().toISOString().split('T')[0];
  const response = await makeRequest('GET', `/api/admin/attendance/logs?startDate=${today}&endDate=${today}`, null, adminToken);

  if (response.status === 200 && response.data.success) {
    console.log('✓ Attendance logs filtered by date range successfully');
    console.log(`  Logs for ${today}: ${response.data.data.logs.length}`);
    return true;
  } else {
    console.log('✗ Failed to filter attendance logs by date:', response.data.message);
    return false;
  }
}

/**
 * Test GET /api/admin/attendance/logs with sorting
 */
async function testAttendanceLogsSorting() {
  console.log('\n=== Testing Attendance Logs with Sorting ===');
  
  const response = await makeRequest('GET', '/api/admin/attendance/logs?sortBy=student_name&sortOrder=ASC&limit=5', null, adminToken);

  if (response.status === 200 && response.data.success) {
    console.log('✓ Attendance logs sorted successfully');
    console.log('  First 5 students (alphabetically):');
    response.data.data.logs.forEach((log, index) => {
      console.log(`    ${index + 1}. ${log.studentName}`);
    });
    return true;
  } else {
    console.log('✗ Failed to sort attendance logs:', response.data.message);
    return false;
  }
}

/**
 * Test GET /api/admin/students/search
 */
async function testStudentsSearch() {
  console.log('\n=== Testing Students Search ===');
  
  // First, get a student name from logs
  const logsResponse = await makeRequest('GET', '/api/admin/attendance/logs?page=1&limit=1', null, adminToken);
  
  if (logsResponse.data.data.logs.length === 0) {
    console.log('⊘ No students available to test search');
    return true;
  }
  
  const studentName = logsResponse.data.data.logs[0].studentName;
  const searchTerm = studentName.split(' ')[0]; // Use first name
  
  const response = await makeRequest('GET', `/api/admin/students/search?query=${searchTerm}`, null, adminToken);

  if (response.status === 200 && response.data.success) {
    console.log('✓ Students search successful');
    console.log(`  Search term: "${searchTerm}"`);
    console.log(`  Results found: ${response.data.data.count}`);
    
    if (response.data.data.students.length > 0) {
      console.log('\n  Sample results:');
      response.data.data.students.slice(0, 3).forEach((student, index) => {
        console.log(`    ${index + 1}. ${student.name} (${student.studentId})`);
        console.log(`       Email: ${student.email}`);
        console.log(`       Grade: ${student.grade || 'N/A'}`);
      });
    }
    return true;
  } else {
    console.log('✗ Students search failed:', response.data.message);
    return false;
  }
}

/**
 * Test GET /api/admin/students/search with student ID
 */
async function testStudentsSearchById() {
  console.log('\n=== Testing Students Search by ID ===');
  
  // First, get a student ID
  const logsResponse = await makeRequest('GET', '/api/admin/attendance/logs?page=1&limit=1', null, adminToken);
  
  if (logsResponse.data.data.logs.length === 0) {
    console.log('⊘ No students available to test search by ID');
    return true;
  }
  
  const studentId = logsResponse.data.data.logs[0].studentId;
  
  const response = await makeRequest('GET', `/api/admin/students/search?query=${studentId}`, null, adminToken);

  if (response.status === 200 && response.data.success) {
    console.log('✓ Students search by ID successful');
    console.log(`  Search term: "${studentId}"`);
    console.log(`  Results found: ${response.data.data.count}`);
    return true;
  } else {
    console.log('✗ Students search by ID failed:', response.data.message);
    return false;
  }
}

/**
 * Test validation errors
 */
async function testValidationErrors() {
  console.log('\n=== Testing Validation Errors ===');
  
  let allPassed = true;
  
  // Test invalid page number
  let response = await makeRequest('GET', '/api/admin/attendance/logs?page=0', null, adminToken);
  if (response.status === 400) {
    console.log('✓ Invalid page number rejected');
  } else {
    console.log('✗ Invalid page number not rejected');
    allPassed = false;
  }
  
  // Test invalid limit
  response = await makeRequest('GET', '/api/admin/attendance/logs?limit=200', null, adminToken);
  if (response.status === 400) {
    console.log('✓ Invalid limit rejected');
  } else {
    console.log('✗ Invalid limit not rejected');
    allPassed = false;
  }
  
  // Test empty search query
  response = await makeRequest('GET', '/api/admin/students/search?query=', null, adminToken);
  if (response.status === 400) {
    console.log('✓ Empty search query rejected');
  } else {
    console.log('✗ Empty search query not rejected');
    allPassed = false;
  }
  
  return allPassed;
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('Starting Admin Attendance Logs and Search Endpoints Tests...');
  console.log('='.repeat(60));

  try {
    // Login first
    const loginSuccess = await testAdminLogin();
    if (!loginSuccess) {
      console.log('\n✗ Cannot proceed without admin authentication');
      process.exit(1);
    }

    // Run all tests
    const results = await Promise.all([
      testAttendanceLogsPagination(),
      testAttendanceLogsStudentFilter(),
      testAttendanceLogsDateFilter(),
      testAttendanceLogsSorting(),
      testStudentsSearch(),
      testStudentsSearchById(),
      testValidationErrors(),
    ]);

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('Test Summary:');
    const passed = results.filter(r => r).length;
    const total = results.length;
    console.log(`Passed: ${passed}/${total}`);
    
    if (passed === total) {
      console.log('\n✓ All tests passed!');
      process.exit(0);
    } else {
      console.log('\n✗ Some tests failed');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n✗ Test execution failed:', error.message);
    process.exit(1);
  }
}

// Run tests
runTests();
