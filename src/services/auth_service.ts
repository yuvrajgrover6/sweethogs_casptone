import { User } from "../models/user_model";
import type { IUser } from "../models/user_model";
import {
  generateTokenPair,
  verifyRefreshToken,
  refreshAccessToken,
} from "../utils/auth_token";
import type { TokenPair } from "../utils/auth_token";
import { BaseErrorException } from "../utils/error_handler";
import type {
  LoginRequest,
  RegisterRequest,
  TokenResponse,
} from "../types/auth";

export class AuthService {
  async register(userData: RegisterRequest): Promise<TokenResponse> {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        throw new BaseErrorException({
          message: "User already exists with this email",
          error: "USER_ALREADY_EXISTS",
          logInfo: { email: userData.email },
          code: 409,
        });
      }

      // Create new user
      const userData_with_parsed_date = {
        ...userData,
        dateOfBirth: userData.dateOfBirth
          ? new Date(userData.dateOfBirth)
          : undefined,
      };

      const user = new User({
        email: userData_with_parsed_date.email,
        password: userData_with_parsed_date.password,
        firstName: userData_with_parsed_date.firstName,
        lastName: userData_with_parsed_date.lastName,
        avatar: userData_with_parsed_date.avatar,
        phoneNumber: userData_with_parsed_date.phoneNumber,
        dateOfBirth: userData_with_parsed_date.dateOfBirth,
        role: userData_with_parsed_date.role || "user",
      });

      const savedUser = await user.save();

      // Generate token pair
      const tokens = generateTokenPair({
        userId: (savedUser._id as any).toString(),
        email: savedUser.email,
        role: savedUser.role,
      });

      // Save refresh token to user
      await savedUser.addRefreshToken(tokens.refreshToken);

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: (savedUser._id as any).toString(),
          email: savedUser.email,
          firstName: savedUser.firstName,
          lastName: savedUser.lastName,
          avatar: savedUser.avatar,
          phoneNumber: savedUser.phoneNumber,
          dateOfBirth: savedUser.dateOfBirth?.toISOString(),
          role: savedUser.role,
        },
      };
    } catch (error) {
      if (error instanceof BaseErrorException) {
        throw error;
      }
      throw new BaseErrorException({
        message: "Failed to register user",
        error: "REGISTRATION_FAILED",
        logInfo: { error },
        code: 500,
      });
    }
  }

  async login(credentials: LoginRequest): Promise<TokenResponse> {
    try {
      // Find user by email
      const user = await User.findOne({ email: credentials.email });
      if (!user) {
        throw new BaseErrorException({
          message: "Invalid email or password",
          error: "INVALID_CREDENTIALS",
          logInfo: { email: credentials.email },
          code: 401,
        });
      }

      // Check if user is active
      if (!user.isActive) {
        throw new BaseErrorException({
          message: "Account is deactivated",
          error: "ACCOUNT_DEACTIVATED",
          logInfo: { userId: user._id },
          code: 403,
        });
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(credentials.password);
      if (!isPasswordValid) {
        throw new BaseErrorException({
          message: "Invalid email or password",
          error: "INVALID_CREDENTIALS",
          logInfo: { email: credentials.email },
          code: 401,
        });
      }

      // Generate token pair
      const tokens = generateTokenPair({
        userId: (user._id as any).toString(),
        email: user.email,
        role: user.role,
      });

      // Save refresh token to user
      await user.addRefreshToken(tokens.refreshToken);

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: (user._id as any).toString(),
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar,
          phoneNumber: user.phoneNumber,
          dateOfBirth: user.dateOfBirth?.toISOString(),
          role: user.role,
        },
      };
    } catch (error) {
      if (error instanceof BaseErrorException) {
        throw error;
      }
      throw new BaseErrorException({
        message: "Failed to login",
        error: "LOGIN_FAILED",
        logInfo: { error },
        code: 500,
      });
    }
  }

  async refreshToken(refreshToken: string): Promise<TokenPair> {
    try {
      // Use the new refreshAccessToken function which handles everything
      return await refreshAccessToken(refreshToken);
    } catch (error) {
      if (error instanceof BaseErrorException) {
        throw error;
      }
      throw new BaseErrorException({
        message: "Failed to refresh token",
        error: "TOKEN_REFRESH_FAILED",
        logInfo: { error },
        code: 500,
      });
    }
  }

  async logout(refreshToken: string): Promise<void> {
    try {
      // Verify refresh token (this will also remove it from the database)
      await verifyRefreshToken(refreshToken);
    } catch (error) {
      // Silent fail for logout - token might already be invalid
      console.log("Logout error (ignored):", error);
    }
  }

  async logoutAll(userId: string): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (user) {
        await user.clearRefreshTokens();
      }
    } catch (error) {
      throw new BaseErrorException({
        message: "Failed to logout from all devices",
        error: "LOGOUT_ALL_FAILED",
        logInfo: { error },
        code: 500,
      });
    }
  }

  async getProfile(userId: string): Promise<IUser> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new BaseErrorException({
          message: "User not found",
          error: "USER_NOT_FOUND",
          logInfo: { userId },
          code: 404,
        });
      }

      return user;
    } catch (error) {
      if (error instanceof BaseErrorException) {
        throw error;
      }
      throw new BaseErrorException({
        message: "Failed to get user profile",
        error: "PROFILE_FETCH_FAILED",
        logInfo: { error },
        code: 500,
      });
    }
  }

  async updateProfile(userId: string, updateData: any): Promise<IUser> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new BaseErrorException({
          message: "User not found",
          error: "USER_NOT_FOUND",
          logInfo: { userId },
          code: 404,
        });
      }

      // Parse date of birth if provided
      if (updateData.dateOfBirth) {
        updateData.dateOfBirth = new Date(updateData.dateOfBirth);
      }

      // Update user fields
      Object.keys(updateData).forEach((key) => {
        if (
          updateData[key] !== undefined &&
          key !== "password" &&
          key !== "role"
        ) {
          (user as any)[key] = updateData[key];
        }
      });

      const updatedUser = await user.save();
      return updatedUser;
    } catch (error) {
      if (error instanceof BaseErrorException) {
        throw error;
      }
      throw new BaseErrorException({
        message: "Failed to update user profile",
        error: "PROFILE_UPDATE_FAILED",
        logInfo: { error },
        code: 500,
      });
    }
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new BaseErrorException({
          message: "User not found",
          error: "USER_NOT_FOUND",
          logInfo: { userId },
          code: 404,
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(
        currentPassword
      );
      if (!isCurrentPasswordValid) {
        throw new BaseErrorException({
          message: "Current password is incorrect",
          error: "INVALID_CURRENT_PASSWORD",
          logInfo: { userId },
          code: 401,
        });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      // Clear all refresh tokens to force re-login
      await user.clearRefreshTokens();
    } catch (error) {
      if (error instanceof BaseErrorException) {
        throw error;
      }
      throw new BaseErrorException({
        message: "Failed to change password",
        error: "PASSWORD_CHANGE_FAILED",
        logInfo: { error },
        code: 500,
      });
    }
  }
}
