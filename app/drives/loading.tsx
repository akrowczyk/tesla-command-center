import { CardSkeleton, ChartSkeleton } from "@/components/shared/loading-skeleton";

export default function DrivesLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CardSkeleton className="h-[100px]" />
        <CardSkeleton className="h-[100px]" />
        <CardSkeleton className="h-[100px]" />
      </div>
      <CardSkeleton className="h-[400px]" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton className="h-[260px]" />
        <ChartSkeleton className="h-[260px]" />
      </div>
    </div>
  );
}
