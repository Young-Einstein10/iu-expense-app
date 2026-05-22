import { Router } from "express";
import * as expenseController from "../controllers/expenseController";
import { authenticateToken } from "../middleware/auth";
import {
  validateBody,
  validateQuery,
  validateParams,
} from "../middleware/validation";
import {
  createExpenseSchema,
  updateExpenseSchema,
  expenseQuerySchema,
  uuidParamsSchema,
} from "../utils/validation";

const router = Router();

// All expense routes require authentication
router.use(authenticateToken);

// GET /api/v1/expenses/summary - Get expense summary
router.get("/summary", expenseController.getExpenseSummary);

// GET /api/v1/expenses/stats - Get expense statistics
router.get("/stats", expenseController.getExpenseStats);

// GET /api/v1/expenses - Get all expenses with filtering and pagination
router.get(
  "/",
  validateQuery(expenseQuerySchema),
  expenseController.getExpenses,
);

// POST /api/v1/expenses - Create a new expense
router.post(
  "/",
  validateBody(createExpenseSchema),
  expenseController.createExpense,
);

// GET /api/v1/expenses/:id - Get a specific expense
router.get(
  "/:id",
  validateParams(uuidParamsSchema),
  expenseController.getExpenseById,
);

// PUT /api/v1/expenses/:id - Update an expense
router.put(
  "/:id",
  validateParams(uuidParamsSchema),
  validateBody(updateExpenseSchema),
  expenseController.updateExpense,
);

// DELETE /api/v1/expenses/:id - Delete an expense
router.delete(
  "/:id",
  validateParams(uuidParamsSchema),
  expenseController.deleteExpense,
);

export default router;
