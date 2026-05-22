import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, verifyRefreshToken } from "../utils/jwt";
import { prisma } from "../config/database";
import { CustomError } from "./errorHandler";
import { AuthRequest } from "../types";

export const authenticateToken = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      throw new CustomError("Access token required", 401, "TOKEN_REQUIRED");
    }

    const decoded = verifyAccessToken(token);

    // Verify user exists and is active
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        isActive: true,
      },
    });

    if (!user) {
      throw new CustomError(
        "User not found or inactive",
        401,
        "USER_NOT_FOUND",
      );
    }

    req.user = {
      id: user.id,
      email: user.email,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      const decoded = verifyAccessToken(token);
      const user = await prisma.user.findUnique({
        where: {
          id: decoded.userId,
          isActive: true,
        },
        select: {
          id: true,
          email: true,
          fullName: true,
          isActive: true,
        },
      });

      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
        };
      }
    }

    next();
  } catch (error) {
    // If token is invalid, continue without authentication
    next();
  }
};

export const requireOwnership = (
  resourceType: "expense" | "category" | "budget",
) => {
  return async (req: AuthRequest, _res: Response, next: NextFunction) => {
    try {
      const resourceId = req.params["id"];
      const userId = req.user!.id;

      if (!resourceId) {
        throw new CustomError("Resource ID is required", 400, "MISSING_ID");
      }

      let resource: unknown;

      switch (resourceType) {
        case "expense":
          resource = await prisma.expense.findFirst({
            where: {
              id: resourceId,
              userId: userId,
            },
          });
          break;

        case "category":
          resource = await prisma.category.findFirst({
            where: {
              id: resourceId,
              userId: userId,
            },
          });
          break;

        case "budget":
          resource = await prisma.budget.findFirst({
            where: {
              id: resourceId,
              userId: userId,
            },
          });
          break;

        default:
          throw new CustomError(
            "Invalid resource type",
            400,
            "INVALID_RESOURCE_TYPE",
          );
      }

      if (!resource) {
        throw new CustomError("Resource not found", 404, "RESOURCE_NOT_FOUND");
      }

      // Attach resource to request for use in controllers
      (req as any).resource = resource;

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const validateRefreshToken = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new CustomError(
        "Refresh token required",
        401,
        "REFRESH_TOKEN_REQUIRED",
      );
    }

    const decoded = verifyRefreshToken(refreshToken);

    // Verify user exists and is active
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        isActive: true,
      },
    });

    if (!user) {
      throw new CustomError(
        "User not found or inactive",
        401,
        "USER_NOT_FOUND",
      );
    }

    (req as any).user = user;

    next();
  } catch (error) {
    next(error);
  }
};
