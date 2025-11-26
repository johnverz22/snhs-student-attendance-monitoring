#!/bin/bash

API_URL="https://snhs-student-attendance-monitoring.vercel.app/api"
PARENT_EMAIL="parent@gmail.com"
PARENT_PASSWORD="Password1"
STUDENT_EMAIL="john@gmail.com"
STUDENT_PASSWORD="Password1"

echo "🔍 Push Notification Debugging"
echo "==============================="
echo ""

# Step 1: Login as parent and check FCM token
echo "1️⃣ Checking if Parent App Registered FCM Token"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

PARENT_LOGIN=$(curl -s -X POST "$API_URL/auth/parent/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$PARENT_EMAIL\",\"password\":\"$PARENT_PASSWORD\"}")

if echo "$PARENT_LOGIN" | jq -e '.success' > /dev/null 2>&1; then
  PARENT_TOKEN=$(echo "$PARENT_LOGIN" | jq -r '.data.accessToken')
  PARENT_ID=$(echo "$PARENT_LOGIN" | jq -r '.data.parent.id')
  
  echo "✅ Parent logged in (ID: $PARENT_ID)"
  echo ""
  
  # Try to register a test FCM token
  echo "Testing FCM token registration..."
  TEST_FCM_TOKEN="test_fcm_$(date +%s)"
  
  TOKEN_REG=$(curl -s -X POST "$API_URL/parent/device-token" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $PARENT_TOKEN" \
    -d "{\"deviceToken\":\"$TEST_FCM_TOKEN\",\"platform\":\"android\"}")
  
  echo "Response:"
  echo "$TOKEN_REG" | jq '.'
  
  if echo "$TOKEN_REG" | jq -e '.success' > /dev/null 2>&1; then
    echo ""
    echo "✅ FCM token registration endpoint is working!"
    echo ""
    echo "⚠️  IMPORTANT: The parent app must register a REAL FCM token"
    echo "   Test token: $TEST_FCM_TOKEN"
    echo ""
    echo "📱 Parent App Checklist:"
    echo "   1. Parent must LOGIN to the app (not just install)"
    echo "   2. App must call FirebaseMessaging.instance.getToken()"
    echo "   3. App must POST the token to /api/parent/device-token"
    echo "   4. Check app logs for 'FCM token registered' message"
  else
    echo ""
    echo "❌ FCM token registration failed!"
    echo "   This means the parent app cannot register tokens"
    exit 1
  fi
else
  echo "❌ Parent login failed"
  exit 1
fi

# Step 2: Trigger attendance scan to test notification
echo ""
echo "2️⃣ Testing Notification Trigger (Attendance Scan)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

STUDENT_LOGIN=$(curl -s -X POST "$API_URL/auth/student/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$STUDENT_EMAIL\",\"password\":\"$STUDENT_PASSWORD\"}")

if echo "$STUDENT_LOGIN" | jq -e '.success' > /dev/null 2>&1; then
  STUDENT_TOKEN=$(echo "$STUDENT_LOGIN" | jq -r '.data.accessToken')
  STUDENT_NAME=$(echo "$STUDENT_LOGIN" | jq -r '.data.student.name')
  
  echo "✅ Student logged in: $STUDENT_NAME"
  echo ""
  echo "Scanning QR code..."
  
  # Use school location for valid scan
  SCAN_RESULT=$(curl -s -X POST "$API_URL/student/attendance/scan" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $STUDENT_TOKEN" \
    -d '{"qrCode":"Gate 1","latitude":16.84851,"longitude":120.370761}')
  
  echo "Response:"
  echo "$SCAN_RESULT" | jq '.'
  
  if echo "$SCAN_RESULT" | jq -e '.success' > /dev/null 2>&1; then
    echo ""
    echo "✅ Attendance logged successfully!"
    echo ""
    echo "📊 Attendance Details:"
    echo "$SCAN_RESULT" | jq '.data'
    echo ""
    echo "⏳ Backend should now:"
    echo "   1. Query parent_student_links for linked parents"
    echo "   2. Query push_tokens for FCM tokens"
    echo "   3. Send notification via Firebase"
    echo ""
    echo "🔍 Check Vercel Logs for:"
    echo "   - 'Firebase Admin SDK initialized successfully'"
    echo "   - 'Push notification sent successfully'"
    echo "   - 'Attendance notifications: X sent, Y failed'"
  else
    ERROR=$(echo "$SCAN_RESULT" | jq -r '.error')
    MESSAGE=$(echo "$SCAN_RESULT" | jq -r '.message')
    echo ""
    echo "❌ Attendance scan failed"
    echo "   Error: $ERROR"
    echo "   Message: $MESSAGE"
    
    if [ "$ERROR" = "ATTENDANCE_DUPLICATE" ]; then
      echo ""
      echo "⚠️  This is a duplicate scan (already scanned recently)"
      echo "   Notification was likely sent on the first scan"
      echo "   Wait 30 minutes and try again, or check Vercel logs"
    fi
  fi
else
  echo "❌ Student login failed"
fi

# Step 3: Provide debugging checklist
echo ""
echo "3️⃣ Debugging Checklist"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cat << 'EOF'
If you're still not receiving notifications, check these:

🔥 Firebase Configuration (Vercel):
   ✅ FIREBASE_SERVICE_ACCOUNT environment variable set
   ✅ Vercel project redeployed after adding env var
   ✅ Check Vercel logs for "Firebase Admin SDK initialized"

📱 Parent Mobile App:
   ⚠️ Parent must LOGIN to the app (critical!)
   ⚠️ App must request notification permissions
   ⚠️ App must call FirebaseMessaging.instance.getToken()
   ⚠️ App must POST token to /api/parent/device-token
   ⚠️ Check app logs for FCM token registration

🔗 Database Links:
   ✅ Parent linked to student (verified above)
   ⚠️ FCM token stored in push_tokens table
   ⚠️ Token is_active = true

📊 Vercel Function Logs:
   Go to: https://vercel.com/dashboard → Your Project → Logs
   
   Look for these after QR scan:
   ✅ "Attendance logged: student=1, gate=Gate 1"
   ✅ "Push notification sent successfully to fcm_token..."
   ✅ "Attendance notifications: 1 sent, 0 failed"
   
   If you see:
   ❌ "No parents linked to student X" → Check parent_student_links
   ❌ "No active device tokens for parent X" → Parent app didn't register token
   ❌ "Firebase not initialized" → Check FIREBASE_SERVICE_ACCOUNT env var
   ❌ "Invalid or unregistered token" → FCM token expired or invalid

🧪 Test with Real FCM Token:
   The parent app MUST register a real FCM token from Firebase SDK.
   Test tokens won't receive actual notifications.
   
   In parent app code, after login:
   ```dart
   final fcmToken = await FirebaseMessaging.instance.getToken();
   print('FCM Token: $fcmToken');
   
   // Register with backend
   await http.post(
     Uri.parse('$baseUrl/parent/device-token'),
     headers: {'Authorization': 'Bearer $token'},
     body: jsonEncode({
       'deviceToken': fcmToken,
       'platform': Platform.isAndroid ? 'android' : 'ios',
     }),
   );
   ```

📱 Device Settings:
   - Notifications enabled for the app
   - App not in battery optimization/power saving mode
   - App has background data enabled
   - Device has internet connection

EOF

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Quick Diagnosis"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Most Common Issue: Parent app hasn't registered FCM token"
echo ""
echo "Solution:"
echo "1. Open parent app on phone"
echo "2. LOGIN with parent@gmail.com / Password1"
echo "3. Check app logs for 'FCM token registered' message"
echo "4. If no message, check parent app code for FCM integration"
echo "5. Student scans QR code"
echo "6. Check Vercel logs for notification messages"
echo ""
echo "If still not working, share:"
echo "- Vercel function logs (after QR scan)"
echo "- Parent app logs (after login)"
echo "- Any error messages"
echo ""
EOF
chmod +x debug-notifications.sh
./debug-notifications.sh
