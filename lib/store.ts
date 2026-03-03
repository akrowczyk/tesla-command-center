"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { VehicleFullState } from "./types";

// ===== Vehicle Store =====

interface VehicleStore {
  vehicleState: VehicleFullState | null;
  lastUpdated: Date | null;
  pendingCommands: string[];

  setVehicleState: (state: VehicleFullState) => void;
  addPendingCommand: (cmd: string) => void;
  removePendingCommand: (cmd: string) => void;
}

export const useVehicleStore = create<VehicleStore>((set) => ({
  vehicleState: null,
  lastUpdated: null,
  pendingCommands: [],

  setVehicleState: (state) =>
    set({ vehicleState: state, lastUpdated: new Date() }),

  addPendingCommand: (cmd) =>
    set((s) => ({ pendingCommands: [...s.pendingCommands, cmd] })),

  removePendingCommand: (cmd) =>
    set((s) => ({
      pendingCommands: s.pendingCommands.filter((c) => c !== cmd),
    })),
}));

// Derived selectors
export const selectBatteryLevel = (s: VehicleStore) =>
  s.vehicleState?.charge_state?.battery_level ?? null;

export const selectBatteryRange = (s: VehicleStore) =>
  s.vehicleState?.charge_state?.battery_range ?? null;

export const selectIsCharging = (s: VehicleStore) =>
  s.vehicleState?.charge_state?.charging_state === "Charging";

export const selectIsLocked = (s: VehicleStore) =>
  s.vehicleState?.vehicle_state?.locked ?? null;

export const selectIsSentryOn = (s: VehicleStore) =>
  s.vehicleState?.vehicle_state?.sentry_mode ?? false;

export const selectIsClimateOn = (s: VehicleStore) =>
  s.vehicleState?.climate_state?.is_climate_on ?? false;

export const selectIsChargePortOpen = (s: VehicleStore) =>
  s.vehicleState?.charge_state?.charge_port_door_open ?? false;

export const selectVehicleName = (s: VehicleStore) =>
  s.vehicleState?.display_name ?? "Vehicle";

export const selectVehicleStatus = (s: VehicleStore) =>
  s.vehicleState?.state ?? null;

export const selectIsCommandPending = (cmd: string) => (s: VehicleStore) =>
  s.pendingCommands.includes(cmd);

// ===== Credentials Store (BYOK) =====

interface CredentialsStore {
  tessieApiKey: string | null;
  tessieVin: string | null;
  googleMapsApiKey: string | null;

  setCredentials: (key: string, vin: string, mapsKey?: string) => void;
  clearCredentials: () => void;
}

export const useCredentialsStore = create<CredentialsStore>()(
  persist(
    (set) => ({
      tessieApiKey: null,
      tessieVin: null,
      googleMapsApiKey: null,

      setCredentials: (key, vin, mapsKey) =>
        set({
          tessieApiKey: key,
          tessieVin: vin,
          googleMapsApiKey: mapsKey ?? null,
        }),

      clearCredentials: () =>
        set({
          tessieApiKey: null,
          tessieVin: null,
          googleMapsApiKey: null,
        }),
    }),
    { name: "tesla-credentials" }
  )
);

export const selectIsCredentialsConfigured = (s: CredentialsStore) =>
  !!s.tessieApiKey && !!s.tessieVin;

// ===== Settings Store =====

interface SettingsStore {
  refreshInterval: number;
  distanceUnit: "mi" | "km";
  temperatureUnit: "F" | "C";
  pressureUnit: "psi" | "bar" | "kpa";

  setRefreshInterval: (n: number) => void;
  setDistanceUnit: (u: "mi" | "km") => void;
  setTemperatureUnit: (u: "F" | "C") => void;
  setPressureUnit: (u: "psi" | "bar" | "kpa") => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      refreshInterval: 30,
      distanceUnit: "mi",
      temperatureUnit: "F",
      pressureUnit: "psi",

      setRefreshInterval: (n) => set({ refreshInterval: n }),
      setDistanceUnit: (u) => set({ distanceUnit: u }),
      setTemperatureUnit: (u) => set({ temperatureUnit: u }),
      setPressureUnit: (u) => set({ pressureUnit: u }),
    }),
    { name: "tesla-settings" }
  )
);
