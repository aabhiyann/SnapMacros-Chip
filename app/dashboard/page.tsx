"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Chip } from "@/components/Chip";
import { MacroRings } from "@/components/MacroRings";
import { MealTimeline } from "@/components/MealTimeline";
import { FoodLog } from "@/components/FoodCard";
import { motion, AnimatePresence } from "framer-motion";

// Helper component for the spec-driven skeleton
function DashboardSkeleton() {
    return (
        <AppShell>
            {/* Header placeholder (fixed 60px equiv) */}
            <div className="pt-[48px] px-[20px] mb-8 relative">
                <div className="w-[100px] h-3 bg-[#2A2A3A] rounded mb-2 overflow-hidden relative">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </div>
                <div className="w-[150px] h-6 bg-[#2A2A3A] rounded overflow-hidden relative">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </div>
            </div>

            {/* Gray Mascot Oval placeholder */}
            <div className="px-[20px] mb-6 flex items-center gap-4 min-h-[120px]">
                <div className="w-[100px] h-[100px] rounded-[50px] bg-[#2A2A3A] shrink-0 overflow-hidden relative">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </div>
                <div className="flex-1 bg-[#1A1A24] rounded-[14px] p-4 h-[80px] border border-[#2A2A3A] relative overflow-hidden">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                </div>
            </div>

            {/* 4 Gray Circles in Ring Positions placeholder */}
            <div className="flex justify-center mb-10 overflow-hidden relative">
                <div className="w-[280px] h-[280px] rounded-full border-8 border-[#2A2A3A] flex items-center justify-center relative shadow-inner">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    {/* Inner rings approximation */}
                    <div className="w-[240px] h-[240px] rounded-full border-8 border-[#2A2A3A] absolute" />
                    <div className="w-[200px] h-[200px] rounded-full border-8 border-[#2A2A3A] absolute" />
                    <div className="w-[160px] h-[160px] rounded-full border-8 border-[#2A2A3A] absolute" />
                </div>
            </div>

            {/* 3 Gray Card bars placeholder */}
            <div className="px-[20px]">
                <div className="w-[120px] h-5 bg-[#2A2A3A] rounded mb-4 overflow-hidden relative">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </div>
                {[1, 2, 3].map(i => (
                    <div key={i} className="w-full h-[70px] bg-[#1A1A24] rounded-2xl mb-3 border border-[#2A2A3A] flex items-center px-4 overflow-hidden relative">
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                        <div className="w-[40px] h-[40px] bg-[#2A2A3A] rounded-[10px] mr-4" />
                        <div className="flex-1">
                            <div className="w-[60%] h-4 bg-[#2A2A3A] rounded mb-2" />
                            <div className="w-[40%] h-3 bg-[#2A2A3A] rounded" />
                        </div>
                    </div>
                ))}
            </div>

            <style jsx global>{`
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </AppShell>
    );
}

export default function DashboardPage() {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboardData = async () => {
        try {
            const res = await fetch("/api/dashboard");
            if (!res.ok) throw new Error("Failed to fetch dashboard");
            const json = await res.json();
            setData(json);
        } catch (err) {
            console.error(err);
            setError("Unable to load dashboard data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleDeleteLog = async (id: string) => {
        // Optimistic delete
        if (!data) return;
        const previousLogs = [...data.logs];
        const targetLog = previousLogs.find(l => l.id === id);
        if (!targetLog) return;

        setData({
            ...data,
            logs: previousLogs.filter(l => l.id !== id),
            current: {
                calories: Math.max(0, data.current.calories - targetLog.calories),
                protein: Math.max(0, data.current.protein - targetLog.protein),
                carbs: Math.max(0, data.current.carbs - targetLog.carbs),
                fat: Math.max(0, data.current.fat - targetLog.fat),
            }
        });

        try {
            const res = await fetch(`/api/log?id=${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Delete failed");
            // Optionally refetch to ensure perfect sync
            fetchDashboardData();
        } catch (err) {
            // Revert optimistic delete
            setData({ ...data, logs: previousLogs });
            console.error("Failed to delete log");
        }
    };

    // ---------------------------------------------------------------------------
    // RENDER: Skeleton Loading
    // ---------------------------------------------------------------------------
    if (isLoading || !data) {
        return <DashboardSkeleton />;
    }

    // ---------------------------------------------------------------------------
    // RENDER: Error State
    // ---------------------------------------------------------------------------
    if (error) {
        return (
            <AppShell>
                <div className="flex flex-col items-center justify-center pt-32 px-4 text-center">
                    <Chip emotion="sad" size={100} />
                    <h2 className="text-white mt-6 mb-2 text-xl font-bold font-['Bricolage_Grotesque']">Oops.</h2>
                    <p className="text-[#A0A0B8] mb-6 font-['DM_Sans']">{error}</p>
                    <button onClick={fetchDashboardData} className="px-6 py-3 bg-[#FF6B35] text-white rounded-xl font-['DM_Sans'] font-semibold">
                        Retry
                    </button>
                </div>
            </AppShell>
        );
    }

    // ---------------------------------------------------------------------------
    // RENDER: Success Data
    // ---------------------------------------------------------------------------
    // Greeting logic
    const hr = new Date().getHours();
    const greeting = hr < 12 ? "Good morning," : hr < 18 ? "Good afternoon," : "Good evening,";

    const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'short', day: 'numeric' };
    const todayDate = new Date().toLocaleDateString('en-US', dateOptions);

    return (
        <AppShell>
            {/* 1. Header */}
            <div className="pt-[48px] px-[20px] mb-8 relative">
                <div className="flex justify-between items-start">
                    <div>
                        <span className="text-[#A0A0B8] text-[14px] font-['DM_Sans']">{greeting}</span>
                        <h1 className="text-white text-[22px] font-bold font-['DM_Sans'] leading-tight">{data.profile.name}</h1>
                    </div>
                    {data.profile.streak_days > 0 && (
                        <div className="bg-[#FF6B35]/20 text-[#FF6B35] px-3 py-1 rounded-full flex items-center gap-1.5 border border-[#FF6B35]/30">
                            <span className="text-[12px] font-bold font-['DM_Sans']">🔥 {data.profile.streak_days} days</span>
                        </div>
                    )}
                </div>
                <p className="text-[#60607A] text-[13px] font-['DM_Sans'] mt-2 tracking-wide uppercase">{todayDate}</p>
            </div>

            {/* 2. Chip + Speech Row | Mount: x:-40->0 spring (300ms delay) */}
            <div className="px-[20px] mb-6 flex items-center gap-4 min-h-[120px]">
                <motion.div
                    initial={{ x: -40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.3 }}
                    className="shrink-0 relative z-10"
                >
                    <Chip emotion={data.chip.emotion} size={100} />
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.85 }} // Fades in at 850ms per spec
                    className="flex-1 bg-[#1A1A24] rounded-[14px] p-4 border border-[#2A2A3A] relative shadow-lg z-0"
                >
                    <div className="absolute top-1/2 -left-[6px] -translate-y-1/2 w-4 h-4 bg-[#1A1A24] border-l border-b border-[#2A2A3A] rotate-45 z-0" />
                    <p className="text-[14px] text-white font-['DM_Sans'] relative z-10 italic">
                        "{data.chip.message}"
                    </p>
                </motion.div>
            </div>

            {/* 3. Macro Rings (Handles 400ms fill stagger + 500ms 0->value count cascade) */}
            <div className="flex justify-center mb-4">
                <MacroRings
                    calories={{ current: data.current.calories, target: data.targets.calories }}
                    protein={{ current: data.current.protein, target: data.targets.protein }}
                    carbs={{ current: data.current.carbs, target: data.targets.carbs }}
                    fat={{ current: data.current.fat, target: data.targets.fat }}
                    animate={true}
                />
            </div>

            {/* Labels below rings */}
            <div className="flex justify-center gap-4 px-4 mb-10">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#FF6B35]" /><span className="text-[11px] text-[#A0A0B8] uppercase">Cal</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#6C63FF]" /><span className="text-[11px] text-[#A0A0B8] uppercase">Pro</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#2DD4BF]" /><span className="text-[11px] text-[#A0A0B8] uppercase">Car</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#FBBF24]" /><span className="text-[11px] text-[#A0A0B8] uppercase">Fat</span></div>
            </div>

            {/* 4. Meal Timeline (Mount Fades In Stacked Elements from 650ms) */}
            <MealTimeline
                logs={data.logs}
                isLoading={false}
                onDeleteLog={handleDeleteLog}
            />

        </AppShell>
    );
}
