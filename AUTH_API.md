# Authentication API Documentation

This document describes the JWT-based authentication system with access and refresh tokens.

## Overview

The authentication system uses:

- **Access Tokens**: Short-lived tokens (24h by default) for API access
- **Refresh Tokens**: Long-lived tokens (7d by default) for refreshing access tokens
- **Role-based Access**: Support for `user` and `admin` roles
- **Secure Storage**: Refresh tokens are stored in the database for security

## Authentication Endpoints

### 1. Register User (Enhanced)

```
POST /auth/register
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John", // optional
  "lastName": "Doe", // optional
  "phoneNumber": "+1234567890", // optional
  "dateOfBirth": "1990-01-15", // optional (ISO date)
  "avatar": "https://example.com/avatar.jpg", // optional (valid image URL)
  "role": "user" // optional, defaults to "user"
}
```

**Response:**

```json
{
  "code": 201,
  "message": "User registered successfully",
  "body": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "64a7b8c9d0e1f2g3h4i5j6k7",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phoneNumber": "+1234567890",
      "dateOfBirth": "1990-01-15T00:00:00.000Z",
      "avatar": "https://example.com/avatar.jpg",
      "role": "user"
    }
  }
}
```

### 2. Login

```
POST /auth/login
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** Same as register

### 3. Refresh Access Token

```
POST /auth/refresh
```

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**

```json
{
  "code": 200,
  "message": "Token refreshed successfully",
  "body": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 4. Logout (Single Device)

```
POST /auth/logout
```

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 5. Logout All Devices

```
POST /auth/logout-all
Authorization: Bearer <access_token>
```

### 6. Get Profile

```
GET /auth/profile
Authorization: Bearer <access_token>
```

## 🆕 **Enhanced User Profile System**

The authentication system now supports comprehensive user profiles with the following additional fields:

### **User Profile Fields**

- **firstName** (optional): User's first name (max 50 characters)
- **lastName** (optional): User's last name (max 50 characters)
- **avatar** (optional): Profile picture URL (must be valid image URL)
- **phoneNumber** (optional): Phone number with international format validation
- **dateOfBirth** (optional): Date of birth (ISO date format)
- **createdAt**: Automatically managed timestamp
- **updatedAt**: Automatically managed timestamp

### **Field Validation**

- **Avatar**: Must be a valid HTTPS URL ending in .jpg, .jpeg, .png, .gif, or .webp
- **Phone Number**: Must be at least 10 digits, supports international format with +
- **Date of Birth**: Must be a valid date in the past
- **Names**: Maximum 50 characters each, automatically trimmed

## Protected Routes

To protect routes, use the authentication middleware:

```typescript
import { authenticateToken, requireAdmin } from "../middleware/authMiddleware";

// For any authenticated user
router.get("/protected", authenticateToken, yourController);

// For admin only
router.get("/admin-only", requireAdmin, yourController);

// For optional authentication
router.get("/optional-auth", optionalAuth, yourController);
```

## Using Access Tokens

Include the access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Token Flow

1. **Registration/Login**: Get both access and refresh tokens
2. **API Requests**: Use access token in Authorization header
3. **Token Expired**: Use refresh token to get new token pair
4. **Logout**: Invalidate refresh token
5. **Security**: Refresh tokens are stored in database and can be revoked

## Error Responses

```json
{
  "error": "INVALID_TOKEN",
  "message": "Invalid or expired token",
  "code": 401
}
```

Common error codes:

- `401`: Authentication required/failed
- `403`: Insufficient permissions
- `404`: User not found
- `409`: User already exists

## Environment Variables

Make sure to set these in your `.env` file:

```bash
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
DATABASE_URI=mongodb://localhost:27017/your-db
```

## Security Features

- Passwords are hashed with bcrypt (12 salt rounds)
- Refresh tokens are stored in database for revocation
- Tokens include type verification (access vs refresh)
- Role-based access control
- Account deactivation support
- Multiple device logout capability

### 7. Update Profile

```
PUT /auth/profile
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "firstName": "Updated John", // optional
  "lastName": "Updated Doe", // optional
  "phoneNumber": "+1987654321", // optional
  "dateOfBirth": "1985-12-25", // optional (ISO date)
  "avatar": "https://example.com/new-avatar.jpg", // optional
  "email": "newemail@example.com" // optional
}
```

**Response:**

```json
{
  "code": 200,
  "message": "Profile updated successfully",
  "body": {
    "_id": "64a7b8c9d0e1f2g3h4i5j6k7",
    "email": "newemail@example.com",
    "firstName": "Updated John",
    "lastName": "Updated Doe",
    "phoneNumber": "+1987654321",
    "dateOfBirth": "1985-12-25T00:00:00.000Z",
    "avatar": "https://example.com/new-avatar.jpg",
    "role": "user",
    "isActive": true,
    "createdAt": "2025-07-11T21:00:00.000Z",
    "updatedAt": "2025-07-11T21:30:00.000Z"
  }
}
```

### 8. Change Password

```
POST /auth/change-password
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "currentPassword": "currentpass123",
  "newPassword": "newpassword456"
}
```

**Response:**

```json
{
  "code": 200,
  "message": "Password changed successfully. Please login again.",
  "body": {}
}
```

**Note**: Password change invalidates all refresh tokens, requiring re-authentication.
