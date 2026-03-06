-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_roasts ENABLE ROW LEVEL SECURITY;

-- Policy: users can only access their own profile
CREATE POLICY "own_profile" ON profiles
  FOR ALL
  USING (auth.uid() = id);

-- Policy: users can only access their own food logs
CREATE POLICY "own_food_logs" ON food_logs
  FOR ALL
  USING (auth.uid() = user_id);

-- Policy: users can only access their own daily summaries
CREATE POLICY "own_summaries" ON daily_summaries
  FOR ALL
  USING (auth.uid() = user_id);

-- Policy: users can only access their own weekly roasts
CREATE POLICY "own_roasts" ON weekly_roasts
  FOR ALL
  USING (auth.uid() = user_id);
