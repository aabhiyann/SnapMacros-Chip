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
        const heightCm = data.heightUnit === "cm" ? parseFloat(data.height) : parseFloat(data.height) * 2.54;

        return calculateFullProfile({
            weightKg: isNaN(weightKg) ? 70 : weightKg,
            heightCm: isNaN(heightCm) ? 175 : heightCm,
            age: parseInt(data.age) || 25,
            gender: data.gender as "male" | "female" || "male",
            activityLevel: data.activityLevel || "sedentary",
            goalType: data.goal || "maintain",
        });
    }, [data]);

    useEffect(() => {
        // Sequence reveal per requirements
        // 600ms: Chip -> hype
        const timerReveal = setTimeout(() => {
            setPhase("revealed");

            // 700ms (100ms after reveal): Haptic feedback
            setTimeout(() => {
                if (typeof navigator !== 'undefined' && navigator.vibrate) {
                    navigator.vibrate([100]);
                }
            }, 100);

            // 800ms (200ms after reveal): Confetti
            setTimeout(() => {
                confetti({
                    particleCount: 28,
                    spread: 100,
                    origin: { y: 0.5, x: 0.5 },
                    colors: ["#4F9EFF", "#6C63FF", "#2DD4BF", "#FBBF24", "#FFFFFF"],
                    shapes: ['square'],
                    ticks: 60, // Fade out fast over ~1s
                    gravity: 1.2
                });
            }, 200);

        }, 600);

        return () => {
            clearTimeout(timerReveal);
        };
    }, []);

    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError(null);

        try {
            // Use API route - server-side upsert handles both new and existing profiles reliably
            const res = await fetch("/api/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    goal: data.goal,
                    name: data.name,
                    age: data.age,
                    weight: data.weight,
                    weightUnit: data.weightUnit,
                    height: data.height,
                    heightUnit: data.heightUnit,
                    gender: data.gender,
                    activityLevel: data.activityLevel,
                }),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                console.error("Profile save error:", errData);
                setError("Could not save your profile. Please try again.");
                setIsSubmitting(false);
                return;
            }

            router.push("/dashboard");
        } catch (err) {
            console.error("Onboarding error:", err);
            setError("Something went wrong. Please try again.");
            setIsSubmitting(false);
        }
    };

    if (!targets) return <div className="flex-1 bg-[#09090F]" />;

    // Goal formatting for text
    const formatGoal = (g: string) => {
        if (g === "fat_loss") return "Fat Loss";
        if (g === "lean_bulk") return "Lean Bulk";
        return g.charAt(0).toUpperCase() + g.slice(1);
    };

    const tdee = Math.round(targets.tdee);
    const difference = targets.calorieTarget - tdee;
    const differenceText = difference > 0 ? `+${difference} cal surplus` : difference < 0 ? `${difference} cal deficit` : `exact match`;

    return (
        <div className="flex-1 flex flex-col pt-[120px] pb-[160px] px-[20px] relative overflow-hidden">

            {/* Sequence Header & Chip */}
            <div className="flex flex-col items-center justify-center mb-8">
                <AnimatePresence mode="wait">
                    {phase === "calculating" ? (
                        <motion.div key="calc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.35 } }} className="flex flex-col items-center">
                            <Chip emotion="thinking" size={130} />
                            <p className="mt-6 text-[#9898B3] font-['DM_Sans']">Calculating your targets...</p>
                        </motion.div>
                    ) : (
                        <motion.div key="reveal" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center w-full">
                            <Chip emotion="hype" size={120} />
                            {/* 900ms start (300ms from reveal): Chip speech */}
                            <motion.h2
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                                className="text-[28px] font-bold font-['Bricolage_Grotesque'] mt-4 text-center"
                            >
                                {data.name || "There"}, you&apos;re all set! 🎉
                            </motion.h2>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Revealed Targets */}
            {phase === "revealed" && (
                <div className="flex-1 flex flex-col items-center w-full max-w-[400px] mx-auto">
                    {/* Animated calorie ring */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4, type: "spring", stiffness: 260, damping: 20 }}
                        className="relative mb-6 flex items-center justify-center"
                        style={{ width: 200, height: 200 }}
                    >
                        <svg width={200} height={200} viewBox="0 0 200 200" className="rotate-[-90deg] absolute inset-0">
                            {/* Track */}
                            <circle cx={100} cy={100} r={82} fill="none" stroke="#4F9EFF" strokeWidth={16} strokeOpacity={0.12} strokeLinecap="round" />
                            {/* Animated progress */}
                            <motion.circle
                                cx={100} cy={100} r={82}
                                fill="none"
                                stroke="#4F9EFF"
                                strokeWidth={16}
                                strokeLinecap="round"
                                strokeDasharray={2 * Math.PI * 82}
                                initial={{ strokeDashoffset: 2 * Math.PI * 82 }}
                                animate={{ strokeDashoffset: 0 }}
                                transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
                                style={{ filter: "drop-shadow(0 0 8px rgba(79,158,255,0.6))" }}
                            />
                        </svg>
                        {/* Center text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <div className="text-[44px] font-black font-['Bricolage_Grotesque'] text-white leading-none tracking-tight">
                                <CountUp end={targets.calorieTarget} duration={1.2} delay={0.5} />
                            </div>
                            <p className="text-[#56566F] font-['DM_Sans'] text-[12px] mt-1">cal / day</p>
                            <div className="mt-2 px-3 py-0.5 bg-[#4F9EFF]/15 border border-[#4F9EFF]/25 rounded-full">
                                <span className="text-[#4F9EFF] text-[10px] font-bold font-['DM_Sans'] uppercase tracking-wide">
                                    {formatGoal(data.goal)}
                                </span>
                            </div>
                        </div>
                    </motion.div>

                    {/* 3 Macro Cards Staggered | 1200ms+ (600ms, 700ms, 800ms) */}
                    <div className="w-full grid grid-cols-3 gap-3 mb-6">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-[#6C63FF]/15 border border-[#6C63FF]/30 rounded-[16px] p-3 text-center">
                            <p className="text-[#9898B3] text-[11px] font-bold uppercase mb-1 tracking-wide">💜 Protein</p>
                            <div className="text-[24px] font-bold font-['Bricolage_Grotesque'] text-white"><CountUp end={targets.macroTarget.protein} duration={1} delay={0.6} />g</div>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="bg-[#2DD4BF]/15 border border-[#2DD4BF]/30 rounded-[16px] p-3 text-center">
                            <p className="text-[#9898B3] text-[11px] font-bold uppercase mb-1 tracking-wide">💚 Carbs</p>
                            <div className="text-[24px] font-bold font-['Bricolage_Grotesque'] text-white"><CountUp end={targets.macroTarget.carbs} duration={1} delay={0.7} />g</div>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="bg-[#FBBF24]/15 border border-[#FBBF24]/30 rounded-[16px] p-3 text-center">
                            <p className="text-[#9898B3] text-[11px] font-bold uppercase mb-1 tracking-wide">🟡 Fat</p>
                            <div className="text-[24px] font-bold font-['Bricolage_Grotesque'] text-white"><CountUp end={targets.macroTarget.fat} duration={1} delay={0.8} />g</div>
                        </motion.div>
                    </div>

                    {/* Explanatory text | 1500ms (900ms delay) */}
                    <motion.p
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
                        className="text-center font-['DM_Sans'] text-[13px] text-[#9898B3] mb-auto px-4"
                    >
                        Based on TDEE of {tdee.toLocaleString()} cal {difference !== 0 && `+ ${differenceText} `}for {formatGoal(data.goal)}
                    </motion.p>

                    {/* Button | appear with text */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
                        className="fixed bottom-0 left-0 w-full p-[20px] pb-[max(20px,env(safe-area-inset-bottom))] bg-[#09090F] z-50 flex flex-col border-t border-[#13131C]"
                    >
                        {error && <p className="text-center font-['DM_Sans'] text-[#F87171] text-[14px] mb-2">{error}</p>}
                        <TapButton
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="w-full h-[56px] bg-[#4F9EFF] rounded-[16px] font-['DM_Sans'] text-[18px] font-bold text-white shadow-[0_8px_32px_rgba(59,139,247,0.35)] transition-transform active:scale-[0.98] disabled:bg-[#2A2A3D] disabled:text-[#56566F] disabled:shadow-none"
                        >
                            {isSubmitting ? "Saving..." : "Start Tracking 🚀"}
                        </TapButton>
                    </motion.div>
                </div>
            )}

        </div>
    );
}
