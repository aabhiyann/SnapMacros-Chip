"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Chip } from "@/components/Chip";
import { ShareableRoast } from "@/components/roast/ShareableRoast";
import { WeeklyRoast } from "@/lib/agents/roast-agent";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from "recharts";
import { motion, AnimatePresence } from "framer-motion";

export default function ProgressPage() {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
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
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProgress();
    }, []);

    // Typewriter effect logic
    useEffect(() => {
        if (!data?.roast || typewriterIndex >= data.roast.roast_text.length) return;
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

    if (isLoading) return <AppShell><div className="min-h-screen bg-[#0F0F14]" /></AppShell>;

    // Format 7 Day calendar data
    // Requirements: 7 circles, Mon-Sun, green (hit) | orange (logged) | gray (none)
    // Recharts: Bar green(hit) | orange (logged) | gray (none)
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date();

    // Create last 7 days array
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - (6 - i));
        const dtStr = d.toISOString().split("T")[0];

        // Find summary
        const summary = data?.summaries.find((s: any) => s.date === dtStr);
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
    const isFireStreak = data?.streak >= 7;

    // Render Roast State A or B safely
    const roastStateA = !data?.roast;

    return (
        <AppShell chipEmotion={data?.streak >= 7 ? "on_fire" : "happy"}>

            {/* 1. STREAK CARD */}
            <div className="pt-[48px] px-5 mb-8">
                <div className="bg-gradient-to-br from-[#FF6B35] to-[#FF8C35] rounded-[24px] p-6 shadow-[0_12px_40px_rgba(255,107,53,0.25)] relative overflow-hidden flex items-center justify-between">
                    <div className="relative z-10">
                        <h2 className="text-[52px] font-black font-['Bricolage_Grotesque'] leading-none text-white tracking-tight">
                            {data?.streak || 0}
                        </h2>
                        <p className="text-white/90 font-['DM_Sans'] text-[15px] font-medium mt-1">
                            day streak
                        </p>
                        {/* Simple progress to next milestone */}
                        <div className="w-[120px] h-2 bg-black/20 rounded-full mt-4 overflow-hidden relative">
                            <div
                                className="absolute top-0 left-0 bottom-0 bg-white rounded-full transition-all duration-1000"
                                style={{ width: `\${Math.min(((data?.streak || 0) % 7) / 7 * 100, 100)}%` }}
              />
                        </div>
                    </div>
                    <div className="relative z-10">
                        <Chip emotion={isFireStreak ? "on_fire" : "happy"} size={100} />
                    </div>

                    {/* Decorative circles */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/10 rounded-full blur-2xl pointer-events-none" />
                </div>
            </div>

            {/* 2. 7-DAY CALENDAR */}
            <div className="px-5 mb-10">
                <h3 className="font-['DM_Sans'] font-medium text-[#A0A0B8] mb-4 text-[14px]">
                    <strong className="text-white">{daysHit} of 7</strong> days on track
                </h3>
                <div className="flex justify-between px-2">
                    {last7Days.map((day, idx) => {
                        // Colors logic applied precisely
                        let fillClass = "bg-[#2A2A3A]"; // gray no logs
                        let borderClass = "border-transparent";
                        let textClass = "text-[#60607A]";

                        if (day.state === "hit") {
                            fillClass = "bg-[#2DD4BF]";
                            textClass = "text-white font-bold";
                        } else if (day.state === "logged") {
                            fillClass = "bg-transparent";
                            borderClass = "border-2 border-[#FF6B35]";
                            textClass = "text-[#FF6B35] font-bold";
                        }

                        if (day.isToday && day.state === "none") {
                            borderClass = "border-2 border-[#FF6B35]";
                        }

                        return (
              <div key={idx} className="flex flex-col items-center gap-2">
                <div className={`w-[36px] h-[36px] rounded-full flex items-center justify-center \${fillClass} \${borderClass} transition-colors`}>
                  {day.state === "hit" && <div className="w-2 h-2 bg-black rounded-full" />}
                </div>
                <span className={`text-[11px] uppercase tracking-wider \${textClass}`}>
                    {day.dayStr}
                </span>
            </div>
            );
          })}
        </div>
      </div >

        {/* 3. WEEKLY CHART */ }
        < div className = "px-5 mb-12 h-[220px]" >
        <h3 className="font-['Bricolage_Grotesque'] font-bold text-white mb-6 text-[20px]">This Week</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={last7Days} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
            <XAxis dataKey="dayStr" stroke="#60607A" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#60607A" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => Math.round(val/1000)+"k"} />
            <Tooltip 
               cursor={{ fill: '#2A2A3A', opacity: 0.4 }}
               contentStyle={{ backgroundColor: '#1A1A24', border: '1px solid #2A2A3A', borderRadius: '12px' }}
               itemStyle={{ color: '#white', fontFamily: 'DM Sans', fontWeight: 'bold' }}
               labelStyle={{ color: '#A0A0B8', fontFamily: 'DM Sans', fontSize: '13px', marginBottom: '4px' }}
            />
            {/* Reference dashed line */}
            <ReferenceLine y={2000} stroke="#A0A0B8" strokeDasharray="4 4" />
            <Bar dataKey="calories" radius={[4, 4, 0, 0]} maxBarSize={32}>
              {last7Days.map((entry, index) => {
                let color = "#2A2A3A"; // no logs
                if (entry.state === "hit") color = "#2DD4BF";
                if (entry.state === "logged") color = "#FF6B35";
                return <Cell key={`cell-\${index}`} fill={color} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div >

        {/* 4. ROAST SECTION */ }
        < div className = "px-5 pb-[100px]" >
            <h3 className="font-['Bricolage_Grotesque'] font-bold text-white mb-6 text-[20px]">Weekly Roast</h3>

    {
        roastStateA ? (
            // STATE A
            <div className="bg-[#1A1A24] border border-[#2A2A3A] rounded-[24px] p-6 flex flex-col items-center justify-center text-center">
                <Chip emotion="laughing" size={80} />
                <p className="text-white font-['DM_Sans'] text-[15px] mt-4 mb-6 italic">
                    "Drops Sunday. I've been taking notes. 😈"
                </p>
                <button
                    onClick={handleGenerateRoast}
                    disabled={isGenerating}
                    className="bg-transparent border border-[#60607A] text-[#A0A0B8] rounded-[12px] px-6 py-2.5 font-bold font-['DM_Sans'] text-[14px] hover:text-white hover:border-[#A0A0B8] transition-colors disabled:opacity-50"
                >
                    {isGenerating ? "Analyzing week..." : "Roast Me Early"}
                </button>
            </div>
        ) : (
            // STATE B
            <div className="bg-[#1A1A24] border-l-4 border-l-[#FF6B35] rounded-[24px] p-6 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-[#A0A0B8] text-[11px] font-bold uppercase tracking-widest mb-1">Vol. {new Date().getWeek() || 1}</p>
                        <h4 className="text-[#FF6B35] text-[15px] font-bold font-['DM_Sans']">Your Weekly Roast</h4>
                    </div>
                    <Chip emotion={data.roast.mascot_mood} size={48} />
                </div>

                <h2 className="text-[24px] font-black font-['Bricolage_Grotesque'] text-white italic leading-tight mb-4">
                    "{data.roast.roast_title}"
                </h2>

                <p className="text-[#E0E0E0] text-[16px] font-['DM_Sans'] leading-relaxed mb-6 min-h-[80px]">
                    {data.roast.roast_text.substring(0, typewriterIndex)}
                    {typewriterIndex < data.roast.roast_text.length && <span className="animate-pulse">|</span>}
                </p>

                <AnimatePresence>
                    {typewriterIndex >= data.roast.roast_text.length && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4 }}
                        >
                            <div className="bg-[#2DD4BF]/10 border-l-4 border-l-[#2DD4BF] p-4 rounded-r-[16px] mb-6">
                                <p className="text-[#2DD4BF] font-bold text-[11px] uppercase tracking-wide mb-1">Chip's Tip</p>
                                <p className="text-white font-['DM_Sans'] text-[14px]">{data.roast.tip_text}</p>
                            </div>

                            <button
                                onClick={() => setShowShare(true)}
                                className="w-full flex items-center justify-center gap-2 bg-[#2A2A3A] hover:bg-[#323246] transition-colors text-white py-3.5 rounded-[14px] font-bold font-['DM_Sans']"
                            >
                                Share My Roast 🔥
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        )
    }
      </div >

        <ShareableRoast
            roast={data?.roast}
            isVisible={showShare}
            onClose={() => setShowShare(false)}
        />

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
