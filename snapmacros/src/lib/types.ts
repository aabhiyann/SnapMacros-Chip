/**
 * SnapMacros shared types. Strict TypeScript — optional only when truly optional.
 */

export type GoalType =
  | "bulk"
  | "lean_bulk"
  | "maintain"
  | "fat_loss"
  | "cut";

export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";

export type MealType = "breakfast" | "lunch" | "dinner" | "snack" | "other";

export type Confidence = "low" | "medium" | "high";

export type ChipEmotion =
  | "happy"
  | "hype"
  | "shocked"
  | "laughing"
  | "sad"
  | "on_fire"
  | "thinking"
  | "sleepy";

export interface UserProfile {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  weightKg: number;
  heightCm: number;
  age: number;
  gender: "male" | "female" | "other";
  activityLevel: ActivityLevel;
  goalType: GoalType;
  bmr: number;
  tdee: number;
  calorieTarget: number;
  macroTarget: MacroSet;
}

export interface MacroSet {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface FoodLog {
  id: string;
  userId: string;
  mealType: MealType;
  imageUrl: string | null;
  description: string;
  macros: MacroSet;
  confidence: Confidence;
  loggedAt: string;
  createdAt: string;
}

export interface DailySummary {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  mealCount: number;
  logs: FoodLog[];
}

export interface WeeklyRoast {
  id: string;
  userId: string;
  weekStart: string;
  roastText: string;
  createdAt: string;
}

export interface ChipState {
  emotion: ChipEmotion;
  message: string | null;
}

export interface ChipContext {
  isAnalyzing?: boolean;
  isRoastTime?: boolean;
  streakDays?: number;
  singleMealCalories?: number;
  missedDays?: number;
  caloriesPercent?: number;
  hourOfDay?: number;
  todayLogsCount?: number;
}

export interface AnalysisResult {
  description: string;
  macros: MacroSet;
  confidence: Confidence;
  mealTypeSuggestion: MealType;
}

export interface DashboardData {
  profile: UserProfile;
  todaySummary: DailySummary | null;
  weekSummaries: DailySummary[];
  recentLogs: FoodLog[];
}

export interface OnboardingData {
  weightKg: number;
  heightCm: number;
  age: number;
  gender: "male" | "female" | "other";
  activityLevel: ActivityLevel;
  goalType: GoalType;
}
