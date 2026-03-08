"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { TapButton } from "@/components/ui/TapButton";
import { Chip } from "@/components/Chip";
import { createClient } from "@/lib/supabase/client";

type UiState = "idle" | "loading" | "demo-loading" | "error" | "success";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [uiState, setUiState] = useState<UiState>("idle");
    const [errMsg, setErrMsg] = useState("");
    const [shakeKey, setShakeKey] = useState(0);

    const getChipEmotion = () => {
        switch (uiState) {
            case "idle": return "happy";
            case "loading": return "thinking";
            case "demo-loading": return "thinking";
            case "error": return "sad";
            case "success": return "hype";
            default: return "happy";
        }
    };

    const handleAuthError = (errMessage: string) => {
        setUiState("error");
        setShakeKey(k => k + 1);

        const msg = errMessage.toLowerCase();

        // Map to specific human messages
        if (msg.includes("invalid login credentials") || msg.includes("password")) {
            setErrMsg("That password isn't right. Try again or reset it.");
        } else if (msg.includes("user not found") || msg.includes("email not found")) {
            setErrMsg("Don't have an account with that email? Sign up!");
        } else if (msg.includes("rate limit") || msg.includes("too many requests")) {
            setErrMsg("Slow down! Wait 30 seconds and try again.");
        } else if (msg.includes("fetch") || msg.includes("network")) {
            setErrMsg("Connection issue. Check your wifi and try again.");
        } else if (msg.includes("demo unavailable")) {
            setErrMsg("Demo unavailable. Please sign up instead.");
        } else {
            setErrMsg("Something went wrong. Please try again.");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            handleAuthError("invalid login credentials");
            return;
        }

        setUiState("loading");

        try {
            const supabase = createClient();

            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;

            // Ensure demo profile has onboarding_completed so we land on dashboard
            if (email === "demo@snapmacros.app") {
                await fetch("/api/bootstrap-demo", { method: "POST" });
            }

            setUiState("success");
            await new Promise(resolve => setTimeout(resolve, 600)); // flash success
            router.push("/dashboard");
        } catch (err: any) {
            handleAuthError(err.message || "Network Error");
        }
    };

    const handleGoogleSignIn = async () => {
        setUiState("loading");
        try {
            const supabase = createClient();
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`,
                },
            });
            if (error) throw error;
        } catch (err: any) {
            handleAuthError(err.message || "Google sign-in failed");
        }
    };

    const handleDemoLogin = async () => {
        setUiState("demo-loading");
        try {
            const supabase = createClient();
            const { error } = await supabase.auth.signInWithPassword({
                email: "demo@snapmacros.app",
                password: "SnapMacros2026!",
            });
            if (error) throw new Error("Demo unavailable");

            // Ensure demo profile has onboarding_completed so we land on dashboard
            await fetch("/api/bootstrap-demo", { method: "POST" });

            // Mock network delay for UX
            await new Promise(r => setTimeout(r, 1000));
            setUiState("success");
            router.push("/dashboard");
        } catch (err: any) {
            handleAuthError(err.message || "Demo unavailable");
        }
    };

    return (
        <main className="min-h-screen bg-[#0F0F14] text-white flex flex-col overflow-hidden relative">
            {/* TOP SECTION (40%) */}
            <div className="flex-[0.4] flex flex-col items-center justify-end pb-6 relative z-10">
                {/* Radial Glow */}
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] pointer-events-none"
                    style={{ background: 'radial-gradient(circle at center, rgba(59,139,247,0.15) 0%, transparent 70%)' }}
                />

                {/* Mascot Area */}
                <div className="relative z-10 mb-2">
                    <Chip emotion={getChipEmotion()} size={120} />
                </div>

                {/* Wordmark & Tagline */}
                <div className="text-center mt-2 z-10">
                    <h1 className="text-[28px] font-bold font-['Bricolage_Grotesque'] tracking-tight leading-none mb-1">
                        <span className="text-white">Snap</span>
                        <span className="text-[#3B8BF7]">Macros</span>
                    </h1>
                    <p className="font-['DM_Sans'] text-[14px] text-[#60607A]">Snap. Track. Roast.</p>
                </div>
            </div>

            {/* BOTTOM SECTION (60%) */}
            <div className="flex-[0.6] flex flex-col items-center px-6 pt-6 w-full max-w-[360px] mx-auto z-10 relative">

                <div className="w-full h-[32px] mb-6 text-center">
                    <AnimatePresence mode="wait">
                        {uiState === "idle" && (
                            <motion.div key="idle" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                <h2 className="font-['Bricolage_Grotesque'] text-[24px] font-bold text-white">Welcome back</h2>
                            </motion.div>
                        )}
                        {(uiState === "loading" || uiState === "demo-loading") && (
                            <motion.div key="load" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                <p className="font-['DM_Sans'] text-[#A0A0B8] italic">
                                    {uiState === "demo-loading" ? "Loading Chip's world..." : "Authenticating..."}
                                </p>
                            </motion.div>
                        )}
                        {uiState === "error" && (
                            <motion.div key="err" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                <p className="font-['DM_Sans'] text-[#EF4444] font-medium text-[14px] leading-tight">{errMsg}</p>
                            </motion.div>
                        )}
                        {uiState === "success" && (
                            <motion.div key="succ" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                <p className="font-['Bricolage_Grotesque'] text-[#2DD4BF] font-bold text-[24px]">We're in! 🚀</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Form */}
                <motion.form
                    onSubmit={handleSubmit}
                    key={shakeKey}
                    animate={uiState === "error" ? { x: [0, -10, 10, -8, 8, 0] } : {}}
                    transition={{ duration: 0.4 }}
                    className="w-full flex flex-col gap-4"
                >
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => { setEmail(e.target.value); if (uiState === 'error') setUiState('idle'); }}
                        className="w-full premium-input"
                    />

                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={e => { setPassword(e.target.value); if (uiState === 'error') setUiState('idle'); }}
                            className="w-full premium-input pr-12"
                        />
                        <TapButton
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-0 top-0 h-full px-4 text-[#60607A] hover:text-white transition-colors flex items-center justify-center"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </TapButton>
                    </div>

                    <TapButton
                        type="submit"
                        disabled={uiState === "loading"}
                        className="w-full premium-btn mt-2"
                    >
                        {uiState === "loading" ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : uiState === "success" ? (
                            "Success!"
                        ) : "Sign In"}
                    </TapButton>
                </motion.form>

                {/* Google Sign In */}
                <div className="w-full mt-4 flex flex-col gap-4">
                    <TapButton
                        type="button"
                        onClick={handleGoogleSignIn}
                        className="w-full h-[52px] bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] text-white rounded-[16px] font-['DM_Sans'] text-[15px] font-medium active:scale-[0.98] transition-transform flex items-center justify-center gap-3"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25C22.56 11.47 22.49 10.7 22.36 9.96H12V14.12H18.06C17.7 15.65 16.79 16.59 15.44 17.51V20.24H19.06C21.18 18.28 22.56 15.53 22.56 12.25Z" fill="#4285F4" />
                            <path d="M12 23C14.97 23 17.46 22.02 19.06 20.24L15.44 17.51C14.51 18.13 13.35 18.5 12 18.5C9.39 18.5 7.18 16.74 6.38 14.36H2.64V17.26C4.36 20.68 7.91 23 12 23Z" fill="#34A853" />
                            <path d="M6.38 14.36C6.18 13.76 6.06 13.13 6.06 12.5C6.06 11.87 6.18 11.24 6.38 10.64V7.74H2.64C1.92 9.17 1.5 10.79 1.5 12.5C1.5 14.21 1.92 15.83 2.64 17.26L6.38 14.36Z" fill="#FBBC05" />
                            <path d="M12 6.5C13.62 6.5 15.06 7.06 16.21 8.16L19.14 5.23C17.46 3.66 14.97 2 12 2C7.91 2 4.36 4.32 2.64 7.74L6.38 10.64C7.18 8.26 9.39 6.5 12 6.5Z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                    </TapButton>
                </div>

                <div className="mt-8 text-center flex items-center justify-center gap-2">
                    <span className="text-[#60607A] font-['DM_Sans'] text-[14px]">New here?</span>
                    <Link href="/signup" className="text-white font-['DM_Sans'] text-[14px] font-medium hover:text-[#3B8BF7] transition-colors">
                        Sign up
                    </Link>
                </div>

                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center w-full z-10">
                    <button onClick={handleDemoLogin} className="text-[#3B8BF7] font-['DM_Sans'] text-[13px] font-semibold tracking-wide hover:opacity-80 transition-opacity flex items-center justify-center gap-1 mx-auto">
                        Try Demo &rarr;
                    </button>
                </div>
            </div>
        </main>
    );
}

