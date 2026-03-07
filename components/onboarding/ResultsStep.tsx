"use client";
import { TapButton } from "@/components/ui/TapButton";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Chip } from "@/components/Chip";
import { OnboardingData } from "./types";
import { calculateFullProfile } from "@/lib/tdee";
import confetti from "canvas-confetti";
import CountUp from "react-countup";
import { useRouter } from "next/navigation";

interface ResultsStepProps {
    data: OnboardingData;
}

export function ResultsStep({ data }: ResultsStepProps) {
    const router = useRouter();
    const [phase, setPhase] = useState<"calculating" | "revealed">("calculating");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const targets = useMemo(() => {
        const weightKg = data.weightUnit === "kg" ? parseFloat(data.weight) : parseFloat(data.weight) * 0.453592;
        const heightCm = data.heightUnit === "cm" ? parseFloat(data.height) : parseFloat(data.height) * 30.48; // Rough ft to cm

        return calculateFullProfile({
            weightKg: isNaN(weightKg) ? 70 : weightKg,
            heightCm: isNaN(heightCm) ? 175 : heightCm,
            age: parseInt(data.age) || 25,
            gender: data.gender as "male" | "female" || "male",
            activityLevel: data.activityLevel as any || "sedentary",
            goalType: data.goal as any || "maintain",
        });
    }, [data]);

    useEffect(() => {
        // Sequence reveal per requirements
        const timer = setTimeout(() => {
            setPhase("revealed");
            if (navigator.vibrate) navigator.vibrate([100]);

            confetti({
                particleCount: 50,
                spread: 90,
                origin: { y: 0.6 },
                colors: ["#FF6B35", "#2DD4BF", "#6C63FF", "#FBBF24"]
            });
        }, 600);

        return () => clearTimeout(timer);
    }, [data]);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // Submit data to the backend /api/profile endpoint
            const res = await fetch("/api/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            if (!res.ok) throw new Error("Failed to save profile");

            router.push("/dashboard");
        } catch (e) {
            console.error(e);
            setIsSubmitting(false);
        }
    };

    if (!targets) return <div className="flex-1 bg-[#0F0F14]" />;

    return (
        <div className="flex-1 flex flex-col pt-[120px] pb-[40px] px-[20px] relative overflow-hidden">

            {/* Sequence Header & Chip */}
            <div className="flex flex-col items-center justify-center mb-8">
                <AnimatePresence mode="wait">
                    {phase === "calculating" ? (
                        <motion.div key="calc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
                            <Chip emotion="thinking" size={130} />
                            <p className="mt-6 text-[#A0A0B8] font-['DM_Sans']">Calculating your targets...</p>
                        </motion.div>
                    ) : (
                        <motion.div key="reveal" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center w-full">
                            <Chip emotion="hype" size={120} />
                            <motion.h2
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                                className="text-[28px] font-bold font-['Bricolage_Grotesque'] mt-4 text-center"
                            >
                                {data.name}, you're all set! 🎉
                            </motion.h2>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Revealed Targets */}
            {phase === "revealed" && (
                <div className="flex-1 flex flex-col">
                    {/* Main Calorie Block */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, type: "spring" }}
                        className="w-full bg-gradient-to-br from-[#FF6B35] to-[#FF8C35] rounded-[24px] p-6 text-center shadow-[0_12px_40px_rgba(255,107,53,0.3)] mb-4"
                    >
                        <p className="text-white/80 font-['DM_Sans'] text-[14px] font-bold uppercase tracking-wider mb-1">Daily Target</p>
                        <div className="text-[56px] font-black font-['Bricolage_Grotesque'] text-white leading-none">
                            <CountUp end={targets.calorieTarget} duration={1} />
                        </div>
                        <p className="text-white/90 font-['DM_Sans'] text-[15px] mt-2">Calories</p>
                    </motion.div>

                    {/* 3 Macro Cards Staggered */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-[#6C63FF]/10 border border-[#6C63FF]/30 rounded-[16px] p-4 text-center">
                            <p className="text-[#6C63FF] text-[11px] font-bold uppercase mb-1">Protein</p>
                            <div className="text-[24px] font-bold font-['Bricolage_Grotesque'] text-white"><CountUp end={targets.macroTarget.protein} duration={1} />g</div>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="bg-[#2DD4BF]/10 border border-[#2DD4BF]/30 rounded-[16px] p-4 text-center">
                            <p className="text-[#2DD4BF] text-[11px] font-bold uppercase mb-1">Carbs</p>
                            <div className="text-[24px] font-bold font-['Bricolage_Grotesque'] text-white"><CountUp end={targets.macroTarget.carbs} duration={1} />g</div>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="bg-[#FBBF24]/10 border border-[#FBBF24]/30 rounded-[16px] p-4 text-center">
                            <p className="text-[#FBBF24] text-[11px] font-bold uppercase mb-1">Fat</p>
                            <div className="text-[24px] font-bold font-['Bricolage_Grotesque'] text-white"><CountUp end={targets.macroTarget.fat} duration={1} />g</div>
                        </motion.div>
                    </div>

                    <motion.p
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}
                        className="text-center font-['DM_Sans'] text-[13px] text-[#A0A0B8] mb-auto px-4"
                    >
                        Based on a resting TDEE of {Math.round(targets.tdee)} cal + {data.goal === "cut" ? "-500" : data.goal === "bulk" ? "+500" : "0"} for {data.goal}.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.2 }}
                        className="mt-8"
                    >
                        <TapButton
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="w-full h-[60px] bg-white rounded-[16px] font-['DM_Sans'] text-[18px] font-bold text-[#0F0F14] shadow-[0_8px_32px_rgba(255,255,255,0.15)] transition-transform active:scale-[0.98] disabled:opacity-50"
                        >
                            {isSubmitting ? "Launching..." : "Start Tracking 🚀"}
                        </TapButton>
                    </motion.div>
                </div>
            )}

        </div>
    );
}
