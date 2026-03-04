"use client";

import { useState } from "react";
import { GlassCard } from "@/components/shared/glass-card";
import { DriveReplayMap } from "@/components/map/drive-replay-map";
import { useVehicleState, useLocation, useDrives } from "@/hooks/use-vehicle-state";
import { useSettingsStore } from "@/lib/store";
import { useGoogleMapsKey } from "@/hooks/use-google-maps-key";
import { formatDistance } from "@/lib/units";
import type { DriveRecord } from "@/lib/types";
import {
  MapPin,
  Navigation,
  ExternalLink,
  Play,
  Route,
} from "lucide-react";

export default function MapPage() {
  const [selectedDrive, setSelectedDrive] = useState<DriveRecord | null>(null);
  const distanceUnit = useSettingsStore((s) => s.distanceUnit);
  const mapsApiKey = useGoogleMapsKey();

  const { data: vehicleData } = useVehicleState();
  const { data: locationData, isLoading: locationLoading } = useLocation();
  const { data: drivesData } = useDrives({ limit: 30 });

  const ds = vehicleData?.drive_state;
  const lat = locationData?.latitude ?? ds?.latitude;
  const lng = locationData?.longitude ?? ds?.longitude;
  const address = locationData?.address ?? "Unknown location";

  const googleMapsUrl =
    lat && lng ? `https://www.google.com/maps?q=${lat},${lng}` : null;

  const mapEmbedUrl =
    lat && lng && mapsApiKey
      ? `https://www.google.com/maps/embed/v1/place?key=${mapsApiKey}&q=${lat},${lng}&zoom=15&maptype=roadmap`
      : null;

  // If a drive is selected and we have a Maps key, show the replay view
  if (selectedDrive && mapsApiKey) {
    return (
      <div className="animate-fade-in h-full">
        <div style={{ height: "calc(100vh - 120px)" }}>
          <DriveReplayMap
            drive={selectedDrive}
            onClose={() => setSelectedDrive(null)}
            mapsApiKey={mapsApiKey}
          />
        </div>
      </div>
    );
  }

  // Default view: vehicle location + drive list
  return (
    <div className="space-y-6 animate-fade-in h-full">
      {/* Map Container */}
      <div
        className="relative rounded-xl overflow-hidden border border-white/[0.06]"
        style={{ height: "calc(100vh - 220px)" }}
      >
        {mapEmbedUrl ? (
          <iframe
            src={mapEmbedUrl}
            className="w-full h-full border-0"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            style={{
              filter:
                "invert(90%) hue-rotate(180deg) brightness(1.1) contrast(0.9)",
            }}
          />
        ) : (
          <div className="w-full h-full bg-tesla-bg-raised flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-8 h-8 text-white/40 mx-auto mb-2" />
              <p className="text-sm text-white/50">Location unavailable</p>
            </div>
          </div>
        )}

        {/* Vehicle info overlay */}
        <div className="absolute top-4 left-4 max-w-xs">
          <GlassCard className="!p-4 bg-[#0a0a0f]/90 backdrop-blur-lg">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-tesla-red/20 flex items-center justify-center shrink-0">
                <Navigation className="w-4 h-4 text-tesla-red" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-medium text-white truncate">
                  {vehicleData?.display_name ?? "Vehicle"}
                </h3>
                <p className="text-[11px] text-white/70 mt-0.5 line-clamp-2">
                  {locationLoading ? "Loading..." : address}
                </p>
                {lat && lng && (
                  <p className="text-[10px] font-mono text-white/50 mt-1">
                    {lat.toFixed(6)}, {lng.toFixed(6)}
                  </p>
                )}
              </div>
            </div>

            {googleMapsUrl && (
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 mt-3 text-[11px] text-tesla-red hover:text-tesla-red/80 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                Get Directions
              </a>
            )}
          </GlassCard>
        </div>

        {/* Recent drives overlay with replay buttons */}
        {drivesData && drivesData.results.length > 0 && (
          <div className="absolute bottom-4 left-4 max-w-sm">
            <GlassCard className="!p-3 bg-[#0a0a0f]/90 backdrop-blur-lg">
              <div className="flex items-center gap-2 mb-2">
                <Route className="w-3 h-3 text-tesla-red" />
                <span className="text-[10px] text-white/60 uppercase tracking-wider font-medium">
                  Recent Drives — Click to Replay
                </span>
              </div>
              <div className="space-y-1 max-h-[200px] overflow-y-auto scrollbar-thin">
                {drivesData.results.slice(0, 15).map((drive) => {
                  const driveDate = new Date(drive.started_at * 1000);
                  const timeStr = driveDate.toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  });
                  const dateStr = driveDate.toLocaleDateString([], {
                    month: "short",
                    day: "numeric",
                  });

                  return (
                    <button
                      key={drive.id}
                      onClick={() => setSelectedDrive(drive)}
                      className="w-full flex items-center gap-2.5 text-left px-2.5 py-2 rounded-lg hover:bg-white/[0.06] transition-colors group"
                    >
                      <div className="w-6 h-6 rounded-md bg-tesla-red/10 flex items-center justify-center shrink-0 group-hover:bg-tesla-red/20 transition-colors">
                        <Play className="w-3 h-3 text-tesla-red" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-white/75 truncate group-hover:text-white/90 transition-colors">
                          {drive.ending_saved_location ||
                            drive.ending_location.split(",")[0]}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-white/50">
                          <span>{dateStr}</span>
                          <span>{timeStr}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-white/50 shrink-0">
                        {formatDistance(drive.odometer_distance, distanceUnit)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
}
