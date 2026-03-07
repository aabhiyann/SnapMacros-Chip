import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

const MODEL = "claude-3-5-sonnet-20241022";

export interface RoastContext {
    user_name: string;
    goal: string;
    days_logged: number;
    days_goal_hit: number;
    avg_calories: number;
    avg_protein: number;
    most_logged_foods: string[];
    most_indulgent_meal: { name: string; calories: number };
    best_day: string | null;
    worst_day: string | null;
}

export type RoastType = "new_user" | "perfect_week" | "rough_week" | "normal";

export interface WeeklyRoast {
    roast_title: string;
    roast_text: string;
    tip_text: string;
    mascot_mood: "happy" | "hype" | "shocked" | "laughing" | "sad" | "on_fire" | "thinking" | "sleepy";
}

const SYSTEM_PROMPT = `You are Chip, a tiny hatching egg and nutrition mascot. You provide a weekly "Roast" of the user's diet.
Your voice is witty, highly observational, slightly sarcastic but affectionately encouraging. You NEVER shame the user. You are their hilariously honest best friend.

RULES:
1. ALWAYS mention specific foods from their 'most_logged_foods' or 'most_indulgent_meal'.
2. If they had a perfect week, hype them up (but maybe joke they're a robot). If it's a rough week, make a joke about their indulgent meals but pivot quickly to actionable encouragement.
3. Be concise. The roast_text should be 2-3 short, punchy sentences.
4. The tip_text must be 1 short, highly actionable directive for next week.
5. You must return your response as purely valid JSON, with NO surrounding markdown or extra text.`;

export async function buildRoastContext(userId: string): Promise<RoastContext> {
    const supabase = createClient();
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    const startDateStr = sevenDaysAgo.toISOString().split("T")[0];

    // 1. Get Profile
    const { data: profile } = await supabase
        .from("profiles")
        .select("name, target_calories")
        .eq("user_id", userId)
        .single();

    const calTarget = profile?.target_calories || 2000;

    // 2. Get Summaries
    const { data: summaries } = await supabase
        .from("daily_summaries")
        .select("*")
        .eq("user_id", userId)
        .gte("date", startDateStr);

    const sums = summaries || [];
    const days_logged = sums.length;

    let days_goal_hit = 0;
    let total_cal = 0;
    let total_pro = 0;

    let bestDayId: string | null = null;
    let worstDayId: string | null = null;
    let bestDiff = -9999;
    let worstDiff = 9999;

    for (const s of sums) {
        if (s.total_calories > 0 && s.total_calories <= calTarget + 100) days_goal_hit++;
        total_cal += s.total_calories;
        total_pro += s.total_protein;

        // simplistic best/worst metrics
        const diff = calTarget - s.total_calories;
        if (diff >= -100 && diff > bestDiff) {
            bestDiff = diff;
            bestDayId = s.date;
        }
        if (diff < -200 && diff < worstDiff) {
            worstDiff = diff;
            worstDayId = s.date;
        }
    }

    // 3. Get Logs
    const { data: logs } = await supabase
        .from("logs")
        .select("*")
        .eq("user_id", userId)
        .gte("created_at", sevenDaysAgo.toISOString());

    const lgs = logs || [];

    // Frequency map for foods
    const foodCount: Record<string, number> = {};
    let most_indulgent = { name: "Nothing crazy", calories: 0 };

    for (const l of lgs) {
        foodCount[l.food_name] = (foodCount[l.food_name] || 0) + 1;
        if (l.calories > most_indulgent.calories) {
            most_indulgent = { name: l.food_name, calories: l.calories };
        }
    }

    const sortedFoods = Object.entries(foodCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(x => x[0]);

    return {
        user_name: profile?.name || "Buddy",
        goal: "Maintain", // simplified for demo
        days_logged,
        days_goal_hit,
        avg_calories: days_logged ? Math.round(total_cal / days_logged) : 0,
        avg_protein: days_logged ? Math.round(total_pro / days_logged) : 0,
        most_logged_foods: sortedFoods,
        most_indulgent_meal: most_indulgent,
        best_day: bestDayId,
        worst_day: worstDayId
    };
}

export function getRoastType(ctx: RoastContext): RoastType {
    if (ctx.days_logged <= 2) return "new_user";
    if (ctx.days_goal_hit >= 6) return "perfect_week";
    if (ctx.days_goal_hit <= 2 && ctx.days_logged > 3) return "rough_week";
    return "normal";
}

export async function generateRoast(ctx: RoastContext, roastType: RoastType): Promise<WeeklyRoast> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("Missing ANTHROPIC_API_KEY");

    const client = new Anthropic({ apiKey });

    const prompt = `
Generate a weekly roast for a user based on this 7-day data:
Name: ${ctx.user_name}
Roast Type Constraint: ${roastType}
Days Logged: ${ctx.days_logged}/7
Days Goal Hit: ${ctx.days_goal_hit}
Average Calories: ${ctx.avg_calories}
Average Protein: ${ctx.avg_protein}g
Most Logged Foods: ${ctx.most_logged_foods.join(", ")}
Most Indulgent Meal: ${ctx.most_indulgent_meal.name} (${Math.round(ctx.most_indulgent_meal.calories)} cal)
Best Day: ${ctx.best_day || "N/A"}
Worst Day: ${ctx.worst_day || "N/A"}

Return ONLY a JSON matching this exact schema:
{
  "roast_title": "Catchy short phrase (e.g. 'The Cheese Incident')",
  "roast_text": "The 2-3 sentence roast.",
  "tip_text": "One quick, highly actionable tip.",
  "mascot_mood": "happy" | "hype" | "shocked" | "laughing" | "sad" | "on_fire" | "thinking" | "sleepy"
}`;

    const response = await client.messages.create({
        model: MODEL,
        system: SYSTEM_PROMPT,
        max_tokens: 400,
        messages: [{ role: "user", content: prompt }]
    });

    const textBlock = response.content.find((c) => c.type === "text");
    if (!textBlock || textBlock.type !== "text") throw new Error("No text response from Claude");

    let rawText = textBlock.text.trim();
    if (rawText.startsWith("\`\`\`json")) rawText = rawText.replace(/^\`\`\`json/, "");
    if (rawText.startsWith("\`\`\`")) rawText = rawText.replace(/^\`\`\`/, "");
    if (rawText.endsWith("\`\`\`")) rawText = rawText.replace(/\`\`\`$/, "");
    rawText = rawText.trim();

    return JSON.parse(rawText) as WeeklyRoast;
}
