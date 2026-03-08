import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DEMO_USER_ID } from "@/lib/auth";
import { buildRoastContext, getRoastType, generateRoast } from "@/lib/agents/roast-agent";
import { getRateLimit } from "@/lib/rate-limit";

// Use week_start (Sunday) to unify roasts
function getWeekStart(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day; // Sunday is 0
  date.setDate(diff);
  return date.toISOString().split("T")[0];
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = user.id;

    // 1. Rate Limit: 3 roasts per week per user
    // We use our existing in-memory limiter but segment by week string
    const weekStart = getWeekStart(new Date());
    const limitKey = `roast-${userId}-${weekStart}`;

    const limitInfo = getRateLimit(limitKey, 3);
    if (!limitInfo.success) {
      return NextResponse.json({ error: "Rate limit reached. Only 3 roasts per week!" }, { status: 429 });
    }

    // 2. Build AI Context
    const ctx = await buildRoastContext(userId);
    const roastType = getRoastType(ctx);

    // 3. Generate AI response
    const aiOutput = await generateRoast(ctx, roastType);

    // 4. Secure Upsert to weekly_roasts
    const { data: newRoast, error } = await supabase
      .from("weekly_roasts")
      .upsert({
        user_id: userId,
        week_start: weekStart,
        roast_title: aiOutput.roast_title,
        roast_text: aiOutput.roast_text,
        tip_text: aiOutput.tip_text,
        mascot_mood: aiOutput.mascot_mood
      }, { onConflict: "user_id, week_start" })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, roast: newRoast });

  } catch (err) {
    console.error("Roast Generation Error:", err);
    const msg = err instanceof Error ? err.message : "Failed to generate roast";
    if (msg.includes("Missing ") || msg.includes("MISSING_ENV")) {
      return NextResponse.json({ error: msg, code: "MISSING_ENV_VAR" }, { status: 500 });
    }
    return NextResponse.json({ error: msg, code: "ROAST_FAILED" }, { status: 500 });
  }
}
