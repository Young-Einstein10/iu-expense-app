"use client";

import React, { useState } from "react";
import { Plus, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { useExpense } from "../contexts/ExpenseContext";
import { useDuration } from "../contexts/DurationContext";
import { Expense } from "../types";
import ExpenseModal from "./ExpenseModal";
import { useClickOutside } from "../hooks/useClickOutside";

const TransactionList: React.FC = () => {
  const {
    expenses,
    categories,
    deleteExpense,
    getCategoryById,
    getExpensesByDuration,
  } = useExpense();
  const { duration } = useDuration();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const actionMenuRef = useClickOutside(
    () => setShowActionMenu(null),
    !!showActionMenu,
  );

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year:
          date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  const groupTransactionsByDate = (transactions: Expense[]) => {
    const groups: { [key: string]: Expense[] } = {};

    transactions.forEach((transaction) => {
      const dateKey = new Date(transaction.date).toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(transaction);
    });

    return Object.entries(groups).sort(
      ([a], [b]) => new Date(b).getTime() - new Date(a).getTime(),
    );
  };

  const handleDelete = (id: string) => {
    deleteExpense(id);
    setShowActionMenu(null);
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setShowActionMenu(null);
    setShowAddModal(true);
  };

  const groupedTransactions = groupTransactionsByDate(
    getExpensesByDuration(duration),
  );

  return (
    <div className="mt-8 sm:mt-12 px-4 sm:px-6 py-4 bg-gray-50 dark:bg-gray-900 rounded-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            Transactions
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            You had {getExpensesByDuration(duration).length} expenses
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm sm:text-base"
        >
          <Plus className="w-4 h-4" />
          <span>Add</span>
        </button>
      </div>

      {/* Transaction List */}
      <div className="space-y-6">
        {groupedTransactions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No transactions yet
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 text-blue-500 hover:text-blue-600 rounded-full"
            >
              Add your first expense
            </button>
          </div>
        ) : (
          groupedTransactions.map(([dateKey, transactions]) => (
            <div key={dateKey}>
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                {formatDate(transactions[0].date)}
              </h4>
              <div className="space-y-2">
                {transactions.map((transaction) => {
                  const category = getCategoryById(transaction.categoryId);
                  return (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-lg hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center`}
                        >
                          <span className="text-white text-lg">
                            {category?.icon || "📌"}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-white truncate">
                            {transaction.description}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            {category?.name || "Uncategorized"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
                        <span className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">
                          -{formatAmount(transaction.amount)}
                        </span>
                        <div className="relative">
                          <button
                            onClick={() =>
                              setShowActionMenu(
                                showActionMenu === transaction.id
                                  ? null
                                  : transaction.id,
                              )
                            }
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </button>

                          {showActionMenu === transaction.id && (
                            <div
                              ref={actionMenuRef}
                              className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10"
                            >
                              <button
                                onClick={() => handleEdit(transaction)}
                                className="flex items-center space-x-2 w-full px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                              >
                                <Edit2 className="w-3 h-3" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleDelete(transaction.id)}
                                className="flex items-center space-x-2 w-full px-3 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Expense Modal */}
      <ExpenseModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingExpense(null);
        }}
        editingExpense={editingExpense}
      />
    </div>
  );
};

export default TransactionList;
