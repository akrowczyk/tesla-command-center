"use client";

import { GlassCard } from "@/components/shared/glass-card";
import { CommandButton } from "@/components/shared/command-button";
import { useTessieCommand } from "@/hooks/use-tessie-command";
import { useVehicleStore, selectIsLocked, selectIsSentryOn, selectIsClimateOn, selectIsChargePortOpen } from "@/lib/store";
import { tessie } from "@/lib/tessie";
import {
  Lock,
  LockOpen,
  Lightbulb,
  Thermometer,
  Eye,
  EyeOff,
  Package,
  Plug,
  Volume2,
} from "lucide-react";

export function QuickControls() {
  const isLocked = useVehicleStore(selectIsLocked);
  const isSentryOn = useVehicleStore(selectIsSentryOn);
  const isClimateOn = useVehicleStore(selectIsClimateOn);
  const isChargePortOpen = useVehicleStore(selectIsChargePortOpen);

  const lockCmd = useTessieCommand("lock", () => tessie.lock(), {
    successMessage: "Vehicle locked",
    optimisticUpdate: (s) => ({
      ...s,
      vehicle_state: { ...s.vehicle_state, locked: true },
    }),
  });
  const unlockCmd = useTessieCommand("unlock", () => tessie.unlock(), {
    successMessage: "Vehicle unlocked",
    optimisticUpdate: (s) => ({
      ...s,
      vehicle_state: { ...s.vehicle_state, locked: false },
    }),
  });
  const flashCmd = useTessieCommand("flash-lights", () => tessie.flashLights(), {
    successMessage: "Lights flashed",
  });
  const climateStartCmd = useTessieCommand("start-climate", () => tessie.startClimate(), {
    successMessage: "Climate started",
    optimisticUpdate: (s) => ({
      ...s,
      climate_state: { ...s.climate_state, is_climate_on: true },
    }),
  });
  const climateStopCmd = useTessieCommand("stop-climate", () => tessie.stopClimate(), {
    successMessage: "Climate stopped",
    optimisticUpdate: (s) => ({
      ...s,
      climate_state: { ...s.climate_state, is_climate_on: false },
    }),
  });
  const sentryOnCmd = useTessieCommand("enable-sentry", () => tessie.enableSentryMode(), {
    successMessage: "Sentry mode enabled",
    optimisticUpdate: (s) => ({
      ...s,
      vehicle_state: { ...s.vehicle_state, sentry_mode: true },
    }),
  });
  const sentryOffCmd = useTessieCommand("disable-sentry", () => tessie.disableSentryMode(), {
    successMessage: "Sentry mode disabled",
    optimisticUpdate: (s) => ({
      ...s,
      vehicle_state: { ...s.vehicle_state, sentry_mode: false },
    }),
  });
  const frunkCmd = useTessieCommand("open-frunk", () => tessie.openFrontTrunk(), {
    successMessage: "Frunk opened",
    optimisticUpdate: (s) => ({
      ...s,
      vehicle_state: { ...s.vehicle_state, ft: 1 },
    }),
  });
  const chargePortOpenCmd = useTessieCommand("open-charge-port", () => tessie.openChargePort(), {
    successMessage: "Charge port opened",
    optimisticUpdate: (s) => ({
      ...s,
      charge_state: { ...s.charge_state, charge_port_door_open: true },
    }),
  });
  const chargePortCloseCmd = useTessieCommand("close-charge-port", () => tessie.closeChargePort(), {
    successMessage: "Charge port closed",
    optimisticUpdate: (s) => ({
      ...s,
      charge_state: { ...s.charge_state, charge_port_door_open: false },
    }),
  });
  const honkCmd = useTessieCommand("honk", () => tessie.honk(), {
    successMessage: "Horn honked",
  });

  return (
    <GlassCard
      header={{
        title: "Quick Controls",
      }}
    >
      <div className="flex flex-wrap gap-2">
        <CommandButton
          label={isLocked ? "Unlock" : "Lock"}
          icon={isLocked ? LockOpen : Lock}
          onExecute={() => (isLocked ? unlockCmd.mutate() : lockCmd.mutate())}
          isPending={lockCmd.isPending || unlockCmd.isPending}
          isActive={!!isLocked}
          variant="success"
        />
        <CommandButton
          label={isClimateOn ? "Stop Climate" : "Start Climate"}
          icon={Thermometer}
          onExecute={() =>
            isClimateOn ? climateStopCmd.mutate() : climateStartCmd.mutate()
          }
          isPending={climateStartCmd.isPending || climateStopCmd.isPending}
          isActive={isClimateOn}
        />
        <CommandButton
          label={isSentryOn ? "Sentry Off" : "Sentry On"}
          icon={isSentryOn ? EyeOff : Eye}
          onExecute={() =>
            isSentryOn ? sentryOffCmd.mutate() : sentryOnCmd.mutate()
          }
          isPending={sentryOnCmd.isPending || sentryOffCmd.isPending}
          isActive={isSentryOn}
          variant={isSentryOn ? "danger" : "default"}
        />
        <CommandButton
          label="Flash Lights"
          icon={Lightbulb}
          onExecute={() => flashCmd.mutate()}
          isPending={flashCmd.isPending}
        />
        <CommandButton
          label="Open Frunk"
          icon={Package}
          onExecute={() => frunkCmd.mutate()}
          isPending={frunkCmd.isPending}
          requireConfirm
          confirmMessage="Open the front trunk?"
        />
        <CommandButton
          label={isChargePortOpen ? "Close Port" : "Charge Port"}
          icon={Plug}
          onExecute={() =>
            isChargePortOpen ? chargePortCloseCmd.mutate() : chargePortOpenCmd.mutate()
          }
          isPending={chargePortOpenCmd.isPending || chargePortCloseCmd.isPending}
          isActive={isChargePortOpen}
        />
        <CommandButton
          label="Honk"
          icon={Volume2}
          onExecute={() => honkCmd.mutate()}
          isPending={honkCmd.isPending}
        />
      </div>
    </GlassCard>
  );
}
