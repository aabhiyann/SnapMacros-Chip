"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CountUp } from "@/components/rings/CountUp";

export interface MacroRingsProps {
    calories: { current: number; target: number };
    protein: { current: number; target: number };
    carbs: { current: number; target: number };
    fat: { current: number; target: number };
    size?: number;
    animate?: boolean;
    children?: React.ReactNode;
    className?: string;
}

interface SatelliteRingProps {
    label: string;
    current: number;
    target: number;
    color: string;
    delay: number;
    animate: boolean;
}

function SatelliteRing({ label, current, target, color, delay, animate }: SatelliteRingProps) {
    const size = 72;
    const strokeWidth = 7;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const safeTarget = target > 0 ? target : 1;
    const percent = Math.min(current / safeTarget, 1);
    const offset = circumference - percent * circumference;
    const isOver = current > safeTarget;

    return (
        <div className="flex flex-col items-center gap-1">
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
                    {/* Track */}
                    <circle
                        cx={size / 2} cy={size / 2} r={radius}
                        fill="none" stroke={color} strokeWidth={strokeWidth} strokeOpacity={0.15}
                        strokeLinecap="round"
                    />
                    {/* Progress */}
                    <motion.circle
                        cx={size / 2} cy={size / 2} r={radius}
                        fill="none"
                        stroke={isOver ? "#FF6B6B" : color}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: isOver ? 0 : offset }}
                        transition={{ duration: 0.7, ease: "easeOut", delay: animate ? delay : 0 }}
                        style={{ filter: percent >= 1 ? `drop-shadow(0 0 5px ${isOver ? "#FF6B6B" : color})` : "none" }}
                    />
                </svg>
                {/* Center value */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-['Bricolage_Grotesque'] font-bold text-[13px] text-white leading-none">
                        {current}
                    </span>
                    <span className="font-['DM_Sans'] text-[9px] leading-none mt-0.5" style={{ color }}>g</span>
                </div>
            </div>
            <span className="font-['DM_Sans'] text-[10px] font-semibold uppercase tracking-wider" style={{ color }}>
                {label}
            </span>
        </div>
    );
}

export const MacroRings = React.memo(function MacroRings({
    calories,
    protein,
    carbs,
    fat,
    size = 200,
    animate = true,
    children,
    className = "",
}: MacroRingsProps) {
    const heroStroke = 18;
    const heroRadius = (size - heroStroke) / 2;
    const heroCircumference = 2 * Math.PI * heroRadius;
    const safeCalTarget = calories.target > 0 ? calories.target : 1;
    const calPercent = Math.min(calories.current / safeCalTarget, 1);
    const calOffset = heroCircumference - calPercent * heroCircumference;
    const isCalOver = calories.current > safeCalTarget;

    const [milestones, setMilestones] = useState<{ label: string; color: string }[]>([]);
    const prevHit = useRef<Set<string>>(new Set());

    const macros = [
        { label: "Protein", color: "#7C6FFF", ...protein },
        { label: "Carbs",   color: "#34D8BC", ...carbs },
        { label: "Fat",     color: "#FFC84A", ...fat },
    ];

    useEffect(() => {
        const newHits: { label: string; color: string }[] = [];
        [...macros, { label: "Calories", color: "#4F9EFF", ...calories }].forEach(m => {
            const safe = m.target > 0 ? m.target : 1;
            if (m.current >= safe && !prevHit.current.has(m.label)) {
                prevHit.current.add(m.label);
                newHits.push({ label: m.label, color: m.color });
                if (typeof navigator !== "undefined" && navigator.vibrate) {
                    navigator.vibrate([80, 40, 80]);
                }
            }
        });
        if (newHits.length > 0) {
            setMilestones(prev => [...prev, ...newHits]);
            newHits.forEach(h => setTimeout(() => setMilestones(c => c.filter(m => m.label !== h.label)), 2500));
        }
    }, [calories.current, protein.current, carbs.current, fat.current]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className={`flex flex-col items-center gap-5 ${className}`}>
            {/* Milestone toast */}
            <AnimatePresence>
                {milestones.map((m, i) => (
                    <motion.div
                        key={`${m.label}-${i}`}
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.9 }}
                        className="absolute top-0 z-50 whitespace-nowrap rounded-full px-4 py-2 font-bold font-['DM_Sans'] text-[13px] shadow-lg flex items-center gap-2 border"
                        style={{ backgroundColor: "#13131C", borderColor: m.color, color: m.color }}
                    >
                        {m.label} goal hit! 💥
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Hero calorie ring */}
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
                    {/* Glow filter */}
                    <defs>
                        <filter id="calGlow">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                        </filter>
                    </defs>
                    {/* Track */}
                    <circle
                        cx={size / 2} cy={size / 2} r={heroRadius}
                        fill="none" stroke="#4F9EFF" strokeWidth={heroStroke} strokeOpacity={0.12}
                        strokeLinecap="round"
                    />
                    {/* Progress */}
                    <motion.circle
                        cx={size / 2} cy={size / 2} r={heroRadius}
                        fill="none"
                        stroke={isCalOver ? "#FF6B6B" : "#4F9EFF"}
                        strokeWidth={heroStroke}
                        strokeLinecap="round"
                        strokeDasharray={heroCircumference}
                        initial={{ strokeDashoffset: heroCircumference }}
                        animate={{ strokeDashoffset: isCalOver ? 0 : calOffset }}
                        transition={{ duration: 1.0, ease: "easeOut", delay: animate ? 0.3 : 0 }}
                        filter={calPercent >= 1 ? "url(#calGlow)" : undefined}
                    />
                </svg>

                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    {children || (
                        <>
                            <CountUp
                                value={calories.current}
                                className="text-[42px] font-['Bricolage_Grotesque'] font-[800] tracking-[-2px] text-white leading-none"
                                delay={animate ? 0.4 : 0}
                                duration={0.7}
                            />
                            <span className="text-[12px] text-[#56566F] font-['DM_Sans'] font-medium mt-1">
                                / {calories.target} cal
                            </span>
                            <div className={`mt-2 px-3 py-0.5 rounded-full text-[10px] uppercase tracking-wide font-bold font-['DM_Sans'] ${
                                isCalOver
                                    ? "bg-[#FF6B6B]/20 border border-[#FF6B6B]/30 text-[#FF6B6B]"
                                    : "bg-[#34D8BC]/15 border border-[#34D8BC]/25 text-[#34D8BC]"
                            }`}>
                                {isCalOver
                                    ? `${calories.current - calories.target} over`
                                    : `${calories.target - calories.current} left`}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Satellite rings row */}
            <div className="flex items-center justify-center gap-6">
                {macros.map((m, i) => (
                    <SatelliteRing
                        key={m.label}
                        label={m.label}
                        current={m.current}
                        target={m.target}
                        color={m.color}
                        delay={0.5 + i * 0.1}
                        animate={animate}
                    />
                ))}
            </div>
        </div>
    );
});
