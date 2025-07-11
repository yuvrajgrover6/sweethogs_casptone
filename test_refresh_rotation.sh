#!/bin/bash

# Test script to verify refresh token rotation and security
# This script tests that refresh tokens are properly rotated and invalidated after use

BASE_URL="http://localhost:3000"
EMAIL="test_rotation_$(date +%s)@example.com"
PASSWORD="TestPassword123!"

echo "🧪 Testing Refresh Token Rotation and Security"
echo "=============================================="

# Cleanup: Delete test user if exists (optional, may fail if user doesn't exist)
echo "🧹 Cleaning up any existing test user..."

# Step 1: Register a new user
echo ""
echo "1️⃣ Registering new user..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"firstName\": \"Test\",
    \"lastName\": \"User\"
  }")

echo "Registration response: $REGISTER_RESPONSE"

# Extract tokens from registration
ACCESS_TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
REFRESH_TOKEN_1=$(echo $REGISTER_RESPONSE | grep -o '"refreshToken":"[^"]*"' | cut -d'"' -f4)

echo "✅ Initial Access Token: ${ACCESS_TOKEN:0:20}..."
echo "✅ Initial Refresh Token: ${REFRESH_TOKEN_1:0:20}..."

# Step 2: Use the refresh token to get new tokens
echo ""
echo "2️⃣ Using refresh token to get new tokens (first refresh)..."
REFRESH_RESPONSE_1=$(curl -s -X POST "$BASE_URL/auth/refresh" \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN_1\"}")

echo "First refresh response: $REFRESH_RESPONSE_1"

# Extract new tokens
NEW_ACCESS_TOKEN=$(echo $REFRESH_RESPONSE_1 | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
REFRESH_TOKEN_2=$(echo $REFRESH_RESPONSE_1 | grep -o '"refreshToken":"[^"]*"' | cut -d'"' -f4)

echo "✅ New Access Token: ${NEW_ACCESS_TOKEN:0:20}..."
echo "✅ New Refresh Token: ${REFRESH_TOKEN_2:0:20}..."

# Step 3: Try to use the OLD refresh token again (should fail)
echo ""
echo "3️⃣ Attempting to use the OLD refresh token again (should fail)..."
OLD_REFRESH_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/refresh" \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN_1\"}")

echo "Old refresh token response: $OLD_REFRESH_RESPONSE"

# Check if it contains an error (should be an error response)
if echo "$OLD_REFRESH_RESPONSE" | grep -q "error\|Error" || [ $(echo "$OLD_REFRESH_RESPONSE" | grep -c "accessToken") -eq 0 ]; then
    echo "✅ PASS: Old refresh token was correctly rejected"
else
    echo "❌ FAIL: Old refresh token was not rejected - SECURITY ISSUE!"
    echo "Response was: $OLD_REFRESH_RESPONSE"
fi

# Step 4: Use the NEW refresh token (should work)
echo ""
echo "4️⃣ Using the NEW refresh token (should work)..."
REFRESH_RESPONSE_2=$(curl -s -X POST "$BASE_URL/auth/refresh" \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN_2\"}")

echo "Second refresh response: $REFRESH_RESPONSE_2"

# Extract tokens from second refresh
REFRESH_TOKEN_3=$(echo $REFRESH_RESPONSE_2 | grep -o '"refreshToken":"[^"]*"' | cut -d'"' -f4)

if [ ! -z "$REFRESH_TOKEN_3" ]; then
    echo "✅ PASS: New refresh token worked correctly"
    echo "✅ Third Refresh Token: ${REFRESH_TOKEN_3:0:20}..."
else
    echo "❌ FAIL: New refresh token did not work"
fi

# Step 5: Try using the second refresh token again (should fail)
echo ""
echo "5️⃣ Attempting to use the second refresh token again (should fail)..."
SECOND_OLD_REFRESH_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/refresh" \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN_2\"}")

echo "Second old refresh token response: $SECOND_OLD_REFRESH_RESPONSE"

if echo "$SECOND_OLD_REFRESH_RESPONSE" | grep -q "error\|Error" || [ $(echo "$SECOND_OLD_REFRESH_RESPONSE" | grep -c "accessToken") -eq 0 ]; then
    echo "✅ PASS: Second refresh token was correctly invalidated after use"
else
    echo "❌ FAIL: Second refresh token was not invalidated - SECURITY ISSUE!"
    echo "Response was: $SECOND_OLD_REFRESH_RESPONSE"
fi

# Step 6: Test logout with current refresh token
echo ""
echo "6️⃣ Testing logout with current refresh token..."
LOGOUT_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/logout" \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN_3\"}")

echo "Logout response: $LOGOUT_RESPONSE"

# Step 7: Try using refresh token after logout (should fail)
echo ""
echo "7️⃣ Attempting to use refresh token after logout (should fail)..."
POST_LOGOUT_REFRESH_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/refresh" \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN_3\"}")

echo "Post-logout refresh response: $POST_LOGOUT_REFRESH_RESPONSE"

if echo "$POST_LOGOUT_REFRESH_RESPONSE" | grep -q "error\|Error" || [ $(echo "$POST_LOGOUT_REFRESH_RESPONSE" | grep -c "accessToken") -eq 0 ]; then
    echo "✅ PASS: Refresh token was correctly invalidated after logout"
else
    echo "❌ FAIL: Refresh token still works after logout - SECURITY ISSUE!"
    echo "Response was: $POST_LOGOUT_REFRESH_RESPONSE"
fi

echo ""
echo "🎯 Test Summary:"
echo "=================="
echo "✅ Refresh token rotation: Tokens should be invalidated after use"
echo "✅ Security validation: Old tokens should be rejected"
echo "✅ Logout validation: Tokens should be invalidated after logout"
echo ""
echo "If all tests show PASS, the refresh token rotation is working correctly!"
echo "If any tests show FAIL, there are security issues that need to be fixed."
