/**
 * Distributed Rate Limiter using Supabase
 *
 * Uses a `rate_limits` table enforced via a Supabase RPC function
 * to provide rate limiting that works across serverless invocations.
 *
 * The underlying SQL implementation uses advisory locks to prevent
 * race conditions between concurrent requests.
 *
 * Replaces the in-memory Map-based rate limiter (refs #63).
 */

import { createClient } from '@/lib/supabase/server';

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 requests per minute

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check and increment rate limit for a user using Supabase.
 *
 * Uses an atomic RPC function to safely handle concurrent requests.
 * Falls back to allowing the request if the rate limit check itself fails
 * (fail-open to avoid blocking users due to infra issues).
 */
export async function checkRateLimit(userId: string): Promise<RateLimitResult> {
  try {
    const supabase = await createClient();
    const now = Date.now();

    // The RPC uses auth.uid() internally — no caller-supplied params needed.
    // userId is kept in the signature for logging/fallback only.
    const { data, error } = await supabase.rpc('check_rate_limit');

    if (error) {
      console.warn('[Rate Limit] Supabase RPC error, falling back to allow:', error.message);
      return { allowed: true, remaining: RATE_LIMIT_MAX - 1, resetAt: now + RATE_LIMIT_WINDOW_MS };
    }

    const result = data as { allowed: boolean; request_count: number; oldest_request_at?: string } | null;
    if (!result) {
      return { allowed: true, remaining: RATE_LIMIT_MAX - 1, resetAt: now + RATE_LIMIT_WINDOW_MS };
    }

    // Compute accurate resetAt based on when the oldest request in the window expires
    let resetAt = now + RATE_LIMIT_WINDOW_MS;
    if (result.oldest_request_at) {
      const oldestTime = new Date(result.oldest_request_at).getTime();
      if (!Number.isNaN(oldestTime)) {
        resetAt = oldestTime + RATE_LIMIT_WINDOW_MS;
      }
    }

    return {
      allowed: result.allowed,
      remaining: Math.max(0, RATE_LIMIT_MAX - result.request_count),
      resetAt,
    };
  } catch (err) {
    // Fail open — don't block users if rate limit infra is down
    console.warn('[Rate Limit] Unexpected error, falling back to allow:', err);
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1, resetAt: Date.now() + RATE_LIMIT_WINDOW_MS };
  }
}

export { RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS };

