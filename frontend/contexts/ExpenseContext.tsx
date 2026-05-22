"use client";

import React, { createContext, useContext, ReactNode } from "react";
import {
  Expense,
  Category,
  DurationFilter,
  ExpenseContextType,
} from "../types";
import {
  useExpensesQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
} from "../hooks/useExpenses";
import {
  useCategoriesQuery,
  useCreateCategoryMutation,
  DEFAULT_CATEGORIES,
} from "../hooks/useCategories";

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const useExpense = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error("useExpense must be used within an ExpenseProvider");
  }
  return context;
};

interface ExpenseProviderProps {
  children: ReactNode;
}

export const ExpenseProvider: React.FC<ExpenseProviderProps> = ({
  children,
}) => {
  // Use custom query hooks
  const {
    data: expenses = [],
    isLoading: expensesLoading,
    error: expensesError,
  } = useExpensesQuery();

  const {
    data: categories = DEFAULT_CATEGORIES,
    isLoading: categoriesLoading,
  } = useCategoriesQuery();

  const isLoading = expensesLoading || categoriesLoading;
  const error = expensesError
    ? expensesError instanceof Error
      ? expensesError.message
      : "Failed to load expenses"
    : null;

  // Use custom mutation hooks
  const createExpenseMutation = useCreateExpenseMutation();
  const updateExpenseMutation = useUpdateExpenseMutation();
  const deleteExpenseMutation = useDeleteExpenseMutation();
  const createCategoryMutation = useCreateCategoryMutation();

  const addExpense = async (
    expenseData: Omit<Expense, "id" | "createdAt" | "updatedAt">,
  ) => {
    await createExpenseMutation.mutateAsync(expenseData);
  };

  const updateExpense = async (id: string, expenseData: Partial<Expense>) => {
    await updateExpenseMutation.mutateAsync({ id, expenseData });
  };

  const deleteExpense = async (id: string) => {
    await deleteExpenseMutation.mutateAsync(id);
  };

  const addCategory = async (categoryData: {
    name: string;
    icon: string;
    color?: string;
  }) => {
    return await createCategoryMutation.mutateAsync(categoryData);
  };

  const getExpensesByDuration = (duration: DurationFilter): Expense[] => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);

      switch (duration) {
        case "daily":
          return expenseDate >= today;
        case "weekly":
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return expenseDate >= weekAgo;
        case "monthly":
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return expenseDate >= monthAgo;
        default:
          return true;
      }
    });
  };

  const getTotalByDuration = (duration: DurationFilter): number => {
    const filteredExpenses = getExpensesByDuration(duration);
    return filteredExpenses.reduce(
      (total, expense) => total + expense.amount,
      0,
    );
  };

  const getCategoryById = (id: string): Category | undefined => {
    return categories.find((category) => category.id === id);
  };

  const value: ExpenseContextType = {
    expenses,
    categories,
    isLoading,
    error,
    addExpense,
    updateExpense,
    deleteExpense,
    addCategory,
    getExpensesByDuration,
    getTotalByDuration,
    getCategoryById,
  };

  return (
    <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>
  );
};
