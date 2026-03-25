"use client";

import { useEffect, useState } from "react";

interface DailySummary {
    date: string;
    total_calories: number;
    [key: string]: unknown;
}

interface ProgressData {
    summaries: DailySummary[];
    streak: number;
    longest_streak: number;
    roast?: WeeklyRoast & { id?: string };
    [key: string]: unknown;
}
import { AppShell } from "@/components/AppShell";
import { Chip } from "@/components/Chip";
import { ShareableRoast } from "@/components/roast/ShareableRoast";
import { WeeklyRoast } from "@/lib/agents/roast-agent";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Share2 } from "lucide-react";

export default function ProgressPage() {
    const [data, setData] = useState<ProgressData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showShare, setShowShare] = useState(false);

    // Typewriter active state
    const [typewriterIndex, setTypewriterIndex] = useState(0);

    const fetchProgress = async () => {
        try {
            const res = await fetch("/api/progress?days=7");
            if (!res.ok) throw new Error("Failed to fetch");
            const json = await res.json();
            setData(json);
        } catch (e) {
            console.error(e);
            setError("Unable to load progress data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProgress();
    }, []);

    // Typewriter effect logic
    useEffect(() => {
        if (!data?.roast) return;

        // Use a unique key for this roast (e.g. its id, week, or just "current")
        const seenKey = `roast_seen_${data.roast.id || 'latest'}`;

        if (sessionStorage.getItem(seenKey)) {
            setTypewriterIndex(data.roast.roast_text.length);
            return;
        }

        if (typewriterIndex >= data.roast.roast_text.length) {
            sessionStorage.setItem(seenKey, "1");
            return;
        }

        const interval = setInterval(() => setTypewriterIndex(i => i + 1), 25);
        return () => clearInterval(interval);
    }, [data?.roast, typewriterIndex]);

    const handleGenerateRoast = async () => {
        setIsGenerating(true);
        try {
            const res = await fetch("/api/roast", { method: "POST" });
            if (!res.ok) {
                const err = await res.json();
                alert(err.error || "Generation failed");
                return;
            }
            setTypewriterIndex(0); // Reset animation
            await fetchProgress(); // Refetch to show state B
        } catch (e) {
            console.error(e);
        } finally {
            setIsGenerating(false);
        }
    };

    function ProgressSkeleton() {
        return (
            <AppShell>
                <div className="pt-6 px-5 mb-8 mt-4 animate-pulse">
                    <div className="w-[150px] h-8 bg-[#2A2A3A] rounded mb-2" />
                    <div className="w-[100px] h-4 bg-[#2A2A3A] rounded mb-6" />
                    <div className="bg-[#1A1A24] rounded-[24px] h-[160px] w-full border border-[#2A2A3A]" />
                </div>
                <div className="px-5 mb-10 animate-pulse">
                    <div className="w-[180px] h-4 bg-[#2A2A3A] rounded mb-4" />
                    <div className="flex justify-between px-1">
                        {[1, 2, 3, 4, 5, 6, 7].map(i => (
                            <div key={i} className="flex flex-col items-center gap-2">
                                <div className="w-[36px] h-[36px] rounded-full bg-[#2A2A3A]" />
                                <div className="w-6 h-2 bg-[#2A2A3A] rounded" />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="px-5 mb-12 h-[220px] animate-pulse">
                    <div className="w-[200px] h-6 bg-[#2A2A3A] rounded mb-6" />
                    <div className="w-full h-[180px] bg-[#1A1A24] rounded-[24px] border border-[#2A2A3A]" />
                </div>
            </AppShell>
        );
    }

    if (isLoading) return <ProgressSkeleton />;

    if (error) {
        return (
            <AppShell>
                <div className="flex flex-col items-center justify-center pt-32 px-4 text-center">
                    <Chip emotion="sad" size={100} />
                    <h2 className="text-white mt-6 mb-2 text-xl font-bold font-['Bricolage_Grotesque']">Oops.</h2>
                    <p className="text-[#A0A0B8] mb-6 font-['DM_Sans']">{error}</p>
                    <button onClick={() => { setError(null); setIsLoading(true); fetchProgress(); }} className="px-6 py-3 bg-[#3B8BF7] text-white rounded-xl font-['DM_Sans'] font-semibold">
                        Retry
                    </button>
                </div>
            </AppShell>
        );
    }

    // Format 7 Day calendar data
    // Requirements: 7 circles, Mon-Sun, green (hit) | blue (logged) | gray (none)
    // Recharts: Bar green(hit) | blue (logged) | gray (none)
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date();

    // Create last 7 days array
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - (6 - i));
        const dtStr = d.toISOString().split("T")[0];

        // Find summary
        const summary = data?.summaries.find((s) => s.date === dtStr);
        const calories = summary?.total_calories || 0;
        // Mock target
        const target = 2000;

        let state = "none";
        if (calories > 0) {
            if (calories <= target + 100) state = "hit";
            else state = "logged";
        }

        return {
            dayStr: daysOfWeek[d.getDay()],
            dateStr: dtStr,
            isToday: i === 6,
            calories,
            target,
            state // "hit" | "logged" | "none"
        };
    });

    const daysHit = last7Days.filter(d => d.state === "hit").length;
    const isFireStreak = (data?.streak ?? 0) >= 7;

    // Render Roast State A or B safely
    const roastStateA = !data?.roast;

    return (
        <AppShell chipEmotion={(data?.streak ?? 0) >= 7 ? "on_fire" : "happy"}>

            {/* 1. STREAK CARD */}
            <div className="pt-6 px-5 mb-8 mt-4">
                <h1 className="font-['Bricolage_Grotesque'] text-[28px] font-bold text-white mb-1">Progress</h1>
                <p className="font-['DM_Sans'] text-[14px] text-[#A0A0B8] mb-6">
                    {new Date(today.getTime() - 6 * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric" })} – {today.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>

                <div className="bg-gradient-to-br from-[#3B8BF7] to-[#5B9EF8] rounded-[24px] p-6 shadow-[0_12px_40px_rgba(59,139,247,0.25)] relative overflow-hidden flex items-center justify-between">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2">
                            <Flame size={32} strokeWidth={2.5} className="text-white mb-1" />
                            <h2 className="text-[56px] font-black font-['Bricolage_Grotesque'] leading-none text-white tracking-[-2px]">
                                {data?.streak || 0}
                            </h2>
                        </div>
                        <p className="text-white/60 font-['DM_Sans'] text-[15px] font-medium mt-1">
                            day streak
                        </p>
                        <div className="w-[120px] h-2 bg-black/20 rounded-full mt-4 overflow-hidden relative">
                            <div
                                className="absolute top-0 left-0 bottom-0 bg-white rounded-full transition-all duration-1000"
                                style={{ width: `${Math.min(((data?.streak || 0) % 7) / 7 * 100, 100)}%` }}
                            />
                        </div>
                        <p className="text-white/70 font-['DM_Sans'] text-[12px] mt-2">
                            {7 - ((data?.streak || 0) % 7)} more days to your 7-day milestone 🎯
                        </p>
                    </div>
                    <div className="relative z-10 shrink-0">
                        <Chip emotion={isFireStreak ? "on_fire" : "happy"} size={64} />
                    </div>

                    {/* Decorative circles */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/10 rounded-full blur-2xl pointer-events-none" />
                </div>
            </div>

            {/* 2. 7-DAY CALENDAR */}
            <div className="px-5 mb-10">
                <h3 className="font-['DM_Sans'] font-medium text-[#A0A0B8] mb-4 text-[14px]">
                    {daysHit} of 7 days on track this week
                </h3>
                <div className="flex justify-between px-1">
                    {last7Days.map((day, idx) => {
                        // Colors logic applied precisely
                        let fillClass = "bg-[#2A2A3A]"; // gray no logs
                        let borderClass = "border-transparent border-2";
                        let textClass = "text-[#60607A]";

                        if (day.state === "hit") {
                            fillClass = "bg-[#2DD4BF]";
                            borderClass = "border-transparent border-0";
                            textClass = "text-white font-bold";
                        } else if (day.state === "logged") {
                            fillClass = "bg-transparent";
                            borderClass = "border-[#3B8BF7] border-2";
                            textClass = "text-[#3B8BF7] font-bold";
                        }

                        if (day.isToday && day.state === "none") {
                            borderClass = "border-[#3B8BF7] border-2";
                        }

                        return (
                            <div key={idx} className="flex flex-col items-center gap-2">
                                <div className={`w-[36px] h-[36px] rounded-full flex items-center justify-center ${fillClass} ${borderClass} transition-colors`}>
                                    {day.state === "hit" && (
                                        <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M1 5L5 9L13 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                    {day.state === "logged" && <div className="w-2 h-2 bg-[#3B8BF7] rounded-full" />}
                                </div>
                                <span className={`text-[11px] font-['DM_Sans'] uppercase tracking-wider ${textClass}`}>
                                    {day.dayStr}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 3. WEEKLY CHART */}
            <div className="px-5 mb-12 h-[220px]">
                <h3 className="font-['Bricolage_Grotesque'] font-bold text-white mb-6 text-[20px]">This week&apos;s calories</h3>
                {daysHit < 3 ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-[#1A1A24] rounded-[24px] border border-[#2A2A3A]">
                        <Chip emotion="thinking" size={64} className="mb-3" />
                        <p className="font-['DM_Sans'] text-[14px] text-white/70 font-medium">Log 3 days of meals to see your trends.</p>
                    </div>
                ) : (
                    <div className="w-full h-[220px] bg-[#1A1A24] rounded-[24px] border border-[#2A2A3A] p-4 pt-6 shadow-lg">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={last7Days} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                                <XAxis dataKey="dayStr" stroke="#60607A" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis
                                    stroke="#60607A"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                    domain={[0, 'dataMax']}
                                    ticks={[0, Math.max(...last7Days.map(d => d.calories), 2000)]}
                                />
                                <Tooltip
                                    cursor={{ fill: '#2A2A3A', opacity: 0.4 }}
                                    contentStyle={{ backgroundColor: '#0F0F14', border: '1px solid #2A2A3A', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
                                    itemStyle={{ color: 'white', fontFamily: 'DM Sans', fontWeight: 'bold' }}
                                    labelStyle={{ color: '#A0A0B8', fontFamily: 'DM Sans', fontSize: '13px', marginBottom: '4px' }}
                                />
                                {/* Reference dashed line */}
                                <ReferenceLine y={2000} stroke="#3B8BF7" strokeDasharray="4 4" label={{ position: 'top', value: 'Your target', fill: '#3B8BF7', fontSize: 10, fontFamily: 'DM Sans' }} />
                                <Bar dataKey="calories" radius={[6, 6, 0, 0]} maxBarSize={32}>
                                    {last7Days.map((entry, index) => {
                                        let color = "#2A2A3A"; // no logs
                                        if (entry.state === "hit") color = "#2DD4BF"; // green
                                        if (entry.state === "logged") color = "#3B8BF7"; // blue (under)
                                        if (entry.calories > entry.target + 100) color = "#EF4444"; // red (over)
                                        return <Cell key={`cell-${index}`} fill={color} opacity={entry.isToday ? 1 : 0.6} />;
                                    })}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {/* 4. ROAST SECTION */}
            <div className="px-5 pb-[100px]">
                {roastStateA ? (
                    // STATE A (Empty Roast State)
                    <div className="bg-[#1A1A24] border border-dashed border-[#3B8BF7]/50 rounded-[24px] p-6 flex flex-col items-center justify-center text-center">
                        <Chip emotion="laughing" size={80} />
                        <h2 className="text-[20px] font-bold font-['Bricolage_Grotesque'] text-white mt-4 mb-2 whitespace-pre-wrap">Your weekly roast drops Sunday. 😈</h2>
                        <button
                            onClick={handleGenerateRoast}
                            disabled={isGenerating}
                            className="bg-transparent border border-[#60607A] text-[#A0A0B8] rounded-[12px] px-6 py-2.5 font-bold font-['DM_Sans'] text-[14px] hover:text-white hover:border-[#A0A0B8] transition-colors mt-6 disabled:opacity-50"
                        >
                            {isGenerating ? "Analyzing week..." : "Roast Me Early"}
                        </button>
                    </div>
                ) : (
                    // STATE B
                    <div className="bg-[#1A1A24] border-l-4 border-l-[#3B8BF7] rounded-[24px] p-6 shadow-xl relative overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h4 className="text-white text-[15px] font-bold font-['DM_Sans']">🔥 Week of {new Date(today.getTime() - 6 * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</h4>
                            </div>
                            <Chip emotion="laughing" size={40} />
                        </div>

                        <h2 className="text-[22px] font-black font-['Bricolage_Grotesque'] text-white italic leading-tight mb-4">
                            &quot;{data?.roast?.roast_title}&quot;
                        </h2>

                        <div className="text-[#A0A0B8] text-[15px] font-['DM_Sans'] leading-[1.8] mb-6">
                            {data?.roast?.roast_text.substring(0, typewriterIndex)}
                            {typewriterIndex < (data?.roast?.roast_text.length ?? 0) && <span className="animate-pulse">|</span>}
                        </div>

                        <AnimatePresence>
                            {typewriterIndex >= (data?.roast?.roast_text.length ?? 0) && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    <div className="bg-[rgba(45,212,191,0.08)] border-l-[3px] border-l-[#2DD4BF] rounded-r-[12px] p-4 mb-6">
                                        <p className="text-[#2DD4BF] font-bold text-[11px] uppercase tracking-wide mb-1">💡 This week&apos;s tip</p>
                                        <p className="text-[#A0A0B8] font-['DM_Sans'] text-[14px] leading-relaxed">{data?.roast?.tip_text}</p>
                                    </div>

                                    <button
                                        onClick={() => setShowShare(true)}
                                        className="w-full flex items-center justify-center gap-[6px] bg-[#2A2A3A] hover:bg-[#323246] transition-colors text-white py-3.5 rounded-[14px] font-bold font-['DM_Sans']"
                                    >
                                        <Share2 size={16} strokeWidth={2.5} /> <span>Share My Roast</span>
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )
                }
            </div >

            {data?.roast && (
                <ShareableRoast
                    roast={data.roast}
                    isVisible={showShare}
                    onClose={() => setShowShare(false)}
                />
            )}

        </AppShell >
    );
}

// Polyfill for getWeek() demo
declare global {
    interface Date {
        getWeek(): number;
    }
}
Date.prototype.getWeek = function () {
    const date = new Date(this.getTime());
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    const week1 = new Date(date.getFullYear(), 0, 4);
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
};
