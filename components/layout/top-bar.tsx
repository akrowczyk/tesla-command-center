"use client";

import { usePathname } from "next/navigation";
import { RefreshCw, Wifi, WifiOff, Menu } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useVehicleStore, selectVehicleStatus } from "@/lib/store";
import { useTessieCommand } from "@/hooks/use-tessie-command";
import { tessie } from "@/lib/tessie";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/controls": "Controls",
  "/charging": "Charging & Battery",
  "/drives": "Drive History",
  "/map": "Live Map",
  "/climate": "Climate & Comfort",
  "/settings": "Settings",
};

export function TopBar({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const lastUpdated = useVehicleStore((s) => s.lastUpdated);
  const status = useVehicleStore(selectVehicleStatus);

  const wakeMutation = useTessieCommand("wake", () => tessie.wake(), {
    successMessage: "Vehicle is waking up...",
  });

  const pageTitle = PAGE_TITLES[pathname] ?? "Tesla Command Center";

  const handleRefresh = () => {
    queryClient.invalidateQueries();
  };

  return (
    <header className="h-12 border-b border-white/[0.06] bg-[#08080d]/80 backdrop-blur-md flex items-center justify-between px-4 md:px-5 shrink-0">
      <div className="flex items-center gap-3">
        {onMenuToggle && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white/50 hover:text-white/80 md:hidden"
            onClick={onMenuToggle}
          >
            <Menu className="w-5 h-5" />
          </Button>
        )}
        <h2 className="text-sm font-medium text-white/90">{pageTitle}</h2>
      </div>

      <div className="flex items-center gap-3">
        {/* Last updated */}
        {lastUpdated && (
          <span className="text-[11px] text-white/50 font-mono">
            Updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}
          </span>
        )}

        {/* Refresh */}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-white/50 hover:text-white/80"
          onClick={handleRefresh}
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </Button>

        {/* Wake vehicle */}
        {status === "asleep" && (
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-[11px] border-tesla-red/30 text-tesla-red hover:bg-tesla-red/10"
            onClick={() => wakeMutation.mutate()}
            disabled={wakeMutation.isPending}
          >
            {wakeMutation.isPending ? "Waking..." : "Wake Vehicle"}
          </Button>
        )}

        {/* Connection status */}
        <div
          className={cn(
            "flex items-center gap-1.5",
            status ? "text-tesla-success" : "text-white/40"
          )}
        >
          {status ? (
            <Wifi className="w-3.5 h-3.5" />
          ) : (
            <WifiOff className="w-3.5 h-3.5" />
          )}
        </div>
      </div>
    </header>
  );
}
