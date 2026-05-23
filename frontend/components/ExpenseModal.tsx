"use client";

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  type FC,
  type FormEvent,
  type ChangeEvent,
  type ReactNode,
} from "react";
import { X, DollarSign, Calendar, type LucideIcon } from "lucide-react";
import { useExpense } from "../contexts/ExpenseContext";
import CategoryInput from "./CategoryInput";
import { Expense } from "../types";
import { useFocusTrap } from "../hooks/useFocusTrap";

interface FormData {
  amount: string;
  description: string;
  categoryId: string;
  date: string;
}

type FormField = keyof FormData;
type FormErrors = Partial<Record<FormField, string>>;

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingExpense?: Expense | null;
}

interface InputFieldProps {
  label: string;
  error?: string;
  icon?: LucideIcon;
  children: ReactNode;
}

const TODAY = () => new Date().toISOString().split("T")[0];

const INITIAL_FORM_DATA = (categoryId: string): FormData => ({
  amount: "",
  description: "",
  categoryId,
  date: TODAY(),
});

const InputField: FC<InputFieldProps> = ({
  label,
  error,
  icon: Icon,
  children,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
      )}
      {children}
    </div>
    {error && (
      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
    )}
  </div>
);

const ExpenseModal: FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  editingExpense,
}) => {
  const { addExpense, updateExpense, categories, addCategory } = useExpense();
  const modalRef = useFocusTrap(isOpen);

  const defaultCategoryId = useMemo(
    () => categories[0]?.id || "",
    [categories],
  );

  const initialFormData = useMemo<FormData>(() => {
    if (editingExpense) {
      return {
        amount: editingExpense.amount.toString(),
        description: editingExpense.description,
        categoryId: editingExpense.categoryId,
        date: editingExpense.date.split("T")[0],
      };
    }
    return INITIAL_FORM_DATA(defaultCategoryId);
  }, [editingExpense, defaultCategoryId]);

  const formKey = useMemo(
    () => `${editingExpense?.id ?? "new"}-${isOpen}`,
    [editingExpense?.id, isOpen],
  );

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setErrors({});
  }, [initialFormData]);

  // Reset form when modal opens or editing expense changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(resetForm, [formKey]);

  const inputClassName = useCallback(
    (hasError: boolean, hasIcon = true) =>
      `w-full ${hasIcon ? "pl-10" : "px-3"} pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
        hasError ? "border-red-500" : "border-gray-300"
      }`,
    [],
  );

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (!formData.categoryId) {
      newErrors.categoryId = "Category is required";
    }
    if (!formData.date) {
      newErrors.date = "Date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleInputChange = useCallback((field: FormField, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  }, []);

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!validateForm()) return;

      const expenseData = {
        amount: parseFloat(formData.amount),
        description: formData.description.trim(),
        categoryId: formData.categoryId,
        date: new Date(formData.date).toISOString(),
      };

      if (editingExpense) {
        updateExpense(editingExpense.id, expenseData);
      } else {
        addExpense(expenseData);
      }

      onClose();
    },
    [
      formData,
      editingExpense,
      validateForm,
      addExpense,
      updateExpense,
      onClose,
    ],
  );

  const modalTitle = editingExpense ? "Edit Expense" : "Add Expense";
  const submitButtonText = editingExpense ? "Update Expense" : "Add Expense";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 sm:p-4">
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-t-xl sm:rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h2
            id="modal-title"
            className="text-xl font-semibold text-gray-900 dark:text-white"
          >
            {modalTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <InputField label="Amount" error={errors.amount} icon={DollarSign}>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleInputChange("amount", e.target.value)
              }
              className={inputClassName(!!errors.amount)}
              placeholder="0.00"
            />
          </InputField>

          <InputField label="Description" error={errors.description}>
            <input
              type="text"
              value={formData.description}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleInputChange("description", e.target.value)
              }
              className={inputClassName(!!errors.description, false)}
              placeholder="e.g., Coffee at Starbucks"
            />
          </InputField>

          <InputField label="Category" error={errors.categoryId}>
            <CategoryInput
              categories={categories}
              selectedCategoryId={formData.categoryId}
              onCategoryChange={(categoryId) =>
                handleInputChange("categoryId", categoryId)
              }
              onAddCategory={addCategory}
              inputClassName={inputClassName(!!errors.categoryId, false)}
            />
          </InputField>

          <InputField label="Date" error={errors.date} icon={Calendar}>
            <input
              type="date"
              value={formData.date}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleInputChange("date", e.target.value)
              }
              max={TODAY()}
              className={inputClassName(!!errors.date)}
            />
          </InputField>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              {submitButtonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseModal;
