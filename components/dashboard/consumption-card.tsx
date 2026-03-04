"use client";

import { useConsumption } from "@/hooks/use-vehicle-state";
import { GlassCard } from "@/components/shared/glass-card";
import { Skeleton } from "@/components/shared/loading-skeleton";
import { Activity, Gauge, Route, Zap } from "lucide-react";
import { useSettingsStore } from "@/lib/store";
import { formatDistance, convertEfficiency, efficiencyLabel } from "@/lib/units";

export function ConsumptionCard() {
  const { data, isLoading } = useConsumption();
  const distanceUnit = useSettingsStore((s) => s.distanceUnit);

  if (isLoading || !data) {
    return (
      <GlassCard>
        <Skeleton className="h-3 w-32 mb-4" />
        <div className="space-y-3">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-20" />
        </div>
      </GlassCard>
    );
  }

  const efficiencyWhPerMi =
    data.distance_driven > 0
      ? (data.energy_used * 1000) / data.distance_driven
      : null;

  const efficiency = efficiencyWhPerMi !== null
    ? convertEfficiency(efficiencyWhPerMi, distanceUnit).toFixed(0)
    : "—";

  return (
    <GlassCard
      header={{
        title: "Since Last Charge",
        icon: <Activity className="w-4 h-4" />,
      }}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Route className="w-3.5 h-3.5 text-white/50" />
            <span className="text-xs text-white/60">Distance</span>
          </div>
          <span className="text-sm font-mono font-bold text-white/80">
            {formatDistance(data.distance_driven, distanceUnit)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-white/50" />
            <span className="text-xs text-white/60">Energy Used</span>
          </div>
          <span className="text-sm font-mono font-bold text-white/80">
            {data.energy_used.toFixed(1)} kWh
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gauge className="w-3.5 h-3.5 text-white/50" />
            <span className="text-xs text-white/60">Efficiency</span>
          </div>
          <span className="text-sm font-mono font-bold text-tesla-success">
            {efficiency} {efficiencyLabel(distanceUnit)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-white/50" />
            <span className="text-xs text-white/60">Battery Used</span>
          </div>
          <span className="text-sm font-mono font-bold text-white/80">
            {data.battery_percent_used.toFixed(1)}%
          </span>
        </div>
      </div>
    </GlassCard>
  );
}
