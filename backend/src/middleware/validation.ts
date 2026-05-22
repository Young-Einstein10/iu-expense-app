import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { CustomError } from "./errorHandler";

export const validate = (
  schema: ZodSchema<unknown>,
  source: "body" | "query" | "params" = "body",
) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      let data: unknown;

      switch (source) {
        case "body":
          data = req.body;
          break;
        case "query":
          data = req.query;
          break;
        case "params":
          data = req.params;
          break;
      }

      const validatedData = schema.parse(data);

      // Replace the request data with validated data
      switch (source) {
        case "body":
          req.body = validatedData as Record<string, unknown>;
          break;
        case "query":
          (req as any).query = validatedData;
          break;
        case "params":
          (req as any).params = validatedData;
          break;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(error);
      } else {
        next(new CustomError("Validation failed", 400, "VALIDATION_ERROR"));
      }
    }
  };
};

export const validateBody = (schema: ZodSchema<unknown>) =>
  validate(schema, "body");
export const validateQuery = (schema: ZodSchema<unknown>) =>
  validate(schema, "query");
export const validateParams = (schema: ZodSchema<unknown>) =>
  validate(schema, "params");
