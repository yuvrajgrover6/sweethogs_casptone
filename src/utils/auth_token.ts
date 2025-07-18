import jwt from "jsonwebtoken";
import { BaseErrorException } from "./error_handler";
import { config } from "../config/config";
import { User } from "../models/user_model";

const JWT_SECRET = config.jwt.secret;
const JWT_EXPIRES_IN: number | string | undefined = config.jwt.expiresIn;
const JWT_REFRESH_EXPIRES_IN: number | string | undefined =
  config.jwt.refreshExpiresIn;

// Validate JWT secret
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in configuration");
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  type?: "access" | "refresh";
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export function generateToken(payload: {
  userId: string;
  email: string;
  role: string;
}): string {
  try {
    const tokenPayload = {
      ...payload,
      type: "access" as const,
      // Add a random nonce to ensure uniqueness
      nonce: Math.random().toString(36).substring(2),
    };
    const options: jwt.SignOptions = {
      expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    };
    const token = jwt.sign(tokenPayload, JWT_SECRET!, options);
    return token;
  } catch (error) {
    throw new BaseErrorException({
      message: "Failed to generate access token",
      error: "TOKEN_GENERATION_ERROR",
      logInfo: { error },
      code: 500,
    });
  }
}

export function generateRefreshToken(payload: {
  userId: string;
  email: string;
  role: string;
}): string {
  try {
    const tokenPayload = {
      ...payload,
      type: "refresh" as const,
      // Add a random nonce to ensure uniqueness
      nonce: Math.random().toString(36).substring(2),
    };
    const options: jwt.SignOptions = {
      expiresIn: JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    };
    const token = jwt.sign(tokenPayload, JWT_SECRET!, options);
    return token;
  } catch (error) {
    throw new BaseErrorException({
      message: "Failed to generate refresh token",
      error: "REFRESH_TOKEN_GENERATION_ERROR",
      logInfo: { error },
      code: 500,
    });
  }
}

export function generateTokenPair(payload: {
  userId: string;
  email: string;
  role: string;
}): TokenPair {
  return {
    accessToken: generateToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
}

export function checkAuthToken(token: string | undefined): TokenPayload {
  if (!token) {
    throw new BaseErrorException({
      message: "No token provided",
      error: "NO_TOKEN",
      logInfo: {},
      code: 401,
    });
  }

  // Remove 'Bearer ' prefix if present
  const cleanToken = token.startsWith("Bearer ") ? token.slice(7) : token;

  try {
    const decoded = jwt.verify(cleanToken, JWT_SECRET!) as TokenPayload;

    // Ensure it's an access token
    if (decoded.type && decoded.type !== "access") {
      throw new BaseErrorException({
        message: "Invalid token type",
        error: "INVALID_TOKEN_TYPE",
        logInfo: { tokenType: decoded.type },
        code: 401,
      });
    }

    return decoded;
  } catch (error) {
    if (error instanceof BaseErrorException) {
      throw error;
    }
    throw new BaseErrorException({
      message: "Invalid or expired token",
      error: "INVALID_TOKEN",
      logInfo: { error },
      code: 401,
    });
  }
}

export async function verifyRefreshToken(token: string, removeToken: boolean = false): Promise<TokenPayload> {
  if (!token) {
    throw new BaseErrorException({
      message: "No refresh token provided",
      error: "NO_REFRESH_TOKEN",
      logInfo: {},
      code: 401,
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET!) as TokenPayload;

    // Ensure it's a refresh token
    if (decoded.type !== "refresh") {
      throw new BaseErrorException({
        message: "Invalid refresh token type",
        error: "INVALID_REFRESH_TOKEN_TYPE",
        logInfo: { tokenType: decoded.type },
        code: 401,
      });
    }

    // Check if the refresh token exists in the database
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new BaseErrorException({
        message: "User not found",
        error: "USER_NOT_FOUND",
        logInfo: { userId: decoded.userId },
        code: 401,
      });
    }

    // Check if this specific refresh token is stored for this user
    if (!user.refreshTokens || !user.refreshTokens.includes(token)) {
      throw new BaseErrorException({
        message: "Refresh token not found or already used",
        error: "REFRESH_TOKEN_NOT_FOUND",
        logInfo: { userId: decoded.userId },
        code: 401,
      });
    }

    // Only remove the token if explicitly requested (for logout or rotation)
    if (removeToken) {
      user.refreshTokens = user.refreshTokens.filter((rt) => rt !== token);
      await user.save();
    }

    return decoded;
  } catch (error) {
    if (error instanceof BaseErrorException) {
      throw error;
    }
    throw new BaseErrorException({
      message: "Invalid or expired refresh token",
      error: "INVALID_REFRESH_TOKEN",
      logInfo: { error },
      code: 401,
    });
  }
}

export function checkAdmin(token: string | undefined): TokenPayload {
  const decoded = checkAuthToken(token);

  if (decoded.role !== "admin") {
    throw new BaseErrorException({
      message: "Admin access required",
      error: "INSUFFICIENT_PERMISSIONS",
      logInfo: { userRole: decoded.role },
      code: 403,
    });
  }

  return decoded;
}

export async function refreshAccessToken(
  refreshToken: string
): Promise<TokenPair> {
  // First verify the refresh token without removing it
  const decoded = await verifyRefreshToken(refreshToken, false);

  // Generate new token pair with same payload but fresh expiration
  const newTokenPair = generateTokenPair({
    userId: decoded.userId,
    email: decoded.email,
    role: decoded.role,
  });

  // Now handle token rotation: remove old token and add new one
  const user = await User.findById(decoded.userId);
  if (user) {
    if (!user.refreshTokens) {
      user.refreshTokens = [];
    }
    
    // Remove the old refresh token (rotation)
    user.refreshTokens = user.refreshTokens.filter((rt) => rt !== refreshToken);
    
    // Add the new refresh token
    user.refreshTokens.push(newTokenPair.refreshToken);
    await user.save();
  }

  return newTokenPair;
}

// Legacy function - kept for backward compatibility
export function refreshToken(token: string | undefined): string {
  if (!token) {
    throw new BaseErrorException({
      message: "No token provided for refresh",
      error: "NO_TOKEN",
      logInfo: {},
      code: 401,
    });
  }

  const decoded = checkAuthToken(token);

  // Generate new access token with same payload but fresh expiration
  return generateToken({
    userId: decoded.userId,
    email: decoded.email,
    role: decoded.role,
  });
}
