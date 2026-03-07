"use client";

import { motion } from "framer-motion";
import Chip from "@/components/Chip";

export function WelcomeStep({ onNext }: { onNext: () => void }) {
    return (
        <div className="flex-1 flex flex-col px-[20px] pt-[80px] pb-[40px]">

            {/* 1. Bouncing Chip */}
            <motion.div
                initial={{ y: -200, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.1 }}
                className="flex flex-col items-center justify-center mb-10"
            >
                <Chip emotion="hype" size={150} />
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                    className="mt-6 bg-[#1A1A24] border border-[#2A2A3A] rounded-[16px] px-5 py-3 shadow-[0_4px_24px_rgba(0,0,0,0.50)] relative"
                >
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#1A1A24] border-t border-l border-[#2A2A3A] rotate-45" />
                    <p className="font-['DM_Sans'] text-[15px] font-medium text-white relative z-10 leading-relaxed">
                        Hey! I'm Chip. 🥚<br /><span className="text-[#A0A0B8]">Your nutrition best friend.</span>
                    </p>
                </motion.div>
            </motion.div>

            {/* 2. Hero Content */}
            <div className="text-center mb-8 flex-1">
                <h1 className="font-['Bricolage_Grotesque'] text-[40px] font-bold leading-[1.1] mb-8 bg-gradient-to-b from-white to-[#A0A0B8] text-transparent bg-clip-text">
                    Snap. Track.<br />Roast.
                </h1>

                <div className="flex flex-wrap justify-center gap-3">
                    <div className="bg-[#FF6B35]/10 border border-[#FF6B35]/30 text-[#FF6B35] px-4 py-2 rounded-full font-['DM_Sans'] font-bold text-[14px]">
                        📷 Snap Food
                    </div>
                    <div className="bg-[#6C63FF]/10 border border-[#6C63FF]/30 text-[#6C63FF] px-4 py-2 rounded-full font-['DM_Sans'] font-bold text-[14px]">
                        💪 Track Macros
                    </div>
                    <div className="bg-[#FF4535]/10 border border-[#FF4535]/30 text-[#FF4535] px-4 py-2 rounded-full font-['DM_Sans'] font-bold text-[14px]">
                        🔥 Get Roasted
                    </div>
                </div>
            </div>

            {/* 3. Action */}
            <div className="w-full flex flex-col items-center">
                <button
                    onClick={onNext}
                    className="w-full h-[60px] bg-[#FF6B35] rounded-[16px] font-['DM_Sans'] text-[18px] font-bold text-white shadow-[0_8px_32px_rgba(255,107,53,0.35)] transition-transform active:scale-[0.98] mb-4"
                >
                    Let's Get Started &rarr;
                </button>
                <p className="font-['DM_Sans'] text-[13px] text-[#A0A0B8] tracking-wide">
                    Less than 60 seconds <span className="mx-2 font-black">·</span> Free
                </p>
            </div>
        </div>
    );
}
