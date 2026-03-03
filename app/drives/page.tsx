"use client";

import { useState } from "react";
import { GlassCard } from "@/components/shared/glass-card";
import { StatCard } from "@/components/shared/stat-card";
import { Skeleton } from "@/components/shared/loading-skeleton";
import { useDrives } from "@/hooks/use-vehicle-state";
import { useQueryClient } from "@tanstack/react-query";
import { tessie } from "@/lib/tessie";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Route, Zap, Gauge } from "lucide-react";
import { format, formatDuration, intervalToDuration, subDays } from "date-fns";
import { useSettingsStore } from "@/lib/store";
import { formatDistance, convertDistance, convertEfficiency, efficiencyLabel, distanceLabel } from "@/lib/units";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line,
} from "recharts";

const CHART_TOOLTIP_STYLE = {
  contentStyle: {
    background: "#12121a",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "8px",
    fontSize: "11px",
    color: "#fff",
  },
};

export default function DrivesPage() {
  const distanceUnit = useSettingsStore((s) => s.distanceUnit);
  const [dateRange, setDateRange] = useState("30");
  const fromTs = Math.floor(subDays(new Date(), Number(dateRange)).getTime() / 1000);

  const { data, isLoading } = useDrives({ from: fromTs, limit: 100 });
  const drives = data?.results ?? [];

  // Aggregate stats
  const totalMiles = drives.reduce((sum, d) => sum + d.odometer_distance, 0);
  const totalEnergy = drives.reduce((sum, d) => sum + d.energy_used, 0);
  const avgEfficiencyWhPerMi =
    totalMiles > 0 ? (totalEnergy * 1000) / totalMiles : 0;
  const avgEfficiency = Math.round(convertEfficiency(avgEfficiencyWhPerMi, distanceUnit));

  // Weekly miles chart data
  const weeklyData = (() => {
    const weeks: Record<string, { miles: number; energy: number }> = {};
    drives.forEach((d) => {
      const weekKey = format(d.started_at * 1000, "MMM d");
      if (!weeks[weekKey]) weeks[weekKey] = { miles: 0, energy: 0 };
      weeks[weekKey].miles += convertDistance(d.odometer_distance, distanceUnit);
      weeks[weekKey].energy += d.energy_used;
    });
    return Object.entries(weeks)
      .map(([week, data]) => ({
        week,
        miles: Math.round(data.miles * 10) / 10,
        energy: Math.round(data.energy * 100) / 100,
      }))
      .reverse()
      .slice(-12);
  })();

  // Efficiency trend
  const efficiencyTrend = drives
    .filter((d) => d.odometer_distance > 0.5)
    .map((d) => ({
      date: format(d.started_at * 1000, "MMM d"),
      efficiency: Math.round(convertEfficiency((d.energy_used * 1000) / d.odometer_distance, distanceUnit)),
    }))
    .reverse()
    .slice(-20);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Total Distance"
          value={convertDistance(totalMiles, distanceUnit).toFixed(1)}
          unit={distanceLabel(distanceUnit)}
          icon={Route}
        />
        <StatCard
          label="Total Energy"
          value={totalEnergy.toFixed(1)}
          unit="kWh"
          icon={Zap}
        />
        <StatCard
          label="Avg Efficiency"
          value={avgEfficiency}
          unit={efficiencyLabel(distanceUnit)}
          icon={Gauge}
        />
      </div>

      {/* Drive History Table */}
      <GlassCard
        header={{
          title: "Drive History",
          icon: <Route className="w-4 h-4" />,
          action: (
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="h-7 w-28 text-[11px] bg-white/[0.03] border-white/[0.08]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#12121a] border-white/[0.08]">
                <SelectItem value="7" className="text-xs">7 days</SelectItem>
                <SelectItem value="30" className="text-xs">30 days</SelectItem>
                <SelectItem value="90" className="text-xs">90 days</SelectItem>
                <SelectItem value="365" className="text-xs">1 year</SelectItem>
              </SelectContent>
            </Select>
          ),
        }}
      >
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : drives.length === 0 ? (
          <p className="text-xs text-white/30 text-center py-8">No drives recorded in this period</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/[0.06] hover:bg-transparent">
                  <TableHead className="text-[11px] text-white/40">Date</TableHead>
                  <TableHead className="text-[11px] text-white/40">From</TableHead>
                  <TableHead className="text-[11px] text-white/40">To</TableHead>
                  <TableHead className="text-[11px] text-white/40 text-right">Distance</TableHead>
                  <TableHead className="text-[11px] text-white/40 text-right">Duration</TableHead>
                  <TableHead className="text-[11px] text-white/40 text-right">Energy</TableHead>
                  <TableHead className="text-[11px] text-white/40 text-right">Efficiency</TableHead>
                  <TableHead className="text-[11px] text-white/40">Tag</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drives.map((drive) => {
                  const duration = intervalToDuration({
                    start: drive.started_at * 1000,
                    end: drive.ended_at * 1000,
                  });
                  const efficiency =
                    drive.odometer_distance > 0
                      ? Math.round(convertEfficiency((drive.energy_used * 1000) / drive.odometer_distance, distanceUnit))
                      : 0;

                  return (
                    <TableRow key={drive.id} className="border-white/[0.04] hover:bg-white/[0.02]">
                      <TableCell className="text-xs font-mono text-white/60">
                        {format(drive.started_at * 1000, "MMM d, h:mm a")}
                      </TableCell>
                      <TableCell className="text-xs text-white/60 max-w-[160px] truncate">
                        {drive.starting_saved_location || drive.starting_location.split(",")[0]}
                      </TableCell>
                      <TableCell className="text-xs text-white/60 max-w-[160px] truncate">
                        {drive.ending_saved_location || drive.ending_location.split(",")[0]}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-white/70 text-right">
                        {formatDistance(drive.odometer_distance, distanceUnit)}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-white/60 text-right">
                        {formatDuration(duration, { format: ["minutes"] }) || "< 1 min"}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-white/70 text-right">
                        {drive.energy_used.toFixed(2)} kWh
                      </TableCell>
                      <TableCell className="text-xs font-mono text-right">
                        <span className={efficiency < 300 ? "text-tesla-success" : efficiency < 400 ? "text-tesla-warning" : "text-tesla-red"}>
                          {efficiency} {efficiencyLabel(distanceUnit)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DriveTagSelector driveId={drive.id} currentTag={drive.tag} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </GlassCard>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly miles */}
        {weeklyData.length > 0 && (
          <GlassCard header={{ title: `${distanceUnit === "km" ? "Kilometers" : "Miles"} per Day`, icon: <Route className="w-4 h-4" /> }}>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <XAxis
                    dataKey="week"
                    tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip {...CHART_TOOLTIP_STYLE} />
                  <Bar dataKey="miles" fill="#e31937" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        )}

        {/* Efficiency trend */}
        {efficiencyTrend.length > 0 && (
          <GlassCard header={{ title: "Efficiency Trend", icon: <Gauge className="w-4 h-4" /> }}>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={efficiencyTrend}>
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip {...CHART_TOOLTIP_STYLE} />
                  <Line
                    type="monotone"
                    dataKey="efficiency"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}

function DriveTagSelector({ driveId, currentTag }: { driveId: number; currentTag: string | null }) {
  const [tag, setTag] = useState(currentTag ?? "none");
  const queryClient = useQueryClient();

  return (
    <Select
      value={tag}
      onValueChange={async (newTag) => {
        setTag(newTag);
        if (newTag !== "none") {
          await tessie.setDriveTag(driveId, newTag);
          queryClient.invalidateQueries({ queryKey: ["drives"] });
        }
      }}
    >
      <SelectTrigger className="h-6 w-24 text-[10px] bg-white/[0.02] border-white/[0.06]">
        <SelectValue placeholder="Tag" />
      </SelectTrigger>
      <SelectContent className="bg-[#12121a] border-white/[0.08]">
        <SelectItem value="none" className="text-[11px]">None</SelectItem>
        <SelectItem value="business" className="text-[11px]">Business</SelectItem>
        <SelectItem value="personal" className="text-[11px]">Personal</SelectItem>
      </SelectContent>
    </Select>
  );
}
