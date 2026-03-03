"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/shared/glass-card";
import { CommandButton } from "@/components/shared/command-button";
import { useTessieCommand } from "@/hooks/use-tessie-command";
import { useVehicleState } from "@/hooks/use-vehicle-state";
import { useSettingsStore } from "@/lib/store";
import { tessie } from "@/lib/tessie";
import { Slider } from "@/components/ui/slider";
import {
  Thermometer, Power, Snowflake, Flame, Wind,
  ShieldAlert, Dog, Tent, Zap, CircleOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SEAT_NAMES, CLIMATE_KEEPER_MODES } from "@/lib/constants";
import { convertTemp } from "@/lib/units";


export default function ClimatePage() {
  const { data } = useVehicleState();
  const tempUnit = useSettingsStore((s) => s.temperatureUnit);
  const climate = data?.climate_state;

  const [driverTemp, setDriverTemp] = useState(22);

  useEffect(() => {
    if (climate) setDriverTemp(climate.driver_temp_setting);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [climate?.driver_temp_setting]);

  // Commands
  const startClimateCmd = useTessieCommand("start-climate", () => tessie.startClimate(), {
    optimisticUpdate: (s) => ({
      ...s,
      climate_state: { ...s.climate_state, is_climate_on: true },
    }),
  });
  const stopClimateCmd = useTessieCommand("stop-climate", () => tessie.stopClimate(), {
    optimisticUpdate: (s) => ({
      ...s,
      climate_state: { ...s.climate_state, is_climate_on: false },
    }),
  });
  const setTempCmd = useTessieCommand("set-temp", () => tessie.setTemperature(driverTemp), {
    optimisticUpdate: (s) => ({
      ...s,
      climate_state: { ...s.climate_state, driver_temp_setting: driverTemp, passenger_temp_setting: driverTemp },
    }),
  });
  const startDefrostCmd = useTessieCommand("start-defrost", () => tessie.startDefrost(), {
    optimisticUpdate: (s) => ({
      ...s,
      climate_state: { ...s.climate_state, defrost_mode: 1, is_climate_on: true },
    }),
  });
  const stopDefrostCmd = useTessieCommand("stop-defrost", () => tessie.stopDefrost(), {
    optimisticUpdate: (s) => ({
      ...s,
      climate_state: { ...s.climate_state, defrost_mode: 0 },
    }),
  });
  const startWheelHeaterCmd = useTessieCommand("wheel-heater-on", () => tessie.startSteeringWheelHeater(), {
    optimisticUpdate: (s) => ({
      ...s,
      climate_state: { ...s.climate_state, steering_wheel_heater: true },
    }),
  });
  const stopWheelHeaterCmd = useTessieCommand("wheel-heater-off", () => tessie.stopSteeringWheelHeater(), {
    optimisticUpdate: (s) => ({
      ...s,
      climate_state: { ...s.climate_state, steering_wheel_heater: false },
    }),
  });
  const bioweaponOnCmd = useTessieCommand("bioweapon-on", () => tessie.setBioweaponMode(true), {
    optimisticUpdate: (s) => ({
      ...s,
      climate_state: { ...s.climate_state, bioweapon_mode: true },
    }),
  });
  const bioweaponOffCmd = useTessieCommand("bioweapon-off", () => tessie.setBioweaponMode(false), {
    optimisticUpdate: (s) => ({
      ...s,
      climate_state: { ...s.climate_state, bioweapon_mode: false },
    }),
  });
  const copOnCmd = useTessieCommand("cop-on", () => tessie.setCabinOverheatProtection(true));
  const copOffCmd = useTessieCommand("cop-off", () => tessie.setCabinOverheatProtection(false));

  const isClimateOn = climate?.is_climate_on ?? false;
  const isDefrostOn = climate?.defrost_mode !== 0;
  const isWheelHeaterOn = climate?.steering_wheel_heater ?? false;
  const isBioweaponOn = climate?.bioweapon_mode ?? false;

  const displayTemp = (c: number) => `${convertTemp(c, tempUnit)}`;

  const tempSymbol = tempUnit === "F" ? "F" : "C";

  function getSeatHeatLevel(seatId: string): number {
    if (!climate) return 0;
    const map: Record<string, number> = {
      driver: climate.seat_heater_left,
      passenger: climate.seat_heater_right,
      rear_left: climate.seat_heater_rear_left,
      rear_right: climate.seat_heater_rear_right,
    };
    return map[seatId] ?? 0;
  }

  function getSeatCoolLevel(seatId: string): number {
    if (!climate) return 0;
    const map: Record<string, number> = {
      driver: climate.seat_fan_front_left,
      passenger: climate.seat_fan_front_right,
    };
    return map[seatId] ?? 0;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Temperature Control */}
        <GlassCard header={{ title: "Temperature Control", icon: <Thermometer className="w-4 h-4" /> }}>
          <div className="flex flex-col items-center mb-6">
            {/* Big temperature display */}
            <div className="text-center mb-4">
              <span className="text-5xl font-mono font-bold text-white telemetry-value">
                {displayTemp(driverTemp)}
              </span>
              <span className="text-xl text-white/40 font-mono ml-1">{tempSymbol}</span>
            </div>

            {/* Temperature slider */}
            <div className="w-full px-4">
              <Slider
                value={[driverTemp]}
                onValueChange={([v]) => setDriverTemp(v)}
                min={15}
                max={28}
                step={0.5}
                className="mb-2"
              />
              <div className="flex justify-between text-[10px] text-white/30 font-mono">
                <span>{displayTemp(15)}{tempSymbol}</span>
                <span>{displayTemp(28)}{tempSymbol}</span>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <CommandButton
                label="Set Temp"
                icon={Thermometer}
                onExecute={() => setTempCmd.mutate()}
                isPending={setTempCmd.isPending}
                size="sm"
              />
              <CommandButton
                label={isClimateOn ? "Stop Climate" : "Start Climate"}
                icon={Power}
                onExecute={() => (isClimateOn ? stopClimateCmd.mutate() : startClimateCmd.mutate())}
                isPending={startClimateCmd.isPending || stopClimateCmd.isPending}
                isActive={isClimateOn}
                variant={isClimateOn ? "success" : "default"}
                size="sm"
              />
            </div>
          </div>

          {/* Current readings */}
          <div className="space-y-2 pt-4 border-t border-white/[0.06]">
            <div className="flex justify-between text-xs">
              <span className="text-white/40">Inside</span>
              <span className="font-mono text-white/70">
                {climate ? `${displayTemp(climate.inside_temp)}${tempSymbol}` : "—"}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-white/40">Outside</span>
              <span className="font-mono text-white/70">
                {climate ? `${displayTemp(climate.outside_temp)}${tempSymbol}` : "—"}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-white/40">Fan</span>
              <span className="font-mono text-white/70">
                {climate?.fan_status ?? "—"}
              </span>
            </div>
          </div>
        </GlassCard>

        {/* Seat Controls */}
        <GlassCard header={{ title: "Seat Controls", icon: <Flame className="w-4 h-4" /> }}>
          <div className="divide-y divide-white/[0.04]">
            {SEAT_NAMES.filter(s => s.id !== "rear_center").map((seat) => (
              <div key={seat.id} className="flex items-center justify-between py-2.5">
                <span className="text-xs text-white/60">{seat.label}</span>
                <div className="flex items-center gap-4">
                  {/* Heat */}
                  <div className="flex items-center gap-1">
                    <Flame className="w-3 h-3 text-orange-400/50" />
                    {[1, 2, 3].map((lvl) => (
                      <SeatHeatButton
                        key={lvl}
                        seatId={seat.id}
                        level={lvl}
                        currentLevel={getSeatHeatLevel(seat.id)}
                      />
                    ))}
                  </div>
                  {/* Cool (only front seats) */}
                  {(seat.id === "driver" || seat.id === "passenger") && (
                    <div className="flex items-center gap-1">
                      <Snowflake className="w-3 h-3 text-blue-400/50" />
                      {[1, 2, 3].map((lvl) => (
                        <SeatCoolButton
                          key={lvl}
                          seatId={seat.id}
                          level={lvl}
                          currentLevel={getSeatCoolLevel(seat.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Steering wheel heater */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/[0.06]">
            <span className="text-xs text-white/60">Steering Wheel Heater</span>
            <CommandButton
              label={isWheelHeaterOn ? "Off" : "On"}
              icon={isWheelHeaterOn ? CircleOff : Flame}
              onExecute={() =>
                isWheelHeaterOn ? stopWheelHeaterCmd.mutate() : startWheelHeaterCmd.mutate()
              }
              isPending={startWheelHeaterCmd.isPending || stopWheelHeaterCmd.isPending}
              isActive={isWheelHeaterOn}
              size="sm"
            />
          </div>
        </GlassCard>

        {/* Cabin Protection */}
        <GlassCard header={{ title: "Cabin Protection", icon: <ShieldAlert className="w-4 h-4" /> }}>
          <div className="space-y-4">
            {/* Defrost */}
            <CommandButton
              label={isDefrostOn ? "Stop Defrost" : "Max Defrost"}
              icon={Wind}
              onExecute={() =>
                isDefrostOn ? stopDefrostCmd.mutate() : startDefrostCmd.mutate()
              }
              isPending={startDefrostCmd.isPending || stopDefrostCmd.isPending}
              isActive={isDefrostOn}
            />

            {/* COP */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/60">Cabin Overheat Protection</span>
              <CommandButton
                label={climate?.cabin_overheat_protection !== "Off" ? "Disable" : "Enable"}
                icon={ShieldAlert}
                onExecute={() =>
                  climate?.cabin_overheat_protection !== "Off"
                    ? copOffCmd.mutate()
                    : copOnCmd.mutate()
                }
                isPending={copOnCmd.isPending || copOffCmd.isPending}
                isActive={climate?.cabin_overheat_protection !== "Off"}
                size="sm"
              />
            </div>

            {/* Bioweapon */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/60">Bioweapon Defense Mode</span>
              <CommandButton
                label={isBioweaponOn ? "Disable" : "Enable"}
                icon={ShieldAlert}
                onExecute={() =>
                  isBioweaponOn ? bioweaponOffCmd.mutate() : bioweaponOnCmd.mutate()
                }
                isPending={bioweaponOnCmd.isPending || bioweaponOffCmd.isPending}
                isActive={isBioweaponOn}
                size="sm"
              />
            </div>
          </div>
        </GlassCard>

        {/* Climate Keeper */}
        <GlassCard header={{ title: "Climate Keeper Mode", icon: <Tent className="w-4 h-4" /> }}>
          <div className="grid grid-cols-2 gap-2">
            {CLIMATE_KEEPER_MODES.map((mode) => (
              <ClimateKeeperButton
                key={mode.value}
                mode={mode}
                isActive={climate?.climate_keeper_mode === mode.label.toLowerCase()}
              />
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

// Climate Keeper mode button
function ClimateKeeperButton({ mode, isActive }: { mode: { label: string; value: number }; isActive: boolean }) {
  const ModeIcon = mode.value === 0 ? CircleOff : mode.value === 1 ? Zap : mode.value === 2 ? Dog : Tent;
  const cmd = useTessieCommand(`climate-keeper-${mode.value}`, () =>
    tessie.setClimateKeeperMode(mode.value)
  );

  return (
    <CommandButton
      label={mode.label}
      icon={ModeIcon}
      onExecute={() => cmd.mutate()}
      isPending={cmd.isPending}
      isActive={isActive}
      size="lg"
    />
  );
}

// Individual seat heat button
function SeatHeatButton({ seatId, level, currentLevel }: { seatId: string; level: number; currentLevel: number }) {
  const cmd = useTessieCommand(`seat-heat-${seatId}-${level}`, () =>
    tessie.setSeatHeat(seatId, currentLevel === level ? 0 : level)
  );

  return (
    <button
      onClick={() => cmd.mutate()}
      disabled={cmd.isPending}
      className={cn(
        "w-3 h-3 rounded-full transition-all cursor-pointer hover:scale-125",
        currentLevel >= level ? "bg-orange-400 shadow-[0_0_4px_rgba(251,146,60,0.5)]" : "bg-white/10 hover:bg-white/20"
      )}
    />
  );
}

// Individual seat cool button
function SeatCoolButton({ seatId, level, currentLevel }: { seatId: string; level: number; currentLevel: number }) {
  const cmd = useTessieCommand(`seat-cool-${seatId}-${level}`, () =>
    tessie.setSeatCool(seatId, currentLevel === level ? 0 : level)
  );

  return (
    <button
      onClick={() => cmd.mutate()}
      disabled={cmd.isPending}
      className={cn(
        "w-3 h-3 rounded-full transition-all cursor-pointer hover:scale-125",
        currentLevel >= level ? "bg-blue-400 shadow-[0_0_4px_rgba(96,165,250,0.5)]" : "bg-white/10 hover:bg-white/20"
      )}
    />
  );
}
