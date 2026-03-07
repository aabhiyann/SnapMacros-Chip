"use client";
import { TapButton } from "@/components/ui/TapButton";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import Chip from "@/components/Chip";

type UiState = "idle" | "loading" | "error" | "success";

export default function SignupPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [uiState, setUiState] = useState<UiState>("idle");
    const [errMsg, setErrMsg] = useState("");
    const [shakeKey, setShakeKey] = useState(0);

    const getChipEmotion = () => {
        switch (uiState) {
            case "idle": return "hype";
            case "loading": return "thinking";
            case "error": return "sad";
            case "success": return "happy";
            default: return "hype";
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setUiState("loading");

        // Validate
        if (!name || !email || password.length < 6) {
            setUiState("error");
            setErrMsg(password.length > 0 && password.length < 6 ? "Password must be 6+ chars" : "Please fill all fields");
            setShakeKey(k => k + 1);
            return;
        }

        // Fake auth 
        await new Promise(r => setTimeout(r, 1200));

        // Success routing to onboarding
        setUiState("success");
        await new Promise(r => setTimeout(r, 500));
        router.push("/onboarding");
    };

    return (
        <main className="min-h-screen bg-[#0F0F14] text-white flex flex-col p-6 items-center overflow-hidden relative">
            <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-[#6C63FF]/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="w-full pt-10 pb-4 flex justify-center">
                <h1 className="text-[20px] font-black font-['Bricolage_Grotesque'] tracking-tight">SnapMacros</h1>
            </div>

            <div className="flex flex-col items-center mt-6 mb-8 min-h-[160px]">
                <Chip emotion={getChipEmotion()} size={110} />
                <AnimatePresence mode="wait">
                    {uiState === "idle" && (
                        <motion.div key="idle" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mt-4 text-center">
                            <p className="font-['DM_Sans'] text-[18px] font-bold">Join the crew 🥚</p>
                            <p className="text-[#A0A0B8] text-[13px] font-['DM_Sans'] mt-1">Get roasted. Hit targets.</p>
                        </motion.div>
                    )}
                    {uiState === "loading" && (
                        <motion.div key="load" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mt-4">
                            <p className="font-['DM_Sans'] text-[#A0A0B8] italic">Creating incubator...</p>
                        </motion.div>
                    )}
                    {uiState === "error" && (
                        <motion.div key="err" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mt-4 text-center">
                            <p className="font-['DM_Sans'] text-[#EF4444] font-medium">{errMsg}</p>
                        </motion.div>
                    )}
                    {uiState === "success" && (
                        <motion.div key="succ" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mt-4 text-center">
                            <p className="font-['DM_Sans'] text-[#2DD4BF] font-bold text-[18px]">Let's go! 🎉</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

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
                        type="text"
                        placeholder="First Name"
                        value={name}
                        onChange={e => { setName(e.target.value); if (uiState === 'error') setUiState('idle'); }}
                        className="w-full bg-[#1A1A24] text-white border border-[#2A2A3A] rounded-[16px] h-[60px] px-5 font-['DM_Sans'] focus:outline-none focus:border-[#FF6B35] transition-colors placeholder:text-[#60607A]"
                    />
                </div>

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

                <TapButton
                    type="submit"
                    disabled={uiState === "loading" || uiState === "success"}
                    className="w-full h-[60px] bg-[#6C63FF] rounded-[16px] font-['DM_Sans'] font-bold text-[16px] text-white shadow-[0_8px_32px_rgba(108,99,255,0.3)] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center mt-2"
                >
                    {uiState === "loading" ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : "Create Account"}
                </TapButton>
            </motion.form>

            <div className="mt-8 text-center z-10 w-full max-w-[340px]">
                <p className="text-[#A0A0B8] text-[13px] font-['DM_Sans'] leading-relaxed mb-6">
                    By signing up, you agree to being relentlessly roasted by an egg.
                </p>
                <p className="text-[#A0A0B8] text-[14px] font-['DM_Sans']">
                    Already have an account? <Link href="/login" className="text-white font-bold hover:underline">Sign in</Link>
                </p>
            </div>
        </main>
    );
}
