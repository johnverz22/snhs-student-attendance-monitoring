#!/bin/bash

API_URL="https://snhs-student-attendance-monitoring.vercel.app/api"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="Admin123"

echo "🔍 Checking Parent Links for Student 1001"
echo "=========================================="
echo ""

# Login as admin
echo "1️⃣ Logging in as admin..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/admin/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$ADMIN_USERNAME\",\"password\":\"$ADMIN_PASSWORD\"}")

if echo "$LOGIN_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
  TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.accessToken')
  echo "✅ Admin login successful"
  echo ""
  
  # Get student details
  echo "2️⃣ Searching for student 1001..."
  STUDENT_RESPONSE=$(curl -s -X GET "$API_URL/admin/students/search?query=1001" \
    -H "Authorization: Bearer $TOKEN")
  
  echo "$STUDENT_RESPONSE" | jq '.'
  
  if echo "$STUDENT_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    STUDENT_COUNT=$(echo "$STUDENT_RESPONSE" | jq '.data.students | length')
    echo ""
    echo "✅ Found $STUDENT_COUNT student(s)"
    
    if [ "$STUDENT_COUNT" -gt 0 ]; then
      STUDENT_DB_ID=$(echo "$STUDENT_RESPONSE" | jq -r '.data.students[0].id')
      STUDENT_NAME=$(echo "$STUDENT_RESPONSE" | jq -r '.data.students[0].name')
      echo "   - Name: $STUDENT_NAME"
      echo "   - Database ID: $STUDENT_DB_ID"
      echo ""
      echo "💡 To receive push notifications:"
      echo "   1. Create a parent account"
      echo "   2. Link parent to student 1001"
      echo "   3. Parent must login to mobile app"
      echo "   4. App will register FCM device token"
      echo "   5. Future attendance scans will send notifications"
    fi
  fi
else
  echo "❌ Admin login failed"
fi

echo ""
echo "=========================================="
