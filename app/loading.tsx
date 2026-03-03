import { CardSkeleton } from "@/components/shared/loading-skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CardSkeleton className="h-[260px]" />
        <CardSkeleton className="h-[260px]" />
        <CardSkeleton className="h-[260px]" />
      </div>
      <CardSkeleton className="h-[80px]" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CardSkeleton className="h-[200px]" />
        <CardSkeleton className="h-[200px]" />
      </div>
    </div>
  );
}
