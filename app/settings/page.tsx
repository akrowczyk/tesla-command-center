"use client";

import { GlassCard } from "@/components/shared/glass-card";
import { useVehicleState } from "@/hooks/use-vehicle-state";
import { useSettingsStore, useCredentialsStore, selectIsCredentialsConfigured } from "@/lib/store";
import { useAppConfig } from "@/hooks/use-app-config";
import { Slider } from "@/components/ui/slider";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Car, Paintbrush, Wrench, KeyRound, LogOut } from "lucide-react";
import { convertDistance, distanceLabel } from "@/lib/units";
import { Skeleton } from "@/components/shared/loading-skeleton";

export default function SettingsPage() {
  const { data, isLoading } = useVehicleState();
  const { data: config } = useAppConfig();
  const isConfigured = useCredentialsStore(selectIsCredentialsConfigured);
  const tessieVin = useCredentialsStore((s) => s.tessieVin);
  const clearCredentials = useCredentialsStore((s) => s.clearCredentials);

  const isByok = config?.mode === "byok" && isConfigured;

  const refreshInterval = useSettingsStore((s) => s.refreshInterval);
  const distanceUnit = useSettingsStore((s) => s.distanceUnit);
  const temperatureUnit = useSettingsStore((s) => s.temperatureUnit);
  const pressureUnit = useSettingsStore((s) => s.pressureUnit);
  const setRefreshInterval = useSettingsStore((s) => s.setRefreshInterval);
  const setDistanceUnit = useSettingsStore((s) => s.setDistanceUnit);
  const setTemperatureUnit = useSettingsStore((s) => s.setTemperatureUnit);
  const setPressureUnit = useSettingsStore((s) => s.setPressureUnit);

  const vc = data?.vehicle_config;
  const vs = data?.vehicle_state;

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      {/* Vehicle Information */}
      <GlassCard header={{ title: "Vehicle Information", icon: <Car className="w-4 h-4" /> }}>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <InfoRow label="Name" value={data?.display_name ?? "—"} />
            <InfoRow label="VIN" value={data?.vin ?? "—"} mono />
            <InfoRow label="Model" value={vc?.car_type === "modely" ? "Model Y" : vc?.car_type ?? "—"} />
            <InfoRow label="Color" value={formatColor(vc?.exterior_color)} />
            <InfoRow label="Wheels" value={vc?.wheel_type ?? "—"} />
            <InfoRow label="Drive" value={vc?.rear_drive_unit ?? "—"} />
            <InfoRow label="Driver Assist" value={vc?.driver_assist ?? "—"} />
            <InfoRow label="Software" value={vs?.car_version ?? "—"} mono />
            <InfoRow label="Odometer" value={vs ? `${Math.round(convertDistance(vs.odometer, distanceUnit)).toLocaleString()} ${distanceLabel(distanceUnit)}` : "—"} mono />
            <InfoRow label="Seat Cooling" value={vc?.has_seat_cooling ? "Yes" : "No"} />
          </div>
        )}
      </GlassCard>

      {/* Display Preferences */}
      <GlassCard header={{ title: "Display Preferences", icon: <Paintbrush className="w-4 h-4" /> }}>
        <div className="space-y-5">
          {/* Distance */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/75">Distance</span>
            <Select value={distanceUnit} onValueChange={(v) => setDistanceUnit(v as "mi" | "km")}>
              <SelectTrigger className="h-8 w-24 text-xs bg-white/[0.03] border-white/[0.08]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#12121a] border-white/[0.08]">
                <SelectItem value="mi" className="text-xs">Miles</SelectItem>
                <SelectItem value="km" className="text-xs">Kilometers</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Temperature */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/75">Temperature</span>
            <Select value={temperatureUnit} onValueChange={(v) => setTemperatureUnit(v as "F" | "C")}>
              <SelectTrigger className="h-8 w-28 text-xs bg-white/[0.03] border-white/[0.08]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#12121a] border-white/[0.08]">
                <SelectItem value="F" className="text-xs">Fahrenheit</SelectItem>
                <SelectItem value="C" className="text-xs">Celsius</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Pressure */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/75">Tire Pressure</span>
            <Select value={pressureUnit} onValueChange={(v) => setPressureUnit(v as "psi" | "bar" | "kpa")}>
              <SelectTrigger className="h-8 w-24 text-xs bg-white/[0.03] border-white/[0.08]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#12121a] border-white/[0.08]">
                <SelectItem value="psi" className="text-xs">PSI</SelectItem>
                <SelectItem value="bar" className="text-xs">Bar</SelectItem>
                <SelectItem value="kpa" className="text-xs">kPa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Refresh Interval */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/75">Refresh Interval</span>
              <span className="text-xs font-mono text-white/70">{refreshInterval}s</span>
            </div>
            <Slider
              value={[refreshInterval]}
              onValueChange={([v]) => setRefreshInterval(v)}
              min={5}
              max={120}
              step={5}
            />
            <div className="flex justify-between text-[10px] text-white/40 font-mono mt-1">
              <span>5s</span>
              <span>120s</span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Credentials (BYOK mode only) */}
      {isByok && (
        <GlassCard header={{ title: "Connection", icon: <KeyRound className="w-4 h-4" /> }}>
          <div className="space-y-3">
            <InfoRow label="Mode" value="Bring Your Own Key" />
            <InfoRow
              label="VIN"
              value={tessieVin ? `••••${tessieVin.slice(-4)}` : "—"}
              mono
            />
            <InfoRow label="API Key" value="••••••••" mono />
            <div className="pt-2 border-t border-white/[0.06]">
              <button
                onClick={clearCredentials}
                className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Disconnect &amp; clear credentials
              </button>
            </div>
          </div>
        </GlassCard>
      )}

      {/* About */}
      <GlassCard header={{ title: "About", icon: <Wrench className="w-4 h-4" /> }}>
        <div className="space-y-2">
          <InfoRow label="App" value="Tesla Command Center" />
          <InfoRow label="API" value="Tessie REST API" />
          <InfoRow label="Version" value="1.0.0" mono />
        </div>
      </GlassCard>
    </div>
  );
}

function InfoRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs text-white/60">{label}</span>
      <span className={`text-xs text-white/85 ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

function formatColor(color?: string): string {
  if (!color) return "—";
  return color.replace(/([A-Z])/g, " $1").trim();
}
