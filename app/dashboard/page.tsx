"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Chip } from "@/components/Chip";
import { MacroRings } from "@/components/MacroRings";
import { MealTimeline } from "@/components/MealTimeline";
import { CountUp } from "@/components/rings/CountUp";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";

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
    const [showDemoBanner, setShowDemoBanner] = useState(true);

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
            {data.profile?.email === "demo@snapmacros.app" && showDemoBanner && (
                <div className="bg-[#FF6B35]/10 border-b border-[#FF6B35]/20 px-4 py-2 flex items-center justify-between z-20">
                    <p className="text-[#FF6B35] text-[13px] text-center flex-1 font-['DM_Sans']">
                        👀 You're in demo mode — snap any food to try it out!
                    </p>
                    <button onClick={() => setShowDemoBanner(false)} className="text-[#FF6B35] p-1 font-bold">
                        ✕
                    </button>
                </div>
            )}

            {/* 1. Frosted Glass Fixed Header */}
            <div className="fixed top-0 left-0 right-0 z-50 pt-[max(env(safe-area-inset-top),16px)] pb-4 px-[20px] bg-[rgba(15,15,20,0.85)] backdrop-blur-[20px] border-b border-white/[0.06] flex justify-between items-center max-w-md mx-auto">
                <div className="flex flex-col">
                    <span className="text-[#60607A] text-[13px] font-[500] tracking-wide font-['DM_Sans']">{greeting}</span>
                    <h1 className="text-[24px] font-bold font-['Bricolage_Grotesque'] tracking-tight text-white leading-none mt-1">
                        {data.profile.full_name?.split(' ')[0] || "Athlete"}
                    </h1>
                </div>
                {data.profile.streak_days > 0 ? (
                    <div className="bg-gradient-to-br from-[#FF6B35]/20 to-[#FF6B35]/10 border border-[#FF6B35]/30 rounded-full px-3 py-1 mt-1 shrink-0 shadow-[0_0_12px_rgba(255,107,53,0.3)] flex items-center gap-1.5">
                        <Flame size={14} stroke="#FF6B35" strokeWidth={2.5} />
                        <span className="text-[13px] font-bold font-['DM_Sans'] text-[#FF6B35] tracking-wide">{data.profile.streak_days}</span>
                    </div>
                ) : (
                    <div className="bg-white/5 border border-white/10 rounded-full px-3 py-1 mt-1 shrink-0 flex items-center gap-1.5">
                        <Flame size={14} stroke="#A0A0B8" strokeWidth={2.5} />
                        <span className="text-[13px] font-semibold font-['DM_Sans'] text-[#A0A0B8] tracking-wide">0</span>
                    </div>
                )}
            </div>

            {/* Spacer for fixed header */}
            <div className="h-[88px]" />

            {/* 2. Chip + Speech Row | Mount: x:-40->0 spring (300ms delay) */}
            <div className="px-[20px] mb-6 flex items-center gap-4 min-h-[120px]">
                <motion.div
                    initial={{ x: -40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.3 }}
                    className="shrink-0 relative z-10"
                >
                    <Chip emotion={data.current.calories > data.targets.calories + 50 ? "shocked" : data.chip.emotion} size={100} />
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.85 }}
                    className="flex-1 bg-[rgba(26,26,36,0.8)] border border-[rgba(255,255,255,0.04)] rounded-[16px] relative z-0 p-4 shadow-lg backdrop-blur-md"
                >
                    <div className="absolute top-1/2 -left-[6px] -translate-y-1/2 w-3 h-3 bg-[rgba(26,26,36,0.8)] border-l border-b border-[rgba(255,255,255,0.04)] rotate-45 z-0" />
                    <div className="relative z-10 flex items-center h-full">
                        {data.current.calories > data.targets.calories + 50 ? (
                            <div>
                                <p className="text-[14px] text-[#A0A0B8] font-['DM_Sans'] italic mb-1">
                                    "Went a bit over today."
                                </p>
                                <p className="text-[14px] text-[#A0A0B8] font-['DM_Sans'] italic">
                                    "Tomorrow is what matters."
                                </p>
                            </div>
                        ) : (
                            <p className="text-[14px] text-[#A0A0B8] font-['DM_Sans'] italic leading-snug">
                                &quot;{data.chip.message}&quot;
                            </p>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* 3. Macro Rings (280px, centered, 20px padding) */}
            <div className="flex justify-center px-[20px] mb-6">
                <MacroRings
                    calories={{ current: data.current.calories, target: data.targets.calories }}
                    protein={{ current: data.current.protein, target: data.targets.protein }}
                    carbs={{ current: data.current.carbs, target: data.targets.carbs }}
                    fat={{ current: data.current.fat, target: data.targets.fat }}
                    animate={true}
                    size={280}
                >
                    <div className="flex flex-col items-center justify-center">
                        <CountUp value={data.current.calories} className="text-[52px] font-['Bricolage_Grotesque'] font-[800] tracking-[-2px] text-white leading-none" delay={0.5} duration={0.6} />
                        <span className="text-[13px] text-[#60607A] font-medium tracking-wide font-['DM_Sans'] mt-1">/ {data.targets.calories} cal</span>

                        <div className={`mt-2 px-3 py-1 rounded-full text-[11px] uppercase tracking-wide font-bold font-['DM_Sans'] ${data.current.calories > data.targets.calories ? 'bg-[#EF4444]/20 border border-[#EF4444]/30 text-[#EF4444]' : 'bg-[#2DD4BF]/20 border border-[#2DD4BF]/30 text-[#2DD4BF]'}`}>
                            {data.current.calories > data.targets.calories ? `${data.current.calories - data.targets.calories} over` : `${data.targets.calories - data.current.calories} left`}
                        </div>
                    </div>
                </MacroRings>
            </div>

            {/* 4. Macro Pill Row (Horizontal Scroll) */}
            <div className="w-full overflow-x-auto hide-scrollbar pb-2 mb-8 px-[20px]">
                <div className="flex gap-3 min-w-max">
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2DD4BF]/10 border border-[#2DD4BF]/30">
                        <span className="text-[14px]">💜</span>
                        <div className="flex flex-col">
                            <span className="text-[#2DD4BF] font-bold text-[14px] font-['Bricolage_Grotesque'] leading-tight">{data.current.protein} <span className="text-[#2DD4BF]/70 font-normal">/ {data.targets.protein}g</span></span>
                            <span className="text-[#2DD4BF]/70 text-[10px] uppercase font-bold tracking-wider">Protein</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FBBF24]/10 border border-[#FBBF24]/30">
                        <span className="text-[14px]">💚</span>
                        <div className="flex flex-col">
                            <span className="text-[#FBBF24] font-bold text-[14px] font-['Bricolage_Grotesque'] leading-tight">{data.current.carbs} <span className="text-[#FBBF24]/70 font-normal">/ {data.targets.carbs}g</span></span>
                            <span className="text-[#FBBF24]/70 text-[10px] uppercase font-bold tracking-wider">Carbs</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F87171]/10 border border-[#F87171]/30">
                        <span className="text-[14px]">🟡</span>
                        <div className="flex flex-col">
                            <span className="text-[#F87171] font-bold text-[14px] font-['Bricolage_Grotesque'] leading-tight">{data.current.fat} <span className="text-[#F87171]/70 font-normal">/ {data.targets.fat}g</span></span>
                            <span className="text-[#F87171]/70 text-[10px] uppercase font-bold tracking-wider">Fat</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF6B35]/10 border border-[#FF6B35]/30">
                        <span className="text-[14px]">🔥</span>
                        <div className="flex flex-col">
                            <span className="text-[#FF6B35] font-bold text-[14px] font-['Bricolage_Grotesque'] leading-tight">{data.current.calories} <span className="text-[#FF6B35]/70 font-normal">/ {data.targets.calories}</span></span>
                            <span className="text-[#FF6B35]/70 text-[10px] uppercase font-bold tracking-wider">Calories</span>
                        </div>
                    </div>
                </div>
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
