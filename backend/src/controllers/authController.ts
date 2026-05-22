import { Request, Response } from "express";
import { authService } from "../services/authService";
import { asyncHandler } from "../middleware/errorHandler";
import { AuthRequest } from "../types";

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.signup(req.body);

  res.status(201).json({
    data: result,
    message: "User created successfully",
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);

  res.json({
    data: result,
    message: "Login successful",
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
});

export const refreshToken = asyncHandler(
  async (req: Request, res: Response) => {
    const user = (req as any).user;

    const result = await authService.refreshToken(user.id, user.email);

    res.json({
      data: result,
      message: "Token refreshed successfully",
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  },
);

export const getProfile = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const profile = await authService.getProfile(userId);

    res.json({
      data: profile,
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  },
);

export const updateProfile = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { fullName, avatarUrl } = req.body;

    const updatedProfile = await authService.updateProfile(userId, {
      fullName,
      avatarUrl,
    });

    res.json({
      data: updatedProfile,
      message: "Profile updated successfully",
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  },
);

export const changePassword = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { currentPassword, newPassword } = req.body;

    await authService.changePassword(userId, currentPassword, newPassword);

    res.json({
      message: "Password changed successfully",
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  },
);

export const logout = asyncHandler(async (_req: AuthRequest, res: Response) => {
  // In a real implementation, you might want to:
  // 1. Add the token to a blacklist
  // 2. Remove the refresh token from the database
  // 3. Clear any session data

  res.json({
    message: "Logout successful",
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
});

export const deactivateAccount = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;

    await authService.deactivateAccount(userId);

    res.json({
      message: "Account deactivated successfully",
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  },
);
