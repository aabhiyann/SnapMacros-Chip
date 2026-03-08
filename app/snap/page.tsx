"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import { useRouter } from "next/navigation";
import { X, Image as ImageIcon, Zap, ZapOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BottomSheet } from "@/components/BottomSheet";
import { Chip } from "@/components/Chip";
import { TapButton } from "@/components/ui/TapButton";

const DescribeMealSheet = ({ isOpen, onClose, onSubmit, isAnalyzing }: any) => {
    const [desc, setDesc] = useState("");
    return (
        <BottomSheet isOpen={isOpen} onClose={onClose} className="bg-[#22222F]">
            <div className="p-5 pb-8 relative">
                <div className="absolute -top-[52px] right-6">
                    <Chip emotion="thinking" size={64} />
                </div>
                <h3 className="font-['Bricolage_Grotesque'] text-[22px] font-bold text-white mb-4">Describe your meal</h3>
                <textarea
                    autoFocus
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="e.g., grilled salmon with rice and broccoli"
                    className="w-full h-[120px] bg-[#1A1A24] border border-[#2A2A3A] rounded-[16px] p-4 text-white font-['DM_Sans'] text-[15px] resize-none focus:outline-none focus:border-[#3B8BF7] transition-colors mb-4 placeholder:text-[#60607A]"
                />
                <button
                    onClick={() => onSubmit(desc)}
                    disabled={!desc.trim() || isAnalyzing}
                    className="w-full h-[56px] rounded-[16px] bg-[#3B8BF7] text-white font-['DM_Sans'] text-[16px] font-bold flex items-center justify-center disabled:opacity-50 active:scale-[0.98] transition-all"
                >
                    {isAnalyzing ? "Analyzing..." : "Analyze This \u2192"}
                </button>
            </div>
        </BottomSheet>
    );
};

