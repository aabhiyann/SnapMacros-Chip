"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { TapButton } from "@/components/ui/TapButton";
import { Switch } from "@/components/ui/switch";
import { ChevronLeft, Ruler, Info, FileText, Shield, type LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";

const APP_VERSION = "1.0.0";
const UNITS_KEY = "snapmacros_units";
type UnitSystem = "metric" | "imperial";

function SettingRow({
    icon: Icon, label, value, rightElement, onClick,
}: {
    icon: LucideIcon; label: string; value?: string;
    rightElement?: React.ReactNode; onClick?: () => void;
}) {
    return (
        <TapButton
            onClick={onClick}
            className="w-full flex items-center justify-between py-4 border-b border-[#2A2A3A] last:border-0 hover:bg-[#2A2A3A]/50 transition-colors px-2 rounded-xl"
        >
            <div className="flex items-center gap-4 text-left">
                <div className="w-[36px] h-[36px] rounded-[10px] bg-[#2A2A3A] text-white flex items-center justify-center shrink-0">
                    <Icon size={18} strokeWidth={2.5} />
                </div>
                <span className="font-['DM_Sans'] font-medium text-[16px] text-white">{label}</span>
            </div>
            <div className="flex items-center gap-3">
                {rightElement ?? (value && <span className="text-[#A0A0B8] text-[14px] font-['DM_Sans']">{value}</span>)}
            </div>
        </TapButton>
    );
}

export default function SettingsPage() {
    const router = useRouter();
    const [units, setUnits] = useState<UnitSystem>("metric");

    useEffect(() => {
        const stored = localStorage.getItem(UNITS_KEY);
        if (stored === "metric" || stored === "imperial") setUnits(stored);
    }, []);

    function toggleUnits(checked: boolean) {
        const next: UnitSystem = checked ? "imperial" : "metric";
        setUnits(next);
        localStorage.setItem(UNITS_KEY, next);
    }

    return (
        <AppShell>
            <div className="relative pb-[120px]">
                <div className="flex items-center gap-3 px-5 pt-5 pb-6">
                    <TapButton
                        onClick={() => router.back()}
                        className="w-[36px] h-[36px] rounded-full bg-[#1A1A24] border border-[#2A2A3A] flex items-center justify-center"
                    >
                        <ChevronLeft size={20} className="text-white" />
                    </TapButton>
                    <h1 className="text-[22px] font-black font-['Bricolage_Grotesque'] text-white tracking-tight">
                        Settings
                    </h1>
                </div>
            </div>
        </AppShell>
    );
}
