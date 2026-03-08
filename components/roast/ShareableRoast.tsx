"use client";

import React, { useRef } from "react";
import html2canvas from "html2canvas";
import { Chip } from "@/components/Chip";
import { WeeklyRoast } from "@/lib/agents/roast-agent";

// We use an absolutely positioned off-screen container for this
export function ShareableRoast({ roast, isVisible, onClose }: { roast: WeeklyRoast, isVisible: boolean, onClose: () => void }) {
    const cardRef = useRef<HTMLDivElement>(null);

    const handleShare = async () => {
        if (!cardRef.current) return;

        try {
            const canvas = await html2canvas(cardRef.current, {
                scale: 2, // High res
                useCORS: true,
                backgroundColor: "#0F0F14",
            });

            canvas.toBlob(async (blob) => {
                if (!blob) return;
                const file = new File([blob], "snapmacros-roast.png", { type: "image/png" });

                if (navigator.share && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        title: "My Weekly Roast 🍳",
                        text: "Chip just roasted my diet this week. Try SnapMacros! 📸",
                        files: [file],
                    });
                } else {
                    // Fallback download if Web Share API isn't supported (e.g. some desktops)
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "snapmacros-roast.png";
                    a.click();
                    URL.revokeObjectURL(url);
                }
                onClose();
            }, "image/png");
        } catch (e) {
            console.error("Share failed", e);
            onClose();
        }
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm flex flex-col items-center">

                {/* The actual card to snapshot (aspect-ratio tailored for IG stories: 9:16 approx) */}
                <div
                    ref={cardRef}
                    className="w-[320px] h-[568px] relative rounded-[32px] overflow-hidden bg-gradient-to-br from-[#1A1A24] to-[#0F0F14] shadow-2xl flex flex-col p-6 border border-[#2A2A3A]"
                >
                    {/* Branding */}
                    <div className="flex items-center justify-between mb-8 opacity-60">
                        <span className="font-heading font-bold text-white text-[16px]">SnapMacros</span>
                        <span className="font-['DM_Sans'] text-[#FF6B35] font-bold text-[13px]">WEEKLY ROAST</span>
                    </div>

                    <div className="flex-1 flex flex-col justify-center">
                        {/* Mascot */}
                        <div className="flex justify-center mb-6">
                            <Chip emotion={roast.mascot_mood} size={140} />
                        </div>

                        {/* Title */}
                        <h2 className="text-[#FFFFFF] text-[28px] font-black font-['Bricolage_Grotesque'] leading-tight mb-4 text-center italic uppercase">
                            "{roast.roast_title}"
                        </h2>

                        {/* Body */}
                        <p className="text-[#A0A0B8] text-[16px] font-['DM_Sans'] leading-relaxed text-center mb-8">
                            {roast.roast_text}
                        </p>

                        {/* Tip */}
                        <div className="bg-[#2DD4BF]/10 border-l-4 border-[#2DD4BF] p-4 rounded-r-[12px]">
                            <p className="text-[#2DD4BF] font-bold text-[11px] mb-1 uppercase tracking-wide">Next Week</p>
                            <p className="text-white font-['DM_Sans'] text-[14px]">
                                {roast.tip_text}
                            </p>
                        </div>
                    </div>

                    {/* Footer watermark */}
                    <div className="mt-6 text-center">
                        <p className="text-[#60607A] font-['DM_Sans'] text-[12px] font-bold tracking-widest">SNAPMACROS.APP</p>
                    </div>
                </div>

                {/* Action Buttons (Not captured in canvas) */}
                <div className="mt-8 flex gap-4 w-[320px]">
                    <button onClick={onClose} className="flex-1 py-3 rounded-full bg-[#2A2A3A] text-white font-bold font-['DM_Sans'] active:scale-95 transition-transform">
                        Cancel
                    </button>
                    <button onClick={handleShare} className="flex-1 py-3 rounded-full bg-[#FF6B35] text-white font-bold font-['DM_Sans'] shadow-[0_4px_20px_rgba(255,107,53,0.3)] active:scale-95 transition-transform">
                        Share to IG
                    </button>
                </div>
            </div>
        </div>
    );
}
