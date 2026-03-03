"use client";

import { useState } from "react";
import { Loader2, ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { useCredentialsStore } from "@/lib/store";
import { useAppConfig } from "@/hooks/use-app-config";

export function SetupScreen() {
  const { data: config } = useAppConfig();
  const setCredentials = useCredentialsStore((s) => s.setCredentials);

  const [apiKey, setApiKey] = useState("");
  const [vin, setVin] = useState("");
  const [mapsKey, setMapsKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = apiKey.trim().length > 0 && vin.trim().length >= 17;

  async function handleConnect() {
    setError(null);
    setIsValidating(true);

    try {
      // Validate by making a real API call with the provided credentials
      const res = await fetch("/api/tessie/state?use_cache=true", {
        headers: {
          "Content-Type": "application/json",
          "X-Tessie-Key": apiKey.trim(),
          "X-Tessie-VIN": vin.trim(),
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(
          data?.error || `Validation failed (${res.status}). Check your API key and VIN.`
        );
      }

      // Credentials are valid — persist them
      setCredentials(apiKey.trim(), vin.trim(), mapsKey.trim() || undefined);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not connect. Please check your credentials."
      );
    } finally {
      setIsValidating(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] p-4">
      {/* Subtle gradient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/[0.03] rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="rounded-2xl border border-white/[0.06] bg-[#12121a]/80 backdrop-blur-xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-xl bg-white/[0.06] flex items-center justify-center">
              <svg viewBox="0 0 32 32" className="w-8 h-8" fill="white">
                <path d="M16 4c-2.4 0-7.8 1.2-11.2 2.7l1.8 3.6c2.4-0.9 5.7-1.65 9.4-1.65s7 0.75 9.4 1.65l1.8-3.6C23.8 5.2 18.4 4 16 4zM16 11.8c-1.5 0-2.85 0.15-3.9 0.3L16 28l3.9-15.9c-1.05-0.15-2.4-0.3-3.9-0.3z" />
              </svg>
            </div>
          </div>

          <h1 className="text-xl font-semibold text-center mb-1">
            Tesla Command Center
          </h1>
          <p className="text-sm text-white/50 text-center mb-8">
            Connect your Tessie account to get started
          </p>

          {/* Form */}
          <div className="space-y-4">
            {/* API Key */}
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5 uppercase tracking-wider">
                Tessie API Key
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your Tessie API key"
                  className="w-full h-11 rounded-lg bg-white/[0.04] border border-white/[0.08] px-3 pr-10 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showApiKey ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* VIN */}
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5 uppercase tracking-wider">
                Vehicle VIN
              </label>
              <input
                type="text"
                value={vin}
                onChange={(e) => setVin(e.target.value.toUpperCase())}
                placeholder="e.g. 5YJ3E1EA1PF000000"
                maxLength={17}
                className="w-full h-11 rounded-lg bg-white/[0.04] border border-white/[0.08] px-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors font-mono tracking-wide"
              />
              <p className="mt-1 text-[11px] text-white/30">
                17-character Vehicle Identification Number
              </p>
            </div>

            {/* Google Maps Key (optional, only if deployer didn't set one) */}
            {config && !config.hasGoogleMapsKey && (
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1.5 uppercase tracking-wider">
                  Google Maps API Key{" "}
                  <span className="text-white/30 normal-case">(optional)</span>
                </label>
                <input
                  type="text"
                  value={mapsKey}
                  onChange={(e) => setMapsKey(e.target.value)}
                  placeholder="For drive replay map features"
                  className="w-full h-11 rounded-lg bg-white/[0.04] border border-white/[0.08] px-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors"
                />
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3">
                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleConnect}
              disabled={!canSubmit || isValidating}
              className="w-full h-11 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-white/[0.06] disabled:text-white/30 text-white font-medium text-sm flex items-center justify-center gap-2 transition-colors mt-2"
            >
              {isValidating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  Connect
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Help text */}
          <div className="mt-6 pt-5 border-t border-white/[0.06]">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500/60 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-white/40 leading-relaxed">
                Your credentials are stored locally in your browser and sent
                directly to the Tessie API through this server. They are never
                stored on the server.
              </p>
            </div>
          </div>
        </div>

        {/* Footer link */}
        <p className="text-center text-xs text-white/25 mt-4">
          Need an API key?{" "}
          <a
            href="https://my.tessie.com/settings/api"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400/60 hover:text-blue-400 transition-colors"
          >
            Get one from Tessie
          </a>
        </p>
      </div>
    </div>
  );
}
