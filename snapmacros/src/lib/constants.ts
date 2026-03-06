import type { ActivityLevel, GoalType, MealType } from "./types";

export const MACRO_COLORS = {
  calories: "#FF6B35",
  protein: "#6C63FF",
  carbs: "#2DD4BF",
  fat: "#FBBF24",
} as const;

export const GOAL_LABELS: Record<GoalType, string> = {
  bulk: "Bulk",
  lean_bulk: "Lean bulk",
  maintain: "Maintain",
  fat_loss: "Fat loss",
  cut: "Cut",
};

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: "Sedentary",
  light: "Light",
  moderate: "Moderate",
  active: "Active",
  very_active: "Very active",
};

/**
 * Infer meal type from current hour (rough). Used when user doesn't pick.
 */
export function getAutoMealType(): MealType {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 10) return "breakfast";
  if (hour >= 10 && hour < 14) return "lunch";
  if (hour >= 14 && hour < 17) return "snack";
  if (hour >= 17 && hour < 21) return "dinner";
  return "snack";
}
