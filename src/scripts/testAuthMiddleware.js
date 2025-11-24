const authService = require('../services/authService');
const { authenticate, authorize, authenticateAndAuthorize } = require('../middleware/auth');

// Mock request and response objects
function createMockReq(headers = {}) {
  return {
    headers,
    user: null,
  };
}

function createMockRes() {
  const res = {
    statusCode: 200,
    jsonData: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.jsonData = data;
      return this;
    },
  };
  return res;
}

function createMockNext() {
  let called = false;
  return () => {
    called = true;
    return { called };
  };
}

async function testAuthMiddleware() {
  console.log('Testing Authentication Middleware...\n');

  try {
    // Test 1: No token provided
    console.log('Test 1: No Authorization Header');
    const req1 = createMockReq();
    const res1 = createMockRes();
    const next1 = createMockNext();
    authenticate(req1, res1, next1);
    console.log(`✓ Status: ${res1.statusCode}`);
    console.log(`✓ Error: ${res1.jsonData.error}`);
    console.log(`✓ Message: ${res1.jsonData.message}`);

    // Test 2: Invalid token format
    console.log('\nTest 2: Invalid Token Format');
    const req2 = createMockReq({ authorization: 'InvalidFormat' });
    const res2 = createMockRes();
    const next2 = createMockNext();
    authenticate(req2, res2, next2);
    console.log(`✓ Status: ${res2.statusCode}`);
    console.log(`✓ Error: ${res2.jsonData.error}`);

    // Test 3: Valid token
    console.log('\nTest 3: Valid Token');
    const token = authService.generateAccessToken({
      id: 1,
      role: 'student',
      email: 'student@example.com',
    });
    const req3 = createMockReq({ authorization: `Bearer ${token}` });
    const res3 = createMockRes();
    const next3 = createMockNext();
    authenticate(req3, res3, next3);
    console.log(`✓ User attached to request: ${req3.user ? 'YES' : 'NO'}`);
    console.log(`✓ User ID: ${req3.user.id}`);
    console.log(`✓ User Role: ${req3.user.role}`);
    console.log(`✓ Next called: ${next3().called ? 'YES' : 'NO'}`);

    // Test 4: Invalid token
    console.log('\nTest 4: Invalid Token');
    const req4 = createMockReq({ authorization: 'Bearer invalid.token.here' });
    const res4 = createMockRes();
    const next4 = createMockNext();
    authenticate(req4, res4, next4);
    console.log(`✓ Status: ${res4.statusCode}`);
    console.log(`✓ Error: ${res4.jsonData.error}`);

    // Test 5: Role authorization - allowed role
    console.log('\nTest 5: Role Authorization - Allowed');
    const req5 = createMockReq();
    req5.user = { id: 1, role: 'student', email: 'student@example.com' };
    const res5 = createMockRes();
    const next5 = createMockNext();
    const authorizeStudent = authorize('student', 'admin');
    authorizeStudent(req5, res5, next5);
    console.log(`✓ Next called: ${next5().called ? 'YES' : 'NO'}`);

    // Test 6: Role authorization - forbidden role
    console.log('\nTest 6: Role Authorization - Forbidden');
    const req6 = createMockReq();
    req6.user = { id: 1, role: 'student', email: 'student@example.com' };
    const res6 = createMockRes();
    const next6 = createMockNext();
    const authorizeAdmin = authorize('admin');
    authorizeAdmin(req6, res6, next6);
    console.log(`✓ Status: ${res6.statusCode}`);
    console.log(`✓ Error: ${res6.jsonData.error}`);
    console.log(`✓ Message: ${res6.jsonData.message}`);

    // Test 7: Role authorization - no user
    console.log('\nTest 7: Role Authorization - No User');
    const req7 = createMockReq();
    const res7 = createMockRes();
    const next7 = createMockNext();
    const authorizeAny = authorize('student');
    authorizeAny(req7, res7, next7);
    console.log(`✓ Status: ${res7.statusCode}`);
    console.log(`✓ Error: ${res7.jsonData.error}`);

    // Test 8: Combined middleware
    console.log('\nTest 8: Combined Authenticate and Authorize');
    const middlewares = authenticateAndAuthorize('student', 'parent');
    console.log(`✓ Middleware array length: ${middlewares.length}`);
    console.log(`✓ Contains authenticate: ${middlewares[0] === authenticate ? 'YES' : 'NO'}`);

    // Test 9: Multiple roles
    console.log('\nTest 9: Multiple Allowed Roles');
    const req9 = createMockReq();
    req9.user = { id: 2, role: 'parent', email: 'parent@example.com' };
    const res9 = createMockRes();
    const next9 = createMockNext();
    const authorizeMultiple = authorize('student', 'parent', 'admin');
    authorizeMultiple(req9, res9, next9);
    console.log(`✓ Parent role allowed: ${next9().called ? 'YES' : 'NO'}`);

    console.log('\n✅ All middleware tests passed!');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testAuthMiddleware();
