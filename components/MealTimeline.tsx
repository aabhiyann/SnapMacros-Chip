"use client";

import { motion } from "framer-motion";
import { FoodCard, FoodLog } from "./FoodCard";
import Chip from "@/components/Chip";
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

export function MealTimeline({ logs, isLoading, onDeleteLog }: MealTimelineProps) {
    const router = useRouter();

    if (isLoading) {
        return (
            <div className="mt-8 px-[20px]">
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
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[18px] font-['Bricolage_Grotesque'] font-bold text-[#FFFFFF]">Today's Meals</h3>
                    <button
                        onClick={() => router.push("/snap")}
                        className="w-8 h-8 rounded-full bg-[#FF6B35]/20 flex items-center justify-center text-[#FF6B35] transition-colors hover:bg-[#FF6B35]/30"
                    >
                        <Plus size={18} />
                    </button>
                </div>

                <div className="flex flex-col items-center justify-center py-10 bg-[#1A1A24] rounded-2xl border border-dashed border-[#2A2A3A]">
                    <Chip emotion="happy" size={80} />
                    <p className="mt-4 text-[15px] font-['DM_Sans'] text-[#A0A0B8] mb-6">No meals logged today yet.</p>
                    <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="text-[#FF6B35]"
                    >
                        ↓
                    </motion.div>
                </div>
            </div>
        );
    }

    // We group everything as "Today" since dashboard only fetches today's logs 
    // Per specs: "Groups FoodLog[] by meal_type". We lack meal_type in DB, grouping all under Today is safe.

    return (
        <div className="mt-8 px-[20px] pb-[80px]">
            <div className="sticky top-0 bg-[#0F0F14]/90 backdrop-blur-md z-30 py-3 flex items-center justify-between mb-2">
                <h3 className="text-[18px] font-['Bricolage_Grotesque'] font-bold text-[#FFFFFF]">Today's Meals</h3>
                <button
                    onClick={() => router.push("/snap")}
                    className="w-8 h-8 rounded-full bg-[#FF6B35] flex items-center justify-center text-white shadow-md shadow-[#FF6B35]/30 transition-transform active:scale-95"
                >
                    <Plus size={18} />
                </button>
            </div>

            <div className="flex flex-col">
                {logs.map((log, i) => (
                    <FoodCard
                        key={log.id}
                        log={log}
                        index={i}
                        onDelete={onDeleteLog}
                    />
                ))}
            </div>
        </div>
    );
}
