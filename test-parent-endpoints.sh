#!/bin/bash

BASE_URL="http://localhost:3000/api"

echo "🧪 Testing Parent Endpoints"
echo ""

# First, create a parent account
echo "1️⃣ Creating parent account..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/parent/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Parent",
    "email": "parent@test.com",
    "password": "Password123",
    "phone": "1234567890",
    "studentIds": ["TEST001"],
    "relationships": ["Parent"]
  }')

echo "$REGISTER_RESPONSE" | jq '.'

if echo "$REGISTER_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
  echo "✅ Parent registration successful!"
  
  TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.data.accessToken')
  STUDENT_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.data.linkedStudents[0].id')
  
  echo ""
  echo "2️⃣ Fetching linked students..."
  STUDENTS_RESPONSE=$(curl -s -X GET "$BASE_URL/parent/students" \
    -H "Authorization: Bearer $TOKEN")
  
  echo "$STUDENTS_RESPONSE" | jq '.'
  
  if echo "$STUDENTS_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    echo "✅ Students list fetch successful!"
  else
    echo "❌ Students list fetch failed"
  fi
  
  echo ""
  echo "3️⃣ Fetching student attendance logs..."
  ATTENDANCE_RESPONSE=$(curl -s -X GET "$BASE_URL/parent/student/$STUDENT_ID/attendance?limit=10" \
    -H "Authorization: Bearer $TOKEN")
  
  echo "$ATTENDANCE_RESPONSE" | jq '.'
  
  if echo "$ATTENDANCE_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    echo "✅ Attendance logs fetch successful!"
  else
    echo "❌ Attendance logs fetch failed"
  fi
  
else
  # Try to login if registration failed (account might already exist)
  echo "⚠️  Registration failed, trying to login..."
  
  LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/parent/login" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "parent@test.com",
      "password": "Password123"
    }')
  
  echo "$LOGIN_RESPONSE" | jq '.'
  
  if echo "$LOGIN_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    echo "✅ Parent login successful!"
    
    TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.accessToken')
    STUDENT_ID=$(echo "$LOGIN_RESPONSE" | jq -r '.data.linkedStudents[0].id')
    
    echo ""
    echo "2️⃣ Fetching linked students..."
    STUDENTS_RESPONSE=$(curl -s -X GET "$BASE_URL/parent/students" \
      -H "Authorization: Bearer $TOKEN")
    
    echo "$STUDENTS_RESPONSE" | jq '.'
    
    if echo "$STUDENTS_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
      echo "✅ Students list fetch successful!"
    else
      echo "❌ Students list fetch failed"
    fi
    
    echo ""
    echo "3️⃣ Fetching student attendance logs..."
    ATTENDANCE_RESPONSE=$(curl -s -X GET "$BASE_URL/parent/student/$STUDENT_ID/attendance?limit=10" \
      -H "Authorization: Bearer $TOKEN")
    
    echo "$ATTENDANCE_RESPONSE" | jq '.'
    
    if echo "$ATTENDANCE_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
      echo "✅ Attendance logs fetch successful!"
    else
      echo "❌ Attendance logs fetch failed"
    fi
  else
    echo "❌ Parent login failed"
  fi
fi

echo ""
echo "✅ Test complete!"
