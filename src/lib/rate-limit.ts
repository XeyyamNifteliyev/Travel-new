type RateLimitEntry = { count: number; resetAt: number };

const store = new Map<string, RateLimitEntry>();

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}, 60_000);

export function checkRateLimit(ip: string, action: string, limit: number, windowMs: number): { allowed: boolean; remaining: number; resetAt: number } {
  const key = `${ip}:${action}`;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
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