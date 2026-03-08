"use client";
import { TapButton } from "@/components/ui/TapButton";
import { OnboardingData } from "./types";
import { Plus, Minus } from "lucide-react";
import { useState, useEffect } from "react";
import { Chip } from "@/components/Chip";
import { AnimatePresence, motion } from "framer-motion";

interface AboutStepProps {
    data: OnboardingData;
    updateData: (d: Partial<OnboardingData>) => void;
    onNext: () => void;
}

export function AboutStep({ data, updateData, onNext }: AboutStepProps) {
    const [localData, setLocalData] = useState(data);

    // If height is empty but there's a unit, we want stable controlled inputs
    // We'll calculate the split feet/inches based on the height value if ft.
    const getFeetInches = (totalInchesStr: string) => {
        const total = parseFloat(totalInchesStr);
        if (isNaN(total)) return { ft: "", in: "" };
        const ft = Math.floor(total / 12);
        const inches = Math.round(total % 12);
        return { ft: ft.toString(), in: inches.toString() };
    };

    const handleHeightFtChange = (type: "ft" | "in", val: string) => {
        const current = getFeetInches(localData.height);
        let newFt = parseFloat(type === "ft" ? val : current.ft || "0") || 0;
        let newIn = parseFloat(type === "in" ? val : current.in || "0") || 0;
        const totalInches = (newFt * 12) + newIn;
        setLocalData(prev => ({ ...prev, height: totalInches > 0 ? totalInches.toString() : "" }));
    };

    const handleHeightUnitToggle = (newUnit: "cm" | "ft") => {
        if (newUnit === localData.heightUnit) return;
        const currentVal = parseFloat(localData.height);
        let converted = "";
        if (!isNaN(currentVal)) {
            // ft holding total inches. 1 inch = 2.54 cm
            if (newUnit === "cm") {
                converted = Math.round(currentVal * 2.54).toString();
            } else {
                converted = (currentVal / 2.54).toString(); // store as total inches
            }
        }
        setLocalData(prev => ({ ...prev, heightUnit: newUnit, height: converted }));
    };

    const handleWeightUnitToggle = (newUnit: "kg" | "lbs") => {
        if (newUnit === localData.weightUnit) return;
        const currentVal = parseFloat(localData.weight);
        let converted = "";
        if (!isNaN(currentVal)) {
            if (newUnit === "kg") {
                converted = Math.round(currentVal / 2.20462).toString();
            } else {
                converted = Math.round(currentVal * 2.20462).toString();
            }
        }
        setLocalData(prev => ({ ...prev, weightUnit: newUnit, weight: converted }));
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            updateData(localData);
        }, 100);
        return () => clearTimeout(timer);
    }, [localData, updateData]);

    const handleAgeChange = (amount: number) => {
        const current = parseInt(localData.age);
        const base = isNaN(current) ? 25 : current;
        // The spec asks for 13-85 clamp
        const next = Math.max(13, Math.min(85, base + amount));
        setLocalData(prev => ({ ...prev, age: next.toString() }));
    };

    // Validations
    const ageNum = parseInt(localData.age);
    const weightNum = parseFloat(localData.weight);

    // Weight limits in kg (30-350kg)
    const weightInKg = localData.weightUnit === "kg"
        ? weightNum
        : (isNaN(weightNum) ? NaN : weightNum / 2.20462);

    const isNameInvalid = localData.name.trim() === "";
    const isAgeInvalid = !isNaN(ageNum) && (ageNum < 13 || ageNum > 85);
    const isWeightInvalid = !isNaN(weightInKg) && (weightInKg < 30 || weightInKg > 350);

    const isComplete = !isNameInvalid &&
        localData.age !== "" && !isAgeInvalid &&
        localData.weight !== "" && !isWeightInvalid &&
        localData.height !== "" &&
        localData.gender !== "";

    return (
        <div className="flex-1 flex flex-col pt-[120px] pb-[160px] px-[20px] overflow-y-auto relative">

            {/* Chip top right */}
            <div className="absolute top-[80px] right-[20px] z-10 flex flex-col items-end">
                <Chip emotion="thinking" size={72} />
                <AnimatePresence>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, x: 20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        className="bg-[#1A1A24] border border-[#2A2A3A] rounded-[16px] p-3 shadow-xl max-w-[180px] mt-2 relative mr-2"
                    >
                        <div className="absolute -top-2 right-6 w-4 h-4 bg-[#1A1A24] border-t border-l border-[#2A2A3A] rotate-45" />
                        <p className="text-[#FFFFFF] text-[12px] font-medium font-['DM_Sans'] relative z-10 text-center">
                            These numbers help me calculate your exact targets.
                        </p>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Header */}
            <div className="mb-8 w-full pr-[90px]">
                <h1 className="text-[28px] font-bold font-['Bricolage_Grotesque'] leading-tight mb-2">
                    About you
                </h1>
                <p className="text-[#A0A0B8] text-[15px] font-['DM_Sans']">
                    All private. Just for your calorie math.
                </p>
            </div>

            <div className="flex flex-col gap-5 flex-1 pb-8">

                {/* Name */}
                <div>
                    <label className="block text-[#A0A0B8] text-[11px] font-bold uppercase mb-2 ml-1 tracking-wider">
                        WHAT SHOULD CHIP CALL YOU?
                    </label>
                    <input
                        type="text"
                        value={localData.name}
                        onChange={(e) => setLocalData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Your first name"
                        className="w-full bg-[#1A1A24] border border-[#2A2A3A] rounded-[16px] h-[52px] px-5 text-white font-['DM_Sans'] text-[16px] focus:outline-none focus:border-[#FF6B35] transition-colors"
                    />
                    {isNameInvalid && localData.name !== data.name && (
                        <p className="text-[#FF6B35] text-[12px] font-['DM_Sans'] mt-2 ml-1">Chip needs something to call you!</p>
                    )}
                </div>

                {/* Age Stepper */}
                <div>
                    <label className="block text-[#A0A0B8] text-[11px] font-bold uppercase mb-2 ml-1 tracking-wider">AGE</label>
                    <div className={`flex items-center justify-between bg-[#1A1A24] border ${isAgeInvalid ? 'border-[#FF6B35]' : 'border-[#2A2A3A]'} rounded-[16px] p-2 h-[52px] transition-colors`}>
                        <TapButton onClick={() => handleAgeChange(-1)} className="w-[36px] h-[36px] rounded-[10px] bg-[#22222F] flex items-center justify-center text-white active:scale-95">
                            <Minus size={18} />
                        </TapButton>
                        <input
                            type="number" inputMode="numeric" pattern="[0-9]*"
                            value={localData.age}
                            onChange={(e) => setLocalData(prev => ({ ...prev, age: e.target.value }))}
                            placeholder="25"
                            className="bg-transparent text-center text-[22px] font-bold font-['Bricolage_Grotesque'] text-white focus:outline-none w-[60px]"
                        />
                        <TapButton onClick={() => handleAgeChange(1)} className="w-[36px] h-[36px] rounded-[10px] bg-[#22222F] flex items-center justify-center text-white active:scale-95">
                            <Plus size={18} />
                        </TapButton>
                    </div>
                    {isAgeInvalid && (
                        <p className="text-[#FF6B35] text-[12px] font-['DM_Sans'] mt-2 ml-1">Age must be between 13 and 85</p>
                    )}
                </div>

                {/* Weight Grid */}
                <div>
                    <label className="block text-[#A0A0B8] text-[11px] font-bold uppercase mb-2 ml-1 tracking-wider">WEIGHT</label>
                    <div className="flex gap-2">
                        <input
                            type="number" inputMode="numeric" pattern="[0-9]*"
                            value={localData.weight}
                            onChange={(e) => setLocalData(prev => ({ ...prev, weight: e.target.value }))}
                            placeholder="0"
                            className={`flex-1 bg-[#1A1A24] border ${isWeightInvalid ? 'border-[#FF6B35]' : 'border-[#2A2A3A]'} rounded-[16px] h-[52px] px-5 text-center text-white font-['Bricolage_Grotesque'] font-bold text-[22px] focus:outline-none focus:border-[#FF6B35] transition-colors`}
                        />
                        <div className="bg-[#1A1A24] border border-[#2A2A3A] rounded-[16px] p-1 flex h-[52px]">
                            <TapButton
                                onClick={() => handleWeightUnitToggle("kg")}
                                className={`px-4 flex items-center justify-center rounded-[12px] font-bold text-[13px] ${localData.weightUnit === "kg" ? "bg-[#FF6B35] text-white" : "text-[#60607A] hover:bg-[#22222F]"}`}
                            >KG</TapButton>
                            <TapButton
                                onClick={() => handleWeightUnitToggle("lbs")}
                                className={`px-4 flex items-center justify-center rounded-[12px] font-bold text-[13px] ${localData.weightUnit === "lbs" ? "bg-[#FF6B35] text-white" : "text-[#60607A] hover:bg-[#22222F]"}`}
                            >LBS</TapButton>
                        </div>
                    </div>
                    {isWeightInvalid && (
                        <p className="text-[#FF6B35] text-[12px] font-['DM_Sans'] mt-2 ml-1">Weight must be between 30 and 350kg</p>
                    )}
                </div>

                {/* Height Grid */}
                <div>
                    <label className="block text-[#A0A0B8] text-[11px] font-bold uppercase mb-2 ml-1 tracking-wider">HEIGHT</label>
                    <div className="flex gap-2">
                        {localData.heightUnit === "cm" ? (
                            <input
                                type="number" inputMode="numeric" pattern="[0-9]*"
                                value={localData.height}
                                onChange={(e) => setLocalData(prev => ({ ...prev, height: e.target.value }))}
                                placeholder="175"
                                className="flex-1 bg-[#1A1A24] border border-[#2A2A3A] rounded-[16px] h-[52px] px-5 text-center text-white font-['Bricolage_Grotesque'] font-bold text-[22px] focus:outline-none focus:border-[#FF6B35] transition-colors"
                            />
                        ) : (
                            <div className="flex-1 flex gap-2">
                                <div className="flex-1 relative">
                                    <input
                                        type="number" inputMode="numeric" pattern="[0-9]*"
                                        value={getFeetInches(localData.height).ft}
                                        onChange={(e) => handleHeightFtChange("ft", e.target.value)}
                                        placeholder="5"
                                        className="w-full bg-[#1A1A24] border border-[#2A2A3A] rounded-[16px] h-[52px] pr-8 pl-2 text-center text-white font-['Bricolage_Grotesque'] font-bold text-[22px] focus:outline-none focus:border-[#FF6B35] transition-colors"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#60607A] font-bold">'</span>
                                </div>
                                <div className="flex-1 relative">
                                    <input
                                        type="number" inputMode="numeric" pattern="[0-9]*"
                                        value={getFeetInches(localData.height).in}
                                        onChange={(e) => handleHeightFtChange("in", e.target.value)}
                                        placeholder="9"
                                        className="w-full bg-[#1A1A24] border border-[#2A2A3A] rounded-[16px] h-[52px] pr-8 pl-2 text-center text-white font-['Bricolage_Grotesque'] font-bold text-[22px] focus:outline-none focus:border-[#FF6B35] transition-colors"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#60607A] font-bold">"</span>
                                </div>
                            </div>
                        )}

                        <div className="bg-[#1A1A24] border border-[#2A2A3A] rounded-[16px] p-1 flex h-[52px]">
                            <TapButton
                                onClick={() => handleHeightUnitToggle("cm")}
                                className={`px-4 flex items-center justify-center rounded-[12px] font-bold text-[13px] ${localData.heightUnit === "cm" ? "bg-[#FF6B35] text-white" : "text-[#60607A] hover:bg-[#22222F]"}`}
                            >CM</TapButton>
                            <TapButton
                                onClick={() => handleHeightUnitToggle("ft")}
                                className={`px-4 flex items-center justify-center rounded-[12px] font-bold text-[13px] ${localData.heightUnit === "ft" ? "bg-[#FF6B35] text-white" : "text-[#60607A] hover:bg-[#22222F]"}`}
                            >FT</TapButton>
                        </div>
                    </div>
                </div>

                {/* Gender */}
                <div>
                    <label className="block text-[#A0A0B8] text-[11px] font-bold uppercase mb-1 ml-1 tracking-wider">BIOLOGICAL SEX</label>
                    <p className="text-[10px] text-[#60607A] mb-2 ml-1">(Used only for metabolism calculation)</p>
                    <div className="flex gap-2">
                        <TapButton
                            onClick={() => setLocalData(prev => ({ ...prev, gender: "male" }))}
                            className={`flex-1 h-[52px] rounded-[16px] font-bold text-[14px] transition-colors ${localData.gender === "male" ? "bg-[#FF6B35] text-white" : "bg-[#1A1A24] border border-[#2A2A3A] text-[#A0A0B8] hover:bg-[#22222F]"}`}
                        >Male</TapButton>
                        <TapButton
                            onClick={() => setLocalData(prev => ({ ...prev, gender: "female" }))}
                            className={`flex-1 h-[52px] rounded-[16px] font-bold text-[14px] transition-colors ${localData.gender === "female" ? "bg-[#FF6B35] text-white" : "bg-[#1A1A24] border border-[#2A2A3A] text-[#A0A0B8] hover:bg-[#22222F]"}`}
                        >Female</TapButton>
                        <TapButton
                            onClick={() => setLocalData(prev => ({ ...prev, gender: "other" }))}
                            className={`flex-1 h-[52px] rounded-[16px] font-bold text-[14px] leading-tight transition-colors ${localData.gender === "other" ? "bg-[#FF6B35] text-white" : "bg-[#1A1A24] border border-[#2A2A3A] text-[#A0A0B8] hover:bg-[#22222F]"}`}
                        >Prefer not to say</TapButton>
                    </div>
                </div>

            </div>

            <div className="fixed bottom-0 left-0 w-full p-[20px] pb-[max(20px,env(safe-area-inset-bottom))] bg-[#0F0F14] z-50 flex flex-col border-t border-[#1A1A24]">
                <TapButton
                    onClick={onNext}
                    disabled={!data.age || !data.weight || !data.height}
                    className="w-full premium-btn"
                >
                    Continue
                </TapButton>
            </div>
        </div>
    );
}
