import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { generateWeeklyRoast } from "@/lib/claude";
import { DEMO_USER_ID } from "@/lib/auth";

const querySchema = z.object({
  weekStart: z.string().datetime().optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({ weekStart: searchParams.get("weekStart") ?? undefined });
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid query", details: parsed.error.flatten() }, { status: 400 });
    }
    let summary = "No meals logged this week.";
    try {
      const supabase = createClient();
      const { data: logs, error } = await supabase
        .from("logs")
        .select("meal_name, calories, protein, carbs, fat, created_at")
        .eq("user_id", DEMO_USER_ID)
        .order("created_at", { ascending: false })
        .limit(50);

      if (logs && logs.length > 0) {
        summary = logs
          .map(
            (m) =>
              `- ${m.meal_name ?? "Meal"} | ${m.calories ?? "?"} cal, P: ${m.protein ?? "?"}, C: ${m.carbs ?? "?"}, F: ${m.fat ?? "?"}`
          )
          .join("\n");
      }
    } catch {
      // Supabase not configured or table missing; use default summary
    }
    const roast = await generateWeeklyRoast(summary);
    return NextResponse.json({ roast });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
