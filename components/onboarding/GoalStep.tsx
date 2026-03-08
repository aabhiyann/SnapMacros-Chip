"use client";
import { TapButton } from "@/components/ui/TapButton";

import { motion, AnimatePresence } from "framer-motion";
import { Chip } from "@/components/Chip";
import { OnboardingData } from "./types";
import { Check } from "lucide-react";

interface GoalStepProps {
    data: OnboardingData;
    updateData: (d: Partial<OnboardingData>) => void;
    onNext: () => void;
}

const GOALS = [
    { id: "bulk", emoji: "🏋️", title: "Bulk", desc: "Build maximum muscle" },
    { id: "lean_bulk", emoji: "💪", title: "Lean Bulk", desc: "Muscle with minimal fat gain" },
    { id: "maintain", emoji: "⚖️", title: "Maintain", desc: "Stay exactly where you are" },
    { id: "fat_loss", emoji: "🔥", title: "Fat Loss", desc: "Lose fat, keep muscle" },
    { id: "cut", emoji: "✂️", title: "Cut", desc: "Aggressive definition phase" },
];

export function GoalStep({ data, updateData, onNext }: GoalStepProps) {
    const getChipResponse = () => {
        switch (data.goal) {
            case "bulk": return { text: "Big plates incoming. Let's BUILD. 🏋️", emotion: "hype" as const };
            case "lean_bulk": return { text: "The smart choice. Strength + aesthetics.", emotion: "happy" as const };
            case "maintain": return { text: "Honestly the hardest goal. Mad respect.", emotion: "thinking" as const };
            case "fat_loss": return { text: "Deficit mode. Protein stays high. Let's go.", emotion: "hype" as const };
            case "cut": return { text: "Discipline mode. Chip is locked in with you.", emotion: "shocked" as const };
            default: return null;
        }
    };

    const chip = getChipResponse();

    return (
        <div className="flex-1 flex flex-col pt-[120px] pb-[160px] px-[20px] overflow-y-auto relative">

            {/* Chip floating top-right */}
            <div className="absolute top-[80px] right-[20px] z-10 flex flex-col items-end">
                <Chip emotion={chip?.emotion || "happy"} size={80} />
                <AnimatePresence>
                    {chip && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, x: 20 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.9, x: 20 }}
                            className="bg-[#1A1A24] border border-[#2A2A3A] rounded-[16px] p-3 shadow-xl max-w-[200px] mt-2 relative mr-4"
                        >
                            <div className="absolute -top-2 right-6 w-4 h-4 bg-[#1A1A24] border-t border-l border-[#2A2A3A] rotate-45" />
                            <p className="text-[#FFFFFF] text-[13px] font-medium font-['DM_Sans'] relative z-10">
                                {chip.text}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Header */}
            <div className="mb-8 w-full pr-[90px]">
                <h1 className="text-[28px] font-bold font-['Bricolage_Grotesque'] leading-tight mb-2">
                    What's your goal?
                </h1>
                <p className="text-[#A0A0B8] text-[15px] font-['DM_Sans']">
                    This shapes your calorie target and macro split.
                </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 gap-3 mb-auto">
                {GOALS.map((g, i) => {
                    const isSelected = data.goal === g.id;
                    const isLast = i === GOALS.length - 1;

                    return (
                        <TapButton
                            key={g.id}
                            onClick={() => updateData({ goal: g.id as any })}
                            className={`flex flex-col p-[16px] rounded-[16px] min-h-[80px] text-left transition-all duration-200 relative overflow-hidden ${isLast ? 'col-span-2' : 'col-span-1'} ${isSelected
                                ? "bg-[rgba(255,107,53,0.10)] border-2 border-[#FF6B35] shadow-[0_0_16px_rgba(255,107,53,0.2)]"
                                : "premium-card p-[16px] rounded-[16px] border-none"
                                }`}
                        >
                            {/* Checkmark */}
                            {isSelected && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute top-3 right-3 w-[20px] h-[20px] bg-[#FF6B35] rounded-full flex items-center justify-center z-10"
                                >
                                    <Check size={12} className="text-white" strokeWidth={3} />
                                </motion.div>
                            )}

                            <div className="text-[24px] mb-2 leading-none">{g.emoji}</div>
                            <h3 className={`text-[16px] font-bold font-['DM_Sans'] leading-tight mb-1 ${isSelected ? "text-[#FF6B35]" : "text-white"}`}>
                                {g.title}
                            </h3>
                            <p className="text-[#A0A0B8] text-[13px] font-['DM_Sans'] leading-snug">
                                {g.desc}
                            </p>
                        </TapButton>
                    )
                })}
            </div>

            {/* Action */}
            <div className="fixed bottom-0 left-0 w-full p-[20px] pb-[max(20px,env(safe-area-inset-bottom))] bg-[#0F0F14] z-50 flex flex-col border-t border-[#1A1A24]">
                <TapButton
                    onClick={onNext}
                    disabled={!data.goal}
                    className="w-full premium-btn"
                >
                    Continue
                </TapButton>
            </div>
        </div>
    );
}
