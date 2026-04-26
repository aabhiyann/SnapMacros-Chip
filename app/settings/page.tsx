"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { TapButton } from "@/components/ui/TapButton";
import { Switch } from "@/components/ui/switch";
import { ChevronLeft, Ruler, Info, FileText, Shield, type LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
    const router = useRouter();
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
