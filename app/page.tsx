"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Chip } from "@/components/Chip";
import { createClient } from "@/lib/supabase/client";

export default function SplashScreen() {
  const router = useRouter();
  const [showBubble, setShowBubble] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    // Show speech bubble at 900ms
    const bubbleTimer = setTimeout(() => {
      setShowBubble(true);
    }, 900);

    // Route logic at 1200ms
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
      } catch (err) {
        console.error("Auth routing error:", err);
        router.replace("/login");
      }
    }, 1200);

    return () => {
      clearTimeout(bubbleTimer);
      clearTimeout(routeTimer);
    };
  }, [router, supabase]);

  return (
    <div className="min-h-screen bg-[#0F0F14] flex flex-col items-center justify-center relative overflow-hidden">
      {/* 150ms: Snap word fades in */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="flex items-center gap-1 z-10"
      >
        <span className="text-white font-heading font-bold text-[32px]">Snap</span>
        {/* 300ms: Macros word fades in */}
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="text-[#3B8BF7] font-heading font-bold text-[32px]"
        >
          Macros
        </motion.span>
      </motion.div>

      {/* 500ms: Tagline fades in */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="text-[#A0A0B8] font-body text-[14px] mt-2 z-10"
      >
        Snap. Track. Roast.
      </motion.p>

      {/* 700ms: Chip bounces up */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7, type: "spring", stiffness: 300, damping: 20 }}
        className="mt-12 relative z-10"
      >
        <Chip emotion="happy" size={90} />

        {/* 900ms: Speech Bubble */}
        <AnimatePresence>
          {showBubble && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: -10, y: 10 }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute -top-12 -right-4 bg-white text-black px-4 py-2 rounded-2xl rounded-bl-sm font-body text-sm font-medium shadow-lg whitespace-nowrap"
            >
              Hey! Let&apos;s track something 🥚
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
