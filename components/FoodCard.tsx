"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useTransform, useAnimation } from "framer-motion";
import { Trash2 } from "lucide-react";

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

const MEAL_COLORS: Record<string, string> = {
    breakfast: "from-[#FBBF24] to-[#F59E0B]",
    lunch: "from-[#2DD4BF] to-[#0D9488]",
    dinner: "from-[#6C63FF] to-[#4F46E5]",
    snack: "from-[#FF6B35] to-[#E85D2C]",
    other: "from-[#A0A0B8] to-[#60607A]"
};

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
            className="relative mb-3 rounded-2xl overflow-hidden bg-[#E85D2C]" // Deep red background reveals on swipe
            ref={containerRef}
        >
            {/* Background delete action */}
            <div className="absolute inset-y-0 right-0 w-24 flex items-center justify-center p-4">
                <motion.div style={{ opacity: deleteOpacity }} className="flex flex-col items-center">
                    <Trash2 size={24} className="text-white" />
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
                className="relative bg-[#1A1A24] p-4 rounded-2xl flex items-center justify-between z-10 w-full touch-pan-y"
            >
                <div className="flex items-center gap-4 flex-1 overflow-hidden">
                    <div className={`w-[48px] h-[48px] rounded-[14px] shrink-0 bg-gradient-to-br ${bgGradient} flex items-center justify-center text-[20px] shadow-inner`}>
                        {log.image_url ? (
                            <img src={log.image_url} alt="Food" className="w-full h-full object-cover rounded-[14px]" />
                        ) : (
                            <span>{log.description.charAt(0).toUpperCase()}</span>
                        )}
                    </div>

                    <div className="flex-1 min-w-0 pr-2">
                        <h4 className="text-[15px] font-semibold text-white font-['DM_Sans'] truncate">{log.description}</h4>
                        <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-[13px] text-[#A0A0B8] font-['DM_Sans'] truncate capitalize">
                                {log.meal_type || "Snack"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-end shrink-0 pl-2">
                    <span className="text-[18px] font-bold text-white font-['Bricolage_Grotesque'] leading-none mb-1.5">{log.calories}</span>
                    <div className="flex gap-1.5 mt-auto pb-0.5">
                        <div className="w-2 h-2 rounded-full bg-[#6C63FF]" title={`Protein: ${log.protein}g`} />
                        <div className="w-2 h-2 rounded-full bg-[#2DD4BF]" title={`Carbs: ${log.carbs}g`} />
                        <div className="w-2 h-2 rounded-full bg-[#FBBF24]" title={`Fat: ${log.fat}g`} />
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
