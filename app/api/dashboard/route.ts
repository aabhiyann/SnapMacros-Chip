import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { getMascotState } from "@/lib/agents/chip-agent";
import { calculateFullProfile } from "@/lib/tdee";

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized", code: "AUTH_REQUIRED" }, { status: 401 });
        }
        const userId = user.id;

        // 3. Fetch User Profile (Streaks, Name, Targets)
        const { data: profile } = await supabase
            .from("profiles")
            .select("streak_days, longest_streak, name, target_calories, target_protein, target_carbs, target_fat")
            .eq("user_id", userId)
            .single();

        const streakDays = profile?.streak_days || 0;

        // Use profile targets when available; fallback to calculated defaults
        const USER_GOALS = {
            weightKg: 75,
            heightCm: 175,
            age: 28,
            gender: "male" as const,
            activityLevel: "active" as const,
            goalType: "maintain" as const,
        };

        const calculatedTargets = calculateFullProfile(USER_GOALS);
        const targets = (profile?.target_calories != null && profile?.target_protein != null)
            ? {
                calorieTarget: profile.target_calories,
                macroTarget: {
                    protein: profile.target_protein,
                    carbs: profile.target_carbs ?? calculatedTargets.macroTarget.carbs,
                    fat: profile.target_fat ?? calculatedTargets.macroTarget.fat,
                },
            }
            : calculatedTargets;
        const today = new Date().toISOString().split("T")[0];

        // 1. Fetch Daily Summary
        const { data: summary } = await supabase
            .from("daily_summaries")
            .select("*")
            .eq("user_id", userId)
            .eq("date", today)
            .single();

        const currentMacros = summary || { total_calories: 0, total_protein: 0, total_carbs: 0, total_fat: 0 };

        // 2. Fetch Food Logs for today
        const { data: logs, error: logsError } = await supabase
            .from("logs")
            .select("*")
            .eq("user_id", userId)
            .gte("created_at", `${today}T00:00:00.000Z`)
            .lte("created_at", `${today}T23:59:59.999Z`)
            .order("created_at", { ascending: false });

        if (logsError) throw logsError;

        // Calculate Percentages & Remaining
        const percentages = {
            calories: Math.min(Math.round((currentMacros.total_calories / targets.calorieTarget) * 100), 100),
            protein: Math.min(Math.round((currentMacros.total_protein / targets.macroTarget.protein) * 100), 100),
            carbs: Math.min(Math.round((currentMacros.total_carbs / targets.macroTarget.carbs) * 100), 100),
            fat: Math.min(Math.round((currentMacros.total_fat / targets.macroTarget.fat) * 100), 100),
        };

        const remaining = {
            calories: Math.max(targets.calorieTarget - currentMacros.total_calories, 0),
            protein: Math.max(targets.macroTarget.protein - currentMacros.total_protein, 0),
            carbs: Math.max(targets.macroTarget.carbs - currentMacros.total_carbs, 0),
            fat: Math.max(targets.macroTarget.fat - currentMacros.total_fat, 0),
        };

        // Determine Chip State
        const maxSingleMeal = logs?.reduce((max, log) => Math.max(max, log.calories), 0) || 0;

        // Simulate missed days (just an example, normally would compare dates)
        const missedDays = 0;

        const chipState = getMascotState({
            isAnalyzing: false,
            streakDays,
            singleMealCalories: maxSingleMeal,
            missedDays,
            caloriesPercent: (currentMacros.total_calories / targets.calorieTarget) * 100,
            hourOfDay: new Date().getHours(),
            todayLogsCount: logs?.length || 0,
        });

        const payload = {
            targets: {
                calories: targets.calorieTarget,
                protein: targets.macroTarget.protein,
                carbs: targets.macroTarget.carbs,
                fat: targets.macroTarget.fat,
            },
            current: {
                calories: currentMacros.total_calories,
                protein: currentMacros.total_protein,
                carbs: currentMacros.total_carbs,
                fat: currentMacros.total_fat,
            },
            percentages,
            remaining,
            profile: {
                streak_days: streakDays,
                name: profile?.name || user.email?.split('@')[0] || "User",
                email: user?.email || ""
            },
            logs: (logs || []).map((l) => ({
                ...l,
                description: (l as { meal_name?: string; description?: string }).meal_name || (l as { meal_name?: string; description?: string }).description || "",
            })),
            chip: chipState,
        };

        return NextResponse.json(payload, {
            status: 200,
            headers: {
                "Cache-Control": "private, max-age=30",
            },
        });
    } catch (error) {
        console.error("Dashboard API Error:", error);
        return NextResponse.json({ error: "Failed to load dashboard data", code: "DASHBOARD_ERROR" }, { status: 500 });
    }
}
