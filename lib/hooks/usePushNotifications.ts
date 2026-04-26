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
    const tokenRef = useRef<string | null>(null);
    const listenersAdded = useRef(false);

    useEffect(() => {
        if (!isNative()) { setIsReady(true); return; }
        init();
    }, []);

    async function init() {
        try {
            const { PushNotifications } = await import("@capacitor/push-notifications");
            if (!listenersAdded.current) {
                listenersAdded.current = true;
                await PushNotifications.addListener("registration", async (token) => {
                    tokenRef.current = token.value;
                    try {
                        await fetch(api("/api/push-token"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: token.value, platform: "ios" }) });
                    } catch { /* non-critical */ }
                });
                await PushNotifications.addListener("registrationError", (err) => { console.warn("[PushNotifications] Registration error:", err); });
                await PushNotifications.addListener("pushNotificationReceived", (n) => { console.log("[PushNotifications] Received:", n.title); });
            }
            const status = await PushNotifications.checkPermissions();
            if (status.receive === "granted") { setIsEnabled(true); await PushNotifications.register(); }
        } catch (err) {
            console.warn("[PushNotifications] Not available:", err);
        } finally { setIsReady(true); }
    }

    async function enable() {
        if (!isNative()) return;
        try {
            const { PushNotifications } = await import("@capacitor/push-notifications");
            let status = await PushNotifications.checkPermissions();
            if (status.receive === "prompt") status = await PushNotifications.requestPermissions();
            if (status.receive !== "granted") return;
            await PushNotifications.register();
            setIsEnabled(true);
        } catch (err) { console.warn("[PushNotifications] Enable failed:", err); }
    }

    async function disable() {
        if (!isNative()) return;
        try {
            if (tokenRef.current) {
                await fetch(api("/api/push-token"), { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: tokenRef.current }) });
                tokenRef.current = null;
            }
            setIsEnabled(false);
        } catch (err) { console.warn("[PushNotifications] Disable failed:", err); }
    }

    return { isEnabled, isReady, toggle: async () => { if (isEnabled) await disable(); else await enable(); } };
}
