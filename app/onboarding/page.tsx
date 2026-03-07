"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { initialData, OnboardingData } from "@/components/onboarding/types";
import { WelcomeStep } from "@/components/onboarding/WelcomeStep";
import { GoalStep } from "@/components/onboarding/GoalStep";
import { AboutStep } from "@/components/onboarding/AboutStep";
// import { ActivityStep } from "@/components/onboarding/ActivityStep";
// import { ResultsStep } from "@/components/onboarding/ResultsStep";

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

    // We need a direction value, let's just make it always +1 for now unless going back
    const [direction, setDirection] = useState(1);

    const goNext = () => {
        setDirection(1);
        nextStep();
    };

    const goPrev = () => {
        setDirection(-1);
        prevStep();
    };

    return (
        <main className="min-h-screen bg-[#0F0F14] text-[#FFFFFF] flex flex-col relative overflow-hidden">

            {/* Top Controls (Only on steps 1-4) */}
            <AnimatePresence>
                {step > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-0 left-0 right-0 z-50 pt-[48px] px-[20px] flex items-center"
                    >
                        <button
                            onClick={goPrev}
                            className="w-[44px] h-[44px] rounded-full bg-[#1A1A24] flex items-center justify-center border border-[#2A2A3A] hover:bg-[#2A2A3A] transition-colors"
                        >
                            <ChevronLeft size={24} className="text-white" />
                        </button>

                        {/* Progress Bar (Visible Steps 1-4) - We scale logic so step 1 maps to dot 1 */}
                        <div className="flex-1 flex justify-center gap-2">
                            {[1, 2, 3, 4].map((i) => (
                                <motion.div
                                    key={i}
                                    animate={{
                                        width: step === i ? 32 : 8,
                                        backgroundColor: step === i ? "#FF6B35" : step > i ? "#FF6B35" : "#2A2A3A"
                                    }}
                                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                    className="h-[8px] rounded-full"
                                />
                            ))}
                        </div>

                        <div className="w-[44px]" /> {/* Spacer for centering */}
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
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.28 }
                        }}
                        className="absolute inset-0 flex flex-col"
                    >
                        {step === 0 && <WelcomeStep onNext={goNext} />}
                        {/* Steps 1-4 to be added in next phase */}
                        {step > 0 && (
                            <div className="flex-1 flex items-center justify-center text-center px-4">
                                <p className="text-[#A0A0B8]">Step {step} placeholder component</p>
                                <button onClick={goNext} className="mt-8 px-6 py-3 bg-[#FF6B35] rounded-xl font-bold">Next (Dev)</button>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

        </main>
    );
}
