const axios = require('axios');
require('dotenv').config();

const API_URL = process.env.API_URL || 'http://localhost:3000';

async function testPhoneValidation() {
  console.log('📱 Testing Phone Number Validation\n');

  try {
    // Step 1: Login as student
    console.log('1️⃣ Logging in as student...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/student/login`, {
      email: 'john.doe@school.com',
      password: 'Password123',
    });

    if (!loginResponse.data.success) {
      console.error('❌ Login failed:', loginResponse.data.message);
      return;
    }

    const token = loginResponse.data.data.accessToken;
    console.log('✅ Login successful\n');

    // Test cases
    const testCases = [
      { phone: '09123456789', expected: true, description: 'Valid format without spaces' },
      { phone: '0912 345 6789', expected: true, description: 'Valid format with spaces' },
      { phone: '09XX XXX XXXX', expected: false, description: 'Invalid - contains letters' },
      { phone: '12345678901', expected: false, description: 'Invalid - does not start with 09' },
      { phone: '091234567', expected: false, description: 'Invalid - too short' },
      { phone: '091234567890', expected: false, description: 'Invalid - too long' },
      { phone: '0812345678', expected: false, description: 'Invalid - starts with 08' },
      { phone: '', expected: true, description: 'Empty (optional field)' },
    ];

    console.log('2️⃣ Testing phone number validation...\n');

    for (const testCase of testCases) {
      try {
        const updateResponse = await axios.put(
          `${API_URL}/api/student/profile`,
          { phone: testCase.phone },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (testCase.expected) {
          console.log(`✅ PASS: ${testCase.description}`);
          console.log(`   Phone: "${testCase.phone}" - Accepted as expected\n`);
        } else {
          console.log(`❌ FAIL: ${testCase.description}`);
          console.log(`   Phone: "${testCase.phone}" - Should have been rejected but was accepted\n`);
        }
      } catch (error) {
        if (!testCase.expected && error.response?.status === 400) {
          console.log(`✅ PASS: ${testCase.description}`);
          console.log(`   Phone: "${testCase.phone}" - Rejected as expected`);
          console.log(`   Error: ${error.response.data.message}\n`);
        } else {
          console.log(`❌ FAIL: ${testCase.description}`);
          console.log(`   Phone: "${testCase.phone}" - Unexpected error`);
          console.log(`   Status: ${error.response?.status}`);
          console.log(`   Error: ${error.response?.data?.message || error.message}\n`);
        }
      }
    }

    console.log('🎉 Phone validation testing complete!');
  } catch (error) {
    console.error('❌ Test failed with error:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('   Error:', error.message);
    }
  }
}

// Run the test
testPhoneValidation();
