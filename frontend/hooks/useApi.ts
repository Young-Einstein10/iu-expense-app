"use client";

import { useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { createApiClient } from "../lib/api";

export function useApi() {
  const { accessToken } = useAuth();

  const api = useMemo(() => createApiClient(accessToken), [accessToken]);

  return api;
}
