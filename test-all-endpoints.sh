#!/bin/bash

BASE_URL="http://localhost:3000/api"
PASS=0
FAIL=0

echo "🧪 Comprehensive API Test Suite"
echo "================================"
echo ""

# Test 1: Student Login
echo "1️⃣ Testing Student Login..."
RESPONSE=$(curl -s -X POST "$BASE_URL/auth/student/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@student.com","password":"Password123"}')

if echo "$RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
  echo "   ✅ Student login"
  PASS=$((PASS + 1))
  STUDENT_TOKEN=$(echo "$RESPONSE" | jq -r '.data.accessToken')
else
  echo "   ❌ Student login"
  FAIL=$((FAIL + 1))
fi

# Test 2: Student Profile
echo "2️⃣ Testing Student Profile..."
RESPONSE=$(curl -s -X GET "$BASE_URL/student/profile" \
  -H "Authorization: Bearer $STUDENT_TOKEN")

if echo "$RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
  echo "   ✅ Student profile"
  PASS=$((PASS + 1))
else
  echo "   ❌ Student profile"
  FAIL=$((FAIL + 1))
fi

# Test 3: Student Attendance History
echo "3️⃣ Testing Student Attendance History..."
RESPONSE=$(curl -s -X GET "$BASE_URL/student/attendance/history?limit=10" \
  -H "Authorization: Bearer $STUDENT_TOKEN")

if echo "$RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
  echo "   ✅ Student attendance history"
  PASS=$((PASS + 1))
else
  echo "   ❌ Student attendance history"
  FAIL=$((FAIL + 1))
fi

# Test 4: Parent Login
echo "4️⃣ Testing Parent Login..."
RESPONSE=$(curl -s -X POST "$BASE_URL/auth/parent/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"parent@test.com","password":"Password123"}')

if echo "$RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
  echo "   ✅ Parent login"
  PASS=$((PASS + 1))
  PARENT_TOKEN=$(echo "$RESPONSE" | jq -r '.data.accessToken')
  STUDENT_ID=$(echo "$RESPONSE" | jq -r '.data.linkedStudents[0].id')
else
  echo "   ❌ Parent login"
  FAIL=$((FAIL + 1))
fi

# Test 5: Parent Get Students
echo "5️⃣ Testing Parent Get Students..."
RESPONSE=$(curl -s -X GET "$BASE_URL/parent/students" \
  -H "Authorization: Bearer $PARENT_TOKEN")

if echo "$RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
  echo "   ✅ Parent get students"
  PASS=$((PASS + 1))
else
  echo "   ❌ Parent get students"
  FAIL=$((FAIL + 1))
fi

# Test 6: Parent Get Student Attendance
echo "6️⃣ Testing Parent Get Student Attendance..."
RESPONSE=$(curl -s -X GET "$BASE_URL/parent/student/$STUDENT_ID/attendance?limit=10" \
  -H "Authorization: Bearer $PARENT_TOKEN")

if echo "$RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
  echo "   ✅ Parent get student attendance"
  PASS=$((PASS + 1))
else
  echo "   ❌ Parent get student attendance"
  FAIL=$((FAIL + 1))
fi

# Test 7: Admin Login
echo "7️⃣ Testing Admin Login..."
RESPONSE=$(curl -s -X POST "$BASE_URL/auth/admin/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin123"}')

if echo "$RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
  echo "   ✅ Admin login"
  PASS=$((PASS + 1))
  ADMIN_TOKEN=$(echo "$RESPONSE" | jq -r '.data.accessToken')
else
  echo "   ❌ Admin login"
  FAIL=$((FAIL + 1))
fi

# Test 8: Admin Get Attendance Logs
echo "8️⃣ Testing Admin Get Attendance Logs..."
RESPONSE=$(curl -s -X GET "$BASE_URL/admin/attendance/logs?page=1&limit=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if echo "$RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
  echo "   ✅ Admin get attendance logs"
  PASS=$((PASS + 1))
else
  echo "   ❌ Admin get attendance logs"
  FAIL=$((FAIL + 1))
fi

# Test 9: Admin Get Students
echo "9️⃣ Testing Admin Get Students..."
RESPONSE=$(curl -s -X GET "$BASE_URL/admin/students?page=1&limit=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if echo "$RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
  echo "   ✅ Admin get students"
  PASS=$((PASS + 1))
else
  echo "   ❌ Admin get students"
  FAIL=$((FAIL + 1))
fi

# Test 10: Admin Search Students
echo "🔟 Testing Admin Search Students..."
RESPONSE=$(curl -s -X GET "$BASE_URL/admin/students/search?query=test" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if echo "$RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
  echo "   ✅ Admin search students"
  PASS=$((PASS + 1))
else
  echo "   ❌ Admin search students"
  FAIL=$((FAIL + 1))
fi

# Test 11: Admin Get School Config
echo "1️⃣1️⃣ Testing Admin Get School Config..."
RESPONSE=$(curl -s -X GET "$BASE_URL/admin/school/config" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if echo "$RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
  echo "   ✅ Admin get school config"
  PASS=$((PASS + 1))
else
  echo "   ❌ Admin get school config"
  FAIL=$((FAIL + 1))
fi

echo ""
echo "================================"
echo "📊 Test Results"
echo "================================"
echo "✅ Passed: $PASS"
echo "❌ Failed: $FAIL"
echo "📈 Total:  $((PASS + FAIL))"
echo ""

if [ $FAIL -eq 0 ]; then
  echo "🎉 All tests passed!"
  exit 0
else
  echo "⚠️  Some tests failed"
  exit 1
fi
