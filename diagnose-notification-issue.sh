#!/bin/bash

API_URL="https://snhs-student-attendance-monitoring.vercel.app/api"
PARENT_EMAIL="parent@gmail.com"
PARENT_PASSWORD="Password1"

echo "🔍 Diagnosing Push Notification Issue"
echo "======================================"
echo ""

# Wait for rate limit
echo "⏳ Waiting 30 seconds for rate limit..."
sleep 30

# Step 1: Login as parent
echo "1️⃣ Testing Parent Login & Token Registration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

PARENT_LOGIN=$(curl -s -X POST "$API_URL/auth/parent/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$PARENT_EMAIL\",\"password\":\"$PARENT_PASSWORD\"}")

if ! echo "$PARENT_LOGIN" | jq -e '.success' > /dev/null 2>&1; then
  echo "❌ Parent login failed"
  echo "$PARENT_LOGIN" | jq '.'
  exit 1
fi

PARENT_TOKEN=$(echo "$PARENT_LOGIN" | jq -r '.data.accessToken')
echo "✅ Parent logged in successfully"
echo ""

# Step 2: Try to register a test FCM token
echo "2️⃣ Testing Device Token Registration (with fix)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

TEST_TOKEN="test_fcm_token_$(date +%s)"
echo "Registering test token: $TEST_TOKEN"
echo ""

TOKEN_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$API_URL/parent/device-token" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PARENT_TOKEN" \
  -d "{\"deviceToken\":\"$TEST_TOKEN\",\"platform\":\"android\"}")

HTTP_STATUS=$(echo "$TOKEN_RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
RESPONSE_BODY=$(echo "$TOKEN_RESPONSE" | sed '/HTTP_STATUS/d')

echo "HTTP Status: $HTTP_STATUS"
echo "Response:"
echo "$RESPONSE_BODY" | jq '.'
echo ""

if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "201" ]; then
  echo "✅ Device token registration is WORKING!"
  echo "   The PostgreSQL fix has been deployed successfully."
else
  echo "❌ Device token registration still FAILING"
  echo "   The fix may not be deployed yet."
  echo ""
  echo "🔧 Action needed: Deploy the fix to Vercel"
  exit 1
fi

# Step 3: Check what happens when student scans
echo ""
echo "3️⃣ Simulating Student QR Scan"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Login as student
STUDENT_LOGIN=$(curl -s -X POST "$API_URL/auth/student/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"john@gmail.com","password":"Password1"}')

if echo "$STUDENT_LOGIN" | jq -e '.success' > /dev/null 2>&1; then
  STUDENT_TOKEN=$(echo "$STUDENT_LOGIN" | jq -r '.data.accessToken')
  echo "✅ Student logged in"
  echo ""
  
  # Update school location to match test location
  echo "Scanning QR code..."
  SCAN_RESULT=$(curl -s -X POST "$API_URL/student/attendance/scan" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $STUDENT_TOKEN" \
    -d '{"qrCode":"Gate 1","latitude":16.848383,"longitude":120.3712134}')
  
  echo "Scan Result:"
  echo "$SCAN_RESULT" | jq '.'
  echo ""
  
  if echo "$SCAN_RESULT" | jq -e '.success' > /dev/null 2>&1; then
    echo "✅ Attendance logged successfully"
    echo ""
    echo "⏳ Backend should now:"
    echo "   1. Query parent_student_links for student 1"
    echo "   2. Find parent ID 2"
    echo "   3. Query push_tokens for parent 2"
    echo "   4. Find FCM token: $TEST_TOKEN"
    echo "   5. Call Firebase to send notification"
    echo ""
    echo "📊 Check Vercel logs to see if notification was sent"
  else
    ERROR=$(echo "$SCAN_RESULT" | jq -r '.error')
    MESSAGE=$(echo "$SCAN_RESULT" | jq -r '.message')
    echo "⚠️  Scan failed: $ERROR - $MESSAGE"
  fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 Diagnosis Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "201" ]; then
  echo "✅ Backend Fix: Deployed and working"
  echo ""
  echo "❓ Why no notification? Check these:"
  echo ""
  echo "1️⃣ Firebase Configuration on Vercel"
  echo "   Go to: https://vercel.com/dashboard"
  echo "   → Your Project → Settings → Environment Variables"
  echo "   → Check if FIREBASE_SERVICE_ACCOUNT exists"
  echo ""
  echo "   If MISSING:"
  echo "   - Get Firebase credentials from Firebase Console"
  echo "   - Add as FIREBASE_SERVICE_ACCOUNT environment variable"
  echo "   - Redeploy the project"
  echo ""
  echo "2️⃣ Check Vercel Function Logs"
  echo "   Go to: https://vercel.com/dashboard"
  echo "   → Your Project → Logs"
  echo ""
  echo "   Look for these messages:"
  echo "   ✅ 'Firebase Admin SDK initialized successfully'"
  echo "   ✅ 'Push notification sent successfully'"
  echo "   ✅ 'Attendance notifications: 1 sent, 0 failed'"
  echo ""
  echo "   If you see:"
  echo "   ❌ 'Firebase not initialized, skipping notification'"
  echo "   ❌ 'Firebase service account not configured'"
  echo "   → Firebase env var is missing or invalid"
  echo ""
  echo "3️⃣ Parent App Must Register REAL FCM Token"
  echo "   - Test token ($TEST_TOKEN) won't receive notifications"
  echo "   - Parent must login to mobile app"
  echo "   - App will get real FCM token from Firebase SDK"
  echo "   - App will register it with backend"
  echo "   - Only then will notifications work"
  echo ""
else
  echo "❌ Backend Fix: NOT deployed yet"
  echo ""
  echo "🔧 Deploy the fix:"
  echo "   git add src/services/notificationService.js"
  echo "   git commit -m 'Fix: PostgreSQL syntax for push notifications'"
  echo "   git push"
  echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
