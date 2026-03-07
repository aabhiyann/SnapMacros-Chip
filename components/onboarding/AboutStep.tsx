"use client";

import { OnboardingData } from "./types";
import { Plus, Minus } from "lucide-react";

interface AboutStepProps {
    data: OnboardingData;
    updateData: (d: Partial<OnboardingData>) => void;
    onNext: () => void;
}

export function AboutStep({ data, updateData, onNext }: AboutStepProps) {

    const handleAgeChange = (amount: number) => {
        const current = parseInt(data.age) || 25;
        const next = Math.max(12, Math.min(100, current + amount));
        updateData({ age: next.toString() });
    };

    const isComplete = data.name.trim() !== "" && data.age !== "" && data.weight !== "" && data.height !== "" && data.gender !== "";

    return (
        <div className="flex-1 flex flex-col pt-[120px] pb-[40px] px-[20px]">

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
                        value={data.name}
                        onChange={(e) => updateData({ name: e.target.value })}
                        placeholder="e.g. Alex"
                        className="w-full bg-[#1A1A24] border border-[#2A2A3A] rounded-[16px] h-[56px] px-5 text-white font-['DM_Sans'] text-[16px] focus:outline-none focus:border-[#FF6B35]"
                    />
                </div>

                {/* Age Stepper */}
                <div>
                    <label className="block text-[#A0A0B8] text-[13px] font-bold uppercase mb-2 ml-1 tracking-wider">Age</label>
                    <div className="flex items-center justify-between bg-[#1A1A24] border border-[#2A2A3A] rounded-[16px] p-2">
                        <button onClick={() => handleAgeChange(-1)} className="w-[44px] h-[44px] rounded-[12px] bg-[#22222F] flex items-center justify-center text-white active:scale-95">
                            <Minus size={20} />
                        </button>
                        <div className="text-[20px] font-bold font-['DM_Sans'] text-white">
                            {data.age || "25"}
                        </div>
                        <button onClick={() => handleAgeChange(1)} className="w-[44px] h-[44px] rounded-[12px] bg-[#22222F] flex items-center justify-center text-white active:scale-95">
                            <Plus size={20} />
                        </button>
                    </div>
                </div>

                {/* Weight Grid */}
                <div className="grid grid-cols-[1fr_auto] gap-3">
                    <div>
                        <label className="block text-[#A0A0B8] text-[13px] font-bold uppercase mb-2 ml-1 tracking-wider">Weight</label>
                        <input
                            type="number"
                            value={data.weight}
                            onChange={(e) => updateData({ weight: e.target.value })}
                            placeholder="0"
                            className="w-full bg-[#1A1A24] border border-[#2A2A3A] rounded-[16px] h-[56px] px-5 text-white font-['DM_Sans'] text-[16px] focus:outline-none focus:border-[#FF6B35]"
                        />
                    </div>
                    <div className="flex items-end">
                        <div className="bg-[#1A1A24] border border-[#2A2A3A] rounded-[16px] p-1 flex h-[56px]">
                            <button
                                onClick={() => updateData({ weightUnit: "lbs" })}
                                className={`px-4 rounded-[12px] font-bold text-[14px] ${data.weightUnit === "lbs" ? "bg-[#2A2A3A] text-white" : "text-[#60607A]"}`}
                            >lbs</button>
                            <button
                                onClick={() => updateData({ weightUnit: "kg" })}
                                className={`px-4 rounded-[12px] font-bold text-[14px] ${data.weightUnit === "kg" ? "bg-[#2A2A3A] text-white" : "text-[#60607A]"}`}
                            >kg</button>
                        </div>
                    </div>
                </div>

                {/* Height Grid */}
                <div className="grid grid-cols-[1fr_auto] gap-3">
                    <div>
                        <label className="block text-[#A0A0B8] text-[13px] font-bold uppercase mb-2 ml-1 tracking-wider">Height</label>
                        <input
                            type="number"
                            value={data.height}
                            onChange={(e) => updateData({ height: e.target.value })}
                            placeholder={data.heightUnit === "ft" ? "e.g. 5.9" : "e.g. 175"}
                            className="w-full bg-[#1A1A24] border border-[#2A2A3A] rounded-[16px] h-[56px] px-5 text-white font-['DM_Sans'] text-[16px] focus:outline-none focus:border-[#FF6B35]"
                        />
                    </div>
                    <div className="flex items-end">
                        <div className="bg-[#1A1A24] border border-[#2A2A3A] rounded-[16px] p-1 flex h-[56px]">
                            <button
                                onClick={() => updateData({ heightUnit: "ft" })}
                                className={`px-4 rounded-[12px] font-bold text-[14px] ${data.heightUnit === "ft" ? "bg-[#2A2A3A] text-white" : "text-[#60607A]"}`}
                            >ft</button>
                            <button
                                onClick={() => updateData({ heightUnit: "cm" })}
                                className={`px-4 rounded-[12px] font-bold text-[14px] ${data.heightUnit === "cm" ? "bg-[#2A2A3A] text-white" : "text-[#60607A]"}`}
                            >cm</button>
                        </div>
                    </div>
                </div>

                {/* Gender */}
                <div>
                    <label className="block text-[#A0A0B8] text-[13px] font-bold uppercase mb-2 ml-1 tracking-wider">Biological Sex</label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => updateData({ gender: "male" })}
                            className={`h-[56px] rounded-[16px] border-2 font-bold text-[15px] transition-colors ${data.gender === "male" ? "bg-[#22222F] border-[#FF6B35] text-white" : "bg-[#1A1A24] border-[#2A2A3A] text-[#A0A0B8]"}`}
                        >Male</button>
                        <button
                            onClick={() => updateData({ gender: "female" })}
                            className={`h-[56px] rounded-[16px] border-2 font-bold text-[15px] transition-colors ${data.gender === "female" ? "bg-[#22222F] border-[#FF6B35] text-white" : "bg-[#1A1A24] border-[#2A2A3A] text-[#A0A0B8]"}`}
                        >Female</button>
                    </div>
                </div>

            </div>

            <div className="mt-auto pt-4">
                <button
                    onClick={onNext}
                    disabled={!isComplete}
                    className="w-full h-[60px] bg-[#FF6B35] rounded-[16px] font-['DM_Sans'] text-[18px] font-bold text-white shadow-[0_8px_32px_rgba(255,107,53,0.35)] transition-transform active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 disabled:shadow-none"
                >
                    Continue
                </button>
            </div>
        </div>
    );
}
