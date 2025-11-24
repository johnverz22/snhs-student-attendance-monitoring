/**
 * Test script for QR code management endpoints
 * Tests CRUD operations and validation logic
 */

const config = require('../config');

const BASE_URL = `http://localhost:${config.server.port}/api`;

// Admin credentials (should be seeded first)
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'Admin123!',
};

let adminToken = null;
let createdQRCodeId = null;

/**
 * Helper function to make HTTP requests
 */
async function makeRequest(endpoint, method = 'GET', body = null, token = null) {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    console.error(`Request failed: ${error.message}`);
    throw error;
  }
}

/**
 * Test 1: Admin login
 */
async function testAdminLogin() {
  console.log('\n=== Test 1: Admin Login ===');
  
  const result = await makeRequest('/auth/admin/login', 'POST', ADMIN_CREDENTIALS);
  
  if (result.status === 200 && result.data.success) {
    adminToken = result.data.data.accessToken;
    console.log('✓ Admin login successful');
    console.log(`  Token: ${adminToken.substring(0, 20)}...`);
    return true;
  } else {
    console.log('✗ Admin login failed');
    console.log(`  Status: ${result.status}`);
    console.log(`  Response:`, result.data);
    return false;
  }
}

/**
 * Test 2: Create QR code
 */
async function testCreateQRCode() {
  console.log('\n=== Test 2: Create QR Code ===');
  
  const qrCodeData = {
    code: 'GATE_A_2024_TEST123',
    gateName: 'Main Gate A',
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
  };
  
  const result = await makeRequest('/admin/qr-codes', 'POST', qrCodeData, adminToken);
  
  if (result.status === 201 && result.data.success) {
    createdQRCodeId = result.data.data.id;
    console.log('✓ QR code created successfully');
    console.log(`  ID: ${result.data.data.id}`);
    console.log(`  Code: ${result.data.data.code}`);
    console.log(`  Gate: ${result.data.data.gateName}`);
    console.log(`  Active: ${result.data.data.isActive}`);
    console.log(`  Expires: ${result.data.data.expiresAt}`);
    return true;
  } else {
    console.log('✗ QR code creation failed');
    console.log(`  Status: ${result.status}`);
    console.log(`  Response:`, result.data);
    return false;
  }
}

/**
 * Test 3: Create duplicate QR code (should fail)
 */
async function testCreateDuplicateQRCode() {
  console.log('\n=== Test 3: Create Duplicate QR Code (Should Fail) ===');
  
  const qrCodeData = {
    code: 'GATE_A_2024_TEST123', // Same code as before
    gateName: 'Another Gate',
  };
  
  const result = await makeRequest('/admin/qr-codes', 'POST', qrCodeData, adminToken);
  
  if (result.status === 409 && result.data.error === 'QR_CODE_EXISTS') {
    console.log('✓ Duplicate QR code correctly rejected');
    console.log(`  Error: ${result.data.message}`);
    return true;
  } else {
    console.log('✗ Duplicate QR code should have been rejected');
    console.log(`  Status: ${result.status}`);
    console.log(`  Response:`, result.data);
    return false;
  }
}

/**
 * Test 4: Get all QR codes
 */
async function testGetAllQRCodes() {
  console.log('\n=== Test 4: Get All QR Codes ===');
  
  const result = await makeRequest('/admin/qr-codes', 'GET', null, adminToken);
  
  if (result.status === 200 && result.data.success) {
    console.log('✓ QR codes fetched successfully');
    console.log(`  Total QR codes: ${result.data.data.length}`);
    result.data.data.forEach((qr, index) => {
      console.log(`  ${index + 1}. ${qr.code} - ${qr.gateName} (Active: ${qr.isActive})`);
    });
    return true;
  } else {
    console.log('✗ Failed to fetch QR codes');
    console.log(`  Status: ${result.status}`);
    console.log(`  Response:`, result.data);
    return false;
  }
}

/**
 * Test 5: Get single QR code by ID
 */
async function testGetQRCodeById() {
  console.log('\n=== Test 5: Get QR Code by ID ===');
  
  const result = await makeRequest(`/admin/qr-codes/${createdQRCodeId}`, 'GET', null, adminToken);
  
  if (result.status === 200 && result.data.success) {
    console.log('✓ QR code fetched successfully');
    console.log(`  ID: ${result.data.data.id}`);
    console.log(`  Code: ${result.data.data.code}`);
    console.log(`  Gate: ${result.data.data.gateName}`);
    console.log(`  Active: ${result.data.data.isActive}`);
    return true;
  } else {
    console.log('✗ Failed to fetch QR code');
    console.log(`  Status: ${result.status}`);
    console.log(`  Response:`, result.data);
    return false;
  }
}

/**
 * Test 6: Update QR code
 */
