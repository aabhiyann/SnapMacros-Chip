"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function PWAInstallBanner() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        // Check if previously dismissed
        if (localStorage.getItem("snapmacros_pwa_dismissed")) {
            return;
        }

        const handleBeforeInstallPrompt = (e: Event) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            // Update UI notify the user they can install the PWA
            setShowBanner(true);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        setShowBanner(false);
        if (!deferredPrompt) {
            return;
        }
        // Show the install prompt
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setShowBanner(false);
        localStorage.setItem("snapmacros_pwa_dismissed", "true");
    };

    return (
        <AnimatePresence>
            {showBanner && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="fixed bottom-[100px] left-4 right-4 z-[9999] bg-[#1A1A24] border border-[#2A2A3A] shadow-2xl rounded-2xl p-4 flex items-center justify-between"
                >
                    <div className="flex gap-3 text-left">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#FF8C35] flex flex-shrink-0 items-center justify-center text-white text-[18px]">
                            🥚
                        </div>
                        <div className="flex flex-col flex-1 justify-center">
                            <p className="text-white font-['DM_Sans'] font-bold text-[14px]">Add to Home Screen</p>
                            <p className="text-[#A0A0B8] font-['DM_Sans'] text-[12px]">For the best experience</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleInstallClick}
                            className="bg-[#2DD4BF] text-black font-bold font-['DM_Sans'] text-[13px] px-4 py-2 rounded-lg"
                        >
                            Add
                        </button>
                        <button
                            onClick={handleDismiss}
                            className="text-[#60607A] hover:text-white px-2 py-2"
                        >
                            ✕
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
