"use client";
import { TapButton } from "@/components/ui/TapButton";

import { OnboardingData } from "./types";
import { Plus, Minus } from "lucide-react";
import { useState, useEffect } from "react";

interface AboutStepProps {
    data: OnboardingData;
    updateData: (d: Partial<OnboardingData>) => void;
    onNext: () => void;
}

export function AboutStep({ data, updateData, onNext }: AboutStepProps) {

    const [localData, setLocalData] = useState(data);

    useEffect(() => {
        const timer = setTimeout(() => {
            updateData(localData);
        }, 100); // 100ms debounce
        return () => clearTimeout(timer);
    }, [localData, updateData]);

    const handleAgeChange = (amount: number) => {
        const current = parseInt(localData.age) || 25;
        const next = Math.max(12, Math.min(100, current + amount));
        setLocalData(prev => ({ ...prev, age: next.toString() }));
    };

    const isComplete = localData.name.trim() !== "" && localData.age !== "" && localData.weight !== "" && localData.height !== "" && localData.gender !== "";

    return (
        <div className="flex-1 flex flex-col pt-[120px] pb-[160px] px-[20px] overflow-y-auto">

            <div className="mb-8 w-full">
                <h2 className="text-[32px] font-bold font-['Bricolage_Grotesque'] leading-tight mb-3">
                    About you
                </h2>
                <p className="text-[#A0A0B8] text-[15px] font-['DM_Sans']">
                    Just the basics to calculate your resting metabolic rate.
                </p>
            </div>

            <div className="flex flex-col gap-6 flex-1 overflow-y-auto pb-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

                {/* Name */}
                <div>
                    <label className="block text-[#A0A0B8] text-[13px] font-bold uppercase mb-2 ml-1 tracking-wider">Name</label>
                    <input
                        type="text"
                        value={localData.name}
                        onChange={(e) => setLocalData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g. Alex"
                        className="w-full bg-[#1A1A24] border border-[#2A2A3A] rounded-[16px] h-[56px] px-5 text-white font-['DM_Sans'] text-[16px] focus:outline-none focus:border-[#FF6B35]"
                    />
                </div>

                {/* Age Stepper */}
                <div>
                    <label className="block text-[#A0A0B8] text-[13px] font-bold uppercase mb-2 ml-1 tracking-wider">Age</label>
                    <div className="flex items-center justify-between bg-[#1A1A24] border border-[#2A2A3A] rounded-[16px] p-2">
                        <TapButton onClick={() => handleAgeChange(-1)} className="w-[44px] h-[44px] rounded-[12px] bg-[#22222F] flex items-center justify-center text-white active:scale-95">
                            <Minus size={20} />
                        </TapButton>
                        <div className="text-[20px] font-bold font-['DM_Sans'] text-white">
                            {localData.age || "25"}
                        </div>
                        <TapButton onClick={() => handleAgeChange(1)} className="w-[44px] h-[44px] rounded-[12px] bg-[#22222F] flex items-center justify-center text-white active:scale-95">
                            <Plus size={20} />
                        </TapButton>
                    </div>
                </div>

                {/* Weight Grid */}
                <div className="grid grid-cols-[1fr_auto] gap-3">
                    <div>
                        <label className="block text-[#A0A0B8] text-[13px] font-bold uppercase mb-2 ml-1 tracking-wider">Weight</label>
                        <input
                            type="number"
                            value={localData.weight}
                            onChange={(e) => setLocalData(prev => ({ ...prev, weight: e.target.value }))}
                            placeholder="0"
                            className="w-full bg-[#1A1A24] border border-[#2A2A3A] rounded-[16px] h-[56px] px-5 text-white font-['DM_Sans'] text-[16px] focus:outline-none focus:border-[#FF6B35]"
                        />
                    </div>
                    <div className="flex items-end">
                        <div className="bg-[#1A1A24] border border-[#2A2A3A] rounded-[16px] p-1 flex h-[56px]">
                            <TapButton
                                onClick={() => setLocalData(prev => ({ ...prev, weightUnit: "lbs" }))}
                                className={`px-4 rounded-[12px] font-bold text-[14px] ${localData.weightUnit === "lbs" ? "bg-[#2A2A3A] text-white" : "text-[#60607A]"}`}
                            >lbs</TapButton>
                            <TapButton
                                onClick={() => setLocalData(prev => ({ ...prev, weightUnit: "kg" }))}
                                className={`px-4 rounded-[12px] font-bold text-[14px] ${localData.weightUnit === "kg" ? "bg-[#2A2A3A] text-white" : "text-[#60607A]"}`}
                            >kg</TapButton>
                        </div>
                    </div>
                </div>

                {/* Height Grid */}
                <div className="grid grid-cols-[1fr_auto] gap-3">
                    <div>
                        <label className="block text-[#A0A0B8] text-[13px] font-bold uppercase mb-2 ml-1 tracking-wider">Height</label>
                        <input
                            type="number"
                            value={localData.height}
                            onChange={(e) => setLocalData(prev => ({ ...prev, height: e.target.value }))}
                            placeholder={localData.heightUnit === "ft" ? "e.g. 5.9" : "e.g. 175"}
                            className="w-full bg-[#1A1A24] border border-[#2A2A3A] rounded-[16px] h-[56px] px-5 text-white font-['DM_Sans'] text-[16px] focus:outline-none focus:border-[#FF6B35]"
                        />
                    </div>
                    <div className="flex items-end">
                        <div className="bg-[#1A1A24] border border-[#2A2A3A] rounded-[16px] p-1 flex h-[56px]">
                            <TapButton
                                onClick={() => setLocalData(prev => ({ ...prev, heightUnit: "ft" }))}
                                className={`px-4 rounded-[12px] font-bold text-[14px] ${localData.heightUnit === "ft" ? "bg-[#2A2A3A] text-white" : "text-[#60607A]"}`}
                            >ft</TapButton>
                            <TapButton
                                onClick={() => setLocalData(prev => ({ ...prev, heightUnit: "cm" }))}
                                className={`px-4 rounded-[12px] font-bold text-[14px] ${localData.heightUnit === "cm" ? "bg-[#2A2A3A] text-white" : "text-[#60607A]"}`}
                            >cm</TapButton>
                        </div>
                    </div>
                </div>

                {/* Gender */}
                <div>
                    <label className="block text-[#A0A0B8] text-[13px] font-bold uppercase mb-2 ml-1 tracking-wider">Biological Sex</label>
                    <div className="grid grid-cols-2 gap-3">
                        <TapButton
                            onClick={() => setLocalData(prev => ({ ...prev, gender: "male" }))}
                            className={`h-[56px] rounded-[16px] border-2 font-bold text-[15px] transition-colors ${localData.gender === "male" ? "bg-[#22222F] border-[#FF6B35] text-white" : "bg-[#1A1A24] border-[#2A2A3A] text-[#A0A0B8]"}`}
                        >Male</TapButton>
                        <TapButton
                            onClick={() => setLocalData(prev => ({ ...prev, gender: "female" }))}
                            className={`h-[56px] rounded-[16px] border-2 font-bold text-[15px] transition-colors ${localData.gender === "female" ? "bg-[#22222F] border-[#FF6B35] text-white" : "bg-[#1A1A24] border-[#2A2A3A] text-[#A0A0B8]"}`}
                        >Female</TapButton>
                    </div>
                </div>

            </div>

            <div className="fixed bottom-0 left-0 w-full p-[20px] pb-[max(20px,env(safe-area-inset-bottom))] bg-[#0F0F14] z-50 flex flex-col border-t border-[#1A1A24]">
                <TapButton
                    onClick={onNext}
                    disabled={!isComplete}
                    className="w-full h-[56px] bg-[#FF6B35] rounded-[16px] font-['DM_Sans'] text-[18px] font-bold text-white shadow-[0_8px_32px_rgba(255,107,53,0.35)] transition-transform active:scale-[0.98] disabled:bg-[#2A2A3A] disabled:text-[#60607A] disabled:shadow-none"
                >
                    Continue
                </TapButton>
            </div>
        </div>
    );
}
