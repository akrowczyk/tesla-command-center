import { Car } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[500px] animate-fade-in">
      <div className="glass-card max-w-md text-center p-10">
        <div className="w-16 h-16 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-6">
          <Car className="w-8 h-8 text-white/40" />
        </div>
        <h1 className="text-4xl font-mono font-bold text-white/40 mb-2">404</h1>
        <h2 className="text-lg font-medium text-white mb-2">Page Not Found</h2>
        <p className="text-sm text-white/60 mb-8">
          This route doesn&apos;t exist in the Tesla Command Center.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg bg-tesla-red/10 border border-tesla-red/20 text-tesla-red hover:bg-tesla-red/20 transition-all"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
