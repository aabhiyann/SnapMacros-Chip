"use client";

import { useEffect, useState, useRef } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Chip } from "@/components/Chip";
import CountUp from "react-countup";
import confetti from "canvas-confetti";
import { Check, Edit2, CheckCircle, HelpCircle, AlertCircle, ChevronLeft } from "lucide-react";
import clsx from "clsx";
import Image from "next/image";
import { twMerge } from "tailwind-merge";
import { createClient } from "@/lib/supabase/client";
import { writeMealNutrition } from "@/lib/hooks/useHealthKit";

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
    detected_items?: string[];
    chip_reaction?: "hype" | "shocked" | "happy";
}

const LOADING_LINES = [
    "Analyzing your meal...",
    "Doing food science on this...",
    "Checking protein content...",
    "Almost there...",
];

const TRANSPARENT_PIXEL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

const MEAL_TYPES = [
    { label: "Breakfast", emoji: "🌅" },
    { label: "Lunch",     emoji: "☀️" },
    { label: "Dinner",    emoji: "🌙" },
    { label: "Snack",     emoji: "🍎" },
];

const MACRO_PILLS = [
    { key: "calories" as const, label: "Cal",     color: "#4F9EFF", bg: "rgba(79,158,255,0.12)",  border: "rgba(79,158,255,0.25)",  unit: ""  },
    { key: "protein"  as const, label: "Protein", color: "#7C6FFF", bg: "rgba(124,111,255,0.12)", border: "rgba(124,111,255,0.25)", unit: "g" },
    { key: "carbs"    as const, label: "Carbs",   color: "#34D8BC", bg: "rgba(52,216,188,0.12)",  border: "rgba(52,216,188,0.25)",  unit: "g" },
    { key: "fat"      as const, label: "Fat",     color: "#FFC84A", bg: "rgba(255,200,74,0.12)",  border: "rgba(255,200,74,0.25)",  unit: "g" },
];

function getSessionItem(key: string): string | null {
    try { return sessionStorage.getItem(key); } catch { return null; }
}
function removeSessionItem(key: string) {
    try { sessionStorage.removeItem(key); } catch { /* ignore */ }
}

function dataURLtoFile(dataurl: string, filename: string) {
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
}

async function uploadMealImage(dataUrl: string): Promise<string | null> {
    try {
        const supabase = createClient();
        const file = dataURLtoFile(dataUrl, `meal_${Date.now()}.jpg`);
        const path = `public/${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
        const { error } = await supabase.storage.from("meal_images").upload(path, file, { contentType: "image/jpeg", upsert: false });
        if (error) return null;
        const { data } = supabase.storage.from("meal_images").getPublicUrl(path);
        return data.publicUrl;
    } catch { return null; }
}

function autoMealType(): string {
    const hr = new Date().getHours();
    if (hr < 11) return "Breakfast";
    if (hr < 16) return "Lunch";
    if (hr < 22) return "Dinner";
    return "Snack";
}

// ── Loading Screen ─────────────────────────────────────────────────────────────
function LoadingScreen({ bgImage, loadingLineIdx, progress }: {
    bgImage: string | null;
    loadingLineIdx: number;
    progress: number;
}) {
    return (
        <main className="fixed inset-0 bg-[#09090F] flex flex-col items-center justify-center overflow-hidden">
            {bgImage && (
                <div
                    className="absolute inset-0 z-0 scale-110"
                    style={{
                        backgroundImage: `url(${bgImage})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        filter: "blur(28px) brightness(0.18) saturate(0.4)",
                    }}
                />
            )}
            <div className="z-10 flex flex-col items-center text-center">
                <motion.div
                    animate={{ scale: [1, 1.06, 1] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                    className="mb-8"
                >
                    <Chip emotion="thinking" size={130} />
                </motion.div>

                <div className="bg-[#13131C] border border-[#2A2A3D] rounded-[14px] px-5 py-3 mb-10 shadow-lg min-w-[220px]">
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={loadingLineIdx}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.35 }}
                            className="text-[14px] text-white font-['DM_Sans'] block"
                        >
                            {LOADING_LINES[loadingLineIdx]}
                        </motion.span>
                    </AnimatePresence>
                </div>

                <div className="w-[260px] h-[4px] bg-[#2A2A3D] rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-[#4F9EFF] to-[#7C6FFF]"
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: progress === 100 ? 0.2 : 5, ease: "easeOut" }}
                    />
                </div>
            </div>
        </main>
    );
}

