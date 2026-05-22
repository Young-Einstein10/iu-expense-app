"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "./useApi";
import { useAuth } from "../contexts/AuthContext";
import { Category } from "../types";

const DEFAULT_CATEGORIES: Category[] = [
  { id: "1", name: "Groceries", icon: "🛒", color: "bg-green-500" },
  { id: "2", name: "Transport", icon: "🚗", color: "bg-blue-500" },
  { id: "3", name: "Entertainment", icon: "🎬", color: "bg-purple-500" },
  { id: "4", name: "Dining", icon: "🍽️", color: "bg-orange-500" },
  { id: "5", name: "Shopping", icon: "🛍️", color: "bg-pink-500" },
  { id: "6", name: "Bills", icon: "📄", color: "bg-red-500" },
  { id: "7", name: "Healthcare", icon: "🏥", color: "bg-cyan-500" },
  { id: "8", name: "Other", icon: "📌", color: "bg-gray-500" },
];

export { DEFAULT_CATEGORIES };

export function useCategoriesQuery() {
  const api = useApi();
  const { isAuthenticated, accessToken } = useAuth();

  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const data = await api.getCategories();
      const transformed = data.map((c) => ({
        id: c.id,
        name: c.name,
        icon: c.icon,
        color: c.color,
      })) as Category[];
      return transformed.length > 0 ? transformed : DEFAULT_CATEGORIES;
    },
    enabled: isAuthenticated && Boolean(accessToken),
  });
}

export function useCreateCategoryMutation() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryData: {
      name: string;
      icon: string;
      color?: string;
    }) => {
      const newCategory = await api.createCategory(categoryData);
      return {
        id: newCategory.id,
        name: newCategory.name,
        icon: newCategory.icon,
        color: newCategory.color || "bg-gray-500",
      } as Category;
    },
    onSuccess: (newCategory) => {
      queryClient.setQueryData<Category[]>(["categories"], (old) =>
        old ? [...old, newCategory] : [newCategory],
      );
    },
  });
}
