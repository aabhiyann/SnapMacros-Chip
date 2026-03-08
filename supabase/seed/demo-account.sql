-- Replace this with the actual UUID from Supabase Auth dashboard
-- \set demo_user_id 'REPLACE-WITH-ACTUAL-UUID'
-- NOTE FOR MANUAL EXECUTION in Dashboard: Replace :'demo_user_id' with your actual UUID string in single quotes

-- 1. Create Profile
INSERT INTO public.profiles (id, "name", email, goal, age, weight_kg, height_cm, gender, activity, onboarding_completed, bmr, tdee, cal_target, protein_g, carbs_g, fat_g, streak_days)
VALUES (
  :'demo_user_id',
  'Alex',
  'demo@snapmacros.app',
  'lean_bulk',
  26,
  78,
  180,
  'male',
  'moderate',
  true,
  1834,
  2842,
  3126,
  171,
  390,
  97,
  5
) ON CONFLICT (id) DO UPDATE SET
  "name" = EXCLUDED."name",
  goal = EXCLUDED.goal,
  onboarding_completed = EXCLUDED.onboarding_completed;

-- 2. Create Food Logs and Summaries (Last 7 Days)
DO $$
DECLARE
  uid uuid := :'demo_user_id';
  today date := CURRENT_DATE;
BEGIN
  -- Clear existing data for demo user
  DELETE FROM public.food_logs WHERE user_id = uid;
  DELETE FROM public.daily_summaries WHERE user_id = uid;
  DELETE FROM public.weekly_roasts WHERE user_id = uid;

  -- Monday
  INSERT INTO public.food_logs (user_id, image_url, food_name, calories, protein, carbs, fat, logged_at) VALUES 
  (uid, null, 'Avocado toast', 380, 10, 45, 18, (today - interval '6 days' + interval '9 hours')::timestamp),
  (uid, null, 'Chicken Caesar salad', 450, 40, 15, 25, (today - interval '6 days' + interval '13 hours')::timestamp),
  (uid, null, 'Salmon bowl', 620, 35, 65, 20, (today - interval '6 days' + interval '19 hours')::timestamp);
  
  -- Tuesday
  INSERT INTO public.food_logs (user_id, image_url, food_name, calories, protein, carbs, fat, logged_at) VALUES 
  (uid, null, 'Greek yogurt parfait', 280, 20, 35, 5, (today - interval '5 days' + interval '8 hours')::timestamp),
  (uid, null, 'Big Mac meal', 1100, 30, 120, 50, (today - interval '5 days' + interval '14 hours')::timestamp),
  (uid, null, 'Protein shake', 220, 30, 10, 3, (today - interval '5 days' + interval '17 hours')::timestamp);

  -- Wednesday
  INSERT INTO public.food_logs (user_id, image_url, food_name, calories, protein, carbs, fat, logged_at) VALUES 
  (uid, null, 'Oatmeal', 340, 10, 60, 5, (today - interval '4 days' + interval '8 hours')::timestamp),
  (uid, null, 'Grilled chicken rice bowl', 580, 45, 75, 10, (today - interval '4 days' + interval '13 hours')::timestamp),
  (uid, null, 'Apple', 95, 0, 25, 0, (today - interval '4 days' + interval '16 hours')::timestamp);
  
  -- Thursday
  INSERT INTO public.food_logs (user_id, image_url, food_name, calories, protein, carbs, fat, logged_at) VALUES 
  (uid, null, 'Smoothie bowl', 420, 15, 70, 8, (today - interval '3 days' + interval '9 hours')::timestamp),
  (uid, null, 'Chipotle burrito bowl', 850, 50, 95, 25, (today - interval '3 days' + interval '14 hours')::timestamp),
  (uid, null, 'Protein shake', 220, 30, 10, 3, (today - interval '3 days' + interval '18 hours')::timestamp);

  -- Friday
  INSERT INTO public.food_logs (user_id, image_url, food_name, calories, protein, carbs, fat, logged_at) VALUES 
  (uid, null, 'Scrambled eggs toast', 380, 20, 35, 15, (today - interval '2 days' + interval '9 hours')::timestamp),
  (uid, null, 'Grilled sushi platter', 680, 40, 85, 15, (today - interval '2 days' + interval '19 hours')::timestamp);

  -- Saturday
  INSERT INTO public.food_logs (user_id, image_url, food_name, calories, protein, carbs, fat, logged_at) VALUES 
  (uid, null, 'Pancakes', 560, 12, 90, 15, (today - interval '1 day' + interval '10 hours')::timestamp),
  (uid, null, 'Chicken wings', 840, 45, 10, 60, (today - interval '1 day' + interval '15 hours')::timestamp),
  (uid, null, 'Side salad', 180, 5, 20, 8, (today - interval '1 day' + interval '19 hours')::timestamp);

  -- Sunday (Today)
  INSERT INTO public.food_logs (user_id, image_url, food_name, calories, protein, carbs, fat, logged_at) VALUES 
  (uid, null, 'Protein shake', 220, 30, 10, 3, (today + interval '8 hours')::timestamp),
  (uid, null, 'Oatmeal', 340, 10, 60, 5, (today + interval '10 hours')::timestamp);

  -- Generate Daily Summaries
  INSERT INTO public.daily_summaries (user_id, date, total_calories, total_protein, total_carbs, total_fat)
  SELECT 
    user_id, 
    DATE(logged_at), 
    SUM(calories), 
    SUM(protein), 
    SUM(carbs), 
    SUM(fat)
  FROM public.food_logs
  WHERE user_id = uid
  GROUP BY user_id, DATE(logged_at);

  -- Create Roast
  INSERT INTO public.weekly_roasts (user_id, week_start_date, roast_title, roast_text, tip_text)
  VALUES (
    uid,
    today - interval '6 days',
    'The Big Mac Chronicles',
    'Five days logged this week. Solid effort. But let''s talk about Tuesday. That Big Mac meal was 1,100 calories and you followed it with a protein shake like that cancels things out. It doesn''t. What DOES count: Wednesday was legitimately impressive — grilled chicken, rice, apple, right on target. You clearly know what good eating looks like. You also clearly know what a Big Mac looks like. Four out of seven days on target is real progress. The goal isn''t perfection, it''s consistency. You''re trending the right way.',
    'Next week, try logging your meals before you eat them — studies show this one habit reduces overeating by 20%.'
  );

END $$;