// ── Error Screen ───────────────────────────────────────────────────────────────
function ErrorScreen({
    errorMessage,
    onLogManually,
    onRetry,
}: {
    errorMessage: string | null;
    onLogManually: () => void;
    onRetry: () => void;
}) {
    const router = useRouter();
    const isQuota = errorMessage?.toLowerCase().includes("limit") ?? false;

    return (
        <main className="min-h-screen bg-[#09090F] flex flex-col items-center justify-center px-5 pb-20">
            <Chip emotion="sad" size={120} className="drop-shadow-[0_0_24px_rgba(79,158,255,0.2)]" />
            <h2 className="mt-8 mb-3 font-['Bricolage_Grotesque'] text-[26px] font-bold text-white text-center tracking-tight">
                {isQuota ? "Daily AI limit reached" : "Chip couldn't read that one"}
            </h2>
            <p className="text-[#9898B3] mb-4 text-center text-[15px] font-['DM_Sans'] max-w-[260px] leading-relaxed">
                {isQuota
                    ? "You can still log this meal manually below."
                    : "Try a clearer photo or describe the meal instead."}
            </p>
            {errorMessage && !isQuota && (
                <p className="text-[#FF6B6B]/80 mb-5 text-center text-[12px] font-['DM_Sans'] max-w-[300px] break-words">
                    {errorMessage}
                </p>
            )}

            <div className="w-full max-w-[320px] space-y-3">
                <button
                    onClick={onLogManually}
                    className="w-full h-[56px] rounded-[16px] bg-[#34D8BC]/15 border border-[#34D8BC]/30 text-[#34D8BC] font-['DM_Sans'] font-semibold text-[16px] active:scale-[0.97] transition-transform"
                >
                    Log manually (no AI)
                </button>
                <button onClick={onRetry} className="w-full premium-btn">
                    Try Again
                </button>
                <button
                    onClick={() => router.push("/dashboard")}
                    className="w-full h-[48px] text-[#56566F] font-['DM_Sans'] text-[14px] active:text-white transition-colors"
                >
                    Back to Dashboard
                </button>
            </div>
        </main>
    );
}

// ── Log Success Overlay ────────────────────────────────────────────────────────
function LogSuccessOverlay() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[200] bg-[#09090F]/95 flex flex-col items-center justify-center pointer-events-none"
        >
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
            >
                <Chip emotion="hype" size={140} />
            </motion.div>
            <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="mt-6 font-['Bricolage_Grotesque'] font-bold text-[28px] text-white"
            >
                Logged! 🎉
            </motion.p>
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-[#9898B3] font-['DM_Sans'] text-[15px] mt-2"
            >
                Chip updated your rings.
            </motion.p>
        </motion.div>
    );
}

