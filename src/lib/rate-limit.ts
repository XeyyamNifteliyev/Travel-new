import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

type RateLimitEntry = { count: number; resetAt: number };

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

let redisLimiter: Ratelimit | null = null;

function getRedisLimiter(): Ratelimit | null {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return null;
  if (redisLimiter) return redisLimiter;

  const redis = new Redis({ url: UPSTASH_URL, token: UPSTASH_TOKEN });
  redisLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(1, '1 s'),
  });
  return redisLimiter;
}

const memoryStore = new Map<string, RateLimitEntry>();

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of memoryStore) {
    if (now > entry.resetAt) memoryStore.delete(key);
  }
}, 60_000);

export async function checkRateLimit(ip: string, action: string, limit: number, windowMs: number): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const limiter = getRedisLimiter();

  if (limiter) {
    try {
      const key = `${ip}:${action}`;
      const { success, remaining } = await limiter.limit(key, { rate: 1 });
      return {
        allowed: success,
        remaining,
        resetAt: Date.now() + windowMs,
      };
    } catch {
      // Redis error fallback to memory
    }
  }

  return memoryRateLimit(ip, action, limit, windowMs);
}

function memoryRateLimit(ip: string, action: string, limit: number, windowMs: number): { allowed: boolean; remaining: number; resetAt: number } {
  const key = `${ip}:${action}`;
  const now = Date.now();
  const entry = memoryStore.get(key);

  if (!entry || now > entry.resetAt) {
    const resetAt = now + windowMs;
    memoryStore.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}

export function getIpFromHeaders(request: Request): string {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) {
    const ips = xff.split(',').map(s => s.trim());
    if (ips[0]) return ips[0];
  }
  return request.headers.get('x-real-ip') || 'unknown';
}

export function rateLimitResponse(remaining: number, resetAt: number) {
  return {
    headers: {
      'X-RateLimit-Remaining': String(remaining),
      'X-RateLimit-Reset': String(Math.ceil(resetAt / 1000)),
    },
  };
}