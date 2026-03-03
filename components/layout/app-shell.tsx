"use client";

import { useState } from "react";
import { Sidebar, MobileDrawer } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { SetupScreen } from "@/components/setup/setup-screen";
import { useAppConfig } from "@/hooks/use-app-config";
import { useCredentialsStore, selectIsCredentialsConfigured } from "@/lib/store";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: config, isLoading: configLoading } = useAppConfig();
  const isConfigured = useCredentialsStore(selectIsCredentialsConfigured);

  // While config is loading, show a blank dark screen (no flash)
  if (configLoading) {
    return <div className="min-h-screen bg-[#0a0a0f]" />;
  }

  // BYOK mode and no credentials saved → show setup screen
  if (config?.mode === "byok" && !isConfigured) {
    return <SetupScreen />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar onMenuToggle={() => setMobileOpen((o) => !o)} />
        <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin">
          {children}
        </div>
      </main>
    </div>
  );
}
