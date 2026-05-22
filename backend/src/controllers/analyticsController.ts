import { Response } from "express";
import { analyticsService } from "../services/analyticsService";
import { asyncHandler } from "../middleware/errorHandler";
import { AuthRequest, AnalyticsQueryInput } from "../types";

export const getTotalByDuration = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const duration = req.query["duration"] as "daily" | "weekly" | "monthly";

    const result = await analyticsService.getTotalByDuration(userId, duration);

    res.json({
      data: result,
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  },
);

export const getSpendingTrends = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const trends = await analyticsService.getSpendingTrends(
      userId,
      req.query as unknown as AnalyticsQueryInput,
    );

    res.json({
      data: trends,
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  },
);

export const getCategoryBreakdown = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const breakdown = await analyticsService.getCategoryBreakdown(
      userId,
      req.query as unknown as AnalyticsQueryInput,
    );

    res.json({
      data: breakdown,
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  },
);

export const getMonthlyReport = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { year, month } = req.query;

    if (!year || !month) {
      res.status(400).json({
        error: {
          code: "MISSING_PARAMS",
          message: "Year and month parameters are required",
        },
      });
      return;
    }

    const report = await analyticsService.getMonthlyReport(
      userId,
      Number(year),
      Number(month),
    );

    res.json({
      data: report,
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  },
);

export const getYearlyReport = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { year } = req.query;

    if (!year) {
      res.status(400).json({
        error: {
          code: "MISSING_PARAM",
          message: "Year parameter is required",
        },
      });
      return;
    }

    const report = await analyticsService.getYearlyReport(userId, Number(year));

    res.json({
      data: report,
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  },
);

export const getDashboardStats = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;

    // Get current month stats
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const [monthlyReport, yearlyReport] = await Promise.all([
      analyticsService.getMonthlyReport(userId, currentYear, currentMonth),
      analyticsService.getYearlyReport(userId, currentYear),
    ]);

    // Get recent trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trends = await analyticsService.getSpendingTrends(userId, {
      startDate: thirtyDaysAgo.toISOString().split("T")[0]!,
      endDate: now.toISOString().split("T")[0]!,
      groupBy: "day",
    });

    const dashboardStats = {
      currentMonth: {
        totalAmount: monthlyReport.totalAmount,
        totalExpenses: monthlyReport.totalExpenses,
        dailyAverage: monthlyReport.dailyAverage,
      },
      yearToDate: {
        totalAmount: yearlyReport.totalAmount,
        totalExpenses: yearlyReport.totalExpenses,
        monthlyAverage: yearlyReport.monthlyAverage,
      },
      recentTrends: trends.trends.slice(-7), // Last 7 days
      topCategories: monthlyReport.categoryBreakdown.slice(0, 5),
      recentExpenses: monthlyReport.topExpenses.slice(0, 5),
    };

    res.json({
      data: dashboardStats,
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  },
);
