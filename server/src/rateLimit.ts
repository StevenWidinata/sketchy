interface Bucket {
  tokens: number;
  updated: number;
}

/** Token bucket per key. `capacity` is the burst size, `perSecond` the refill rate. */
export class RateLimiter {
  private buckets = new Map<string, Bucket>();

  constructor(private limits: Record<string, { capacity: number; perSecond: number }>) {}

  take(key: string, cost = 1): boolean {
    const limit = this.limits[key];
    if (!limit) return true;
    const now = Date.now();
    const b = this.buckets.get(key) ?? { tokens: limit.capacity, updated: now };
    b.tokens = Math.min(limit.capacity, b.tokens + ((now - b.updated) / 1000) * limit.perSecond);
    b.updated = now;
    if (b.tokens < cost) {
      this.buckets.set(key, b);
      return false;
    }
    b.tokens -= cost;
    this.buckets.set(key, b);
    return true;
  }
}

export const SOCKET_LIMITS = {
  join: { capacity: 5, perSecond: 0.2 },
  chat: { capacity: 6, perSecond: 1.5 },
  draw: { capacity: 200, perSecond: 90 },
  settings: { capacity: 20, perSecond: 5 },
  control: { capacity: 10, perSecond: 2 },
};
