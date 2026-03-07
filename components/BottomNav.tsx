"use client";

import React from "react";
import { Home, Camera, BarChart2, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

export const BottomNav = React.memo(function BottomNav() {
    const pathname = usePathname();

    // Hide the nav entirely on specific screens (like snap and result)
    if (pathname.startsWith("/snap")) return null;

    const TABS = [
        { name: "Home", path: "/dashboard", icon: Home },
        { name: "Progress", path: "/progress", icon: BarChart2 },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 h-[72px] bg-[#1A1A24] border-t border-[#2A2A3A] pb-[env(safe-area-inset-bottom)] z-50">
            <div className="flex h-full items-center justify-around px-4 relative max-w-md mx-auto">

                {/* Left tabs */}
                <NavItem tab={TABS[0]} isActive={pathname === TABS[0].path} />

                {/* Center Elevate Snap Button */}
                <div className="relative -top-6">
                    <Link href="/snap">
                        <div className="w-[64px] h-[64px] rounded-full bg-[#FF6B35] flex items-center justify-center shadow-[0_4px_20px_rgba(255,107,53,0.50)] transition-transform hover:scale-105 active:scale-95 border-4 border-[#0F0F14]">
                            <Camera size={28} className="text-white fill-current" />
                        </div>
                    </Link>
                </div>

                {/* Right tabs */}
                <NavItem tab={TABS[1]} isActive={pathname === TABS[1].path} />

                {/* Placeholder for Profile */}
                <NavItem tab={{ name: "Profile", path: "/profile", icon: User }} isActive={pathname === "/profile"} />
            </div>
        </div>
    );
});

function NavItem({ tab, isActive }: { tab: any, isActive: boolean }) {
    const Icon = tab.icon;
    return (
        <Link href={tab.path} className="flex flex-col items-center justify-center w-16 gap-1 group">
            <Icon
                size={24}
                className={cn(
                    "transition-colors",
                    isActive ? "text-[#FF6B35]" : "text-[#60607A] group-hover:text-[#A0A0B8]"
                )}
            />
            {isActive ? (
                <span className="text-[10px] font-bold text-[#FF6B35] font-['DM_Sans'] tracking-wider uppercase">
                    {tab.name}
                </span>
            ) : (
                <div className="w-[4px] h-[4px] rounded-full bg-transparent group-hover:bg-[#2A2A3A] transition-colors" />
            )}
            {isActive && (
                <div className="absolute bottom-1 w-[4px] h-[4px] rounded-full bg-[#FF6B35]" />
            )}
        </Link>
    );
}
