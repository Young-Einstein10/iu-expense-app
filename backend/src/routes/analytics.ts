import { Router } from "express";
import * as analyticsController from "../controllers/analyticsController";
import { authenticateToken } from "../middleware/auth";
import { validateQuery } from "../middleware/validation";
import {
  analyticsQuerySchema,
  durationTotalQuerySchema,
} from "../utils/validation";

const router = Router();

// All analytics routes require authentication
router.use(authenticateToken);

// GET /api/v1/analytics/total - Get total spent by duration (daily/weekly/monthly)
router.get(
  "/total",
  validateQuery(durationTotalQuerySchema),
  analyticsController.getTotalByDuration,
);

// GET /api/v1/analytics/dashboard - Get dashboard statistics
router.get("/dashboard", analyticsController.getDashboardStats);

// GET /api/v1/analytics/spending-trends - Get spending trends
router.get(
  "/spending-trends",
  validateQuery(analyticsQuerySchema),
  analyticsController.getSpendingTrends,
);

// GET /api/v1/analytics/category-breakdown - Get category breakdown
router.get(
  "/category-breakdown",
  validateQuery(analyticsQuerySchema),
  analyticsController.getCategoryBreakdown,
);

// GET /api/v1/analytics/monthly-report - Get monthly report
router.get("/monthly-report", analyticsController.getMonthlyReport);

// GET /api/v1/analytics/yearly-report - Get yearly report
router.get("/yearly-report", analyticsController.getYearlyReport);

export default router;
