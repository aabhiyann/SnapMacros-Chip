"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Settings, Award, ChevronRight, User as UserIcon, Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import Chip from "@/components/Chip";
import { createClient } from "@/lib/supabase/client";

// Mock out our components for the UI shell building phase
const StatCard = ({ label, value }: { label: string, value: string | number }) => (
    <div className="flex-1 bg-[#1A1A24] rounded-[16px] border border-[#2A2A3A] p-4 flex flex-col items-center justify-center text-center">
        <p className="text-[#A0A0B8] text-[11px] font-bold uppercase tracking-wider mb-2">{label}</p>
        <p className="text-white text-[24px] font-black font-['Bricolage_Grotesque'] leading-none">{value}</p>
    </div>
);

const SettingRow = ({ icon: Icon, label, value, onClick, isDanger }: any) => (
    <button
        onClick={onClick}
        className="w-full flex items-center justify-between py-4 border-b border-[#2A2A3A] last:border-0 hover:bg-[#2A2A3A]/50 transition-colors px-2 rounded-xl"
    >
        <div className="flex items-center gap-4 text-left">
            <div className={\`w-10 h-10 rounded-full flex items-center justify-center \${isDanger ? 'bg-[#EF4444]/10 text-[#EF4444]' : 'bg-[#2A2A3A] text-white'}\`}>
            <Icon size={18} />
        </div>
        <span className={\`font-['DM_Sans'] font-medium text-[16px] \${isDanger ? 'text-[#EF4444]' : 'text-white'}\`}>{label}</span>
    </div >
    <div className="flex items-center gap-3">
        {value && <span className="text-[#A0A0B8] text-[14px] font-['DM_Sans']">{value}</span>}
        <ChevronRight size={18} className="text-[#60607A]" />
    </div>
  </button >
);

export default function ProfilePage() {
    const router = useRouter();
    const supabase = createClient();
    const [showSignOutConf, setShowSignOutConf] = useState(false);
    const [userData, setUserData] = useState<any>(null);

    useEffect(() => {
        // We would normally fetch current user profile here
        // For now we will mock the presentation data
        setUserData({
            name: "Alex",
            goal: "Maintain",
            joined: "Jan 2026",
            mealsLogged: 42,
            bestStreak: 12,
            roastsReceived: 3,
            targets: { cal: 2150, pro: 160, carb: 200, fat: 80 }
        });
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    if (!userData) return <AppShell><div /></AppShell>;

    return (
        <AppShell>
            <div className="relative pb-[120px]">

                {/* HEADER CARD */}
                <div className="relative bg-gradient-to-br from-[#FF6B35] to-[#FF8C35] pt-[64px] pb-8 px-5 rounded-b-[40px] shadow-[0_12px_40px_rgba(255,107,53,0.15)] overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="flex items-center gap-5 relative z-10">
                        {/* Avatar */}
                        <div className="w-[84px] h-[84px] rounded-full bg-[#1A1A24] border-4 border-[#0F0F14] shadow-xl flex items-center justify-center">
                            <span className="text-white font-black font-['Bricolage_Grotesque'] text-[32px]">
                                {userData.name.charAt(0)}
                            </span>
                        </div>

                        <div className="flex-1">
                            <h1 className="text-[32px] font-black font-['Bricolage_Grotesque'] text-white leading-none tracking-tight mb-2">
                                {userData.name}
                            </h1>
                            <div className="flex gap-2 items-center">
                                <span className="bg-white/20 px-3 py-1 rounded-full text-white text-[12px] font-bold font-['DM_Sans']">
                                    Goal: {userData.goal}
                                </span>
                                <span className="text-white/70 text-[12px] font-['DM_Sans'] font-medium">
                                    Since {userData.joined}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* STATS ROW */}
                <div className="px-5 -mt-6 relative z-20 flex gap-3 mb-8">
                    <StatCard label="Meals Logged" value={userData.mealsLogged} />
                    <StatCard label="Best Streak" value={userData.bestStreak} />
                    <StatCard label="Roasts" value={userData.roastsReceived} />
                </div>

                {/* TARGETS CARD */}
                <div className="px-5 mb-10">
                    <div className="bg-[#1A1A24] rounded-[24px] border border-[#2A2A3A] p-5">
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="text-white font-['Bricolage_Grotesque'] font-bold text-[18px]">Daily Targets</h3>
                            <button className="text-[#FF6B35] text-[13px] font-bold font-['DM_Sans'] px-3 py-1.5 bg-[#FF6B35]/10 rounded-full">
                                Edit
                            </button>
                        </div>

                        <div className="flex justify-between items-end border-b border-[#2A2A3A] pb-5 mb-5">
                            <div>
                                <p className="text-[#A0A0B8] text-[12px] font-bold uppercase tracking-wider mb-1">Calories</p>
                                <p className="text-white text-[32px] font-black font-['Bricolage_Grotesque'] leading-none tracking-tight">
                                    {userData.targets.cal}
                                </p>
                            </div>
                            <div className="w-[48px] h-[48px] rounded-full bg-[#2A2A3A] flex items-center justify-center">
                                <span className="text-[#FF6B35]">🔥</span>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1">
                                <p className="text-[#A0A0B8] text-[11px] font-bold uppercase mb-1">Protein</p>
                                <p className="text-[#FFFFFF] font-bold font-['DM_Sans'] text-[18px]">{userData.targets.pro}g</p>
                            </div>
                            <div className="w-[1px] bg-[#2A2A3A]" />
                            <div className="flex-1 px-4">
                                <p className="text-[#A0A0B8] text-[11px] font-bold uppercase mb-1">Carbs</p>
                                <p className="text-[#FFFFFF] font-bold font-['DM_Sans'] text-[18px]">{userData.targets.carb}g</p>
                            </div>
                            <div className="w-[1px] bg-[#2A2A3A]" />
                            <div className="flex-1 text-right">
                                <p className="text-[#A0A0B8] text-[11px] font-bold uppercase mb-1">Fat</p>
                                <p className="text-[#FFFFFF] font-bold font-['DM_Sans'] text-[18px]">{userData.targets.fat}g</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SETTINGS LIST */}
                <div className="px-5">
                    <h3 className="text-white font-['Bricolage_Grotesque'] font-bold text-[18px] mb-4 pl-2">Settings</h3>
                    <div className="bg-[#1A1A24] border border-[#2A2A3A] rounded-[24px] p-2">
                        <SettingRow icon={UserIcon} label="Edit Profile" />
                        <SettingRow icon={Award} label="Change Goal" value={userData.goal} />
                        <SettingRow icon={Bell} label="Notifications" value="On" />
                        <SettingRow icon={Settings} label="About SnapMacros" value="v1.0.0" />
                        <SettingRow
                            icon={LogOut}
                            label="Sign Out"
                            isDanger
                            onClick={() => setShowSignOutConf(true)}
                        />
                    </div>
                </div>
            </div>

            {/* SIGN OUT CONFIRMATION MODAL */}
            <AnimatePresence>
                {showSignOutConf && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-5"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            className="bg-[#1A1A24] border border-[#2A2A3A] rounded-[32px] w-full max-w-[340px] p-6 text-center shadow-2xl"
                        >
                            <div className="flex justify-center mb-4">
                                <div className="w-16 h-16 rounded-full bg-[#EF4444]/10 flex items-center justify-center text-[#EF4444]">
                                    <LogOut size={32} />
                                </div>
                            </div>
                            <h3 className="text-white font-['Bricolage_Grotesque'] font-bold text-[24px] mb-2">Sign Out?</h3>
                            <p className="text-[#A0A0B8] font-['DM_Sans'] text-[15px] mb-8">
                                Chip will miss you. Are you sure you want to leave?
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowSignOutConf(false)}
                                    className="flex-1 py-4 rounded-xl bg-[#2A2A3A] text-white font-bold font-['DM_Sans']"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSignOut}
                                    className="flex-1 py-4 rounded-xl bg-[#EF4444] text-white font-bold font-['DM_Sans'] shadow-[0_4px_20px_rgba(239,68,68,0.3)]"
                                >
                                    Sign Out
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </AppShell>
    );
}
