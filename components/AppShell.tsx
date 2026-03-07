"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";

export function AppShell({ children, chipEmotion }: { children: React.ReactNode, chipEmotion?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      // In prod: await supabase.auth.getUser()
      const isAuthed = true; // Use DEMO
      if (!isAuthed && pathname !== "/login") {
        router.push("/login");
      } else {
        setIsAuth(true);
      }
    };
    checkAuth();
  }, [pathname, router]);

  // Prevent hydration flash
  if (isAuth === null) return <div className="min-h-screen bg-[#0F0F14]" />;

  return (
    <div className="min-h-screen bg-[#0F0F14] text-[#FFFFFF] flex flex-col font-['DM_Sans']">
      <main className="flex-1 pb-[72px]">{children}</main>
      <BottomNav />
    </div>
  );
}
