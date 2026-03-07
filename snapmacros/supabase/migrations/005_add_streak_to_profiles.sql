-- Add streak and last log date to profiles for log route
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS last_log_date DATE,
  ADD COLUMN IF NOT EXISTS streak_days INTEGER NOT NULL DEFAULT 0 CHECK (streak_days >= 0),
  ADD COLUMN IF NOT EXISTS longest_streak INTEGER NOT NULL DEFAULT 0 CHECK (longest_streak >= 0);
