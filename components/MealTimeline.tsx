"use client";

import { motion } from "framer-motion";
import { FoodCard, FoodLog } from "./FoodCard";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

interface MealTimelineProps {
    logs: FoodLog[];
    isLoading: boolean;
    onDeleteLog: (id: string) => void;
}

// AM = before 3pm (hour < 15), PM = 3pm onwards
const AM_TYPES = ["breakfast", "lunch"];
const PM_TYPES = ["dinner", "snack", "other"];

const MEAL_EMOJIS: Record<string, string> = {
    breakfast: "🌅",
    lunch:     "☀️",
    dinner:    "🌙",
    snack:     "🍎",
    other:     "☕",
};

function inferMealType(log: FoodLog): string {
    if (log.meal_type) return log.meal_type.toLowerCase();
    const hr = new Date(log.created_at).getHours();
    if (hr < 11) return "breakfast";
    if (hr < 15) return "lunch";
    if (hr < 21) return "dinner";
    return "snack";
}

function SectionHeader({ label, totalCal }: { label: string; totalCal: number }) {
    return (
        <div className="flex items-center justify-between mb-3 mt-1">
            <div className="flex items-center gap-2">
                <div className="h-px flex-1 w-8 bg-[#2A2A3D]" />
                <span className="font-['DM_Sans'] text-[11px] font-bold uppercase tracking-widest text-[#56566F]">
                    {label}
                </span>
                <div className="h-px flex-1 w-8 bg-[#2A2A3D]" />
            </div>
            <span className="font-['DM_Sans'] text-[12px] text-[#56566F] ml-3">
                {Math.round(totalCal)} cal
            </span>
        </div>
    );
}

function MealTypeChip({ type }: { type: string }) {
    const label = type.charAt(0).toUpperCase() + type.slice(1);
    const emoji = MEAL_EMOJIS[type] ?? "🍽️";
    return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-[#56566F] font-['DM_Sans'] mb-1">
            {emoji} {label}
        </span>
    );
}

function SkeletonCard() {
    return (
        <div className="flex items-center p-4 bg-[#13131C] rounded-2xl mb-3 border border-[#2A2A3D]">
            <div className="w-12 h-12 rounded-[14px] bg-[#1C1C28] shrink-0 mr-4 animate-pulse" />
            <div className="flex-1">
                <div className="h-4 bg-[#1C1C28] rounded-full w-3/4 mb-2 animate-pulse" />
                <div className="h-3 bg-[#1C1C28] rounded-full w-1/2 animate-pulse" />
            </div>
        </div>
    );
}

export function MealTimeline({ logs, isLoading, onDeleteLog }: MealTimelineProps) {
    const router = useRouter();

    if (isLoading) {
        return (
            <div className="px-5 pb-12">
                <div className="h-[1px] bg-[#2A2A3D] mb-5" />
                <SkeletonCard /><SkeletonCard /><SkeletonCard />
            </div>
        );
    }

    if (!logs || logs.length === 0) return null; // empty state handled by dashboard

    // Assign types and bucket into AM / PM
    const tagged = logs.map(l => ({ ...l, _type: inferMealType(l) }));
    const amLogs = tagged.filter(l => AM_TYPES.includes(l._type));
    const pmLogs = tagged.filter(l => PM_TYPES.includes(l._type));

    const amCalories = amLogs.reduce((s, l) => s + l.calories, 0);
    const pmCalories = pmLogs.reduce((s, l) => s + l.calories, 0);

    let globalIdx = 0;

    return (
        <div className="px-5 pb-[100px]">
            {/* Section header */}
            <div className="sticky top-[88px] z-30 bg-[rgba(9,9,15,0.92)] backdrop-blur-md py-3 flex items-center justify-between mb-2">
                <h3 className="font-['Bricolage_Grotesque'] text-[18px] font-bold text-white">
                    Today&apos;s Meals
                </h3>
                <button
                    onClick={() => router.push("/snap")}
                    className="w-[40px] h-[40px] rounded-full bg-[#4F9EFF] flex items-center justify-center text-white shadow-[0_4px_16px_rgba(79,158,255,0.35)] active:scale-95 transition-transform"
                    aria-label="Log a meal"
                >
                    <Plus size={22} />
                </button>
            </div>

            <div className="space-y-1">
                {/* AM section */}
                {amLogs.length > 0 && (
                    <div>
                        <SectionHeader label="Morning" totalCal={amCalories} />
                        {amLogs.map(log => {
                            const idx = globalIdx++;
                            return (
                                <div key={log.id}>
                                    <MealTypeChip type={log._type} />
                                    <FoodCard log={log} index={idx} onDelete={onDeleteLog} />
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* PM section */}
                {pmLogs.length > 0 && (
                    <div className={amLogs.length > 0 ? "mt-5" : ""}>
                        <SectionHeader label="Afternoon & Evening" totalCal={pmCalories} />
                        {pmLogs.map(log => {
                            const idx = globalIdx++;
                            return (
                                <div key={log.id}>
                                    <MealTypeChip type={log._type} />
                                    <FoodCard log={log} index={idx} onDelete={onDeleteLog} />
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Log more CTA */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="pt-6 flex justify-center"
            >
                <button
                    onClick={() => router.push("/snap")}
                    className="flex items-center gap-2 text-[#4F9EFF] font-['DM_Sans'] text-[14px] font-semibold hover:opacity-80 transition-opacity"
                >
                    <Plus size={16} />
                    Log another meal
                </button>
            </motion.div>
        </div>
    );
}
