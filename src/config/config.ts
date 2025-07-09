import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-default-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // Database Configuration
  database: {
    uri: process.env.DATABASE_URI || 'mongodb://localhost:27017/nodejs-backend-app',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },

  // Server Configuration
  server: {
    port: parseInt(process.env.PORT || '3000'),
    env: process.env.NODE_ENV || 'development',
  },

  // Security Configuration
  security: {
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12'),
    corsOrigin: process.env.CORS_ORIGIN || '*',
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  },

  // Validation
  validation: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  },
};

// Validate required environment variables
export function validateConfig() {
  const required = [
    'JWT_SECRET',
    'DATABASE_URI',
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.warn(`Warning: Missing environment variables: ${missing.join(', ')}`);
    console.warn('Using default values. Please set these in production.');
  }
}

export default config;
