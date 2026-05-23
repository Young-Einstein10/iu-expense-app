"use client";

import React, { useState } from "react";
import { Calendar, ChevronDown, Loader2 } from "lucide-react";
import { useDuration } from "../contexts/DurationContext";
import { DurationFilter } from "../types";
import { useClickOutside } from "../hooks/useClickOutside";
import { useTotalByDurationQuery } from "../hooks/useAnalytics";

const TotalSpent: React.FC = () => {
  const { duration, setDuration } = useDuration();
  const [isOpen, setIsOpen] = useState(false);

  const { data, isLoading, error } = useTotalByDurationQuery(duration);
  const total = data?.total ?? 0;

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const durationOptions: { value: DurationFilter; label: string }[] = [
    { value: "daily", label: "Today" },
    { value: "weekly", label: "This Week" },
    { value: "monthly", label: "This Month" },
  ];

  const selectedOption = durationOptions.find(
    (option) => option.value === duration,
  );
  const dropdownRef = useClickOutside(() => setIsOpen(false), isOpen);

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-8 bg-white dark:bg-black">
      <div className="">
        <div className="flex justify-between items-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Total Spent
          </h2>

          {/* Duration Picker */}
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm sm:text-base"
            >
              <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300">
                {selectedOption?.label}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>

            {isOpen && (
              <div
                ref={dropdownRef}
                className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10"
              >
                {durationOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setDuration(option.value);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      duration === option.value
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="py-8 sm:py-12 flex items-center justify-center">
          {isLoading ? (
            <Loader2 className="w-10 h-10 text-gray-400 animate-spin" />
          ) : error ? (
            <p className="text-lg text-red-500">
              {error instanceof Error ? error.message : "Failed to fetch total"}
            </p>
          ) : (
            <p className="text-3xl sm:text-5xl font-semibold text-gray-900 dark:text-white mt-2">
              {formatAmount(total)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TotalSpent;
