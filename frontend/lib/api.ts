import { signOut } from "next-auth/react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

interface ApiResponse<T> {
  data: T;
  message?: string;
  meta?: {
    timestamp: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

interface ApiError {
  error: {
    code: string;
    message: string;
  };
}

class ApiClient {
  constructor(private token: string | null = null) {}

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${API_URL}${endpoint}`;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)["Authorization"] =
        `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      // Auto-logout on 401 Unauthorized (token expired/invalid)
      if (response.status === 401) {
        signOut({ redirect: true, callbackUrl: "/login" });
        throw new Error("Session expired. Please log in again.");
      }
      throw new Error((data as ApiError).error?.message || "Request failed");
    }

    return data;
  }

  // Expense endpoints
  async getExpenses(params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    categoryId?: string;
    search?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    const response = await this.request<
      ApiResponse<
        Array<{
          id: string;
          amount: string;
          description: string;
          date: string;
          categoryId: string | null;
          category: {
            id: string;
            name: string;
            icon: string;
            color: string;
          } | null;
          tags: string[];
          createdAt: string;
          updatedAt: string;
        }>
      >
    >(`/expenses${query ? `?${query}` : ""}`);
    return response;
  }

  async createExpense(data: {
    amount: number;
    description: string;
    date: string;
    categoryId?: string;
    tags?: string[];
  }) {
    const response = await this.request<
      ApiResponse<{
        id: string;
        amount: string;
        description: string;
        date: string;
        categoryId: string | null;
        category: {
          id: string;
          name: string;
          icon: string;
          color: string;
        } | null;
        createdAt: string;
        updatedAt: string;
      }>
    >("/expenses", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async updateExpense(
    id: string,
    data: {
      amount?: number;
      description?: string;
      date?: string;
      categoryId?: string;
      tags?: string[];
    },
  ) {
    const response = await this.request<
      ApiResponse<{
        id: string;
        amount: string;
        description: string;
        date: string;
        categoryId: string | null;
        category: {
          id: string;
          name: string;
          icon: string;
          color: string;
        } | null;
        createdAt: string;
        updatedAt: string;
      }>
    >(`/expenses/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async deleteExpense(id: string) {
    await this.request(`/expenses/${id}`, { method: "DELETE" });
  }

  // Category endpoints
  async getCategories() {
    const response = await this.request<
      ApiResponse<
        Array<{
          id: string;
          name: string;
          icon: string;
          color: string;
          isDefault: boolean;
        }>
      >
    >("/categories");
    return response.data;
  }

  async createCategory(data: { name: string; icon: string; color?: string }) {
    const response = await this.request<
      ApiResponse<{
        id: string;
        name: string;
        icon: string;
        color: string;
      }>
    >("/categories", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.data;
  }

  // Analytics endpoints
  async getTotalByDuration(duration: "daily" | "weekly" | "monthly") {
    const response = await this.request<
      ApiResponse<{
        total: number;
        count: number;
        duration: string;
        startDate: string;
        endDate: string;
      }>
    >(`/analytics/total?duration=${duration}`);
    return response.data;
  }

  async getDashboard() {
    const response = await this.request<
      ApiResponse<{
        currentMonth: {
          totalAmount: number;
          totalExpenses: number;
          dailyAverage: number;
        };
        yearToDate: {
          totalAmount: number;
          totalExpenses: number;
          monthlyAverage: number;
        };
        recentTrends: Array<{ period: string; amount: number }>;
        topCategories: Array<{
          category: {
            id: string;
            name: string;
            icon: string;
            color: string;
          } | null;
          amount: number;
          count: number;
        }>;
        recentExpenses: Array<{
          id: string;
          amount: string;
          description: string;
          date: string;
          category: {
            id: string;
            name: string;
            icon: string;
            color: string;
          } | null;
        }>;
      }>
    >("/analytics/dashboard");
    return response.data;
  }
}

export const createApiClient = (token: string | null) => new ApiClient(token);
export type { ApiResponse, ApiError, ApiClient };
