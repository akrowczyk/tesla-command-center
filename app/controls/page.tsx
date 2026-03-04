"use client";

import { useState } from "react";
import { GlassCard } from "@/components/shared/glass-card";
import { CommandButton } from "@/components/shared/command-button";
import { useTessieCommand } from "@/hooks/use-tessie-command";
import { useVehicleState } from "@/hooks/use-vehicle-state";
import { tessie } from "@/lib/tessie";
import {
  Lock, LockOpen, Eye, EyeOff, Lightbulb, Volume2,
  Car, Package, DoorOpen, Wind, X, Plug, PlugZap,
  Shield, UserCheck, UserX, Gauge,
  Radio, Rocket, Download, XCircle, Laugh,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SOFTWARE_UPDATE_DELAYS } from "@/lib/constants";
import { useSettingsStore } from "@/lib/store";
import { convertSpeed, speedLabel } from "@/lib/units";

export default function ControlsPage() {
  const { data } = useVehicleState();
  const distanceUnit = useSettingsStore((s) => s.distanceUnit);
  const vs = data?.vehicle_state;

  const [speedLimit, setSpeedLimit] = useState(70);
  const [updateDelay, setUpdateDelay] = useState("0");

  // Access commands
  const lockCmd = useTessieCommand("lock", () => tessie.lock(), {
    optimisticUpdate: (s) => ({
      ...s,
      vehicle_state: { ...s.vehicle_state, locked: true },
    }),
  });
  const unlockCmd = useTessieCommand("unlock", () => tessie.unlock(), {
    optimisticUpdate: (s) => ({
      ...s,
      vehicle_state: { ...s.vehicle_state, locked: false },
    }),
  });
  const flashCmd = useTessieCommand("flash", () => tessie.flashLights());
  const honkCmd = useTessieCommand("honk", () => tessie.honk());
  const remoteStartCmd = useTessieCommand("remote-start", () => tessie.remoteStart());

  // Openings
  const frunkCmd = useTessieCommand("frunk", () => tessie.openFrontTrunk(), {
    optimisticUpdate: (s) => ({
      ...s,
      vehicle_state: { ...s.vehicle_state, ft: 1 },
    }),
  });
  const trunkCmd = useTessieCommand("trunk", () => tessie.openRearTrunk(), {
    optimisticUpdate: (s) => ({
      ...s,
      vehicle_state: { ...s.vehicle_state, rt: s.vehicle_state.rt ? 0 : 1 },
    }),
  });
  const ventWindowsCmd = useTessieCommand("vent-windows", () => tessie.ventWindows());
  const closeWindowsCmd = useTessieCommand("close-windows", () => tessie.closeWindows());
  const openPortCmd = useTessieCommand("open-port", () => tessie.openChargePort(), {
    optimisticUpdate: (s) => ({
      ...s,
      charge_state: { ...s.charge_state, charge_port_door_open: true },
    }),
  });
  const closePortCmd = useTessieCommand("close-port", () => tessie.closeChargePort(), {
    optimisticUpdate: (s) => ({
      ...s,
      charge_state: { ...s.charge_state, charge_port_door_open: false },
    }),
  });

  // Security
  const sentryOnCmd = useTessieCommand("sentry-on", () => tessie.enableSentryMode(), {
    optimisticUpdate: (s) => ({
      ...s,
      vehicle_state: { ...s.vehicle_state, sentry_mode: true },
    }),
  });
  const sentryOffCmd = useTessieCommand("sentry-off", () => tessie.disableSentryMode(), {
    optimisticUpdate: (s) => ({
      ...s,
      vehicle_state: { ...s.vehicle_state, sentry_mode: false },
    }),
  });
  const valetOnCmd = useTessieCommand("valet-on", () => tessie.enableValetMode(), {
    optimisticUpdate: (s) => ({
      ...s,
      vehicle_state: { ...s.vehicle_state, valet_mode: true },
    }),
  });
  const valetOffCmd = useTessieCommand("valet-off", () => tessie.disableValetMode(), {
    optimisticUpdate: (s) => ({
      ...s,
      vehicle_state: { ...s.vehicle_state, valet_mode: false },
    }),
  });
  const guestOnCmd = useTessieCommand("guest-on", () => tessie.enableGuestMode(), {
    optimisticUpdate: (s) => ({
      ...s,
      vehicle_state: { ...s.vehicle_state, guest_mode: true },
    }),
  });
  const guestOffCmd = useTessieCommand("guest-off", () => tessie.disableGuestMode(), {
    optimisticUpdate: (s) => ({
      ...s,
      vehicle_state: { ...s.vehicle_state, guest_mode: false },
    }),
  });
  const speedOnCmd = useTessieCommand("speed-on", () => tessie.enableSpeedLimit(speedLimit), {
    optimisticUpdate: (s) => ({
      ...s,
      vehicle_state: {
        ...s.vehicle_state,
        speed_limit_mode: { ...s.vehicle_state.speed_limit_mode, active: true },
      },
    }),
  });
  const speedOffCmd = useTessieCommand("speed-off", () => tessie.disableSpeedLimit(), {
    optimisticUpdate: (s) => ({
      ...s,
      vehicle_state: {
        ...s.vehicle_state,
        speed_limit_mode: { ...s.vehicle_state.speed_limit_mode, active: false },
      },
    }),
  });

  // Software
  const scheduleUpdateCmd = useTessieCommand("schedule-update", () =>
    tessie.scheduleSoftwareUpdate(Number(updateDelay))
  );
  const cancelUpdateCmd = useTessieCommand("cancel-update", () => tessie.cancelSoftwareUpdate());

  // Fun
  const boomboxCmd = useTessieCommand("boombox", () => tessie.boombox());
  const homelinkCmd = useTessieCommand("homelink", () => tessie.triggerHomelink());

  const isLocked = vs?.locked ?? true;
  const isSentryOn = vs?.sentry_mode ?? false;
  const isValetOn = vs?.valet_mode ?? false;
  const isSpeedLimitOn = vs?.speed_limit_mode?.active ?? false;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Access Controls */}
        <GlassCard header={{ title: "Access & Alerts", icon: <Lock className="w-4 h-4" /> }}>
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
              label="Flash Lights"
              icon={Lightbulb}
              onExecute={() => flashCmd.mutate()}
              isPending={flashCmd.isPending}
            />
            <CommandButton
              label="Honk Horn"
              icon={Volume2}
              onExecute={() => honkCmd.mutate()}
              isPending={honkCmd.isPending}
            />
            <CommandButton
              label="Remote Start"
              icon={Rocket}
              onExecute={() => remoteStartCmd.mutate()}
              isPending={remoteStartCmd.isPending}
              variant="danger"
              requireConfirm
              confirmTitle="Remote Start"
              confirmMessage="This will enable keyless driving for 2 minutes. Are you sure?"
            />
            {vs?.homelink_nearby && (
              <CommandButton
                label="HomeLink"
                icon={Radio}
                onExecute={() => homelinkCmd.mutate()}
                isPending={homelinkCmd.isPending}
              />
            )}
          </div>
        </GlassCard>

        {/* Security Modes */}
        <GlassCard header={{ title: "Security Modes", icon: <Shield className="w-4 h-4" /> }}>
          <div className="flex flex-wrap gap-2">
            <CommandButton
              label={isSentryOn ? "Sentry Off" : "Sentry On"}
              icon={isSentryOn ? EyeOff : Eye}
              onExecute={() => (isSentryOn ? sentryOffCmd.mutate() : sentryOnCmd.mutate())}
              isPending={sentryOnCmd.isPending || sentryOffCmd.isPending}
              isActive={isSentryOn}
              variant={isSentryOn ? "danger" : "default"}
            />
            <CommandButton
              label={isValetOn ? "Valet Off" : "Valet On"}
              icon={isValetOn ? UserX : UserCheck}
              onExecute={() => (isValetOn ? valetOffCmd.mutate() : valetOnCmd.mutate())}
              isPending={valetOnCmd.isPending || valetOffCmd.isPending}
              isActive={isValetOn}
            />
            <CommandButton
              label="Guest On"
              icon={UserCheck}
              onExecute={() => guestOnCmd.mutate()}
              isPending={guestOnCmd.isPending}
            />
            <CommandButton
              label="Guest Off"
              icon={UserX}
              onExecute={() => guestOffCmd.mutate()}
              isPending={guestOffCmd.isPending}
            />
          </div>

          {/* Speed limit */}
          <div className="mt-4 pt-4 border-t border-white/[0.06]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/60">Speed Limit</span>
              <span className="text-xs font-mono text-white/85">{Math.round(convertSpeed(speedLimit, distanceUnit))} {speedLabel(distanceUnit)}</span>
            </div>
            <Slider
              value={[speedLimit]}
              onValueChange={([v]) => setSpeedLimit(v)}
              min={50}
              max={90}
              step={5}
              className="mb-3"
            />
            <div className="flex gap-2">
              <CommandButton
                label={isSpeedLimitOn ? "Disable" : "Enable"}
                icon={Gauge}
                onExecute={() => (isSpeedLimitOn ? speedOffCmd.mutate() : speedOnCmd.mutate())}
                isPending={speedOnCmd.isPending || speedOffCmd.isPending}
                isActive={isSpeedLimitOn}
                size="sm"
              />
            </div>
          </div>
        </GlassCard>

        {/* Doors & Openings */}
        <GlassCard header={{ title: "Doors & Openings", icon: <DoorOpen className="w-4 h-4" /> }}>
          <div className="flex flex-wrap gap-2">
            <CommandButton
              label="Open Frunk"
              icon={Package}
              onExecute={() => frunkCmd.mutate()}
              isPending={frunkCmd.isPending}
              requireConfirm
              confirmMessage="Open the front trunk (frunk)?"
            />
            <CommandButton
              label="Toggle Trunk"
              icon={Car}
              onExecute={() => trunkCmd.mutate()}
              isPending={trunkCmd.isPending}
            />
            <CommandButton
              label="Vent Windows"
              icon={Wind}
              onExecute={() => ventWindowsCmd.mutate()}
              isPending={ventWindowsCmd.isPending}
            />
            <CommandButton
              label="Close Windows"
              icon={X}
              onExecute={() => closeWindowsCmd.mutate()}
              isPending={closeWindowsCmd.isPending}
            />
            <CommandButton
              label="Open Charge Port"
              icon={Plug}
              onExecute={() => openPortCmd.mutate()}
              isPending={openPortCmd.isPending}
            />
            <CommandButton
              label="Close Charge Port"
              icon={PlugZap}
              onExecute={() => closePortCmd.mutate()}
              isPending={closePortCmd.isPending}
            />
          </div>
        </GlassCard>

        {/* Software & Fun */}
        <GlassCard header={{ title: "Software & Fun", icon: <Download className="w-4 h-4" /> }}>
          {/* Software version */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/60">Current Version</span>
              <span className="font-mono text-white/85">{vs?.car_version ?? "—"}</span>
            </div>
            {vs?.software_update?.version?.trim() && (
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-white/60">Available</span>
                <span className="font-mono text-tesla-success">{vs.software_update.version}</span>
              </div>
            )}
          </div>

          {/* Update controls */}
          <div className="flex items-center gap-2 mb-3">
            <Select value={updateDelay} onValueChange={setUpdateDelay}>
              <SelectTrigger className="h-9 w-32 text-xs bg-white/[0.03] border-white/[0.08]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#12121a] border-white/[0.08]">
                {SOFTWARE_UPDATE_DELAYS.map((d) => (
                  <SelectItem key={d.seconds} value={String(d.seconds)} className="text-xs">
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <CommandButton
              label="Schedule"
              icon={Download}
              onExecute={() => scheduleUpdateCmd.mutate()}
              isPending={scheduleUpdateCmd.isPending}
              requireConfirm
              confirmTitle="Schedule Software Update"
              confirmMessage="The vehicle will install the update. Make sure it's parked and connected to WiFi."
              size="sm"
            />
            <CommandButton
              label="Cancel"
              icon={XCircle}
              onExecute={() => cancelUpdateCmd.mutate()}
              isPending={cancelUpdateCmd.isPending}
              size="sm"
            />
          </div>

          {/* Boombox */}
          <div className="pt-3 border-t border-white/[0.06]">
            <CommandButton
              label="Boombox"
              icon={Laugh}
              onExecute={() => boomboxCmd.mutate()}
              isPending={boomboxCmd.isPending}
            />
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
