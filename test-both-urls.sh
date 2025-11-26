#!/bin/bash

echo "🔍 Testing Both API URLs"
echo "========================"
echo ""

# URL from mobile app config
MOBILE_URL="https://snhs-student-attendance-monitoring-glw2kktxl.vercel.app/api"
# URL we tested successfully
WORKING_URL="https://snhs-student-attendance-monitoring.vercel.app/api"

STUDENT_EMAIL="john@gmail.com"
STUDENT_PASSWORD="Password1"
QR_CODE="Gate 1"
LATITUDE="16.661407"
LONGITUDE="120.328302"

echo "1️⃣ Testing Mobile App URL: $MOBILE_URL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test login
echo "Testing login..."
LOGIN_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$MOBILE_URL/auth/student/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$STUDENT_EMAIL\",\"password\":\"$STUDENT_PASSWORD\"}" 2>&1)

HTTP_STATUS=$(echo "$LOGIN_RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
RESPONSE_BODY=$(echo "$LOGIN_RESPONSE" | sed '/HTTP_STATUS/d')

echo "HTTP Status: $HTTP_STATUS"
echo "Response:"
echo "$RESPONSE_BODY" | jq '.' 2>/dev/null || echo "$RESPONSE_BODY"

if [ "$HTTP_STATUS" = "200" ]; then
  echo "✅ Mobile URL is working!"
  TOKEN=$(echo "$RESPONSE_BODY" | jq -r '.data.accessToken' 2>/dev/null)
  
  if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
    echo ""
    echo "Testing attendance scan..."
    SCAN_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$MOBILE_URL/student/attendance/scan" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d "{\"qrCode\":\"$QR_CODE\",\"latitude\":$LATITUDE,\"longitude\":$LONGITUDE}" 2>&1)
    
    SCAN_STATUS=$(echo "$SCAN_RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
    SCAN_BODY=$(echo "$SCAN_RESPONSE" | sed '/HTTP_STATUS/d')
    
    echo "HTTP Status: $SCAN_STATUS"
    echo "Response:"
    echo "$SCAN_BODY" | jq '.' 2>/dev/null || echo "$SCAN_BODY"
  fi
else
  echo "❌ Mobile URL failed!"
fi

echo ""
echo ""
echo "2️⃣ Testing Working URL: $WORKING_URL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test login
echo "Testing login..."
LOGIN_RESPONSE2=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$WORKING_URL/auth/student/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$STUDENT_EMAIL\",\"password\":\"$STUDENT_PASSWORD\"}" 2>&1)

HTTP_STATUS2=$(echo "$LOGIN_RESPONSE2" | grep "HTTP_STATUS" | cut -d: -f2)
RESPONSE_BODY2=$(echo "$LOGIN_RESPONSE2" | sed '/HTTP_STATUS/d')

echo "HTTP Status: $HTTP_STATUS2"
echo "Response:"
echo "$RESPONSE_BODY2" | jq '.' 2>/dev/null || echo "$RESPONSE_BODY2"

if [ "$HTTP_STATUS2" = "200" ]; then
  echo "✅ Working URL is still working!"
else
  echo "❌ Working URL also failed!"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Summary:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Mobile App URL: $MOBILE_URL"
echo "Status: $HTTP_STATUS"
echo ""
echo "Working URL: $WORKING_URL"
echo "Status: $HTTP_STATUS2"
echo ""

if [ "$HTTP_STATUS" != "200" ] && [ "$HTTP_STATUS2" = "200" ]; then
  echo "⚠️  ISSUE FOUND: Mobile app is using wrong URL!"
  echo ""
  echo "🔧 FIX: Update student_app/lib/config/api_config.dart"
  echo ""
  echo "Change from:"
  echo "  static const String baseUrl = '$MOBILE_URL';"
  echo ""
  echo "Change to:"
  echo "  static const String baseUrl = '$WORKING_URL';"
fi
