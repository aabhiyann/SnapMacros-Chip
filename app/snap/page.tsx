"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import { useRouter } from "next/navigation";
import { X, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BottomSheet } from "@/components/BottomSheet";
import Chip from "@/components/Chip";

const PLACEHOLDERS = [
    "A double cheeseburger with medium fries...",
    "Grilled chicken salad with vinaigrette...",
    "Two slices of pepperoni pizza...",
    "A bowl of oatmeal with blueberries...",
];

export default function SnapPage() {
    const router = useRouter();
    const webcamRef = useRef<Webcam>(null);

    const [hasCamera, setHasCamera] = useState<boolean | null>(null);
    const [isFlashing, setIsFlashing] = useState(false);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [placeholderIdx, setPlaceholderIdx] = useState(0);
    const [description, setDescription] = useState("");

    useEffect(() => {
        const timer = setInterval(() => {
            setPlaceholderIdx((prev) => (prev + 1) % PLACEHOLDERS.length);
        }, 3000);
        return () => clearInterval(timer);
    }, []);

    const handleUserMedia = () => setHasCamera(true);
    const handleUserMediaError = () => setHasCamera(false);

    const capture = useCallback(() => {
        if (webcamRef.current) {
            const imageSrc = webcamRef.current.getScreenshot();
            if (imageSrc) {
                // Flash effect
                setIsFlashing(true);
                setTimeout(() => setIsFlashing(false), 80);

                // Save to session and push
                sessionStorage.setItem("snap_image", imageSrc);
                router.push("/snap/result");
            }
        }
    }, [webcamRef, router]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                sessionStorage.setItem("snap_image", base64);
                router.push("/snap/result");
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDescribeSubmit = () => {
        if (!description.trim()) return;
        sessionStorage.setItem("snap_description", description);
        sessionStorage.removeItem("snap_image");
        router.push("/snap/result");
    };

    // ---------------------------------------------------------------------------
    // RENDER: No Camera Fallback
    // ---------------------------------------------------------------------------
    if (hasCamera === false) {
        return (
            <main className="min-h-screen bg-[#0F0F14] text-[#FFFFFF] px-[20px] flex flex-col pt-[48px]">
                <div className="flex justify-between items-center mb-8">
                    <button
                        onClick={() => router.push("/dashboard")}
                        className="w-[44px] h-[44px] rounded-full bg-[#1A1A24] flex items-center justify-center border border-[#2A2A3A]"
                    >
                        <X size={20} className="text-white" />
                    </button>
                </div>

                <div className="flex flex-col items-center justify-center flex-grow pb-[72px]">
                    <Chip emotion="thinking" size={100} />
                    <h1 className="font-['Bricolage_Grotesque'] text-[28px] font-bold mt-6 mb-2">No camera found.</h1>
                    <p className="text-[#A0A0B8] mb-8 text-center font-['DM_Sans'] text-[16px]">
                        We couldn't access your camera. Describe your meal instead.
                    </p>

                    <div className="w-full relative">
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={PLACEHOLDERS[placeholderIdx]}
                            className="w-full bg-[#22222F] border border-[#2A2A3A] rounded-[12px] p-4 text-[#FFFFFF] font-['DM_Sans'] text-[16px] h-[120px] resize-none focus:outline-none focus:border-[#FF6B35]"
                        />
                        <button
                            onClick={handleDescribeSubmit}
                            disabled={!description.trim()}
                            className="mt-4 w-full h-[56px] rounded-[14px] bg-[#FF6B35] text-white font-['DM_Sans'] text-[16px] font-semibold disabled:opacity-50"
                        >
                            Analyze This
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    // ---------------------------------------------------------------------------
    // RENDER: Active Camera Screen
    // ---------------------------------------------------------------------------
    return (
        <main className="fixed inset-0 bg-[#0F0F14] overflow-hidden">
            {/* 1. Camera Preview */}
            <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                screenshotQuality={0.85}
                videoConstraints={{ facingMode: "environment" }}
                onUserMedia={handleUserMedia}
                onUserMediaError={handleUserMediaError}
                className="w-full h-full object-cover"
            />

            {/* 2. Vignette */}
            <div
                className="absolute inset-0 pointer-events-none z-10"
                style={{ background: "radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.5) 100%)" }}
            />

            {/* 3. Top Bar */}
            <div className="absolute top-0 left-0 right-0 z-50 px-[20px] pt-[48px] flex justify-between items-center">
                <button
                    onClick={() => router.push("/dashboard")}
                    className="w-[44px] h-[44px] rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10"
                >
                    <X size={20} className="text-white" />
                </button>

                <label className="w-[44px] h-[44px] rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 cursor-pointer">
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                    />
                    <ImageIcon size={20} className="text-white" />
                </label>
            </div>

            {/* 4. Capture Frame */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] z-20 flex flex-col items-center pointer-events-none">
                <div className="w-[280px] h-[280px] relative mb-4">
                    <motion.div
                        animate={{ opacity: [0.5, 1.0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0"
                    >
                        {/* Top Left */}
                        <div className="absolute top-0 left-0 w-[24px] h-[3px] bg-[#FF6B35] rounded-full" />
                        <div className="absolute top-0 left-0 w-[3px] h-[24px] bg-[#FF6B35] rounded-full" />
                        {/* Top Right */}
                        <div className="absolute top-0 right-0 w-[24px] h-[3px] bg-[#FF6B35] rounded-full" />
                        <div className="absolute top-0 right-0 w-[3px] h-[24px] bg-[#FF6B35] rounded-full" />
                        {/* Bottom Left */}
                        <div className="absolute bottom-0 left-0 w-[24px] h-[3px] bg-[#FF6B35] rounded-full" />
                        <div className="absolute bottom-0 left-0 w-[3px] h-[24px] bg-[#FF6B35] rounded-full" />
                        {/* Bottom Right */}
                        <div className="absolute bottom-0 right-0 w-[24px] h-[3px] bg-[#FF6B35] rounded-full" />
                        <div className="absolute bottom-0 right-0 w-[3px] h-[24px] bg-[#FF6B35] rounded-full" />
                    </motion.div>
                </div>
                <div className="px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-white text-[13px] font-['DM_Sans']">
                    Point at your food
                </div>
            </div>

            {/* 5. Bottom Bar */}
            <div
                className="absolute bottom-0 left-0 right-0 z-30 pt-16 pb-[calc(72px+env(safe-area-inset-bottom))] flex flex-col items-center"
                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)" }}
            >
                <button
                    onClick={capture}
                    className="relative w-[80px] h-[80px] flex items-center justify-center rounded-full border-[3px] border-white group"
                >
                    <motion.div
                        whileTap={{ scale: 1.15 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="w-[64px] h-[64px] bg-white rounded-full"
                    />
                </button>

                <button
                    onClick={() => setIsSheetOpen(true)}
                    className="mt-6 text-[14px] text-[#A0A0B8] font-['DM_Sans'] active:text-white"
                >
                    or describe your meal
                </button>
            </div>

            {/* Flash Effect */}
            <AnimatePresence>
                {isFlashing && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.08 }}
                        className="absolute inset-0 bg-white/15 z-50 pointer-events-none"
                    />
                )}
            </AnimatePresence>

            {/* Describe Meal Bottom Sheet */}
            <BottomSheet isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)}>
                <div className="relative pt-4 pb-6">
                    <div className="absolute -top-12 -right-2">
                        <Chip emotion="thinking" size={48} />
                    </div>

                    <h2 className="text-[22px] font-semibold text-white font-['DM_Sans'] mb-4">
                        Describe your meal
                    </h2>

                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder={PLACEHOLDERS[placeholderIdx]}
                        className="w-full bg-[#22222F] border border-[#2A2A3A] rounded-[12px] p-4 text-[#FFFFFF] font-['DM_Sans'] text-[16px] h-[120px] resize-none focus:outline-none focus:border-[#FF6B35]"
                    />

                    <button
                        onClick={handleDescribeSubmit}
                        disabled={!description.trim()}
                        className="mt-4 w-full h-[56px] rounded-[14px] bg-[#FF6B35] text-white font-['DM_Sans'] text-[16px] font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        Analyze This &rarr;
                    </button>
                </div>
            </BottomSheet>
        </main>
    );
}
