// In-memory rate limiter (development / single-instance fallback).
// In production, use the Supabase-backed increment_rate_limit() RPC
// (see supabase/migrations/20260325000008_rate_limits.sql) to survive cold starts.
const rateLimits = new Map<string, { count: number; resetTime: number }>();

export interface RateLimitResult {
    success: boolean;
    remaining: number;
    resetTime: number;
    resetInSecs: number;
}

export function getRateLimit(userId: string, limitPerHour: number): RateLimitResult {
    const now = Date.now();
    const windowMs = 60 * 60 * 1000;

    let record = rateLimits.get(userId);

    if (!record || now > record.resetTime) {
        record = { count: 0, resetTime: now + windowMs };
    }

    record.count += 1;
    rateLimits.set(userId, record);

    const remaining = Math.max(0, limitPerHour - record.count);
    const resetInSecs = Math.ceil((record.resetTime - now) / 1000);

    return {
        success: record.count <= limitPerHour,
        remaining,
        resetTime: record.resetTime,
        resetInSecs,
    };
}
