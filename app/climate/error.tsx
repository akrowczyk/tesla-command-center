"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function ClimateError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Climate error:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[400px] animate-fade-in">
      <div className="glass-card max-w-md text-center p-8">
        <div className="w-12 h-12 rounded-full bg-tesla-warning/10 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6 text-tesla-warning" />
        </div>
        <h2 className="text-lg font-medium text-white mb-2">Climate Controls Unavailable</h2>
        <p className="text-sm text-white/60 mb-6 font-mono">
          {error.message || "Unable to load climate controls. The vehicle may be asleep."}
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-white/[0.05] border border-white/[0.08] text-white/80 hover:bg-white/[0.08] hover:text-white transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    </div>
  );
}
