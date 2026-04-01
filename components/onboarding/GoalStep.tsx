"use client";
import { TapButton } from "@/components/ui/TapButton";

import { motion, AnimatePresence } from "framer-motion";
import { Chip } from "@/components/Chip";
import { OnboardingData } from "./types";
import { Dumbbell, TrendingUp, Scale, Flame, Scissors } from "lucide-react";

interface GoalStepProps {
    data: OnboardingData;
    updateData: (d: Partial<OnboardingData>) => void;
    onNext: () => void;
}

const GOALS = [
    { id: "bulk", icon: Dumbbell, title: "Bulk", desc: "Build maximum muscle" },
    { id: "lean_bulk", icon: TrendingUp, title: "Lean Bulk", desc: "Muscle with minimal fat gain" },
    { id: "maintain", icon: Scale, title: "Maintain", desc: "Stay exactly where you are" },
    { id: "fat_loss", icon: Flame, title: "Fat Loss", desc: "Lose fat, keep muscle" },
    { id: "cut", icon: Scissors, title: "Cut", desc: "Aggressive definition phase" },
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
                            className="bg-[#13131C] border border-[#2A2A3D] rounded-[16px] p-3 shadow-xl max-w-[200px] mt-2 relative mr-4"
                        >
                            <div className="absolute -top-2 right-6 w-4 h-4 bg-[#13131C] border-t border-l border-[#2A2A3D] rotate-45" />
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
                    What&apos;s your goal?
                </h1>
                <p className="text-[#9898B3] text-[15px] font-['DM_Sans']">
                    This shapes your calorie target and macro split.
                </p>
            </div>

            {/* List */}
            <div className="flex flex-col gap-3 mb-auto relative z-10 w-full">
                {GOALS.map((g) => {
                    const isSelected = data.goal === g.id;

                    return (
                        <motion.button
                            key={g.id}
                            onClick={() => updateData({ goal: g.id as OnboardingData["goal"] })}
                            whileTap={{ scale: 0.98 }}
                            animate={isSelected ? { scale: [0.98, 1.02, 1] } : { scale: 1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 17 }}
                            className={`w-full flex items-center p-4 rounded-[16px] text-left transition-all duration-200 border ${isSelected
                                ? "bg-[rgba(59,139,247,0.08)] border-[#4F9EFF]"
                                : "bg-[#13131C] border-[#2A2A3D] hover:bg-[#20202D]"
                                }`}
                        >
                            {/* Icon Circle bg */}
                            <div className={`w-[44px] h-[44px] rounded-[14px] flex items-center justify-center shrink-0 mr-4 transition-colors ${isSelected ? 'bg-[#4F9EFF]/15' : 'bg-[#2A2A3D]'}`}>
                                <g.icon size={24} stroke={isSelected ? '#4F9EFF' : '#9898B3'} strokeWidth={2.5} />
                            </div>

                            <div className="flex-1 pr-4">
                                <h3 className={`text-[16px] font-bold font-['DM_Sans'] leading-tight mb-0.5 text-white`}>
                                    {g.title}
                                </h3>
                                <p className={`text-[13px] font-['DM_Sans'] leading-snug ${isSelected ? 'text-[#4F9EFF]/80' : 'text-[#9898B3]'}`}>
                                    {g.desc}
                                </p>
                            </div>

                            {/* Radio Circle */}
                            <div className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'border-[#4F9EFF] bg-[#4F9EFF]' : 'border-[#56566F] bg-transparent'}`}>
                                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                            </div>
                        </motion.button>
                    )
                })}
            </div>

            {/* Action */}
            <div className="fixed bottom-0 left-0 w-full p-[20px] pb-[max(20px,env(safe-area-inset-bottom))] bg-[#09090F] z-50 flex flex-col border-t border-[#13131C]">
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
