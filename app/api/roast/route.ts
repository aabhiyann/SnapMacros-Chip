import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { generateWeeklyRoast } from "@/lib/claude";

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
      const { data: meals } = await supabase
        .from("meals")
        .select("description, calories, protein, carbs, fat, created_at")
        .order("created_at", { ascending: false })
        .limit(50);
      if (meals && meals.length > 0) {
        summary = meals
          .map(
            (m) =>
              `- ${(m as { description?: string }).description ?? "Meal"} | ${(m as { calories?: number }).calories ?? "?"} cal, P: ${(m as { protein?: number }).protein ?? "?"}, C: ${(m as { carbs?: number }).carbs ?? "?"}, F: ${(m as { fat?: number }).fat ?? "?"}`
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
