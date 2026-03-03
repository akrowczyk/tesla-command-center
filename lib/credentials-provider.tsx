"use client";

import { useEffect } from "react";
import { useCredentialsStore } from "@/lib/store";
import { tessie } from "@/lib/tessie";

/**
 * Bridges the Zustand credentials store to the TessieClient singleton.
 * Must be rendered inside <QueryProvider> so Zustand hydration is complete.
 */
export function CredentialsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    tessie.setCredentialsGetter(() => {
      const { tessieApiKey, tessieVin } = useCredentialsStore.getState();
      return { apiKey: tessieApiKey, vin: tessieVin };
    });
  }, []);

  return <>{children}</>;
}
