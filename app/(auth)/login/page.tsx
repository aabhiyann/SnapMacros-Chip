"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { TapButton } from "@/components/ui/TapButton";
import { Chip } from "@/components/Chip";
import { createClient } from "@/lib/supabase/client";

type UiState = "idle" | "loading" | "demo-loading" | "apple-loading" | "google-loading" | "error" | "success";

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
            case "loading":
            case "demo-loading":
            case "apple-loading":
            case "google-loading":  return "thinking";
            case "error":           return "sad";
            case "success":         return "hype";
            default:                return "happy";
        }
    };

    const handleAuthError = (errMessage: string) => {
        setUiState("error");
        setShakeKey(k => k + 1);
        const msg = errMessage.toLowerCase();
        if (msg.includes("invalid login credentials") || msg.includes("password")) {
            setErrMsg("That password isn't right. Try again or reset it.");
        } else if (msg.includes("user not found") || msg.includes("email not found")) {
            setErrMsg("No account with that email. Sign up instead!");
        } else if (msg.includes("rate limit") || msg.includes("too many requests")) {
            setErrMsg("Slow down! Wait 30 seconds and try again.");
        } else if (msg.includes("fetch") || msg.includes("network")) {
            setErrMsg("Connection issue. Check your wi-fi and try again.");
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
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            if (email === "demo@snapmacros.app") {
                await fetch("/api/bootstrap-demo", { method: "POST" });
            }
            setUiState("success");
            await new Promise(resolve => setTimeout(resolve, 600));
            router.push("/dashboard");
        } catch (err: unknown) {
            handleAuthError(err instanceof Error ? err.message : "Network Error");
        }
    };

    const handleAppleSignIn = async () => {
        setUiState("apple-loading");
        try {
            const supabase = createClient();
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "apple",
                options: {
                    redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`,
                },
            });
            if (error) throw error;
        } catch (err: unknown) {
            handleAuthError(err instanceof Error ? err.message : "Apple sign-in failed");
        }
    };

    const handleGoogleSignIn = async () => {
        setUiState("google-loading");
        try {
            const supabase = createClient();
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`,
                },
            });
            if (error) throw error;
        } catch (err: unknown) {
            handleAuthError(err instanceof Error ? err.message : "Google sign-in failed");
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
            await fetch("/api/bootstrap-demo", { method: "POST" });
            await new Promise(r => setTimeout(r, 1000));
            setUiState("success");
            router.push("/dashboard");
        } catch (err: unknown) {
            handleAuthError(err instanceof Error ? err.message : "Demo unavailable");
        }
    };

    const isLoading = ["loading", "demo-loading", "apple-loading", "google-loading"].includes(uiState);

    return (
        <main className="min-h-screen bg-[#09090F] text-white flex flex-col overflow-hidden relative">
            {/* Ambient glow */}
            <div
                className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[320px] h-[320px] pointer-events-none"
                style={{ background: "radial-gradient(circle at center, rgba(79,158,255,0.12) 0%, transparent 70%)" }}
            />

            {/* Top section — mascot + wordmark */}
            <div className="flex-[0.4] flex flex-col items-center justify-end pb-6 relative z-10">
                <div className="relative z-10 mb-2">
                    <Chip emotion={getChipEmotion()} size={120} />
                </div>
                <div className="text-center mt-2 z-10">
                    <h1 className="text-[28px] font-bold font-['Bricolage_Grotesque'] tracking-tight leading-none mb-1">
                        <span className="text-white">Snap</span>
                        <span className="text-[#4F9EFF]">Macros</span>
                    </h1>
                    <p className="font-['DM_Sans'] text-[14px] text-[#56566F]">Snap. Track. Roast.</p>
                </div>
            </div>

            {/* Bottom section — form card */}
            <div className="flex-[0.6] flex flex-col items-center px-5 pt-6 w-full max-w-[380px] mx-auto z-10 relative">

                {/* Status message */}
                <div className="w-full h-[32px] mb-5 text-center">
                    <AnimatePresence mode="wait">
                        {uiState === "idle" && (
                            <motion.h2 key="idle" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                                className="font-['Bricolage_Grotesque'] text-[24px] font-bold text-white">
                                Welcome back
                            </motion.h2>
                        )}
                        {isLoading && (
                            <motion.p key="load" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                                className="font-['DM_Sans'] text-[#9898B3] italic">
                                {uiState === "demo-loading" ? "Loading Chip's world..." : "Signing you in..."}
                            </motion.p>
                        )}
                        {uiState === "error" && (
                            <motion.p key="err" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                                className="font-['DM_Sans'] text-[#FF6B6B] font-medium text-[14px] leading-tight">
                                {errMsg}
                            </motion.p>
                        )}
                        {uiState === "success" && (
                            <motion.p key="succ" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                                className="font-['Bricolage_Grotesque'] text-[#34D8BC] font-bold text-[24px]">
                                We&apos;re in! 🚀
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>

                {/* Social sign-in — Apple ABOVE Google (App Store requirement 4.8) */}
                <div className="w-full flex flex-col gap-3 mb-5">
                    <TapButton
                        type="button"
                        onClick={handleAppleSignIn}
                        disabled={isLoading}
                        className="apple-btn w-full"
                    >
                        {uiState === "apple-loading" ? (
                            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        ) : (
                            <>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.38c1.29.07 2.18.87 2.94.87.76 0 2.19-1.07 3.7-.91 1.31.09 2.46.55 3.33 1.51-3.02 1.78-2.51 5.89.51 7.01-.59 1.47-1.28 2.93-2.48 4.42zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                                </svg>
                                Continue with Apple
                            </>
                        )}
                    </TapButton>

                    <TapButton
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                        className="google-btn w-full"
                    >
                        {uiState === "google-loading" ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <path d="M22.56 12.25C22.56 11.47 22.49 10.7 22.36 9.96H12V14.12H18.06C17.7 15.65 16.79 16.59 15.44 17.51V20.24H19.06C21.18 18.28 22.56 15.53 22.56 12.25Z" fill="#4285F4" />
                                    <path d="M12 23C14.97 23 17.46 22.02 19.06 20.24L15.44 17.51C14.51 18.13 13.35 18.5 12 18.5C9.39 18.5 7.18 16.74 6.38 14.36H2.64V17.26C4.36 20.68 7.91 23 12 23Z" fill="#34A853" />
                                    <path d="M6.38 14.36C6.18 13.76 6.06 13.13 6.06 12.5C6.06 11.87 6.18 11.24 6.38 10.64V7.74H2.64C1.92 9.17 1.5 10.79 1.5 12.5C1.5 14.21 1.92 15.83 2.64 17.26L6.38 14.36Z" fill="#FBBC05" />
                                    <path d="M12 6.5C13.62 6.5 15.06 7.06 16.21 8.16L19.14 5.23C17.46 3.66 14.97 2 12 2C7.91 2 4.36 4.32 2.64 7.74L6.38 10.64C7.18 8.26 9.39 6.5 12 6.5Z" fill="#EA4335" />
                                </svg>
                                Continue with Google
                            </>
                        )}
                    </TapButton>
                </div>

                {/* Divider */}
                <div className="w-full flex items-center gap-3 mb-5">
                    <div className="flex-1 h-px bg-[#2A2A3D]" />
                    <span className="text-[#56566F] font-['DM_Sans'] text-[13px]">or</span>
                    <div className="flex-1 h-px bg-[#2A2A3D]" />
                </div>

                {/* Email/password form */}
                <motion.form
                    onSubmit={handleSubmit}
                    key={shakeKey}
                    animate={uiState === "error" ? { x: [0, -10, 10, -8, 8, 0] } : {}}
                    transition={{ duration: 0.4 }}
                    className="w-full flex flex-col gap-3"
                >
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => { setEmail(e.target.value); if (uiState === "error") setUiState("idle"); }}
                        className="premium-input"
                        autoComplete="email"
                    />

                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={e => { setPassword(e.target.value); if (uiState === "error") setUiState("idle"); }}
                            className="premium-input pr-12"
                            autoComplete="current-password"
                        />
                        <TapButton
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-0 top-0 h-full px-4 text-[#56566F] hover:text-white transition-colors flex items-center"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </TapButton>
                    </div>

                    <TapButton
                        type="submit"
                        disabled={isLoading}
                        className="w-full premium-btn mt-1"
                    >
                        {uiState === "loading" ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : uiState === "success" ? "Success!" : "Sign In"}
                    </TapButton>
                </motion.form>

                {/* Sign up link */}
                <div className="mt-6 text-center flex items-center justify-center gap-2">
                    <span className="text-[#56566F] font-['DM_Sans'] text-[14px]">New here?</span>
                    <Link href="/signup" className="text-white font-['DM_Sans'] text-[14px] font-medium hover:text-[#4F9EFF] transition-colors">
                        Create account
                    </Link>
                </div>

                {/* Legal links */}
                <div className="mt-4 text-center">
                    <p className="text-[#56566F] font-['DM_Sans'] text-[11px]">
                        By signing in, you agree to our{" "}
                        <Link href="/terms" className="underline hover:text-[#9898B3] transition-colors">Terms</Link>
                        {" "}and{" "}
                        <Link href="/privacy" className="underline hover:text-[#9898B3] transition-colors">Privacy Policy</Link>
                    </p>
                </div>

                {/* Demo login — subtle text link at very bottom */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full text-center">
                    <button
                        onClick={handleDemoLogin}
                        disabled={isLoading}
                        className="text-[#4F9EFF] font-['DM_Sans'] text-[13px] font-semibold hover:opacity-80 transition-opacity"
                    >
                        Try Demo &rarr;
                    </button>
                </div>
            </div>
        </main>
    );
}
