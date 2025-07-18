#!/usr/bin/env bash

# Refresh Token Test Script
echo "🧪 Testing Refresh Token Fix"
echo "============================="

BASE_URL="http://localhost:3000"

# First, register or login to get initial tokens
echo "1️⃣  Registering new user..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "refresh-test@example.com",
    "password": "password123",
    "firstName": "Refresh",
    "lastName": "Test",
    "role": "user"
  }')

echo "Register response: $REGISTER_RESPONSE"

# If registration fails (user exists), try login
if [[ "$REGISTER_RESPONSE" == *"USER_ALREADY_EXISTS"* ]]; then
  echo "User exists, attempting login..."
  LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "refresh-test@example.com",
      "password": "password123"
    }')
  
  echo "Login response: $LOGIN_RESPONSE"
  RESPONSE="$LOGIN_RESPONSE"
else
  RESPONSE="$REGISTER_RESPONSE"
fi

# Extract refresh token (simple grep approach since jq might not be available)
REFRESH_TOKEN=$(echo "$RESPONSE" | grep -o '"refreshToken":"[^"]*"' | cut -d'"' -f4)

if [ -z "$REFRESH_TOKEN" ]; then
  echo "❌ Failed to extract refresh token"
  echo "Response: $RESPONSE"
  exit 1
fi

echo "✅ Got refresh token: ${REFRESH_TOKEN:0:20}..."

# Test refresh token functionality
echo "2️⃣  Testing refresh token..."
REFRESH_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/refresh" \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}")

echo "Refresh response: $REFRESH_RESPONSE"

# Check if refresh was successful
if [[ "$REFRESH_RESPONSE" == *"REFRESH_TOKEN_NOT_FOUND"* ]]; then
  echo "❌ Refresh token error still present"
  exit 1
elif [[ "$REFRESH_RESPONSE" == *"accessToken"* ]]; then
  echo "✅ Refresh token working correctly!"
else
  echo "⚠️  Unexpected response: $REFRESH_RESPONSE"
fi

echo "3️⃣  Testing refresh token rotation..."
NEW_REFRESH_TOKEN=$(echo "$REFRESH_RESPONSE" | grep -o '"refreshToken":"[^"]*"' | cut -d'"' -f4)

if [ -n "$NEW_REFRESH_TOKEN" ]; then
  echo "✅ New refresh token received: ${NEW_REFRESH_TOKEN:0:20}..."
  
  # Test that old token is invalidated
  echo "4️⃣  Testing old token invalidation..."
  OLD_TOKEN_TEST=$(curl -s -X POST "$BASE_URL/auth/refresh" \
    -H "Content-Type: application/json" \
    -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}")
  
  if [[ "$OLD_TOKEN_TEST" == *"REFRESH_TOKEN_NOT_FOUND"* ]]; then
    echo "✅ Old token properly invalidated"
  else
    echo "⚠️  Old token still valid (unexpected): $OLD_TOKEN_TEST"
  fi
else
  echo "❌ No new refresh token in response"
fi

echo "🎉 Refresh token test completed!"
