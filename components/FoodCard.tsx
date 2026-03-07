"use client";

import { motion, useAnimation, PanInfo } from "framer-motion";
import { Trash2 } from "lucide-react";
import { useState } from "react";

export interface FoodLog {
    id: string;
    food_name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    created_at: string;
}

interface FoodCardProps {
    log: FoodLog;
    onDelete: (id: string) => void;
    index: number;
}

export function FoodCard({ log, onDelete, index }: FoodCardProps) {
    const controls = useAnimation();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDragEnd = async (e: any, info: PanInfo) => {
        const offset = info.offset.x;
        const velocity = info.velocity.x;

        if (offset < -75 || velocity < -500) {
            // Swipe left passed threshold -> delete
            controls.start({ x: "-100%", opacity: 0, transition: { duration: 0.2 } });
            setTimeout(() => onDelete(log.id), 200);
        } else {
            // Spring back
            controls.start({ x: 0, transition: { type: "spring", stiffness: 300, damping: 20 } });
        }
    };

    // Generate deterministic gradient from id
    const colors = [
        "from-[#FF6B35] to-[#FFA735]",
        "from-[#6C63FF] to-[#8F88FF]",
        "from-[#2DD4BF] to-[#5EEAD4]",
        "from-[#FBBF24] to-[#FCD34D]"
    ];
    const colorIndex = log.id.charCodeAt(0) % colors.length;
    const gradient = colors[colorIndex];

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3, ease: "easeOut" }}
            className="relative mb-3 rounded-2xl overflow-hidden bg-[#2A2A3A]" // Background for reveal
        >
            {/* Background delete action */}
            <div className="absolute inset-y-0 right-0 w-full flex items-center justify-end pr-6 bg-[#EF4444] z-0">
                <Trash2 className="text-white" size={24} />
            </div>

            {/* Foreground Card */}
            <motion.div
                drag="x"
                dragDirectionLock
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={{ left: 0.5, right: 0 }}
                onDragEnd={handleDragEnd}
                animate={controls}
                className="relative z-10 flex items-center p-4 bg-[#1A1A24] rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.30)] w-full touch-pan-y"
            >
                {/* Left: Thumbnail gradient */}
                <div className={`w-[48px] h-[48px] rounded-[14px] bg-gradient-to-br ${gradient} flex items-center justify-center shadow-inner shrink-0 mr-4`}>
                    <span className="text-white font-bold text-lg leading-none uppercase drop-shadow-sm">
                        {log.food_name.charAt(0)}
                    </span>
                </div>

                {/* Center: Info */}
                <div className="flex-1 min-w-0 pr-4">
                    <h3 className="text-[15px] font-semibold text-white truncate font-['DM_Sans'] leading-tight mb-1">
                        {log.food_name}
                    </h3>
                    <p className="text-[13px] text-[#A0A0B8] font-['DM_Sans'] truncate">
                        {new Date(log.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                    </p>
                </div>

                {/* Right: Macros */}
                <div className="flex flex-col items-end shrink-0">
                    <div className="text-[18px] font-bold text-white font-['Bricolage_Grotesque'] leading-none mb-2">
                        {Math.round(log.calories)}
                    </div>
                    <div className="flex gap-1.5">
                        <div className="w-[6px] h-[6px] rounded-full bg-[#6C63FF]" title="Protein" />
                        <div className="w-[6px] h-[6px] rounded-full bg-[#2DD4BF]" title="Carbs" />
                        <div className="w-[6px] h-[6px] rounded-full bg-[#FBBF24]" title="Fat" />
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
