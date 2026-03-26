"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { initialData, OnboardingData } from "@/components/onboarding/types";
import { WelcomeStep } from "@/components/onboarding/WelcomeStep";
import { GoalStep } from "@/components/onboarding/GoalStep";
import { AboutStep } from "@/components/onboarding/AboutStep";
import { ActivityStep } from "@/components/onboarding/ActivityStep";
import { ResultsStep } from "@/components/onboarding/ResultsStep";

export default function OnboardingPage() {
    const [step, setStep] = useState(0);
    const [data, setData] = useState<OnboardingData>(initialData);

    const nextStep = () => setStep((s) => Math.min(s + 1, 4));
    const prevStep = () => setStep((s) => Math.max(s - 1, 0));

    const updateData = (updates: Partial<OnboardingData>) => {
        setData((prev) => ({ ...prev, ...updates }));
    };

    // The 280ms lateral sliding transition requested
    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 300 : -300,
            opacity: 0,
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 300 : -300,
            opacity: 0,
        }),
    };

    const [direction, setDirection] = useState(1);

    const goNext = () => {
        setDirection(1);
        nextStep();
    };

    const goPrev = () => {
        setDirection(-1);
        prevStep();
    };

    const TOTAL_STEPS = 4; // steps 1-4 (step 0 is welcome, doesn't count)

    return (
        <main className="min-h-screen bg-[#09090F] text-white flex flex-col relative overflow-hidden">

            {/* Top Controls (Only on steps 1-4) */}
            <AnimatePresence>
                {step > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute top-0 left-0 right-0 z-50 pt-[max(env(safe-area-inset-top),44px)] px-5 flex items-center gap-4"
                    >
                        <motion.button
                            initial={{ x: -16, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            onClick={goPrev}
                            className="w-[44px] h-[44px] rounded-full bg-[#13131C] flex items-center justify-center border border-[#2A2A3D] shrink-0"
                        >
                            <ChevronLeft size={22} className="text-white" />
                        </motion.button>

                        {/* Segmented progress bar */}
                        <div className="flex-1 flex gap-1.5 items-center">
                            {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
                                const segStep = i + 1;
                                const filled = step > segStep;
                                const active = step === segStep;
                                return (
                                    <motion.div
                                        key={i}
                                        className="h-[4px] rounded-full overflow-hidden bg-[#2A2A3D] flex-1"
                                    >
                                        <motion.div
                                            className="h-full rounded-full bg-[#4F9EFF]"
                                            initial={{ width: 0 }}
                                            animate={{ width: filled ? "100%" : active ? "50%" : "0%" }}
                                            transition={{ duration: 0.35, ease: "easeOut" }}
                                        />
                                    </motion.div>
                                );
                            })}
                        </div>

                        <span className="text-[12px] text-[#56566F] font-['DM_Sans'] font-semibold shrink-0 w-[44px] text-right">
                            {step}/{TOTAL_STEPS}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex-1 flex flex-col relative">
                <AnimatePresence initial={false} custom={direction} mode="wait">
                    <motion.div
                        key={step}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.28 }}
                        className="absolute inset-0 flex flex-col"
                    >
                        {step === 0 && <WelcomeStep onNext={goNext} />}
                        {step === 1 && <GoalStep data={data} updateData={updateData} onNext={goNext} />}
                        {step === 2 && <AboutStep data={data} updateData={updateData} onNext={goNext} />}
                        {step === 3 && <ActivityStep data={data} updateData={updateData} onNext={goNext} />}
                        {step === 4 && <ResultsStep data={data} />}
                    </motion.div>
                </AnimatePresence>
            </div>

        </main>
    );
}
