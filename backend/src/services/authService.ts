import bcrypt from "bcrypt";
import { prisma } from "../config/database";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
import { CustomError } from "../middleware/errorHandler";
import { LoginData, SignupData, AuthResponse } from "../types";
import { categoryService } from "./categoryService";

export const authService = {
  async signup(data: SignupData): Promise<AuthResponse> {
    const { email, password, fullName } = data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new CustomError(
        "User with this email already exists",
        409,
        "USER_EXISTS",
      );
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName: fullName ?? null,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        isActive: true,
        createdAt: true,
      },
    });

    // Seed default categories for new user
    await categoryService.createDefaultCategories(user.id);

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        ...(user.fullName ? { fullName: user.fullName } : {}),
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const { email, password } = data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new CustomError(
        "Invalid email or password",
        401,
        "INVALID_CREDENTIALS",
      );
    }

    // Check if user is active
    if (!user.isActive) {
      throw new CustomError(
        "Account is deactivated",
        401,
        "ACCOUNT_DEACTIVATED",
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new CustomError(
        "Invalid email or password",
        401,
        "INVALID_CREDENTIALS",
      );
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        ...(user.fullName ? { fullName: user.fullName } : {}),
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  },

  async refreshToken(userId: string, _email: string): Promise<AuthResponse> {
    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw new CustomError(
        "User not found or inactive",
        401,
        "USER_NOT_FOUND",
      );
    }

    // Generate new tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        ...(user.fullName ? { fullName: user.fullName } : {}),
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  },

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        passwordHash: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw new CustomError(
        "User not found or inactive",
        401,
        "USER_NOT_FOUND",
      );
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash,
    );

    if (!isCurrentPasswordValid) {
      throw new CustomError(
        "Current password is incorrect",
        400,
        "INVALID_CURRENT_PASSWORD",
      );
    }

    // Check if new password is same as current
    const isSamePassword = await bcrypt.compare(newPassword, user.passwordHash);

    if (isSamePassword) {
      throw new CustomError(
        "New password must be different from current password",
        400,
        "SAME_PASSWORD",
      );
    }

    // Hash new password
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });
  },

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            expenses: true,
            categories: true,
            budgets: true,
          },
        },
      },
    });

    if (!user) {
      throw new CustomError("User not found", 404, "USER_NOT_FOUND");
    }

    return user;
  },

  async updateProfile(
    userId: string,
    data: { fullName?: string; avatarUrl?: string },
  ) {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        isActive: true,
        updatedAt: true,
      },
    });

    return user;
  },

  async deactivateAccount(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });
  },
};
