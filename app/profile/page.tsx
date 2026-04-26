"use client";
import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { TapButton } from "@/components/ui/TapButton";

interface UserData {
    name: string;
    goal: string;
    joined: string;
    mealsLogged: number;
    bestStreak: number;
    roastsReceived: number;
    targets: { cal: number; pro: number; carb: number; fat: number };
    [key: string]: unknown;
}
import { AppShell } from "@/components/AppShell";
import { LogOut, ChevronRight, Bell, Target, Edit3, Settings, Trash2, Download, type LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Mock out our components for the UI shell building phase
const StatCard = ({ label, value }: { label: string, value: string | number }) => (
    <div className="bg-[#1A1A24] rounded-[16px] border border-[#2A2A3A] flex flex-col items-center justify-center text-center p-3">
        <p className="text-white text-[24px] font-black font-['Bricolage_Grotesque'] leading-none mb-1">{value}</p>
        <p className="text-[#A0A0B8] text-[12px] font-medium font-['DM_Sans'] leading-tight">{label}</p>
    </div>
);

const SettingRow = ({ icon: Icon, label, value, rightElement, onClick, isDanger }: { icon: LucideIcon; label: string; value?: string; rightElement?: JSX.Element; onClick?: () => void; isDanger?: boolean }) => (
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
            {rightElement ? rightElement : (
                <>
                    {value && <span className="text-[#A0A0B8] text-[14px] font-['DM_Sans']">{value}</span>}
                    <ChevronRight size={18} className="text-[#60607A]" />
                </>
            )}
        </div>
    </TapButton>
);

export default function ProfilePage() {
    const router = useRouter();
    const supabase = createClient();
    const [showSignOutConf, setShowSignOutConf] = useState(false);
    const [showDeleteConf, setShowDeleteConf] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [userData, setUserData] = useState<UserData | null>(null);

    const fetchProfile = async () => {
        try {
            const res = await fetch(api("/api/profile"));
            if (!res.ok) throw new Error("Failed to fetch profile");
            const data = await res.json();
            setUserData(data);
        } catch (err) {
            console.error(err);
            setUserData({
                name: "User",
                goal: "Maintain",
                joined: "—",
                mealsLogged: 0,
                bestStreak: 0,
                roastsReceived: 0,
                targets: { cal: 2000, pro: 150, carb: 250, fat: 65 },
            });
        }
    };

    useEffect(() => { fetchProfile(); }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            const res = await fetch(api("/api/account"), { method: "DELETE" });
            if (!res.ok) throw new Error("Deletion failed");
            await supabase.auth.signOut();
            router.push("/login");
        } catch {
            setIsDeleting(false);
            setShowDeleteConf(false);
        }
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
                    <div className="relative bg-gradient-to-br from-[#3B8BF7] to-[#5B9EF8] p-6 rounded-[24px] shadow-[0_12px_40px_rgba(59,139,247,0.25)] overflow-hidden">
                        <div className="flex items-center gap-4 relative z-10">
                            {/* Avatar */}
                            <div className="w-[56px] h-[56px] rounded-full bg-[#5B9EF8] border-2 border-white/20 shadow-md flex items-center justify-center shrink-0">
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
                            <TapButton className="text-[#3B8BF7] text-[14px] font-bold font-['DM_Sans']">
                                Edit
                            </TapButton>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-[#3B8BF7]" />
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
                <div className="px-5 space-y-4">
                    {/* Account section */}
                    <div>
                        <p className="text-[#56566F] font-['DM_Sans'] text-[12px] font-bold uppercase tracking-wider mb-2 px-2">Account</p>
                        <div className="bg-[#13131C] border border-[#2A2A3D] rounded-[24px] overflow-hidden">
                            <SettingRow icon={Edit3} label="Edit Profile" />
                            <SettingRow icon={Target} label="Change Goal" value={userData.goal} onClick={() => router.push("/onboarding?step=1")} />
                            <SettingRow
                                icon={LogOut}
                                label="Sign Out"
                                isDanger
                                onClick={() => setShowSignOutConf(true)}
                            />
                        </div>
                    </div>

                    {/* Preferences */}
                    <div>
                        <p className="text-[#56566F] font-['DM_Sans'] text-[12px] font-bold uppercase tracking-wider mb-2 px-2">Preferences</p>
                        <div className="bg-[#13131C] border border-[#2A2A3D] rounded-[24px] overflow-hidden">
                            <SettingRow icon={Bell} label="Notifications" rightElement={<Switch defaultChecked />} />
                            <SettingRow icon={Settings} label="App Settings" onClick={() => router.push("/settings")} />
                        </div>
                    </div>

                    {/* Data & Privacy */}
                    <div>
                        <p className="text-[#56566F] font-['DM_Sans'] text-[12px] font-bold uppercase tracking-wider mb-2 px-2">Data &amp; Privacy</p>
                        <div className="bg-[#13131C] border border-[#2A2A3D] rounded-[24px] overflow-hidden">
                            <SettingRow
                                icon={Download}
                                label="Export My Data"
                                onClick={() => {
                                    window.open(api("/api/export"), "_blank");
                                }}
                            />
                        </div>
                    </div>

                    {/* Danger zone */}
                    <div>
                        <p className="text-[#56566F] font-['DM_Sans'] text-[12px] font-bold uppercase tracking-wider mb-2 px-2">Danger Zone</p>
                        <div className="bg-[#13131C] border border-[#FF6B6B]/20 rounded-[24px] overflow-hidden">
                            <SettingRow
                                icon={Trash2}
                                label="Delete Account"
                                isDanger
                                onClick={() => setShowDeleteConf(true)}
                            />
                        </div>
                        <p className="text-[#56566F] font-['DM_Sans'] text-[11px] mt-2 px-2">
                            Permanently deletes all your data. This cannot be undone.
                        </p>
                    </div>

                    {/* AI disclaimer */}
                    <div className="bg-[#1C1C28] border border-[#2A2A3D] rounded-[16px] p-4 mt-2">
                        <p className="text-[#9898B3] font-['DM_Sans'] text-[12px] leading-relaxed">
                            ⚕️ Nutrition estimates are generated by AI and may not be fully accurate. SnapMacros is for informational purposes only and is not a substitute for professional nutritional or medical advice.
                        </p>
                    </div>
                </div>
            </div>

            {/* SIGN OUT CONFIRMATION MODAL */}
            <Dialog open={showSignOutConf} onOpenChange={setShowSignOutConf}>
                <DialogContent className="bg-[#1A1A24] border-[#2A2A3A] sm:rounded-[32px] rounded-[32px] p-6 text-center max-w-[340px] [&>button]:hidden">
                    <DialogHeader className="hidden">
                        <DialogTitle>Sign Out</DialogTitle>
                    </DialogHeader>
                    <div className="flex justify-center mb-4 mt-2">
                        <div className="w-16 h-16 rounded-full bg-[#EF4444]/10 flex items-center justify-center text-[#EF4444]">
                            <LogOut size={32} />
                        </div>
                    </div>
                    <h3 className="text-white font-['Bricolage_Grotesque'] font-bold text-[24px] mb-2">Sign out?</h3>
                    <p className="text-[#A0A0B8] font-['DM_Sans'] text-[15px] mb-8">
                        You&apos;ll lose your streak reminder notifications.
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
                </DialogContent>
            </Dialog>

            {/* DELETE ACCOUNT CONFIRMATION MODAL */}
            <Dialog open={showDeleteConf} onOpenChange={setShowDeleteConf}>
                <DialogContent className="bg-[#13131C] border-[#2A2A3D] sm:rounded-[32px] rounded-[32px] p-6 text-center max-w-[340px] [&>button]:hidden">
                    <DialogHeader className="hidden">
                        <DialogTitle>Delete Account</DialogTitle>
                    </DialogHeader>
                    <div className="flex justify-center mb-4 mt-2">
                        <div className="w-16 h-16 rounded-full bg-[#FF6B6B]/10 flex items-center justify-center text-[#FF6B6B]">
                            <Trash2 size={32} />
                        </div>
                    </div>
                    <h3 className="text-white font-['Bricolage_Grotesque'] font-bold text-[24px] mb-2">Delete account?</h3>
                    <p className="text-[#9898B3] font-['DM_Sans'] text-[15px] mb-8">
                        This will permanently delete all your meals, streaks, and account data. This cannot be undone.
                    </p>
                    <div className="flex gap-3">
                        <TapButton
                            onClick={() => setShowDeleteConf(false)}
                            disabled={isDeleting}
                            className="flex-1 py-4 rounded-xl bg-transparent border border-[#56566F] text-white font-bold font-['DM_Sans']"
                        >
                            Cancel
                        </TapButton>
                        <TapButton
                            onClick={handleDeleteAccount}
                            disabled={isDeleting}
                            className="flex-1 py-4 rounded-xl bg-[#FF6B6B] text-white font-bold font-['DM_Sans'] shadow-[0_4px_20px_rgba(255,107,107,0.3)]"
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </TapButton>
                    </div>
                </DialogContent>
            </Dialog>

        </AppShell>
    );
}
