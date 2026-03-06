import { RoastSkeleton } from "@/components/Skeleton";

export default function RoastLoading() {
  return (
    <div className="p-4">
      <div className="h-7 w-36 rounded bg-elevated animate-pulse mb-4" />
      <RoastSkeleton />
    </div>
  );
}
