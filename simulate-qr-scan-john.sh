#!/bin/bash

API_URL="https://snhs-student-attendance-monitoring.vercel.app/api"
STUDENT_EMAIL="john@gmail.com"
STUDENT_PASSWORD="Password1"
QR_CODE="Gate 1"
LATITUDE="16.661407"
LONGITUDE="120.328302"

echo "�� Simulating QR Scan for Student 1001"
echo "========================================"
echo ""
echo "📧 Student Email: $STUDENT_EMAIL"
echo "🔐 Password: $STUDENT_PASSWORD"
echo "📱 QR Code: $QR_CODE"
echo "📍 Location: $LATITUDE, $LONGITUDE"
echo ""

# Step 1: Login to get auth token
echo "1️⃣ Logging in as student..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/student/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$STUDENT_EMAIL\",\"password\":\"$STUDENT_PASSWORD\"}")

echo "$LOGIN_RESPONSE" | jq '.'

# Check if login was successful
if echo "$LOGIN_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
  echo "✅ Login successful!"
  
  # Extract token and student info
  TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.accessToken')
  STUDENT_NAME=$(echo "$LOGIN_RESPONSE" | jq -r '.data.student.name')
  STUDENT_ID=$(echo "$LOGIN_RESPONSE" | jq -r '.data.student.student_id')
  GRADE=$(echo "$LOGIN_RESPONSE" | jq -r '.data.student.grade')
  
  echo ""
  echo "👤 Student Information:"
  echo "   - Name: $STUDENT_NAME"
  echo "   - ID: $STUDENT_ID"
  echo "   - Grade: $GRADE"
  echo "   - Email: $STUDENT_EMAIL"
  echo "🔑 Token: ${TOKEN:0:50}..."
  echo ""
  
  # Step 2: Simulate QR scan
  echo "2️⃣ Scanning QR code at gate..."
  echo "   - QR Code: $QR_CODE"
  echo "   - GPS Location: $LATITUDE, $LONGITUDE"
  echo ""
  
  SCAN_RESPONSE=$(curl -s -X POST "$API_URL/student/attendance/scan" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{\"qrCode\":\"$QR_CODE\",\"latitude\":$LATITUDE,\"longitude\":$LONGITUDE}")
  
  echo "📡 Server Response:"
  echo "$SCAN_RESPONSE" | jq '.'
  
  # Check if scan was successful
  if echo "$SCAN_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    echo ""
    echo "✅ ✅ ✅ ATTENDANCE LOGGED SUCCESSFULLY! ✅ ✅ ✅"
    echo ""
    echo "📊 Attendance Details:"
    echo "   - Student: $(echo "$SCAN_RESPONSE" | jq -r '.data.studentName')"
    echo "   - Gate: $(echo "$SCAN_RESPONSE" | jq -r '.data.gateName')"
    echo "   - Entry Time: $(echo "$SCAN_RESPONSE" | jq -r '.data.entryTime')"
    echo "   - Location Valid: $(echo "$SCAN_RESPONSE" | jq -r '.data.locationValid')"
    echo "   - Attendance ID: $(echo "$SCAN_RESPONSE" | jq -r '.data.attendanceId')"
    echo ""
    echo "🎉 Student $STUDENT_NAME has been marked present!"
  else
    echo ""
    echo "❌ Attendance scan failed!"
    ERROR=$(echo "$SCAN_RESPONSE" | jq -r '.error')
    MESSAGE=$(echo "$SCAN_RESPONSE" | jq -r '.message')
    echo ""
    echo "   Error Code: $ERROR"
    echo "   Message: $MESSAGE"
    echo ""
    
    # Show additional error details if available
    if echo "$SCAN_RESPONSE" | jq -e '.data' > /dev/null 2>&1; then
      echo "   Additional Details:"
      echo "$SCAN_RESPONSE" | jq '.data'
    fi
  fi
else
  echo ""
  echo "❌ Login failed!"
  ERROR=$(echo "$LOGIN_RESPONSE" | jq -r '.error')
  MESSAGE=$(echo "$LOGIN_RESPONSE" | jq -r '.message')
  echo ""
  echo "   Error Code: $ERROR"
  echo "   Message: $MESSAGE"
  echo ""
  echo "💡 Possible reasons:"
  echo "   - Incorrect email or password"
  echo "   - Account doesn't exist in production database"
  echo "   - Account has been archived"
fi

echo ""
echo "========================================"
echo "✅ Simulation complete!"