// ── Main Result Page ───────────────────────────────────────────────────────────
export default function ResultPage() {
    const router = useRouter();

    const [status, setStatus]           = useState<Status>("loading");
    const [bgImage, setBgImage]         = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [loadingLineIdx, setLoadingLineIdx] = useState(0);
    const [progress, setProgress]       = useState(0);
    const [data, setData]               = useState<AnalysisData | null>(null);
    const [multiplier, setMultiplier]   = useState(1);
    const [isEditing, setIsEditing]     = useState(false);
    const [manualMacros, setManualMacros] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
    const [mealType, setMealType]       = useState(autoMealType());
    const [isLogging, setIsLogging]     = useState(false);
    const [logSuccess, setLogSuccess]   = useState(false);

    const logBtnRef = useRef<HTMLButtonElement>(null);

    // ── Fetch analysis ──────────────────────────────────────────────────────────
    useEffect(() => {
        const imgData  = getSessionItem("snap_image");
        const textDesc = getSessionItem("snap_description");

        if (!imgData && !textDesc) { router.push("/snap"); return; }

        setBgImage(imgData || null);
        setProgress(75);

        const txtInt = setInterval(() => {
            setLoadingLineIdx(prev => (prev + 1) % LOADING_LINES.length);
        }, 1800);

        const abort = new AbortController();
        const timeout = setTimeout(() => abort.abort(), 20000);

        (async () => {
            try {
                const fd = new FormData();
                const finalImage = imgData || TRANSPARENT_PIXEL;
                fd.append("image", dataURLtoFile(finalImage, "upload.jpg"));
                if (textDesc) fd.append("portionHint", textDesc);

                const res = await fetch(api("/api/analyze"), {
                    method: "POST",
                    body: fd,
                    signal: abort.signal,
                });

                clearTimeout(timeout);
                const json = await res.json().catch(() => ({}));

                if (!res.ok) {
                    const code = (json as { code?: string }).code;
                    const raw  = (json as { error?: string }).error || "Analysis failed";
                    const msg  =
                        res.status === 429 || code === "QUOTA_EXCEEDED" || raw.toLowerCase().includes("quota")
                            ? "Daily AI limit reached. You can still log this meal manually below."
                            : raw;
                    setErrorMessage(msg);
                    clearInterval(txtInt);
                    setStatus("error");
                    return;
                }

                clearInterval(txtInt);
                setProgress(100);
                setTimeout(() => {
                    setData(json);
                    setManualMacros({
                        calories: json.calories ?? 0,
                        protein:  json.protein  ?? 0,
                        carbs:    json.carbs    ?? 0,
                        fat:      json.fat      ?? 0,
                    });
                    setMealType(autoMealType());
                    setStatus("success");
                }, 200);
            } catch (e) {
                clearTimeout(timeout);
                clearInterval(txtInt);
                setErrorMessage(e instanceof Error ? e.message : "Network error");
                setStatus("error");
            }
        })();

        return () => { clearTimeout(timeout); clearInterval(txtInt); abort.abort(); };
    }, [router]);

    // ── Log meal ────────────────────────────────────────────────────────────────
    const handleLogMeal = async () => {
        if (!data) return;
        setIsLogging(true);
        try {
            const res = await fetch(api("/api/log"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    food_name: data.food_name,
                    calories:  Math.round(manualMacros.calories * multiplier),
                    protein:   Math.round(manualMacros.protein  * multiplier),
                    carbs:     Math.round(manualMacros.carbs    * multiplier),
                    fat:       Math.round(manualMacros.fat      * multiplier),
                    meal_type: mealType.toLowerCase(),
                }),
            });
            if (!res.ok) throw new Error("Log failed");

            if (navigator.vibrate) navigator.vibrate([60, 30, 60]);

            // Write nutrition to Apple Health (no-op on web or if denied)
            writeMealNutrition({
                calories:  Math.round(manualMacros.calories * multiplier),
                proteinG:  Math.round(manualMacros.protein  * multiplier),
                carbsG:    Math.round(manualMacros.carbs    * multiplier),
                fatG:      Math.round(manualMacros.fat      * multiplier),
                mealName:  data.food_name,
            });

            // Confetti burst
            if (logBtnRef.current) {
                const rect = logBtnRef.current.getBoundingClientRect();
                const x = (rect.left + rect.width  / 2) / window.innerWidth;
                const y = (rect.top  + rect.height / 2) / window.innerHeight;
                confetti({ particleCount: 80, spread: 70, origin: { x, y }, colors: ["#4F9EFF", "#7C6FFF", "#34D8BC", "#FFC84A"] });
                setTimeout(() => confetti({ particleCount: 40, spread: 50, origin: { x, y: y - 0.1 }, colors: ["#4F9EFF", "#FFC84A"] }), 200);
            }

            setLogSuccess(true);
            setTimeout(() => {
                removeSessionItem("snap_image");
                removeSessionItem("snap_description");
                router.push("/dashboard");
            }, 1600);
        } catch {
            setIsLogging(false);
        }
    };

    // ── Manual log fallback ─────────────────────────────────────────────────────
    const handleLogManually = () => {
        const desc = getSessionItem("snap_description") || "My meal";
        const defaults = { calories: 400, protein: 25, carbs: 50, fat: 15 };
        setData({
            food_name: desc.slice(0, 40) || "My meal",
            ...defaults,
            confidence: "medium",
            reasoning: "Entered manually — edit macros below if needed.",
        });
        setManualMacros(defaults);
        setMealType(autoMealType());
        setStatus("success");
    };

    // ── Renders ─────────────────────────────────────────────────────────────────
    if (status === "loading") {
        return <LoadingScreen bgImage={bgImage} loadingLineIdx={loadingLineIdx} progress={progress} />;
    }

    if (status === "error") {
        return (
            <ErrorScreen
                errorMessage={errorMessage}
                onLogManually={handleLogManually}
                onRetry={() => router.push("/snap")}
            />
        );
    }

    if (!data) return null;

    const chipEmotion = logSuccess ? "hype" : (data.chip_reaction ?? (manualMacros.calories * multiplier > 900 ? "shocked" : "happy"));

    return (
        <>
            <AnimatePresence>{logSuccess && <LogSuccessOverlay />}</AnimatePresence>

            <main className="min-h-screen bg-[#09090F] flex flex-col text-white">

                {/* ── Photo panel ── */}
                <div className="relative h-[42vh] w-full flex-shrink-0">
                    {bgImage ? (
                        <>
                            {/* Blurred backdrop */}
                            <div
                                className="absolute inset-0"
                                style={{
                                    backgroundImage: `url(${bgImage})`,
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                    filter: "blur(0px) brightness(0.7)",
                                }}
                            />
                            {/* Sharp center image */}
                            <Image
                                src={bgImage}
                                fill
                                className="object-contain z-10 relative"
                                alt="Meal photo"
                                unoptimized
                                priority
                            />
                        </>
                    ) : (
                        <div className="w-full h-full bg-[#1C1C28] flex items-center justify-center">
                            <span className="text-[#56566F] font-['Bricolage_Grotesque'] font-bold text-xl tracking-widest uppercase">
                                Described Meal
                            </span>
                        </div>
                    )}

                    {/* Back button */}
                    <button
                        onClick={() => router.push("/snap")}
                        className="absolute top-[max(env(safe-area-inset-top),16px)] left-4 z-20 w-[40px] h-[40px] rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/10"
                        aria-label="Back"
                    >
                        <ChevronLeft size={20} className="text-white" />
                    </button>

                    {/* Detected items */}
                    {data.detected_items && data.detected_items.length > 0 && (
                        <div className="absolute bottom-14 left-4 right-4 z-20 flex flex-wrap gap-2">
                            {data.detected_items.slice(0, 3).map((item, i) => (
                                <motion.span
                                    key={i}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 + i * 0.06 }}
                                    className="bg-black/60 backdrop-blur-sm text-white text-[12px] px-3 py-1.5 rounded-[8px] font-['DM_Sans']"
                                >
                                    {item}
                                </motion.span>
                            ))}
                        </div>
                    )}

                    {/* Gradient overlap */}
                    <div className="absolute bottom-0 left-0 right-0 h-20 z-10"
                        style={{ background: "linear-gradient(to top, #09090F 0%, transparent 100%)" }} />
                </div>

                {/* ── Result card ── */}
                <div className="relative -mt-6 bg-[#09090F] rounded-t-[28px] flex-grow z-20 px-5 pt-5 pb-10">
                    {/* Drag handle */}
                    <div className="w-10 h-1 bg-[#2A2A3D] rounded-full mx-auto mb-5" />

                    {/* Title + confidence badge */}
                    <div className="flex items-start justify-between mb-3">
                        <motion.h2
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="font-['Bricolage_Grotesque'] text-[30px] leading-tight font-bold w-[62%] tracking-tight"
                        >
                            {data.food_name}
                        </motion.h2>
                        <div className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full shrink-0 mt-1 font-['DM_Sans'] text-[12px] font-semibold border",
                            data.confidence === "high"
                                ? "bg-[#34D8BC]/10 border-[#34D8BC]/25 text-[#34D8BC]"
                                : data.confidence === "medium"
                                    ? "bg-[#FFC84A]/10 border-[#FFC84A]/25 text-[#FFC84A]"
                                    : "bg-[#FF6B6B]/10 border-[#FF6B6B]/25 text-[#FF6B6B]"
                        )}>
                            {data.confidence === "high"
                                ? <><CheckCircle size={12} /> Confident</>
                                : data.confidence === "medium"
                                    ? <><HelpCircle size={12} /> Best Guess</>
                                    : <><AlertCircle size={12} /> Unsure</>}
                        </div>
                    </div>

                    <p className="text-[13px] text-[#56566F] italic mb-5 font-['DM_Sans'] leading-snug">
                        {data.reasoning}
                    </p>

                    {/* ── Macro pills (horizontal scroll) ── */}
                    <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden -mx-5 px-5 mb-5">
                        <div className="flex gap-3 pb-1" style={{ minWidth: "max-content" }}>
                            {MACRO_PILLS.map((m) => {
                                const raw = manualMacros[m.key];
                                const display = Math.round(raw * multiplier);
                                return (
                                    <div
                                        key={m.key}
                                        className="flex flex-col items-center rounded-[18px] px-5 py-4 min-w-[90px] border"
                                        style={{ backgroundColor: m.bg, borderColor: m.border }}
                                    >
                                        <span className="font-['DM_Sans'] text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: m.color }}>
                                            {m.label}
                                        </span>
                                        {isEditing ? (
                                            <input
                                                type="number"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                value={raw}
                                                onChange={e => setManualMacros(prev => ({ ...prev, [m.key]: Number(e.target.value) }))}
                                                className="bg-transparent text-[28px] font-['Bricolage_Grotesque'] font-bold text-white outline-none w-[70px] text-center"
                                            />
                                        ) : (
                                            <span className="text-[28px] font-['Bricolage_Grotesque'] font-bold text-white leading-none">
                                                <CountUp preserveValue duration={0.3} end={display} />
                                                {m.unit}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}

                            {/* Fiber & sugar bonus pills */}
                            {data.fiber !== undefined && (
                                <div className="flex flex-col items-center rounded-[18px] px-4 py-4 min-w-[80px] border bg-white/[0.04] border-white/[0.08]">
                                    <span className="font-['DM_Sans'] text-[10px] font-bold uppercase tracking-widest text-[#56566F] mb-2">Fiber</span>
                                    <span className="text-[22px] font-['Bricolage_Grotesque'] font-bold text-white/70 leading-none">
                                        {Math.round(data.fiber * multiplier)}g
                                    </span>
                                </div>
                            )}
                            {data.sugar !== undefined && (
                                <div className="flex flex-col items-center rounded-[18px] px-4 py-4 min-w-[80px] border bg-white/[0.04] border-white/[0.08]">
                                    <span className="font-['DM_Sans'] text-[10px] font-bold uppercase tracking-widest text-[#56566F] mb-2">Sugar</span>
                                    <span className="text-[22px] font-['Bricolage_Grotesque'] font-bold text-white/70 leading-none">
                                        {Math.round(data.sugar * multiplier)}g
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Portion slider ── */}
                    {!isEditing && (
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <span className="font-['DM_Sans'] text-[11px] font-bold uppercase tracking-widest text-[#56566F]">
                                    Portion
                                </span>
                                <span className="font-['DM_Sans'] text-[13px] font-bold text-white">
                                    {multiplier === 0.25 ? "¼" : multiplier === 0.5 ? "½" : multiplier === 0.75 ? "¾" : multiplier === 1.5 ? "1½" : multiplier === 1.75 ? "1¾" : multiplier}×
                                </span>
                            </div>
                            <input
                                type="range"
                                min={0.25}
                                max={3}
                                step={0.25}
                                value={multiplier}
                                onChange={e => setMultiplier(parseFloat(e.target.value))}
                                className="w-full accent-[#4F9EFF] cursor-pointer"
                                style={{ height: "4px" }}
                            />
                            <div className="flex justify-between mt-1">
                                <span className="text-[10px] text-[#56566F] font-['DM_Sans']">¼×</span>
                                <span className="text-[10px] text-[#56566F] font-['DM_Sans']">3×</span>
                            </div>
                        </div>
                    )}

                    {/* ── Chip reaction row ── */}
                    <div className="flex items-center gap-3 bg-[#13131C] border border-[#2A2A3D] rounded-[20px] p-4 mb-6">
                        <Chip emotion={chipEmotion} size={72} />
                        <div className="flex-1 bg-[#09090F] rounded-[14px] p-3 border border-[#2A2A3D] relative">
                            <div className="absolute top-1/2 -left-[7px] -translate-y-1/2 w-3 h-3 bg-[#09090F] border-l border-b border-[#2A2A3D] rotate-45" />
                            <p className="text-[13px] text-[#9898B3] font-['DM_Sans'] italic leading-snug relative z-10">
                                {logSuccess
                                    ? "Logged! The rings are getting fed."
                                    : manualMacros.calories * multiplier > 900
                                        ? "That&apos;s a hefty one. No judgment."
                                        : "Solid choice. Chip approves."}
                            </p>
                        </div>
                    </div>

                    {/* ── Meal type selector ── */}
                    <div className="mb-6">
                        <span className="font-['DM_Sans'] text-[11px] font-bold uppercase tracking-widest text-[#56566F] mb-3 block">
                            Add to
                        </span>
                        <div className="flex gap-2">
                            {MEAL_TYPES.map(({ label, emoji }) => (
                                <button
                                    key={label}
                                    onClick={() => setMealType(label)}
                                    className={cn(
                                        "flex-1 py-2.5 rounded-[14px] font-['DM_Sans'] text-[12px] font-semibold border transition-all flex flex-col items-center gap-1",
                                        mealType === label
                                            ? "bg-[#4F9EFF]/15 border-[#4F9EFF]/40 text-[#4F9EFF]"
                                            : "bg-[#13131C] border-[#2A2A3D] text-[#56566F]"
                                    )}
                                >
                                    <span>{emoji}</span>
                                    <span>{label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── AI disclaimer ── */}
                    <p className="text-[11px] text-[#56566F] font-['DM_Sans'] text-center leading-relaxed mb-4">
                        Estimates generated by AI · for informational use only · not medical advice
                    </p>

                    {/* ── Actions ── */}
                    <div className="flex flex-col gap-3">
                        {logSuccess ? (
                            <motion.div
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                className="h-[56px] bg-[#34D8BC] rounded-[16px] flex items-center justify-center shadow-[0_4px_20px_rgba(52,216,188,0.3)]"
                            >
                                <Check size={28} className="text-[#09090F]" />
                            </motion.div>
                        ) : (
                            <motion.button
                                ref={logBtnRef}
                                whileTap={{ scale: 0.97 }}
                                onClick={isEditing ? () => setIsEditing(false) : handleLogMeal}
                                disabled={isLogging}
                                className="w-full premium-btn"
                            >
                                {isLogging ? "Logging..." : isEditing ? "Save Changes" : "Log This Meal 🍽️"}
                            </motion.button>
                        )}

                        {!logSuccess && !isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                disabled={isLogging}
                                className="w-full h-[44px] rounded-[14px] text-[#56566F] hover:text-white font-['DM_Sans'] text-[14px] font-medium flex items-center justify-center gap-2 transition-colors"
                            >
                                <Edit2 size={14} /> Edit Macros
                            </button>
                        )}
                    </div>
                </div>
            </main>
        </>
    );
}
