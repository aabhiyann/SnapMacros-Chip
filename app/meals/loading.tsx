import { MealCardSkeleton } from "@/components/Skeleton";

export default function MealsLoading() {
  return (
    <div className="p-4">
      <div className="h-7 w-40 rounded bg-elevated animate-pulse mb-4" />
      <div className="space-y-3">
        <MealCardSkeleton />
        <MealCardSkeleton />
        <MealCardSkeleton />
      </div>
    </div>
  );
}
