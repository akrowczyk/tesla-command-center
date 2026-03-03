"use client";

import { useWeather } from "@/hooks/use-vehicle-state";
import { useSettingsStore } from "@/lib/store";
import { GlassCard } from "@/components/shared/glass-card";
import { Skeleton } from "@/components/shared/loading-skeleton";
import { Cloud, Droplets, Wind, Thermometer, Sun, CloudRain, CloudSnow, CloudLightning } from "lucide-react";
import { convertTemp } from "@/lib/units";

function getWeatherIcon(condition: string) {
  const lower = condition.toLowerCase();
  if (lower.includes("rain") || lower.includes("drizzle")) return CloudRain;
  if (lower.includes("snow")) return CloudSnow;
  if (lower.includes("thunder") || lower.includes("storm")) return CloudLightning;
  if (lower.includes("clear") || lower.includes("sun")) return Sun;
  return Cloud;
}

export function WeatherCard() {
  const { data, isLoading } = useWeather();
  const tempUnit = useSettingsStore((s) => s.temperatureUnit);

  if (isLoading || !data) {
    return (
      <GlassCard className="min-h-[200px]">
        <Skeleton className="h-3 w-28 mb-4" />
        <Skeleton className="h-10 w-20 mb-3" />
        <Skeleton className="h-3 w-32" />
      </GlassCard>
    );
  }

  const WeatherIcon = getWeatherIcon(data.condition);
  const unitSymbol = tempUnit === "F" ? "F" : "C";

  return (
    <GlassCard
      header={{
        title: `Weather \u2022 ${data.location}`,
        icon: <WeatherIcon className="w-4 h-4" />,
      }}
    >
      <div className="flex items-start gap-4">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-mono font-bold text-white telemetry-value">
              {convertTemp(data.temperature, tempUnit)}
            </span>
            <span className="text-sm text-white/40 font-mono">{unitSymbol}</span>
          </div>
          <p className="text-xs text-white/50 mt-1 capitalize">{data.condition}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="flex items-center gap-2">
          <Thermometer className="w-3.5 h-3.5 text-white/30" />
          <div>
            <span className="text-[10px] text-white/30 block">Feels like</span>
            <span className="text-xs font-mono text-white/60">
              {convertTemp(data.feels_like, tempUnit)}°{unitSymbol}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Droplets className="w-3.5 h-3.5 text-white/30" />
          <div>
            <span className="text-[10px] text-white/30 block">Humidity</span>
            <span className="text-xs font-mono text-white/60">{data.humidity}%</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Wind className="w-3.5 h-3.5 text-white/30" />
          <div>
            <span className="text-[10px] text-white/30 block">Wind</span>
            <span className="text-xs font-mono text-white/60">
              {Math.round(data.wind_speed)} m/s
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Cloud className="w-3.5 h-3.5 text-white/30" />
          <div>
            <span className="text-[10px] text-white/30 block">Clouds</span>
            <span className="text-xs font-mono text-white/60">{data.cloudiness}%</span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
