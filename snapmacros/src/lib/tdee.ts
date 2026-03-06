import type { ActivityLevel, GoalType, MacroSet } from "./types";

/** Mifflin-St Jeor BMR formula (kcal/day) */
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: "male" | "female" | "other"
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === "male") return base + 5;
  if (gender === "female") return base - 161;
  return base - 78; // other: approximate midpoint
}

const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export function calculateTDEE(bmr: number, activity: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_FACTORS[activity]);
}

/** Goal calorie offset (add to TDEE): bulk +300, lean_bulk +150, maintain 0, fat_loss -300, cut -500 */
const GOAL_OFFSETS: Record<GoalType, number> = {
  bulk: 300,
  lean_bulk: 150,
  maintain: 0,
  fat_loss: -300,
  cut: -500,
};

export function getCalorieTarget(tdee: number, goal: GoalType): number {
  return Math.max(1200, tdee + GOAL_OFFSETS[goal]);
}

/** Macro split as percentage of calories: [protein, carbs, fat]. Protein/carbs = 4 cal/g, fat = 9 cal/g */
const MACRO_SPLITS: Record<GoalType, [number, number, number]> = {
  bulk: [0.3, 0.5, 0.2],
  lean_bulk: [0.35, 0.45, 0.2],
  maintain: [0.3, 0.4, 0.3],
  fat_loss: [0.4, 0.35, 0.25],
  cut: [0.45, 0.3, 0.25],
};

export function getMacroTargets(calories: number, goal: GoalType): MacroSet {
  const [pPct, cPct, fPct] = MACRO_SPLITS[goal];
  const protein = Math.round((calories * pPct) / 4);
  const carbs = Math.round((calories * cPct) / 4);
  const fat = Math.round((calories * fPct) / 9);
  return { calories, protein, carbs, fat };
}

export interface FullProfileInput {
  weightKg: number;
  heightCm: number;
  age: number;
  gender: "male" | "female" | "other";
  activityLevel: ActivityLevel;
  goalType: GoalType;
}

export interface FullProfileResult {
  bmr: number;
  tdee: number;
  calorieTarget: number;
  macroTarget: MacroSet;
}

export function calculateFullProfile(data: FullProfileInput): FullProfileResult {
  const bmr = calculateBMR(data.weightKg, data.heightCm, data.age, data.gender);
  const tdee = calculateTDEE(bmr, data.activityLevel);
  const calorieTarget = getCalorieTarget(tdee, data.goalType);
  const macroTarget = getMacroTargets(calorieTarget, data.goalType);
  return { bmr, tdee, calorieTarget, macroTarget };
}
