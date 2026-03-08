-- =============================================================================
-- SnapMacros: Run this in Supabase SQL Editor to create all required tables
-- Dashboard → SQL Editor → New query → paste this → Run
-- =============================================================================

-- 1. Base tables (logs, daily_summaries)
CREATE TABLE IF NOT EXISTS public.daily_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_calories INTEGER DEFAULT 0,
    total_protein INTEGER DEFAULT 0,
    total_carbs INTEGER DEFAULT 0,
    total_fat INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, date)
);

CREATE TABLE IF NOT EXISTS public.logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    meal_name TEXT NOT NULL,
    image_url TEXT,
    calories INTEGER NOT NULL DEFAULT 0,
    protein INTEGER NOT NULL DEFAULT 0,
    carbs INTEGER NOT NULL DEFAULT 0,
    fat INTEGER NOT NULL DEFAULT 0,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    streak_days INTEGER DEFAULT 1,
    longest_streak INTEGER DEFAULT 1,
    last_log_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile."
    ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile."
    ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile."
    ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Onboarding columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS target_calories INTEGER,
  ADD COLUMN IF NOT EXISTS target_protein INTEGER,
  ADD COLUMN IF NOT EXISTS target_carbs INTEGER,
  ADD COLUMN IF NOT EXISTS target_fat INTEGER,
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT false;

-- Trigger: create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles (user_id);

-- 3. RLS for logs and daily_summaries
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_summaries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own logs" ON public.logs;
CREATE POLICY "Users can view their own logs" ON public.logs FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their own logs" ON public.logs;
CREATE POLICY "Users can insert their own logs" ON public.logs FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own logs" ON public.logs;
CREATE POLICY "Users can update their own logs" ON public.logs FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their own logs" ON public.logs;
CREATE POLICY "Users can delete their own logs" ON public.logs FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own daily summaries" ON public.daily_summaries;
CREATE POLICY "Users can view their own daily summaries" ON public.daily_summaries FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own daily summaries" ON public.daily_summaries;
CREATE POLICY "Users can update their own daily summaries" ON public.daily_summaries FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their own daily summaries" ON public.daily_summaries;
CREATE POLICY "Users can insert their own daily summaries" ON public.daily_summaries FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their own daily summaries" ON public.daily_summaries;
CREATE POLICY "Users can delete their own daily summaries" ON public.daily_summaries FOR DELETE USING (auth.uid() = user_id);

-- 4. Trigger: update daily_summaries when logs change
CREATE OR REPLACE FUNCTION public.update_daily_summary()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.daily_summaries (user_id, date, total_calories, total_protein, total_carbs, total_fat)
    VALUES (NEW.user_id, NEW.date, NEW.calories, NEW.protein, NEW.carbs, NEW.fat)
    ON CONFLICT (user_id, date) DO UPDATE
    SET total_calories = public.daily_summaries.total_calories + EXCLUDED.total_calories,
        total_protein = public.daily_summaries.total_protein + EXCLUDED.total_protein,
        total_carbs = public.daily_summaries.total_carbs + EXCLUDED.total_carbs,
        total_fat = public.daily_summaries.total_fat + EXCLUDED.total_fat,
        updated_at = NOW();
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.daily_summaries
    SET total_calories = total_calories - OLD.calories,
        total_protein = total_protein - OLD.protein,
        total_carbs = total_carbs - OLD.carbs,
        total_fat = total_fat - OLD.fat,
        updated_at = NOW()
    WHERE user_id = OLD.user_id AND date = OLD.date;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.daily_summaries
    SET total_calories = total_calories - OLD.calories,
        total_protein = total_protein - OLD.protein,
        total_carbs = total_carbs - OLD.carbs,
        total_fat = total_fat - OLD.fat,
        updated_at = NOW()
    WHERE user_id = OLD.user_id AND date = OLD.date;
    INSERT INTO public.daily_summaries (user_id, date, total_calories, total_protein, total_carbs, total_fat)
    VALUES (NEW.user_id, NEW.date, NEW.calories, NEW.protein, NEW.carbs, NEW.fat)
    ON CONFLICT (user_id, date) DO UPDATE
    SET total_calories = public.daily_summaries.total_calories + EXCLUDED.total_calories,
        total_protein = public.daily_summaries.total_protein + EXCLUDED.total_protein,
        total_carbs = public.daily_summaries.total_carbs + EXCLUDED.total_carbs,
        total_fat = public.daily_summaries.total_fat + EXCLUDED.total_fat,
        updated_at = NOW();
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_update_daily_summary ON public.logs;
CREATE TRIGGER trigger_update_daily_summary
  AFTER INSERT OR UPDATE OR DELETE ON public.logs
  FOR EACH ROW EXECUTE PROCEDURE public.update_daily_summary();

-- 5. Weekly roasts table
CREATE TABLE IF NOT EXISTS public.weekly_roasts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    week_start DATE NOT NULL,
    roast_title TEXT NOT NULL,
    roast_text TEXT NOT NULL,
    tip_text TEXT NOT NULL,
    mascot_mood TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, week_start)
);

ALTER TABLE public.weekly_roasts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own roasts" ON public.weekly_roasts;
CREATE POLICY "Users can view their own roasts" ON public.weekly_roasts FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Service roles can insert/update roasts" ON public.weekly_roasts;
CREATE POLICY "Service roles can insert/update roasts" ON public.weekly_roasts FOR ALL USING (true) WITH CHECK (true);

-- Done
SELECT 'Schema setup complete. profiles, logs, daily_summaries, weekly_roasts are ready.' AS status;
