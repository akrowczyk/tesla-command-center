"use client";

import { useQuery } from "@tanstack/react-query";

export interface AppConfig {
  mode: "self-hosted" | "byok";
  hasGoogleMapsKey: boolean;
}

export function useAppConfig() {
  return useQuery<AppConfig>({
    queryKey: ["app-config"],
    queryFn: async () => {
      const res = await fetch("/api/config");
      if (!res.ok) throw new Error("Failed to load app config");
      return res.json();
    },
    staleTime: Infinity,
  });
}
