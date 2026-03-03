"use client";

import { useQuery } from "@tanstack/react-query";
import { tessie } from "@/lib/tessie";
import { useVehicleStore, useSettingsStore } from "@/lib/store";

export function useVehicleState() {
  const setVehicleState = useVehicleStore((s) => s.setVehicleState);
  const refreshInterval = useSettingsStore((s) => s.refreshInterval);

  return useQuery({
    queryKey: ["vehicle-state"],
    queryFn: async () => {
      const data = await tessie.getVehicleState();
      setVehicleState(data);
      return data;
    },
    refetchInterval: refreshInterval * 1000,
  });
}

export function useWeather() {
  return useQuery({
    queryKey: ["weather"],
    queryFn: () => tessie.getWeather(),
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });
}

export function useConsumption() {
  return useQuery({
    queryKey: ["consumption"],
    queryFn: () => tessie.getConsumption(),
    refetchInterval: 60 * 1000,
  });
}

export function useLastDrive() {
  return useQuery({
    queryKey: ["drives", "last"],
    queryFn: async () => {
      const data = await tessie.getDrives({ limit: 1 });
      return data.results[0] ?? null;
    },
    refetchInterval: 60 * 1000,
  });
}

export function useBattery() {
  return useQuery({
    queryKey: ["battery"],
    queryFn: () => tessie.getBattery(),
    refetchInterval: 60 * 1000,
  });
}

export function useBatteryHealth() {
  return useQuery({
    queryKey: ["battery-health"],
    queryFn: () => tessie.getBatteryHealth(),
    refetchInterval: 60 * 60 * 1000, // 1 hour
  });
}

export function useDrives(params?: Parameters<typeof tessie.getDrives>[0]) {
  return useQuery({
    queryKey: ["drives", params],
    queryFn: () => tessie.getDrives(params),
  });
}

export function useCharges(params?: Parameters<typeof tessie.getCharges>[0]) {
  return useQuery({
    queryKey: ["charges", params],
    queryFn: () => tessie.getCharges(params),
  });
}

export function useLocation() {
  const refreshInterval = useSettingsStore((s) => s.refreshInterval);

  return useQuery({
    queryKey: ["location"],
    queryFn: () => tessie.getLocation(),
    refetchInterval: refreshInterval * 1000,
  });
}
