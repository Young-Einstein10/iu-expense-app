"use client";

import { useQuery } from "@tanstack/react-query";
import { useApi } from "./useApi";
import { useAuth } from "../contexts/AuthContext";
import { DurationFilter } from "../types";

export function useTotalByDurationQuery(duration: DurationFilter) {
  const api = useApi();
  const { isAuthenticated, accessToken } = useAuth();

  return useQuery({
    queryKey: ["analytics", "total", duration],
    queryFn: () => api.getTotalByDuration(duration),
    enabled: isAuthenticated && Boolean(accessToken),
  });
}

export function useDashboardQuery() {
  const api = useApi();
  const { isAuthenticated, accessToken } = useAuth();

  return useQuery({
    queryKey: ["analytics", "dashboard"],
    queryFn: () => api.getDashboard(),
    enabled: isAuthenticated && Boolean(accessToken),
  });
}
