/**
 * In-memory rate limiter. For production consider Redis or Upstash.
 */

const store = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 60;

export function rateLimit(key: string): { success: boolean; remaining: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { success: true, remaining: MAX_REQUESTS - 1 };
  }

  if (now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { success: true, remaining: MAX_REQUESTS - 1 };
  }

  entry.count += 1;
  const remaining = Math.max(0, MAX_REQUESTS - entry.count);
  return {
    success: entry.count <= MAX_REQUESTS,
    remaining,
  };
}

const analyzeStore = new Map<string, { count: number; resetAt: number }>();
const ANALYZE_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const ANALYZE_MAX = 30;

export function rateLimitAnalyze(key: string): { success: boolean; remaining: number; retryAfter: number } {
  const now = Date.now();
  const entry = analyzeStore.get(key);

  if (!entry) {
    analyzeStore.set(key, { count: 1, resetAt: now + ANALYZE_WINDOW_MS });
    return { success: true, remaining: ANALYZE_MAX - 1, retryAfter: ANALYZE_WINDOW_MS };
  }

  if (now > entry.resetAt) {
    analyzeStore.set(key, { count: 1, resetAt: now + ANALYZE_WINDOW_MS });
    return { success: true, remaining: ANALYZE_MAX - 1, retryAfter: ANALYZE_WINDOW_MS };
  }

  entry.count += 1;
  const remaining = Math.max(0, ANALYZE_MAX - entry.count);
  const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
  return {
    success: entry.count <= ANALYZE_MAX,
    remaining,
    retryAfter,
  };
}
