import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  UserProfile,
  FoodLog,
  DailySummary,
  WeeklyRoast,
  MacroSet,
  MealType,
  Confidence,
} from "./types";

type DbProfile = {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  weight_kg: number;
  height_cm: number;
  age: number;
  gender: "male" | "female" | "other";
  activity_level: string;
  goal_type: string;
  bmr: number;
  tdee: number;
  calorie_target: number;
  macro_target: MacroSet;
  last_log_date: string | null;
  streak_days: number;
  longest_streak: number;
};

type DbFoodLog = {
  id: string;
  user_id: string;
  meal_type: MealType;
  image_url: string | null;
  description: string;
  macros: MacroSet;
  confidence: Confidence;
  logged_at: string;
  created_at: string;
};

type DbDailySummary = {
  user_id: string;
  date: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  meal_count: number;
  updated_at: string;
};

type DbWeeklyRoast = {
  id: string;
  user_id: string;
  week_start: string;
  roast_text: string;
  created_at: string;
};

function toProfile(row: DbProfile): UserProfile {
  return {
    id: row.id,
    email: row.email,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    weightKg: row.weight_kg,
    heightCm: row.height_cm,
    age: row.age,
    gender: row.gender,
    activityLevel: row.activity_level as UserProfile["activityLevel"],
    goalType: row.goal_type as UserProfile["goalType"],
    bmr: row.bmr,
    tdee: row.tdee,
    calorieTarget: row.calorie_target,
    macroTarget: row.macro_target,
    lastLogDate: row.last_log_date ?? null,
    streakDays: row.streak_days ?? 0,
    longestStreak: row.longest_streak ?? 0,
  };
}

function toFoodLog(row: DbFoodLog): FoodLog {
  return {
    id: row.id,
    userId: row.user_id,
    mealType: row.meal_type,
    imageUrl: row.image_url,
    description: row.description,
    macros: row.macros,
    confidence: row.confidence,
    loggedAt: row.logged_at,
    createdAt: row.created_at,
  };
}

function toDailySummary(row: DbDailySummary, logs: FoodLog[]): DailySummary {
  return {
    date: row.date,
    totalCalories: row.total_calories,
    totalProtein: row.total_protein,
    totalCarbs: row.total_carbs,
    totalFat: row.total_fat,
    mealCount: row.meal_count,
    logs,
  };
}

function toWeeklyRoast(row: DbWeeklyRoast): WeeklyRoast {
  return {
    id: row.id,
    userId: row.user_id,
    weekStart: row.week_start,
    roastText: row.roast_text,
    createdAt: row.created_at,
  };
}

export async function getUserProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<UserProfile> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) throw new Error(`Failed to get profile: ${error.message}`);
  if (!data) throw new Error("Profile not found");
  return toProfile(data as DbProfile);
}

export type ProfileUpdate = Partial<{
  weightKg: number;
  heightCm: number;
  age: number;
  gender: "male" | "female" | "other";
  activityLevel: string;
  goalType: string;
  bmr: number;
  tdee: number;
  calorieTarget: number;
  macroTarget: MacroSet;
  lastLogDate: string | null;
  streakDays: number;
  longestStreak: number;
}>;

export async function updateUserProfile(
  supabase: SupabaseClient,
  userId: string,
  updates: ProfileUpdate
): Promise<UserProfile> {
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (updates.weightKg != null) row.weight_kg = updates.weightKg;
  if (updates.heightCm != null) row.height_cm = updates.heightCm;
  if (updates.age != null) row.age = updates.age;
  if (updates.gender != null) row.gender = updates.gender;
  if (updates.activityLevel != null) row.activity_level = updates.activityLevel;
  if (updates.goalType != null) row.goal_type = updates.goalType;
  if (updates.bmr != null) row.bmr = updates.bmr;
  if (updates.tdee != null) row.tdee = updates.tdee;
  if (updates.calorieTarget != null) row.calorie_target = updates.calorieTarget;
  if (updates.macroTarget != null) row.macro_target = updates.macroTarget;
  if (updates.lastLogDate !== undefined) row.last_log_date = updates.lastLogDate;
  if (updates.streakDays != null) row.streak_days = updates.streakDays;
  if (updates.longestStreak != null) row.longest_streak = updates.longestStreak;

  const { data, error } = await supabase
    .from("profiles")
    .update(row)
    .eq("id", userId)
    .select()
    .single();
  if (error) throw new Error(`Failed to update profile: ${error.message}`);
  if (!data) throw new Error("Profile not found after update");
  return toProfile(data as DbProfile);
}

