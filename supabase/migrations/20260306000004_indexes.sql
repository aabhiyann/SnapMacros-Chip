-- Suppress transaction block for CONCURRENTLY by not wrapping this file in a transaction in a real deploy
-- Or we just create them directly 
COMMIT;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_logs_user_date ON logs (user_id, date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_daily_summaries_user_date ON daily_summaries (user_id, date);

BEGIN;
