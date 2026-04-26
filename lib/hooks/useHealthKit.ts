"use client";

/**
 * HealthKit integration via capacitor-health.
 *
 * - readTodayActivity(): reads today's active energy burned (kcal)
 *
 * Safe to call on web — silently returns null.
 */

function isNative(): boolean {
    try {
        return typeof window !== "undefined" &&
            !!(window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } })
                .Capacitor?.isNativePlatform?.();
    } catch { return false; }
}

export interface ActivityData {
    activeEnergyKcal: number;
}

/**
 * Requests HealthKit READ_ACTIVE_CALORIES permission and returns
 * today's total active energy burned. Returns null on web or if denied.
 */
export async function readTodayActivity(): Promise<ActivityData | null> {
    if (!isNative()) return null;
    try {
        const { Health } = await import("capacitor-health");

        const permResponse = await Health.requestHealthPermissions({
            permissions: ["READ_ACTIVE_CALORIES"],
        });
        // PermissionResponse.permissions is an array of {key: boolean} objects
        const granted = permResponse.permissions.some(p => Object.values(p).some(Boolean));
        if (!granted) return null;

        const start = new Date();
        start.setHours(0, 0, 0, 0);

        const { aggregatedData } = await Health.queryAggregated({
            startDate:  start.toISOString(),
            endDate:    new Date().toISOString(),
            dataType:   "active-calories",
            bucket:     "day",
        });

        const total = aggregatedData.reduce((sum, s) => sum + (s.value ?? 0), 0);
        return { activeEnergyKcal: Math.round(total) };
    } catch (err) {
        console.warn("[HealthKit] readTodayActivity failed:", err);
        return null;
    }
}

