"use client";

import { useState } from "react";
import { GlassCard } from "@/components/shared/glass-card";
import { BatteryGauge } from "@/components/shared/battery-gauge";
import { CommandButton } from "@/components/shared/command-button";
import { Skeleton } from "@/components/shared/loading-skeleton";
import { useTessieCommand } from "@/hooks/use-tessie-command";
import { useVehicleState, useCharges, useBatteryHealth } from "@/hooks/use-vehicle-state";
import { tessie } from "@/lib/tessie";
import { Slider } from "@/components/ui/slider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Battery, BatteryCharging, Zap, Plug,
  Activity,
} from "lucide-react";
import { useSettingsStore } from "@/lib/store";
import { formatDistance, distanceLabel } from "@/lib/units";
import { format, formatDuration, intervalToDuration } from "date-fns";
import {
  Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const CHART_COLORS = ["#e31937", "#3b82f6", "#22c55e", "#ff6b35"];

export default function ChargingPage() {
  const distanceUnit = useSettingsStore((s) => s.distanceUnit);
  const { data: vehicleData } = useVehicleState();
  const { data: chargesData, isLoading: chargesLoading } = useCharges({ limit: 50 });
  const { data: healthData } = useBatteryHealth();

  const cs = vehicleData?.charge_state;
  const isCharging = cs?.charging_state === "Charging";

  const [chargeLimit, setChargeLimit] = useState(cs?.charge_limit_soc ?? 80);
  const [chargingAmps, setChargingAmps] = useState(cs?.charge_current_request ?? 32);

  const setChargeLimitCmd = useTessieCommand("set-charge-limit", () =>
    tessie.setChargeLimit(chargeLimit), {
    optimisticUpdate: (s) => ({
      ...s,
      charge_state: { ...s.charge_state, charge_limit_soc: chargeLimit },
    }),
  });
  const setAmpsCmd = useTessieCommand("set-amps", () =>
    tessie.setChargingAmps(chargingAmps), {
    optimisticUpdate: (s) => ({
      ...s,
      charge_state: { ...s.charge_state, charge_current_request: chargingAmps },
    }),
  });
  const startChargingCmd = useTessieCommand("start-charging", () => tessie.startCharging(), {
    optimisticUpdate: (s) => ({
      ...s,
      charge_state: { ...s.charge_state, charging_state: "Charging" as const },
    }),
  });
  const stopChargingCmd = useTessieCommand("stop-charging", () => tessie.stopCharging(), {
    optimisticUpdate: (s) => ({
      ...s,
      charge_state: { ...s.charge_state, charging_state: "Stopped" as const },
    }),
  });

  const charges = chargesData?.results ?? [];

  // Chart data: energy added per charge
  const chargeTypeBreakdown = (() => {
    let supercharger = 0;
    let home = 0;
    charges.forEach((c) => {
      if (c.is_supercharger) supercharger += c.energy_added;
      else home += c.energy_added;
    });
    return [
      { name: "Home", value: Math.round(home * 10) / 10 },
      { name: "Supercharger", value: Math.round(supercharger * 10) / 10 },
    ].filter((d) => d.value > 0);
  })();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Battery Status */}
        <GlassCard
          variant={isCharging ? "charging" : "default"}
          header={{ title: "Battery Status", icon: <Battery className="w-4 h-4" /> }}
        >
          {cs ? (
            <div className="flex flex-col items-center">
              <BatteryGauge
                level={cs.battery_level}
                range={cs.battery_range}
                chargeLimit={cs.charge_limit_soc}
                isCharging={isCharging}
                chargingPower={cs.charger_power}
                minutesToFull={cs.minutes_to_full_charge}
                size="lg"
              />

              {/* Charge limit slider */}
              <div className="w-full mt-6">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-white/60">Charge Limit</span>
                  <span className="font-mono text-white/85">{chargeLimit}%</span>
                </div>
                <Slider
                  value={[chargeLimit]}
                  onValueChange={([v]) => setChargeLimit(v)}
                  min={50}
                  max={100}
                  step={1}
                  className="mb-3"
                />
                <CommandButton
                  label="Set Limit"
                  icon={Battery}
                  onExecute={() => setChargeLimitCmd.mutate()}
                  isPending={setChargeLimitCmd.isPending}
                  size="sm"
                />
              </div>

              {/* Charging amps slider */}
              <div className="w-full mt-4 pt-4 border-t border-white/[0.06]">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-white/60">Charging Amps</span>
                  <span className="font-mono text-white/85">{chargingAmps}A</span>
                </div>
                <Slider
                  value={[chargingAmps]}
                  onValueChange={([v]) => setChargingAmps(v)}
                  min={1}
                  max={48}
                  step={1}
                  className="mb-3"
                />
                <div className="flex justify-between text-[10px] text-white/40 font-mono mb-3">
                  <span>1A</span>
                  <span>48A</span>
                </div>
                <CommandButton
                  label="Set Amps"
                  icon={Zap}
                  onExecute={() => setAmpsCmd.mutate()}
                  isPending={setAmpsCmd.isPending}
                  size="sm"
                />
              </div>

              {/* Start/Stop charging */}
              <div className="w-full mt-4 pt-4 border-t border-white/[0.06]">
                <CommandButton
                  label={isCharging ? "Stop Charging" : "Start Charging"}
                  icon={isCharging ? Zap : Plug}
                  onExecute={() =>
                    isCharging ? stopChargingCmd.mutate() : startChargingCmd.mutate()
                  }
                  isPending={startChargingCmd.isPending || stopChargingCmd.isPending}
                  isActive={isCharging}
                  variant={isCharging ? "success" : "default"}
                />
              </div>
            </div>
          ) : (
            <Skeleton className="h-[200px] w-[200px] rounded-full mx-auto" />
          )}
        </GlassCard>

        {/* Battery Health */}
        <GlassCard header={{ title: "Battery Health", icon: <Activity className="w-4 h-4" /> }}>
          {healthData ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-white/50 uppercase tracking-wider">Capacity</span>
                  <p className="text-2xl font-mono font-bold text-white mt-1">
                    {healthData.result.capacity.toFixed(1)}
                    <span className="text-sm text-white/60 ml-1">kWh</span>
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-white/50 uppercase tracking-wider">Max Range</span>
                  <p className="text-2xl font-mono font-bold text-white mt-1">
                    {formatDistance(healthData.result.max_range, distanceUnit, 0).split(" ")[0]}
                    <span className="text-sm text-white/60 ml-1">{distanceLabel(distanceUnit)}</span>
                  </p>
                </div>
              </div>

              {/* Type breakdown chart */}
              {chargeTypeBreakdown.length > 0 && (
                <div className="mt-6">
                  <span className="text-[10px] text-white/50 uppercase tracking-wider">
                    Charging Sources (kWh)
                  </span>
                  <div className="h-[160px] mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chargeTypeBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={65}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {chargeTypeBreakdown.map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i]} />
                          ))}
                        </Pie>
                        <Legend
                          formatter={(value) => (
                            <span className="text-[11px] text-white/60">{value}</span>
                          )}
                        />
                        <Tooltip
                          contentStyle={{
                            background: "#12121a",
                            border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: "8px",
                            fontSize: "11px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-[160px] w-full" />
            </div>
          )}
        </GlassCard>
      </div>

      {/* Charge History Table */}
      <GlassCard header={{ title: "Charging History", icon: <BatteryCharging className="w-4 h-4" /> }}>
        {chargesLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : charges.length === 0 ? (
          <p className="text-xs text-white/50 text-center py-8">No charging sessions recorded</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/[0.06] hover:bg-transparent">
                  <TableHead className="text-[11px] text-white/60">Date</TableHead>
                  <TableHead className="text-[11px] text-white/60">Location</TableHead>
                  <TableHead className="text-[11px] text-white/60">Type</TableHead>
                  <TableHead className="text-[11px] text-white/60 text-right">Energy</TableHead>
                  <TableHead className="text-[11px] text-white/60 text-right">Duration</TableHead>
                  <TableHead className="text-[11px] text-white/60 text-right">Range</TableHead>
                  <TableHead className="text-[11px] text-white/60 text-right">Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {charges.map((charge) => {
                  const duration = intervalToDuration({
                    start: charge.started_at * 1000,
                    end: charge.ended_at * 1000,
                  });
                  return (
                    <TableRow key={charge.id} className="border-white/[0.04] hover:bg-white/[0.02]">
                      <TableCell className="text-xs font-mono text-white/75">
                        {format(charge.started_at * 1000, "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-xs text-white/60 max-w-[200px] truncate">
                        {charge.saved_location || charge.location.split(",")[0]}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${charge.is_supercharger
                            ? "bg-tesla-red/10 text-tesla-red"
                            : "bg-tesla-charging/10 text-tesla-charging"
                            }`}
                        >
                          {charge.is_supercharger ? "SC" : "Home"}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs font-mono text-white/85 text-right">
                        {charge.energy_added.toFixed(1)} kWh
                      </TableCell>
                      <TableCell className="text-xs font-mono text-white/75 text-right">
                        {formatDuration(duration, { format: ["hours", "minutes"] }) || "< 1 min"}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-white/75 text-right">
                        +{formatDistance(charge.miles_added, distanceUnit, 0)}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-white/75 text-right">
                        {charge.cost > 0 ? `$${charge.cost.toFixed(2)}` : "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
