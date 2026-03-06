"use client";

import { useEffect, useState } from "react";
import { RoastSkeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";

export default function RoastPage() {
  const [roast, setRoast] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoast = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/roast");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Failed to load roast");
      }
      const data = (await res.json()) as { roast: string | null };
      setRoast(data.roast ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load roast");
      setRoast(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoast();
  }, []);

  return (
    <div className="p-4">
      <h2 className="font-heading text-xl font-bold text-text mb-4">Weekly roast</h2>
      {loading && <RoastSkeleton />}
      {!loading && error && <ErrorState message={error} onRetry={fetchRoast} />}
      {!loading && !error && !roast && (
        <EmptyState
          title="No roast yet"
          description="Log some meals first so Chip can roast your week."
          actionLabel="Log a meal"
          onAction={() => window.location.assign("/log")}
        />
      )}
      {!loading && !error && roast && (
        <div className="rounded-xl bg-card border border-elevated p-6">
          <p className="text-text whitespace-pre-wrap">{roast}</p>
        </div>
      )}
    </div>
  );
}
