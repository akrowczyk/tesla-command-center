"use client";

import { useState } from "react";
import { Loader2, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "./confirm-dialog";
import { cn } from "@/lib/utils";

interface CommandButtonProps {
  label: string;
  icon: LucideIcon;
  onExecute: () => void;
  isActive?: boolean;
  isPending?: boolean;
  variant?: "default" | "danger" | "success";
  requireConfirm?: boolean;
  confirmTitle?: string;
  confirmMessage?: string;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const variantStyles = {
  default: {
    base: "border-white/[0.08] bg-white/[0.03] text-white/70 hover:bg-white/[0.06] hover:text-white",
    active: "border-tesla-red/30 bg-tesla-red/10 text-tesla-red",
  },
  danger: {
    base: "border-tesla-red/20 bg-tesla-red/5 text-tesla-red/80 hover:bg-tesla-red/10 hover:text-tesla-red",
    active: "border-tesla-red/40 bg-tesla-red/20 text-tesla-red",
  },
  success: {
    base: "border-tesla-success/20 bg-tesla-success/5 text-tesla-success/80 hover:bg-tesla-success/10",
    active: "border-tesla-success/40 bg-tesla-success/20 text-tesla-success",
  },
};

const sizeStyles = {
  sm: "h-9 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-5 text-sm gap-2.5",
};

export function CommandButton({
  label,
  icon: Icon,
  onExecute,
  isActive = false,
  isPending = false,
  variant = "default",
  requireConfirm = false,
  confirmTitle,
  confirmMessage,
  disabled = false,
  className,
  size = "md",
}: CommandButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClick = () => {
    if (requireConfirm) {
      setShowConfirm(true);
    } else {
      onExecute();
    }
  };

  const handleConfirm = () => {
    setShowConfirm(false);
    onExecute();
  };

  const styles = variantStyles[variant];

  return (
    <>
      <Button
        variant="outline"
        onClick={handleClick}
        disabled={disabled || isPending}
        className={cn(
          "relative transition-all duration-200",
          sizeStyles[size],
          isActive ? styles.active : styles.base,
          isPending && "opacity-70",
          className
        )}
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Icon className="w-4 h-4" />
        )}
        <span>{label}</span>
      </Button>

      {requireConfirm && (
        <ConfirmDialog
          open={showConfirm}
          onOpenChange={setShowConfirm}
          title={confirmTitle ?? `Confirm ${label}`}
          message={
            confirmMessage ?? `Are you sure you want to ${label.toLowerCase()}?`
          }
          onConfirm={handleConfirm}
          variant={variant === "danger" ? "danger" : "default"}
        />
      )}
    </>
  );
}
