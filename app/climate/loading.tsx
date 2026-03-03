import { CardSkeleton } from "@/components/shared/loading-skeleton";

export default function ClimateLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CardSkeleton className="h-[340px]" />
        <CardSkeleton className="h-[280px]" />
        <CardSkeleton className="h-[220px]" />
        <CardSkeleton className="h-[180px]" />
      </div>
    </div>
  );
}
