import { prisma } from "../config/database";
import { CustomError } from "../middleware/errorHandler";
import { CreateCategoryInput, UpdateCategoryInput } from "../types";

export const categoryService = {
  async createCategory(userId: string, data: CreateCategoryInput) {
    const { name, icon, color } = data;

    // Check if category with same name already exists for user
    const existingCategory = await prisma.category.findFirst({
      where: {
        userId,
        name: {
          equals: name,
          mode: "insensitive",
        },
      },
    });

    if (existingCategory) {
      throw new CustomError(
        "Category with this name already exists",
        409,
        "CATEGORY_EXISTS",
      );
    }

    const category = await prisma.category.create({
      data: {
        userId,
        name,
        icon,
        color: color || null,
        isDefault: false,
      },
    });

    return category;
  },

  async getCategories(userId: string, includeExpenseCount: boolean = false) {
    const categories = await prisma.category.findMany({
      where: {
        userId,
      },
      orderBy: {
        name: "asc",
      },
      ...(includeExpenseCount
        ? {
            include: {
              _count: {
                select: {
                  expenses: true,
                },
              },
            },
          }
        : {}),
    });

    return categories;
  },

  async getCategoryById(userId: string, categoryId: string) {
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId,
      },
      include: {
        _count: {
          select: {
            expenses: true,
            budgets: true,
          },
        },
      },
    });

    if (!category) {
      throw new CustomError("Category not found", 404, "CATEGORY_NOT_FOUND");
    }

    return category;
  },

  async updateCategory(
    userId: string,
    categoryId: string,
    data: UpdateCategoryInput,
  ) {
    const { name, icon } = data;

    // Verify category belongs to user
    const existingCategory = await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId,
      },
    });

    if (!existingCategory) {
      throw new CustomError("Category not found", 404, "CATEGORY_NOT_FOUND");
    }

    // Check if new name conflicts with existing category
    if (name && name.toLowerCase() !== existingCategory.name.toLowerCase()) {
      const nameConflict = await prisma.category.findFirst({
        where: {
          userId,
          name: {
            equals: name,
            mode: "insensitive",
          },
          id: {
            not: categoryId,
          },
        },
      });

      if (nameConflict) {
        throw new CustomError(
          "Category with this name already exists",
          409,
          "CATEGORY_EXISTS",
        );
      }
    }

    // Don't allow updating default categories
    if (existingCategory.isDefault) {
      throw new CustomError(
        "Cannot update default categories",
        400,
        "CANNOT_UPDATE_DEFAULT",
      );
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (icon !== undefined) updateData.icon = icon;

    const category = await prisma.category.update({
      where: { id: categoryId },
      data: updateData,
    });

    return category;
  },

  async deleteCategory(userId: string, categoryId: string) {
    // Verify category belongs to user
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId,
      },
      include: {
        _count: {
          select: {
            expenses: true,
            budgets: true,
          },
        },
      },
    });

    if (!category) {
      throw new CustomError("Category not found", 404, "CATEGORY_NOT_FOUND");
    }

    // Don't allow deleting default categories
    if (category.isDefault) {
      throw new CustomError(
        "Cannot delete default categories",
        400,
        "CANNOT_DELETE_DEFAULT",
      );
    }

    // Check if category has expenses or budgets
    if (category._count.expenses > 0 || category._count.budgets > 0) {
      throw new CustomError(
        "Cannot delete category with existing expenses or budgets",
        400,
        "CATEGORY_IN_USE",
      );
    }

    await prisma.category.delete({
      where: { id: categoryId },
    });

    return { id: categoryId };
  },

  async createDefaultCategories(userId: string) {
    const defaultCategories = [
      { name: "Groceries", icon: "🛒", color: "bg-green-500" },
      { name: "Transport", icon: "🚗", color: "bg-blue-500" },
      { name: "Entertainment", icon: "🎬", color: "bg-purple-500" },
      { name: "Dining", icon: "🍽️", color: "bg-orange-500" },
      { name: "Shopping", icon: "🛍️", color: "bg-pink-500" },
      { name: "Bills", icon: "📄", color: "bg-red-500" },
      { name: "Healthcare", icon: "🏥", color: "bg-cyan-500" },
      { name: "Other", icon: "📌", color: "bg-gray-500" },
    ];

    await prisma.category.createMany({
      data: defaultCategories.map((cat) => ({
        userId,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        isDefault: true,
      })),
      skipDuplicates: true,
    });

    return prisma.category.findMany({
      where: { userId, isDefault: true },
      orderBy: { name: "asc" },
    });
  },

  async getCategoryStats(userId: string) {
    const categories = await prisma.category.findMany({
      where: {
        userId,
      },
      include: {
        _count: {
          select: {
            expenses: true,
          },
        },
        expenses: {
          select: {
            amount: true,
            date: true,
          },
        },
      },
    });

    const categoriesWithStats = categories.map((category) => {
      const totalAmount = category.expenses.reduce(
        (sum, expense) => sum + Number(expense.amount),
        0,
      );
      const averageAmount =
        category._count.expenses > 0
          ? totalAmount / category._count.expenses
          : 0;

      return {
        id: category.id,
        name: category.name,
        icon: category.icon,
        color: category.color,
        isDefault: category.isDefault,
        expenseCount: category._count.expenses,
        totalAmount,
        averageAmount,
        lastUsed:
          category.expenses.length > 0
            ? new Date(
                Math.max(...category.expenses.map((e) => e.date.getTime())),
              )
            : null,
      };
    });

    return categoriesWithStats;
  },
};
