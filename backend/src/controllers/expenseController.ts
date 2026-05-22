import { Response } from "express";
import { expenseService } from "../services/expenseService";
import { asyncHandler } from "../middleware/errorHandler";
import { AuthRequest } from "../types";

export const createExpense = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const expense = await expenseService.createExpense(userId, req.body);

    res.status(201).json({
      data: expense,
      message: "Expense created successfully",
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  },
);

export const getExpenses = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const result = await expenseService.getExpenses(userId, req.query);

    res.json({
      data: result.expenses,
      meta: {
        pagination: result.pagination,
        summary: result.summary,
        timestamp: new Date().toISOString(),
      },
    });
  },
);

export const getExpenseById = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const id = req.params["id"]!;

    const expense = await expenseService.getExpenseById(userId, id);

    res.json({
      data: expense,
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  },
);

export const updateExpense = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const id = req.params["id"]!;

    const expense = await expenseService.updateExpense(userId, id, req.body);

    res.json({
      data: expense,
      message: "Expense updated successfully",
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  },
);

export const deleteExpense = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const id = req.params["id"]!;

    await expenseService.deleteExpense(userId, id);

    res.json({
      data: { id },
      message: "Expense deleted successfully",
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  },
);

export const getExpenseSummary = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { startDate, endDate, categoryId } = req.query;

    const whereClause: any = {};
    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date.gte = new Date(startDate as string);
      if (endDate) whereClause.date.lte = new Date(endDate as string);
    }
    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    const summary = await expenseService.getExpenseSummary(userId, whereClause);

    res.json({
      data: summary,
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  },
);

export const getExpenseStats = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { days = 30 } = req.query;

    const stats = await expenseService.getExpenseStats(userId, Number(days));

    res.json({
      data: stats,
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  },
);
