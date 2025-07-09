import jwt from 'jsonwebtoken';
import { BaseErrorException } from './error_handler';
import { config } from '../config/config';

const JWT_SECRET = config.jwt.secret;
const JWT_EXPIRES_IN = config.jwt.expiresIn;

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export function generateToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
  try {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  } catch (error) {
    throw new BaseErrorException({
      message: 'Failed to generate token',
      error: 'TOKEN_GENERATION_ERROR',
      logInfo: { error },
      code: 500,
    });
  }
}

export function checkAuthToken(token: string | undefined): TokenPayload {
  if (!token) {
    throw new BaseErrorException({
      message: 'No token provided',
      error: 'NO_TOKEN',
      logInfo: {},
      code: 401,
    });
  }

  // Remove 'Bearer ' prefix if present
  const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;

  try {
    const decoded = jwt.verify(cleanToken, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    throw new BaseErrorException({
      message: 'Invalid or expired token',
      error: 'INVALID_TOKEN',
      logInfo: { error },
      code: 401,
    });
  }
}

export function checkAdmin(token: string | undefined): TokenPayload {
  const decoded = checkAuthToken(token);
  
  if (decoded.role !== 'admin') {
    throw new BaseErrorException({
      message: 'Admin access required',
      error: 'INSUFFICIENT_PERMISSIONS',
      logInfo: { userRole: decoded.role },
      code: 403,
    });
  }

  return decoded;
}

export function refreshToken(token: string | undefined): string {
  const decoded = checkAuthToken(token);
  
  // Generate new token with same payload but fresh expiration
  return generateToken({
    userId: decoded.userId,
    email: decoded.email,
    role: decoded.role,
  });
}
