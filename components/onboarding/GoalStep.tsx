"use client";
import { TapButton } from "@/components/ui/TapButton";

import { motion } from "framer-motion";
import { Chip } from "@/components/Chip";
import { OnboardingData } from "./types";
import { MoveDown, MoveRight, MoveUp } from "lucide-react";

interface GoalStepProps {
    data: OnboardingData;
    updateData: (d: Partial<OnboardingData>) => void;
    onNext: () => void;
}

const GOALS = [
    { id: "cut", title: "Lose Weight", desc: "Burn fat & lean out.", icon: MoveDown, color: "#2DD4BF" },
    { id: "maintain", title: "Maintain", desc: "Keep current shape.", icon: MoveRight, color: "#6C63FF" },
    { id: "bulk", title: "Build Muscle", desc: "Grow overall size.", icon: MoveUp, color: "#FF6B35" },
];

export function GoalStep({ data, updateData, onNext }: GoalStepProps) {
    const getChipResponse = () => {
        switch (data.goal) {
            case "cut": return { text: "Oh, we're cutting? I'll hide the donuts.", emotion: "shocked" as const };
            case "maintain": return { text: "Steady and consistent. I respect it.", emotion: "thinking" as const };
            case "bulk": return { text: "Time to eat BIG. Let's goooo!", emotion: "hype" as const };
            default: return { text: "What are we aiming for here?", emotion: "happy" as const };
        }
    };

    const chip = getChipResponse();

    return (
        <div className="flex-1 flex flex-col pt-[120px] pb-[160px] px-[20px] overflow-y-auto">

            {/* Header */}
            <div className="mb-10 w-full">
                <h2 className="text-[32px] font-bold font-['Bricolage_Grotesque'] leading-tight mb-3">
                    What's the main goal?
                </h2>
                <p className="text-[#A0A0B8] text-[15px] font-['DM_Sans']">
                    We'll set your initial macro targets based on this.
                </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 gap-4 mb-auto">
                {GOALS.map((g) => {
                    const isSelected = data.goal === g.id;
                    const Icon = g.icon;
                    return (
                        <TapButton
                            key={g.id}
                            onClick={() => updateData({ goal: g.id as any })}
                            className={`flex items-center p-5 rounded-[20px] border-2 transition-all ${isSelected
                                ? "bg-[#22222F] border-[#FF6B35] shadow-[0_0_24px_rgba(255,107,53,0.15)]"
                                : "bg-[#1A1A24] border-[#2A2A3A] hover:bg-[#22222F]"
                                }`}
                        >
                            <div
                                className="w-12 h-12 rounded-full flex items-center justify-center mr-4 shrink-0 transition-colors"
                                style={{ backgroundColor: isSelected ? g.color : '#2A2A3A' }}
                            >
                                <Icon size={24} className={isSelected ? "text-black" : "text-[#A0A0B8]"} />
                            </div>
                            <div className="text-left">
                                <h3 className={`text-[18px] font-bold font-['DM_Sans'] ${isSelected ? "text-white" : "text-[#E0E0E0]"}`}>
                                    {g.title}
                                </h3>
                                <p className="text-[#A0A0B8] text-[14px] font-['DM_Sans'] mt-1">
                                    {g.desc}
                                </p>
                            </div>
                        </TapButton>
                    )
                })}
            </div>

            {/* Reactive Chip Footer + Action */}
            <div className="fixed bottom-0 left-0 w-full p-[20px] pb-[max(20px,env(safe-area-inset-bottom))] bg-[#0F0F14] z-50 flex flex-col border-t border-[#1A1A24]">
                <div className="flex items-center gap-4 bg-[#1A1A24] rounded-[20px] p-4 mb-4 border border-[#2A2A3A]">
                    <Chip emotion={chip.emotion} size={48} />
                    <p className="text-[#FFFFFF] text-[14px] italic font-['DM_Sans'] flex-1">
                        "{chip.text}"
                    </p>
                </div>

                <TapButton
                    onClick={onNext}
                    disabled={!data.goal}
                    className="w-full h-[56px] bg-[#FF6B35] rounded-[16px] font-['DM_Sans'] text-[18px] font-bold text-white shadow-[0_8px_32px_rgba(255,107,53,0.35)] transition-transform active:scale-[0.98] disabled:bg-[#2A2A3A] disabled:text-[#60607A] disabled:shadow-none"
                >
                    Continue
                </TapButton>
            </div>
        </div>
    );
}
