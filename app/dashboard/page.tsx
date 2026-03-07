"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import Chip from "@/components/Chip";
import { MacroRings } from "@/components/MacroRings";
import { MealTimeline } from "@/components/MealTimeline";
import { FoodLog } from "@/components/FoodCard";
import { motion, AnimatePresence } from "framer-motion";

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
        return (
            <AppShell>
                {/* Skeleton Header */}
                <div className="pt-[48px] px-[20px] mb-8 animate-pulse">
                    <div className="w-1/3 h-4 bg-[#2A2A3A] rounded mb-2"></div>
                    <div className="w-1/2 h-8 bg-[#2A2A3A] rounded mb-1"></div>
                    <div className="w-1/4 h-3 bg-[#2A2A3A] rounded mt-2"></div>
                </div>

                {/* Skeleton Chip Row */}
                <div className="px-[20px] h-[120px] mb-6 flex gap-4 animate-pulse">
                    <div className="w-[80px] h-[80px] rounded-full bg-[#2A2A3A] shrink-0" />
                    <div className="flex-1 bg-[#1A1A24] rounded-[14px] p-4 h-[80px]" />
                </div>

                {/* Skeleton Rings */}
                <div className="flex justify-center mb-12">
                    <div className="w-[280px] h-[280px] rounded-full border-8 border-[#2A2A3A] animate-pulse" />
                </div>

                {/* Skeleton Timeline */}
                <MealTimeline logs={[]} isLoading={true} onDeleteLog={() => { }} />
            </AppShell>
        );
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
            {/* 1. Header (60px fixed equivalent) */}
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

            {/* 2. Chip + Speech Row */}
            <div className="px-[20px] mb-6 flex items-center gap-4 min-h-[120px]">
                <motion.div
                    initial={{ x: -40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="shrink-0 relative z-10"
                >
                    <Chip emotion={data.chip.emotion} size={100} />
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15 }}
                    className="flex-1 bg-[#1A1A24] rounded-[14px] p-4 border border-[#2A2A3A] relative shadow-lg z-0"
                >
                    <div className="absolute top-1/2 -left-[6px] -translate-y-1/2 w-4 h-4 bg-[#1A1A24] border-l border-b border-[#2A2A3A] rotate-45 z-0" />
                    <p className="text-[14px] text-white font-['DM_Sans'] relative z-10 italic">
                        "{data.chip.message}"
                    </p>
                </motion.div>
            </div>

            {/* 3. Macro Rings */}
            <div className="flex justify-center mb-4">
                <MacroRings
                    calories={data.current.calories} targetCalories={data.targets.calories}
                    protein={data.current.protein} targetProtein={data.targets.protein}
                    carbs={data.current.carbs} targetCarbs={data.targets.carbs}
                    fat={data.current.fat} targetFat={data.targets.fat}
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

            {/* 4. Meal Timeline */}
            <MealTimeline
                logs={data.logs}
                isLoading={false}
                onDeleteLog={handleDeleteLog}
            />

        </AppShell>
    );
}
