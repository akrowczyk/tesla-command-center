import { CardSkeleton } from "@/components/shared/loading-skeleton";

export default function ChargingLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CardSkeleton className="h-[340px]" />
        <CardSkeleton className="h-[340px]" />
      </div>
      <CardSkeleton className="h-[300px]" />
    </div>
  );
}
