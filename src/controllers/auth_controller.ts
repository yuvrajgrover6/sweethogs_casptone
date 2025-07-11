import type { Request, Response } from "express";
import { AuthService } from "../services/auth_service";
import { SuccessResult } from "../utils/success_response";
import type { AuthenticatedRequest } from "../middleware/authMiddleware";
import type {
  LoginRequest,
  RegisterRequest,
  RefreshTokenRequest,
  UpdateProfileRequest,
} from "../types/auth";

const authService = new AuthService();

export async function registerController(req: Request, res: Response) {
  try {
    const userData: RegisterRequest = req.body;
    const result = await authService.register(userData);

    res.status(201).json(
      new SuccessResult({
        code: 201,
        message: "User registered successfully",
        body: result,
      })
    );
  } catch (error) {
    throw error;
  }
}

export async function loginController(req: Request, res: Response) {
  try {
    const credentials: LoginRequest = req.body;
    const result = await authService.login(credentials);

    res.json(
      new SuccessResult({
        code: 200,
        message: "Login successful",
        body: result,
      })
    );
  } catch (error) {
    throw error;
  }
}

export async function refreshTokenController(req: Request, res: Response) {
  try {
    const { refreshToken }: RefreshTokenRequest = req.body;
    const result = await authService.refreshToken(refreshToken);

    res.json(
      new SuccessResult({
        code: 200,
        message: "Token refreshed successfully",
        body: result,
      })
    );
  } catch (error) {
    throw error;
  }
}

export async function logoutController(req: Request, res: Response) {
  try {
    const { refreshToken }: RefreshTokenRequest = req.body;
    await authService.logout(refreshToken);

    res.json(
      new SuccessResult({ code: 200, message: "Logout successful", body: {} })
    );
  } catch (error) {
    throw error;
  }
}

export async function logoutAllController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    await authService.logoutAll(req.user.userId);

    res.json(
      new SuccessResult({
        code: 200,
        message: "Logged out from all devices",
        body: {},
      })
    );
  } catch (error) {
    throw error;
  }
}

export async function getProfileController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const profile = await authService.getProfile(req.user.userId);

    res.json(
      new SuccessResult({
        code: 200,
        message: "Profile retrieved successfully",
        body: profile,
      })
    );
  } catch (error) {
    throw error;
  }
}

export async function updateProfileController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const updateData: UpdateProfileRequest = req.body;
    const updatedProfile = await authService.updateProfile(
      req.user.userId,
      updateData
    );

    res.json(
      new SuccessResult({
        code: 200,
        message: "Profile updated successfully",
        body: updatedProfile,
      })
    );
  } catch (error) {
    throw error;
  }
}

export async function changePasswordController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: "Current password and new password are required",
      });
    }

    await authService.changePassword(
      req.user.userId,
      currentPassword,
      newPassword
    );

    res.json(
      new SuccessResult({
        code: 200,
        message: "Password changed successfully. Please login again.",
        body: {},
      })
    );
  } catch (error) {
    throw error;
  }
}
