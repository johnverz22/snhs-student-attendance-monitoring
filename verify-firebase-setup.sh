#!/bin/bash

API_URL="https://snhs-student-attendance-monitoring.vercel.app/api"
PARENT_EMAIL="parent@gmail.com"
PARENT_PASSWORD="Password1"
STUDENT_ID="1001"

echo "🔥 Firebase Push Notification Setup Verification"
echo "=================================================="
echo ""

# Step 1: Check if parent account exists and is linked
echo "1️⃣ Checking Parent Account Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Try to login as parent
echo "Attempting parent login..."
PARENT_LOGIN=$(curl -s -X POST "$API_URL/auth/parent/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$PARENT_EMAIL\",\"password\":\"$PARENT_PASSWORD\"}")

if echo "$PARENT_LOGIN" | jq -e '.success' > /dev/null 2>&1; then
  echo "✅ Parent account exists and login works"
  
  PARENT_TOKEN=$(echo "$PARENT_LOGIN" | jq -r '.data.accessToken')
  PARENT_ID=$(echo "$PARENT_LOGIN" | jq -r '.data.parent.id')
  LINKED_STUDENTS=$(echo "$PARENT_LOGIN" | jq -r '.data.linkedStudents | length')
  
  echo "   - Parent ID: $PARENT_ID"
  echo "   - Linked Students: $LINKED_STUDENTS"
  
  if [ "$LINKED_STUDENTS" -gt 0 ]; then
    echo "   - Student IDs: $(echo "$PARENT_LOGIN" | jq -r '.data.linkedStudents[].student_id' | tr '\n' ', ' | sed 's/,$//')"
    echo ""
    echo "✅ Parent is linked to student(s)"
  else
    echo ""
    echo "❌ Parent is NOT linked to any students"
    echo "   This is why you're not getting notifications!"
    echo ""
    echo "🔧 Fix: Link parent to student $STUDENT_ID"
    exit 1
  fi
else
  echo "❌ Parent account doesn't exist or login failed"
  echo ""
  echo "Response:"
  echo "$PARENT_LOGIN" | jq '.'
  echo ""
  echo "🔧 Fix: Create parent account first"
  echo "   See PUSH_NOTIFICATION_SETUP.md for instructions"
  exit 1
fi

# Step 2: Check if FCM token is registered
echo ""
echo "2️⃣ Checking FCM Device Token Registration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Note: We can't directly query push_tokens table via API
# But we can check if the endpoint exists
echo "Testing device token registration endpoint..."
TEST_TOKEN="test_fcm_token_$(date +%s)"

TOKEN_TEST=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$API_URL/parent/device-token" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PARENT_TOKEN" \
  -d "{\"deviceToken\":\"$TEST_TOKEN\",\"platform\":\"android\"}")

HTTP_STATUS=$(echo "$TOKEN_TEST" | grep "HTTP_STATUS" | cut -d: -f2)
RESPONSE_BODY=$(echo "$TOKEN_TEST" | sed '/HTTP_STATUS/d')

if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "201" ]; then
  echo "✅ Device token registration endpoint works"
  echo ""
  echo "Response:"
  echo "$RESPONSE_BODY" | jq '.'
  echo ""
  echo "⚠️  However, you need to register a REAL FCM token from your mobile app"
  echo "   Test token registered: $TEST_TOKEN"
else
  echo "❌ Device token registration failed"
  echo "   HTTP Status: $HTTP_STATUS"
  echo ""
  echo "Response:"
  echo "$RESPONSE_BODY" | jq '.'
fi

# Step 3: Check Firebase configuration on Vercel
echo ""
echo "3️⃣ Checking Firebase Backend Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# We can't directly check environment variables, but we can infer from logs
echo "Checking if Firebase is initialized on backend..."
echo "(This requires checking Vercel function logs)"
echo ""

# Try to trigger a notification to see if Firebase is configured
echo "Attempting to trigger notification system..."
echo "(Scanning QR code to test notification flow)"
echo ""

