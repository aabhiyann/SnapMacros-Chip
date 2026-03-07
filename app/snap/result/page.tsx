"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Chip } from "@/components/Chip";
import CountUp from "react-countup";
import confetti from "canvas-confetti";
import { Check, Edit2 } from "lucide-react";
import clsx from "clsx";
import Image from "next/image";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

type Status = "loading" | "success" | "error";

interface AnalysisData {
    food_name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    confidence: "high" | "medium" | "low";
    reasoning: string;
    fiber?: number;
    sugar?: number;
}

const LOADING_LINES = [
    "Analyzing your meal...",
    "Doing food science on this...",
    "Checking protein content...",
    "Almost there...",
];

// Fallback 1x1 transparent pixel for text-only analysis
const TRANSPARENT_PIXEL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

function dataURLtoFile(dataurl: string, filename: string) {
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
}

export default function ResultPage() {
    const router = useRouter();

    const [status, setStatus] = useState<Status>("loading");
    const [bgImage, setBgImage] = useState<string | null>(null);

    // Loading State
    const [loadingLineIdx, setLoadingLineIdx] = useState(0);
    const [progress, setProgress] = useState(0);

    // Data State
    const [data, setData] = useState<AnalysisData | null>(null);

    // Success Mode State
    const [multiplier, setMultiplier] = useState(1);
    const [isEditing, setIsEditing] = useState(false);
    const [manualMacros, setManualMacros] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
    const [mealType, setMealType] = useState<string>("Lunch");
    const [isLogging, setIsLogging] = useState(false);
    const [logSuccess, setLogSuccess] = useState(false);

    const logBtnRef = useRef<HTMLButtonElement>(null);

    // Initialize
    useEffect(() => {
        const imgData = sessionStorage.getItem("snap_image");
        const textDesc = sessionStorage.getItem("snap_description");

        if (!imgData && !textDesc) {
            router.push("/snap");
            return;
        }

        setBgImage(imgData || null);

        // Progression faker
        let prog = 0;
        const progInt = setInterval(() => {
            prog += 5;
            if (prog <= 82) setProgress(prog);
        }, 250);

        const txtInt = setInterval(() => {
            setLoadingLineIdx((prev) => (prev + 1) % LOADING_LINES.length);
        }, 1800);

        const performAnalysis = async () => {
            try {
                const formData = new FormData();
                const finalImage = imgData || TRANSPARENT_PIXEL;
                const file = dataURLtoFile(finalImage, "upload.jpg");
                formData.append("image", file);
                if (textDesc) formData.append("portionHint", textDesc);

                const res = await fetch("/api/analyze", {
                    method: "POST",
                    body: formData,
                });

                if (!res.ok) throw new Error("API FAILED");

                const json = await res.json();

                clearInterval(progInt);
                clearInterval(txtInt);
                setProgress(100);

                setTimeout(() => {
                    setData(json);
                    setManualMacros({
                        calories: json.calories,
                        protein: json.protein,
                        carbs: json.carbs,
                        fat: json.fat
                    });

                    // Auto Meal Type
                    const hr = new Date().getHours();
                    if (hr < 11) setMealType("Breakfast");
                    else if (hr < 16) setMealType("Lunch");
                    else if (hr < 22) setMealType("Dinner");
                    else setMealType("Snack");

                    setStatus("success");
                }, 400);

            } catch (e) {
                clearInterval(progInt);
                clearInterval(txtInt);
                setStatus("error");
            }
        };

        performAnalysis();

        return () => {
            clearInterval(progInt);
            clearInterval(txtInt);
        };
    }, [router]);

    // LOG ACTION
    const handleLogMeal = async () => {
        if (!data) return;
        setIsLogging(true);
        try {
            const finalPayload = {
                food_name: data.food_name,
                calories: Math.round(manualMacros.calories * multiplier),
                protein: Math.round(manualMacros.protein * multiplier),
                carbs: Math.round(manualMacros.carbs * multiplier),
                fat: Math.round(manualMacros.fat * multiplier),
            };

            const res = await fetch("/api/log", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(finalPayload),
            });

            if (!res.ok) throw new Error("Log failed");

            setLogSuccess(true);
            if (navigator.vibrate) navigator.vibrate([50, 30, 50]);

            if (logBtnRef.current) {
                const rect = logBtnRef.current.getBoundingClientRect();
                const x = (rect.left + rect.width / 2) / window.innerWidth;
                const y = (rect.top + rect.height / 2) / window.innerHeight;
                confetti({
                    particleCount: 20,
                    spread: 60,
                    origin: { x, y },
                    colors: ["#FF6B35", "#2DD4BF", "#6C63FF", "#FBBF24"]
                });
            }

            setTimeout(() => {
                sessionStorage.removeItem("snap_image");
                sessionStorage.removeItem("snap_description");
                router.push("/dashboard");
            }, 1200);

        } catch (e) {
            console.error(e);
            setIsLogging(false);
        }
    };

    if (status === "loading") {
        return (
            <main className="fixed inset-0 bg-[#0F0F14] flex flex-col items-center justify-center overflow-hidden">
                {bgImage && (
                    <div
                        className="absolute inset-0 z-0 opacity-20 scale-110"
                        style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(24px) brightness(0.2)' }}
                    />
                )}
                <div className="z-10 flex flex-col items-center justify-center text-center">
                    <motion.div
                        animate={{ scale: [1, 1.06, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        className="mb-8"
                    >
                        <Chip emotion="thinking" size={130} />
                    </motion.div>

                    <div className="bg-[#22222F] border border-[#2A2A3A] rounded-[14px] px-4 py-2 mb-12 shadow-[0_8px_32px_rgba(0,0,0,0.50)]">
                        <AnimatePresence mode="wait">
                            <motion.span
                                key={loadingLineIdx}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className="text-[14px] text-white font-['DM_Sans']"
                            >
                                {LOADING_LINES[loadingLineIdx]}
                            </motion.span>
                        </AnimatePresence>
                    </div>

                    <div className="w-[260px] h-[5px] bg-[#2A2A3A] rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-[#FF6B35]"
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                        />
                    </div>
                </div>
            </main>
        );
    }

    if (status === "error") {
        return (
            <main className="min-h-screen bg-[#0F0F14] flex flex-col items-center justify-center px-[20px] pb-[72px]">
                <Chip emotion="sad" size={120} />
                <h2 className="mt-8 mb-3 font-['Bricolage_Grotesque'] text-[28px] font-bold text-white text-center">
                    Chip couldn't figure that one out.
                </h2>
                <p className="text-[#A0A0B8] mb-12 text-center text-[16px] font-['DM_Sans'] px-4">
                    Try a clearer photo or describe the meal.
                </p>

                <button
                    onClick={() => router.push("/snap")}
                    className="w-full max-w-[300px] h-[56px] rounded-[14px] bg-[#FF6B35] text-white font-['DM_Sans'] font-semibold text-[16px] mb-4"
                >
                    Try Again &rarr;
                </button>
                <button
                    onClick={() => router.push("/snap")}
                    className="w-full max-w-[300px] h-[56px] rounded-[14px] bg-[#22222F] text-white font-['DM_Sans'] font-semibold text-[16px]"
                >
                    Describe Instead
                </button>
            </main>
        );
    }

    // SUCCESS STATE
    if (!data) return null;

    return (
        <main className="min-h-screen bg-[#0F0F14] flex flex-col relative text-white">
            {/* Photo Panel (Top 45%) */}
            <div className="relative h-[45vh] w-full">
                {bgImage ? (
                    <Image src={bgImage} fill className="object-cover" alt="Meal scan" unoptimized />
                ) : (
                    <div className="w-full h-full bg-[#1A1A24] flex items-center justify-center">
                        <span className="text-[#60607A] font-['Bricolage_Grotesque'] font-bold text-xl uppercase tracking-widest">Described Meal</span>
                    </div>
                )}
                {/* Gradient into card */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#1A1A24] to-transparent z-10" />
            </div>

            {/* Result Card (Bottom 65% Overlapping) */}
            <div className="relative -mt-[10vh] bg-[#1A1A24] rounded-t-[28px] flex-grow shadow-[0_-8px_32px_rgba(0,0,0,0.50)] z-20 px-[20px] pt-4 pb-8 flex flex-col">
                {/* Drag handle */}
                <div className="w-[40px] h-[4px] bg-[#2A2A3A] rounded-full mx-auto mb-6" />

                {/* Title & Badge */}
                <div className="flex justify-between items-start mb-2">
                    <h2 className="font-['Bricolage_Grotesque'] text-[28px] leading-tight font-bold w-2/3">
                        {data.food_name}
                    </h2>
                    <div className={cn(
                        "text-[10px] font-bold uppercase py-1.5 px-3 rounded-full shrink-0 mt-1",
                        data.confidence === "high" ? "bg-[#2DD4BF]/20 text-[#2DD4BF]" :
                            data.confidence === "medium" ? "bg-[#FBBF24]/20 text-[#FBBF24]" :
                                "bg-[#F87171]/20 text-[#F87171]"
                    )}>
                        {data.confidence === "high" ? "✓ Confident" :
                            data.confidence === "medium" ? "~ Best Guess" :
                                "⚠️ Unsure"}
                    </div>
                </div>

                {/* Fun Note */}
                <p className="text-[14px] text-[#A0A0B8] italic mb-6 font-['DM_Sans']">
                    {data.reasoning}
                </p>

                {/* Macro Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    {/* Cal */}
                    <div className="bg-[#FF6B35]/10 border border-[#FF6B35]/30 rounded-[16px] p-4 flex flex-col">
                        <span className="text-[#FF6B35] font-['DM_Sans'] text-[11px] font-bold uppercase mb-1">🔥 Calories</span>
                        {isEditing ? (
                            <input type="number" value={manualMacros.calories} onChange={e => setManualMacros({ ...manualMacros, calories: Number(e.target.value) })} className="bg-transparent text-[36px] font-['Bricolage_Grotesque'] font-bold text-white outline-none w-full" />
                        ) : (
                            <span className="text-[36px] leading-none font-['Bricolage_Grotesque'] font-bold text-white">
                                <CountUp preserveValue duration={0.6} end={Math.round(manualMacros.calories * multiplier)} />
                            </span>
                        )}
                    </div>
                    {/* Pro */}
                    <div className="bg-[#6C63FF]/10 border border-[#6C63FF]/30 rounded-[16px] p-4 flex flex-col">
                        <span className="text-[#6C63FF] font-['DM_Sans'] text-[11px] font-bold uppercase mb-1">🥩 Protein</span>
                        {isEditing ? (
                            <input type="number" value={manualMacros.protein} onChange={e => setManualMacros({ ...manualMacros, protein: Number(e.target.value) })} className="bg-transparent text-[36px] font-['Bricolage_Grotesque'] font-bold text-white outline-none w-full" />
                        ) : (
                            <span className="text-[36px] leading-none font-['Bricolage_Grotesque'] font-bold text-white">
                                <CountUp preserveValue duration={0.6} end={Math.round(manualMacros.protein * multiplier)} />g
                            </span>
                        )}
                    </div>
                    {/* Car */}
                    <div className="bg-[#2DD4BF]/10 border border-[#2DD4BF]/30 rounded-[16px] p-4 flex flex-col">
                        <span className="text-[#2DD4BF] font-['DM_Sans'] text-[11px] font-bold uppercase mb-1">🍞 Carbs</span>
                        {isEditing ? (
                            <input type="number" value={manualMacros.carbs} onChange={e => setManualMacros({ ...manualMacros, carbs: Number(e.target.value) })} className="bg-transparent text-[36px] font-['Bricolage_Grotesque'] font-bold text-white outline-none w-full" />
                        ) : (
                            <span className="text-[36px] leading-none font-['Bricolage_Grotesque'] font-bold text-white">
                                <CountUp preserveValue duration={0.6} end={Math.round(manualMacros.carbs * multiplier)} />g
                            </span>
                        )}
                    </div>
                    {/* Fat */}
                    <div className="bg-[#FBBF24]/10 border border-[#FBBF24]/30 rounded-[16px] p-4 flex flex-col">
                        <span className="text-[#FBBF24] font-['DM_Sans'] text-[11px] font-bold uppercase mb-1">🥑 Fat</span>
                        {isEditing ? (
                            <input type="number" value={manualMacros.fat} onChange={e => setManualMacros({ ...manualMacros, fat: Number(e.target.value) })} className="bg-transparent text-[36px] font-['Bricolage_Grotesque'] font-bold text-white outline-none w-full" />
                        ) : (
                            <span className="text-[36px] leading-none font-['Bricolage_Grotesque'] font-bold text-white">
                                <CountUp preserveValue duration={0.6} end={Math.round(manualMacros.fat * multiplier)} />g
                            </span>
                        )}
                    </div>
                </div>

                {/* Portion Size */}
                {!isEditing && (
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[#A0A0B8] text-[11px] font-bold uppercase">PORTION SIZE</span>
                            <span className="text-[#60607A] text-[13px] italic">1 serving (est. ~450g)</span>
                        </div>
                        <div className="flex gap-2">
                            {[0.5, 1, 1.5, 2].map((m) => (
                                <button
                                    key={m}
                                    onClick={() => setMultiplier(m)}
                                    className={cn(
                                        "flex-1 py-2 rounded-[12px] font-['DM_Sans'] text-[14px] font-semibold border transition-colors",
                                        multiplier === m
                                            ? "bg-[#FF6B35] border-[#FF6B35] text-white shadow-[0_0_24px_rgba(255,107,53,0.35)]"
                                            : "bg-[#22222F] border-[#2A2A3A] text-[#A0A0B8] hover:bg-[#2A2A3A]"
                                    )}
                                >
                                    {m === 0.5 ? "½" : m === 1.5 ? "1½" : m} ×
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Chip Reaction Row */}
                <div className="flex items-center gap-4 bg-[#22222F] rounded-[20px] p-4 mb-6 relative overflow-hidden ring-1 ring-[#2A2A3A]">
                    <Chip emotion={data.calories * multiplier > 900 ? "shocked" : "hype"} size={80} />
                    <div className="flex-1 bg-[#1A1A24] rounded-[14px] p-3 border border-[#2A2A3A] relative">
                        <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-4 h-4 bg-[#1A1A24] border-l border-b border-[#2A2A3A] rotate-45" />
                        <p className="text-[14px] text-[#FFFFFF] font-['DM_Sans'] relative z-10 leading-snug">
                            {data.calories * multiplier > 900 ? "Wait, are you sure?" : "Perfect addition to the rings."}
                        </p>
                    </div>
                </div>

                {/* Meal Type Scroll */}
                <div className="pb-6 w-full overflow-x-auto select-none [&::-webkit-scrollbar]:hidden">
                    <div className="flex gap-6 px-1">
                        {["🌅 Breakfast", "☀️ Lunch", "🌙 Dinner", "🍎 Snack"].map((opt) => {
                            const baseOpt = opt.split(" ")[1];
                            const isActive = mealType === baseOpt;
                            return (
                                <button
                                    key={opt}
                                    onClick={() => setMealType(baseOpt)}
                                    className={cn(
                                        "whitespace-nowrap pb-2 text-[16px] font-['DM_Sans'] transition-all",
                                        isActive ? "text-[#FF6B35] font-semibold border-b-2 border-[#FF6B35]" : "text-[#60607A] border-b-2 border-transparent"
                                    )}
                                >
                                    {opt}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 mt-auto">
                    {logSuccess ? (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="h-[56px] bg-[#2DD4BF] rounded-[14px] flex items-center justify-center shadow-[0_0_20px_rgba(45,212,191,0.30)]"
                        >
                            <Check size={28} className="text-[#0F0F14]" />
                        </motion.div>
                    ) : (
                        <motion.button
                            ref={logBtnRef}
                            whileTap={{ scale: 0.96 }}
                            onClick={isEditing ? () => setIsEditing(false) : handleLogMeal}
                            disabled={isLogging}
                            className="w-full h-[56px] rounded-[14px] bg-[#FF6B35] text-white font-['DM_Sans'] text-[16px] font-semibold flex items-center justify-center opacity-100 disabled:opacity-50 transition-opacity"
                        >
                            {isLogging ? "Logging..." : isEditing ? "Save Changes" : "Log This Meal 🍽️"}
                        </motion.button>
                    )}

                    {!logSuccess && !isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            disabled={isLogging}
                            className="w-full h-[40px] rounded-[14px] text-[#A0A0B8] hover:text-white font-['DM_Sans'] text-[14px] font-medium flex items-center justify-center gap-2"
                        >
                            <Edit2 size={14} /> Edit Macros
                        </button>
                    )}
                </div>

            </div>
        </main>
    );
}
