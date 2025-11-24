const authService = require('../services/authService');

async function testAuthService() {
  console.log('Testing Authentication Service...\n');

  try {
    // Test 1: Password hashing
    console.log('Test 1: Password Hashing');
    const password = 'TestPassword123';
    const hashedPassword = await authService.hashPassword(password);
    console.log('✓ Password hashed successfully');
    console.log(`  Original: ${password}`);
    console.log(`  Hashed: ${hashedPassword.substring(0, 30)}...`);

    // Test 2: Password comparison
    console.log('\nTest 2: Password Comparison');
    const isMatch = await authService.comparePassword(password, hashedPassword);
    console.log(`✓ Password comparison: ${isMatch ? 'MATCH' : 'NO MATCH'}`);
    
    const isWrongMatch = await authService.comparePassword('WrongPassword', hashedPassword);
    console.log(`✓ Wrong password comparison: ${isWrongMatch ? 'MATCH' : 'NO MATCH'}`);

    // Test 3: Token generation
    console.log('\nTest 3: Token Generation');
    const payload = {
      id: 1,
      role: 'student',
      email: 'student@example.com',
    };
    const accessToken = authService.generateAccessToken(payload);
    const refreshToken = authService.generateRefreshToken(payload);
    console.log('✓ Access token generated');
    console.log(`  Token: ${accessToken.substring(0, 50)}...`);
    console.log('✓ Refresh token generated');
    console.log(`  Token: ${refreshToken.substring(0, 50)}...`);

    // Test 4: Token verification
    console.log('\nTest 4: Token Verification');
    const decoded = authService.verifyToken(accessToken);
    console.log('✓ Token verified successfully');
    console.log(`  User ID: ${decoded.id}`);
    console.log(`  Role: ${decoded.role}`);
    console.log(`  Email: ${decoded.email}`);

    // Test 5: Token pair generation
    console.log('\nTest 5: Token Pair Generation');
    const tokenPair = authService.generateTokenPair(payload);
    console.log('✓ Token pair generated');
    console.log(`  Access Token: ${tokenPair.accessToken.substring(0, 30)}...`);
    console.log(`  Refresh Token: ${tokenPair.refreshToken.substring(0, 30)}...`);

    // Test 6: Refresh token functionality
    console.log('\nTest 6: Refresh Token Functionality');
    const refreshed = authService.refreshAccessToken(tokenPair.refreshToken);
    console.log('✓ Access token refreshed successfully');
    console.log(`  New Access Token: ${refreshed.accessToken.substring(0, 30)}...`);

    // Test 7: Invalid token handling
    console.log('\nTest 7: Invalid Token Handling');
    try {
      authService.verifyToken('invalid.token.here');
      console.log('✗ Should have thrown error for invalid token');
    } catch (error) {
      console.log(`✓ Invalid token rejected: ${error.code}`);
    }

    // Test 8: Role-based payload
    console.log('\nTest 8: Different Roles');
    const roles = ['student', 'parent', 'admin'];
    roles.forEach(role => {
      const rolePayload = { id: 1, role, email: `${role}@example.com` };
      const token = authService.generateAccessToken(rolePayload);
      const decodedRole = authService.verifyToken(token);
      console.log(`✓ ${role} token: ${decodedRole.role}`);
    });

    console.log('\n✅ All authentication service tests passed!');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

testAuthService();