async function testUpdateQRCode() {
  console.log('\n=== Test 6: Update QR Code ===');
  
  const updates = {
    gateName: 'Main Gate A - Updated',
    isActive: true,
  };
  
  const result = await makeRequest(`/admin/qr-codes/${createdQRCodeId}`, 'PUT', updates, adminToken);
  
  if (result.status === 200 && result.data.success) {
    console.log('✓ QR code updated successfully');
    console.log(`  New gate name: ${result.data.data.gateName}`);
    console.log(`  Active: ${result.data.data.isActive}`);
    return true;
  } else {
    console.log('✗ Failed to update QR code');
    console.log(`  Status: ${result.status}`);
    console.log(`  Response:`, result.data);
    return false;
  }
}

/**
 * Test 7: Deactivate QR code
 */
async function testDeactivateQRCode() {
  console.log('\n=== Test 7: Deactivate QR Code ===');
  
  const updates = {
    isActive: false,
  };
  
  const result = await makeRequest(`/admin/qr-codes/${createdQRCodeId}`, 'PUT', updates, adminToken);
  
  if (result.status === 200 && result.data.success && result.data.data.isActive === false) {
    console.log('✓ QR code deactivated successfully');
    console.log(`  Active: ${result.data.data.isActive}`);
    return true;
  } else {
    console.log('✗ Failed to deactivate QR code');
    console.log(`  Status: ${result.status}`);
    console.log(`  Response:`, result.data);
    return false;
  }
}

/**
 * Test 8: Create QR code with expiration
 */
async function testCreateQRCodeWithExpiration() {
  console.log('\n=== Test 8: Create QR Code with Expiration ===');
  
  const qrCodeData = {
    code: 'GATE_B_TEMP_2024',
    gateName: 'Temporary Gate B',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
  };
  
  const result = await makeRequest('/admin/qr-codes', 'POST', qrCodeData, adminToken);
  
  if (result.status === 201 && result.data.success) {
    console.log('✓ QR code with expiration created successfully');
    console.log(`  Code: ${result.data.data.code}`);
    console.log(`  Expires: ${result.data.data.expiresAt}`);
    return true;
  } else {
    console.log('✗ Failed to create QR code with expiration');
    console.log(`  Status: ${result.status}`);
    console.log(`  Response:`, result.data);
    return false;
  }
}

/**
 * Test 9: Create QR code with past expiration (should fail)
 */
async function testCreateQRCodeWithPastExpiration() {
  console.log('\n=== Test 9: Create QR Code with Past Expiration (Should Fail) ===');
  
  const qrCodeData = {
    code: 'GATE_C_EXPIRED',
    gateName: 'Gate C',
    expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
  };
  
  const result = await makeRequest('/admin/qr-codes', 'POST', qrCodeData, adminToken);
  
  if (result.status === 400 && result.data.error === 'VALIDATION_ERROR') {
    console.log('✓ QR code with past expiration correctly rejected');
    console.log(`  Error: ${result.data.message}`);
    return true;
  } else {
    console.log('✗ QR code with past expiration should have been rejected');
    console.log(`  Status: ${result.status}`);
    console.log(`  Response:`, result.data);
    return false;
  }
}

/**
 * Test 10: Delete QR code
 */
async function testDeleteQRCode() {
  console.log('\n=== Test 10: Delete QR Code ===');
  
  const result = await makeRequest(`/admin/qr-codes/${createdQRCodeId}`, 'DELETE', null, adminToken);
  
  if (result.status === 200 && result.data.success) {
    console.log('✓ QR code deleted successfully');
    console.log(`  Message: ${result.data.message}`);
    return true;
  } else {
    console.log('✗ Failed to delete QR code');
    console.log(`  Status: ${result.status}`);
    console.log(`  Response:`, result.data);
    return false;
  }
}

/**
 * Test 11: Get deleted QR code (should fail)
 */
async function testGetDeletedQRCode() {
  console.log('\n=== Test 11: Get Deleted QR Code (Should Fail) ===');
  
  const result = await makeRequest(`/admin/qr-codes/${createdQRCodeId}`, 'GET', null, adminToken);
  
  if (result.status === 404 && result.data.error === 'QR_CODE_NOT_FOUND') {
    console.log('✓ Deleted QR code correctly not found');
    console.log(`  Error: ${result.data.message}`);
    return true;
  } else {
    console.log('✗ Deleted QR code should not be found');
    console.log(`  Status: ${result.status}`);
    console.log(`  Response:`, result.data);
    return false;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('========================================');
  console.log('QR Code Management Endpoints Test Suite');
  console.log('========================================');

  const tests = [
    testAdminLogin,
    testCreateQRCode,
    testCreateDuplicateQRCode,
    testGetAllQRCodes,
    testGetQRCodeById,
    testUpdateQRCode,
    testDeactivateQRCode,
    testCreateQRCodeWithExpiration,
    testCreateQRCodeWithPastExpiration,
    testDeleteQRCode,
    testGetDeletedQRCode,
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await test();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.log(`✗ Test threw an error: ${error.message}`);
      failed++;
    }
  }

  console.log('\n========================================');
  console.log('Test Summary');
  console.log('========================================');
  console.log(`Total tests: ${tests.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log('========================================');

  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch((error) => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
