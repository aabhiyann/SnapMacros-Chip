"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";

function isNative(): boolean {
    try {
        return typeof window !== "undefined" &&
            !!(window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } })
                .Capacitor?.isNativePlatform?.();
    } catch { return false; }
}

export function usePushNotifications() {
    const [isEnabled, setIsEnabled] = useState(false);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (!isNative()) { setIsReady(true); return; }
    }, []);

    return { isEnabled, isReady, toggle: async () => {} };
}
