"use client";

import React from "react";
import { Home, Camera, BarChart2, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface Tab {
    name: string;
    path: string;
    icon: React.ElementType;
    activeColor: string;
}

export const BottomNav = React.memo(function BottomNav() {
    const pathname = usePathname();
    const router = useRouter();

    // Hide the nav entirely on specific screens (like snap and result)
    if (pathname.startsWith("/snap") || pathname.startsWith("/onboarding")) return null;

    const TABS: Tab[] = [
        { name: "Home", path: "/dashboard", icon: Home, activeColor: "#3B8BF7" },
        { name: "Progress", path: "/progress", icon: BarChart2, activeColor: "#3B8BF7" },
        { name: "Profile", path: "/profile", icon: User, activeColor: "#3B8BF7" },
    ];

    const handleSnap = (e: React.MouseEvent) => {
        e.preventDefault();
        if (typeof navigator !== "undefined" && navigator.vibrate) {
            navigator.vibrate(50); // medium haptic
        }
        router.push("/snap");
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 h-[calc(64px+env(safe-area-inset-bottom))] bg-[rgba(15,15,20,0.95)] backdrop-blur-[24px] border-t border-white/[0.06] pb-[env(safe-area-inset-bottom)] z-50">
            <div className="flex h-full items-center px-4 relative max-w-md mx-auto">

                {/* Left tab (Home) - 25% width */}
                <div className="flex-[0.25] flex justify-center h-full">
                    <NavItem tab={TABS[0]} isActive={pathname === TABS[0].path} />
                </div>

                {/* spacer for snap button - 50% width total (25% left, 25% right implicitly around it) */}
                <div className="flex-[0.5] flex justify-center relative h-full">
                    {/* Center Elevate Snap Button */}
                    <div className="absolute bottom-[14px] z-10">
                        <motion.button
                            onPointerDown={() => {
                                if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(50);
                            }}
                            onClick={handleSnap}
                            whileTap={{
                                scale: 0.88,
                                boxShadow: "0 0 10px rgba(59,139,247,0.2)"
                            }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            className="w-[60px] h-[60px] rounded-full flex items-center justify-center border-none outline-none focus:outline-none"
                            style={{
                                background: "linear-gradient(145deg, #5B9EF8, #3B8BF7, #2B78E4)",
                                boxShadow: "0 0 0 1px rgba(59,139,247,0.3), 0 0 20px rgba(59,139,247,0.4), 0 8px 24px rgba(0,0,0,0.5)"
                            }}
                        >
                            <Camera size={24} className="text-white" strokeWidth={2.5} />
                        </motion.button>
                    </div>
                </div>

                {/* Right tabs (Progress, Profile) - 12.5% width each visually via flex distribution */}
                <div className="flex-[0.25] flex justify-center h-full">
                    <NavItem tab={TABS[1]} isActive={pathname === TABS[1].path} />
                </div>
                <div className="flex-[0.25] flex justify-center h-full">
                    <NavItem tab={TABS[2]} isActive={pathname === TABS[2].path} />
                </div>
            </div>
        </div>
    );
});

function NavItem({ tab, isActive }: { tab: Tab, isActive: boolean }) {
    const Icon = tab.icon;

    return (
        <Link href={tab.path} className="flex flex-col items-center justify-center w-full h-full relative group">
            <motion.div
                initial={false}
                animate={{
                    color: isActive ? tab.activeColor : "#60607A",
                    y: isActive ? -8 : 0
                }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="relative z-10"
            >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            </motion.div>

            <AnimatePresence>
                {isActive && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-[8px] flex flex-col items-center justify-center"
                    >
                        <span
                            className="text-[10px] font-semibold font-['DM_Sans'] tracking-[0.5px] uppercase"
                            style={{ color: tab.activeColor }}
                        >
                            {tab.name}
                        </span>
                        <div
                            className="w-[3px] h-[3px] rounded-full mt-1"
                            style={{ backgroundColor: tab.activeColor }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </Link>
    );
}
