#!/bin/bash

BASE_URL="http://localhost:3000/api"

echo "🧪 Testing Student Login Flow"
echo ""

# Register a test student
echo "1️⃣ Registering test student..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/student/register" \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": "TEST001",
    "name": "Test Student",
    "email": "test@student.com",
    "password": "Password123",
    "grade": "10",
    "section": "A"
  }')

echo "$REGISTER_RESPONSE" | jq '.'

if echo "$REGISTER_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
  echo "✅ Registration successful!"
else
  echo "⚠️  Registration failed (student may already exist)"
fi

echo ""
echo "2️⃣ Logging in with test student..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/student/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@student.com",
    "password": "Password123"
  }')

echo "$LOGIN_RESPONSE" | jq '.'

if echo "$LOGIN_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
  echo "✅ Login successful!"
  
  # Extract token
  TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.accessToken')
  
  echo ""
  echo "3️⃣ Testing authenticated endpoint (get profile)..."
  PROFILE_RESPONSE=$(curl -s -X GET "$BASE_URL/student/profile" \
    -H "Authorization: Bearer $TOKEN")
  
  echo "$PROFILE_RESPONSE" | jq '.'
  
  if echo "$PROFILE_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    echo "✅ Profile fetch successful!"
  else
    echo "❌ Profile fetch failed"
  fi
else
  echo "❌ Login failed"
fi

echo ""
echo "✅ Test complete!"
