import { Response } from "express";
import { categoryService } from "../services/categoryService";
import { asyncHandler } from "../middleware/errorHandler";
import { AuthRequest } from "../types";

export const createCategory = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const category = await categoryService.createCategory(userId, req.body);

    res.status(201).json({
      data: category,
      message: "Category created successfully",
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  },
);

export const getCategories = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const includeExpenseCount = req.query.includeExpenseCount === "true";

    const categories = await categoryService.getCategories(
      userId,
      includeExpenseCount,
    );

    res.json({
      data: categories,
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  },
);

export const getCategoryById = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const id = req.params["id"]!;

    const category = await categoryService.getCategoryById(userId, id);

    res.json({
      data: category,
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  },
);

export const updateCategory = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const id = req.params["id"]!;

    const category = await categoryService.updateCategory(userId, id, req.body);

    res.json({
      data: category,
      message: "Category updated successfully",
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  },
);

export const deleteCategory = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const id = req.params["id"]!;

    await categoryService.deleteCategory(userId, id);

    res.json({
      data: { id },
      message: "Category deleted successfully",
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  },
);

export const createDefaultCategories = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;

    const categories = await categoryService.createDefaultCategories(userId);

    res.status(201).json({
      data: categories,
      message: "Default categories created successfully",
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  },
);

export const getCategoryStats = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;

    const stats = await categoryService.getCategoryStats(userId);

    res.json({
      data: stats,
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  },
);
