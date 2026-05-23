"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Sun, Moon, LogOut } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";

const Navbar: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <nav className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg">E</span>
        </div>
        <span className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
          ExpenseTracker
        </span>
      </div>

      {/* Right side controls */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {user && (
          <span className="hidden sm:inline text-sm text-gray-600 dark:text-gray-400 truncate max-w-[150px]">
            {user.fullName || user.email}
          </span>
        )}

        {/* Dark/Light Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Toggle theme"
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-yellow-500" />
          ) : (
            <Moon className="w-5 h-5 text-gray-700" />
          )}
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          aria-label="Logout"
        >
          <LogOut className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
