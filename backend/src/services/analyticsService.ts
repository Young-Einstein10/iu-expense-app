import { prisma } from "../config/database";
import { AnalyticsQueryInput } from "../types";

export const analyticsService = {
  async getTotalByDuration(
    userId: string,
    duration: "daily" | "weekly" | "monthly",
  ) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let startDate: Date;
    switch (duration) {
      case "daily":
        startDate = today;
        break;
      case "weekly":
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "monthly":
        startDate = new Date(today);
        startDate.setMonth(startDate.getMonth() - 1);
        break;
    }

    const result = await prisma.expense.aggregate({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: now,
        },
      },
      _sum: { amount: true },
      _count: { amount: true },
    });

    return {
      total: Number(result._sum.amount || 0),
      count: result._count.amount,
      duration,
      startDate: startDate.toISOString().split("T")[0],
      endDate: now.toISOString().split("T")[0],
    };
  },

  async getSpendingTrends(userId: string, query: AnalyticsQueryInput) {
    const { startDate, endDate, categoryId, groupBy = "month" } = query;

    // Build where clause
    const where: any = {
      userId,
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Get spending trends using Prisma groupBy
    const expensesByDate = await prisma.expense.groupBy({
      by: ["date", "categoryId"],
      where,
      _sum: { amount: true },
      _count: { amount: true },
    });

    // Get category names
    const categoryIds = [
      ...new Set(expensesByDate.map((e) => e.categoryId).filter(Boolean)),
    ] as string[];
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true },
    });
    const categoryMap = categories.reduce(
      (acc, cat) => {
        acc[cat.id] = cat.name;
        return acc;
      },
      {} as Record<string, string>,
    );

    // Group by period
    const trendMap = new Map<
      string,
      Map<string, { amount: number; count: number }>
    >();
    expensesByDate.forEach((item) => {
      let period: string;
      const date = item.date;
      switch (groupBy) {
        case "day":
          period = date.toISOString().slice(0, 10);
          break;
        case "week":
          const weekNum = Math.ceil(
            (date.getDate() +
              new Date(date.getFullYear(), date.getMonth(), 1).getDay()) /
              7,
          );
          period = `${date.getFullYear()}-W${weekNum.toString().padStart(2, "0")}`;
          break;
        case "year":
          period = date.getFullYear().toString();
          break;
        default: // month
          period = date.toISOString().slice(0, 7);
      }
      const categoryName = item.categoryId
        ? categoryMap[item.categoryId] || "Unknown"
        : "Uncategorized";

      if (!trendMap.has(period)) {
        trendMap.set(period, new Map());
      }
      const periodMap = trendMap.get(period)!;
      const existing = periodMap.get(categoryName) || { amount: 0, count: 0 };
      periodMap.set(categoryName, {
        amount: existing.amount + Number(item._sum.amount || 0),
        count: existing.count + item._count.amount,
      });
    });

    // Flatten to array
    const trends: {
      period: string;
      category: string;
      amount: number;
      count: number;
    }[] = [];
    trendMap.forEach((categoryData, period) => {
      categoryData.forEach((data, category) => {
        trends.push({
          period,
          category,
          amount: data.amount,
          count: data.count,
        });
      });
    });
    trends.sort(
      (a, b) => b.period.localeCompare(a.period) || b.amount - a.amount,
    );

    // Calculate total
    const total = trends.reduce((sum, t) => sum + t.amount, 0);

    // Add percentage to each trend
    const trendsWithPercentage = trends.map((trend) => ({
      ...trend,
      percentage: total > 0 ? (trend.amount / total) * 100 : 0,
    }));

    return {
      trends: trendsWithPercentage,
      total,
      periodCount: trends.length,
    };
  },

  async getCategoryBreakdown(userId: string, query: AnalyticsQueryInput) {
    const { startDate, endDate } = query;

    const where = {
      userId,
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    };

    // Get category breakdown
    const breakdown = await prisma.expense.groupBy({
      by: ["categoryId"],
      where,
      _sum: { amount: true },
      _count: { amount: true },
      orderBy: {
        _sum: {
          amount: "desc",
        },
      },
    });

    // Get category details
    const categoryIds = breakdown
      .map((b) => b.categoryId)
      .filter((id): id is string => id !== null);
    const categories = await prisma.category.findMany({
      where: {
        id: { in: categoryIds },
      },
      select: {
        id: true,
        name: true,
        icon: true,
        color: true,
      },
    });

    const categoryMap = categories.reduce(
      (acc, cat) => {
        acc[cat.id] = cat;
        return acc;
      },
      {} as Record<string, any>,
    );

    // Calculate total for percentage
    const total = breakdown.reduce(
      (sum, item) => sum + Number(item._sum.amount || 0),
      0,
    );

    const result = breakdown.map((item) => {
      const category = item.categoryId ? categoryMap[item.categoryId] : null;
      const amount = Number(item._sum.amount || 0);

      return {
        categoryId: item.categoryId || "uncategorized",
        categoryName: category?.name || "Uncategorized",
        categoryIcon: category?.icon || "more-horizontal",
        categoryColor: category?.color || "#D3D3D3",
        amount,
        count: item._count.amount,
        averageAmount: item._count.amount > 0 ? amount / item._count.amount : 0,
        percentage: total > 0 ? (amount / total) * 100 : 0,
      };
    });

    // Add uncategorized if there are expenses without categories
    const uncategorizedExpenses = await prisma.expense.count({
      where: {
        ...where,
        categoryId: null,
      },
    });

    if (
      uncategorizedExpenses > 0 &&
      !result.find((r) => r.categoryId === "uncategorized")
    ) {
      const uncategorizedTotal = await prisma.expense.aggregate({
        where: {
          ...where,
          categoryId: null,
        },
        _sum: { amount: true },
        _count: { amount: true },
      });

      const amount = Number(uncategorizedTotal._sum.amount || 0);
      result.push({
        categoryId: "uncategorized",
        categoryName: "Uncategorized",
        categoryIcon: "more-horizontal",
        categoryColor: "#D3D3D3",
        amount,
        count: uncategorizedTotal._count.amount,
        averageAmount:
          uncategorizedTotal._count.amount > 0
            ? amount / uncategorizedTotal._count.amount
            : 0,
        percentage: total > 0 ? (amount / total) * 100 : 0,
      });
    }

    return {
      categories: result,
      total,
      categoryCount: result.length,
    };
  },

  async getMonthlyReport(userId: string, year: number, month: number) {
    // Calculate date range for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of the month

    const where = {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    };

    // Get monthly aggregates
    const aggregates = await prisma.expense.aggregate({
      where,
      _sum: { amount: true },
      _count: { amount: true },
    });

    const totalAmount = Number(aggregates._sum.amount || 0);
    const totalExpenses = aggregates._count.amount;
    const dailyAverage = totalAmount / new Date(year, month, 0).getDate();

    // Get category breakdown
    const categoryBreakdown = await this.getCategoryBreakdown(userId, {
      startDate: startDate.toISOString().split("T")[0]!,
      endDate: endDate.toISOString().split("T")[0]!,
    });

    // Get top expenses
    const topExpenses = await prisma.expense.findMany({
      where,
      orderBy: {
        amount: "desc",
      },
      take: 10,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
          },
        },
      },
    });

    // Get budget comparison if budgets exist
    const budgets = await prisma.budget.findMany({
      where: {
        userId,
        period: "monthly",
        startDate: {
          lte: startDate,
        },
        endDate: {
          gte: endDate,
        },
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const budgetComparison = budgets.map((budget) => {
      const spent =
        categoryBreakdown.categories.find(
          (c) => c.categoryId === budget.categoryId,
        )?.amount || 0;

      return {
        categoryId: budget.categoryId,
        categoryName: budget.category?.name || "Unknown",
        budgetAmount: Number(budget.amount),
        spentAmount: spent,
        remaining: Number(budget.amount) - spent,
        percentage: spent > 0 ? (spent / Number(budget.amount)) * 100 : 0,
      };
    });

    return {
      month: `${year}-${month.toString().padStart(2, "0")}`,
      totalExpenses,
      totalAmount,
      dailyAverage,
      categoryBreakdown: categoryBreakdown.categories,
      topExpenses,
      budgetComparison: budgetComparison.length > 0 ? budgetComparison : null,
    };
  },

  async getYearlyReport(userId: string, year: number) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    const where = {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    };

    // Get monthly breakdown using Prisma groupBy
    const expensesByDate = await prisma.expense.groupBy({
      by: ["date"],
      where,
      _sum: { amount: true },
      _count: { amount: true },
    });

    // Aggregate by month
    const monthlyDataMap = new Map<number, { amount: number; count: number }>();
    expensesByDate.forEach((item) => {
      const month = item.date.getMonth() + 1; // 1-indexed
      const existing = monthlyDataMap.get(month) || { amount: 0, count: 0 };
      monthlyDataMap.set(month, {
        amount: existing.amount + Number(item._sum.amount || 0),
        count: existing.count + item._count.amount,
      });
    });

    const monthlyData = Array.from(monthlyDataMap.entries()).map(
      ([month, data]) => ({
        month,
        amount: data.amount,
        count: data.count,
      }),
    );

    // Fill missing months with zeros
    const monthlyBreakdown = Array.from({ length: 12 }, (_, i) => {
      const monthData = monthlyData.find((m) => m.month === i + 1);
      return {
        month: i + 1,
        monthName: new Date(year, i).toLocaleString("default", {
          month: "long",
        }),
        amount: monthData ? Number(monthData.amount) : 0,
        count: monthData ? monthData.count : 0,
      };
    });

    // Get yearly totals
    const aggregates = await prisma.expense.aggregate({
      where,
      _sum: { amount: true },
      _count: { amount: true },
      _avg: { amount: true },
    });

    const totalAmount = Number(aggregates._sum.amount || 0);
    const totalExpenses = aggregates._count.amount;
    const averageAmount = Number(aggregates._avg.amount || 0);
    const monthlyAverage = totalAmount / 12;

    // Get best and worst months
    const firstMonth = monthlyBreakdown[0]!;
    const bestMonth = monthlyBreakdown.reduce(
      (best, current) => (current.amount > best.amount ? current : best),
      firstMonth,
    );

    const worstMonth = monthlyBreakdown.reduce(
      (worst, current) => (current.amount < worst.amount ? current : worst),
      firstMonth,
    );

    return {
      year,
      totalAmount,
      totalExpenses,
      averageAmount,
      monthlyAverage,
      bestMonth,
      worstMonth,
      monthlyBreakdown,
    };
  },
};
