import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DEMO_USER_ID } from "@/lib/auth"; // Mock ID
import { z } from "zod";

const FoodLogSchema = z.object({
    food_name: z.string().min(1),
    calories: z.number().nonnegative(),
    protein: z.number().nonnegative(),
    carbs: z.number().nonnegative(),
    fat: z.number().nonnegative(),
});

export async function POST(request: Request) {
    try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const userId = user.id;

        // 1. Parse and validate
        const body = await request.json();
        const parsed = FoodLogSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid log payload", details: parsed.error.issues }, { status: 400 });
        }

        // 2. Insert to logs
        const { data: logData, error: logError } = await supabase
            .from("logs")
            .insert({
                user_id: userId,
                food_name: parsed.data.food_name,
                calories: parsed.data.calories,
                protein: parsed.data.protein,
                carbs: parsed.data.carbs,
                fat: parsed.data.fat,
            })
            .select()
            .single();

        if (logError) throw logError;

        // 3. Update Profiles for Streaks
        const today = new Date().toISOString().split("T")[0];
        const { data: profile } = await supabase
            .from("profiles")
            .select("streak_days, longest_streak, last_log_date")
            .eq("user_id", userId)
            .single();

        let streak = 1;
        let longest = 1;

        if (profile) {
            if (profile.last_log_date !== today) {
                // Calculate yesterday
                const yesterdayDate = new Date();
                yesterdayDate.setDate(yesterdayDate.getDate() - 1);
                const yesterdayStr = yesterdayDate.toISOString().split("T")[0];

                if (profile.last_log_date === yesterdayStr) {
                    streak = profile.streak_days + 1; // Continue streak
                } else {
                    streak = 1; // Reset streak
                }
            } else {
                streak = profile.streak_days; // Logged today already
            }

            longest = Math.max(streak, profile.longest_streak);

            await supabase.from("profiles").update({
                streak_days: streak,
                longest_streak: longest,
                last_log_date: today,
            }).eq("user_id", userId);
        } else {
            // Create new profile record on first log
            await supabase.from("profiles").insert({
                user_id: userId,
                streak_days: 1,
                longest_streak: 1,
                last_log_date: today,
            });
        }

        // 4. Get updated daily totals
        const { data: summaryData } = await supabase
            .from("daily_summaries")
            .select("*")
            .eq("user_id", userId)
            .eq("date", today)
            .single();

        return NextResponse.json({
            log: logData,
            daily_totals: summaryData || { date: today, total_calories: 0, total_protein: 0, total_carbs: 0, total_fat: 0 },
            streak: streak,
        });
    } catch (error) {
        console.error("Log error:", error);
        return NextResponse.json({ error: "Failed to log food", code: "LOG_CREATE_ERROR" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const userId = user.id;

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ error: "Missing log ID" }, { status: 400 });

        // Ensure they own the log
        const { data: log } = await supabase.from("logs").select("id").eq("id", id).eq("user_id", userId).single();
        if (!log) return NextResponse.json({ error: "Log not found or unauthorized" }, { status: 404 });

        const { error: delError } = await supabase.from("logs").delete().eq("id", id);
        if (delError) throw delError;

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("Delete error:", error);
        return NextResponse.json({ error: "Failed to delete log", code: "LOG_DELETE_ERROR" }, { status: 500 });
    }
}

// GET is existing (fetching history)
export async function GET(request: Request) {
    try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const userId = user.id;

        // Default GET fetch to get recent history to populate feeds
        const { data, error } = await supabase
            .from("logs")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(50);

        if (error) throw error;
        return NextResponse.json(data);
    } catch (err) {
        return NextResponse.json({ error: "Failed to get history", code: "LOG_FETCH_ERROR" }, { status: 500 });
    }
}
