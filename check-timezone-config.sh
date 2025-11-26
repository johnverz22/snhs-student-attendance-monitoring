#!/bin/bash

API_URL="https://snhs-student-attendance-monitoring.vercel.app/api"
ADMIN_USER="admin"
ADMIN_PASS="gogoSNHS123"

echo "🕐 Checking Timezone Configuration"
echo "==================================="
echo ""

# Wait for rate limit to clear
echo "Waiting 30 seconds for rate limit..."
sleep 30

echo "Logging in as admin..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/admin/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$ADMIN_USER\",\"password\":\"$ADMIN_PASS\"}")

if echo "$LOGIN_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
  TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.accessToken')
  echo "✅ Login successful"
  echo ""
  
  echo "Fetching school config..."
  CONFIG_RESPONSE=$(curl -s -X GET "$API_URL/admin/school/config" \
    -H "Authorization: Bearer $TOKEN")
  
  echo "$CONFIG_RESPONSE" | jq '.'
  
  if echo "$CONFIG_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    TIMEZONE=$(echo "$CONFIG_RESPONSE" | jq -r '.data.timezone')
    SCHOOL_NAME=$(echo "$CONFIG_RESPONSE" | jq -r '.data.schoolName')
    
    echo ""
    echo "📊 Current Configuration:"
    echo "   School: $SCHOOL_NAME"
    echo "   Timezone: $TIMEZONE"
    echo ""
    
    if [ "$TIMEZONE" = "Asia/Manila" ]; then
      echo "✅ Timezone is correctly set to Asia/Manila (UTC+8)"
    else
      echo "⚠️  Timezone is NOT set to Asia/Manila"
      echo "   Current: $TIMEZONE"
      echo "   Expected: Asia/Manila"
    fi
  fi
else
  echo "❌ Login failed"
  echo "$LOGIN_RESPONSE" | jq '.'
fi

echo ""
echo "🕐 Current Times:"
echo "   UTC Time: $(date -u +"%Y-%m-%d %H:%M:%S")"
echo "   PH Time (UTC+8): $(TZ='Asia/Manila' date +"%Y-%m-%d %H:%M:%S")"
