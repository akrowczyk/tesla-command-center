"use client";

import { useVehicleState } from "@/hooks/use-vehicle-state";
import { BatteryGauge } from "@/components/shared/battery-gauge";
import { GlassCard } from "@/components/shared/glass-card";
import { Battery, Zap } from "lucide-react";
import { Skeleton } from "@/components/shared/loading-skeleton";
import { useSettingsStore } from "@/lib/store";
import { formatDistance, formatChargeRate } from "@/lib/units";

export function BatterySection() {
  const { data, isLoading } = useVehicleState();
  const distanceUnit = useSettingsStore((s) => s.distanceUnit);

  if (isLoading || !data) {
    return (
      <GlassCard className="flex flex-col items-center justify-center min-h-[280px]">
        <Skeleton className="w-[200px] h-[200px] rounded-full" />
        <Skeleton className="h-4 w-24 mt-4" />
      </GlassCard>
    );
  }

  const cs = data.charge_state;
  const isCharging = cs.charging_state === "Charging";

  return (
    <GlassCard
      variant={isCharging ? "charging" : "default"}
      className="flex flex-col items-center"
      header={{
        title: "Battery",
        icon: <Battery className="w-4 h-4" />,
      }}
    >
      <BatteryGauge
        level={cs.battery_level}
        range={cs.battery_range}
        chargeLimit={cs.charge_limit_soc}
        isCharging={isCharging}
        chargingPower={cs.charger_power}
        minutesToFull={cs.minutes_to_full_charge}
        size="lg"
      />

      <div className="mt-4 w-full space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/40">Charge Limit</span>
          <span className="font-mono text-white/70">{cs.charge_limit_soc}%</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/40">Est. Range</span>
          <span className="font-mono text-white/70">{formatDistance(cs.est_battery_range, distanceUnit, 0)}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/40">Energy</span>
          <span className="font-mono text-white/70">{cs.energy_remaining} kWh</span>
        </div>

        {isCharging && (
          <div className="pt-2 border-t border-white/[0.06] space-y-1">
            <div className="flex items-center gap-1.5 text-tesla-charging">
              <Zap className="w-3 h-3" />
              <span className="text-xs font-medium">Charging</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/40">Power</span>
              <span className="font-mono text-tesla-charging">{cs.charger_power} kW</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/40">Rate</span>
              <span className="font-mono text-tesla-charging">{formatChargeRate(cs.charge_rate, distanceUnit)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/40">Added</span>
              <span className="font-mono text-white/70">{cs.charge_energy_added} kWh</span>
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
