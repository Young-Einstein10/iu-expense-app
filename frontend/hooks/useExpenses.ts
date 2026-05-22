"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "./useApi";
import { useAuth } from "../contexts/AuthContext";
import { Expense } from "../types";

export function useExpensesQuery() {
  const api = useApi();
  const { isAuthenticated, accessToken } = useAuth();

  return useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      const response = await api.getExpenses({ limit: 1000 });
      return response.data.map((e) => ({
        id: e.id,
        amount: parseFloat(e.amount),
        description: e.description,
        categoryId: e.categoryId || "",
        date: e.date,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
      })) as Expense[];
    },
    enabled: isAuthenticated && Boolean(accessToken),
  });
}

export function useCreateExpenseMutation() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      expenseData: Omit<Expense, "id" | "createdAt" | "updatedAt">,
    ) => {
      const newExpense = await api.createExpense({
        amount: expenseData.amount,
        description: expenseData.description,
        date: expenseData.date.split("T")[0],
        categoryId: expenseData.categoryId || undefined,
      });
      return {
        id: newExpense.id,
        amount: parseFloat(newExpense.amount),
        description: newExpense.description,
        categoryId: newExpense.categoryId || "",
        date: newExpense.date,
        createdAt: newExpense.createdAt,
        updatedAt: newExpense.updatedAt,
      } as Expense;
    },
    onSuccess: (newExpense) => {
      queryClient.setQueryData<Expense[]>(["expenses"], (old) =>
        old ? [newExpense, ...old] : [newExpense],
      );
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

export function useUpdateExpenseMutation() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      expenseData,
    }: {
      id: string;
      expenseData: Partial<Expense>;
    }) => {
      const updatedExpense = await api.updateExpense(id, {
        amount: expenseData.amount,
        description: expenseData.description,
        date: expenseData.date?.split("T")[0],
        categoryId: expenseData.categoryId || undefined,
      });
      return {
        id: updatedExpense.id,
        amount: parseFloat(updatedExpense.amount),
        description: updatedExpense.description,
        categoryId: updatedExpense.categoryId || "",
        date: updatedExpense.date,
        createdAt: updatedExpense.createdAt,
        updatedAt: updatedExpense.updatedAt,
      } as Expense;
    },
    onSuccess: (updatedExpense) => {
      queryClient.setQueryData<Expense[]>(["expenses"], (old) =>
        old
          ? old.map((e) => (e.id === updatedExpense.id ? updatedExpense : e))
          : [],
      );
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

export function useDeleteExpenseMutation() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.deleteExpense(id);
      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.setQueryData<Expense[]>(["expenses"], (old) =>
        old ? old.filter((e) => e.id !== deletedId) : [],
      );
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}
