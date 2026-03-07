// Simple in-memory rate limiter
const rateLimits = new Map<string, { count: number; resetTime: number }>();

export function getRateLimit(userId: string, limitPerHour: number) {
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
