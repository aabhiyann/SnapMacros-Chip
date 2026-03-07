import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DEMO_USER_ID } from "@/lib/auth";

export const revalidate = 30; // 30s cache as specified in README

export async function GET(request: Request) {
    try {
        const supabase = createClient();
        const { searchParams } = new URL(request.url);
        // Use the passed date, or fallback to server's current date (YYYY-MM-DD)
        const dateQuery = searchParams.get("date") ?? new Date().toISOString().split('T')[0];

        const { data: summary, error } = await supabase
            .from("daily_summaries")
            .select("*")
            .eq("user_id", DEMO_USER_ID)
            .eq("date", dateQuery)
            .maybeSingle();

        if (error) {
            console.error("DB Read Error:", error);
            return NextResponse.json({ error: "Database error" }, { status: 500 });
        }

        return NextResponse.json({
            summary: summary || {
                total_calories: 0,
                total_protein: 0,
                total_carbs: 0,
                total_fat: 0,
                date: dateQuery
            }
        });
    } catch (err) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
