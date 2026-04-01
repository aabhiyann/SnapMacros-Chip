-- Rate limits table for persistent, cold-start-safe rate limiting
CREATE TABLE IF NOT EXISTS rate_limits (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    key         TEXT NOT NULL,
    count       INTEGER NOT NULL DEFAULT 0,
    window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
    window_end   TIMESTAMPTZ NOT NULL,
    UNIQUE (user_id, key)
);

-- RLS: users can only see/modify their own rate limit records
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rate limits"
    ON rate_limits FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rate limits"
    ON rate_limits FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rate limits"
    ON rate_limits FOR UPDATE
    USING (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS rate_limits_user_key_idx ON rate_limits (user_id, key);

-- Auto-cleanup of expired windows (called by the rate limit function)
CREATE OR REPLACE FUNCTION increment_rate_limit(
    p_user_id UUID,
    p_key TEXT,
    p_limit INTEGER,
    p_window_seconds INTEGER
) RETURNS TABLE (
    success BOOLEAN,
    remaining INTEGER,
    reset_time TIMESTAMPTZ,
    reset_in_secs INTEGER
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_now TIMESTAMPTZ := now();
    v_window_end TIMESTAMPTZ := v_now + (p_window_seconds || ' seconds')::INTERVAL;
    v_count INTEGER;
    v_end TIMESTAMPTZ;
BEGIN
    -- Upsert: create or reset window if expired, then increment
    INSERT INTO rate_limits (user_id, key, count, window_start, window_end)
    VALUES (p_user_id, p_key, 1, v_now, v_window_end)
    ON CONFLICT (user_id, key) DO UPDATE
        SET count = CASE
                WHEN rate_limits.window_end < v_now THEN 1
                ELSE rate_limits.count + 1
            END,
            window_start = CASE
                WHEN rate_limits.window_end < v_now THEN v_now
                ELSE rate_limits.window_start
            END,
            window_end = CASE
                WHEN rate_limits.window_end < v_now THEN v_window_end
                ELSE rate_limits.window_end
            END
    RETURNING rate_limits.count, rate_limits.window_end
    INTO v_count, v_end;

    RETURN QUERY SELECT
        v_count <= p_limit,
        GREATEST(0, p_limit - v_count),
        v_end,
        GREATEST(0, EXTRACT(EPOCH FROM (v_end - v_now))::INTEGER);
END;
$$;