# Login as student
STUDENT_LOGIN=$(curl -s -X POST "$API_URL/auth/student/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"john@gmail.com","password":"Password1"}')

if echo "$STUDENT_LOGIN" | jq -e '.success' > /dev/null 2>&1; then
  STUDENT_TOKEN=$(echo "$STUDENT_LOGIN" | jq -r '.data.accessToken')
  
  # Scan QR code
  SCAN_RESULT=$(curl -s -X POST "$API_URL/student/attendance/scan" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $STUDENT_TOKEN" \
    -d '{"qrCode":"Gate 1","latitude":16.661407,"longitude":120.328302}')
  
  if echo "$SCAN_RESULT" | jq -e '.success' > /dev/null 2>&1; then
    echo "✅ Attendance logged successfully"
    echo ""
    echo "📊 Attendance Details:"
    echo "$SCAN_RESULT" | jq '.data'
    echo ""
    echo "⏳ Notification should be sent in background..."
    echo "   (Check Vercel logs to see if Firebase was called)"
  else
    echo "⚠️  Attendance scan failed or duplicate"
    echo "$SCAN_RESULT" | jq '.'
  fi
fi

# Step 4: Provide diagnostic information
echo ""
echo "4️⃣ Diagnostic Checklist"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cat << 'EOF'
To verify Firebase is properly configured on Vercel:

✅ Backend Configuration (Vercel Dashboard):
   1. Go to: https://vercel.com/dashboard
   2. Select your project: snhs-student-attendance-monitoring
   3. Go to Settings → Environment Variables
   4. Check if FIREBASE_SERVICE_ACCOUNT exists
   5. Value should be a JSON string with Firebase credentials

   Example format:
   {
     "type": "service_account",
     "project_id": "your-project-id",
     "private_key_id": "...",
     "private_key": "-----BEGIN PRIVATE KEY-----\n...",
     "client_email": "firebase-adminsdk-...@your-project.iam.gserviceaccount.com",
     "client_id": "...",
     "auth_uri": "https://accounts.google.com/o/oauth2/auth",
     "token_uri": "https://oauth2.googleapis.com/token",
     "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
     "client_x509_cert_url": "..."
   }

✅ Check Vercel Function Logs:
   1. Go to Vercel Dashboard → Your Project
   2. Click "Logs" tab
   3. Look for these messages after QR scan:
      - "Firebase Admin SDK initialized successfully" ✅
      - "Push notification sent successfully" ✅
      - "Attendance notifications: X sent, Y failed" ✅
   
   If you see:
      - "Firebase not initialized, skipping notification" ❌
      - "Firebase service account not configured" ❌
      → Firebase env var is missing or invalid

✅ Mobile App Configuration:
   1. Parent app must have Firebase SDK integrated
   2. Parent must login to app (triggers FCM token registration)
   3. App must have notification permissions granted
   4. FCM token must be registered with backend

✅ Database Verification:
   Run this query on your PostgreSQL database:
   
   -- Check if parent is linked to student
   SELECT * FROM parent_student_links WHERE student_id = 1;
   
   -- Check if FCM token is registered
   SELECT * FROM push_tokens WHERE parent_id = [PARENT_ID] AND is_active = true;

✅ Test Notification Flow:
   1. Parent logs into mobile app
   2. App registers FCM token with backend
   3. Student scans QR code
   4. Backend logs attendance
   5. Backend queries parent_student_links
   6. Backend gets FCM tokens from push_tokens
   7. Backend sends notification via Firebase
   8. Parent receives notification

EOF

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Parent Account: $(echo "$PARENT_LOGIN" | jq -r 'if .success then "✅ Exists" else "❌ Missing" end')"
echo "Parent Linked to Student: $(if [ "$LINKED_STUDENTS" -gt 0 ]; then echo "✅ Yes"; else echo "❌ No"; fi)"
echo "Device Token Endpoint: $(if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "201" ]; then echo "✅ Working"; else echo "❌ Failed"; fi)"
echo ""
echo "🔍 Next Steps:"
echo ""
echo "1. Check Vercel environment variables for FIREBASE_SERVICE_ACCOUNT"
echo "2. Check Vercel function logs for Firebase initialization messages"
echo "3. Ensure parent app has registered FCM token"
echo "4. Test by scanning QR code and checking logs"
echo ""
echo "📖 For detailed setup instructions, see:"
echo "   - PUSH_NOTIFICATION_SETUP.md"
echo "   - PUSH_NOTIFICATION_SIMULATION.md"
echo ""
EOF
chmod +x verify-firebase-setup.sh
./verify-firebase-setup.sh
