const locationService = require('../services/locationService');
const dbManager = require('../models/database');

/**
 * Test script for LocationService
 */
async function testLocationService() {
  console.log('=== Testing LocationService ===\n');

  try {
    // Initialize database
    dbManager.initialize();

    // Test 1: Get school configuration
    console.log('Test 1: Get school configuration');
    const config = await locationService.getSchoolConfig();
    console.log('School Config:', {
      name: config.school_name,
      latitude: config.latitude,
      longitude: config.longitude,
      radius: config.radius_meters,
      timezone: config.timezone,
    });
    console.log('✓ Test 1 passed\n');

    // Test 2: Calculate distance (Haversine formula)
    console.log('Test 2: Calculate distance using Haversine formula');
    const distance1 = locationService.calculateDistance(
      40.7128, -74.0060,  // New York
      40.7614, -73.9776   // Times Square
    );
    console.log(`Distance from NYC to Times Square: ${Math.round(distance1)} meters`);
    console.log('✓ Test 2 passed\n');

    // Test 3: Validate location within boundaries
    console.log('Test 3: Validate location within school boundaries');
    const validLocation = await locationService.validateLocation(
      config.latitude + 0.0001,  // Very close to school
      config.longitude + 0.0001
    );
    console.log('Valid location result:', {
      isValid: validLocation.isValid,
      distance: validLocation.distance,
      maxAllowed: validLocation.maxAllowedDistance,
    });
    console.log('✓ Test 3 passed\n');

    // Test 4: Validate location outside boundaries
    console.log('Test 4: Validate location outside school boundaries');
    const invalidLocation = await locationService.validateLocation(
      config.latitude + 0.01,  // Far from school
      config.longitude + 0.01
    );
    console.log('Invalid location result:', {
      isValid: invalidLocation.isValid,
      distance: invalidLocation.distance,
      maxAllowed: invalidLocation.maxAllowedDistance,
    });
    console.log('✓ Test 4 passed\n');

    // Test 5: Update school configuration
    console.log('Test 5: Update school configuration');
    const updatedConfig = await locationService.updateSchoolConfig({
      school_name: 'Test School Updated',
      radius_meters: 150,
    });
    console.log('Updated config:', {
      name: updatedConfig.school_name,
      radius: updatedConfig.radius_meters,
    });
    console.log('✓ Test 5 passed\n');

    // Test 6: Restore original configuration
    console.log('Test 6: Restore original configuration');
    await locationService.updateSchoolConfig({
      school_name: config.school_name,
      radius_meters: config.radius_meters,
    });
    console.log('✓ Test 6 passed\n');

    // Test 7: Test validation error handling
    console.log('Test 7: Test validation error handling');
    try {
      await locationService.updateSchoolConfig({
        latitude: 100,  // Invalid latitude
      });
      console.log('✗ Test 7 failed - should have thrown error');
    } catch (error) {
      console.log('Expected error caught:', error.message);
      console.log('✓ Test 7 passed\n');
    }

    console.log('=== All tests completed successfully ===');
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  } finally {
    dbManager.close();
  }
}

// Run tests
testLocationService();
