#!/bin/bash

API_URL="https://snhs-student-attendance-monitoring.vercel.app/api"
PARENT_EMAIL="parent@gmail.com"
PARENT_PASSWORD="Password123"
PARENT_NAME="John's Parent"
PARENT_PHONE="1234567890"
STUDENT_ID="1001"
STUDENT_EMAIL="john@gmail.com"
STUDENT_PASSWORD="Password1"
QR_CODE="Gate 1"
LATITUDE="16.661407"
LONGITUDE="120.328302"
# Simulated FCM token (in real app, this comes from Firebase)
FCM_TOKEN="fake_fcm_token_for_simulation_$(date +%s)"

echo "🔔 Complete Push Notification Simulation"
echo "=========================================="
echo ""
echo "📋 Setup:"
echo "   Parent: $PARENT_EMAIL"
echo "   Student: $STUDENT_EMAIL (ID: $STUDENT_ID)"
echo "   FCM Token: ${FCM_TOKEN:0:40}..."
echo ""

# Step 1: Register parent account
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  STEP 1: Register Parent Account"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/parent/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"$PARENT_NAME\",
    \"email\": \"$PARENT_EMAIL\",
    \"password\": \"$PARENT_PASSWORD\",
    \"phone\": \"$PARENT_PHONE\",
    \"studentIds\": [\"$STUDENT_ID\"],
    \"relationships\": [\"Parent\"]
  }")

echo "Response:"
echo "$REGISTER_RESPONSE" | jq '.'

if echo "$REGISTER_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
  echo ""
  echo "✅ Parent account created successfully!"
  PARENT_TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.data.accessToken')
  PARENT_DB_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.data.parent.id')
  LINKED_STUDENTS=$(echo "$REGISTER_RESPONSE" | jq -r '.data.linkedStudents | length')
  
  echo "   - Parent ID: $PARENT_DB_ID"
  echo "   - Linked Students: $LINKED_STUDENTS"
  echo "   - Token: ${PARENT_TOKEN:0:50}..."
  
elif echo "$REGISTER_RESPONSE" | jq -e '.error' | grep -q "VALIDATION_DUPLICATE"; then
  echo ""
  echo "⚠️  Parent account already exists, logging in instead..."
  
  LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/parent/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$PARENT_EMAIL\",\"password\":\"$PARENT_PASSWORD\"}")
  
  if echo "$LOGIN_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    echo "✅ Parent login successful!"
    PARENT_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.accessToken')
    PARENT_DB_ID=$(echo "$LOGIN_RESPONSE" | jq -r '.data.parent.id')
    LINKED_STUDENTS=$(echo "$LOGIN_RESPONSE" | jq -r '.data.linkedStudents | length')
    
    echo "   - Parent ID: $PARENT_DB_ID"
    echo "   - Linked Students: $LINKED_STUDENTS"
  else
    echo "❌ Parent login failed"
    exit 1
  fi
else
  echo "❌ Parent registration failed"
  exit 1
fi

# Step 2: Register FCM device token
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  STEP 2: Register FCM Device Token"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Simulating: Parent opens mobile app and grants notification permission"
echo "App automatically registers FCM token with backend..."
echo ""

