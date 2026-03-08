"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { createClient } from "@/lib/supabase/client";

export function AppShell({ children, chipEmotion }: { children: React.ReactNode, chipEmotion?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      const isPublicRoute = pathname === "/login" || pathname === "/signup" || pathname === "/";

      if (!session && !isPublicRoute) {
        router.replace("/login");
      } else if (session) {
        // Enforce onboarding check for auth'd users
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", session.user.id)
          .single();

        if (!profile?.onboarding_completed && pathname !== "/onboarding" && pathname !== "/") {
          router.replace("/onboarding");
        } else if (profile?.onboarding_completed && (isPublicRoute || pathname === "/onboarding") && pathname !== "/") {
          router.replace("/dashboard");
        } else {
          setIsAuth(true);
        }
      } else {
        setIsAuth(true);
      }
    };
    checkAuth();
  }, [pathname, router]);

  // Prevent hydration flash
  if (isAuth === null && pathname !== "/") return <div className="min-h-screen bg-[#0F0F14]" />;

  return (
    <div className="min-h-screen bg-[#0F0F14] text-[#FFFFFF] flex flex-col font-['DM_Sans']">
      <main className="flex-1 pb-[calc(80px+env(safe-area-inset-bottom))]">{children}</main>
      <BottomNav />
    </div>
  );
}
