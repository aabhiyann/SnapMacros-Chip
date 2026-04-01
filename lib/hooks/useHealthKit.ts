"use client";

/**
 * HealthKit integration via capacitor-health.
 *
 * - readTodayActivity(): reads today's active energy burned (kcal)
 * - writeMealNutrition(): writes dietary nutrition to Apple Health
 *   (stubbed — capacitor-health v8 read-only; dietary writes require a
 *    future native Swift plugin. The stub is a no-op until then.)
 *
 * Both functions are safe to call on web — they silently return null/void.
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

export interface MealNutrition {
    calories:  number;
    proteinG:  number;
    carbsG:    number;
    fatG:      number;
    mealName?: string;
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

/**
 * Writes a dietary nutrition sample to Apple Health.
 *
 * NOTE: capacitor-health v8 does not yet expose dietary write APIs.
 * This function is a documented stub — it will become functional once
 * a custom native Swift plugin is added to the Xcode project that
 * calls HKHealthStore.save() with HKQuantitySample types for:
 *   - HKQuantityTypeIdentifierDietaryEnergyConsumed
 *   - HKQuantityTypeIdentifierDietaryProtein
 *   - HKQuantityTypeIdentifierDietaryCarbohydrates
 *   - HKQuantityTypeIdentifierDietaryFatTotal
 */
export async function writeMealNutrition(_meal: MealNutrition): Promise<void> {
    // No-op until native dietary write plugin is added
    // Native Swift extension required: see docs/healthkit-dietary-writes.md
}
