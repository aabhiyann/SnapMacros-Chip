"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { motion } from "framer-motion";
import { ChevronLeft, Check } from "lucide-react";

const MEAL_TYPES = [
    { label: "Breakfast", emoji: "🌅" },
    { label: "Lunch",     emoji: "☀️" },
    { label: "Dinner",    emoji: "🌙" },
    { label: "Snack",     emoji: "🍎" },
];

function autoMealType(): string {
    const hr = new Date().getHours();
    if (hr < 11) return "Breakfast";
    if (hr < 16) return "Lunch";
    if (hr < 22) return "Dinner";
    return "Snack";
}

interface MacroField {
    key: "calories" | "protein" | "carbs" | "fat";
    label: string;
    unit: string;
    color: string;
    bg: string;
    border: string;
    placeholder: string;
}

const MACRO_FIELDS: MacroField[] = [
    { key: "calories", label: "Calories", unit: "",  color: "#4F9EFF", bg: "rgba(79,158,255,0.08)",  border: "rgba(79,158,255,0.2)",  placeholder: "0"   },
    { key: "protein",  label: "Protein",  unit: "g", color: "#7C6FFF", bg: "rgba(124,111,255,0.08)", border: "rgba(124,111,255,0.2)", placeholder: "0g"  },
    { key: "carbs",    label: "Carbs",    unit: "g", color: "#34D8BC", bg: "rgba(52,216,188,0.08)",  border: "rgba(52,216,188,0.2)",  placeholder: "0g"  },
    { key: "fat",      label: "Fat",      unit: "g", color: "#FFC84A", bg: "rgba(255,200,74,0.08)",  border: "rgba(255,200,74,0.2)",  placeholder: "0g"  },
];

