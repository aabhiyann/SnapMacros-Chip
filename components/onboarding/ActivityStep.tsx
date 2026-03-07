"use client";
import { TapButton } from "@/components/ui/TapButton";

import { Chip } from "@/components/Chip";
import { OnboardingData } from "./types";

interface ActivityStepProps {
    data: OnboardingData;
    updateData: (d: Partial<OnboardingData>) => void;
    onNext: () => void;
}

const ACTIVITIES = [
    { id: "sedentary", title: "Sedentary", desc: "Desk job, little to no exercise." },
    { id: "light", title: "Lightly Active", desc: "Light exercise 1-3 days/week." },
    { id: "moderate", title: "Moderately Active", desc: "Moderate exercise 3-5 days/week." },
    { id: "active", title: "Active", desc: "Hard exercise 6-7 days/week." },
    { id: "very_active", title: "Very Active", desc: "Very hard exercise & physical job." },
];

export function ActivityStep({ data, updateData, onNext }: ActivityStepProps) {
    return (
        <div className="flex-1 flex flex-col pt-[120px] pb-[40px] px-[20px]">

            <div className="mb-8 w-full">
                <h2 className="text-[32px] font-bold font-['Bricolage_Grotesque'] leading-tight mb-3">
                    How active are you?
                </h2>
                <p className="text-[#A0A0B8] text-[15px] font-['DM_Sans']">
                    This helps calculate your total daily energy expenditure (TDEE).
                </p>
            </div>

            <div className="flex flex-col gap-3 mb-auto">
                {ACTIVITIES.map((act) => {
                    const isSelected = data.activityLevel === act.id;
                    return (
                        <TapButton
                            key={act.id}
                            onClick={() => updateData({ activityLevel: act.id as any })}
                            className={`flex items-center p-4 rounded-[16px] border-2 transition-all ${isSelected
                                ? "bg-[#22222F] border-[#FF6B35] shadow-[0_0_24px_rgba(255,107,53,0.15)]"
                                : "bg-[#1A1A24] border-[#2A2A3A] hover:bg-[#22222F]"
                                }`}
                        >
                            <div className={`w-5 h-5 rounded-full border-2 mr-4 flex flex-col items-center justify-center shrink-0 ${isSelected ? "border-[#FF6B35]" : "border-[#60607A]"}`}>
                                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#FF6B35]" />}
                            </div>
                            <div className="text-left flex-1">
                                <h3 className={`text-[15px] font-bold font-['DM_Sans'] ${isSelected ? "text-white" : "text-[#E0E0E0]"}`}>
                                    {act.title}
                                </h3>
                                <p className="text-[#A0A0B8] text-[13px] font-['DM_Sans'] mt-0.5">
                                    {act.desc}
                                </p>
                            </div>
                        </TapButton>
                    )
                })}
            </div>

            <div className="mt-8">
                <div className="flex items-center gap-4 bg-[#1A1A24] rounded-[20px] p-4 mb-6 border border-[#2A2A3A]">
                    <Chip emotion="thinking" size={64} />
                    <p className="text-[#FFFFFF] text-[14px] italic font-['DM_Sans'] flex-1">
                        "Be honest. I won't judge. Much. 👀"
                    </p>
                </div>

                <TapButton
                    onClick={onNext}
                    className="w-full h-[60px] bg-[#FF6B35] rounded-[16px] font-['DM_Sans'] text-[18px] font-bold text-white shadow-[0_8px_32px_rgba(255,107,53,0.35)] transition-transform active:scale-[0.98]"
                >
                    See My Targets &rarr;
                </TapButton>
            </div>
        </div>
    );
}
