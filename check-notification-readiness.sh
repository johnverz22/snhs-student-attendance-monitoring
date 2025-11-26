#!/bin/bash

echo "🔍 Checking Notification System Readiness"
echo "=========================================="
echo ""

API_URL="https://snhs-student-attendance-monitoring.vercel.app/api"
ADMIN_USER="admin"
ADMIN_PASS="gogoSNHS123"

echo "⏳ Waiting 30 seconds for rate limit..."
sleep 30

echo ""
echo "1️⃣ Checking Database State"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Login as admin
ADMIN_LOGIN=$(curl -s -X POST "$API_URL/auth/admin/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$ADMIN_USER\",\"password\":\"$ADMIN_PASS\"}")

if echo "$ADMIN_LOGIN" | jq -e '.success' > /dev/null 2>&1; then
  ADMIN_TOKEN=$(echo "$ADMIN_LOGIN" | jq -r '.data.accessToken')
  echo "✅ Admin logged in"
  echo ""
  
  # Get recent attendance logs
  echo "📊 Recent Attendance Logs:"
  LOGS=$(curl -s -X GET "$API_URL/admin/attendance/logs?page=1&limit=3" \
    -H "Authorization: Bearer $ADMIN_TOKEN")
  
  echo "$LOGS" | jq '.data.logs[] | {id, student_name, entry_time, gate_name}'
  
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "📱 What Should Happen When Student Scans:"
  echo ""
  echo "1. Student scans QR code"
  echo "2. Backend logs attendance"
  echo "3. Backend calls: sendAttendanceNotification(studentId, data)"
  echo "4. Notification service queries:"
  echo "   - parent_student_links WHERE student_id = 1"
  echo "   - push_tokens WHERE parent_id = 2 AND is_active = true"
  echo "5. Sends notification via Firebase to FCM token"
  echo ""
  echo "🔍 Check Vercel Logs After Next Scan For:"
  echo ""
  echo "✅ Success Messages:"
  echo "   [timestamp] Attendance logged: student=1, gate=Gate 1"
  echo "   [timestamp] Push notification sent successfully to fcm_token..."
  echo "   [timestamp] Attendance notifications: 1 sent, 0 failed"
  echo ""
  echo "❌ Error Messages:"
  echo "   [timestamp] No parents linked to student 1"
  echo "   [timestamp] No active device tokens for parent 2"
  echo "   [timestamp] Firebase not initialized, skipping notification"
  echo "   [timestamp] Error sending push notification: ..."
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "🧪 Next Steps:"
  echo ""
  echo "1. Wait 30 minutes (duplicate scan prevention)"
  echo "2. Student scans QR code again"
  echo "3. Immediately check Vercel logs"
  echo "4. Look for notification-related messages"
  echo ""
  echo "If you see 'No active device tokens for parent 2':"
  echo "   → FCM token wasn't stored or is_active = false"
  echo "   → Check push_tokens table in database"
  echo ""
  echo "If you see 'Firebase not initialized':"
  echo "   → FIREBASE_SERVICE_ACCOUNT env var issue"
  echo "   → Check Vercel environment variables"
  echo ""
  echo "If you see 'Push notification sent successfully':"
  echo "   → Backend worked! Check:"
  echo "   → Phone notification settings"
  echo "   → App is not force-stopped"
  echo "   → FCM token is valid (not expired)"
  echo ""
else
  echo "❌ Admin login failed"
fi

echo ""
echo "=========================================="
echo ""
echo "💡 Key Points:"
echo ""
echo "✅ Firebase SDK initialized (from your logs)"
echo "✅ FCM token registered at 21:09 (from your logs)"
echo "⚠️  Missing: Notification sending logs"
echo ""
echo "Most likely issue:"
echo "The notification code ran BEFORE the FCM token was registered"
echo "(both happened at 21:09 - race condition)"
echo ""
echo "Solution:"
echo "Scan QR code again NOW (token is already registered)"
echo "This time the notification should be sent!"
echo ""
EOF
chmod +x check-notification-readiness.sh
./check-notification-readiness.sh
