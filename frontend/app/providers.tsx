"use client";

import { ReactNode, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "../components/SessionProvider";
import { AuthProvider } from "../contexts/AuthContext";
import { ExpenseProvider } from "../contexts/ExpenseContext";
import { ThemeProvider } from "../contexts/ThemeContext";
import { DurationProvider } from "../contexts/DurationContext";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <ThemeProvider>
          <AuthProvider>
            <ExpenseProvider>
              <DurationProvider>{children}</DurationProvider>
            </ExpenseProvider>
          </AuthProvider>
        </ThemeProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}
