import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function StatCard({
  label,
  value,
  unit,
  icon: Icon,
  trend,
  trendValue,
  className,
  size = "md",
}: StatCardProps) {
  const valueSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
  };

  return (
    <div className={cn("glass-card", className)}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-[11px] uppercase tracking-wider text-white/60 font-medium">
          {label}
        </span>
        {Icon && <Icon className="w-4 h-4 text-white/40" />}
      </div>

      <div className="flex items-baseline gap-1.5">
        <span
          className={cn(
            "font-mono font-bold text-white telemetry-value",
            valueSizes[size]
          )}
        >
          {value}
        </span>
        {unit && (
          <span className="text-xs text-white/60 font-mono">{unit}</span>
        )}
      </div>

      {trend && trendValue && (
        <div className="flex items-center gap-1 mt-2">
          <span
            className={cn(
              "text-[11px] font-mono",
              trend === "up" && "text-tesla-success",
              trend === "down" && "text-tesla-red",
              trend === "neutral" && "text-white/60"
            )}
          >
            {trend === "up" ? "+" : trend === "down" ? "-" : ""}
            {trendValue}
          </span>
        </div>
      )}
    </div>
  );
}
