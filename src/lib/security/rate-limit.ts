import { NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'

interface RateLimitEntry {
  timestamps: number[]
}

const store = new Map<string, RateLimitEntry>()

// Cleanup expired entries every 5 minutes
let lastCleanup = Date.now()
const CLEANUP_INTERVAL = 5 * 60 * 1000

// Use the maximum configured window for cleanup so we never prune entries
// that longer-window tiers still need
const MAX_WINDOW_MS = Math.max(
  60 * 60 * 1000,  // 1 hour (AI + email tiers)
  60 * 1000,       // 1 min (standard tier)
)

function cleanup() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return
  lastCleanup = now
  const cutoff = now - MAX_WINDOW_MS
  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff)
    if (entry.timestamps.length === 0) store.delete(key)
  }
}

export function checkRateLimit(
  userId: string,
  endpoint: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; retryAfterMs: number } {
  cleanup()
  const key = `${userId}:${endpoint}`
  const now = Date.now()
  const cutoff = now - windowMs

  const entry = store.get(key) ?? { timestamps: [] }
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff)

  if (entry.timestamps.length >= maxRequests) {
    const oldest = entry.timestamps[0]
    const retryAfterMs = oldest + windowMs - now
    return { allowed: false, retryAfterMs: Math.max(retryAfterMs, 1000) }
  }

  entry.timestamps.push(now)
  store.set(key, entry)
  return { allowed: true, retryAfterMs: 0 }
}

export function rateLimitResponse(retryAfterMs: number): NextResponse {
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    {
      status: 429,
      headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) },
    }
  )
}

// Pre-configured rate limit tiers
export const RATE_LIMITS = {
  ai: { maxRequests: 10, windowMs: 60 * 60 * 1000, distributed: true },      // 10/hour
  email: { maxRequests: 5, windowMs: 60 * 60 * 1000, distributed: true },     // 5/hour
  standard: { maxRequests: 60, windowMs: 60 * 1000, distributed: false },     // 60/min
} as const

/**
 * Distributed rate limiting backed by Supabase `rate_limits` table.
 * Uses the `increment_rate_limit` RPC for atomic check-and-increment.
 * Falls back to in-memory `checkRateLimit` if the DB call fails.
 */
export async function checkDistributedRateLimit(
  supabase: SupabaseClient,
  userId: string,
  endpoint: string,
  maxRequests: number,
  windowMs: number
): Promise<{ allowed: boolean; retryAfterMs: number }> {
  try {
    const windowStart = new Date(
      Math.floor(Date.now() / windowMs) * windowMs
    ).toISOString()

    // Atomic upsert + increment via RPC
    const { data: count, error } = await supabase.rpc('increment_rate_limit', {
      p_user_id: userId,
      p_endpoint: endpoint,
      p_window_start: windowStart,
    })

    if (error) throw error

    if (count > maxRequests) {
      const windowEnd = Math.floor(Date.now() / windowMs) * windowMs + windowMs
      const retryAfterMs = windowEnd - Date.now()
      return { allowed: false, retryAfterMs: Math.max(retryAfterMs, 1000) }
    }

    return { allowed: true, retryAfterMs: 0 }
  } catch {
    // Fallback to in-memory rate limiting on any DB failure
    return checkRateLimit(userId, endpoint, maxRequests, windowMs)
  }
}
