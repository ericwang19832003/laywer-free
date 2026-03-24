import { describe, it, expect, vi, beforeEach } from 'vitest'
import { checkDistributedRateLimit } from '@/lib/security/rate-limit'

function makeFailingSupabase() {
  return {
    rpc: vi.fn().mockRejectedValue(new Error('connection refused')),
  } as any
}

function makeSuccessSupabase(count: number) {
  return {
    rpc: vi.fn().mockResolvedValue({ data: count, error: null }),
  } as any
}

function makeRpcErrorSupabase(message: string) {
  return {
    rpc: vi.fn().mockResolvedValue({ data: null, error: new Error(message) }),
  } as any
}

describe('checkDistributedRateLimit fallback', () => {
  let userId: string

  beforeEach(() => {
    userId = `user-${Math.random()}`
    vi.restoreAllMocks()
  })

  it('returns allowed when Supabase succeeds and count is under limit', async () => {
    const supabase = makeSuccessSupabase(1)
    const result = await checkDistributedRateLimit(supabase, userId, '/ai', 10, 3600000)
    expect(result.allowed).toBe(true)
    expect(result.retryAfterMs).toBe(0)
  })

  it('returns blocked when Supabase count exceeds limit', async () => {
    const supabase = makeSuccessSupabase(11)
    const result = await checkDistributedRateLimit(supabase, userId, '/ai', 10, 3600000)
    expect(result.allowed).toBe(false)
    expect(result.retryAfterMs).toBeGreaterThan(0)
  })

  it('falls back to in-memory rate limiting when Supabase RPC throws', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const supabase = makeFailingSupabase()

    const result = await checkDistributedRateLimit(supabase, userId, '/ai', 10, 3600000)

    // Should allow (in-memory has no prior history for this random user)
    expect(result.allowed).toBe(true)
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('falling back to in-memory'),
      expect.any(String)
    )
  })

  it('falls back to in-memory rate limiting when Supabase returns an error', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const supabase = makeRpcErrorSupabase('relation "rate_limits" does not exist')

    const result = await checkDistributedRateLimit(supabase, userId, '/ai', 10, 3600000)

    expect(result.allowed).toBe(true)
    expect(warnSpy).toHaveBeenCalledOnce()
  })

  it('in-memory fallback still enforces rate limits', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const supabase = makeFailingSupabase()

    // Use the same userId for all calls so in-memory store accumulates
    const stableUserId = `stable-${Math.random()}`

    // Exhaust the limit (3 requests allowed)
    for (let i = 0; i < 3; i++) {
      const r = await checkDistributedRateLimit(supabase, stableUserId, '/fallback-test', 3, 60000)
      expect(r.allowed).toBe(true)
    }

    // 4th request should be blocked by in-memory fallback
    const blocked = await checkDistributedRateLimit(supabase, stableUserId, '/fallback-test', 3, 60000)
    expect(blocked.allowed).toBe(false)
    expect(blocked.retryAfterMs).toBeGreaterThanOrEqual(1000)

    // All 4 calls should have logged a fallback warning
    expect(warnSpy).toHaveBeenCalledTimes(4)
  })

  it('logs the error message when falling back', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const supabase = makeFailingSupabase()

    await checkDistributedRateLimit(supabase, userId, '/ai', 10, 3600000)

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('[rate-limit]'),
      'connection refused'
    )
  })
})
