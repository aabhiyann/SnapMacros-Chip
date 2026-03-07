"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CountUp } from "@/components/rings/CountUp";

interface RingData {
    label: string;
    current: number;
    target: number;
    color: string;
    radius: number;
}

export interface MacroRingsProps {
    calories: { current: number; target: number };
    protein: { current: number; target: number };
    carbs: { current: number; target: number };
    fat: { current: number; target: number };
    size?: number;
    strokeWidth?: number;
    className?: string;
}

export function MacroRings({
    calories,
    protein,
    carbs,
    fat,
    size = 200,
    strokeWidth = 14,
    className = "",
}: MacroRingsProps) {
    const center = size / 2;
    // Reduce radius by strokeWidth for each inner ring
    const ringGap = strokeWidth + 4;

    const rings: RingData[] = [
        { label: "Calories", ...calories, color: "#FF6B35", radius: center - strokeWidth },
        { label: "Protein", ...protein, color: "#2DD4BF", radius: center - strokeWidth - ringGap },
        { label: "Carbs", ...carbs, color: "#FBBF24", radius: center - strokeWidth - ringGap * 2 },
        { label: "Fat", ...fat, color: "#F87171", radius: center - strokeWidth - ringGap * 3 },
    ];

    const [milestonesInfo, setMilestonesInfo] = useState<{ label: string, color: string }[]>([]);
    const previouslyHit = useRef<Set<string>>(new Set());

    useEffect(() => {
        const newHits: { label: string, color: string }[] = [];
        rings.forEach(ring => {
            const safeTarget = ring.target > 0 ? ring.target : 1;
            if (ring.current >= safeTarget && safeTarget > 0) {
                if (!previouslyHit.current.has(ring.label)) {
                    previouslyHit.current.add(ring.label);
                    newHits.push({ label: ring.label, color: ring.color });
                    if (typeof navigator !== "undefined" && navigator.vibrate) {
                        navigator.vibrate([80, 40, 80]);
                    }
                }
            }
        });

        if (newHits.length > 0) {
            setMilestonesInfo(prev => [...prev, ...newHits]);
            newHits.forEach(hit => {
                setTimeout(() => {
                    setMilestonesInfo(current => current.filter(m => m.label !== hit.label));
                }, 2500); // 1.5s display + margin
            });
        }
    }, [calories.current, protein.current, carbs.current, fat.current]);

    return (
        <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>

            <AnimatePresence>
                {milestonesInfo.map((m, idx) => (
                    <motion.div
                        key={`${m.label}-${idx}`}
                        initial={{ opacity: 0, y: -40, scale: 0.9 }}
                        animate={{ opacity: 1, y: -size / 2 - 40 - (idx * 40), scale: 1 }}
                        exit={{ opacity: 0, y: -size / 2 - 60, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className="absolute z-50 whitespace-nowrap rounded-full px-4 py-2 font-bold font-['DM_Sans'] text-[14px] shadow-lg flex items-center gap-2 border"
                        style={{ backgroundColor: "#1A1A24", borderColor: m.color, color: m.color }}
                    >
                        {m.label} goal hit! 💥
                    </motion.div>
                ))}
            </AnimatePresence>

            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
                {rings.map((ring, i) => {
                    const circumference = 2 * Math.PI * ring.radius;
                    const safeTarget = ring.target > 0 ? ring.target : 1;
                    const percent = Math.min(ring.current / safeTarget, 1);
                    const offset = circumference - percent * circumference;

                    return (
                        <g key={ring.label}>
                            {/* Background ring */}
                            <circle
                                cx={center}
                                cy={center}
                                r={ring.radius}
                                fill="none"
                                stroke={ring.color}
                                strokeWidth={strokeWidth}
                                strokeOpacity={0.2}
                                strokeLinecap="round"
                            />
                            {/* Progress ring */}
                            <motion.circle
                                cx={center}
                                cy={center}
                                r={ring.radius}
                                fill="none"
                                stroke={ring.color}
                                strokeWidth={strokeWidth}
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                initial={{ strokeDashoffset: circumference }}
                                animate={{ strokeDashoffset: offset }}
                                transition={{ duration: 1, ease: "easeOut", delay: i * 0.1 }}
                                style={{
                                    filter: ring.current >= safeTarget ? `drop-shadow(0 0 8px ${ring.color})` : "none",
                                }}
                            />
                        </g>
                    );
                })}
            </svg>
            {/* Center text could go here, but since all 4 rings are dense, it might be better handled outside or in a tooltip */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-text">
                <CountUp value={calories.current} className="text-2xl font-heading font-bold" />
                <span className="text-xs text-text-secondary">kcal</span>
            </div>
        </div>
    );
}
