import { TapButton } from "@/components/ui/TapButton";
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import Chip from "@/components/Chip";
// Note: We use our mock DEMO_USER_ID internally for demo purposes, 
// but we still build real UI state mechanisms for the demo shell
import { DEMO_USER_ID } from "@/lib/auth";

type UiState = "idle" | "loading" | "error" | "success";

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
            case "error": return "sad";
            case "success": return "hype";
            default: return "happy";
        }
    };

    const handleDemoLogin = async () => {
        setUiState("loading");
        // Simulate network
        await new Promise(r => setTimeout(r, 1200));
        setUiState("success");
        await new Promise(r => setTimeout(r, 600)); // flash success
        // In real app, check profile onboarding_completed logic here
        router.push("/dashboard");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setUiState("loading");

        // Fake auth check for the literal string requirements
        await new Promise(r => setTimeout(r, 1000));

        if (email === "demo@snapmacros.app" && password === "SnapMacros2026Demo!") {
            setUiState("success");
            await new Promise(r => setTimeout(r, 600));
            router.push("/dashboard");
        } else {
            setUiState("error");
            setErrMsg("Invalid email or password.");
            setShakeKey(k => k + 1);
        }
    };

    return (
        <main className="min-h-screen bg-[#0F0F14] text-white flex flex-col p-6 items-center overflow-hidden relative">
            {/* Ambient glow */}
            <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-[#FF6B35]/10 rounded-full blur-[100px] pointer-events-none" />

            {/* Wordmark */}
            <div className="w-full pt-10 pb-8 flex justify-center">
                <h1 className="text-[20px] font-black font-['Bricolage_Grotesque'] tracking-tight">SnapMacros</h1>
            </div>

            {/* Mascot Area */}
            <div className="flex flex-col items-center mt-6 mb-10 min-h-[160px]">
                <Chip emotion={getChipEmotion()} size={110} />

                <AnimatePresence mode="wait">
                    {uiState === "idle" && (
                        <motion.div key="idle" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mt-4">
                            <p className="font-['DM_Sans'] text-[18px] font-bold">Welcome back 👋</p>
                        </motion.div>
                    )}
                    {uiState === "loading" && (
                        <motion.div key="load" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mt-4">
                            <p className="font-['DM_Sans'] text-[#A0A0B8] italic">Authenticating...</p>
                        </motion.div>
                    )}
                    {uiState === "error" && (
                        <motion.div key="err" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mt-4 text-center">
                            <p className="font-['DM_Sans'] text-[#EF4444] font-medium">{errMsg}</p>
                            <p className="font-['DM_Sans'] text-[#A0A0B8] text-[13px] mt-1">Try the demo login below!</p>
                        </motion.div>
                    )}
                    {uiState === "success" && (
                        <motion.div key="succ" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mt-4 text-center">
                            <p className="font-['DM_Sans'] text-[#2DD4BF] font-bold text-[18px]">We're in! 🚀</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Form */}
            <motion.form
                onSubmit={handleSubmit}
                key={shakeKey}
                animate={
                    uiState === "error" ? { x: [-10, 10, -10, 10, -5, 5, 0] } : {}
                }
                transition={{ duration: 0.4 }}
                className="w-full max-w-[340px] flex flex-col gap-4 z-10"
            >
                <div className="relative">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => { setEmail(e.target.value); if (uiState === 'error') setUiState('idle'); }}
                        className="w-full bg-[#1A1A24] text-white border border-[#2A2A3A] rounded-[16px] h-[60px] px-5 font-['DM_Sans'] focus:outline-none focus:border-[#FF6B35] transition-colors placeholder:text-[#60607A]"
                    />
                </div>

                <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={e => { setPassword(e.target.value); if (uiState === 'error') setUiState('idle'); }}
                        className="w-full bg-[#1A1A24] text-white border border-[#2A2A3A] rounded-[16px] h-[60px] px-5 pr-12 font-['DM_Sans'] focus:outline-none focus:border-[#FF6B35] transition-colors placeholder:text-[#60607A]"
                    />
                    <TapButton type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#60607A] hover:text-white transition-colors">
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </TapButton>
                </div>

                <div className="flex justify-end pr-2">
                    <Link href="#" className="font-['DM_Sans'] text-[#A0A0B8] text-[13px] font-medium hover:text-white transition-colors">
                        Forgot password?
                    </Link>
                </div>

                <TapButton
                    type="submit"
                    disabled={uiState === "loading" || uiState === "success"}
                    className="w-full h-[60px] bg-[#FF6B35] rounded-[16px] font-['DM_Sans'] font-bold text-[16px] text-white shadow-[0_8px_32px_rgba(255,107,53,0.3)] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center mt-2"
                >
                    {uiState === "loading" ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : "Sign In"}
                </TapButton>
            </motion.form>

            <div className="w-full max-w-[340px] mt-6 flex items-center justify-between text-[#60607A] text-[13px] font-['DM_Sans'] z-10">
                <div className="h-[1px] bg-[#2A2A3A] flex-1" />
                <span className="px-4">OR</span>
                <div className="h-[1px] bg-[#2A2A3A] flex-1" />
            </div>

            <div className="w-full max-w-[340px] mt-6 flex flex-col gap-4 z-10">
                <TapButton
                    type="button"
                    className="w-full h-[60px] bg-white text-black rounded-[16px] font-['DM_Sans'] font-bold text-[16px] active:scale-[0.98] transition-transform flex items-center justify-center gap-3"
                >
                    {/* Simple Google G */}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25C22.56 11.47 22.49 10.7 22.36 9.96H12V14.12H18.06C17.7 15.65 16.79 16.59 15.44 17.51V20.24H19.06C21.18 18.28 22.56 15.53 22.56 12.25Z" fill="#4285F4" />
                        <path d="M12 23C14.97 23 17.46 22.02 19.06 20.24L15.44 17.51C14.51 18.13 13.35 18.5 12 18.5C9.39 18.5 7.18 16.74 6.38 14.36H2.64V17.26C4.36 20.68 7.91 23 12 23Z" fill="#34A853" />
                        <path d="M6.38 14.36C6.18 13.76 6.06 13.13 6.06 12.5C6.06 11.87 6.18 11.24 6.38 10.64V7.74H2.64C1.92 9.17 1.5 10.79 1.5 12.5C1.5 14.21 1.92 15.83 2.64 17.26L6.38 14.36Z" fill="#FBBC05" />
                        <path d="M12 6.5C13.62 6.5 15.06 7.06 16.21 8.16L19.14 5.23C17.46 3.66 14.97 2 12 2C7.91 2 4.36 4.32 2.64 7.74L6.38 10.64C7.18 8.26 9.39 6.5 12 6.5Z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                </TapButton>

                <TapButton
                    type="button"
                    onClick={handleDemoLogin}
                    className="w-full h-[60px] bg-transparent border border-[#60607A] text-white rounded-[16px] font-['DM_Sans'] font-bold text-[16px] active:scale-[0.98] transition-transform hover:border-[#A0A0B8]"
                >
                    Try Demo &rarr;
                </TapButton>
            </div>

            <div className="mt-8 text-center z-10">
                <p className="text-[#A0A0B8] text-[14px] font-['DM_Sans']">
                    New here? <Link href="/signup" className="text-white font-bold hover:underline">Sign up</Link>
                </p>
            </div>
        </main>
    );
}
