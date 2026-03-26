"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Chip } from "@/components/Chip";
import { createClient } from "@/lib/supabase/client";

export default function SplashScreen() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Route after 1s — Chip icon fades up, wordmark fades in, done
    const routeTimer = setTimeout(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          router.replace("/login");
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (profile?.onboarding_completed) {
          router.replace("/dashboard");
        } else {
          router.replace("/onboarding");
        }
      } catch {
        router.replace("/login");
      }
    }, 1000);

    return () => clearTimeout(routeTimer);
  }, [router, supabase]);

  return (
    <div className="min-h-screen bg-[#09090F] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Ambient glow */}
      <div
        className="absolute w-[300px] h-[300px] pointer-events-none"
        style={{
          background: "radial-gradient(circle at center, rgba(79,158,255,0.10) 0%, transparent 70%)",
        }}
      />

      {/* Chip icon fades up */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 mb-6"
      >
        <Chip emotion="happy" size={96} />
      </motion.div>

      {/* Wordmark fades in after chip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4, ease: "easeOut" }}
        className="z-10 text-center"
      >
        <p className="font-['Bricolage_Grotesque'] font-bold text-[30px] tracking-tight leading-none">
          <span className="text-white">Snap</span>
          <span className="text-[#4F9EFF]">Macros</span>
        </p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.35 }}
          className="text-[#56566F] font-['DM_Sans'] text-[13px] mt-1"
        >
          Snap. Track. Roast.
        </motion.p>
      </motion.div>
    </div>
  );
}
