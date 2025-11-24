/**
 * Test script for QR code validation logic
 * Tests the validateQRCode method in AttendanceService
 */

const dbManager = require('../models/database');
const attendanceService = require('../services/attendanceService');

/**
 * Setup test data
 */
async function setupTestData() {
  console.log('Setting up test data...');
  
  // Create active QR code
  await attendanceService.createQRCode('ACTIVE_CODE_123', 'Main Gate', null);
  
  // Create inactive QR code
  const inactiveQR = await attendanceService.createQRCode('INACTIVE_CODE_456', 'Side Gate', null);
  await attendanceService.updateQRCode(inactiveQR.id, { isActive: false });
  
  // Create expired QR code
  const expiredDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(); // Yesterday
  const db = dbManager.getConnection();
  db.prepare(`
    INSERT INTO qr_codes (code, gate_name, is_active, expires_at)
    VALUES (?, ?, 1, ?)
  `).run('EXPIRED_CODE_789', 'Back Gate', expiredDate);
  
  console.log('✓ Test data created\n');
}

/**
 * Test 1: Validate active QR code
 */
async function testValidateActiveQRCode() {
  console.log('=== Test 1: Validate Active QR Code ===');
  
  const result = await attendanceService.validateQRCode('ACTIVE_CODE_123');
  
  if (result.isValid && result.qrCodeData) {
    console.log('✓ Active QR code validated successfully');
    console.log(`  Code: ${result.qrCodeData.code}`);
    console.log(`  Gate: ${result.qrCodeData.gateName}`);
    return true;
  } else {
    console.log('✗ Active QR code validation failed');
    console.log(`  Result:`, result);
    return false;
  }
}

/**
 * Test 2: Validate inactive QR code (should fail)
 */
async function testValidateInactiveQRCode() {
  console.log('\n=== Test 2: Validate Inactive QR Code (Should Fail) ===');
  
  const result = await attendanceService.validateQRCode('INACTIVE_CODE_456');
  
  if (!result.isValid && result.error === 'QR_CODE_INACTIVE') {
    console.log('✓ Inactive QR code correctly rejected');
    console.log(`  Error: ${result.message}`);
    return true;
  } else {
    console.log('✗ Inactive QR code should have been rejected');
    console.log(`  Result:`, result);
    return false;
  }
}

/**
 * Test 3: Validate expired QR code (should fail)
 */
async function testValidateExpiredQRCode() {
  console.log('\n=== Test 3: Validate Expired QR Code (Should Fail) ===');
  
  const result = await attendanceService.validateQRCode('EXPIRED_CODE_789');
  
  if (!result.isValid && result.error === 'QR_CODE_EXPIRED') {
    console.log('✓ Expired QR code correctly rejected');
    console.log(`  Error: ${result.message}`);
    console.log(`  Expired at: ${result.expiresAt}`);
    return true;
  } else {
    console.log('✗ Expired QR code should have been rejected');
    console.log(`  Result:`, result);
    return false;
  }
}

/**
 * Test 4: Validate non-existent QR code (should fail)
 */
async function testValidateNonExistentQRCode() {
  console.log('\n=== Test 4: Validate Non-Existent QR Code (Should Fail) ===');
  
  const result = await attendanceService.validateQRCode('NONEXISTENT_CODE');
  
  if (!result.isValid && result.error === 'QR_CODE_INVALID') {
    console.log('✓ Non-existent QR code correctly rejected');
    console.log(`  Error: ${result.message}`);
    return true;
  } else {
    console.log('✗ Non-existent QR code should have been rejected');
    console.log(`  Result:`, result);
    return false;
  }
}

/**
 * Test 5: Validate QR code with future expiration
 */
async function testValidateQRCodeWithFutureExpiration() {
  console.log('\n=== Test 5: Validate QR Code with Future Expiration ===');
  
  // Create QR code that expires in 7 days
  const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  await attendanceService.createQRCode('FUTURE_EXPIRY_CODE', 'Test Gate', futureDate);
  
  const result = await attendanceService.validateQRCode('FUTURE_EXPIRY_CODE');
  
  if (result.isValid && result.qrCodeData) {
    console.log('✓ QR code with future expiration validated successfully');
    console.log(`  Code: ${result.qrCodeData.code}`);
    console.log(`  Expires at: ${result.qrCodeData.expiresAt}`);
    return true;
  } else {
    console.log('✗ QR code with future expiration validation failed');
    console.log(`  Result:`, result);
    return false;
  }
}

/**
 * Cleanup test data
 */
async function cleanupTestData() {
  console.log('\nCleaning up test data...');
  
  const db = dbManager.getConnection();
  db.prepare('DELETE FROM qr_codes WHERE code LIKE ?').run('%CODE%');
  
  console.log('✓ Test data cleaned up');
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('========================================');
  console.log('QR Code Validation Logic Test Suite');
  console.log('========================================\n');

  try {
    // Initialize database
    dbManager.initialize();
    
    // Setup test data
    await setupTestData();

    const tests = [
      testValidateActiveQRCode,
      testValidateInactiveQRCode,
      testValidateExpiredQRCode,
      testValidateNonExistentQRCode,
      testValidateQRCodeWithFutureExpiration,
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
        console.error(error);
        failed++;
      }
    }

    // Cleanup
    await cleanupTestData();

    console.log('\n========================================');
    console.log('Test Summary');
    console.log('========================================');
    console.log(`Total tests: ${tests.length}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log('========================================');

    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('Test suite failed:', error);
    process.exit(1);
  }
}

// Run tests
runTests();
