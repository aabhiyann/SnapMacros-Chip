"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useTransform, useAnimation } from "framer-motion";
import { Trash2, Sunrise, Sun, Moon, Apple } from "lucide-react";

export interface FoodLog {
    id: string;
    description: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    created_at: string;
    image_url?: string;
    meal_type?: "breakfast" | "lunch" | "dinner" | "snack" | "other" | string;
}

interface FoodCardProps {
    log: FoodLog;
    onDelete?: (id: string) => void;
    index?: number; // Used for staggered entry animation
}

// Used for original card background if image is not present, though we now use icons
const MEAL_COLORS: Record<string, string> = {
    breakfast: "from-[#FBBF24]/20 to-[#F59E0B]/20",
    lunch: "from-[#FF6B35]/20 to-[#E85D2C]/20",
    dinner: "from-[#6C63FF]/20 to-[#4F46E5]/20",
    snack: "from-[#2DD4BF]/20 to-[#0D9488]/20",
    other: "from-[#A0A0B8]/20 to-[#60607A]/20"
};

function getMealIcon(type?: string) {
    switch (type) {
        case "breakfast": return <Sunrise size={20} stroke="#FBBF24" strokeWidth={2.5} />;
        case "lunch": return <Sun size={20} stroke="#FF6B35" strokeWidth={2.5} />;
        case "dinner": return <Moon size={20} stroke="#6C63FF" strokeWidth={2.5} />;
        case "snack": return <Apple size={20} stroke="#2DD4BF" strokeWidth={2.5} />;
        default: return <Sun size={20} stroke="#A0A0B8" strokeWidth={2.5} />;
    }
}

export function FoodCard({ log, onDelete, index = 0 }: FoodCardProps) {
    const x = useMotionValue(0);
    const controls = useAnimation();
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Dynamic swipe threshold based on width
    const SWIPE_THRESHOLD = -80; // Negative X threshold to trigger delete
    const deleteOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);

    const handleDragEnd = async (e: any, { offset, velocity }: any) => {
        if (offset.x < SWIPE_THRESHOLD || velocity.x < -500) {
            // Trigger Delete
            setIsDeleting(true);
            await controls.start({ x: -1000, opacity: 0, transition: { duration: 0.2 } });
            if (onDelete) onDelete(log.id);
        } else {
            // Snap back
            controls.start({ x: 0, transition: { type: "spring", stiffness: 400, damping: 25 } });
        }
    };

    if (isDeleting) return null;

    const bgGradient = log.meal_type ? MEAL_COLORS[log.meal_type] || MEAL_COLORS.other : MEAL_COLORS.other;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 + (index * 0.06), duration: 0.3, ease: "easeOut" }}
            className="relative mb-3 rounded-2xl overflow-hidden bg-[#F87171]" // Red background reveals on swipe
            ref={containerRef}
        >
            {/* Background delete action */}
            <div className="absolute inset-y-0 right-0 w-[56px] flex items-center justify-center">
                <motion.div style={{ opacity: deleteOpacity }} className="flex flex-col items-center">
                    <Trash2 size={18} stroke="white" strokeWidth={2.5} />
                </motion.div>
            </div>

            {/* Draggable Card View */}
            <motion.div
                drag="x"
                dragConstraints={{ left: -100, right: 0 }}
                dragElastic={0.1}
                onDragEnd={handleDragEnd}
                animate={controls}
                style={{ x }}
                className="relative bg-[linear-gradient(160deg,#1E1E2A_0%,#1A1A24_100%)] p-[20px] rounded-[20px] flex items-center justify-between z-10 w-full touch-pan-y border border-white/[0.06] shadow-[0_1px_0_rgba(255,255,255,0.05)_inset,0_4px_24px_rgba(0,0,0,0.3)] transition-colors active:border-white/[0.10]"
            >
                <div className="flex items-center gap-4 flex-1 overflow-hidden">
                    <div className={`w-[52px] h-[52px] rounded-[16px] shrink-0 bg-gradient-to-br ${bgGradient} flex items-center justify-center shadow-inner`}>
                        {log.image_url ? (
                            <img src={log.image_url} alt="Food" className="w-full h-full object-cover rounded-[16px]" />
                        ) : (
                            getMealIcon(log.meal_type)
                        )}
                    </div>

                    <div className="flex-1 min-w-0 pr-2">
                        <h4 className="text-[16px] font-bold text-white font-['DM_Sans'] truncate">{log.description}</h4>
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                            <span className="macro-pill macro-pill--protein">P: {log.protein}g</span>
                            <span className="macro-pill macro-pill--carbs">C: {log.carbs}g</span>
                            <span className="macro-pill macro-pill--fat">F: {log.fat}g</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-end justify-center shrink-0 pl-3">
                    <span className="text-[20px] font-[800] text-white font-['Bricolage_Grotesque'] tracking-tight leading-none text-right">{log.calories}</span>
                    <span className="text-[12px] text-[#60607A] font-['DM_Sans'] mt-1 font-medium tracking-wide">cal</span>
                </div>
            </motion.div>
        </motion.div>
    );
}
