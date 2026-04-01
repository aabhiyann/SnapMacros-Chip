"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import { useRouter } from "next/navigation";
import { X, Image as ImageIcon, Zap, ZapOff, ChevronLeft, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BottomSheet } from "@/components/BottomSheet";
import { Chip } from "@/components/Chip";

// Safe sessionStorage helpers (Capacitor native context may restrict it)
function setSessionItem(key: string, value: string) {
    try { sessionStorage.setItem(key, value); } catch { /* ignore */ }
}
function removeSessionItem(key: string) {
    try { sessionStorage.removeItem(key); } catch { /* ignore */ }
}

// Detect Capacitor native platform safely
function isNative(): boolean {
    try {
        return typeof window !== "undefined" &&
            // @ts-expect-error Capacitor global exists only in native context
            !!(window.Capacitor?.isNativePlatform?.());
    } catch { return false; }
}

const PLACEHOLDERS = [
    "e.g., grilled salmon with rice and broccoli",
    "A double cheeseburger with medium fries...",
    "Two slices of pepperoni pizza...",
    "A bowl of oatmeal with blueberries...",
    "Chicken caesar salad with croutons...",
];

// ── Preview Confirm Overlay ────────────────────────────────────────────────────
function PreviewConfirm({
    image,
    onConfirm,
    onRetake,
}: {
    image: string;
    onConfirm: () => void;
    onRetake: () => void;
}) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col"
        >
            {/* Blurred backdrop */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `url(${image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    filter: "blur(20px) brightness(0.4)",
                    transform: "scale(1.1)",
                }}
            />

            {/* Main image */}
            <div className="relative flex-1 flex items-center justify-center p-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <motion.img
                    src={image}
                    alt="Captured meal"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="max-w-full max-h-full rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.8)] object-contain"
                />
            </div>

            {/* Action bar */}
            <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="relative z-10 pb-[max(env(safe-area-inset-bottom),24px)] px-6 pt-4"
                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)" }}
            >
                <p className="text-center text-[#9898B3] font-['DM_Sans'] text-[13px] mb-5">
                    Looks good? Chip will analyze the macros.
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={onRetake}
                        className="flex-1 h-[56px] rounded-[16px] bg-white/10 border border-white/15 text-white font-['DM_Sans'] font-semibold text-[16px] backdrop-blur-sm active:scale-[0.97] transition-transform"
                    >
                        Retake
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-[2] h-[56px] rounded-[16px] bg-[#4F9EFF] text-white font-['DM_Sans'] font-bold text-[16px] flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(79,158,255,0.4)] active:scale-[0.97] transition-transform"
                    >
                        <CheckCircle2 size={20} />
                        Analyze
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

// ── Describe Sheet ─────────────────────────────────────────────────────────────
function DescribeMealSheet({
    isOpen,
    onClose,
    onSubmit,
}: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (text: string) => void;
}) {
    const [desc, setDesc] = useState("");
    const [placeholderIdx, setPlaceholderIdx] = useState(0);

    useEffect(() => {
        if (!isOpen) return;
        const timer = setInterval(() => {
            setPlaceholderIdx(prev => (prev + 1) % PLACEHOLDERS.length);
        }, 3000);
        return () => clearInterval(timer);
    }, [isOpen]);

    return (
        <BottomSheet isOpen={isOpen} onClose={onClose} className="bg-[#13131C]">
            <div className="p-5 pb-8 relative">
                <div className="absolute -top-[52px] right-6">
                    <Chip emotion="thinking" size={64} />
                </div>
                <h3 className="font-['Bricolage_Grotesque'] text-[22px] font-bold text-white mb-1">
                    Describe your meal
                </h3>
                <p className="text-[#56566F] font-['DM_Sans'] text-[13px] mb-4">
                    No photo? Just tell Chip what you ate.
                </p>
                <textarea
                    autoFocus
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder={PLACEHOLDERS[placeholderIdx]}
                    className="w-full h-[120px] bg-[#1C1C28] border border-[#2A2A3D] rounded-[16px] p-4 text-white font-['DM_Sans'] text-[15px] resize-none focus:outline-none focus:border-[#4F9EFF] transition-colors mb-4 placeholder:text-[#56566F]"
                />
                <button
                    onClick={() => { if (desc.trim()) onSubmit(desc); }}
                    disabled={!desc.trim()}
                    className="w-full h-[56px] rounded-[16px] bg-[#4F9EFF] text-white font-['DM_Sans'] text-[16px] font-bold flex items-center justify-center disabled:opacity-40 active:scale-[0.98] transition-all shadow-[0_4px_16px_rgba(79,158,255,0.35)]"
                >
                    Analyze This →
                </button>
            </div>
        </BottomSheet>
    );
}

// ── No Camera Fallback ─────────────────────────────────────────────────────────
function NoCameraFallback({
    onDescribe,
    onBack,
}: {
    onDescribe: () => void;
    onBack: () => void;
}) {
    return (
        <main className="min-h-screen bg-[#09090F] flex flex-col pt-[48px] px-5 relative">
            <button
                onClick={onBack}
                className="absolute top-[max(env(safe-area-inset-top),20px)] left-5 w-[44px] h-[44px] rounded-full bg-[#1C1C28] flex items-center justify-center border border-[#2A2A3D]"
            >
                <ChevronLeft size={22} className="text-white" />
            </button>

            <div className="flex-1 flex flex-col items-center justify-center text-center -mt-10">
                <Chip emotion="thinking" size={100} className="mb-6 drop-shadow-[0_0_30px_rgba(79,158,255,0.3)]" />
                <h2 className="font-['Bricolage_Grotesque'] text-[28px] font-bold text-white mb-3 tracking-tight">
                    Camera blocked
                </h2>
                <p className="text-[#9898B3] text-[15px] font-['DM_Sans'] max-w-[260px] mx-auto mb-8 leading-relaxed">
                    Allow camera access in Settings, or describe your meal and Chip will estimate the macros.
                </p>

                <div className="w-full max-w-[340px] space-y-3">
                    <button
                        onClick={() => { try { window.open("app-settings:", "_blank"); } catch { /* ignore */ } }}
                        className="w-full py-4 rounded-[16px] bg-transparent border border-[#2A2A3D] text-white font-semibold font-['DM_Sans'] text-[15px] active:scale-[0.97] transition-transform"
                    >
                        Open Settings
                    </button>
                    <button
                        onClick={onDescribe}
                        className="w-full py-4 rounded-[16px] bg-[#4F9EFF] text-white font-bold font-['DM_Sans'] text-[15px] shadow-[0_4px_16px_rgba(79,158,255,0.35)] active:scale-[0.97] transition-transform"
                    >
                        Describe Instead
                    </button>
                </div>
            </div>
        </main>
    );
}

// ── Main Snap Page ─────────────────────────────────────────────────────────────
export default function SnapPage() {
    const router = useRouter();
    const webcamRef = useRef<Webcam>(null);

    const [hasCamera, setHasCamera] = useState<boolean | null>(null);
    const [isFlashing, setIsFlashing] = useState(false);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [torchSupported, setTorchSupported] = useState(false);
    const [isTorchOn, setIsTorchOn] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const handleUserMedia = (stream: MediaStream) => {
        setHasCamera(true);
        const track = stream.getVideoTracks()[0];
        if (track) {
            const caps = track.getCapabilities?.();
            // @ts-expect-error torch not yet typed in lib.dom.d.ts
            if (caps?.torch) setTorchSupported(true);
        }
    };

    const toggleTorch = useCallback(async () => {
        if (!webcamRef.current?.stream) return;
        const track = webcamRef.current.stream.getVideoTracks()[0];
        if (!track) return;
        try {
            const next = !isTorchOn;
            await track.applyConstraints({ advanced: [{ torch: next } as MediaTrackConstraintSet] });
            setIsTorchOn(next);
        } catch { /* torch unavailable */ }
    }, [isTorchOn]);

    const handleUserMediaError = () => setHasCamera(false);

    // Native Capacitor camera path
    const captureNative = useCallback(async () => {
        try {
            const { Camera, CameraResultType, CameraSource } = await import("@capacitor/camera");
            const photo = await Camera.getPhoto({
                resultType: CameraResultType.DataUrl,
                source: CameraSource.Camera,
                quality: 85,
                allowEditing: false,
            });
            if (photo.dataUrl) {
                setPreviewImage(photo.dataUrl);
            }
        } catch {
            // User cancelled or error — no action needed
        }
    }, []);

    // Web webcam path
    const captureWeb = useCallback(() => {
        if (!webcamRef.current) return;
        const imageSrc = webcamRef.current.getScreenshot();
        if (!imageSrc) return;
        setIsFlashing(true);
        setTimeout(() => setIsFlashing(false), 80);
        setPreviewImage(imageSrc);
    }, []);

    const handleCapture = useCallback(() => {
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(50);
        if (isNative()) {
            captureNative();
        } else {
            captureWeb();
        }
    }, [captureNative, captureWeb]);

    // Native gallery path
    const openGalleryNative = useCallback(async () => {
        try {
            const { Camera, CameraResultType, CameraSource } = await import("@capacitor/camera");
            const photo = await Camera.getPhoto({
                resultType: CameraResultType.DataUrl,
                source: CameraSource.Photos,
                quality: 85,
            });
            if (photo.dataUrl) setPreviewImage(photo.dataUrl);
        } catch { /* cancelled */ }
    }, []);

    // Web file input gallery path
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewImage(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const confirmAndAnalyze = useCallback(() => {
        if (!previewImage) return;
        setSessionItem("snap_image", previewImage);
        removeSessionItem("snap_description");
        router.push("/snap/result");
    }, [previewImage, router]);

    const handleDescribeSubmit = (text: string) => {
        setSessionItem("snap_description", text);
        removeSessionItem("snap_image");
        router.push("/snap/result");
    };

    // ── No Camera ────────────────────────────────────────────────────────────────
    if (hasCamera === false) {
        return (
            <>
                <NoCameraFallback
                    onDescribe={() => setIsSheetOpen(true)}
                    onBack={() => router.push("/dashboard")}
                />
                <DescribeMealSheet
                    isOpen={isSheetOpen}
                    onClose={() => setIsSheetOpen(false)}
                    onSubmit={handleDescribeSubmit}
                />
            </>
        );
    }

    // ── Native platform: no webcam needed, show simple capture UI ───────────────
    if (isNative()) {
        return (
            <>
                <AnimatePresence>
                    {previewImage && (
                        <PreviewConfirm
                            image={previewImage}
                            onConfirm={confirmAndAnalyze}
                            onRetake={() => setPreviewImage(null)}
                        />
                    )}
                </AnimatePresence>
                <main className="min-h-screen bg-[#09090F] flex flex-col items-center justify-center px-6">
                    <button
                        onClick={() => router.push("/dashboard")}
                        className="absolute top-[max(env(safe-area-inset-top),20px)] left-5 w-[44px] h-[44px] rounded-full bg-[#1C1C28] flex items-center justify-center border border-[#2A2A3D]"
                    >
                        <X size={20} className="text-white" />
                    </button>

                    <Chip emotion="happy" size={96} className="mb-6" />
                    <h2 className="font-['Bricolage_Grotesque'] text-[28px] font-bold text-white mb-2 text-center">
                        Snap your meal
                    </h2>
                    <p className="text-[#9898B3] text-[14px] font-['DM_Sans'] text-center mb-10">
                        Take a photo and Chip will break down the macros.
                    </p>

                    <div className="w-full max-w-[320px] space-y-3">
                        <button
                            onClick={handleCapture}
                            className="w-full h-[60px] rounded-[18px] bg-[#4F9EFF] text-white font-['DM_Sans'] font-bold text-[17px] flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(79,158,255,0.4)] active:scale-[0.97] transition-transform"
                        >
                            📷 Take Photo
                        </button>
                        <button
                            onClick={openGalleryNative}
                            className="w-full h-[56px] rounded-[18px] bg-[#1C1C28] border border-[#2A2A3D] text-white font-['DM_Sans'] font-semibold text-[15px] flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"
                        >
                            <ImageIcon size={18} /> Choose from Library
                        </button>
                        <button
                            onClick={() => setIsSheetOpen(true)}
                            className="w-full py-3 text-[#56566F] font-['DM_Sans'] text-[14px] active:text-white transition-colors"
                        >
                            or describe your meal
                        </button>
                    </div>
                </main>
                <DescribeMealSheet
                    isOpen={isSheetOpen}
                    onClose={() => setIsSheetOpen(false)}
                    onSubmit={handleDescribeSubmit}
                />
            </>
        );
    }

    // ── Web: Full-screen webcam viewfinder ────────────────────────────────────────
    return (
        <>
            <AnimatePresence>
                {previewImage && (
                    <PreviewConfirm
                        image={previewImage}
                        onConfirm={confirmAndAnalyze}
                        onRetake={() => setPreviewImage(null)}
                    />
                )}
            </AnimatePresence>

            <main className="fixed inset-0 bg-black overflow-hidden">
                {/* Webcam */}
                <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/jpeg"
                    screenshotQuality={0.85}
                    videoConstraints={{
                        facingMode: { ideal: "environment" },
                        width: { ideal: 1280 },
                        height: { ideal: 720 },
                    }}
                    onUserMedia={handleUserMedia}
                    onUserMediaError={handleUserMediaError}
                    className="w-full h-full object-cover"
                    style={{ objectFit: "cover" }}
                />

                {/* Vignette */}
                <div
                    className="absolute inset-0 pointer-events-none z-10"
                    style={{ background: "radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.55) 100%)" }}
                />

                {/* Top bar */}
                <div className="absolute top-[max(env(safe-area-inset-top),0px)] left-0 right-0 z-50 px-5 pt-4 flex justify-between items-center">
                    <button
                        onClick={() => router.push("/dashboard")}
                        className="w-[44px] h-[44px] rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/10"
                    >
                        <X size={20} strokeWidth={2.5} className="text-white" />
                    </button>

                    <div className="flex gap-3">
                        {torchSupported && (
                            <button
                                onClick={toggleTorch}
                                className="w-[44px] h-[44px] rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/10"
                            >
                                {isTorchOn
                                    ? <Zap size={20} strokeWidth={2} fill="#FFC84A" stroke="#FFC84A" />
                                    : <ZapOff size={20} strokeWidth={2} className="text-white/60" />}
                            </button>
                        )}
                        <label className="w-[44px] h-[44px] rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/10 cursor-pointer">
                            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                            <ImageIcon size={20} strokeWidth={2} className="text-white" />
                        </label>
                    </div>
                </div>

                {/* Animated scan frame */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none flex flex-col items-center">
                    <div className="w-[260px] h-[260px] relative mb-4">
                        <motion.div
                            animate={{ opacity: [0.5, 1.0, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute inset-0"
                        >
                            {/* Corner markers */}
                            {["top-0 left-0", "top-0 right-0", "bottom-0 left-0", "bottom-0 right-0"].map((pos, i) => (
                                <div key={i} className={`absolute ${pos}`}>
                                    <div className={`absolute w-[22px] h-[3px] bg-[#4F9EFF] shadow-[0_0_10px_rgba(79,158,255,0.8)] rounded-full ${i % 2 === 1 ? "right-0" : "left-0"} ${i < 2 ? "top-0" : "bottom-0"}`} />
                                    <div className={`absolute w-[3px] h-[22px] bg-[#4F9EFF] shadow-[0_0_10px_rgba(79,158,255,0.8)] rounded-full ${i % 2 === 1 ? "right-0" : "left-0"} ${i < 2 ? "top-0" : "bottom-0"}`} />
                                </div>
                            ))}
                        </motion.div>
                    </div>
                    <p className="text-white/80 text-[13px] font-['DM_Sans'] drop-shadow-lg tracking-wide">
                        Point at your food
                    </p>
                </div>

                {/* Bottom controls */}
                <div
                    className="absolute bottom-0 left-0 right-0 z-30 pt-20 pb-[max(env(safe-area-inset-bottom),24px)] flex flex-col items-center"
                    style={{ background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)" }}
                >
                    {/* Shutter */}
                    <div className="relative w-[80px] h-[80px] flex items-center justify-center rounded-full border-[3px] border-white/80 shadow-[0_0_30px_rgba(79,158,255,0.5)]">
                        <motion.button
                            onClick={handleCapture}
                            whileTap={{ scale: 1.12 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="w-[64px] h-[64px] bg-gradient-to-br from-[#6BAEFF] to-[#4F9EFF] rounded-full focus:outline-none"
                            aria-label="Capture photo"
                        />
                    </div>

                    <button
                        onClick={() => setIsSheetOpen(true)}
                        className="mt-6 text-[14px] text-white/50 font-['DM_Sans'] px-4 py-3 active:text-white transition-colors min-h-[44px]"
                    >
                        or describe your meal
                    </button>
                </div>

                {/* Flash effect */}
                <AnimatePresence>
                    {isFlashing && (
                        <motion.div
                            initial={{ opacity: 0.6 }}
                            animate={{ opacity: 0 }}
                            transition={{ duration: 0.1 }}
                            className="absolute inset-0 bg-white z-50 pointer-events-none"
                        />
                    )}
                </AnimatePresence>
            </main>

            <DescribeMealSheet
                isOpen={isSheetOpen}
                onClose={() => setIsSheetOpen(false)}
                onSubmit={handleDescribeSubmit}
            />
        </>
    );
}
