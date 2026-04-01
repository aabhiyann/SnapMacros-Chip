"use client";

import { useEffect } from "react";
import { api } from "@/lib/api";

/** Detects native Capacitor environment */
function isNative(): boolean {
    try {
        return typeof window !== "undefined" &&
            !!(window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } })
                .Capacitor?.isNativePlatform?.();
    } catch { return false; }
}

/**
 * Requests push notification permission on native iOS and registers the
 * device token with the server. Safe to call on every app launch — it
 * silently no-ops on web or if permission was already granted.
 */
export function usePushNotifications() {
    useEffect(() => {
        if (!isNative()) return;

        async function registerPush() {
            try {
                const { PushNotifications } = await import("@capacitor/push-notifications");

                // Check current permission status
                let permStatus = await PushNotifications.checkPermissions();

                if (permStatus.receive === "prompt") {
                    permStatus = await PushNotifications.requestPermissions();
                }

                if (permStatus.receive !== "granted") return;

                // Register with APNs — triggers "registration" or "registrationError"
                await PushNotifications.register();

                // One-time listener: capture the APNs token and send to server
                await PushNotifications.addListener("registration", async (token) => {
                    try {
                        await fetch(api("/api/push-token"), {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ token: token.value, platform: "ios" }),
                        });
                    } catch { /* silently ignore — non-critical */ }
                });

                await PushNotifications.addListener("registrationError", (err) => {
                    console.warn("[PushNotifications] Registration error:", err);
                });

                // Handle foreground notifications (show as in-app banner)
                await PushNotifications.addListener("pushNotificationReceived", (notification) => {
                    console.log("[PushNotifications] Received:", notification.title);
                });

            } catch (err) {
                // @capacitor/push-notifications not available — silently skip
                console.warn("[PushNotifications] Not available:", err);
            }
        }

        registerPush();
    }, []);
}
