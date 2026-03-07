"use client";

import { useEffect } from "react";
import { PWAInstallBanner } from "@/components/ui/PWAInstallBanner";

export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => reg.update())
      .catch(() => { });
  }, []);
  return <PWAInstallBanner />;
}
