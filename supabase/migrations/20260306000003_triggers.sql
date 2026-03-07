CREATE OR REPLACE FUNCTION update_daily_summary()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO daily_summaries (user_id, date, total_calories, total_protein, total_carbs, total_fat)
    VALUES (NEW.user_id, NEW.date, NEW.calories, NEW.protein, NEW.carbs, NEW.fat)
    ON CONFLICT (user_id, date) DO UPDATE
    SET total_calories = daily_summaries.total_calories + EXCLUDED.total_calories,
        total_protein = daily_summaries.total_protein + EXCLUDED.total_protein,
        total_carbs = daily_summaries.total_carbs + EXCLUDED.total_carbs,
        total_fat = daily_summaries.total_fat + EXCLUDED.total_fat,
        updated_at = NOW();
    RETURN NEW;

  ELSIF TG_OP = 'DELETE' THEN
    UPDATE daily_summaries
    SET total_calories = daily_summaries.total_calories - OLD.calories,
        total_protein = daily_summaries.total_protein - OLD.protein,
        total_carbs = daily_summaries.total_carbs - OLD.carbs,
        total_fat = daily_summaries.total_fat - OLD.fat,
        updated_at = NOW()
    WHERE user_id = OLD.user_id AND date = OLD.date;
    RETURN OLD;

  ELSIF TG_OP = 'UPDATE' THEN
    -- Subtract OLD values
    UPDATE daily_summaries
    SET total_calories = daily_summaries.total_calories - OLD.calories,
        total_protein = daily_summaries.total_protein - OLD.protein,
        total_carbs = daily_summaries.total_carbs - OLD.carbs,
        total_fat = daily_summaries.total_fat - OLD.fat,
        updated_at = NOW()
    WHERE user_id = OLD.user_id AND date = OLD.date;
    
    -- Add NEW values
    INSERT INTO daily_summaries (user_id, date, total_calories, total_protein, total_carbs, total_fat)
    VALUES (NEW.user_id, NEW.date, NEW.calories, NEW.protein, NEW.carbs, NEW.fat)
    ON CONFLICT (user_id, date) DO UPDATE
    SET total_calories = daily_summaries.total_calories + EXCLUDED.total_calories,
        total_protein = daily_summaries.total_protein + EXCLUDED.total_protein,
        total_carbs = daily_summaries.total_carbs + EXCLUDED.total_carbs,
        total_fat = daily_summaries.total_fat + EXCLUDED.total_fat,
        updated_at = NOW();
    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_daily_summary
AFTER INSERT OR UPDATE OR DELETE ON logs
FOR EACH ROW EXECUTE FUNCTION update_daily_summary();
