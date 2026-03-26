"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { AppShell } from "@/components/AppShell";
import { Chip } from "@/components/Chip";
import { ShareableRoast } from "@/components/roast/ShareableRoast";
import { WeeklyRoast } from "@/lib/agents/roast-agent";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    ReferenceLine, Cell, PieChart, Pie,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Share2, Trophy, Zap, Target } from "lucide-react";

interface DailySummary {
    date: string;
    total_calories: number;
    total_protein?: number;
    total_carbs?: number;
    total_fat?: number;
    [key: string]: unknown;
}

interface ProgressData {
    summaries: DailySummary[];
    streak: number;
    longest_streak: number;
    roast?: WeeklyRoast & { id?: string };
    targets?: { calories: number; protein: number; carbs: number; fat: number };
    [key: string]: unknown;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function buildLast7(summaries: DailySummary[], target: number) {
    const today = new Date();
    return Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - (6 - i));
        const dtStr = d.toISOString().split("T")[0];
        const summary = summaries.find(s => s.date === dtStr);
        const calories = summary?.total_calories ?? 0;
        const pct = target > 0 ? calories / target : 0;
        let state: "none" | "over" | "hit" | "under" = "none";
        if (calories > 0) {
            if (pct > 1.05) state = "over";
            else if (pct >= 0.85) state = "hit";
            else state = "under";
        }
        return {
            dayStr: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()],
            dateStr: dtStr,
            isToday: i === 6,
            calories,
            target,
            state,
            pct,
        };
    });
}

function buildHeatmap(summaries: DailySummary[], target: number) {
    // 4 weeks = 28 days
    const today = new Date();
    return Array.from({ length: 28 }).map((_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - (27 - i));
        const dtStr = d.toISOString().split("T")[0];
        const summary = summaries.find(s => s.date === dtStr);
        const calories = summary?.total_calories ?? 0;
        const pct = target > 0 ? calories / target : 0;
        return { dtStr, isToday: i === 27, calories, pct, dayOfWeek: d.getDay() };
    });
}

function heatColor(pct: number, calories: number) {
    if (calories === 0) return "#1C1C28";
    if (pct > 1.05) return "#FF6B6B";
    if (pct >= 0.85) return "#34D8BC";
    if (pct >= 0.5)  return "#4F9EFF";
    return "#2A2A3D";
}

// ── Skeleton ───────────────────────────────────────────────────────────────────
function ProgressSkeleton() {
    return (
        <AppShell>
            <div className="pt-6 px-5 mb-8 mt-4 animate-pulse">
                <div className="w-[150px] h-8 bg-[#2A2A3D] rounded mb-2" />
                <div className="w-[100px] h-4 bg-[#2A2A3D] rounded mb-6" />
                <div className="bg-[#13131C] rounded-[24px] h-[140px] w-full border border-[#2A2A3D]" />
            </div>
            <div className="px-5 mb-8 animate-pulse">
                <div className="bg-[#13131C] rounded-[20px] h-[100px] w-full border border-[#2A2A3D]" />
            </div>
            <div className="px-5 mb-10 animate-pulse">
                <div className="bg-[#13131C] rounded-[20px] h-[200px] w-full border border-[#2A2A3D]" />
            </div>
        </AppShell>
    );
}

// ── Personal record card ────────────────────────────────────────────────────────
function PRCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
    return (
        <div className="flex-1 bg-[#13131C] border border-[#2A2A3D] rounded-[16px] p-3 flex flex-col items-center gap-1">
            <div style={{ color }}>{icon}</div>
            <span className="font-['Bricolage_Grotesque'] font-bold text-white text-[18px] leading-none">{value}</span>
            <span className="font-['DM_Sans'] text-[10px] text-[#56566F] uppercase tracking-wider text-center">{label}</span>
        </div>
    );
}

