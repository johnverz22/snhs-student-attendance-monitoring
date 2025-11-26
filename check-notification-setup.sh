#!/bin/bash

API_URL="https://snhs-student-attendance-monitoring.vercel.app/api"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="gogoSNHS123"

echo "🔍 Checking Push Notification Setup for Student 1001"
echo "====================================================="
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
  
  if echo "$STUDENT_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    STUDENT_COUNT=$(echo "$STUDENT_RESPONSE" | jq '.data.students | length')
    
    if [ "$STUDENT_COUNT" -gt 0 ]; then
      STUDENT_DB_ID=$(echo "$STUDENT_RESPONSE" | jq -r '.data.students[0].id')
      STUDENT_NAME=$(echo "$STUDENT_RESPONSE" | jq -r '.data.students[0].name')
      STUDENT_ID=$(echo "$STUDENT_RESPONSE" | jq -r '.data.students[0].student_id')
      STUDENT_EMAIL=$(echo "$STUDENT_RESPONSE" | jq -r '.data.students[0].email')
      
      echo "✅ Found student:"
      echo "   - Name: $STUDENT_NAME"
      echo "   - Student ID: $STUDENT_ID"
      echo "   - Email: $STUDENT_EMAIL"
      echo "   - Database ID: $STUDENT_DB_ID"
      echo ""
      
      # Check recent attendance
      echo "3️⃣ Checking recent attendance logs..."
      ATTENDANCE_RESPONSE=$(curl -s -X GET "$API_URL/admin/attendance/logs?page=1&limit=5" \
        -H "Authorization: Bearer $TOKEN")
      
      if echo "$ATTENDANCE_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
        RECENT_LOGS=$(echo "$ATTENDANCE_RESPONSE" | jq '.data.logs | length')
        echo "✅ Found $RECENT_LOGS recent attendance log(s)"
        
        if [ "$RECENT_LOGS" -gt 0 ]; then
          echo ""
          echo "📋 Most Recent Attendance:"
          echo "$ATTENDANCE_RESPONSE" | jq -r '.data.logs[0] | "   - Student: \(.student_name)\n   - Time: \(.entry_time)\n   - Gate: \(.gate_name)"'
        fi
      fi
      
      echo ""
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      echo "📱 Push Notification Requirements:"
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      echo ""
      echo "To receive push notifications, you need:"
      echo ""
      echo "1️⃣  Create a Parent Account"
      echo "   - Register via Parent mobile app"
      echo "   - Link to student ID: $STUDENT_ID"
      echo ""
      echo "2️⃣  Parent Must Login to Mobile App"
      echo "   - Open Parent app on phone"
      echo "   - Login with parent credentials"
      echo "   - App will automatically register FCM token"
      echo ""
      echo "3️⃣  Grant Notification Permissions"
      echo "   - Allow notifications when prompted"
      echo "   - Ensure app has notification permission"
      echo ""
      echo "4️⃣  Firebase Configuration (Backend)"
      echo "   - Firebase service account must be configured"
      echo "   - FIREBASE_SERVICE_ACCOUNT env var on Vercel"
      echo ""
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      echo ""
      echo "💡 How Notifications Work:"
      echo ""
      echo "   Student Scans QR → Attendance Logged → Backend checks"
      echo "   for linked parents → Gets parent's FCM tokens → Sends"
      echo "   push notification via Firebase Cloud Messaging"
      echo ""
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      echo ""
      echo "🔧 API Endpoints for Parent Setup:"
      echo ""
      echo "   Register Parent:"
      echo "   POST $API_URL/auth/parent/register"
      echo "   Body: {"
      echo "     \"name\": \"Parent Name\","
      echo "     \"email\": \"parent@example.com\","
      echo "     \"password\": \"Password123\","
      echo "     \"phone\": \"1234567890\","
      echo "     \"studentIds\": [\"$STUDENT_ID\"],"
      echo "     \"relationships\": [\"Parent\"]"
      echo "   }"
      echo ""
      echo "   Register Device Token (done by app):"
      echo "   POST $API_URL/parent/device-token"
      echo "   Body: {"
      echo "     \"deviceToken\": \"FCM_TOKEN_HERE\","
      echo "     \"platform\": \"android\" or \"ios\""
      echo "   }"
      echo ""
    else
      echo "❌ Student 1001 not found"
    fi
  else
    echo "❌ Failed to search for student"
  fi
else
  echo "❌ Admin login failed"
  echo ""
  echo "Response:"
  echo "$LOGIN_RESPONSE" | jq '.'
fi

echo ""
echo "====================================================="
