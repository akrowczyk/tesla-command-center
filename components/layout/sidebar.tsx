"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";
import { useVehicleStore, selectBatteryLevel, selectVehicleStatus, selectVehicleName } from "@/lib/store";
import { VehicleSilhouette } from "./vehicle-silhouette";
import { cn } from "@/lib/utils";

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const batteryLevel = useVehicleStore(selectBatteryLevel);
  const status = useVehicleStore(selectVehicleStatus);
  const vehicleName = useVehicleStore(selectVehicleName);

  const statusConfig = {
    online: { label: "ONLINE", className: "status-dot-online" },
    asleep: { label: "ASLEEP", className: "status-dot-asleep" },
    offline: { label: "OFFLINE", className: "status-dot-asleep" },
  };

  const currentStatus = status ? statusConfig[status] : null;

  return (
    <>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/[0.08] flex items-center justify-center">
            <svg viewBox="0 0 32 32" className="w-5 h-5" fill="white">
              <path d="M16 4c-2.4 0-7.8 1.2-11.2 2.7l1.8 3.6c2.4-0.9 5.7-1.65 9.4-1.65s7 0.75 9.4 1.65l1.8-3.6C23.8 5.2 18.4 4 16 4zM16 11.8c-1.5 0-2.85 0.15-3.9 0.3L16 28l3.9-15.9c-1.05-0.15-2.4-0.3-3.9-0.3z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight">Command Center</h1>
            <p className="text-[11px] text-white/40">{vehicleName}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-3 overflow-y-auto scrollbar-thin">
        <div className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150",
                  isActive
                    ? "bg-tesla-red/10 text-tesla-red font-medium"
                    : "text-white/50 hover:text-white/80 hover:bg-white/[0.03]"
                )}
              >
                <Icon className="w-[18px] h-[18px]" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Vehicle silhouette */}
      <div className="px-5 py-4 border-t border-white/[0.06]">
        <VehicleSilhouette />

        {/* Battery bar */}
        {batteryLevel !== null && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-white/40">Battery</span>
              <span className="text-[13px] font-mono font-bold text-white/90">
                {batteryLevel}%
              </span>
            </div>
            <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${batteryLevel}%`,
                  backgroundColor:
                    batteryLevel > 40
                      ? "#22c55e"
                      : batteryLevel > 20
                      ? "#ff6b35"
                      : "#e31937",
                }}
              />
            </div>
          </div>
        )}

        {/* Status badge */}
        {currentStatus && (
          <div className="flex items-center gap-2 mt-3">
            <div className={currentStatus.className} />
            <span className="text-[11px] font-mono tracking-wider text-white/50">
              {currentStatus.label}
            </span>
          </div>
        )}
      </div>
    </>
  );
}

/** Desktop sidebar - hidden on mobile */
export function Sidebar() {
  return (
    <aside className="hidden md:flex w-[240px] h-screen flex-col border-r border-white/[0.06] bg-[#08080d] shrink-0">
      <SidebarContent />
    </aside>
  );
}

/** Mobile slide-out drawer */
export function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  // Close drawer on route change
  useEffect(() => {
    onClose();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={cn(
          "fixed top-0 left-0 w-[280px] h-screen flex flex-col bg-[#08080d] border-r border-white/[0.06] z-50 md:hidden transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-md bg-white/[0.06] flex items-center justify-center text-white/40 hover:text-white/80 transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <SidebarContent onNavigate={onClose} />
      </aside>
    </>
  );
}
