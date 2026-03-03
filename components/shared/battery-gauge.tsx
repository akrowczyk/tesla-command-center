"use client";

import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/lib/store";
import { formatDistance } from "@/lib/units";

interface BatteryGaugeProps {
  level: number;
  range: number;
  chargeLimit?: number;
  isCharging?: boolean;
  chargingPower?: number;
  minutesToFull?: number;
  className?: string;
  size?: "sm" | "lg";
}

export function BatteryGauge({
  level,
  range,
  chargeLimit,
  isCharging = false,
  chargingPower,
  minutesToFull,
  className,
  size = "lg",
}: BatteryGaugeProps) {
  const dimensions = size === "lg" ? { r: 90, cx: 100, cy: 100, viewBox: "0 0 200 200", stroke: 8 } : { r: 50, cx: 56, cy: 56, viewBox: "0 0 112 112", stroke: 6 };
  const distanceUnit = useSettingsStore((s) => s.distanceUnit);
  const { r, cx, cy, viewBox, stroke } = dimensions;

  const circumference = 2 * Math.PI * r;
  // Arc covers 270 degrees (3/4 of circle), starting from bottom-left
  const arcLength = circumference * 0.75;
  const filledLength = arcLength * (level / 100);

  const getColor = (pct: number) => {
    if (pct > 40) return "#22c55e";
    if (pct > 20) return "#ff6b35";
    return "#e31937";
  };

  const color = getColor(level);

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg viewBox={viewBox} className={size === "lg" ? "w-[200px] h-[200px]" : "w-[112px] h-[112px]"}>
        {/* Background arc */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={stroke}
          strokeDasharray={`${arcLength} ${circumference - arcLength}`}
          strokeDashoffset={-circumference * 0.125}
          strokeLinecap="round"
          transform={`rotate(135 ${cx} ${cy})`}
        />

        {/* Filled arc */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={`${filledLength} ${circumference - filledLength}`}
          strokeDashoffset={-circumference * 0.125}
          strokeLinecap="round"
          transform={`rotate(135 ${cx} ${cy})`}
          className={cn(
            "transition-all duration-700 ease-out",
            isCharging && "animate-pulse"
          )}
          style={{
            filter: isCharging ? `drop-shadow(0 0 8px ${color})` : `drop-shadow(0 0 4px ${color}40)`,
          }}
        />

        {/* Charge limit tick */}
        {chargeLimit && chargeLimit < 100 && (
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth={stroke + 2}
            strokeDasharray={`2 ${circumference - 2}`}
            strokeDashoffset={-circumference * 0.125 - arcLength * (chargeLimit / 100) + 1}
            transform={`rotate(135 ${cx} ${cy})`}
          />
        )}
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={cn(
            "font-mono font-bold text-white telemetry-value",
            size === "lg" ? "text-4xl" : "text-xl"
          )}
        >
          {level}
          <span className={cn("text-white/40", size === "lg" ? "text-lg" : "text-xs")}>%</span>
        </span>
        <span
          className={cn(
            "font-mono text-white/50",
            size === "lg" ? "text-sm mt-1" : "text-[10px]"
          )}
        >
          {formatDistance(range, distanceUnit, 0)}
        </span>
        {isCharging && chargingPower !== undefined && size === "lg" && (
          <span className="text-[11px] font-mono text-tesla-charging mt-1">
            {chargingPower} kW
          </span>
        )}
        {isCharging && minutesToFull !== undefined && minutesToFull > 0 && size === "lg" && (
          <span className="text-[10px] font-mono text-white/30 mt-0.5">
            {Math.floor(minutesToFull / 60)}h {minutesToFull % 60}m left
          </span>
        )}
      </div>
    </div>
  );
}
