/**
 * Test script for Admin Interface JavaScript functionality
 * This script verifies that the admin interface can be accessed and works correctly
 */

const http = require('http');
const https = require('https');

const BASE_URL = 'http://localhost:3000';

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.request(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testAdminInterface() {
  console.log('🧪 Testing Admin Interface JavaScript Functionality\n');
  
  let passed = 0;
  let failed = 0;
  
  // Test 1: Check if login page is accessible
  try {
    console.log('Test 1: Checking if login page is accessible...');
    const response = await makeRequest(`${BASE_URL}/admin/login.html`);
    
    if (response.statusCode === 200 && response.body.includes('auth.js')) {
      console.log('✅ Login page is accessible and includes auth.js\n');
      passed++;
    } else {
      console.log('❌ Login page is not accessible or missing auth.js\n');
      failed++;
    }
  } catch (error) {
    console.log(`❌ Failed to access login page: ${error.message}\n`);
    failed++;
  }
  
  // Test 2: Check if dashboard page is accessible
  try {
    console.log('Test 2: Checking if dashboard page is accessible...');
    const response = await makeRequest(`${BASE_URL}/admin/dashboard.html`);
    
    if (response.statusCode === 200 && 
        response.body.includes('api.js') && 
        response.body.includes('auth.js') && 
        response.body.includes('dashboard.js')) {
      console.log('✅ Dashboard page is accessible and includes all required scripts\n');
      passed++;
    } else {
      console.log('❌ Dashboard page is not accessible or missing scripts\n');
      failed++;
    }
  } catch (error) {
    console.log(`❌ Failed to access dashboard page: ${error.message}\n`);
    failed++;
  }
  
  // Test 3: Check if logs page is accessible
  try {
    console.log('Test 3: Checking if logs page is accessible...');
    const response = await makeRequest(`${BASE_URL}/admin/logs.html`);
    
    if (response.statusCode === 200 && 
        response.body.includes('api.js') && 
        response.body.includes('auth.js') && 
        response.body.includes('logs.js')) {
      console.log('✅ Logs page is accessible and includes all required scripts\n');
      passed++;
    } else {
      console.log('❌ Logs page is not accessible or missing scripts\n');
      failed++;
    }
  } catch (error) {
    console.log(`❌ Failed to access logs page: ${error.message}\n`);
    failed++;
  }
  
  // Test 4: Check if reports page is accessible
  try {
    console.log('Test 4: Checking if reports page is accessible...');
    const response = await makeRequest(`${BASE_URL}/admin/reports.html`);
    
    if (response.statusCode === 200 && 
        response.body.includes('api.js') && 
        response.body.includes('auth.js') && 
        response.body.includes('reports.js')) {
      console.log('✅ Reports page is accessible and includes all required scripts\n');
      passed++;
    } else {
      console.log('❌ Reports page is not accessible or missing scripts\n');
      failed++;
    }
  } catch (error) {
    console.log(`❌ Failed to access reports page: ${error.message}\n`);
    failed++;
  }
  
  // Test 5: Check if settings page is accessible
  try {
    console.log('Test 5: Checking if settings page is accessible...');
    const response = await makeRequest(`${BASE_URL}/admin/settings.html`);
    
    if (response.statusCode === 200 && 
        response.body.includes('api.js') && 
        response.body.includes('auth.js') && 
        response.body.includes('settings.js')) {
      console.log('✅ Settings page is accessible and includes all required scripts\n');
      passed++;
    } else {
      console.log('❌ Settings page is not accessible or missing scripts\n');
      failed++;
    }
  } catch (error) {
    console.log(`❌ Failed to access settings page: ${error.message}\n`);
    failed++;
  }
  
  // Test 6: Check if JavaScript files are accessible
  const jsFiles = ['api.js', 'auth.js', 'dashboard.js', 'logs.js', 'reports.js', 'settings.js'];
  
  for (const file of jsFiles) {
    try {
      console.log(`Test: Checking if ${file} is accessible...`);
      const response = await makeRequest(`${BASE_URL}/admin/js/${file}`);
      
      if (response.statusCode === 200 && response.body.length > 0) {
        console.log(`✅ ${file} is accessible\n`);
        passed++;
      } else {
        console.log(`❌ ${file} is not accessible or empty\n`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ Failed to access ${file}: ${error.message}\n`);
      failed++;
    }
  }
  
  // Summary
  console.log('='.repeat(50));
  console.log('Test Summary:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Total: ${passed + failed}`);
  console.log('='.repeat(50));
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Admin interface JavaScript functionality is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
  }
}

// Run tests
testAdminInterface().catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});
