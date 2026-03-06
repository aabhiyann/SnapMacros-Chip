-- Indexes for common query patterns.
-- CONCURRENTLY avoids table lock; if your migration runner uses a transaction,
-- run these manually outside a transaction in production.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_food_logs_user_date
  ON food_logs (user_id, (logged_at::DATE) DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_daily_summaries_user_date
  ON daily_summaries (user_id, date DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_weekly_roasts_user_created
  ON weekly_roasts (user_id, created_at DESC);
