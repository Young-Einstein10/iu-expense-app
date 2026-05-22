import { Request, Response, NextFunction } from "express";
import { ZodError, ZodIssue } from "zod";
import { Prisma } from "@prisma/client";
import { AppError } from "../types";

export class CustomError extends Error implements AppError {
  statusCode: number;
  code: string;
  isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = "INTERNAL_ERROR",
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const err = error as AppError;

  // Default error
  if (!err.statusCode) {
    err.statusCode = 500;
    err.code = "INTERNAL_ERROR";
    err.isOperational = false;
  }

  // Log error
  console.error("Error:", {
    message: err.message,
    stack: err.stack,
    statusCode: err.statusCode,
    code: err.code,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });

  // Zod Validation Error
  if (error instanceof ZodError) {
    const errorMessages = error.errors
      .map((e: ZodIssue) => e.message)
      .join("\n");

    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: errorMessages,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Prisma Errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        return res.status(409).json({
          error: {
            code: "DUPLICATE_ENTRY",
            message: "A record with this value already exists",
            details: {
              field: error.meta?.target,
            },
          },
          meta: {
            timestamp: new Date().toISOString(),
          },
        });

      case "P2025":
        return res.status(404).json({
          error: {
            code: "NOT_FOUND",
            message: "Record not found",
          },
          meta: {
            timestamp: new Date().toISOString(),
          },
        });

      case "P2003":
        return res.status(400).json({
          error: {
            code: "FOREIGN_KEY_CONSTRAINT",
            message: "Invalid reference to related record",
          },
          meta: {
            timestamp: new Date().toISOString(),
          },
        });

      default:
        return res.status(500).json({
          error: {
            code: "DATABASE_ERROR",
            message: "Database operation failed",
          },
          meta: {
            timestamp: new Date().toISOString(),
          },
        });
    }
  }

  // JWT Errors
  if (error.name === "JsonWebTokenError") {
    return res.status(401).json({
      error: {
        code: "INVALID_TOKEN",
        message: "Invalid authentication token",
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  }

  if (error.name === "TokenExpiredError") {
    return res.status(401).json({
      error: {
        code: "TOKEN_EXPIRED",
        message: "Authentication token has expired",
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Bcrypt Errors
  if (error.name === "BcryptError") {
    return res.status(500).json({
      error: {
        code: "PASSWORD_ERROR",
        message: "Error processing password",
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Operational errors (trusted errors)
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Programming or unknown errors
  if (process.env["NODE_ENV"] === "development") {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        stack: err.stack,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Production: don't leak error details
  return res.status(err.statusCode).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Something went wrong",
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
};

export const notFound = (req: Request, _res: Response, next: NextFunction) => {
  const error = new CustomError(
    `Route ${req.originalUrl} not found`,
    404,
    "NOT_FOUND",
  );
  next(error);
};

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
