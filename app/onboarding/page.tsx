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

    return (
        <main className="min-h-screen bg-[#0F0F14] text-[#FFFFFF] flex flex-col relative overflow-hidden">

            {/* Top Controls (Only on steps 1-4) */}
            <AnimatePresence>
                {step > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute top-0 left-0 right-0 z-50 pt-[48px] px-[20px] flex items-center"
                    >
                        <motion.button
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            onClick={goPrev}
                            className="w-[48px] h-[48px] rounded-full bg-[#1A1A24] flex items-center justify-center border border-[#2A2A3A] hover:bg-[#2A2A3A] transition-colors"
                        >
                            <ChevronLeft size={24} className="text-white" />
                        </motion.button>

                        {/* Progress Bar (Visible Steps 1-4) */}
                        <div className="flex-1 flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <motion.div
                                    key={i}
                                    animate={{
                                        width: step === i ? 32 : 8,
                                        backgroundColor: step === i ? "#3B8BF7" : step > i ? "#3B8BF7" : "#2A2A3A"
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
