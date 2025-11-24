#!/usr/bin/env node

/**
 * Display Network Information
 * Shows all available IP addresses for accessing the server
 */

const os = require('os');
const config = require('../config');

function getNetworkAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal (loopback) and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push({
          name: name,
          address: iface.address,
          netmask: iface.netmask,
        });
      }
    }
  }

  return addresses;
}

function displayNetworkInfo() {
  const PORT = config.server.port || 3000;
  const addresses = getNetworkAddresses();

  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║         School Attendance System - Network Information        ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  console.log('📍 Server Port:', PORT);
  console.log('🌍 Environment:', config.server.env);
  console.log('\n' + '─'.repeat(64) + '\n');

  console.log('🖥️  LOCAL ACCESS:');
  console.log(`   http://localhost:${PORT}`);
  console.log(`   http://127.0.0.1:${PORT}`);
  console.log('\n' + '─'.repeat(64) + '\n');

  if (addresses.length > 0) {
    console.log('📡 LAN ACCESS (for mobile devices on same network):');
    addresses.forEach((addr, index) => {
      console.log(`   ${index + 1}. ${addr.name}: http://${addr.address}:${PORT}`);
    });
    console.log('\n' + '─'.repeat(64) + '\n');

    console.log('📱 MOBILE APP CONFIGURATION:');
    console.log('\n   For Android Emulator:');
    console.log('   static const String baseUrl = \'http://10.0.2.2:' + PORT + '/api\';');
    console.log('\n   For iOS Simulator:');
    console.log('   static const String baseUrl = \'http://localhost:' + PORT + '/api\';');
    console.log('\n   For Physical Device (use your LAN IP):');
    if (addresses.length > 0) {
      console.log('   static const String baseUrl = \'http://' + addresses[0].address + ':' + PORT + '/api\';');
    }
    console.log('\n' + '─'.repeat(64) + '\n');

    console.log('🌐 ADMIN INTERFACE:');
    console.log(`   Local: http://localhost:${PORT}/admin`);
    if (addresses.length > 0) {
      console.log(`   LAN:   http://${addresses[0].address}:${PORT}/admin`);
    }
  } else {
    console.log('⚠️  No network interfaces found.');
    console.log('   Make sure you are connected to a network.');
  }

  console.log('\n' + '─'.repeat(64) + '\n');

  console.log('💡 TIPS:');
  console.log('   • Ensure your firewall allows connections on port ' + PORT);
  console.log('   • Mobile device must be on the same WiFi network');
  console.log('   • Use the LAN IP address in your mobile app config');
  console.log('   • File location: student_app/lib/config/api_config.dart');

  console.log('\n' + '═'.repeat(64) + '\n');
}

// Run if called directly
if (require.main === module) {
  displayNetworkInfo();
}

module.exports = { getNetworkAddresses, displayNetworkInfo };
