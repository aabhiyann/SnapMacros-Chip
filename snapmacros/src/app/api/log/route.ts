import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { FoodLogSchema, type FoodLogInput } from "@/lib/validation";
import {
  getUserProfile,
  updateUserProfile,
  insertFoodLog,
  getDailySummary,
  deleteLog as deleteLogDb,
} from "@/lib/db";

async function getSupabase() {
  const cookieStore = await cookies();
  return createServerSupabaseClient({
    getAll: () => cookieStore.getAll(),
    setAll: (cookiesToSet) => {
      cookiesToSet.forEach((c) => {
        try {
          cookieStore.set(c.name, c.value, c.options as Record<string, unknown> | undefined);
        } catch {
          // ignore
        }
      });
    },
  });
}

export async function POST(request: NextRequest) {
  const supabase = await getSupabase();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized", code: "AUTH_REQUIRED" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = FoodLogSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", code: "VALIDATION_ERROR", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const input: FoodLogInput = parsed.data;
  const log = await insertFoodLog(supabase, {
    userId: user.id,
    mealType: input.mealType,
    imageUrl: input.imageUrl ?? null,
    description: input.description,
    macros: input.macros,
    confidence: input.confidence,
    loggedAt: input.loggedAt,
  });

  const profile = await getUserProfile(supabase, user.id);
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400 * 1000).toISOString().slice(0, 10);
  let streak = profile.streakDays;
  const lastLog = profile.lastLogDate;

  if (lastLog !== today) {
    if (lastLog === yesterday) {
      streak += 1;
    } else {
      streak = 1;
    }
    const longest = Math.max(profile.longestStreak, streak);
    await updateUserProfile(supabase, user.id, {
      lastLogDate: today,
      streakDays: streak,
      longestStreak: longest,
    });
  }

  const daily = await getDailySummary(supabase, user.id, today);
  const daily_totals = daily
    ? { calories: daily.totalCalories, protein: daily.totalProtein, carbs: daily.totalCarbs, fat: daily.totalFat }
    : { calories: log.macros.calories, protein: log.macros.protein, carbs: log.macros.carbs, fat: log.macros.fat };

  return NextResponse.json({ log, daily_totals, streak });
}

export async function DELETE(request: NextRequest) {
  const supabase = await getSupabase();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized", code: "AUTH_REQUIRED" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const logId = searchParams.get("id");
  if (!logId) {
    return NextResponse.json({ error: "Missing log id", code: "BAD_REQUEST" }, { status: 400 });
  }

  await deleteLogDb(supabase, logId, user.id);
  return new NextResponse(null, { status: 204 });
}
