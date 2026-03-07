"use client";

import { motion } from "framer-motion";
import { FoodCard, FoodLog } from "./FoodCard";
import { Chip } from "@/components/Chip";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

interface MealTimelineProps {
    logs: FoodLog[];
    isLoading: boolean;
    onDeleteLog: (id: string) => void;
}

function SkeletonCard() {
    return (
        <div className="flex items-center p-4 bg-[#1A1A24] rounded-2xl mb-3 shadow-[0_2px_12px_rgba(0,0,0,0.30)] w-full">
            <div className="w-[48px] h-[48px] rounded-[14px] bg-[#2A2A3A] shrink-0 mr-4 animate-pulse" />
            <div className="flex-1 pr-4">
                <div className="h-4 bg-[#2A2A3A] rounded-full w-3/4 mb-2 animate-pulse" />
                <div className="h-3 bg-[#2A2A3A] rounded-full w-1/2 animate-pulse" />
            </div>
            <div className="w-10 h-6 bg-[#2A2A3A] rounded-md animate-pulse" />
        </div>
    );
}

const MEAL_ORDER = ["breakfast", "lunch", "dinner", "snack", "other"];
const MEAL_EMOJIS: Record<string, string> = {
    breakfast: "🍳",
    lunch: "🥗",
    dinner: "🍽️",
    snack: "🍎",
    other: "☕"
};

export function MealTimeline({ logs, isLoading, onDeleteLog }: MealTimelineProps) {
    const router = useRouter();

    if (isLoading) {
        return (
            <div className="mt-8 px-[20px] pb-12">
                <h3 className="text-[18px] font-['Bricolage_Grotesque'] font-bold text-[#FFFFFF] mb-4">Today's Meals</h3>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
            </div>
        );
    }

    if (!logs || logs.length === 0) {
        return (
            <div className="mt-8 px-[20px] pb-12">
                <div className="flex items-center justify-between mb-6 sticky top-0 bg-[#0F0F14]/90 backdrop-blur-md z-30 py-3">
                    <h3 className="text-[18px] font-['Bricolage_Grotesque'] font-bold text-[#FFFFFF]">Today's Meals</h3>
                    <button
                        onClick={() => router.push("/snap")}
                        className="w-[44px] h-[44px] rounded-full bg-[#FF6B35] flex items-center justify-center text-white shadow-md shadow-[#FF6B35]/30 transition-transform active:scale-95"
                    >
                        <Plus size={24} />
                    </button>
                </div>

                <div className="flex flex-col items-center justify-center pt-[40px] pb-[80px]">
                    <Chip emotion="happy" size={80} />
                    <p className="mt-4 text-[16px] font-['DM_Sans'] text-[#A0A0B8] mb-1 font-semibold">No meals logged yet.</p>
                    <p className="text-[14px] font-['DM_Sans'] text-[#60607A] mb-8">Tap the snap button below to get started</p>

                    <motion.svg
                        width="24" height="40" viewBox="0 0 24 40"
                        fill="none" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                    >
                        <motion.path
                            d="M12 4 L12 36 M6 30 L12 36 L18 30"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ delay: 0.8, duration: 1, repeat: Infinity, repeatType: "loop", repeatDelay: 1 }}
                        />
                    </motion.svg>
                </div>
            </div>
        );
    }

    // Group logs by meal type
    const groupedLogs = logs.reduce((acc, log) => {
        const type = log.meal_type || "other";
        if (!acc[type]) {
            acc[type] = { logs: [], totalCal: 0 };
        }
        acc[type]!.logs.push(log);
        acc[type]!.totalCal += log.calories;
        return acc;
    }, {} as Record<string, { logs: FoodLog[], totalCal: number }>);

    let globalIndexOffset = 0; // For staggered cascading animation

    return (
        <div className="mt-4 px-[20px] pb-[80px]">
            <div className="sticky top-0 bg-[#0F0F14]/90 backdrop-blur-md z-30 py-3 flex items-center justify-between mb-4">
                <h3 className="text-[18px] font-['Bricolage_Grotesque'] font-bold text-[#FFFFFF]">Today&apos;s Meals</h3>
                <button
                    onClick={() => router.push("/snap")}
                    className="w-[44px] h-[44px] rounded-full bg-[#FF6B35] flex items-center justify-center text-white shadow-md shadow-[#FF6B35]/30 transition-transform active:scale-95"
                >
                    <Plus size={24} />
                </button>
            </div>

            <div className="flex flex-col gap-6">
                {MEAL_ORDER.map(mealType => {
                    const group = groupedLogs[mealType];
                    if (!group || group.logs.length === 0) return null;

                    const title = mealType.charAt(0).toUpperCase() + mealType.slice(1);
                    const emoji = MEAL_EMOJIS[mealType] || "🍽️";

                    return (
                        <div key={mealType} className="flex flex-col">
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="text-[14px] font-semibold text-[#A0A0B8] font-['DM_Sans']">
                                    {emoji} {title}
                                </h4>
                                <span className="text-[13px] text-[#60607A] font-['DM_Sans']">
                                    {Math.round(group.totalCal)} cal
                                </span>
                            </div>
                            {group.logs.map((log) => {
                                const currentIndex = globalIndexOffset;
                                globalIndexOffset++;
                                return (
                                    <FoodCard
                                        key={log.id}
                                        log={log}
                                        index={currentIndex}
                                        onDelete={onDeleteLog}
                                    />
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
