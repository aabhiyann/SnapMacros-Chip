-- SnapMacros initial schema
-- Tables: profiles, food_logs, daily_summaries, weekly_roasts

-- Enum-like CHECK constraints
-- Goal: bulk | lean_bulk | maintain | fat_loss | cut
-- Activity: sedentary | light | moderate | active | very_active
-- Meal: breakfast | lunch | dinner | snack | other
-- Confidence: low | medium | high
-- Gender: male | female | other

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  weight_kg NUMERIC(5,2) NOT NULL CHECK (weight_kg >= 20 AND weight_kg <= 300),
  height_cm NUMERIC(5,2) NOT NULL CHECK (height_cm >= 100 AND height_cm <= 250),
  age INTEGER NOT NULL CHECK (age >= 13 AND age <= 120),
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  activity_level TEXT NOT NULL CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  goal_type TEXT NOT NULL CHECK (goal_type IN ('bulk', 'lean_bulk', 'maintain', 'fat_loss', 'cut')),
  bmr NUMERIC(8,2) NOT NULL CHECK (bmr >= 0),
  tdee NUMERIC(8,2) NOT NULL CHECK (tdee >= 0),
  calorie_target INTEGER NOT NULL CHECK (calorie_target >= 0),
  macro_target JSONB NOT NULL CHECK (
    jsonb_typeof(macro_target) = 'object' AND
    (macro_target->>'calories') IS NOT NULL AND
    (macro_target->>'protein') IS NOT NULL AND
    (macro_target->>'carbs') IS NOT NULL AND
    (macro_target->>'fat') IS NOT NULL
  )
);

CREATE TABLE IF NOT EXISTS food_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack', 'other')),
  image_url TEXT,
  description TEXT NOT NULL CHECK (char_length(description) >= 1 AND char_length(description) <= 500),
  macros JSONB NOT NULL CHECK (
    jsonb_typeof(macros) = 'object' AND
    (macros->>'calories') IS NOT NULL AND
    (macros->>'protein') IS NOT NULL AND
    (macros->>'carbs') IS NOT NULL AND
    (macros->>'fat') IS NOT NULL
  ),
  confidence TEXT NOT NULL CHECK (confidence IN ('low', 'medium', 'high')),
  logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS daily_summaries (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_calories NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (total_calories >= 0),
  total_protein NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (total_protein >= 0),
  total_carbs NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (total_carbs >= 0),
  total_fat NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (total_fat >= 0),
  meal_count INTEGER NOT NULL DEFAULT 0 CHECK (meal_count >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, date)
);

CREATE TABLE IF NOT EXISTS weekly_roasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  roast_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
