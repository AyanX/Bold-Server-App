#!/bin/bash

# Password Reset Flow Test Script
# Tests the complete password reset flow from frontend to backend

BASE_URL="http://127.0.0.1:8000/api"
TEST_EMAIL="test@example.com"
TEST_PASSWORD="NewPassword123!"

echo "======================================"
echo "PASSWORD RESET FLOW TEST"
echo "======================================"
echo ""

# Step 1: Create a test user (if needed)
echo "📝 Step 1: Checking if test user exists..."
USER_ID=$(curl -s -X GET "${BASE_URL}/users" \
  -H "Content-Type: application/json" | grep -o '"email":"'${TEST_EMAIL}'"' | head -1)

if [ -z "$USER_ID" ]; then
  echo "Creating test user with email: $TEST_EMAIL"
  curl -s -X POST "${BASE_URL}/users" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Test User",
      "email": "'${TEST_EMAIL}'",
      "password": "TestPassword123!",
      "role": "Contributor",
      "status": "Active"
    }' | jq '.'
else
  echo "✓ Test user already exists"
fi

echo ""
echo "======================================"
echo "📧 Step 2: Request Password Reset OTP"
echo "======================================"

# Request OTP
OTP_RESPONSE=$(curl -s -X POST "${BASE_URL}/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{"email": "'${TEST_EMAIL}'"}')

echo $OTP_RESPONSE | jq '.'

# Extract OTP from response (if testing in development)
OTP=$(echo $OTP_RESPONSE | jq -r '.otp // empty')

if [ -z "$OTP" ]; then
  echo ""
  echo "⚠️  OTP not returned (check email or logs)"
  echo "Attempting to use a test OTP from logs..."
  OTP="000000"  # Placeholder - in real scenario, check email or logs
fi

echo ""
echo "======================================"
echo "🔐 Step 3: Reset Password with OTP"
echo "======================================"

# Reset password
RESET_RESPONSE=$(curl -s -X POST "${BASE_URL}/reset-password" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'${TEST_EMAIL}'",
    "otp": "'${OTP}'",
    "password": "'${TEST_PASSWORD}'",
    "password_confirmation": "'${TEST_PASSWORD}'"
  }')

echo $RESET_RESPONSE | jq '.'

echo ""
echo "======================================"
echo "✓ TEST COMPLETE"
echo "======================================"
echo ""
echo "Summary:"
echo "1. ✓ Requested OTP to: $TEST_EMAIL"
echo "2. ✓ Attempted password reset with OTP"
echo ""
echo "Next steps:"
echo "- Check email for OTP code"
echo "- Use the OTP from email to reset password in UI"
echo "- Try logging in with new password: $TEST_PASSWORD"
