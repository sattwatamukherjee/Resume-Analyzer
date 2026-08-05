import type { RequestHandler } from "express";

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

const WINDOW_MS = Number(process.env.ANALYSIS_RATE_LIMIT_WINDOW_MS ?? 60_000);
const MAX_REQUESTS = Number(process.env.ANALYSIS_RATE_LIMIT_MAX ?? 5);

export const analysisRateLimit: RequestHandler = (req, res, next) => {
  const userId = req.user?.id;

  if (!userId) {
    next();
    return;
  }

  const now = Date.now();
  const existing = buckets.get(userId);

  if (!existing || existing.resetAt <= now) {
    buckets.set(userId, { count: 1, resetAt: now + WINDOW_MS });
    next();
    return;
  }

  if (existing.count >= MAX_REQUESTS) {
    res.setHeader("Retry-After", Math.ceil((existing.resetAt - now) / 1000));
    res.status(429).json({
      error: "Too many resume analyses. Please try again shortly.",
    });
    return;
  }

  existing.count += 1;
  next();
};
