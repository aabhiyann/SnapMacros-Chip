import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DEMO_USER_ID } from "@/lib/auth";

export async function GET(request: Request) {
    try {
        const supabase = createClient();
        const userId = DEMO_USER_ID;

        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get("days") || "7");
        const limit = Math.min(days, 30); // max 30

        // Date math
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - Math.max(limit - 1, 0));
        const startDateStr = startDate.toISOString().split("T")[0];

        // 1. Fetch Summaries
        const { data: summaries, error: sumError } = await supabase
            .from("daily_summaries")
            .select("*")
            .eq("user_id", userId)
            .gte("date", startDateStr)
            .order("date", { ascending: true });

        if (sumError) throw sumError;

        // 2. Fetch Profile streaks
        const { data: profile } = await supabase
            .from("profiles")
            .select("streak_days, longest_streak")
            .eq("user_id", userId)
            .single();

        // 3. Fetch active Roast
        const todayDate = new Date();
        const day = todayDate.getDay();
        const diff = todayDate.getDate() - day;
        todayDate.setDate(diff);
        const weekStart = todayDate.toISOString().split("T")[0];

        const { data: roast } = await supabase
            .from("weekly_roasts")
            .select("*")
            .eq("user_id", userId)
            .eq("week_start", weekStart)
            .single();

        return NextResponse.json({
            summaries: summaries || [],
            streak: profile?.streak_days || 0,
            longest_streak: profile?.longest_streak || 0,
            roast: roast || null
        }, {
            status: 200,
            headers: { "Cache-Control": "private, max-age=60" }
        });
    } catch (err) {
        console.error("Progress API Error:", err);
        return NextResponse.json({ error: "Failed to load progress" }, { status: 500 });
    }
}
