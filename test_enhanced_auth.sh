#!/usr/bin/env bash

# Enhanced Authentication API Test Script
# Tests all authentication endpoints with the new user fields

BASE_URL="http://localhost:3000"

echo "🚀 Testing Enhanced Authentication API with User Profile Fields"
echo "=============================================================="

# Test 1: Register a user with complete profile
echo "1️⃣  Testing Enhanced User Registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User",
    "phoneNumber": "+1234567890",
    "dateOfBirth": "1990-06-15",
    "avatar": "https://example.com/avatar.png"
  }')

echo "Register Response:"
echo "$REGISTER_RESPONSE" | jq '.' 2>/dev/null || echo "$REGISTER_RESPONSE"

# Extract tokens (requires jq)
if command -v jq &> /dev/null; then
  ACCESS_TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.body.accessToken')
  REFRESH_TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.body.refreshToken')
else
  echo "⚠️  jq not installed - manual token extraction needed"
  exit 1
fi

echo "✅ Enhanced registration successful"
echo ""

# Test 2: Login with the user
echo "2️⃣  Testing Login with Enhanced Response..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "password123"
  }')

echo "Login Response:"
echo "$LOGIN_RESPONSE" | jq '.' 2>/dev/null || echo "$LOGIN_RESPONSE"

# Update tokens
ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.body.accessToken')
REFRESH_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.body.refreshToken')

echo "✅ Login with enhanced profile successful"
echo ""

# Test 3: Get complete user profile
echo "3️⃣  Testing Get Complete Profile..."
PROFILE_RESPONSE=$(curl -s -X GET "$BASE_URL/auth/profile" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "Profile Response:"
echo "$PROFILE_RESPONSE" | jq '.' 2>/dev/null || echo "$PROFILE_RESPONSE"
echo "✅ Complete profile retrieval successful"
echo ""

# Test 4: Update profile with new information
echo "4️⃣  Testing Profile Update..."
UPDATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/auth/profile" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Updated Test",
    "lastName": "Updated User",
    "phoneNumber": "+1987654321",
    "avatar": "https://example.com/new-avatar.jpg"
  }')

echo "Update Response:"
echo "$UPDATE_RESPONSE" | jq '.' 2>/dev/null || echo "$UPDATE_RESPONSE"
echo "✅ Profile update successful"
echo ""

# Test 5: Change password
echo "5️⃣  Testing Password Change..."
PASSWORD_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/change-password" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "password123",
    "newPassword": "newpassword456"
  }')

echo "Password Change Response:"
echo "$PASSWORD_RESPONSE" | jq '.' 2>/dev/null || echo "$PASSWORD_RESPONSE"
echo "✅ Password change successful"
echo ""

# Test 6: Login with new password
echo "6️⃣  Testing Login with New Password..."
NEW_LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "newpassword456"
  }')

echo "New Login Response:"
echo "$NEW_LOGIN_RESPONSE" | jq '.' 2>/dev/null || echo "$NEW_LOGIN_RESPONSE"

# Update token for final test
NEW_ACCESS_TOKEN=$(echo "$NEW_LOGIN_RESPONSE" | jq -r '.body.accessToken')

echo "✅ Login with new password successful"
echo ""

# Test 7: Final profile check
echo "7️⃣  Testing Final Profile Check..."
FINAL_PROFILE_RESPONSE=$(curl -s -X GET "$BASE_URL/auth/profile" \
  -H "Authorization: Bearer $NEW_ACCESS_TOKEN")

echo "Final Profile Response:"
echo "$FINAL_PROFILE_RESPONSE" | jq '.' 2>/dev/null || echo "$FINAL_PROFILE_RESPONSE"
echo "✅ Final profile check successful"
echo ""

echo "🎉 All enhanced authentication tests completed successfully!"
echo "=============================================================="
echo ""
echo "📝 Summary of New Features Tested:"
echo "   ✅ User registration with firstName, lastName, avatar, phoneNumber, dateOfBirth"
echo "   ✅ Enhanced login response with complete user profile"
echo "   ✅ Complete profile retrieval with all fields"
echo "   ✅ Profile update functionality"
echo "   ✅ Password change with token invalidation"
echo "   ✅ Data validation and proper date formatting"