// ── Macro Donut ─────────────────────────────────────────────────────────────────
function MacroDonut({ summaries }: { summaries: DailySummary[] }) {
    const logged = summaries.filter(s => s.total_calories && s.total_calories > 0);
    if (logged.length === 0) return null;

    const avg = {
        protein: logged.reduce((s, d) => s + (d.total_protein ?? 0), 0) / logged.length,
        carbs:   logged.reduce((s, d) => s + (d.total_carbs   ?? 0), 0) / logged.length,
        fat:     logged.reduce((s, d) => s + (d.total_fat     ?? 0), 0) / logged.length,
    };
    const total = avg.protein * 4 + avg.carbs * 4 + avg.fat * 9;
    if (total === 0) return null;

    const pieData = [
        { name: "Protein", value: Math.round(avg.protein * 4 / total * 100), color: "#7C6FFF" },
        { name: "Carbs",   value: Math.round(avg.carbs   * 4 / total * 100), color: "#34D8BC" },
        { name: "Fat",     value: Math.round(avg.fat     * 9 / total * 100), color: "#FFC84A" },
    ];

    return (
        <div className="px-5 mb-8">
            <h3 className="font-['Bricolage_Grotesque'] font-bold text-white text-[18px] mb-4">Avg Macro Split</h3>
            <div className="bg-[#13131C] border border-[#2A2A3D] rounded-[20px] p-4 flex items-center gap-4">
                <div className="w-[100px] h-[100px] flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={28}
                                outerRadius={46}
                                dataKey="value"
                                strokeWidth={0}
                            >
                                {pieData.map((entry, i) => (
                                    <Cell key={i} fill={entry.color} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex flex-col gap-2 flex-1">
                    {pieData.map(d => (
                        <div key={d.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                                <span className="font-['DM_Sans'] text-[13px] text-[#9898B3]">{d.name}</span>
                            </div>
                            <span className="font-['DM_Sans'] font-bold text-white text-[13px]">{d.value}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ── Custom Bar Shape with gradient ─────────────────────────────────────────────
interface BarShapeProps {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    fill?: string;
    state?: string;
}

function GradientBar(props: BarShapeProps) {
    const { x = 0, y = 0, width = 0, height = 0, fill = "#2A2A3D" } = props;
    if (height === 0) return null;
    return (
        <rect
            x={x}
            y={y}
            width={width}
            height={height}
            rx={6}
            ry={6}
            fill={fill}
            opacity={0.9}
        />
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function ProgressPage() {
    const [data, setData]           = useState<ProgressData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError]         = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showShare, setShowShare] = useState(false);
    const [typewriterIndex, setTypewriterIndex] = useState(0);

    const fetchProgress = async () => {
        try {
            const res = await fetch(api("/api/progress?days=28"));
            if (!res.ok) throw new Error("Failed to fetch");
            const json = await res.json();
            setData(json);
        } catch {
            setError("Unable to load progress data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchProgress(); }, []);

    // Typewriter effect
    useEffect(() => {
        if (!data?.roast) return;
        try {
            const seenKey = `roast_seen_${data.roast.id || "latest"}`;
            if (sessionStorage.getItem(seenKey)) {
                setTypewriterIndex(data.roast.roast_text.length);
                return;
            }
        } catch { /* ignore sessionStorage errors */ }

        if (typewriterIndex >= data.roast.roast_text.length) {
            try { sessionStorage.setItem(`roast_seen_${data.roast.id || "latest"}`, "1"); } catch { /* ignore */ }
            return;
        }
        const interval = setInterval(() => setTypewriterIndex(i => i + 1), 22);
        return () => clearInterval(interval);
    }, [data?.roast, typewriterIndex]);

    const handleGenerateRoast = async () => {
        setIsGenerating(true);
        try {
            const res = await fetch(api("/api/roast"), { method: "POST" });
            if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
            setTypewriterIndex(0);
            await fetchProgress();
        } catch { /* ignore */ }
        finally { setIsGenerating(false); }
    };

    if (isLoading) return <ProgressSkeleton />;

    if (error) {
        return (
            <AppShell>
                <div className="flex flex-col items-center justify-center pt-32 px-4 text-center">
                    <Chip emotion="sad" size={100} />
                    <h2 className="text-white mt-6 mb-2 text-xl font-bold font-['Bricolage_Grotesque']">Oops.</h2>
                    <p className="text-[#9898B3] mb-6 font-['DM_Sans']">{error}</p>
                    <button onClick={() => { setError(null); setIsLoading(true); fetchProgress(); }} className="premium-btn px-8">
                        Retry
                    </button>
                </div>
            </AppShell>
        );
    }

    const summaries = data?.summaries ?? [];
    const streak = data?.streak ?? 0;
    const longestStreak = data?.longest_streak ?? streak;
    const calTarget = (data?.targets?.calories) ?? 2000;
    const isFireStreak = streak >= 7;

    const last7 = buildLast7(summaries, calTarget);
    const heatmap = buildHeatmap(summaries, calTarget);
    const daysHit = last7.filter(d => d.state === "hit").length;
    const today = new Date();

    // Personal records
    const maxProteinDay = summaries.reduce((best, s) => (s.total_protein ?? 0) > (best.total_protein ?? 0) ? s : best, summaries[0] ?? { total_protein: 0 });
    const weekCalories = last7.reduce((s, d) => s + d.calories, 0);

    return (
        <AppShell>
            {/* ── Header ── */}
            <div className="pt-6 px-5 mb-6 mt-4">
                <h1 className="font-['Bricolage_Grotesque'] text-[28px] font-bold text-white mb-1">Progress</h1>
                <p className="font-['DM_Sans'] text-[13px] text-[#56566F]">
                    {new Date(today.getTime() - 27 * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    {" – "}
                    {today.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
            </div>

            {/* ── Streak card ── */}
            <div className="px-5 mb-6">
                <div className="bg-gradient-to-br from-[#4F9EFF] to-[#7C6FFF] rounded-[24px] p-5 shadow-[0_12px_40px_rgba(79,158,255,0.2)] relative overflow-hidden flex items-center justify-between">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-1">
                            <Flame size={28} className="text-white/80" />
                            <span className="text-[52px] font-black font-['Bricolage_Grotesque'] leading-none text-white tracking-[-2px]">
                                {streak}
                            </span>
                        </div>
                        <p className="text-white/60 font-['DM_Sans'] text-[14px]">day streak</p>
                        <div className="w-[120px] h-[3px] bg-black/20 rounded-full mt-3 overflow-hidden">
                            <motion.div
                                className="h-full bg-white/80 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min((streak % 7) / 7 * 100, 100)}%` }}
                                transition={{ duration: 1, delay: 0.3 }}
                            />
                        </div>
                        <p className="text-white/60 font-['DM_Sans'] text-[11px] mt-1.5">
                            {7 - (streak % 7 || 7)} more days to 7-day milestone
                        </p>
                    </div>
                    <Chip emotion={isFireStreak ? "hype" : "happy"} size={64} className="relative z-10 shrink-0" />
                    <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                    <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-black/10 rounded-full blur-2xl" />
                </div>
            </div>

            {/* ── Personal records ── */}
            <div className="px-5 mb-6">
                <h3 className="font-['Bricolage_Grotesque'] font-bold text-white text-[16px] mb-3">Personal Records</h3>
                <div className="flex gap-3">
                    <PRCard
                        icon={<Flame size={16} />}
                        label="Best Streak"
                        value={`${longestStreak}d`}
                        color="#FFC84A"
                    />
                    <PRCard
                        icon={<Zap size={16} />}
                        label="Best Protein"
                        value={`${Math.round(maxProteinDay?.total_protein ?? 0)}g`}
                        color="#7C6FFF"
                    />
                    <PRCard
                        icon={<Target size={16} />}
                        label="Week Cal"
                        value={`${Math.round(weekCalories / 1000)}k`}
                        color="#34D8BC"
                    />
                    <PRCard
                        icon={<Trophy size={16} />}
                        label="Days Hit"
                        value={`${daysHit}/7`}
                        color="#4F9EFF"
                    />
                </div>
            </div>

            {/* ── 4-week heatmap ── */}
            <div className="px-5 mb-6">
                <h3 className="font-['Bricolage_Grotesque'] font-bold text-white text-[18px] mb-3">4-Week Heatmap</h3>
                <div className="bg-[#13131C] border border-[#2A2A3D] rounded-[20px] p-4">
                    {/* Day labels */}
                    <div className="grid grid-cols-7 gap-1 mb-1">
                        {["S","M","T","W","T","F","S"].map((d, i) => (
                            <div key={i} className="text-[9px] text-[#56566F] font-['DM_Sans'] text-center font-bold">
                                {d}
                            </div>
                        ))}
                    </div>
                    {/* Heatmap cells — 4 rows of 7 */}
                    {Array.from({ length: 4 }).map((_, week) => (
                        <div key={week} className="grid grid-cols-7 gap-1 mb-1">
                            {heatmap.slice(week * 7, (week + 1) * 7).map((cell, i) => (
                                <div
                                    key={i}
                                    className="aspect-square rounded-[5px] relative"
                                    style={{ backgroundColor: heatColor(cell.pct, cell.calories) }}
                                    title={`${cell.dtStr}: ${Math.round(cell.calories)} cal`}
                                >
                                    {cell.isToday && (
                                        <div className="absolute inset-0 rounded-[5px] ring-2 ring-white/50" />
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                    {/* Legend */}
                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                        {[
                            { color: "#1C1C28", label: "None" },
                            { color: "#4F9EFF", label: "Logged" },
                            { color: "#34D8BC", label: "On track" },
                            { color: "#FF6B6B", label: "Over" },
                        ].map(l => (
                            <div key={l.label} className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded-[3px]" style={{ backgroundColor: l.color }} />
                                <span className="text-[10px] text-[#56566F] font-['DM_Sans']">{l.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Weekly chart ── */}
            <div className="px-5 mb-6">
                <h3 className="font-['Bricolage_Grotesque'] font-bold text-white text-[18px] mb-4">
                    This Week&apos;s Calories
                </h3>
                {daysHit < 2 ? (
                    <div className="bg-[#13131C] border border-[#2A2A3D] rounded-[20px] h-[160px] flex flex-col items-center justify-center">
                        <Chip emotion="thinking" size={56} className="mb-3" />
                        <p className="text-[#56566F] font-['DM_Sans'] text-[13px]">Log meals to see your trends.</p>
                    </div>
                ) : (
                    <div className="bg-[#13131C] border border-[#2A2A3D] rounded-[20px] p-4 h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={last7} margin={{ top: 8, right: 0, left: -20, bottom: 0 }}>
                                <XAxis
                                    dataKey="dayStr"
                                    stroke="#56566F"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                    fontFamily="DM Sans"
                                />
                                <YAxis stroke="#56566F" fontSize={10} tickLine={false} axisLine={false} domain={[0, "dataMax"]} fontFamily="DM Sans" />
                                <Tooltip
                                    cursor={{ fill: "#2A2A3D", opacity: 0.4, radius: 6 }}
                                    contentStyle={{
                                        backgroundColor: "#13131C",
                                        border: "1px solid #2A2A3D",
                                        borderRadius: "12px",
                                        boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
                                        fontFamily: "DM Sans",
                                    }}
                                    itemStyle={{ color: "white", fontWeight: "bold" }}
                                    labelStyle={{ color: "#9898B3", fontSize: "12px" }}
                                />
                                <ReferenceLine
                                    y={calTarget}
                                    stroke="#4F9EFF"
                                    strokeDasharray="4 4"
                                    strokeOpacity={0.5}
                                />
                                <Bar dataKey="calories" radius={[6, 6, 0, 0]} maxBarSize={28} shape={<GradientBar />}>
                                    {last7.map((entry, i) => {
                                        let fill = "#2A2A3D";
                                        if (entry.state === "hit")   fill = "#34D8BC";
                                        if (entry.state === "under") fill = "#4F9EFF";
                                        if (entry.state === "over")  fill = "#FF6B6B";
                                        return <Cell key={i} fill={fill} opacity={entry.isToday ? 1 : 0.7} />;
                                    })}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {/* ── Macro donut ── */}
            <MacroDonut summaries={summaries} />

            {/* ── 7-day calendar row ── */}
            <div className="px-5 mb-6">
                <p className="font-['DM_Sans'] text-[13px] text-[#56566F] mb-3">
                    {daysHit} of 7 days on target this week
                </p>
                <div className="flex gap-2 justify-between">
                    {last7.map((day, idx) => {
                        let bg = "#1C1C28";
                        let border = "border-transparent";
                        if (day.state === "hit")   { bg = "#34D8BC"; border = "border-transparent"; }
                        if (day.state === "under")  { bg = "transparent"; border = "border-[#4F9EFF]"; }
                        if (day.state === "over")   { bg = "transparent"; border = "border-[#FF6B6B]"; }
                        if (day.isToday && day.state === "none") border = "border-[#4F9EFF]/40";
                        return (
                            <div key={idx} className="flex flex-col items-center gap-1.5">
                                <div
                                    className={`w-9 h-9 rounded-full flex items-center justify-center border-2 ${border}`}
                                    style={{ backgroundColor: bg }}
                                >
                                    {day.state === "hit" && (
                                        <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                                            <path d="M1 4.5L4 7.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                </div>
                                <span className="font-['DM_Sans'] text-[10px] text-[#56566F] uppercase tracking-wide">
                                    {day.dayStr}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Roast section ── */}
            <div className="px-5 pb-[100px]">
                {!data?.roast ? (
                    <div className="bg-[#13131C] border border-dashed border-[#4F9EFF]/30 rounded-[24px] p-6 flex flex-col items-center text-center">
                        <Chip emotion="laughing" size={72} />
                        <h2 className="text-[18px] font-bold font-['Bricolage_Grotesque'] text-white mt-4 mb-2">
                            Your weekly roast drops Sunday. 😈
                        </h2>
                        <p className="text-[#56566F] font-['DM_Sans'] text-[13px] mb-5 max-w-[220px]">
                            Can&apos;t wait? Let Chip roast you early.
                        </p>
                        <button
                            onClick={handleGenerateRoast}
                            disabled={isGenerating}
                            className="border border-[#2A2A3D] text-[#9898B3] rounded-[14px] px-6 py-3 font-bold font-['DM_Sans'] text-[14px] hover:text-white hover:border-[#56566F] transition-colors disabled:opacity-40"
                        >
                            {isGenerating ? "Analyzing..." : "Roast Me Early"}
                        </button>
                    </div>
                ) : (
                    <div className="bg-[#13131C] border-l-4 border-l-[#4F9EFF] rounded-[24px] p-5 shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-[#9898B3] font-['DM_Sans'] text-[12px] font-semibold uppercase tracking-wider">
                                Week of {new Date(today.getTime() - 6 * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </p>
                            <Chip emotion="laughing" size={36} />
                        </div>

                        <h2 className="text-[20px] font-black font-['Bricolage_Grotesque'] text-white italic leading-tight mb-4">
                            &quot;{data.roast.roast_title}&quot;
                        </h2>

                        <div className="text-[#9898B3] text-[14px] font-['DM_Sans'] leading-relaxed mb-5">
                            {data.roast.roast_text.substring(0, typewriterIndex)}
                            {typewriterIndex < data.roast.roast_text.length && (
                                <span className="animate-pulse text-white">|</span>
                            )}
                        </div>

                        <AnimatePresence>
                            {typewriterIndex >= data.roast.roast_text.length && (
                                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                                    <div className="bg-[#34D8BC]/8 border-l-[3px] border-l-[#34D8BC] rounded-r-[12px] p-4 mb-5">
                                        <p className="text-[#34D8BC] font-bold text-[10px] uppercase tracking-wider mb-1">
                                            This week&apos;s tip
                                        </p>
                                        <p className="text-[#9898B3] font-['DM_Sans'] text-[13px] leading-relaxed">
                                            {data.roast.tip_text}
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => setShowShare(true)}
                                        className="w-full flex items-center justify-center gap-2 bg-[#1C1C28] border border-[#2A2A3D] hover:border-[#4F9EFF]/30 transition-colors text-white py-3.5 rounded-[14px] font-bold font-['DM_Sans'] text-[14px]"
                                    >
                                        <Share2 size={15} strokeWidth={2.5} /> Share My Roast
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {data?.roast && (
                <ShareableRoast
                    roast={data.roast}
                    isVisible={showShare}
                    onClose={() => setShowShare(false)}
                />
            )}
        </AppShell>
    );
}
