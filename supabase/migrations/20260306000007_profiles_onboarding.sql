-- Add columns required for onboarding and profile API (name, targets, onboarding_completed)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS target_calories INTEGER,
  ADD COLUMN IF NOT EXISTS target_protein INTEGER,
  ADD COLUMN IF NOT EXISTS target_carbs INTEGER,
  ADD COLUMN IF NOT EXISTS target_fat INTEGER,
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT false;
