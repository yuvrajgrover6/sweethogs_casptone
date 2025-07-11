# Node.js Backend App with JWT Authentication

A modern, secure Node.js backend application built with Express, MongoDB, and comprehensive JWT authentication system featuring access and refresh tokens.

## 🚀 Features

- **RESTful API** with Express.js
- **JWT Authentication** with access and refresh tokens
- **Role-based Access Control** (User/Admin)
- **MongoDB** with Mongoose for data modeling
- **TypeScript** for type safety
- **Bun** runtime for fast development
- **Environment Configuration** with dotenv
- **JSON Schema Validation** with Ajv
- **Password Hashing** with bcrypt
- **Comprehensive Error Handling**
- **API Documentation** and testing scripts

## 🛡️ Authentication System

This application implements a complete JWT authentication system with the following features:

- **Access Tokens**: Short-lived (24h) for API access
- **Refresh Tokens**: Long-lived (7d) for token renewal
- **Secure Storage**: Refresh tokens stored in database
- **Multiple Device Support**: Track and manage sessions
- **Account Management**: Registration, login, logout, profile management
- **Role-based Authorization**: User and Admin roles

### Authentication Endpoints

| Method | Endpoint                | Description          | Auth Required |
| ------ | ----------------------- | -------------------- | ------------- |
| POST   | `/auth/register`        | Register new user    | No            |
| POST   | `/auth/login`           | Login user           | No            |
| POST   | `/auth/refresh`         | Refresh access token | No            |
| POST   | `/auth/logout`          | Logout single device | No            |
| POST   | `/auth/logout-all`      | Logout all devices   | Yes           |
| GET    | `/auth/profile`         | Get user profile     | Yes           |
| PUT    | `/auth/profile`         | Update profile       | Yes           |
| POST   | `/auth/change-password` | Change password      | Yes           |

For detailed API documentation, see [AUTH_API.md](./AUTH_API.md)

## Installation

### Prerequisites

- [Bun](https://bun.sh) (>= 1.0.0) - Recommended runtime
- [Node.js](https://nodejs.org/en/download/) (>= 18.0.0) - Alternative runtime
- [MongoDB](https://www.mongodb.com/try/download/community) (>= 4.4.0)

### Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/username/nodejs-backend-app.git
   cd nodejs-backend-app
   ```

2. Install dependencies using Bun:

   ```bash
   bun install
   ```

   > **Note**: This project is optimized for Bun. If you prefer npm, you can use `npm install` instead.

3. Copy the example environment file and adjust the settings:

   ```bash
   cp .env.example .env
   ```

   **Important**: Update the `.env` file with your specific values:

   ```bash
   # Required - Change these values!
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   DATABASE_URI=mongodb://localhost:27017/your-database-name

   # Optional - Adjust as needed
   JWT_EXPIRES_IN=24h
   JWT_REFRESH_EXPIRES_IN=7d
   PORT=3000
   NODE_ENV=development
   ```

4. Start MongoDB service (if running locally)

5. Run the development server using Bun:

   ```bash
   bun run dev
   ```

   The server will start on http://localhost:3000

## Quick Setup with Script

For convenience, you can use the setup script:

```bash
./setup.sh
```

This script will:

- Check if Bun is installed
- Install dependencies using Bun
- Set up environment files
- Make test scripts executable

## 🔧 Available Scripts

This project uses Bun for package management and script execution:

```bash
# Start the development server (with hot reload)
bun run dev

# Start the production server
bun run start

# Run tests
bun test

# Install dependencies
bun install

# Update dependencies
bun update
```

### Why Bun?

This project uses [Bun](https://bun.sh) instead of Node.js + npm for several benefits:

- **Faster package installation** - Up to 10x faster than npm
- **Built-in TypeScript support** - No need for ts-node or compilation
- **Hot reload** - Automatic restart on file changes
- **Single binary** - No need to manage multiple tools
- **Native ESM** - Better ECMAScript module support

## Environment Configuration

Create a `.env` file in the root directory based on `.env.example`:

```bash
cp .env.example .env
```

**Important**:

- Never commit your `.env` file to version control
- Generate a strong, unique JWT secret for production
- Use environment-specific database connections
- Review and update all default values before deployment

## API Documentation

### Base URL

`http://localhost:3000` (development)

### Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Security Considerations

- JWT tokens should be stored securely (not in localStorage for web apps)
- Use HTTPS in production
- Regularly rotate JWT secrets
- Implement rate limiting
- Validate and sanitize all inputs
- Use environment variables for all sensitive configuration

## Version

This project was created using `bun init` in bun v1.2.10. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## 🧪 Testing the Authentication System

### Quick Test with Script

Run the included test script to verify all authentication endpoints:

```bash
./test_auth.sh
```

This script will:

- Register a new user
- Login with credentials
- Get user profile
- Refresh tokens
- Test protected routes
- Logout and verify token invalidation

### Manual Testing with curl

1. **Register a new user:**

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "role": "user"
  }'
```

2. **Login:**

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

3. **Access protected route:**

```bash
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🏗️ Project Structure

```
src/
├── config/           # Configuration files
│   └── config.ts     # Environment and app config
├── controllers/      # Request handlers
│   ├── auth_controller.ts    # Authentication endpoints
│   └── home_controller.ts    # Example CRUD endpoints
├── middleware/       # Express middleware
│   ├── authMiddleware.ts     # JWT authentication
│   ├── errorHandler.ts      # Global error handling
│   └── notFoundHandler.ts   # 404 handler
├── models/          # Database models
│   ├── user_model.ts        # User schema and methods
│   └── home_model.ts        # Example model
├── routes/          # Route definitions
│   └── routes.ts            # Centralized route config
├── services/        # Business logic
│   ├── auth_service.ts      # Authentication business logic
│   └── home_service.ts      # Example service
├── types/           # TypeScript type definitions
│   └── auth.ts              # Authentication types
└── utils/           # Utility functions
    ├── auth_token.ts        # JWT token utilities
    ├── error_handler.ts     # Error classes
    ├── success_response.ts  # Response utilities
    └── validation_schemas.ts # Input validation
```

## 🔐 Security Features

- **Password Hashing**: Bcrypt with configurable salt rounds
- **JWT Security**: Separate access and refresh tokens
- **Token Storage**: Refresh tokens stored in database for revocation
- **Role-based Access**: User and Admin role support
- **Account Management**: Active/inactive user states
- **Session Management**: Multi-device logout capability
- **Input Validation**: JSON schema validation for all inputs
- **Error Handling**: Secure error responses without sensitive data

## 📝 Environment Variables

| Variable                 | Description                | Default                                        | Required |
| ------------------------ | -------------------------- | ---------------------------------------------- | -------- |
| `JWT_SECRET`             | Secret key for JWT signing | -                                              | ✅       |
| `DATABASE_URI`           | MongoDB connection string  | `mongodb://localhost:27017/nodejs-backend-app` | ✅       |
| `JWT_EXPIRES_IN`         | Access token expiration    | `24h`                                          | ❌       |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiration   | `7d`                                           | ❌       |
| `PORT`                   | Server port                | `3000`                                         | ❌       |
| `NODE_ENV`               | Environment                | `development`                                  | ❌       |
| `BCRYPT_SALT_ROUNDS`     | Password hashing rounds    | `12`                                           | ❌       |

## 🚀 Deployment

1. Set production environment variables
2. Use a strong `JWT_SECRET` (32+ characters)
3. Configure production MongoDB instance
4. Set `NODE_ENV=production`
5. Consider using a reverse proxy (nginx)
6. Enable HTTPS in production
