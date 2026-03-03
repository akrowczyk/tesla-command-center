"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useDrivePath } from "@/hooks/use-drive-path";
import type { DriveRecord } from "@/lib/types";
import { useSettingsStore } from "@/lib/store";
import { convertSpeed, speedLabel, formatDistance } from "@/lib/units";
import {
  Play,
  Pause,
  RotateCcw,
  X,
  Gauge,
  Battery,
  Clock,
  Loader2,
} from "lucide-react";

// ===== Dark map style =====
const DARK_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#1a1a2e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a1a2e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#6a6a7a" }] },
  {
    featureType: "administrative",
    elementType: "geometry.stroke",
    stylers: [{ color: "#2a2a3e" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#2a2a3e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1a1a2e" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#333350" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0e0e1a" }],
  },
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
];

// ===== Google Maps loader =====
let mapsLoadPromise: Promise<void> | null = null;

function loadGoogleMaps(apiKey: string): Promise<void> {
  if (window.google?.maps) return Promise.resolve();
  if (mapsLoadPromise) return mapsLoadPromise;

  mapsLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(script);
  });

  return mapsLoadPromise;
}

// ===== Helpers =====
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatTime(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

// ===== Speed options =====
const SPEED_OPTIONS = [10, 25, 50, 100, 200];

// ===== Component =====
interface Props {
  drive: DriveRecord;
  onClose: () => void;
  mapsApiKey: string;
}

export function DriveReplayMap({ drive, onClose, mapsApiKey }: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const trailLineRef = useRef<google.maps.Polyline | null>(null);
  const activeLineRef = useRef<google.maps.Polyline | null>(null);
  const carMarkerRef = useRef<google.maps.Marker | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const animFrameRef = useRef(0);

  // Animation state in refs (to avoid re-triggering the effect)
  const playingRef = useRef(false);
  const speedRef = useRef(50);
  const progressRef = useRef(0);

  const [mapsReady, setMapsReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(50);
  const [progress, setProgress] = useState(0);
  const [currentStats, setCurrentStats] = useState<{
    speed: number;
    battery: number;
    elapsed: number;
    total: number;
  } | null>(null);

  const { data: pathData, isLoading: pathLoading } = useDrivePath(drive);
  const distanceUnit = useSettingsStore((s) => s.distanceUnit);

  // Sync state → refs
  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  // Load Google Maps JS API
  useEffect(() => {
    loadGoogleMaps(mapsApiKey)
      .then(() => setMapsReady(true))
      .catch(console.error);
  }, [mapsApiKey]);

  // Initialize map
  useEffect(() => {
    if (!mapsReady || !mapContainerRef.current) return;

    const map = new google.maps.Map(mapContainerRef.current, {
      center: { lat: drive.starting_latitude, lng: drive.starting_longitude },
      zoom: 14,
      styles: DARK_STYLES,
      disableDefaultUI: true,
      zoomControl: true,
      zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_CENTER },
    });
    mapRef.current = map;

    return () => {
      mapRef.current = null;
    };
  }, [mapsReady, drive.id, drive.starting_latitude, drive.starting_longitude]);

  // Cleanup function for map overlays
  const clearOverlays = useCallback(() => {
    trailLineRef.current?.setMap(null);
    activeLineRef.current?.setMap(null);
    carMarkerRef.current?.setMap(null);
    markersRef.current.forEach((m) => m.setMap(null));
    trailLineRef.current = null;
    activeLineRef.current = null;
    carMarkerRef.current = null;
    markersRef.current = [];
    cancelAnimationFrame(animFrameRef.current);
  }, []);

  // Update map position to progress (used by scrubber and animation)
  const updateToProgress = useCallback(
    (newProgress: number) => {
      if (!pathData || pathData.length < 2) return;

      const startTime = pathData[0].timestamp;
      const endTime = pathData[pathData.length - 1].timestamp;
      const duration = endTime - startTime;
      const targetTime = startTime + newProgress * duration;

      // Find segment
      let idx = 0;
      for (let i = 0; i < pathData.length - 1; i++) {
        if (pathData[i + 1].timestamp >= targetTime) {
          idx = i;
          break;
        }
      }

      const p1 = pathData[idx];
      const p2 = pathData[Math.min(idx + 1, pathData.length - 1)];
      const segDur = p2.timestamp - p1.timestamp;
      const t = segDur > 0 ? (targetTime - p1.timestamp) / segDur : 0;

      const lat = lerp(p1.latitude, p2.latitude, t);
      const lng = lerp(p1.longitude, p2.longitude, t);

      // Update car marker
      const pos = new google.maps.LatLng(lat, lng);
      carMarkerRef.current?.setPosition(pos);

      // Update heading
      const heading = p2.heading ?? p1.heading;
      if (heading != null) {
        const icon = carMarkerRef.current?.getIcon() as google.maps.Symbol;
        if (icon) {
          icon.rotation = heading;
          carMarkerRef.current?.setIcon(icon);
        }
      }

      // Update driven polyline
      const driven = pathData
        .slice(0, idx + 1)
        .map((p) => ({ lat: p.latitude, lng: p.longitude }));
      driven.push({ lat, lng });
      activeLineRef.current?.setPath(driven);

      // Update stats
      setCurrentStats({
        speed: lerp(p1.speed ?? 0, p2.speed ?? 0, t),
        battery: lerp(p1.battery_level ?? drive.starting_battery, p2.battery_level ?? drive.ending_battery, t),
        elapsed: targetTime - startTime,
        total: duration,
      });

      progressRef.current = newProgress;
      setProgress(newProgress);
    },
    [pathData, drive]
  );

  // Draw path when data loads
  useEffect(() => {
    if (!pathData || pathData.length < 2 || !mapRef.current) return;

    clearOverlays();

    const path = pathData.map((p) => ({
      lat: p.latitude,
      lng: p.longitude,
    }));

    // Trail polyline (full path, dim)
    trailLineRef.current = new google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: "#4a90d9",
      strokeOpacity: 0.2,
      strokeWeight: 5,
      map: mapRef.current,
    });

    // Active polyline (driven portion, Tesla nav blue)
    activeLineRef.current = new google.maps.Polyline({
      path: [path[0]],
      geodesic: true,
      strokeColor: "#4a90d9",
      strokeOpacity: 1,
      strokeWeight: 5,
      map: mapRef.current,
    });

    // Car marker (arrow)
    carMarkerRef.current = new google.maps.Marker({
      position: path[0],
      map: mapRef.current,
      icon: {
        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
        scale: 6,
        fillColor: "#4a90d9",
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: "#ffffff",
        rotation: pathData[0]?.heading ?? 0,
      },
      zIndex: 10,
    });

    // Start marker (green dot)
    const startMarker = new google.maps.Marker({
      position: path[0],
      map: mapRef.current,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 7,
        fillColor: "#22c55e",
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: "#ffffff",
      },
      zIndex: 5,
    });

    // End marker (red dot)
    const endMarker = new google.maps.Marker({
      position: path[path.length - 1],
      map: mapRef.current,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 7,
        fillColor: "#ef4444",
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: "#ffffff",
      },
      zIndex: 5,
    });

    markersRef.current = [startMarker, endMarker];

    // Fit map to path bounds
    const bounds = new google.maps.LatLngBounds();
    path.forEach((p) => bounds.extend(p));
    mapRef.current.fitBounds(bounds, 80);

    // Initialize at start
    updateToProgress(0);

    return clearOverlays;
  }, [pathData, clearOverlays, updateToProgress]);

  // Animation loop
  useEffect(() => {
    if (!playing || !pathData || pathData.length < 2) return;

    const startTime = pathData[0].timestamp;
    const endTime = pathData[pathData.length - 1].timestamp;
    const duration = endTime - startTime;

    let lastFrameTime = performance.now();
    let currentSimTime = startTime + progressRef.current * duration;

    const animate = (frameTime: number) => {
      if (!playingRef.current) return;

      const dt = (frameTime - lastFrameTime) / 1000;
      lastFrameTime = frameTime;

      currentSimTime += dt * speedRef.current;

      if (currentSimTime >= endTime) {
        setPlaying(false);
        updateToProgress(1);
        return;
      }

      const newProgress = (currentSimTime - startTime) / duration;
      updateToProgress(newProgress);

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animFrameRef.current);
  }, [playing, pathData, updateToProgress]);

  // Handle scrubber change
  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setPlaying(false);
    updateToProgress(val);
  };

  // Reset to start
  const handleReset = () => {
    setPlaying(false);
    updateToProgress(0);
  };

  // Toggle play/pause
  const togglePlay = () => {
    if (progress >= 1) {
      // If at end, restart
      updateToProgress(0);
      setPlaying(true);
    } else {
      setPlaying(!playing);
    }
  };

  const driveDate = new Date(drive.started_at * 1000);
  const dateStr = driveDate.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-white/[0.06]">
      {/* Map container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Loading overlay */}
      {(!mapsReady || pathLoading) && (
        <div className="absolute inset-0 bg-[#0a0a0f] flex items-center justify-center z-20">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-tesla-red animate-spin mx-auto mb-3" />
            <p className="text-sm text-white/50">
              {pathLoading ? "Loading drive path..." : "Loading map..."}
            </p>
          </div>
        </div>
      )}

      {/* ===== Drive info overlay (top-left) ===== */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-[#0a0a0f]/90 backdrop-blur-xl rounded-xl border border-white/[0.06] p-4 max-w-xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-tesla-red animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest text-tesla-red font-medium">
              Drive Replay
            </span>
          </div>
          <p className="text-xs text-white/70 font-medium">
            {drive.starting_saved_location ||
              drive.starting_location.split(",")[0]}
          </p>
          <div className="flex items-center gap-1 my-1">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[9px] text-white/30 px-1">to</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>
          <p className="text-xs text-white/70 font-medium">
            {drive.ending_saved_location ||
              drive.ending_location.split(",")[0]}
          </p>
          <div className="flex items-center gap-3 mt-2 text-[10px] text-white/40">
            <span>{dateStr}</span>
            <span>{formatTime(drive.started_at)}</span>
            <span>{formatDistance(drive.odometer_distance, distanceUnit)}</span>
          </div>
        </div>
      </div>

      {/* ===== Close button (top-right) ===== */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-9 h-9 rounded-lg bg-[#0a0a0f]/90 backdrop-blur-xl border border-white/[0.06] flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all"
      >
        <X className="w-4 h-4" />
      </button>

      {/* ===== Live stats overlay (top-right, below close) ===== */}
      {currentStats && (
        <div className="absolute top-16 right-4 z-10">
          <div className="bg-[#0a0a0f]/90 backdrop-blur-xl rounded-xl border border-white/[0.06] p-3 space-y-2.5 min-w-[140px]">
            {/* Speed */}
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-tesla-red/15 flex items-center justify-center">
                <Gauge className="w-3.5 h-3.5 text-tesla-red" />
              </div>
              <div>
                <p className="text-[10px] text-white/35 leading-none">Speed</p>
                <p className="text-sm font-mono font-bold text-white/90 leading-tight">
                  {Math.round(convertSpeed(currentStats.speed, distanceUnit))}{" "}
                  <span className="text-[10px] text-white/40 font-normal">
                    {speedLabel(distanceUnit)}
                  </span>
                </p>
              </div>
            </div>

            {/* Battery */}
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-green-500/15 flex items-center justify-center">
                <Battery className="w-3.5 h-3.5 text-green-400" />
              </div>
              <div>
                <p className="text-[10px] text-white/35 leading-none">Battery</p>
                <p className="text-sm font-mono font-bold text-white/90 leading-tight">
                  {Math.round(currentStats.battery)}
                  <span className="text-[10px] text-white/40 font-normal">%</span>
                </p>
              </div>
            </div>

            {/* Time */}
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-500/15 flex items-center justify-center">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <div>
                <p className="text-[10px] text-white/35 leading-none">Elapsed</p>
                <p className="text-sm font-mono font-bold text-white/90 leading-tight">
                  {formatDuration(currentStats.elapsed)}
                  <span className="text-[10px] text-white/40 font-normal">
                    {" "}
                    / {formatDuration(currentStats.total)}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== Playback controls (bottom) ===== */}
      {pathData && pathData.length >= 2 && (
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="bg-[#0a0a0f]/90 backdrop-blur-xl rounded-xl border border-white/[0.06] p-3">
            <div className="flex items-center gap-3">
              {/* Play / Pause */}
              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-lg bg-tesla-red flex items-center justify-center text-white hover:bg-tesla-red/80 transition-colors shrink-0"
              >
                {playing ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4 ml-0.5" />
                )}
              </button>

              {/* Reset */}
              <button
                onClick={handleReset}
                className="w-10 h-10 rounded-lg bg-white/[0.06] flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors shrink-0"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Scrubber */}
              <div className="flex-1 flex items-center gap-3">
                <span className="text-[10px] font-mono text-white/40 w-10 text-right shrink-0">
                  {formatDuration((currentStats?.elapsed ?? 0))}
                </span>
                <div className="flex-1 relative">
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.001}
                    value={progress}
                    onChange={handleScrub}
                    className="scrubber w-full"
                  />
                </div>
                <span className="text-[10px] font-mono text-white/40 w-10 shrink-0">
                  {formatDuration((currentStats?.total ?? 0))}
                </span>
              </div>

              {/* Speed selector */}
              <div className="flex items-center gap-1 shrink-0">
                {SPEED_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    className={`px-2 py-1 rounded text-[10px] font-mono transition-all ${
                      speed === s
                        ? "bg-tesla-red text-white"
                        : "bg-white/[0.04] text-white/40 hover:text-white/70 hover:bg-white/[0.08]"
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            {/* Start / End labels */}
            <div className="flex items-center justify-between mt-2 px-1">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-[10px] text-white/30">
                  {drive.starting_saved_location || "Start"}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-white/30">
                  {drive.ending_saved_location || "End"}
                </span>
                <div className="w-2 h-2 rounded-full bg-red-500" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
