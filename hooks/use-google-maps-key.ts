"use client";

import { useCredentialsStore } from "@/lib/store";

/**
 * Returns the best available Google Maps API key:
 *   1. Server-provided via NEXT_PUBLIC env var (deployer-configured)
 *   2. User-provided via BYOK credentials store
 *   3. null (no Maps key available)
 */
export function useGoogleMapsKey(): string | null {
  const storeKey = useCredentialsStore((s) => s.googleMapsApiKey);
  return process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || storeKey || null;
}
