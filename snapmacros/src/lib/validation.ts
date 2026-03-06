import { z } from "zod";
import type { MealType, Confidence } from "./types";

const MacroSetSchema = z.object({
  calories: z.number().min(0),
  protein: z.number().min(0),
  carbs: z.number().min(0),
  fat: z.number().min(0),
});

export const FoodLogSchema = z.object({
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack", "other"] as const satisfies readonly MealType[]),
  imageUrl: z.string().url().nullable(),
  description: z.string().min(1).max(500),
  macros: MacroSetSchema,
  confidence: z.enum(["low", "medium", "high"] as const satisfies readonly Confidence[]),
  loggedAt: z.string().datetime(),
});

export const ProfileUpdateSchema = z.object({
  weightKg: z.number().min(20).max(300).optional(),
  heightCm: z.number().min(100).max(250).optional(),
  age: z.number().min(13).max(120).optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very_active"]).optional(),
  goalType: z.enum(["bulk", "lean_bulk", "maintain", "fat_loss", "cut"]).optional(),
});

export type FoodLogInput = z.infer<typeof FoodLogSchema>;
export type ProfileUpdateInput = z.infer<typeof ProfileUpdateSchema>;
