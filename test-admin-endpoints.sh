#!/bin/bash

BASE_URL="http://localhost:3000/api"

echo "🧪 Testing Admin Endpoints"
echo ""

# Login as admin
echo "1️⃣ Admin Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/admin/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "Admin123"
  }')

echo "$LOGIN_RESPONSE" | jq '.'

if echo "$LOGIN_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
  echo "✅ Admin login successful!"
  
  TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.accessToken')
  
  echo ""
  echo "2️⃣ Fetching attendance logs..."
  LOGS_RESPONSE=$(curl -s -X GET "$BASE_URL/admin/attendance/logs?page=1&limit=10" \
    -H "Authorization: Bearer $TOKEN")
  
  echo "$LOGS_RESPONSE" | jq '.'
  
  if echo "$LOGS_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    echo "✅ Attendance logs fetch successful!"
  else
    echo "❌ Attendance logs fetch failed"
  fi
  
  echo ""
  echo "3️⃣ Fetching students list..."
  STUDENTS_RESPONSE=$(curl -s -X GET "$BASE_URL/admin/students?page=1&limit=10" \
    -H "Authorization: Bearer $TOKEN")
  
  echo "$STUDENTS_RESPONSE" | jq '.'
  
  if echo "$STUDENTS_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    echo "✅ Students list fetch successful!"
  else
    echo "❌ Students list fetch failed"
  fi
  
  echo ""
  echo "4️⃣ Searching students..."
  SEARCH_RESPONSE=$(curl -s -X GET "$BASE_URL/admin/students/search?query=test" \
    -H "Authorization: Bearer $TOKEN")
  
  echo "$SEARCH_RESPONSE" | jq '.'
  
  if echo "$SEARCH_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    echo "✅ Student search successful!"
  else
    echo "❌ Student search failed"
  fi
  
  echo ""
  echo "5️⃣ Fetching school config..."
  CONFIG_RESPONSE=$(curl -s -X GET "$BASE_URL/admin/school/config" \
    -H "Authorization: Bearer $TOKEN")
  
  echo "$CONFIG_RESPONSE" | jq '.'
  
  if echo "$CONFIG_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    echo "✅ School config fetch successful!"
  else
    echo "❌ School config fetch failed"
  fi
  
else
  echo "❌ Admin login failed"
fi

echo ""
echo "✅ Test complete!"
