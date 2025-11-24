const axios = require('axios');
const config = require('../config');

const BASE_URL = `http://localhost:${config.server.port}`;

/**
 * Test script for error handling and validation
 */
async function testErrorHandling() {
  console.log('=== Testing Error Handling and Validation ===\n');

  let testsPassed = 0;
  let testsFailed = 0;

  // Test 1: Invalid JSON
  console.log('Test 1: Invalid JSON in request body');
  try {
    await axios.post(`${BASE_URL}/api/auth/student/login`, 'invalid json', {
      headers: { 'Content-Type': 'application/json' },
      validateStatus: () => true,
    });
    const response = await axios.post(`${BASE_URL}/api/auth/student/login`, 'invalid json', {
      headers: { 'Content-Type': 'application/json' },
      validateStatus: () => true,
    });
    
    if (response.status === 400 && response.data.error === 'INVALID_JSON') {
      console.log('✓ Invalid JSON handled correctly\n');
      testsPassed++;
    } else {
      console.log('✗ Invalid JSON not handled correctly\n');
      testsFailed++;
    }
  } catch (error) {
    console.log('✓ Invalid JSON handled correctly (caught by axios)\n');
    testsPassed++;
  }

  // Test 2: Missing required fields
  console.log('Test 2: Missing required fields in registration');
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/student/register`, {
      email: 'test@example.com',
      // Missing student_id, name, password
    }, {
      validateStatus: () => true,
    });
    
    if (response.status === 400 && response.data.error === 'VALIDATION_ERROR') {
      console.log('✓ Missing fields validation works');
      console.log(`  Error: ${response.data.message}`);
      console.log(`  Details: ${JSON.stringify(response.data.details)}\n`);
      testsPassed++;
    } else {
      console.log('✗ Missing fields validation failed\n');
      testsFailed++;
    }
  } catch (error) {
    console.log('✗ Test failed:', error.message, '\n');
    testsFailed++;
  }

  // Test 3: Invalid email format
  console.log('Test 3: Invalid email format');
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/student/register`, {
      student_id: 'TEST001',
      name: 'Test Student',
      email: 'invalid-email',
      password: 'Password123',
    }, {
      validateStatus: () => true,
    });
    
    if (response.status === 400 && response.data.error === 'VALIDATION_ERROR') {
      console.log('✓ Email validation works');
      console.log(`  Error: ${response.data.message}\n`);
      testsPassed++;
    } else {
      console.log('✗ Email validation failed\n');
      testsFailed++;
    }
  } catch (error) {
    console.log('✗ Test failed:', error.message, '\n');
    testsFailed++;
  }

  // Test 4: Weak password
  console.log('Test 4: Weak password validation');
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/student/register`, {
      student_id: 'TEST002',
      name: 'Test Student',
      email: 'test2@example.com',
      password: 'weak',
    }, {
      validateStatus: () => true,
    });
    
    if (response.status === 400 && response.data.error === 'VALIDATION_ERROR') {
      console.log('✓ Password validation works');
      console.log(`  Error: ${response.data.message}\n`);
      testsPassed++;
    } else {
      console.log('✗ Password validation failed\n');
      testsFailed++;
    }
  } catch (error) {
    console.log('✗ Test failed:', error.message, '\n');
    testsFailed++;
  }

  // Test 5: 404 Not Found
  console.log('Test 5: 404 Not Found for non-existent route');
  try {
    const response = await axios.get(`${BASE_URL}/api/nonexistent`, {
      validateStatus: () => true,
    });
    
    if (response.status === 404 && response.data.error === 'NOT_FOUND') {
      console.log('✓ 404 handler works');
      console.log(`  Error: ${response.data.message}\n`);
      testsPassed++;
    } else {
      console.log('✗ 404 handler failed\n');
      testsFailed++;
    }
  } catch (error) {
    console.log('✗ Test failed:', error.message, '\n');
    testsFailed++;
  }

  // Test 6: Rate limiting on login (requires multiple requests)
  console.log('Test 6: Rate limiting on login endpoint');
  try {
    const requests = [];
    for (let i = 0; i < 6; i++) {
      requests.push(
        axios.post(`${BASE_URL}/api/auth/student/login`, {
          email: 'test@example.com',
          password: 'password',
        }, {
          validateStatus: () => true,
        })
      );
    }
    
    const responses = await Promise.all(requests);
    const rateLimited = responses.some(r => r.status === 429);
    
    if (rateLimited) {
      console.log('✓ Rate limiting works');
      const rateLimitResponse = responses.find(r => r.status === 429);
      console.log(`  Error: ${rateLimitResponse.data.message}\n`);
      testsPassed++;
    } else {
      console.log('✗ Rate limiting not triggered (may need more requests)\n');
      testsFailed++;
    }
  } catch (error) {
    console.log('✗ Test failed:', error.message, '\n');
    testsFailed++;
  }

  // Test 7: Unauthorized access
  console.log('Test 7: Unauthorized access to protected route');
  try {
    const response = await axios.get(`${BASE_URL}/api/student/profile`, {
      validateStatus: () => true,
    });
    
    if (response.status === 401 && response.data.error === 'AUTH_NO_TOKEN') {
      console.log('✓ Authentication middleware works');
      console.log(`  Error: ${response.data.message}\n`);
      testsPassed++;
    } else {
      console.log('✗ Authentication middleware failed\n');
      testsFailed++;
    }
  } catch (error) {
    console.log('✗ Test failed:', error.message, '\n');
    testsFailed++;
  }

  // Test 8: Invalid token format
  console.log('Test 8: Invalid token format');
  try {
    const response = await axios.get(`${BASE_URL}/api/student/profile`, {
      headers: {
        Authorization: 'InvalidFormat',
      },
      validateStatus: () => true,
    });
    
    if (response.status === 401 && response.data.error === 'AUTH_INVALID_FORMAT') {
      console.log('✓ Token format validation works');
      console.log(`  Error: ${response.data.message}\n`);
      testsPassed++;
    } else {
      console.log('✗ Token format validation failed\n');
      testsFailed++;
    }
  } catch (error) {
    console.log('✗ Test failed:', error.message, '\n');
    testsFailed++;
  }

  // Test 9: Invalid attendance scan data
  console.log('Test 9: Invalid GPS coordinates in attendance scan');
  try {
    // First, register and login to get a token
    const registerResponse = await axios.post(`${BASE_URL}/api/auth/student/register`, {
      student_id: `TEST_ERROR_${Date.now()}`,
      name: 'Test Student',
      email: `test_error_${Date.now()}@example.com`,
      password: 'Password123',
    }, {
      validateStatus: () => true,
    });

    if (registerResponse.status === 201) {
      const token = registerResponse.data.data.accessToken;

      const response = await axios.post(`${BASE_URL}/api/student/attendance/scan`, {
        qrCode: 'TEST_QR',
        latitude: 999, // Invalid latitude
        longitude: 0,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        validateStatus: () => true,
      });

      if (response.status === 400 && response.data.error === 'VALIDATION_ERROR') {
        console.log('✓ GPS coordinate validation works');
        console.log(`  Error: ${response.data.message}\n`);
        testsPassed++;
      } else {
        console.log('✗ GPS coordinate validation failed\n');
        testsFailed++;
      }
    } else {
      console.log('✗ Could not register test user\n');
      testsFailed++;
    }
  } catch (error) {
    console.log('✗ Test failed:', error.message, '\n');
    testsFailed++;
  }

  // Test 10: Standardized error response format
  console.log('Test 10: Standardized error response format');
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/student/login`, {
      email: 'nonexistent@example.com',
      password: 'password',
    }, {
      validateStatus: () => true,
    });
    
    const hasStandardFormat = 
      response.data.hasOwnProperty('success') &&
      response.data.hasOwnProperty('error') &&
      response.data.hasOwnProperty('message') &&
      response.data.success === false;
    
    if (hasStandardFormat) {
      console.log('✓ Standardized error format works');
      console.log(`  Format: ${JSON.stringify(response.data)}\n`);
      testsPassed++;
    } else {
      console.log('✗ Standardized error format failed\n');
      testsFailed++;
    }
  } catch (error) {
    console.log('✗ Test failed:', error.message, '\n');
    testsFailed++;
  }

  // Summary
  console.log('\n=== Test Summary ===');
  console.log(`Tests Passed: ${testsPassed}`);
  console.log(`Tests Failed: ${testsFailed}`);
  console.log(`Total Tests: ${testsPassed + testsFailed}`);
  
  if (testsFailed === 0) {
    console.log('\n✓ All error handling and validation tests passed!');
  } else {
    console.log('\n✗ Some tests failed. Please review the implementation.');
  }
}

// Run tests
testErrorHandling().catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
