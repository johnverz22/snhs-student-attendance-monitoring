#!/usr/bin/env node

/**
 * Test LAN Access
 * Comprehensive diagnostic tool for LAN connectivity issues
 */

const http = require('http');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const PORT = 3000;
const LAN_IP = '192.168.100.83';

async function runCommand(cmd) {
  try {
    const { stdout } = await execPromise(cmd);
    return stdout.trim();
  } catch (error) {
    return `Error: ${error.message}`;
  }
}

async function testConnection(host, port) {
  return new Promise((resolve) => {
    const req = http.get(`http://${host}:${port}/health`, { timeout: 5000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ success: true, status: res.statusCode, data });
      });
    });
    
    req.on('error', (error) => {
      resolve({ success: false, error: error.message });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({ success: false, error: 'Timeout' });
    });
  });
}

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║              LAN Access Diagnostic Tool                       ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  // Test 1: Check if server is running
  console.log('📋 Test 1: Server Status');
  const serverCheck = await runCommand(`lsof -i :${PORT} | grep LISTEN`);
  if (serverCheck.includes('LISTEN')) {
    console.log('✅ Server is running on port', PORT);
  } else {
    console.log('❌ Server is NOT running on port', PORT);
    console.log('   Run: npm start');
    return;
  }
  console.log('');

  // Test 2: Test localhost
  console.log('📋 Test 2: Localhost Access');
  const localhostTest = await testConnection('localhost', PORT);
  if (localhostTest.success) {
    console.log('✅ Localhost access works');
    console.log('   Response:', localhostTest.data);
  } else {
    console.log('❌ Localhost access failed:', localhostTest.error);
  }
  console.log('');

  // Test 3: Test 127.0.0.1
  console.log('📋 Test 3: 127.0.0.1 Access');
  const loopbackTest = await testConnection('127.0.0.1', PORT);
  if (loopbackTest.success) {
    console.log('✅ 127.0.0.1 access works');
  } else {
    console.log('❌ 127.0.0.1 access failed:', loopbackTest.error);
  }
  console.log('');

  // Test 4: Test LAN IP
  console.log('📋 Test 4: LAN IP Access');
  const lanTest = await testConnection(LAN_IP, PORT);
  if (lanTest.success) {
    console.log('✅ LAN IP access works!');
    console.log('   Response:', lanTest.data);
  } else {
    console.log('❌ LAN IP access failed:', lanTest.error);
    console.log('   This is the problem we need to fix!');
  }
  console.log('');

  // Test 5: Check routing
  console.log('📋 Test 5: Routing Table');
  const routing = await runCommand(`netstat -rn | grep ${LAN_IP}`);
  console.log(routing);
  if (routing.includes('lo0')) {
    console.log('⚠️  WARNING: LAN IP is routed through loopback (lo0)');
    console.log('   This is a macOS quirk that can cause issues');
  }
  console.log('');

  // Test 6: Firewall status
  console.log('📋 Test 6: Firewall Configuration');
  const firewallState = await runCommand('/usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate');
  console.log(firewallState);
  
  const nodeAllowed = await runCommand('/usr/libexec/ApplicationFirewall/socketfilterfw --getappblocked /usr/local/bin/node');
  console.log(nodeAllowed);
  console.log('');

  // Recommendations
  console.log('═'.repeat(64));
  console.log('📝 RECOMMENDATIONS:\n');
  
  if (!lanTest.success) {
    console.log('The issue is that macOS routes traffic to its own LAN IP');
    console.log('through the loopback interface, which can cause problems.\n');
    console.log('SOLUTIONS:\n');
    console.log('1. Use from another device on the same network');
    console.log('   (The LAN IP will work fine from other devices)\n');
    console.log('2. For testing from this Mac, use:');
    console.log('   • http://localhost:3000');
    console.log('   • http://127.0.0.1:3000\n');
    console.log('3. Configure your mobile app to use:');
    console.log(`   • Physical device: http://${LAN_IP}:${PORT}/api`);
    console.log('   • Android emulator: http://10.0.2.2:3000/api');
    console.log('   • iOS simulator: http://localhost:3000/api\n');
  } else {
    console.log('✅ Everything looks good! LAN access is working.');
  }
  
  console.log('═'.repeat(64));
}

main().catch(console.error);
