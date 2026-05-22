import { z } from "zod";

// Auth Validation Schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    ),
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters long")
    .optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    ),
});

// Expense Validation Schemas
export const createExpenseSchema = z.object({
  amount: z
    .number()
    .positive("Amount must be greater than 0")
    .max(999999.99, "Amount is too large"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(255, "Description is too long"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format. Use YYYY-MM-DD"),
  categoryId: z.string().uuid("Invalid category ID").optional(),
  receiptUrl: z
    .string()
    .url("Invalid receipt URL")
    .optional()
    .or(z.literal("")),
  tags: z
    .array(z.string().max(50, "Tag is too long"))
    .max(10, "Too many tags")
    .default([]),
});

export const updateExpenseSchema = createExpenseSchema.partial();

export const expenseQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid start date format")
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid end date format")
    .optional(),
  categoryId: z.string().uuid("Invalid category ID").optional(),
  minAmount: z.coerce.number().positive().optional(),
  maxAmount: z.coerce.number().positive().optional(),
  search: z.string().max(100, "Search term is too long").optional(),
  tags: z.string().optional(), // Comma-separated tags
  sortBy: z.enum(["date", "amount", "description"]).default("date"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Category Validation Schemas
export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(50, "Category name is too long"),
  icon: z.string().min(1, "Icon is required").max(50, "Icon name is too long"),
  color: z.string().max(50, "Color value is too long").optional(),
});

export const updateCategorySchema = createCategorySchema.partial().extend({
  id: z.string().uuid("Invalid category ID"),
});

// Budget Validation Schemas
const budgetBaseSchema = z.object({
  categoryId: z.string().uuid("Invalid category ID"),
  amount: z
    .number()
    .positive("Amount must be greater than 0")
    .max(999999.99, "Amount is too large"),
  period: z.enum(["monthly", "weekly", "yearly"], {
    errorMap: () => ({ message: "Period must be monthly, weekly, or yearly" }),
  }),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid start date format"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid end date format"),
});

export const createBudgetSchema = budgetBaseSchema.refine(
  (data) => new Date(data.endDate) > new Date(data.startDate),
  {
    message: "End date must be after start date",
    path: ["endDate"],
  },
);

export const updateBudgetSchema = budgetBaseSchema.partial().extend({
  id: z.string().uuid("Invalid budget ID"),
});

// Recurring Expense Validation Schemas
export const createRecurringExpenseSchema = z.object({
  amount: z
    .number()
    .positive("Amount must be greater than 0")
    .max(999999.99, "Amount is too large"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(255, "Description is too long"),
  frequency: z.enum(["daily", "weekly", "monthly", "yearly"], {
    errorMap: () => ({
      message: "Frequency must be daily, weekly, monthly, or yearly",
    }),
  }),
  nextDueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid next due date format"),
  categoryId: z.string().uuid("Invalid category ID").optional(),
});

export const updateRecurringExpenseSchema = createRecurringExpenseSchema
  .partial()
  .extend({
    id: z.string().uuid("Invalid recurring expense ID"),
  });

// Analytics Query Validation
export const analyticsQuerySchema = z
  .object({
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid start date format"),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid end date format"),
    categoryId: z.string().uuid("Invalid category ID").optional(),
    groupBy: z.enum(["day", "week", "month", "year"]).default("month"),
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: "End date must be after or equal to start date",
    path: ["endDate"],
  });

// Duration Total Query Validation
export const durationTotalQuerySchema = z.object({
  duration: z.enum(["daily", "weekly", "monthly"], {
    errorMap: () => ({ message: "Duration must be daily, weekly, or monthly" }),
  }),
});

export type DurationTotalQueryInput = z.infer<typeof durationTotalQuerySchema>;

// UUID Validation
export const uuidSchema = z.string().uuid("Invalid ID format");

// UUID Params Validation (for route parameters)
export const uuidParamsSchema = z.object({
  id: z.string().uuid("Invalid ID format"),
});

// Pagination Validation
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// Export types for use in controllers
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type ExpenseQueryInput = z.infer<typeof expenseQuerySchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
export type CreateRecurringExpenseInput = z.infer<
  typeof createRecurringExpenseSchema
>;
export type UpdateRecurringExpenseInput = z.infer<
  typeof updateRecurringExpenseSchema
>;
export type AnalyticsQueryInput = z.infer<typeof analyticsQuerySchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
