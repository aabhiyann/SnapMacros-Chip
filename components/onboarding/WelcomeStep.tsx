"use client";
import { TapButton } from "@/components/ui/TapButton";

import { motion } from "framer-motion";
import { Chip } from "@/components/Chip";

export function WelcomeStep({ onNext }: { onNext: () => void }) {
    return (
        <div className="flex-1 flex flex-col px-[20px] pt-[80px] pb-[160px] overflow-y-auto w-full max-w-md mx-auto relative h-screen">

            {/* 1. Bouncing Chip (0.2s) & Speech Bubble (0.6s) */}
            <div className="flex flex-col items-center justify-center mb-6">
                <motion.div
                    initial={{ y: -200, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.2 }}
                >
                    <Chip emotion="hype" size={150} />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.4 }}
                    className="mt-6 bg-[#1A1A24] border border-[#2A2A3A] rounded-[16px] px-5 py-3 shadow-[0_4px_24px_rgba(0,0,0,0.50)] relative"
                >
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#1A1A24] border-t border-l border-[#2A2A3A] rotate-45" />
                    <p className="font-['DM_Sans'] text-[15px] font-medium text-white relative z-10 leading-relaxed text-center">
                        Hey! I'm Chip. 🥚<br /><span className="text-[#A0A0B8]">Your nutrition best friend.</span>
                    </p>
                </motion.div>
            </div>

            {/* 2. Hero Content (0.8s, 1.0s, 1.2s staggering) */}
            <div className="text-center flex-1 flex flex-col items-center mt-4">
                <motion.h1
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.4 }}
                    className="font-['Bricolage_Grotesque'] text-[40px] font-bold leading-[1.1] mb-4 bg-gradient-to-b from-white to-[#A0A0B8] text-transparent bg-clip-text"
                >
                    Snap. Track.<br />Roast.
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.0, duration: 0.4 }}
                    className="font-['DM_Sans'] text-[#A0A0B8] text-[15px] leading-relaxed max-w-[300px] mb-8"
                >
                    Photograph your food for instant macro analysis. Set goals. Get roasted by me. Let's go.
                </motion.p>

                <div className="flex flex-wrap justify-center gap-3">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2, type: "spring", stiffness: 300, damping: 25 }}
                        className="bg-[#FF6B35]/10 border border-[#FF6B35]/30 text-[#FF6B35] px-4 py-2 rounded-full font-['DM_Sans'] font-bold text-[14px]"
                    >
                        📷 Snap Food
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.28, type: "spring", stiffness: 300, damping: 25 }}
                        className="bg-[#6C63FF]/10 border border-[#6C63FF]/30 text-[#6C63FF] px-4 py-2 rounded-full font-['DM_Sans'] font-bold text-[14px]"
                    >
                        💪 Track Macros
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.36, type: "spring", stiffness: 300, damping: 25 }}
                        className="bg-[#FF4535]/10 border border-[#FF4535]/30 text-[#FF4535] px-4 py-2 rounded-full font-['DM_Sans'] font-bold text-[14px]"
                    >
                        🔥 Get Roasted
                    </motion.div>
                </div>
            </div>

            {/* 3. Action (1.4s, 1.6s) */}
            <div className="fixed bottom-0 left-0 w-full p-[20px] pb-[max(20px,env(safe-area-inset-bottom))] bg-gradient-to-t from-[#0F0F14] via-[#0F0F14] to-transparent z-50 flex flex-col items-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4, type: "spring", stiffness: 300, damping: 25 }}
                    className="w-full"
                >
                    <TapButton
                        onClick={onNext}
                        className="w-full h-[56px] bg-[#FF6B35] rounded-[16px] font-['DM_Sans'] text-[18px] font-bold text-white shadow-[0_8px_32px_rgba(255,107,53,0.35)] transition-transform active:scale-[0.98] mb-4"
                    >
                        Let's Get Started &rarr;
                    </TapButton>
                </motion.div>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.6, duration: 0.4 }}
                    className="font-['DM_Sans'] text-[13px] text-[#A0A0B8] tracking-wide bg-[#0F0F14] px-4"
                >
                    Less than 60 seconds <span className="mx-2 font-black">·</span> Free
                </motion.p>
            </div>
        </div>
    );
}
