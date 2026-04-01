"use client";

import { useEffect, useState, useMemo } from "react";
import { api } from "@/lib/api";
import { AppShell } from "@/components/AppShell";
import { FoodCard, FoodLog } from "@/components/FoodCard";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Download, Camera } from "lucide-react";
import { useRouter } from "next/navigation";

type Filter = "today" | "week" | "month" | "all";

const FILTER_LABELS: Record<Filter, string> = {
    today: "Today",
    week:  "Week",
    month: "Month",
    all:   "All",
};

function isWithinFilter(dateStr: string, filter: Filter): boolean {
    const d = new Date(dateStr);
    const now = new Date();
    if (filter === "today") {
        return d.toDateString() === now.toDateString();
    }
    if (filter === "week") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return d >= weekAgo;
    }
    if (filter === "month") {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return d >= monthAgo;
    }
    return true;
}

function formatGroupDate(dateStr: string): string {
    const d = new Date(dateStr);
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    if (d.toDateString() === now.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function SkeletonCard() {
    return (
        <div className="flex items-center p-4 bg-[#13131C] rounded-2xl mb-3 border border-[#2A2A3D]">
            <div className="w-12 h-12 rounded-[14px] bg-[#1C1C28] shrink-0 mr-4 animate-pulse" />
            <div className="flex-1">
                <div className="h-4 bg-[#1C1C28] rounded-full w-3/4 mb-2 animate-pulse" />
                <div className="h-3 bg-[#1C1C28] rounded-full w-1/2 animate-pulse" />
            </div>
            <div className="w-12 h-6 bg-[#1C1C28] rounded-full animate-pulse" />
        </div>
    );
}

function EmptyMeals({ filter, onSnap }: { filter: Filter; onSnap: () => void }) {
    const msg: Record<Filter, string> = {
        today: "Nothing logged today yet.",
        week:  "No meals logged this week.",
        month: "No meals logged this month.",
        all:   "No meals logged yet.",
    };
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center py-16 px-6 text-center"
        >
            <span className="text-[48px] mb-4">🍽️</span>
            <h3 className="font-['Bricolage_Grotesque'] text-[20px] font-bold text-white mb-2">
                {msg[filter]}
            </h3>
            <p className="text-[#56566F] font-['DM_Sans'] text-[14px] mb-6 max-w-[220px]">
                Snap a meal and Chip will break down the macros instantly.
            </p>
            <button
                onClick={onSnap}
                className="premium-btn px-8 flex items-center gap-2"
            >
                <Camera size={16} />
                Snap a Meal
            </button>
        </motion.div>
    );
}

export default function MealsPage() {
    const router = useRouter();
    const [meals, setMeals]     = useState<FoodLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState<string | null>(null);
    const [filter, setFilter]   = useState<Filter>("week");
    const [search, setSearch]   = useState("");

    const fetchMeals = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(api("/api/meals?limit=100"));
            if (!res.ok) throw new Error("Failed to load meals");
            const data = await res.json() as { meals?: FoodLog[] };
            setMeals(data.meals ?? []);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to load meals");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchMeals(); }, []);

    const handleDelete = async (id: string) => {
        setMeals(prev => prev.filter(m => m.id !== id));
        try {
            await fetch(api(`/api/log?id=${id}`), { method: "DELETE" });
        } catch {
            // Re-fetch on error to sync state
            fetchMeals();
        }
    };

    // Filter + search
    const filtered = useMemo(() => {
        let result = meals.filter(m => isWithinFilter(m.created_at, filter));
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(m => m.description?.toLowerCase().includes(q));
        }
        return result;
    }, [meals, filter, search]);

    // Group by date
    const grouped = useMemo(() => {
        const groups: Map<string, FoodLog[]> = new Map();
        for (const meal of filtered) {
            const key = new Date(meal.created_at).toDateString();
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key)!.push(meal);
        }
        return Array.from(groups.entries()).map(([key, items]) => ({
            label: formatGroupDate(items[0].created_at),
            key,
            items,
            totalCal: items.reduce((s, m) => s + m.calories, 0),
        }));
    }, [filtered]);

    // CSV export
    const handleExport = () => {
        if (meals.length === 0) return;
        const rows = [
            ["Date", "Time", "Food", "Calories", "Protein (g)", "Carbs (g)", "Fat (g)", "Meal Type"],
            ...meals.map(m => [
                new Date(m.created_at).toLocaleDateString(),
                formatTime(m.created_at),
                `"${m.description}"`,
                m.calories,
                m.protein,
                m.carbs,
                m.fat,
                m.meal_type ?? "other",
            ])
        ];
        const csv = rows.map(r => r.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `snapmacros-meals-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <AppShell>
            {/* ── Fixed header ── */}
            <div className="fixed top-0 left-0 right-0 z-50 pt-[max(env(safe-area-inset-top),16px)] pb-4 px-5
                            bg-[rgba(9,9,15,0.92)] backdrop-blur-[20px] border-b border-white/[0.05] max-w-md mx-auto">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="font-['Bricolage_Grotesque'] text-[22px] font-bold text-white">
                        Meal History
                    </h1>
                    <button
                        onClick={handleExport}
                        disabled={meals.length === 0}
                        className="w-[36px] h-[36px] rounded-full bg-[#13131C] border border-[#2A2A3D] flex items-center justify-center disabled:opacity-40 active:scale-95 transition-transform"
                        aria-label="Export CSV"
                    >
                        <Download size={16} className="text-[#9898B3]" />
                    </button>
                </div>

                {/* Search */}
                <div className="relative mb-3">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#56566F]" />
                    <input
                        type="search"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search meals..."
                        className="w-full h-[38px] bg-[#13131C] border border-[#2A2A3D] rounded-full pl-9 pr-4 text-[14px] font-['DM_Sans'] text-white placeholder:text-[#56566F] focus:outline-none focus:border-[#4F9EFF] transition-colors"
                    />
                </div>

                {/* Filter tabs */}
                <div className="flex gap-2">
                    {(Object.keys(FILTER_LABELS) as Filter[]).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`flex-1 py-1.5 rounded-full text-[13px] font-['DM_Sans'] font-semibold transition-all ${
                                filter === f
                                    ? "bg-[#4F9EFF]/15 text-[#4F9EFF] border border-[#4F9EFF]/30"
                                    : "text-[#56566F] border border-transparent"
                            }`}
                        >
                            {FILTER_LABELS[f]}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Spacer for fixed header ── */}
            <div className="h-[168px]" />

            {/* ── Content ── */}
            <div className="px-5 pb-[100px]">
                {loading && (
                    <div className="space-y-1">
                        <SkeletonCard /><SkeletonCard /><SkeletonCard />
                    </div>
                )}

                {!loading && error && (
                    <div className="flex flex-col items-center py-12 text-center">
                        <p className="text-[#FF6B6B] text-[14px] font-['DM_Sans'] mb-4">{error}</p>
                        <button onClick={fetchMeals} className="premium-btn px-8">Retry</button>
                    </div>
                )}

                {!loading && !error && filtered.length === 0 && (
                    <EmptyMeals filter={filter} onSnap={() => router.push("/snap")} />
                )}

                {!loading && !error && grouped.length > 0 && (
                    <AnimatePresence>
                        {grouped.map((group, gi) => (
                            <motion.div
                                key={group.key}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: gi * 0.05 }}
                                className="mb-4"
                            >
                                {/* Date header */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="h-px w-6 bg-[#2A2A3D]" />
                                        <span className="font-['DM_Sans'] text-[11px] font-bold uppercase tracking-widest text-[#56566F]">
                                            {group.label}
                                        </span>
                                        <div className="h-px w-6 bg-[#2A2A3D]" />
                                    </div>
                                    <span className="font-['DM_Sans'] text-[12px] text-[#56566F]">
                                        {Math.round(group.totalCal)} cal
                                    </span>
                                </div>

                                {/* Meal cards */}
                                {group.items.map((meal, idx) => (
                                    <div key={meal.id} className="relative">
                                        {/* Time badge */}
                                        <span className="absolute top-0 right-3 z-20 text-[10px] text-[#56566F] font-['DM_Sans'] pt-[18px]">
                                            {formatTime(meal.created_at)}
                                        </span>
                                        <FoodCard
                                            log={meal}
                                            index={gi * 10 + idx}
                                            onDelete={handleDelete}
                                        />
                                    </div>
                                ))}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}

                {/* Meal count footer */}
                {!loading && !error && filtered.length > 0 && (
                    <p className="text-center text-[12px] text-[#56566F] font-['DM_Sans'] pt-2">
                        {filtered.length} meal{filtered.length !== 1 ? "s" : ""}
                        {search ? " matching" : ""} · {Math.round(filtered.reduce((s, m) => s + m.calories, 0))} cal total
                    </p>
                )}
            </div>
        </AppShell>
    );
}
