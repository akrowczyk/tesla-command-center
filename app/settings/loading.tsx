import { CardSkeleton } from "@/components/shared/loading-skeleton";

export default function SettingsLoading() {
  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <CardSkeleton className="h-[280px]" />
      <CardSkeleton className="h-[220px]" />
      <CardSkeleton className="h-[100px]" />
    </div>
  );
}
