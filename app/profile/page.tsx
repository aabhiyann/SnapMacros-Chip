"use client";
import { TapButton } from "@/components/ui/TapButton";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Settings, Award, ChevronRight, User as UserIcon, Bell, Target, Edit3, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { Chip } from "@/components/Chip";
import { createClient } from "@/lib/supabase/client";

// Mock out our components for the UI shell building phase
const StatCard = ({ label, value }: { label: string, value: string | number }) => (
    <div className="bg-[#1A1A24] rounded-[16px] border border-[#2A2A3A] flex flex-col items-center justify-center text-center p-3">
        <p className="text-white text-[24px] font-black font-['Bricolage_Grotesque'] leading-none mb-1">{value}</p>
        <p className="text-[#A0A0B8] text-[12px] font-medium font-['DM_Sans'] leading-tight">{label}</p>
    </div>
);

const SettingRow = ({ icon: Icon, label, value, onClick, isDanger }: any) => (
    <TapButton
        onClick={onClick}
        className="w-full flex items-center justify-between py-4 border-b border-[#2A2A3A] last:border-0 hover:bg-[#2A2A3A]/50 transition-colors px-2 rounded-xl"
    >
        <div className="flex items-center gap-4 text-left">
            <div className={`w-[36px] h-[36px] rounded-[10px] flex items-center justify-center shrink-0 ${isDanger ? 'bg-[#EF4444]/10 text-[#EF4444]' : 'bg-[#2A2A3A] text-white'}`}>
                <Icon size={18} strokeWidth={2.5} />
            </div>
            <span className={`font-['DM_Sans'] font-medium text-[16px] ${isDanger ? 'text-[#EF4444]' : 'text-white'}`}>{label}</span>
        </div>
        <div className="flex items-center gap-3">
            {value && <span className="text-[#A0A0B8] text-[14px] font-['DM_Sans']">{value}</span>}
            <ChevronRight size={18} className="text-[#60607A]" />
        </div>
    </TapButton>
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

    function ProfileSkeleton() {
        return (
            <AppShell>
                <div className="relative pb-[120px] animate-pulse">
                    <div className="px-5 mt-4 mb-8">
                        <div className="bg-[#1A1A24] h-[120px] rounded-[24px] border border-[#2A2A3A]" />
                    </div>
                    <div className="px-5 grid grid-cols-3 gap-3 mb-8">
                        <div className="h-[90px] bg-[#1A1A24] rounded-[16px] border border-[#2A2A3A]" />
                        <div className="h-[90px] bg-[#1A1A24] rounded-[16px] border border-[#2A2A3A]" />
                        <div className="h-[90px] bg-[#1A1A24] rounded-[16px] border border-[#2A2A3A]" />
                    </div>
                    <div className="px-5 mb-10">
                        <div className="h-[240px] bg-[#1A1A24] rounded-[24px] border border-[#2A2A3A]" />
                    </div>
                </div>
            </AppShell>
        );
    }

    if (!userData) return <ProfileSkeleton />;

    return (
        <AppShell>
            <div className="relative pb-[120px]">

                {/* HEADER CARD */}
                <div className="px-5 mt-4 mb-8">
                    <div className="relative bg-gradient-to-br from-[#FF6B35] to-[#FF8C35] p-6 rounded-[24px] shadow-[0_12px_40px_rgba(255,107,53,0.25)] overflow-hidden">
                        <div className="flex items-center gap-4 relative z-10">
                            {/* Avatar */}
                            <div className="w-[56px] h-[56px] rounded-full bg-[#FF8C35] border-2 border-white/20 shadow-md flex items-center justify-center shrink-0">
                                <span className="text-white font-black font-['Bricolage_Grotesque'] text-[20px]">
                                    {userData.name.charAt(0)}
                                </span>
                            </div>

                            <div className="flex-1">
                                <h2 className="text-[24px] font-black font-['Bricolage_Grotesque'] text-white leading-none tracking-tight mb-2">
                                    {userData.name}
                                </h2>
                                <div className="flex flex-col gap-1">
                                    <div className="inline-flex items-center self-start">
                                        <span className="bg-white/20 px-3 py-1 rounded-full text-white text-[12px] font-bold font-['DM_Sans']">
                                            🎯 {userData.goal}
                                        </span>
                                    </div>
                                    <span className="text-white/70 text-[13px] font-['DM_Sans'] font-medium mt-1">
                                        Member since {userData.joined}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* STATS ROW */}
                <div className="px-5 grid grid-cols-3 gap-3 mb-8">
                    <StatCard label="Total meals logged" value={userData.mealsLogged} />
                    <StatCard label="Best streak" value={userData.bestStreak} />
                    <StatCard label="Roasts received" value={userData.roastsReceived} />
                </div>

                {/* TARGETS CARD */}
                <div className="px-5 mb-10">
                    <div className="bg-[#1A1A24] rounded-[24px] border border-[#2A2A3A] p-5">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-white font-['Bricolage_Grotesque'] font-bold text-[18px]">Daily Targets</h3>
                            <TapButton className="text-[#FF6B35] text-[14px] font-bold font-['DM_Sans']">
                                Edit
                            </TapButton>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-[#FF6B35]" />
                                    <span className="font-['DM_Sans'] text-[15px] font-medium text-white">Calories</span>
                                </div>
                                <span className="font-['Bricolage_Grotesque'] font-bold text-[18px] text-white">{userData.targets.cal}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-[#6C63FF]" />
                                    <span className="font-['DM_Sans'] text-[15px] font-medium text-white">Protein</span>
                                </div>
                                <span className="font-['Bricolage_Grotesque'] font-bold text-[18px] text-white">{userData.targets.pro}g</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-[#2DD4BF]" />
                                    <span className="font-['DM_Sans'] text-[15px] font-medium text-white">Carbs</span>
                                </div>
                                <span className="font-['Bricolage_Grotesque'] font-bold text-[18px] text-white">{userData.targets.carb}g</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-[#FBBF24]" />
                                    <span className="font-['DM_Sans'] text-[15px] font-medium text-white">Fat</span>
                                </div>
                                <span className="font-['Bricolage_Grotesque'] font-bold text-[18px] text-white">{userData.targets.fat}g</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SETTINGS LIST */}
                <div className="px-5">
                    <div className="bg-[#1A1A24] border border-[#2A2A3A] rounded-[24px] overflow-hidden">
                        <SettingRow icon={Edit3} label="Edit Profile" />
                        <SettingRow icon={Target} label="Change Goal" value={userData.goal} onClick={() => router.push('/onboarding?step=1')} />
                        <SettingRow icon={Bell} label="Notifications" value="On" />
                        <SettingRow icon={Info} label="About SnapMacros" value="v1.0.0" />
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
                            <h3 className="text-white font-['Bricolage_Grotesque'] font-bold text-[24px] mb-2">Sign out?</h3>
                            <p className="text-[#A0A0B8] font-['DM_Sans'] text-[15px] mb-8">
                                You'll lose your streak reminder notifications.
                            </p>

                            <div className="flex gap-3">
                                <TapButton
                                    onClick={() => setShowSignOutConf(false)}
                                    className="flex-1 py-4 rounded-xl bg-transparent border border-[#60607A] text-white font-bold font-['DM_Sans']"
                                >
                                    Cancel
                                </TapButton>
                                <TapButton
                                    onClick={handleSignOut}
                                    className="flex-1 py-4 rounded-xl bg-[#EF4444] text-white font-bold font-['DM_Sans'] shadow-[0_4px_20px_rgba(239,68,68,0.3)]"
                                >
                                    Sign Out
                                </TapButton>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </AppShell>
    );
}
