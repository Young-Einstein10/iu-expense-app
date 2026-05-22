import jwt from "jsonwebtoken";
import { JWTPayload } from "../types";

const JWT_SECRET = process.env["JWT_SECRET"]!;
const JWT_REFRESH_SECRET = process.env["JWT_REFRESH_SECRET"]!;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

if (!JWT_REFRESH_SECRET) {
  throw new Error("JWT_REFRESH_SECRET is not defined");
}

export const generateAccessToken = (
  payload: Omit<JWTPayload, "iat" | "exp">,
): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "15m",
    issuer: "iu-expense-app",
    audience: "iu-expense-app-users",
  });
};

export const generateRefreshToken = (
  payload: Omit<JWTPayload, "iat" | "exp">,
): string => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: "7d",
    issuer: "iu-expense-app",
    audience: "iu-expense-app-users",
  });
};

export const verifyAccessToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: "iu-expense-app",
      audience: "iu-expense-app-users",
    }) as JWTPayload;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new jwt.TokenExpiredError("Access token expired", err.expiredAt);
    }
    if (err instanceof jwt.JsonWebTokenError) {
      throw new jwt.JsonWebTokenError("Invalid access token");
    }
    throw new jwt.JsonWebTokenError("Token verification failed");
  }
};

export const verifyRefreshToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: "iu-expense-app",
      audience: "iu-expense-app-users",
    }) as JWTPayload;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new jwt.TokenExpiredError("Refresh token expired", err.expiredAt);
    }
    if (err instanceof jwt.JsonWebTokenError) {
      throw new jwt.JsonWebTokenError("Invalid refresh token");
    }
    throw new jwt.JsonWebTokenError("Token verification failed");
  }
};

export const decodeToken = (token: string): jwt.JwtPayload | string | null => {
  return jwt.decode(token);
};

export const getTokenExpiration = (token: string): Date | null => {
  const decoded = decodeToken(token);
  if (decoded && typeof decoded === "object" && decoded.exp) {
    return new Date(decoded.exp * 1000);
  }
  return null;
};
