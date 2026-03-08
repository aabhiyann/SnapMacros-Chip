"use client";
import { TapButton } from "@/components/ui/TapButton";
import { Chip } from "@/components/Chip";
import { OnboardingData } from "./types";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { Armchair, PersonStanding, Bike, Dumbbell, Zap } from "lucide-react";

interface ActivityStepProps {
    data: OnboardingData;
    updateData: (d: Partial<OnboardingData>) => void;
    onNext: () => void;
}

const ACTIVITIES = [
    { id: "sedentary", icon: Armchair, title: "Sedentary", desc: "Desk job, very little movement" },
    { id: "light", icon: PersonStanding, title: "Lightly Active", desc: "1–3 workouts per week" },
    { id: "moderate", icon: Bike, title: "Moderately Active", desc: "3–5 workouts per week" },
    { id: "active", icon: Dumbbell, title: "Very Active", desc: "6–7 intense workouts / week" },
    { id: "very_active", icon: Zap, title: "Athlete", desc: "Twice-daily training or physical labor" },
];

export function ActivityStep({ data, updateData, onNext }: ActivityStepProps) {

    // Pre-select moderate if empty
    useEffect(() => {
        if (!data.activityLevel) {
            updateData({ activityLevel: "moderate" });
        }
    }, [data.activityLevel, updateData]);

    const currentActivity = data.activityLevel || "moderate";

    return (
        <div className="flex-1 flex flex-col pt-[120px] pb-[160px] px-[20px] overflow-y-auto relative">

            {/* Chip top right */}
            <div className="absolute top-[80px] right-[20px] z-10 flex flex-col items-end">
                <Chip emotion="happy" size={80} />
                <AnimatePresence>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, x: 20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        className="bg-[#1A1A24] border border-[#2A2A3A] rounded-[16px] p-3 shadow-xl max-w-[180px] mt-2 relative mr-2"
                    >
                        <div className="absolute -top-2 right-6 w-4 h-4 bg-[#1A1A24] border-t border-l border-[#2A2A3A] rotate-45" />
                        <p className="text-[#FFFFFF] text-[12px] font-medium font-['DM_Sans'] relative z-10 text-center">
                            Be honest. I won't judge. Much. 👀
                        </p>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Header */}
            <div className="mb-8 w-full pr-[90px]">
                <h1 className="text-[28px] font-bold font-['Bricolage_Grotesque'] leading-tight mb-2">
                    How active are you?
                </h1>
            </div>

            <div className="flex flex-col gap-3 flex-1 pb-8">
                {ACTIVITIES.map((act) => {
                    const isSelected = currentActivity === act.id;
                    return (
                        <TapButton
                            key={act.id}
                            onClick={() => updateData({ activityLevel: act.id as any })}
                            className={`flex items-center h-[72px] rounded-[16px] border-l-[4px] border border-y-[#2A2A3A] border-r-[#2A2A3A] transition-all duration-200 relative overflow-hidden ${isSelected
                                ? "bg-[rgba(255,107,53,0.08)] border-l-[#FF6B35] border-y-[#FF6B35] border-r-[#FF6B35] border-y-2 border-r-2 shadow-[0_0_24px_rgba(255,107,53,0.15)]"
                                : "bg-[#1A1A24] border-l-transparent hover:bg-[#22222F]"
                                }`}
                        >
                            {/* Icon */}
                            <div className="pl-[16px] flex items-center justify-center">
                                <act.icon size={26} stroke={isSelected ? '#FF6B35' : '#A0A0B8'} strokeWidth={2.5} />
                            </div>

                            {/* Content */}
                            <div className="text-left flex-1 pl-4 pr-3">
                                <h3 className={`text-[16px] font-[600] font-['DM_Sans'] ${isSelected ? "text-[#FF6B35]" : "text-white"}`}>
                                    {act.title}
                                </h3>
                                <p className="text-[#A0A0B8] text-[13px] font-['DM_Sans'] mt-0.5">
                                    {act.desc}
                                </p>
                            </div>

                            {/* Indicator */}
                            <div className="pr-4 flex items-center justify-center">
                                <div className={`w-[16px] h-[16px] rounded-full border-2 transition-colors duration-200 flex items-center justify-center ${isSelected ? "border-[#FF6B35]" : "border-[#60607A]"}`}>
                                    {isSelected && <div className="w-2 h-2 rounded-full bg-[#FF6B35]" />}
                                </div>
                            </div>
                        </TapButton>
                    );
                })}
            </div>

            <div className="fixed bottom-0 left-0 w-full p-[20px] pb-[max(20px,env(safe-area-inset-bottom))] bg-[#0F0F14] z-50 flex flex-col border-t border-[#1A1A24]">
                <TapButton
                    onClick={onNext}
                    disabled={!data.activityLevel}
                    className="w-full premium-btn"
                >
                    Continue
                </TapButton>
            </div>
        </div>
    );
}