export async function getTodayLogs(
  supabase: SupabaseClient,
  userId: string
): Promise<FoodLog[]> {
  const today = new Date().toISOString().slice(0, 10);
  const start = `${today}T00:00:00.000Z`;
  const end = `${today}T23:59:59.999Z`;
  const { data, error } = await supabase
    .from("food_logs")
    .select("*")
    .eq("user_id", userId)
    .gte("logged_at", start)
    .lte("logged_at", end)
    .order("logged_at", { ascending: true });
  if (error) throw new Error(`Failed to get today logs: ${error.message}`);
  return (data ?? []).map((r) => toFoodLog(r as DbFoodLog));
}

export type FoodLogInsert = {
  userId: string;
  mealType: MealType;
  imageUrl?: string | null;
  description: string;
  macros: MacroSet;
  confidence: Confidence;
  loggedAt?: string;
};

export async function insertFoodLog(
  supabase: SupabaseClient,
  log: FoodLogInsert
): Promise<FoodLog> {
  const row = {
    user_id: log.userId,
    meal_type: log.mealType,
    image_url: log.imageUrl ?? null,
    description: log.description,
    macros: log.macros,
    confidence: log.confidence,
    logged_at: log.loggedAt ?? new Date().toISOString(),
  };
  const { data, error } = await supabase.from("food_logs").insert(row).select().single();
  if (error) throw new Error(`Failed to insert food log: ${error.message}`);
  if (!data) throw new Error("Insert did not return row");
  return toFoodLog(data as DbFoodLog);
}

export async function getDailySummary(
  supabase: SupabaseClient,
  userId: string,
  date: string
): Promise<DailySummary | null> {
  const { data: summaryRow, error: summaryError } = await supabase
    .from("daily_summaries")
    .select("*")
    .eq("user_id", userId)
    .eq("date", date)
    .maybeSingle();
  if (summaryError) throw new Error(`Failed to get daily summary: ${summaryError.message}`);
  if (!summaryRow) return null;

  const start = `${date}T00:00:00.000Z`;
  const end = `${date}T23:59:59.999Z`;
  const { data: logsData, error: logsError } = await supabase
    .from("food_logs")
    .select("*")
    .eq("user_id", userId)
    .gte("logged_at", start)
    .lte("logged_at", end)
    .order("logged_at", { ascending: true });
  if (logsError) throw new Error(`Failed to get logs for summary: ${logsError.message}`);
  const logs = (logsData ?? []).map((r) => toFoodLog(r as DbFoodLog));
  return toDailySummary(summaryRow as DbDailySummary, logs);
}

export async function getWeekSummaries(
  supabase: SupabaseClient,
  userId: string,
  days = 7
): Promise<DailySummary[]> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (days - 1));
  const { data, error } = await supabase
    .from("daily_summaries")
    .select("*")
    .eq("user_id", userId)
    .gte("date", startDate.toISOString().slice(0, 10))
    .lte("date", endDate.toISOString().slice(0, 10))
    .order("date", { ascending: false });
  if (error) throw new Error(`Failed to get week summaries: ${error.message}`);
  const rows = (data ?? []) as DbDailySummary[];
  const result: DailySummary[] = [];
  for (const row of rows) {
    const summary = await getDailySummary(supabase, userId, row.date);
    if (summary) result.push(summary);
  }
  return result.sort((a, b) => (b.date > a.date ? 1 : -1));
}

export async function getLatestRoast(
  supabase: SupabaseClient,
  userId: string
): Promise<WeeklyRoast | null> {
  const { data, error } = await supabase
    .from("weekly_roasts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`Failed to get latest roast: ${error.message}`);
  if (!data) return null;
  return toWeeklyRoast(data as DbWeeklyRoast);
}

export async function deleteLog(
  supabase: SupabaseClient,
  logId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from("food_logs")
    .delete()
    .eq("id", logId)
    .eq("user_id", userId);
  if (error) throw new Error(`Failed to delete log: ${error.message}`);
}
