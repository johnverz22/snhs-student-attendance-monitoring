#!/bin/bash

API_URL="https://snhs-student-attendance-monitoring.vercel.app/api"
STUDENT_EMAIL="john@gmail.com"
STUDENT_PASSWORD="Password1"

echo "🕐 Checking Attendance Log Times"
echo "================================="
echo ""

echo "Current PH Time: $(TZ='Asia/Manila' date +"%Y-%m-%d %H:%M:%S %Z")"
echo "Current UTC Time: $(date -u +"%Y-%m-%d %H:%M:%S %Z")"
echo ""

echo "Logging in as student..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/student/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$STUDENT_EMAIL\",\"password\":\"$STUDENT_PASSWORD\"}")

if echo "$LOGIN_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
  TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.accessToken')
  echo "✅ Login successful"
  echo ""
  
  echo "Fetching attendance history..."
  HISTORY_RESPONSE=$(curl -s -X GET "$API_URL/student/attendance/history?limit=5" \
    -H "Authorization: Bearer $TOKEN")
  
  echo "$HISTORY_RESPONSE" | jq '.'
  
  if echo "$HISTORY_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    echo ""
    echo "📊 Recent Attendance Logs:"
    echo "$HISTORY_RESPONSE" | jq -r '.data[] | "   - \(.entry_time) at \(.gate_name)"'
    
    # Get the most recent entry time
    LATEST_TIME=$(echo "$HISTORY_RESPONSE" | jq -r '.data[0].entry_time')
    
    if [ "$LATEST_TIME" != "null" ]; then
      echo ""
      echo "🕐 Latest Entry Analysis:"
      echo "   Stored Time: $LATEST_TIME"
      
      # Convert to readable format
      if command -v node &> /dev/null; then
        echo "   As PH Time: $(node -e "console.log(new Date('$LATEST_TIME').toLocaleString('en-PH', {timeZone: 'Asia/Manila'}))")"
        echo "   As UTC: $(node -e "console.log(new Date('$LATEST_TIME').toUTCString())")"
      fi
    fi
  fi
else
  echo "❌ Login failed"
fi
