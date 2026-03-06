-- Demo account seed for SnapMacros
-- Prerequisite: Create a user in Supabase Auth with email 'demo@snapmacros.app'
-- and note the user id. Replace the placeholder below with that UUID, or run
-- this seed after creating the user and set DEMO_USER_ID accordingly.
-- For local dev: you can get the ID from Auth after signing up.

DO $$
DECLARE
  DEMO_USER_ID UUID := 'aaaaaaaa-bbbb-4ccc-dddd-eeeeeeeeeeee'; -- Replace with real auth user id
  default_macro JSONB := '{"calories": 2000, "protein": 150, "carbs": 200, "fat": 67}'::jsonb;
  log_id UUID;
  d DATE;
  week_start DATE;
BEGIN
  -- Ensure profile exists for demo user (trigger may have created it on signup)
  INSERT INTO public.profiles (
    id, email, weight_kg, height_cm, age, gender, activity_level, goal_type,
    bmr, tdee, calorie_target, macro_target
  ) VALUES (
    DEMO_USER_ID, 'demo@snapmacros.app', 70, 170, 30, 'other', 'moderate', 'maintain',
    1600, 2480, 2480, default_macro
  )
  ON CONFLICT (id) DO NOTHING;

  -- Monday
  d := CURRENT_DATE - INTERVAL '6 days';
  INSERT INTO public.food_logs (user_id, meal_type, description, macros, confidence, logged_at)
  VALUES (DEMO_USER_ID, 'breakfast', 'Avocado toast', '{"calories": 380, "protein": 10, "carbs": 38, "fat": 22}'::jsonb, 'high', (d + TIME '08:00')::timestamptz);
  INSERT INTO public.food_logs (user_id, meal_type, description, macros, confidence, logged_at)
  VALUES (DEMO_USER_ID, 'lunch', 'Chicken salad', '{"calories": 450, "protein": 42, "carbs": 18, "fat": 26}'::jsonb, 'high', (d + TIME '13:00')::timestamptz);
  INSERT INTO public.food_logs (user_id, meal_type, description, macros, confidence, logged_at)
  VALUES (DEMO_USER_ID, 'dinner', 'Salmon bowl', '{"calories": 620, "protein": 45, "carbs": 52, "fat": 22}'::jsonb, 'high', (d + TIME '19:00')::timestamptz);
  INSERT INTO public.food_logs (user_id, meal_type, description, macros, confidence, logged_at)
  VALUES (DEMO_USER_ID, 'snack', 'Protein bar', '{"calories": 220, "protein": 20, "carbs": 22, "fat": 8}'::jsonb, 'high', (d + TIME '15:30')::timestamptz);

  -- Tuesday
  d := CURRENT_DATE - INTERVAL '5 days';
  INSERT INTO public.food_logs (user_id, meal_type, description, macros, confidence, logged_at)
  VALUES (DEMO_USER_ID, 'breakfast', 'Greek yogurt parfait', '{"calories": 280, "protein": 14, "carbs": 38, "fat": 6}'::jsonb, 'high', (d + TIME '08:00')::timestamptz);
  INSERT INTO public.food_logs (user_id, meal_type, description, macros, confidence, logged_at)
  VALUES (DEMO_USER_ID, 'lunch', 'Big Mac meal', '{"calories": 1100, "protein": 42, "carbs": 98, "fat": 58}'::jsonb, 'high', (d + TIME '12:30')::timestamptz);
  INSERT INTO public.food_logs (user_id, meal_type, description, macros, confidence, logged_at)
  VALUES (DEMO_USER_ID, 'snack', 'Protein shake', '{"calories": 220, "protein": 30, "carbs": 8, "fat": 4}'::jsonb, 'high', (d + TIME '17:00')::timestamptz);

  -- Wednesday
  d := CURRENT_DATE - INTERVAL '4 days';
  INSERT INTO public.food_logs (user_id, meal_type, description, macros, confidence, logged_at)
  VALUES (DEMO_USER_ID, 'breakfast', 'Oatmeal', '{"calories": 340, "protein": 12, "carbs": 58, "fat": 6}'::jsonb, 'high', (d + TIME '07:30')::timestamptz);
  INSERT INTO public.food_logs (user_id, meal_type, description, macros, confidence, logged_at)
  VALUES (DEMO_USER_ID, 'lunch', 'Grilled chicken bowl', '{"calories": 580, "protein": 48, "carbs": 52, "fat": 18}'::jsonb, 'high', (d + TIME '13:00')::timestamptz);
  INSERT INTO public.food_logs (user_id, meal_type, description, macros, confidence, logged_at)
  VALUES (DEMO_USER_ID, 'snack', 'Apple', '{"calories": 95, "protein": 0, "carbs": 25, "fat": 0}'::jsonb, 'high', (d + TIME '16:00')::timestamptz);
  INSERT INTO public.food_logs (user_id, meal_type, description, macros, confidence, logged_at)
  VALUES (DEMO_USER_ID, 'dinner', 'Steak & veg', '{"calories": 680, "protein": 52, "carbs": 24, "fat": 42}'::jsonb, 'high', (d + TIME '19:30')::timestamptz);

  -- Thursday
  d := CURRENT_DATE - INTERVAL '3 days';
  INSERT INTO public.food_logs (user_id, meal_type, description, macros, confidence, logged_at)
  VALUES (DEMO_USER_ID, 'breakfast', 'Smoothie bowl', '{"calories": 420, "protein": 12, "carbs": 68, "fat": 12}'::jsonb, 'high', (d + TIME '08:00')::timestamptz);
  INSERT INTO public.food_logs (user_id, meal_type, description, macros, confidence, logged_at)
  VALUES (DEMO_USER_ID, 'lunch', 'Chipotle burrito bowl', '{"calories": 820, "protein": 48, "carbs": 88, "fat": 28}'::jsonb, 'high', (d + TIME '13:00')::timestamptz);
  INSERT INTO public.food_logs (user_id, meal_type, description, macros, confidence, logged_at)
  VALUES (DEMO_USER_ID, 'snack', 'Protein shake', '{"calories": 220, "protein": 30, "carbs": 8, "fat": 4}'::jsonb, 'high', (d + TIME '17:00')::timestamptz);

  -- Friday
  d := CURRENT_DATE - INTERVAL '2 days';
  INSERT INTO public.food_logs (user_id, meal_type, description, macros, confidence, logged_at)
  VALUES (DEMO_USER_ID, 'breakfast', 'Eggs & toast', '{"calories": 380, "protein": 18, "carbs": 32, "fat": 20}'::jsonb, 'high', (d + TIME '08:00')::timestamptz);
  INSERT INTO public.food_logs (user_id, meal_type, description, macros, confidence, logged_at)
  VALUES (DEMO_USER_ID, 'lunch', 'Sushi platter', '{"calories": 680, "protein": 32, "carbs": 88, "fat": 18}'::jsonb, 'high', (d + TIME '12:30')::timestamptz);
  INSERT INTO public.food_logs (user_id, meal_type, description, macros, confidence, logged_at)
  VALUES (DEMO_USER_ID, 'snack', 'Protein bar', '{"calories": 220, "protein": 20, "carbs": 22, "fat": 8}'::jsonb, 'high', (d + TIME '16:00')::timestamptz);

  -- Saturday
  d := CURRENT_DATE - INTERVAL '1 day';
  INSERT INTO public.food_logs (user_id, meal_type, description, macros, confidence, logged_at)
  VALUES (DEMO_USER_ID, 'breakfast', 'Pancakes', '{"calories": 560, "protein": 14, "carbs": 78, "fat": 20}'::jsonb, 'high', (d + TIME '09:00')::timestamptz);
  INSERT INTO public.food_logs (user_id, meal_type, description, macros, confidence, logged_at)
  VALUES (DEMO_USER_ID, 'lunch', 'Chicken wings', '{"calories": 840, "protein": 48, "carbs": 42, "fat": 52}'::jsonb, 'high', (d + TIME '13:00')::timestamptz);
  INSERT INTO public.food_logs (user_id, meal_type, description, macros, confidence, logged_at)
  VALUES (DEMO_USER_ID, 'dinner', 'Caesar salad', '{"calories": 480, "protein": 22, "carbs": 28, "fat": 32}'::jsonb, 'high', (d + TIME '19:00')::timestamptz);

  -- Sunday (roast day - light)
  d := CURRENT_DATE;
  INSERT INTO public.food_logs (user_id, meal_type, description, macros, confidence, logged_at)
  VALUES (DEMO_USER_ID, 'breakfast', 'Protein shake', '{"calories": 220, "protein": 30, "carbs": 8, "fat": 4}'::jsonb, 'high', (d + TIME '08:00')::timestamptz);
  INSERT INTO public.food_logs (user_id, meal_type, description, macros, confidence, logged_at)
  VALUES (DEMO_USER_ID, 'lunch', 'Oatmeal', '{"calories": 340, "protein": 12, "carbs": 58, "fat": 6}'::jsonb, 'high', (d + TIME '10:00')::timestamptz);

  -- Pre-generate one weekly roast for demo (week_start = Monday of current week)
  week_start := date_trunc('week', CURRENT_DATE)::date;
  IF week_start > CURRENT_DATE THEN
    week_start := week_start - INTERVAL '7 days';
  END IF;
  INSERT INTO public.weekly_roasts (user_id, week_start, roast_text)
  VALUES (
    DEMO_USER_ID,
    week_start,
    'Chip says: This week you went from Big Mac to salmon bowl real quick. Saturday wings were a vibe. Sunday you kept it light — respect. Overall: 7/10, would snack again.'
  );
END $$;
