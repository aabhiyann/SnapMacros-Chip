"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { AppShell } from "@/components/AppShell";
import { Chip, ChipEmotion } from "@/components/Chip";
import { MacroRings } from "@/components/MacroRings";
import { MealTimeline } from "@/components/MealTimeline";
import { motion } from "framer-motion";
import { Flame, Camera, UtensilsCrossed } from "lucide-react";
import { useRouter } from "next/navigation";

interface DashboardLog {
    id: string;
    description: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    created_at: string;
    image_url?: string;
    meal_type?: string;
    [key: string]: unknown;
}

interface DashboardData {
    logs: DashboardLog[];
    current: { calories: number; protein: number; carbs: number; fat: number };
    targets: { calories: number; protein: number; carbs: number; fat: number };
    chip: { emotion: ChipEmotion; message: string };
    profile: { email: string; name: string; streak_days: number; [key: string]: unknown };
    [key: string]: unknown;
}

function timeGreeting() {
    const hr = new Date().getHours();
    if (hr < 12) return "Good morning";
    if (hr < 18) return "Good afternoon";
    return "Good evening";
}

function timeEmoji() {
    const hr = new Date().getHours();
    if (hr < 6)  return "🌙";
    if (hr < 12) return "☀️";
    if (hr < 17) return "🌤️";
    if (hr < 20) return "🌆";
    return "🌙";
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function DashboardSkeleton() {
    return (
        <AppShell>
            <style jsx global>{`
                @keyframes shimmer { 100% { transform: translateX(100%); } }
                .shimmer { position: relative; overflow: hidden; }
                .shimmer::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    transform: translateX(-100%);
                    animation: shimmer 1.4s infinite;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
                }
            `}</style>
            <div className="h-[88px]" />
            <div className="px-5 mb-6 flex items-center gap-4">
                <div className="w-24 h-24 rounded-full bg-[#1C1C28] shrink-0 shimmer" />
                <div className="flex-1 bg-[#13131C] rounded-[16px] h-[72px] border border-[#2A2A3D] shimmer" />
            </div>
            <div className="flex flex-col items-center gap-5 mb-6 px-5">
                <div className="w-[200px] h-[200px] rounded-full bg-[#13131C] shimmer" />
                <div className="flex gap-6">
                    {[0,1,2].map(i => <div key={i} className="w-[72px] h-[90px] rounded-2xl bg-[#13131C] shimmer" />)}
                </div>
            </div>
            <div className="px-5 space-y-3">
                {[1,2,3].map(i => (
                    <div key={i} className="h-[68px] bg-[#13131C] rounded-2xl border border-[#2A2A3D] shimmer" />
                ))}
            </div>
        </AppShell>
    );
}

// ── Empty State ───────────────────────────────────────────────────────────────
function EmptyMealsState({ onSnap }: { onSnap: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col items-center py-10 px-6 text-center"
        >
            <Chip emotion="happy" size={88} className="mb-4 drop-shadow-[0_0_20px_rgba(79,158,255,0.2)]" />
            <h3 className="font-['Bricolage_Grotesque'] text-[20px] font-bold text-white mb-2">
                Nothing logged yet
            </h3>
            <p className="font-['DM_Sans'] text-[14px] text-[#9898B3] mb-6 max-w-[220px]">
                Snap your first meal and Chip will break down the macros instantly.
            </p>
            <button
                onClick={onSnap}
                className="premium-btn px-8 flex items-center gap-2"
            >
                <Camera size={18} />
                Snap a Meal
            </button>
        </motion.div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function DashboardPage() {
    const router = useRouter();
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showDemoBanner, setShowDemoBanner] = useState(true);

    const fetchDashboardData = async () => {
        try {
            const res = await fetch(api("/api/dashboard"));
            if (!res.ok) throw new Error("Failed to fetch");
            setData(await res.json());
        } catch {
            setError("Unable to load dashboard data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchDashboardData(); }, []);

    const handleDeleteLog = async (id: string) => {
        if (!data) return;
        const prev = [...data.logs];
        const target = prev.find(l => l.id === id);
        if (!target) return;

        setData({
            ...data,
            logs: prev.filter(l => l.id !== id),
            current: {
                calories: Math.max(0, data.current.calories - target.calories),
                protein:  Math.max(0, data.current.protein  - target.protein),
                carbs:    Math.max(0, data.current.carbs    - target.carbs),
                fat:      Math.max(0, data.current.fat      - target.fat),
            }
        });

        try {
            const res = await fetch(api(`/api/log?id=${id}`), { method: "DELETE" });
            if (!res.ok) throw new Error();
            fetchDashboardData();
        } catch {
            setData({ ...data, logs: prev });
        }
    };

    if (isLoading) return <DashboardSkeleton />;

    if (error || !data) {
        return (
            <AppShell>
                <div className="flex flex-col items-center justify-center pt-32 px-6 text-center">
                    <Chip emotion="sad" size={100} />
                    <h2 className="text-white mt-6 mb-2 text-[22px] font-bold font-['Bricolage_Grotesque']">Oops.</h2>
                    <p className="text-[#9898B3] mb-6 font-['DM_Sans'] text-[15px]">{error}</p>
                    <button onClick={fetchDashboardData} className="premium-btn px-8">Retry</button>
                </div>
            </AppShell>
        );
    }

    const streak = data.profile.streak_days ?? 0;
    const firstName = data.profile.name?.split(" ")[0] || "Athlete";
    const chipEmotion = data.current.calories > data.targets.calories + 50 ? "shocked" : data.chip.emotion;
    const caloriesRemaining = Math.max(data.targets.calories - data.current.calories, 0);
    const isDemo = data.profile?.email === "demo@snapmacros.app";

    return (
        <AppShell>
            {/* Demo banner */}
            {isDemo && showDemoBanner && (
                <div className="bg-[#4F9EFF]/10 border-b border-[#4F9EFF]/20 px-4 py-2 flex items-center justify-between">
                    <p className="text-[#4F9EFF] text-[13px] flex-1 text-center font-['DM_Sans']">
                        👀 Demo mode — snap any food to try it out!
                    </p>
                    <button onClick={() => setShowDemoBanner(false)} className="text-[#4F9EFF] p-1 font-bold text-[16px] leading-none">✕</button>
                </div>
            )}

            {/* ── Fixed frosted header ── */}
            <div className="fixed top-0 left-0 right-0 z-50 pt-[max(env(safe-area-inset-top),16px)] pb-4 px-5
                            bg-[rgba(9,9,15,0.88)] backdrop-blur-[20px] border-b border-white/[0.05]
                            flex justify-between items-center max-w-md mx-auto">
                <div>
                    <span className="text-[#56566F] text-[12px] font-medium font-['DM_Sans']">
                        {timeEmoji()} {timeGreeting()}
                    </span>
                    <h1 className="text-[24px] font-bold font-['Bricolage_Grotesque'] tracking-tight text-white leading-tight">
                        {firstName}
                    </h1>
                </div>
                {/* Streak pill */}
                <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 border ${
                    streak >= 7
                        ? "bg-[#FFC84A]/15 border-[#FFC84A]/30 shadow-[0_0_12px_rgba(255,200,74,0.2)]"
                        : streak > 0
                            ? "bg-[#4F9EFF]/10 border-[#4F9EFF]/25"
                            : "bg-white/5 border-white/10"
                }`}>
                    <Flame size={14} className={streak > 0 ? (streak >= 7 ? "text-[#FFC84A]" : "text-[#4F9EFF]") : "text-[#56566F]"} strokeWidth={2.5} />
                    <span className={`text-[13px] font-bold font-['DM_Sans'] ${
                        streak > 0 ? (streak >= 7 ? "text-[#FFC84A]" : "text-[#4F9EFF]") : "text-[#56566F]"
                    }`}>{streak}</span>
                </div>
            </div>
            <div className="h-[88px]" />

            {/* ── Streak glass banner (7+ days) ── */}
            {streak >= 7 && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mx-5 mb-5 rounded-[18px] px-5 py-4 flex items-center gap-3
                               bg-gradient-to-r from-[#FFC84A]/10 to-[#FF6B6B]/5
                               border border-[#FFC84A]/25 backdrop-blur-sm"
                >
                    <span className="text-[28px] leading-none">🔥</span>
                    <div>
                        <p className="font-['Bricolage_Grotesque'] font-bold text-[16px] text-white leading-tight">
                            {streak}-day streak!
                        </p>
                        <p className="font-['DM_Sans'] text-[12px] text-[#FFC84A]/80 mt-0.5">
                            You&apos;re on fire. Don&apos;t break it.
                        </p>
                    </div>
                </motion.div>
            )}

            {/* ── Chip speech row ── */}
            <div className="px-5 mb-6 flex items-center gap-4 min-h-[104px]">
                <motion.div
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 280, damping: 22, delay: 0.25 }}
                    className="shrink-0"
                >
                    <Chip emotion={chipEmotion} size={96} />
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.65, duration: 0.3 }}
                    className="flex-1 bg-[#13131C] border border-[#2A2A3D] rounded-[16px] p-4 relative"
                >
                    <div className="absolute top-1/2 -left-[6px] -translate-y-1/2 w-3 h-3 bg-[#13131C] border-l border-b border-[#2A2A3D] rotate-45" />
                    <p className="font-['DM_Sans'] text-[14px] text-[#9898B3] italic leading-snug relative z-10">
                        &ldquo;{data.current.calories > data.targets.calories + 50
                            ? "Went a bit over today. Tomorrow is what matters."
                            : data.chip.message}&rdquo;
                    </p>
                </motion.div>
            </div>

            {/* ── Hero macro rings ── */}
            <motion.div
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="flex justify-center px-5 mb-6"
            >
                <MacroRings
                    calories={data.current.calories !== undefined ? { current: data.current.calories, target: data.targets.calories } : { current: 0, target: data.targets.calories }}
                    protein={{ current: data.current.protein, target: data.targets.protein }}
                    carbs={{ current: data.current.carbs, target: data.targets.carbs }}
                    fat={{ current: data.current.fat, target: data.targets.fat }}
                    animate={true}
                    size={200}
                />
            </motion.div>

            {/* ── Quick stats pills ── */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="px-5 mb-6 flex gap-3 overflow-x-auto [&::-webkit-scrollbar]:hidden"
            >
                <div className="flex-shrink-0 bg-[#13131C] border border-[#2A2A3D] rounded-full px-4 py-2 flex items-center gap-2">
                    <UtensilsCrossed size={13} className="text-[#4F9EFF]" />
                    <span className="font-['DM_Sans'] text-[13px] text-white font-medium">{data.logs.length} meals</span>
                </div>
                <div className={`flex-shrink-0 border rounded-full px-4 py-2 flex items-center gap-2 ${
                    caloriesRemaining > 0
                        ? "bg-[#34D8BC]/10 border-[#34D8BC]/25"
                        : "bg-[#FF6B6B]/10 border-[#FF6B6B]/25"
                }`}>
                    <Flame size={13} className={caloriesRemaining > 0 ? "text-[#34D8BC]" : "text-[#FF6B6B]"} />
                    <span className={`font-['DM_Sans'] text-[13px] font-medium ${caloriesRemaining > 0 ? "text-[#34D8BC]" : "text-[#FF6B6B]"}`}>
                        {caloriesRemaining > 0 ? `${caloriesRemaining} cal left` : "Goal reached"}
                    </span>
                </div>
            </motion.div>

            {/* ── Meal timeline or empty state ── */}
            {data.logs.length === 0 ? (
                <EmptyMealsState onSnap={() => router.push("/snap")} />
            ) : (
                <MealTimeline
                    logs={data.logs}
                    isLoading={false}
                    onDeleteLog={handleDeleteLog}
                />
            )}
        </AppShell>
    );
}
