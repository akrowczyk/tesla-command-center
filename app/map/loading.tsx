import { MapPin } from "lucide-react";

export default function MapLoading() {
  return (
    <div className="space-y-6 animate-fade-in h-full">
      <div className="relative rounded-xl overflow-hidden border border-white/[0.06]" style={{ height: "calc(100vh - 220px)" }}>
        <div className="w-full h-full bg-tesla-bg-raised flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-8 h-8 text-white/20 mx-auto mb-2 animate-pulse" />
            <p className="text-sm text-white/30">Loading map...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
