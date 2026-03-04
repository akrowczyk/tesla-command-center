"use client";

import { useVehicleState } from "@/hooks/use-vehicle-state";
import { useSettingsStore } from "@/lib/store";
import { GlassCard } from "@/components/shared/glass-card";
import { Skeleton } from "@/components/shared/loading-skeleton";
import {
  Lock,
  LockOpen,
  Shield,
  ShieldOff,
  DoorOpen,
  DoorClosed,
  Car,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { convertPressure } from "@/lib/units";

interface StatusItemProps {
  label: string;
  active: boolean;
  activeIcon: React.ReactNode;
  inactiveIcon: React.ReactNode;
  activeColor?: string;
  activeLabel?: string;
  inactiveLabel?: string;
}

function StatusItem({
  label,
  active,
  activeIcon,
  inactiveIcon,
  activeColor = "text-tesla-success",
  activeLabel,
  inactiveLabel,
}: StatusItemProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2.5">
        <div
          className={cn(
            "w-7 h-7 rounded-md flex items-center justify-center transition-colors",
            active ? "bg-white/[0.06]" : "bg-white/[0.03]"
          )}
        >
          <span className={cn("w-4 h-4", active ? activeColor : "text-white/40")}>
            {active ? activeIcon : inactiveIcon}
          </span>
        </div>
        <span className="text-xs text-white/75">{label}</span>
      </div>
      <span
        className={cn(
          "text-[11px] font-mono",
          active ? activeColor : "text-white/50"
        )}
      >
        {active ? (activeLabel ?? "ON") : (inactiveLabel ?? "OFF")}
      </span>
    </div>
  );
}

export function VehicleStatusCard() {
  const { data, isLoading } = useVehicleState();
  const pressureUnit = useSettingsStore((s) => s.pressureUnit);

  if (isLoading || !data) {
    return (
      <GlassCard className="min-h-[280px]">
        <Skeleton className="h-3 w-28 mb-4" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between py-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </GlassCard>
    );
  }

  const vs = data.vehicle_state;
  const anyDoorOpen = vs.df > 0 || vs.dr > 0 || vs.pf > 0 || vs.pr > 0;
  const anyWindowOpen =
    vs.fd_window > 0 || vs.fp_window > 0 || vs.rd_window > 0 || vs.rp_window > 0;

  return (
    <GlassCard
      header={{
        title: "Vehicle Status",
        icon: <Car className="w-4 h-4" />,
      }}
    >
      <div className="divide-y divide-white/[0.04]">
        <StatusItem
          label="Doors"
          active={vs.locked}
          activeIcon={<Lock className="w-4 h-4" />}
          inactiveIcon={<LockOpen className="w-4 h-4" />}
          activeLabel="LOCKED"
          inactiveLabel="UNLOCKED"
          activeColor="text-tesla-success"
        />

        <StatusItem
          label="Doors"
          active={!anyDoorOpen}
          activeIcon={<DoorClosed className="w-4 h-4" />}
          inactiveIcon={<DoorOpen className="w-4 h-4" />}
          activeLabel="CLOSED"
          inactiveLabel="OPEN"
          activeColor="text-tesla-success"
        />

        <StatusItem
          label="Windows"
          active={!anyWindowOpen}
          activeIcon={<Shield className="w-4 h-4" />}
          inactiveIcon={<ShieldOff className="w-4 h-4" />}
          activeLabel="CLOSED"
          inactiveLabel="OPEN"
          activeColor="text-tesla-success"
        />

        <StatusItem
          label="Sentry Mode"
          active={vs.sentry_mode}
          activeIcon={<Eye className="w-4 h-4" />}
          inactiveIcon={<Eye className="w-4 h-4" />}
          activeColor="text-tesla-red"
        />

        <StatusItem
          label="Frunk"
          active={vs.ft === 0}
          activeIcon={<DoorClosed className="w-4 h-4" />}
          inactiveIcon={<DoorOpen className="w-4 h-4" />}
          activeLabel="CLOSED"
          inactiveLabel="OPEN"
        />

        <StatusItem
          label="Trunk"
          active={vs.rt === 0}
          activeIcon={<DoorClosed className="w-4 h-4" />}
          inactiveIcon={<DoorOpen className="w-4 h-4" />}
          activeLabel="CLOSED"
          inactiveLabel="OPEN"
        />

        {/* Tire pressures */}
        <div className="pt-3">
          <span className="text-[10px] uppercase tracking-wider text-white/50 font-medium">Tire Pressure ({pressureUnit.toUpperCase()})</span>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
            <div className="flex justify-between text-[11px]">
              <span className="text-white/60">FL</span>
              <span className="font-mono text-white/75">{convertPressure(vs.tpms_pressure_fl, pressureUnit)}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-white/60">FR</span>
              <span className="font-mono text-white/75">{convertPressure(vs.tpms_pressure_fr, pressureUnit)}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-white/60">RL</span>
              <span className="font-mono text-white/75">{convertPressure(vs.tpms_pressure_rl, pressureUnit)}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-white/60">RR</span>
              <span className="font-mono text-white/75">{convertPressure(vs.tpms_pressure_rr, pressureUnit)}</span>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