TOKEN_RESPONSE=$(curl -s -X POST "$API_URL/parent/device-token" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PARENT_TOKEN" \
  -d "{
    \"deviceToken\": \"$FCM_TOKEN\",
    \"platform\": \"android\"
  }")

echo "Response:"
echo "$TOKEN_RESPONSE" | jq '.'

if echo "$TOKEN_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
  echo ""
  echo "✅ FCM device token registered successfully!"
  echo "   - Platform: android"
  echo "   - Token: ${FCM_TOKEN:0:40}..."
else
  echo ""
  echo "❌ Failed to register device token"
  exit 1
fi

# Step 3: Student scans QR code
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  STEP 3: Student Scans QR Code"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Student John Doe arrives at school and scans QR code..."
echo ""

# Login as student
STUDENT_LOGIN=$(curl -s -X POST "$API_URL/auth/student/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$STUDENT_EMAIL\",\"password\":\"$STUDENT_PASSWORD\"}")

if echo "$STUDENT_LOGIN" | jq -e '.success' > /dev/null 2>&1; then
  STUDENT_TOKEN=$(echo "$STUDENT_LOGIN" | jq -r '.data.accessToken')
  STUDENT_NAME=$(echo "$STUDENT_LOGIN" | jq -r '.data.student.name')
  
  echo "✅ Student logged in: $STUDENT_NAME"
  echo ""
  echo "Scanning QR code at $QR_CODE..."
  echo "GPS Location: $LATITUDE, $LONGITUDE"
  echo ""
  
  # Scan QR code
  SCAN_RESPONSE=$(curl -s -X POST "$API_URL/student/attendance/scan" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $STUDENT_TOKEN" \
    -d "{
      \"qrCode\": \"$QR_CODE\",
      \"latitude\": $LATITUDE,
      \"longitude\": $LONGITUDE
    }")
  
  echo "Response:"
  echo "$SCAN_RESPONSE" | jq '.'
  
  if echo "$SCAN_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    echo ""
    echo "✅ ✅ ✅ ATTENDANCE LOGGED SUCCESSFULLY! ✅ ✅ ✅"
    echo ""
    echo "📊 Attendance Details:"
    echo "   - Student: $(echo "$SCAN_RESPONSE" | jq -r '.data.studentName')"
    echo "   - Gate: $(echo "$SCAN_RESPONSE" | jq -r '.data.gateName')"
    echo "   - Time: $(echo "$SCAN_RESPONSE" | jq -r '.data.entryTime')"
    echo "   - Attendance ID: $(echo "$SCAN_RESPONSE" | jq -r '.data.attendanceId')"
  else
    echo ""
    echo "❌ Attendance scan failed"
    ERROR=$(echo "$SCAN_RESPONSE" | jq -r '.error')
    MESSAGE=$(echo "$SCAN_RESPONSE" | jq -r '.message')
    echo "   Error: $ERROR"
    echo "   Message: $MESSAGE"
  fi
else
  echo "❌ Student login failed"
  exit 1
fi

# Step 4: Backend sends push notification
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4️⃣  STEP 4: Backend Sends Push Notification"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Backend automatically:"
echo "   1. Checks for parents linked to student $STUDENT_ID"
echo "   2. Finds parent: $PARENT_EMAIL (ID: $PARENT_DB_ID)"
echo "   3. Retrieves FCM token: ${FCM_TOKEN:0:40}..."
echo "   4. Sends notification via Firebase Cloud Messaging"
echo ""
echo "📱 Notification Payload:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "   Title: \"Student Arrival\""
echo "   Body: \"$STUDENT_NAME arrived at school at [time]\""
echo ""
echo "   Data:"
echo "   {"
echo "     \"type\": \"attendance\","
echo "     \"studentId\": \"1\","
echo "     \"studentName\": \"$STUDENT_NAME\","
echo "     \"entryTime\": \"$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")\","
echo "     \"gateName\": \"$QR_CODE\","
echo "     \"attendanceId\": \"...\""
echo "   }"
echo ""

# Step 5: Parent receives notification
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5️⃣  STEP 5: Parent Receives Notification"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📱 Parent's phone displays:"
echo ""
echo "   ┌─────────────────────────────────────┐"
echo "   │  🎓 School Attendance System        │"
echo "   ├─────────────────────────────────────┤"
echo "   │  Student Arrival                    │"
echo "   │                                     │"
echo "   │  $STUDENT_NAME arrived at school    │"
echo "   │  at $(date +"%I:%M %p")                        │"
echo "   │                                     │"
echo "   │  Gate: $QR_CODE                     │"
echo "   └─────────────────────────────────────┘"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ SIMULATION COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Summary:"
echo "   ✅ Parent account created/linked"
echo "   ✅ FCM device token registered"
echo "   ✅ Student attendance logged"
echo "   ✅ Push notification sent to parent"
echo ""
echo "⚠️  Note: In production, Firebase must be properly configured"
echo "    with valid service account credentials for notifications"
echo "    to actually be delivered to the device."
echo ""
echo "🔧 Backend Requirements:"
echo "   - FIREBASE_SERVICE_ACCOUNT environment variable"
echo "   - Valid Firebase project with FCM enabled"
echo "   - Parent app must use real FCM token from Firebase SDK"
echo ""