const PLACEHOLDERS = [
    "e.g., grilled salmon with rice and broccoli",
    "A double cheeseburger with medium fries...",
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

    // Flash / Torch state
    const [torchSupported, setTorchSupported] = useState(false);
    const [isTorchOn, setIsTorchOn] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);

    useEffect(() => {
        const timer = setInterval(() => {
            setPlaceholderIdx((prev) => (prev + 1) % PLACEHOLDERS.length);
        }, 3000);
        return () => clearInterval(timer);
    }, []);

    const handleUserMedia = (stream: MediaStream) => {
        setHasCamera(true);
        // Check for torch support
        const track = stream.getVideoTracks()[0];
        if (track) {
            const capabilities = track.getCapabilities && track.getCapabilities();
            // @ts-ignore - TS doesn't officially fully type all capabilities everywhere yet
            if (capabilities && capabilities.torch) {
                setTorchSupported(true);
            }
        }
    };

    const toggleTorch = useCallback(async () => {
        if (!webcamRef.current || !webcamRef.current.stream) return;
        const track = webcamRef.current.stream.getVideoTracks()[0];
        if (track) {
            try {
                const newTorchState = !isTorchOn;
                await track.applyConstraints({
                    advanced: [{ torch: newTorchState } as any]
                });
                setIsTorchOn(newTorchState);
            } catch (error) {
                console.error("Failed to toggle torch", error);
            }
        }
    }, [isTorchOn]);

    const handleUserMediaError = () => setHasCamera(false);

    const capture = useCallback(() => {
        if (webcamRef.current) {
            const imageSrc = webcamRef.current.getScreenshot();
            if (imageSrc) {
                // Flash effect
                setIsFlashing(true);
                setTimeout(() => setIsFlashing(false), 80);

                // Save to session 
                sessionStorage.setItem("snap_image", imageSrc);
                setCapturedImage(imageSrc);

                // wait 600ms for thumbnail animation before routing
                setTimeout(() => {
                    router.push("/snap/result");
                }, 600);
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

    // Shared "Describe Meal" JSX for both Sheet and Fallback
    const renderDescribeForm = () => (
        <>
            <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={PLACEHOLDERS[placeholderIdx]}
                className="w-full bg-black/20 border border-[#2A2A3A] rounded-[12px] p-4 text-[#FFFFFF] font-['DM_Sans'] text-[16px] h-[120px] resize-none focus:outline-none focus:border-[#3B8BF7] transition-colors"
                style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
            />
            <button
                onClick={handleDescribeSubmit}
                disabled={!description.trim()}
                className="mt-4 w-full h-[56px] rounded-[14px] bg-[#3B8BF7] text-white font-['DM_Sans'] text-[16px] font-semibold flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition-transform"
            >
                Analyze This &rarr;
            </button>
        </>
    );

    // ---------------------------------------------------------------------------
    // RENDER: No Camera Fallback
    // ---------------------------------------------------------------------------
    if (hasCamera === false) {
        return (
            <main className="min-h-screen bg-[#0F0F14] flex flex-col pt-[48px] px-5 relative">
                <div className="absolute top-[env(safe-area-inset-top,20px)] left-[20px] z-50">
                    <button
                        onClick={() => router.push("/dashboard")}
                        className="w-[48px] h-[48px] rounded-full bg-[#1A1A24] flex items-center justify-center border border-[#2A2A3A]"
                    >
                        <X size={20} className="text-white" />
                    </button>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center text-center -mt-10">
                    <Chip emotion="thinking" size={100} className="mb-6 drop-shadow-[0_0_30px_rgba(59,139,247,0.3)]" />
                    <h2 className="font-['Bricolage_Grotesque'] text-[28px] font-bold text-white mb-3 tracking-tight">Camera access blocked.</h2>
                    <p className="text-[#A0A0B8] text-[15px] font-['DM_Sans'] max-w-[280px] mx-auto mb-8 leading-relaxed">
                        Allow camera in Settings or describe your meal instead.
                    </p>

                    <div className="w-full relative max-w-[340px] px-2 space-y-3">
                        <TapButton
                            onClick={() => window.open('app-settings:', '_blank')}
                            className="w-full py-4 rounded-xl bg-transparent border border-[#60607A] text-white font-bold font-['DM_Sans'] text-[15px]"
                        >
                            Open Settings
                        </TapButton>
                        <TapButton
                            onClick={() => setIsSheetOpen(true)}
                            className="w-full py-4 rounded-xl bg-[#2A2A3A] text-white font-bold font-['DM_Sans'] text-[15px]"
                        >
                            Describe Instead
                        </TapButton>
                    </div>

                    <DescribeMealSheet
                        isOpen={isSheetOpen}
                        onClose={() => setIsSheetOpen(false)}
                        onSubmit={(text: string) => {
                            setDescription(text);
                            handleDescribeSubmit();
                        }}
                        isAnalyzing={false}
                    />
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
                style={{ objectFit: 'cover' }}
            />

            {/* 2. Vignette */}
            <div
                className="absolute inset-0 pointer-events-none z-10"
                style={{ background: "radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.5) 100%)" }}
            />

            {/* 3. Top Bar */}
            <div className="absolute top-[env(safe-area-inset-top)] left-0 right-0 z-50 px-[20px] pt-4 flex justify-between items-center">
                <button
                    onClick={() => router.push("/dashboard")}
                    className="w-[44px] h-[44px] rounded-full bg-[rgba(0,0,0,0.5)] backdrop-blur-[8px] flex items-center justify-center border border-[rgba(255,255,255,0.1)]"
                >
                    <X size={20} strokeWidth={2.5} className="text-white" />
                </button>

                <div className="flex gap-3">
                    {torchSupported && (
                        <button
                            onClick={toggleTorch}
                            className="w-[44px] h-[44px] rounded-full bg-[rgba(0,0,0,0.5)] backdrop-blur-[8px] flex items-center justify-center border border-[rgba(255,255,255,0.1)]"
                        >
                            {isTorchOn ? <Zap size={20} strokeWidth={2} fill="#FBBF24" stroke="#FBBF24" /> : <ZapOff size={20} strokeWidth={2} stroke="#60607A" />}
                        </button>
                    )}
                    <label className="w-[44px] h-[44px] rounded-full bg-[rgba(0,0,0,0.5)] backdrop-blur-[8px] flex items-center justify-center border border-[rgba(255,255,255,0.1)] cursor-pointer">
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileUpload}
                        />
                        <ImageIcon size={20} strokeWidth={2} className="text-white" />
                    </label>
                </div>
            </div>

            {/* 4. Capture Frame */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center pointer-events-none">
                <div className="w-[280px] h-[280px] relative mb-4">
                    <motion.div
                        animate={{ opacity: [0.5, 1.0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0"
                    >
                        {/* Top Left */}
                        <div className="absolute top-0 left-0 w-[24px] h-[3px] bg-[#3B8BF7] shadow-[0_0_12px_rgba(59,139,247,0.8)] rounded-full" />
                        <div className="absolute top-0 left-0 w-[3px] h-[24px] bg-[#3B8BF7] shadow-[0_0_12px_rgba(59,139,247,0.8)] rounded-full" />
                        {/* Top Right */}
                        <div className="absolute top-0 right-0 w-[24px] h-[3px] bg-[#3B8BF7] shadow-[0_0_12px_rgba(59,139,247,0.8)] rounded-full" />
                        <div className="absolute top-0 right-0 w-[3px] h-[24px] bg-[#3B8BF7] shadow-[0_0_12px_rgba(59,139,247,0.8)] rounded-full" />
                        {/* Bottom Left */}
                        <div className="absolute bottom-0 left-0 w-[24px] h-[3px] bg-[#3B8BF7] shadow-[0_0_12px_rgba(59,139,247,0.8)] rounded-full" />
                        <div className="absolute bottom-0 left-0 w-[3px] h-[24px] bg-[#3B8BF7] shadow-[0_0_12px_rgba(59,139,247,0.8)] rounded-full" />
                        {/* Bottom Right */}
                        <div className="absolute bottom-0 right-0 w-[24px] h-[3px] bg-[#3B8BF7] shadow-[0_0_12px_rgba(59,139,247,0.8)] rounded-full" />
                        <div className="absolute bottom-0 right-0 w-[3px] h-[24px] bg-[#3B8BF7] shadow-[0_0_12px_rgba(59,139,247,0.8)] rounded-full" />
                    </motion.div>
                </div>
                <div className="text-white text-[13px] font-['DM_Sans'] drop-shadow-md tracking-wide">
                    Point at your food
                </div>
            </div>

            {/* Captured Thumbnail bouncing in */}
            <AnimatePresence>
                {capturedImage && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0, y: -20, x: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0, x: 0 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="absolute top-[calc(env(safe-area-inset-top)+80px)] right-[20px] z-50 w-[48px] h-[48px] rounded-[14px] overflow-hidden border-2 border-white shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
                    >
                        <img src={capturedImage} alt="Thumbnail preview" className="w-full h-full object-cover" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 5. Bottom Section */}
            <div
                className="absolute bottom-0 left-0 right-0 z-30 pt-16 pb-[calc(20px+env(safe-area-inset-bottom))] flex flex-col items-center"
                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)" }}
            >
                <div className="relative w-[80px] h-[80px] flex items-center justify-center rounded-full border-[3px] border-white/80 shadow-[0_0_30px_rgba(59,139,247,0.6)]">
                    <motion.button
                        onPointerDown={() => {
                            if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(50);
                        }}
                        onClick={capture}
                        whileTap={{ scale: 1.15 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="w-[64px] h-[64px] bg-gradient-to-br from-[#5B9EF8] to-[#3B8BF7] rounded-full focus:outline-none"
                    />
                </div>

                <div className="mt-6 flex justify-center items-center min-h-[48px]">
                    <button
                        onClick={() => setIsSheetOpen(true)}
                        className="text-[14px] text-[#A0A0B8] font-['DM_Sans'] active:text-white px-4 py-3 min-h-[48px] flex items-center justify-center"
                    >
                        or describe your meal
                    </button>
                </div>
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
            <BottomSheet
                isOpen={isSheetOpen}
                onClose={() => setIsSheetOpen(false)}
                className="bg-[#22222F]"
            >
                <div className="relative pt-4 pb-6">
                    <div className="absolute -top-14 right-2">
                        <Chip emotion="thinking" size={48} />
                    </div>

                    <h2 className="text-[22px] font-semibold text-white font-['DM_Sans'] mb-4">
                        Describe your meal
                    </h2>

                    {renderDescribeForm()}
                </div>
            </BottomSheet>
        </main>
    );
}
