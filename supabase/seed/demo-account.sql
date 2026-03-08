-- Demo account seed for SnapMacros
-- INSTRUCTIONS: Ensure demo@snapmacros.app exists in Supabase Auth (create via Dashboard or signup flow).
-- Run this in Supabase SQL Editor. It will find the demo user by email and seed their data.

DO $$
DECLARE
  uid uuid := (SELECT id FROM auth.users WHERE email = 'demo@snapmacros.app' LIMIT 1);
  today date := CURRENT_DATE;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Demo user demo@snapmacros.app not found in auth.users. Create the user first via Supabase Auth.';
  END IF;

  -- 1. Update profile: set onboarding_completed and targets (profiles links to auth via user_id)
  UPDATE public.profiles
  SET
    name = 'Alex',
    onboarding_completed = true,
    target_calories = 2500,
    target_protein = 150,
    target_carbs = 300,
    target_fat = 80,
    streak_days = 5,
    updated_at = now()
  WHERE user_id = uid;

  -- 2. Clear existing demo data
  DELETE FROM public.logs WHERE user_id = uid;
  DELETE FROM public.daily_summaries WHERE user_id = uid;
  DELETE FROM public.weekly_roasts WHERE user_id = uid;

  -- 3. Insert logs (logs table: user_id, meal_name, calories, protein, carbs, fat, date)
  -- Monday
  INSERT INTO public.logs (user_id, meal_name, calories, protein, carbs, fat, date) VALUES
  (uid, 'Avocado toast', 380, 10, 45, 18, today - 6),
  (uid, 'Chicken Caesar salad', 450, 40, 15, 25, today - 6),
  (uid, 'Salmon bowl', 620, 35, 65, 20, today - 6);

  -- Tuesday
  INSERT INTO public.logs (user_id, meal_name, calories, protein, carbs, fat, date) VALUES
  (uid, 'Greek yogurt parfait', 280, 20, 35, 5, today - 5),
  (uid, 'Big Mac meal', 1100, 30, 120, 50, today - 5),
  (uid, 'Protein shake', 220, 30, 10, 3, today - 5);

  -- Wednesday
  INSERT INTO public.logs (user_id, meal_name, calories, protein, carbs, fat, date) VALUES
  (uid, 'Oatmeal', 340, 10, 60, 5, today - 4),
  (uid, 'Grilled chicken rice bowl', 580, 45, 75, 10, today - 4),
  (uid, 'Apple', 95, 0, 25, 0, today - 4);

  -- Thursday
  INSERT INTO public.logs (user_id, meal_name, calories, protein, carbs, fat, date) VALUES
  (uid, 'Smoothie bowl', 420, 15, 70, 8, today - 3),
  (uid, 'Chipotle burrito bowl', 850, 50, 95, 25, today - 3),
  (uid, 'Protein shake', 220, 30, 10, 3, today - 3);

  -- Friday
  INSERT INTO public.logs (user_id, meal_name, calories, protein, carbs, fat, date) VALUES
  (uid, 'Scrambled eggs toast', 380, 20, 35, 15, today - 2),
  (uid, 'Grilled sushi platter', 680, 40, 85, 15, today - 2);

  -- Saturday
  INSERT INTO public.logs (user_id, meal_name, calories, protein, carbs, fat, date) VALUES
  (uid, 'Pancakes', 560, 12, 90, 15, today - 1),
  (uid, 'Chicken wings', 840, 45, 10, 60, today - 1),
  (uid, 'Side salad', 180, 5, 20, 8, today - 1);

  -- Sunday (Today)
  INSERT INTO public.logs (user_id, meal_name, calories, protein, carbs, fat, date) VALUES
  (uid, 'Protein shake', 220, 30, 10, 3, today),
  (uid, 'Oatmeal', 340, 10, 60, 5, today);

  -- 4. daily_summaries are auto-updated by trigger on logs insert

  -- 5. Insert weekly roast
  INSERT INTO public.weekly_roasts (user_id, week_start, roast_title, roast_text, tip_text, mascot_mood)
  VALUES (
    uid,
    today - 6,
    'The Big Mac Chronicles',
    'Five days logged this week. Solid effort. But let''s talk about Tuesday. That Big Mac meal was 1,100 calories and you followed it with a protein shake like that cancels things out. It doesn''t. What DOES count: Wednesday was legitimately impressive — grilled chicken, rice, apple, right on target. You clearly know what good eating looks like. You also clearly know what a Big Mac looks like. Four out of seven days on target is real progress. The goal isn''t perfection, it''s consistency. You''re trending the right way.',
    'Next week, try logging your meals before you eat them — studies show this one habit reduces overeating by 20%.',
    'laughing'
  );

END $$;
