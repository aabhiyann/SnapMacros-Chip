"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { MealCardSkeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";

interface Meal {
  id: string;
  description?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  created_at?: string;
}

export default function MealsPage() {
  const [meals, setMeals] = useState<Meal[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMeals = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(api("/api/meals"));
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Failed to load meals");
      }
      const data = (await res.json()) as { meals: Meal[] };
      setMeals(data.meals ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load meals");
      setMeals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeals();
  }, []);

  return (
    <div className="p-4">
      <h2 className="font-heading text-xl font-bold text-text mb-4">Meal history</h2>
      {loading && (
        <div className="space-y-3">
          <MealCardSkeleton />
          <MealCardSkeleton />
          <MealCardSkeleton />
        </div>
      )}
      {!loading && error && <ErrorState message={error} onRetry={fetchMeals} />}
      {!loading && !error && meals && meals.length === 0 && (
        <EmptyState
          title="No meals yet"
          description="Log your first meal from the Log page to see your history here."
          actionLabel="Log a meal"
          onAction={() => window.location.assign("/log")}
        />
      )}
      {!loading && !error && meals && meals.length > 0 && (
        <ul className="space-y-3">
          {meals.map((meal) => (
            <li key={meal.id}>
              <div className="rounded-xl bg-card border border-elevated p-4">
                <p className="font-medium text-text">
                  {meal.description ?? "Meal"}
                </p>
                <p className="text-text-secondary text-sm mt-1">
                  {meal.calories ?? "—"} cal · P {meal.protein ?? "—"} · C {meal.carbs ?? "—"} · F {meal.fat ?? "—"}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
