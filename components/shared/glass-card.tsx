import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "highlight" | "warning" | "charging";
  hover?: boolean;
  header?: {
    title: string;
    icon?: ReactNode;
    action?: ReactNode;
  };
}

const variantStyles = {
  default: "",
  highlight: "border-tesla-red/20 shadow-[0_0_15px_rgba(227,25,55,0.08)]",
  warning: "border-tesla-warning/20 shadow-[0_0_15px_rgba(255,107,53,0.08)]",
  charging: "border-tesla-charging/20 shadow-[0_0_15px_rgba(59,130,246,0.08)] animate-pulse-charging",
};

export function GlassCard({
  children,
  className,
  variant = "default",
  hover = false,
  header,
}: GlassCardProps) {
  return (
    <div
      className={cn(
        hover ? "glass-card-hover" : "glass-card",
        variantStyles[variant],
        className
      )}
    >
      {header && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {header.icon && (
              <span className="text-white/60">{header.icon}</span>
            )}
            <h3 className="text-sm font-medium text-white/85">
              {header.title}
            </h3>
          </div>
          {header.action}
        </div>
      )}
      {children}
    </div>
  );
}
