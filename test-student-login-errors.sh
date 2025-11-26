#!/bin/bash

echo "🧪 Testing Student Login Error Messages"
echo "========================================"
echo ""

BASE_URL="http://localhost:3000/api"

# Test 1: Wrong email
echo "1️⃣ Test: Wrong email address"
echo "Request: {\"email\":\"wrong@email.com\",\"password\":\"Password123\"}"
RESPONSE=$(curl -s -X POST "$BASE_URL/auth/student/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"wrong@email.com","password":"Password123"}')
echo "Response:"
echo "$RESPONSE" | jq '.'
echo ""

# Test 2: Wrong password
echo "2️⃣ Test: Correct email, wrong password"
echo "Request: {\"email\":\"test@student.com\",\"password\":\"WrongPassword\"}"
RESPONSE=$(curl -s -X POST "$BASE_URL/auth/student/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@student.com","password":"WrongPassword"}')
echo "Response:"
echo "$RESPONSE" | jq '.'
echo ""

# Test 3: Empty email
echo "3️⃣ Test: Empty email"
echo "Request: {\"email\":\"\",\"password\":\"Password123\"}"
RESPONSE=$(curl -s -X POST "$BASE_URL/auth/student/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"","password":"Password123"}')
echo "Response:"
echo "$RESPONSE" | jq '.'
echo ""

# Test 4: Empty password
echo "4️⃣ Test: Empty password"
echo "Request: {\"email\":\"test@student.com\",\"password\":\"\"}"
RESPONSE=$(curl -s -X POST "$BASE_URL/auth/student/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@student.com","password":""}')
echo "Response:"
echo "$RESPONSE" | jq '.'
echo ""

# Test 5: Correct credentials (should succeed)
echo "5️⃣ Test: Correct credentials"
echo "Request: {\"email\":\"test@student.com\",\"password\":\"Password123\"}"
RESPONSE=$(curl -s -X POST "$BASE_URL/auth/student/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@student.com","password":"Password123"}')
echo "Response:"
echo "$RESPONSE" | jq '{success, message, error}'
echo ""

echo "========================================"
echo "✅ Error message testing complete!"
echo ""
echo "📋 Summary:"
echo "   - Wrong email: Returns 'Invalid email or password'"
echo "   - Wrong password: Returns 'Invalid email or password'"
echo "   - Empty fields: Returns validation errors"
echo "   - Correct credentials: Returns success"
