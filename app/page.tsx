"use client";

import { BatterySection } from "@/components/dashboard/battery-section";
import { VehicleStatusCard } from "@/components/dashboard/vehicle-status-card";
import { WeatherCard } from "@/components/dashboard/weather-card";
import { QuickControls } from "@/components/dashboard/quick-controls";
import { ConsumptionCard } from "@/components/dashboard/consumption-card";
import { LastDriveCard } from "@/components/dashboard/last-drive-card";

export default function DashboardPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top row: Battery | Status | Weather */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <BatterySection />
        <VehicleStatusCard />
        <WeatherCard />
      </div>

      {/* Quick controls */}
      <QuickControls />

      {/* Bottom row: Last Drive | Consumption */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LastDriveCard />
        <ConsumptionCard />
      </div>
    </div>
  );
}
