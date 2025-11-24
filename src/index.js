const os = require('os');
const config = require('./config');
const dbManager = require('./models/database');
const Logger = require('./utils/logger');
const app = require('./app');

// Helper function to get LAN IP addresses
function getLANAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push(iface.address);
      }
    }
  }
  
  return addresses;
}

// Start server only if not in test mode
if (require.main === module) {
  const PORT = config.server.port;
  const HOST = '0.0.0.0'; // Listen on all network interfaces (LAN accessible)
  
  const server = app.listen(PORT, HOST, () => {
    // Log the actual address the server is bound to
    const address = server.address();
    console.log('Server bound to:', address);
    const lanAddresses = getLANAddresses();
    
    Logger.info(`Server started on ${HOST}:${PORT}`, {
      host: HOST,
      port: PORT,
      environment: config.server.env,
      nodeVersion: process.version,
      lanAddresses: lanAddresses,
    });
    
    console.log('\n' + '═'.repeat(70));
    console.log('  🎓 School Attendance System - Server Started');
    console.log('═'.repeat(70));
    console.log(`\n📍 Port: ${PORT}`);
    console.log(`🌍 Environment: ${config.server.env}`);
    console.log(`\n💻 Local Access:`);
    console.log(`   http://localhost:${PORT}`);
    console.log(`   http://127.0.0.1:${PORT}`);
    
    if (lanAddresses.length > 0) {
      console.log(`\n📡 LAN Access (for mobile devices):`);
      lanAddresses.forEach((addr, index) => {
        console.log(`   ${index + 1}. http://${addr}:${PORT}`);
      });
      
      console.log(`\n📱 Mobile App Config (use in api_config.dart):`);
      console.log(`   Android Emulator: http://10.0.2.2:${PORT}/api`);
      console.log(`   iOS Simulator:    http://localhost:${PORT}/api`);
      console.log(`   Physical Device:  http://${lanAddresses[0]}:${PORT}/api`);
    }
    
    console.log(`\n🌐 Admin Interface:`);
    console.log(`   http://localhost:${PORT}/admin`);
    if (lanAddresses.length > 0) {
      console.log(`   http://${lanAddresses[0]}:${PORT}/admin`);
    }
    
    console.log(`\n💡 Tip: Run 'npm run network' to see this info again`);
    console.log('═'.repeat(70) + '\n');
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    Logger.info('SIGTERM signal received: closing HTTP server');
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      Logger.info('HTTP server closed');
      console.log('HTTP server closed');
      dbManager.close();
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    Logger.info('SIGINT signal received: closing HTTP server');
    console.log('SIGINT signal received: closing HTTP server');
    server.close(() => {
      Logger.info('HTTP server closed');
      console.log('HTTP server closed');
      dbManager.close();
      process.exit(0);
    });
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    Logger.error('Uncaught Exception', error, { fatal: true });
    console.error('Uncaught Exception:', error);
    process.exit(1);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    Logger.error('Unhandled Rejection', reason, { 
      fatal: true,
      promise: promise.toString(),
    });
    console.error('Unhandled Rejection:', reason);
    process.exit(1);
  });
}

module.exports = app;
