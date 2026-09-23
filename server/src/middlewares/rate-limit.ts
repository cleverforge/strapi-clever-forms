type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
let lastSweep = 0;

function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export default (config: { windowMs?: number; max?: number } = {}) => {
  const windowMs = Math.max(10_000, Math.min(3_600_000, Number(config.windowMs ?? 60_000)));
  const max = Math.max(1, Math.min(1_000, Number(config.max ?? 30)));

  return async (ctx: any, next: () => Promise<void>) => {
    const now = Date.now();
    sweep(now);

    const slug = String(ctx.params?.slug ?? 'unknown');
    const ip = String(ctx.ip ?? ctx.request?.ip ?? 'unknown');
    const key = `${slug}:${ip}`;

    let bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + windowMs };
      buckets.set(key, bucket);
    }

    bucket.count += 1;
    const remaining = Math.max(0, max - bucket.count);

    ctx.set('X-RateLimit-Limit', String(max));
    ctx.set('X-RateLimit-Remaining', String(remaining));
    ctx.set('X-RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));

    if (bucket.count > max) {
      ctx.set('Retry-After', String(Math.max(1, Math.ceil((bucket.resetAt - now) / 1000))));
      ctx.status = 429;
      ctx.body = { error: { status: 429, name: 'TooManyRequestsError', message: 'Too many submissions. Please try again later.' } };
      return;
    }

    await next();
  };
};
