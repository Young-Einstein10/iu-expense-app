import { Request } from "express";

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  fullName?: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  icon: string;
  color?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Expense {
  id: string;
  userId: string;
  categoryId?: string;
  amount: number;
  description: string;
  date: Date;
  receiptUrl?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  amount: number;
  period: "monthly" | "weekly" | "yearly";
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecurringExpense {
  id: string;
  userId: string;
  categoryId?: string;
  amount: number;
  description: string;
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  nextDueDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Auth Types
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  fullName?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    fullName?: string;
  };
  tokens: {
    accessToken: string;
    refreshToken?: string;
  };
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    timestamp: string;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface ExpenseFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  categories?: string[];
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  tags?: string[];
}

export interface ExpenseSummary {
  total: number;
  count: number;
  average: number;
  byCategory: {
    categoryId: string;
    categoryName: string;
    amount: number;
    count: number;
    percentage: number;
  }[];
  byMonth: {
    month: string;
    amount: number;
    count: number;
  }[];
}

// Analytics Types
export interface SpendingTrend {
  period: string;
  amount: number;
  count: number;
  category: string;
}

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  amount: number;
  percentage: number;
  count: number;
  averageAmount: number;
}

export interface MonthlyReport {
  month: string;
  totalExpenses: number;
  totalAmount: number;
  categoryBreakdown: CategoryBreakdown[];
  dailyAverage: number;
  topExpenses: Expense[];
  budgetComparison?: {
    budgetAmount: number;
    spentAmount: number;
    remaining: number;
    percentage: number;
  };
}

// Error Types
export interface AppError extends Error {
  statusCode: number;
  code: string;
  isOperational: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

// Database Options
export interface FindManyOptions {
  skip?: number;
  take?: number;
  orderBy?: Record<string, "asc" | "desc">;
  where?: Record<string, unknown>;
  include?: Record<string, boolean>;
  select?: Record<string, boolean>;
}

// Input types from validation
export interface LoginInput {
  email: string;
  password: string;
}

export interface SignupInput {
  email: string;
  password: string;
  fullName?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface CreateExpenseInput {
  amount: number;
  description: string;
  date: string;
  categoryId?: string;
  receiptUrl?: string;
  tags: string[];
}

export interface UpdateExpenseInput extends Partial<CreateExpenseInput> {
  id: string;
}

export interface ExpenseQueryInput {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  tags?: string;
  sortBy?: "date" | "amount" | "description";
  sortOrder?: "asc" | "desc";
}

export interface CreateCategoryInput {
  name: string;
  icon: string;
  color?: string;
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {
  id: string;
}

export interface CreateBudgetInput {
  categoryId: string;
  amount: number;
  period: "monthly" | "weekly" | "yearly";
  startDate: string;
  endDate: string;
}

export interface UpdateBudgetInput extends Partial<CreateBudgetInput> {
  id: string;
}

export interface CreateRecurringExpenseInput {
  amount: number;
  description: string;
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  nextDueDate: string;
  categoryId?: string;
}

export interface UpdateRecurringExpenseInput extends Partial<CreateRecurringExpenseInput> {
  id: string;
}

export interface AnalyticsQueryInput {
  startDate: string;
  endDate: string;
  categoryId?: string;
  groupBy?: "day" | "week" | "month" | "year";
}
