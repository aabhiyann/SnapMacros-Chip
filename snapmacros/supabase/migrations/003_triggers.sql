-- Trigger: auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_macro JSONB := '{"calories": 2000, "protein": 150, "carbs": 200, "fat": 67}'::jsonb;
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    weight_kg,
    height_cm,
    age,
    gender,
    activity_level,
    goal_type,
    bmr,
    tdee,
    calorie_target,
    macro_target
  ) VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    70,
    170,
    30,
    'other',
    'moderate',
    'maintain',
    1600,
    2480,
    2480,
    default_macro
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Trigger: auto-update daily_summaries when food_logs changes
CREATE OR REPLACE FUNCTION update_daily_summary()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_date DATE;
  v_totals RECORD;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_user_id := OLD.user_id;
    v_date := (OLD.logged_at AT TIME ZONE 'UTC')::DATE;
  ELSE
    v_user_id := NEW.user_id;
    v_date := (NEW.logged_at AT TIME ZONE 'UTC')::DATE;
  END IF;

  SELECT
    COALESCE(SUM((macros->>'calories')::NUMERIC), 0) AS total_calories,
    COALESCE(SUM((macros->>'protein')::NUMERIC), 0) AS total_protein,
    COALESCE(SUM((macros->>'carbs')::NUMERIC), 0) AS total_carbs,
    COALESCE(SUM((macros->>'fat')::NUMERIC), 0) AS total_fat,
    COUNT(*)::INTEGER AS meal_count
  INTO v_totals
  FROM food_logs
  WHERE user_id = v_user_id
    AND (logged_at AT TIME ZONE 'UTC')::DATE = v_date;

  INSERT INTO daily_summaries (user_id, date, total_calories, total_protein, total_carbs, total_fat, meal_count, updated_at)
  VALUES (v_user_id, v_date, v_totals.total_calories, v_totals.total_protein, v_totals.total_carbs, v_totals.total_fat, v_totals.meal_count, NOW())
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    total_calories = EXCLUDED.total_calories,
    total_protein = EXCLUDED.total_protein,
    total_carbs = EXCLUDED.total_carbs,
    total_fat = EXCLUDED.total_fat,
    meal_count = EXCLUDED.meal_count,
    updated_at = NOW();

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

CREATE TRIGGER on_food_log_insert
  AFTER INSERT ON food_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_summary();

CREATE TRIGGER on_food_log_update
  AFTER UPDATE OF user_id, logged_at, macros ON food_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_summary();

CREATE TRIGGER on_food_log_delete
  AFTER DELETE ON food_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_summary();
