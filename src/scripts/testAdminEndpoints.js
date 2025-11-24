const http = require('http');

const BASE_URL = 'http://localhost:3000';
let adminToken = null;

/**
 * Make HTTP request
 */
function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

/**
 * Test admin endpoints
 */
async function testAdminEndpoints() {
  console.log('=== Testing Admin Endpoints ===\n');
  console.log('Make sure the server is running on port 3000\n');

  try {
    // Test 1: Admin login
    console.log('Test 1: Admin login');
    const loginRes = await makeRequest('POST', '/api/auth/admin/login', {
      username: 'admin',
      password: 'Admin123!',
    });
    
    if (loginRes.status !== 200) {
      throw new Error(`Login failed: ${JSON.stringify(loginRes.data)}`);
    }
    
    adminToken = loginRes.data.data.accessToken;
    console.log('✓ Admin logged in successfully');
    console.log(`Token: ${adminToken.substring(0, 20)}...\n`);

    // Test 2: Get school config
    console.log('Test 2: Get school configuration');
    const getConfigRes = await makeRequest('GET', '/api/admin/school/config', null, adminToken);
    
    if (getConfigRes.status !== 200) {
      throw new Error(`Get config failed: ${JSON.stringify(getConfigRes.data)}`);
    }
    
    console.log('School Config:', getConfigRes.data.data);
    console.log('✓ Test 2 passed\n');

    // Test 3: Update school config
    console.log('Test 3: Update school configuration');
    const updateConfigRes = await makeRequest('PUT', '/api/admin/school/config', {
      schoolName: 'Updated Test School',
      radiusMeters: 200,
    }, adminToken);
    
    if (updateConfigRes.status !== 200) {
      throw new Error(`Update config failed: ${JSON.stringify(updateConfigRes.data)}`);
    }
    
    console.log('Updated Config:', updateConfigRes.data.data);
    console.log('✓ Test 3 passed\n');

    // Test 4: Verify config was updated
    console.log('Test 4: Verify configuration was updated');
    const verifyConfigRes = await makeRequest('GET', '/api/admin/school/config', null, adminToken);
    
    if (verifyConfigRes.data.data.schoolName !== 'Updated Test School') {
      throw new Error('School name was not updated');
    }
    
    if (verifyConfigRes.data.data.radiusMeters !== 200) {
      throw new Error('Radius was not updated');
    }
    
    console.log('✓ Test 4 passed\n');

    // Test 5: Restore original config
    console.log('Test 5: Restore original configuration');
    await makeRequest('PUT', '/api/admin/school/config', {
      schoolName: 'Sample School',
      radiusMeters: 100,
    }, adminToken);
    console.log('✓ Test 5 passed\n');

    // Test 6: Test unauthorized access
    console.log('Test 6: Test unauthorized access (no token)');
    const unauthorizedRes = await makeRequest('GET', '/api/admin/school/config');
    
    if (unauthorizedRes.status !== 401) {
      throw new Error('Should have returned 401 for unauthorized access');
    }
    
    console.log('✓ Test 6 passed - Correctly rejected unauthorized access\n');

    console.log('=== All tests completed successfully ===');
  } catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
  }
}

testAdminEndpoints();
