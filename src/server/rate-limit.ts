/**
 * Rate limiter in-memory: cukup untuk satu instance dev/VPS.
 * Kalau nanti jalan multi-instance, ganti isinya dengan Redis (INCR + EXPIRE)
 * — Redis sudah masuk stack di modul 3.
 */
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export type RateLimitResult = { allowed: boolean; remaining: number; retryAfterSec: number };

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterSec: 0 };
  }

  bucket.count += 1;
  const remaining = Math.max(0, limit - bucket.count);

  if (bucket.count > limit) {
    return { allowed: false, remaining: 0, retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  return { allowed: true, remaining, retryAfterSec: 0 };
}

// Bersihkan bucket kedaluwarsa sesekali supaya Map tidak tumbuh selamanya.
if (typeof setInterval === 'function') {
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) if (bucket.resetAt <= now) buckets.delete(key);
  }, 60_000);
  timer.unref?.();
}
