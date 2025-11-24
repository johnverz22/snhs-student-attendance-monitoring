const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

/**
 * Test script for parent endpoints
 */
async function testParentEndpoints() {
  console.log('=== Testing Parent Endpoints ===\n');

  try {
    let parentToken = '';
    let studentId = '';

    // Test 1: Get a student ID to link with parent
    console.log('Test 1: Get existing student for linking');
    let existingStudentId = null;
    try {
      const axios = require('axios');
      const dbManager = require('../models/database');
      const db = dbManager.getConnection();
      
      // Get first student from database
      const student = db.prepare('SELECT id FROM students LIMIT 1').get();
      if (student) {
        existingStudentId = student.id;
        console.log(`✓ Found student ID: ${existingStudentId}\n`);
      } else {
        console.log('⚠ No students found in database. Create a student first.\n');
      }
    } catch (error) {
      console.log('Error getting student:', error.message);
    }

    // Test 2: Register parent with student linking
    console.log('Test 2: Register parent account with student linking');
    if (existingStudentId) {
      try {
        const registerResponse = await axios.post(`${BASE_URL}/auth/parent/register`, {
          name: 'Test Parent',
          email: `testparent_${Date.now()}@example.com`,
          password: 'TestPassword123',
          phone: '555-0100',
          studentIds: [existingStudentId],
          relationships: ['Parent'],
        });

        console.log('Register response:', registerResponse.data);
        console.log('✓ Parent registered successfully with student link\n');
        
        // Use this token for subsequent tests
        if (registerResponse.data.data.accessToken) {
          parentToken = registerResponse.data.data.accessToken;
          if (registerResponse.data.data.linkedStudents.length > 0) {
            studentId = registerResponse.data.data.linkedStudents[0].id;
          }
        }
      } catch (error) {
        console.log('Register error:', error.response?.data || error.message);
        console.log('✗ Failed to register parent\n');
      }
    } else {
      console.log('⚠ Skipping parent registration (no student available)\n');
    }

    // Test 3: Login as parent (use existing parent)
    console.log('Test 3: Login as parent');
    try {
      const loginResponse = await axios.post(`${BASE_URL}/auth/parent/login`, {
        email: 'testparent@example.com',
        password: 'TestPassword123',
      });

      parentToken = loginResponse.data.data.accessToken;
      if (loginResponse.data.data.linkedStudents.length > 0) {
        studentId = loginResponse.data.data.linkedStudents[0].id;
      }
      console.log('Login response:', loginResponse.data);
      console.log('✓ Parent logged in successfully\n');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('⚠ Parent login endpoint not yet implemented');
        console.log('Skipping remaining tests that require authentication\n');
        return;
      } else if (error.response?.status === 401) {
        console.log('⚠ Parent credentials not found. Run testNotificationService.js first to create test parent\n');
        return;
      } else {
        console.log('Login error:', error.response?.data || error.message);
        return;
      }
    }

    // Test 4: Register device token
    console.log('Test 4: Register device token');
    try {
      const deviceToken = 'test_device_token_' + Date.now();
      const tokenResponse = await axios.post(
        `${BASE_URL}/parent/device-token`,
        {
          deviceToken: deviceToken,
          platform: 'android',
        },
        {
          headers: {
            Authorization: `Bearer ${parentToken}`,
          },
        }
      );

      console.log('Device token registration response:', tokenResponse.data);
      console.log('✓ Device token registered successfully\n');
    } catch (error) {
      console.log('Device token registration error:', error.response?.data || error.message);
      console.log('✗ Failed to register device token\n');
    }

    // Test 5: Get linked students
    console.log('Test 5: Get linked students');
    try {
      const studentsResponse = await axios.get(`${BASE_URL}/parent/students`, {
        headers: {
          Authorization: `Bearer ${parentToken}`,
        },
      });

      console.log('Linked students response:', studentsResponse.data);
      
      if (studentsResponse.data.data.students.length > 0) {
        studentId = studentsResponse.data.data.students[0].id;
        console.log(`✓ Found ${studentsResponse.data.data.students.length} linked student(s)\n`);
      } else {
        console.log('⚠ No students linked to this parent\n');
      }
    } catch (error) {
      console.log('Get students error:', error.response?.data || error.message);
      console.log('✗ Failed to get linked students\n');
    }

    // Test 6: Get student attendance history
    if (studentId) {
      console.log('Test 6: Get student attendance history');
      try {
        const attendanceResponse = await axios.get(
          `${BASE_URL}/parent/student/${studentId}/attendance`,
          {
            headers: {
              Authorization: `Bearer ${parentToken}`,
            },
            params: {
              limit: 10,
              offset: 0,
            },
          }
        );

        console.log('Student attendance response:', attendanceResponse.data);
        console.log('✓ Retrieved student attendance history\n');
      } catch (error) {
        console.log('Get attendance error:', error.response?.data || error.message);
        console.log('✗ Failed to get student attendance\n');
      }
    } else {
      console.log('Test 6: Skipped (no student ID available)\n');
    }

    // Test 7: Get notifications
    console.log('Test 7: Get notification history');
    try {
      const notificationsResponse = await axios.get(`${BASE_URL}/parent/notifications`, {
        headers: {
          Authorization: `Bearer ${parentToken}`,
        },
      });

      console.log('Notifications response:', notificationsResponse.data);
      console.log('✓ Retrieved notification history\n');
    } catch (error) {
      console.log('Get notifications error:', error.response?.data || error.message);
      console.log('✗ Failed to get notifications\n');
    }

    // Test 8: Unregister device token
    console.log('Test 8: Unregister device token');
    try {
      const deviceToken = 'test_device_token_' + (Date.now() - 1000); // Use a recent token
      const unregisterResponse = await axios.delete(
        `${BASE_URL}/parent/device-token`,
        {
          headers: {
            Authorization: `Bearer ${parentToken}`,
          },
          data: {
            deviceToken: deviceToken,
          },
        }
      );

      console.log('Device token unregistration response:', unregisterResponse.data);
      console.log('✓ Device token unregistered successfully\n');
    } catch (error) {
      console.log('Device token unregistration error:', error.response?.data || error.message);
      console.log('⚠ Failed to unregister device token (may not exist)\n');
    }

    // Test 9: Test validation - invalid platform
    console.log('Test 9: Test validation - invalid platform');
    try {
      const invalidResponse = await axios.post(
        `${BASE_URL}/parent/device-token`,
        {
          deviceToken: 'test_token',
          platform: 'windows', // Invalid platform
        },
        {
          headers: {
            Authorization: `Bearer ${parentToken}`,
          },
        }
      );

      console.log('✗ Validation should have failed\n');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('Validation error (expected):', error.response.data.message);
        console.log('✓ Validation working correctly\n');
      } else {
        console.log('Unexpected error:', error.response?.data || error.message);
      }
    }

    console.log('=== All Parent Endpoint Tests Completed ===');

  } catch (error) {
    console.error('Test suite failed:', error.message);
    process.exit(1);
  }
}

// Check if server is running
async function checkServer() {
  try {
    await axios.get(`${BASE_URL.replace('/api', '')}/health`);
    return true;
  } catch (error) {
    return false;
  }
}

// Run tests
(async () => {
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.error('Error: Server is not running on http://localhost:3000');
    console.error('Please start the server with: npm start');
    process.exit(1);
  }

  await testParentEndpoints();
})();
