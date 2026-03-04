"use client";

import { useLastDrive } from "@/hooks/use-vehicle-state";
import { GlassCard } from "@/components/shared/glass-card";
import { Skeleton } from "@/components/shared/loading-skeleton";
import { Route, Clock, Zap, Gauge, MapPin, Navigation } from "lucide-react";
import { format, formatDuration, intervalToDuration } from "date-fns";
import { useSettingsStore } from "@/lib/store";
import { formatDistance, formatSpeed, convertEfficiency, efficiencyLabel } from "@/lib/units";

function shortenAddress(address: string): string {
  const parts = address.split(",");
  return parts.slice(0, 2).join(",").trim();
}

export function LastDriveCard() {
  const { data: drive, isLoading } = useLastDrive();
  const distanceUnit = useSettingsStore((s) => s.distanceUnit);

  if (isLoading) {
    return (
      <GlassCard>
        <Skeleton className="h-3 w-28 mb-4" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-6 w-20" />
        </div>
      </GlassCard>
    );
  }

  if (!drive) {
    return (
      <GlassCard
        header={{
          title: "Last Drive",
          icon: <Route className="w-4 h-4" />,
        }}
      >
        <p className="text-xs text-white/50">No drives recorded</p>
      </GlassCard>
    );
  }

  const duration = intervalToDuration({
    start: drive.started_at * 1000,
    end: drive.ended_at * 1000,
  });

  const durationStr = formatDuration(duration, {
    format: ["hours", "minutes"],
    delimiter: " ",
  });

  const efficiencyWhPerMi =
    drive.odometer_distance > 0
      ? (drive.energy_used * 1000) / drive.odometer_distance
      : null;

  const efficiency = efficiencyWhPerMi !== null
    ? convertEfficiency(efficiencyWhPerMi, distanceUnit).toFixed(0)
    : "—";

  const autopilotPct =
    drive.odometer_distance > 0
      ? ((drive.autopilot_distance / drive.odometer_distance) * 100).toFixed(0)
      : "0";

  return (
    <GlassCard
      header={{
        title: "Last Drive",
        icon: <Route className="w-4 h-4" />,
      }}
    >
      {/* Route */}
      <div className="flex items-start gap-3 mb-4">
        <div className="flex flex-col items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-tesla-success" />
          <div className="w-px h-8 bg-white/10" />
          <div className="w-2 h-2 rounded-full bg-tesla-red" />
        </div>
        <div className="flex-1 space-y-2">
          <div>
            <p className="text-xs text-white/75">
              {drive.starting_saved_location || shortenAddress(drive.starting_location)}
            </p>
            <p className="text-[10px] text-white/50">
              {format(drive.started_at * 1000, "MMM d, h:mm a")}
            </p>
          </div>
          <div>
            <p className="text-xs text-white/75">
              {drive.ending_saved_location || shortenAddress(drive.ending_location)}
            </p>
            <p className="text-[10px] text-white/50">
              {format(drive.ended_at * 1000, "h:mm a")}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-3 h-3 text-white/40" />
          <div>
            <span className="text-[10px] text-white/50 block">Distance</span>
            <span className="text-xs font-mono text-white/85">
              {formatDistance(drive.odometer_distance, distanceUnit)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3 text-white/40" />
          <div>
            <span className="text-[10px] text-white/50 block">Duration</span>
            <span className="text-xs font-mono text-white/85">{durationStr || "< 1 min"}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="w-3 h-3 text-white/40" />
          <div>
            <span className="text-[10px] text-white/50 block">Energy</span>
            <span className="text-xs font-mono text-white/85">
              {drive.energy_used.toFixed(2)} kWh
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Gauge className="w-3 h-3 text-white/40" />
          <div>
            <span className="text-[10px] text-white/50 block">Efficiency</span>
            <span className="text-xs font-mono text-tesla-success">
              {efficiency} {efficiencyLabel(distanceUnit)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Navigation className="w-3 h-3 text-white/40" />
          <div>
            <span className="text-[10px] text-white/50 block">Autopilot</span>
            <span className="text-xs font-mono text-white/85">{autopilotPct}%</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Gauge className="w-3 h-3 text-white/40" />
          <div>
            <span className="text-[10px] text-white/50 block">Max Speed</span>
            <span className="text-xs font-mono text-white/85">
              {formatSpeed(drive.max_speed, distanceUnit)}
            </span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