export default function LogPage() {
    const router = useRouter();

    const [name, setName]         = useState("");
    const [mealType, setMealType] = useState(autoMealType());
    const [macros, setMacros]     = useState({ calories: "", protein: "", carbs: "", fat: "" });
    const [saving, setSaving]     = useState(false);
    const [saved, setSaved]       = useState(false);
    const [error, setError]       = useState<string | null>(null);

    const isValid = name.trim().length > 0 && parseInt(macros.calories) > 0;

    const handleSave = async () => {
        if (!isValid) return;
        setSaving(true);
        setError(null);
        try {
            const res = await fetch(api("/api/log"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    food_name: name.trim(),
                    calories:  parseInt(macros.calories) || 0,
                    protein:   parseInt(macros.protein)  || 0,
                    carbs:     parseInt(macros.carbs)    || 0,
                    fat:       parseInt(macros.fat)      || 0,
                    meal_type: mealType.toLowerCase(),
                }),
            });
            if (!res.ok) throw new Error("Failed to save");
            setSaved(true);
            setTimeout(() => router.push("/dashboard"), 1200);
        } catch {
            setError("Couldn't save the meal. Please try again.");
            setSaving(false);
        }
    };

    return (
        <AppShell>
            {/* Fixed header */}
            <div className="fixed top-0 left-0 right-0 z-50 pt-[max(env(safe-area-inset-top),16px)] pb-4 px-5
                            bg-[rgba(9,9,15,0.92)] backdrop-blur-[20px] border-b border-white/[0.05] max-w-md mx-auto
                            flex items-center gap-3">
                <button
                    onClick={() => router.back()}
                    className="w-[40px] h-[40px] rounded-full bg-[#13131C] border border-[#2A2A3D] flex items-center justify-center shrink-0"
                >
                    <ChevronLeft size={20} className="text-white" />
                </button>
                <h1 className="font-['Bricolage_Grotesque'] text-[20px] font-bold text-white">
                    Log Manually
                </h1>
            </div>

            <div className="h-[80px]" />

            <div className="px-5 pb-[120px]">
                {/* Food name */}
                <div className="mb-6">
                    <label className="font-['DM_Sans'] text-[11px] font-bold uppercase tracking-widest text-[#56566F] mb-2 block">
                        Food Name
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g., Chicken Caesar Salad"
                        className="w-full h-[52px] bg-[#13131C] border border-[#2A2A3D] rounded-[14px] px-4 text-white font-['DM_Sans'] text-[16px] placeholder:text-[#56566F] focus:outline-none focus:border-[#4F9EFF] transition-colors"
                    />
                </div>

                {/* Meal type selector */}
                <div className="mb-6">
                    <label className="font-['DM_Sans'] text-[11px] font-bold uppercase tracking-widest text-[#56566F] mb-2 block">
                        Meal Type
                    </label>
                    <div className="flex gap-2">
                        {MEAL_TYPES.map(({ label, emoji }) => (
                            <button
                                key={label}
                                onClick={() => setMealType(label)}
                                className={`flex-1 py-3 rounded-[14px] font-['DM_Sans'] text-[12px] font-semibold border transition-all flex flex-col items-center gap-1 ${
                                    mealType === label
                                        ? "bg-[#4F9EFF]/15 border-[#4F9EFF]/40 text-[#4F9EFF]"
                                        : "bg-[#13131C] border-[#2A2A3D] text-[#56566F]"
                                }`}
                            >
                                <span>{emoji}</span>
                                <span>{label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Macro inputs */}
                <div className="mb-6">
                    <label className="font-['DM_Sans'] text-[11px] font-bold uppercase tracking-widest text-[#56566F] mb-3 block">
                        Macros
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {MACRO_FIELDS.map(m => (
                            <div
                                key={m.key}
                                className="rounded-[16px] p-4 border"
                                style={{ backgroundColor: m.bg, borderColor: m.border }}
                            >
                                <label className="font-['DM_Sans'] text-[10px] font-bold uppercase tracking-widest mb-2 block" style={{ color: m.color }}>
                                    {m.label}
                                </label>
                                <div className="flex items-end gap-1">
                                    <input
                                        type="number"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        value={macros[m.key]}
                                        onChange={e => setMacros(prev => ({ ...prev, [m.key]: e.target.value }))}
                                        placeholder="0"
                                        className="bg-transparent text-[28px] font-['Bricolage_Grotesque'] font-bold text-white outline-none w-full leading-none"
                                    />
                                    {m.unit && (
                                        <span className="text-[14px] font-['DM_Sans'] pb-0.5" style={{ color: m.color }}>
                                            {m.unit}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Calorie estimate helper */}
                {(parseInt(macros.protein) || 0) + (parseInt(macros.carbs) || 0) + (parseInt(macros.fat) || 0) > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-5 bg-[#13131C] border border-[#2A2A3D] rounded-[14px] px-4 py-3 flex items-center justify-between"
                    >
                        <span className="text-[#56566F] font-['DM_Sans'] text-[13px]">Estimated from macros</span>
                        <span className="text-white font-['DM_Sans'] font-semibold text-[13px]">
                            {Math.round(
                                (parseInt(macros.protein) || 0) * 4 +
                                (parseInt(macros.carbs)   || 0) * 4 +
                                (parseInt(macros.fat)     || 0) * 9
                            )} cal
                        </span>
                    </motion.div>
                )}

                {error && (
                    <p className="text-[#FF6B6B] text-[14px] font-['DM_Sans'] text-center mb-4">{error}</p>
                )}
            </div>

            {/* Fixed save button */}
            <div className="fixed bottom-0 left-0 right-0 z-50 px-5 pb-[max(env(safe-area-inset-bottom),20px)] pt-4
                            bg-[rgba(9,9,15,0.95)] border-t border-[#2A2A3D] max-w-md mx-auto">
                {saved ? (
                    <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="h-[56px] bg-[#34D8BC] rounded-[16px] flex items-center justify-center shadow-[0_4px_20px_rgba(52,216,188,0.3)]"
                    >
                        <Check size={26} className="text-[#09090F]" />
                    </motion.div>
                ) : (
                    <button
                        onClick={handleSave}
                        disabled={!isValid || saving}
                        className="w-full premium-btn disabled:opacity-40"
                    >
                        {saving ? "Saving..." : "Log This Meal"}
                    </button>
                )}
            </div>
        </AppShell>
    );
}
