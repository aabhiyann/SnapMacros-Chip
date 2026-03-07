"use client";

import { motion } from "framer-motion";

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

    return (
        <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
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
                            />
                        </g>
                    );
                })}
            </svg>
            {/* Center text could go here, but since all 4 rings are dense, it might be better handled outside or in a tooltip */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-text">
                <span className="text-2xl font-heading font-bold">{calories.current}</span>
                <span className="text-xs text-text-secondary">kcal</span>
            </div>
        </div>
    );
}
