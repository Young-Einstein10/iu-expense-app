export interface Expense {
  id: string;
  amount: number;
  description: string;
  categoryId: string;
  date: string; // ISO string
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export type DurationFilter = "daily" | "weekly" | "monthly";

export interface ExpenseState {
  expenses: Expense[];
  categories: Category[];
  isLoading: boolean;
  error: string | null;
}

export interface ExpenseContextType extends ExpenseState {
  addExpense: (
    expense: Omit<Expense, "id" | "createdAt" | "updatedAt">,
  ) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  addCategory: (category: {
    name: string;
    icon: string;
    color?: string;
  }) => Promise<Category>;
  getExpensesByDuration: (duration: DurationFilter) => Expense[];
  getTotalByDuration: (duration: DurationFilter) => number;
  getCategoryById: (id: string) => Category | undefined;
}

export interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}
