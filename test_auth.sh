#!/usr/bin/env bash

# Authentication API Test Script
# This script tests all the authentication endpoints

BASE_URL="http://localhost:3000"

echo "🚀 Testing Authentication API"
echo "=============================="

# Test 1: Register a new user
echo "1️⃣  Testing User Registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "role": "user"
  }')

echo "Register Response: $REGISTER_RESPONSE"

# Extract tokens from register response (assuming jq is available)
if command -v jq &> /dev/null; then
  ACCESS_TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.body.accessToken')
  REFRESH_TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.body.refreshToken')
else
  echo "⚠️  jq not installed - manual token extraction needed"
  echo "Response: $REGISTER_RESPONSE"
  echo ""
  echo "Please extract the tokens manually and update the script"
  exit 1
fi

echo "✅ Registration successful"
echo ""

# Test 2: Login with the same user
echo "2️⃣  Testing User Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }')

echo "Login Response: $LOGIN_RESPONSE"
echo "✅ Login successful"
echo ""

# Test 3: Get user profile
echo "3️⃣  Testing Get Profile..."
PROFILE_RESPONSE=$(curl -s -X GET "$BASE_URL/auth/profile" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "Profile Response: $PROFILE_RESPONSE"
echo "✅ Profile retrieval successful"
echo ""

# Test 4: Refresh token
echo "4️⃣  Testing Token Refresh..."
REFRESH_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/refresh" \
  -H "Content-Type: application/json" \
  -d "{
    \"refreshToken\": \"$REFRESH_TOKEN\"
  }")

echo "Refresh Response: $REFRESH_RESPONSE"

# Extract new tokens
NEW_ACCESS_TOKEN=$(echo "$REFRESH_RESPONSE" | jq -r '.body.accessToken')
NEW_REFRESH_TOKEN=$(echo "$REFRESH_RESPONSE" | jq -r '.body.refreshToken')

echo "✅ Token refresh successful"
echo ""

# Test 5: Test protected route with new token
echo "5️⃣  Testing Protected Route with New Token..."
PROTECTED_RESPONSE=$(curl -s -X GET "$BASE_URL/auth/profile" \
  -H "Authorization: Bearer $NEW_ACCESS_TOKEN")

echo "Protected Route Response: $PROTECTED_RESPONSE"
echo "✅ Protected route access successful"
echo ""

# Test 6: Logout
echo "6️⃣  Testing Logout..."
LOGOUT_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/logout" \
  -H "Content-Type: application/json" \
  -d "{
    \"refreshToken\": \"$NEW_REFRESH_TOKEN\"
  }")

echo "Logout Response: $LOGOUT_RESPONSE"
echo "✅ Logout successful"
echo ""

# Test 7: Try to use refresh token after logout (should fail)
echo "7️⃣  Testing Refresh Token After Logout (should fail)..."
FAILED_REFRESH_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/refresh" \
  -H "Content-Type: application/json" \
  -d "{
    \"refreshToken\": \"$NEW_REFRESH_TOKEN\"
  }")

echo "Failed Refresh Response: $FAILED_REFRESH_RESPONSE"
echo "✅ Refresh token correctly invalidated"
echo ""

echo "🎉 All tests completed!"
echo "=============================="
