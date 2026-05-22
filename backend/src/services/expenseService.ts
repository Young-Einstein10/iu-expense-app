import { prisma } from "../config/database";
import { CustomError } from "../middleware/errorHandler";
import {
  CreateExpenseInput,
  UpdateExpenseInput,
  ExpenseQueryInput,
} from "../types";

export const expenseService = {
  async createExpense(userId: string, data: CreateExpenseInput) {
    const { amount, description, date, categoryId, receiptUrl, tags } = data;

    // Verify category belongs to user if provided
    if (categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: categoryId,
          userId,
        },
      });

      if (!category) {
        throw new CustomError("Category not found", 404, "CATEGORY_NOT_FOUND");
      }
    }

    const expense = await prisma.expense.create({
      data: {
        userId,
        amount,
        description,
        date: new Date(date),
        categoryId: categoryId ?? null,
        receiptUrl: receiptUrl || null,
        tags,
      },
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

    return expense;
  },

  async getExpenses(userId: string, query: ExpenseQueryInput) {
    const {
      page = 1,
      limit = 20,
      startDate,
      endDate,
      categoryId,
      minAmount,
      maxAmount,
      search,
      tags,
      sortBy = "date",
      sortOrder = "desc",
    } = query;

    // Build where clause
    const where: any = {
      userId,
    };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (minAmount || maxAmount) {
      where.amount = {};
      if (minAmount) where.amount.gte = minAmount;
      if (maxAmount) where.amount.lte = maxAmount;
    }

    if (search) {
      where.OR = [
        { description: { contains: search, mode: "insensitive" } },
        { tags: { hasSome: [search] } },
      ];
    }

    if (tags) {
      const tagArray = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      if (tagArray.length > 0) {
        where.tags = { hasSome: tagArray };
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get expenses and total count
    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
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
      }),
      prisma.expense.count({ where }),
    ]);

    // Calculate summary
    const summary = await this.getExpenseSummary(userId, where);

    return {
      expenses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      summary,
    };
  },

  async getExpenseById(userId: string, expenseId: string) {
    const expense = await prisma.expense.findFirst({
      where: {
        id: expenseId,
        userId,
      },
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

    if (!expense) {
      throw new CustomError("Expense not found", 404, "EXPENSE_NOT_FOUND");
    }

    return expense;
  },

  async updateExpense(
    userId: string,
    expenseId: string,
    data: UpdateExpenseInput,
  ) {
    const { amount, description, date, categoryId, receiptUrl, tags } = data;

    // Verify expense belongs to user
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id: expenseId,
        userId,
      },
    });

    if (!existingExpense) {
      throw new CustomError("Expense not found", 404, "EXPENSE_NOT_FOUND");
    }

    // Verify category belongs to user if provided
    if (categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: categoryId,
          userId,
        },
      });

      if (!category) {
        throw new CustomError("Category not found", 404, "CATEGORY_NOT_FOUND");
      }
    }

    const updateData: any = {};
    if (amount !== undefined) updateData.amount = amount;
    if (description !== undefined) updateData.description = description;
    if (date !== undefined) updateData.date = new Date(date);
    if (categoryId !== undefined) updateData.categoryId = categoryId || null;
    if (receiptUrl !== undefined) updateData.receiptUrl = receiptUrl || null;
    if (tags !== undefined) updateData.tags = tags;

    const expense = await prisma.expense.update({
      where: { id: expenseId },
      data: updateData,
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

    return expense;
  },

  async deleteExpense(userId: string, expenseId: string) {
    // Verify expense belongs to user
    const expense = await prisma.expense.findFirst({
      where: {
        id: expenseId,
        userId,
      },
    });

    if (!expense) {
      throw new CustomError("Expense not found", 404, "EXPENSE_NOT_FOUND");
    }

    await prisma.expense.delete({
      where: { id: expenseId },
    });

    return { id: expenseId };
  },

  async getExpenseSummary(userId: string, whereClause: any = {}) {
    const where = {
      userId,
      ...whereClause,
    };

    // Get total, count, and average
    const aggregates = await prisma.expense.aggregate({
      where,
      _sum: { amount: true },
      _count: { amount: true },
      _avg: { amount: true },
    });

    const total = Number(aggregates._sum.amount || 0);
    const count = aggregates._count.amount;
    const average = Number(aggregates._avg.amount || 0);

    // Get breakdown by category
    const categoryBreakdown = await prisma.expense.groupBy({
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
    const categoryIds = categoryBreakdown
      .map((c) => c.categoryId)
      .filter((id): id is string => id !== null);
    const categories = await prisma.category.findMany({
      where: {
        id: { in: categoryIds },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const categoryMap = categories.reduce(
      (acc, cat) => {
        acc[cat.id] = cat.name;
        return acc;
      },
      {} as Record<string, string>,
    );

    const byCategory = categoryBreakdown.map((item) => ({
      categoryId: item.categoryId || "uncategorized",
      categoryName: item.categoryId
        ? categoryMap[item.categoryId] || "Unknown"
        : "Uncategorized",
      amount: Number(item._sum.amount || 0),
      count: item._count.amount,
      percentage: total > 0 ? (Number(item._sum.amount || 0) / total) * 100 : 0,
    }));

    // Get monthly breakdown using Prisma's groupBy instead of raw query
    const monthlyBreakdown = await prisma.expense.groupBy({
      by: ["date"],
      where,
      _sum: { amount: true },
      _count: { amount: true },
    });

    // Aggregate by month
    const monthlyMap = new Map<string, { amount: number; count: number }>();
    monthlyBreakdown.forEach((item) => {
      const month = item.date.toISOString().slice(0, 7); // YYYY-MM format
      const existing = monthlyMap.get(month) || { amount: 0, count: 0 };
      monthlyMap.set(month, {
        amount: existing.amount + Number(item._sum.amount || 0),
        count: existing.count + item._count.amount,
      });
    });

    const byMonth = Array.from(monthlyMap.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, 12)
      .map(([month, data]) => ({
        month,
        amount: data.amount,
        count: data.count,
      }));

    return {
      total: Number(total),
      count,
      average: Number(average),
      byCategory,
      byMonth,
    };
  },

  async getExpenseStats(userId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [totalExpenses, totalAmount, topCategories, recentExpenses] =
      await Promise.all([
        prisma.expense.count({
          where: {
            userId,
            date: { gte: startDate },
          },
        }),
        prisma.expense.aggregate({
          where: {
            userId,
            date: { gte: startDate },
          },
          _sum: { amount: true },
        }),
        prisma.expense.groupBy({
          by: ["categoryId"],
          where: {
            userId,
            date: { gte: startDate },
          },
          _sum: { amount: true },
          _count: { amount: true },
          orderBy: {
            _sum: {
              amount: "desc",
            },
          },
          take: 5,
        }),
        prisma.expense.findMany({
          where: {
            userId,
          },
          orderBy: { date: "desc" },
          take: 5,
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
        }),
      ]);

    // Get category names for top categories
    const categoryIds = topCategories
      .map((c) => c.categoryId)
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

    const topCategoriesWithDetails = topCategories.map((item) => ({
      category: item.categoryId ? categoryMap[item.categoryId] || null : null,
      amount: Number(item._sum.amount || 0),
      count: item._count.amount,
    }));

    return {
      totalExpenses,
      totalAmount: Number(totalAmount._sum.amount || 0),
      averageAmount:
        totalExpenses > 0
          ? Number(totalAmount._sum.amount || 0) / totalExpenses
          : 0,
      topCategories: topCategoriesWithDetails,
      recentExpenses,
    };
  },
};
