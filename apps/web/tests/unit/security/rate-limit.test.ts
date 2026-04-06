import { describe, it, expect, beforeEach } from 'vitest'
import { checkRateLimit } from '@/lib/security/rate-limit'

describe('checkRateLimit', () => {
  let userId: string
  beforeEach(() => {
    userId = `user-${Math.random()}`
  })

  it('allows requests under the limit', () => {
    const result = checkRateLimit(userId, '/test', 3, 60000)
    expect(result.allowed).toBe(true)
  })

  it('blocks requests over the limit', () => {
    for (let i = 0; i < 3; i++) {
      checkRateLimit(userId, '/test', 3, 60000)
    }
    const result = checkRateLimit(userId, '/test', 3, 60000)
    expect(result.allowed).toBe(false)
    expect(result.retryAfterMs).toBeGreaterThan(0)
  })

  it('tracks endpoints separately', () => {
    for (let i = 0; i < 3; i++) {
      checkRateLimit(userId, '/a', 3, 60000)
    }
    const result = checkRateLimit(userId, '/b', 3, 60000)
    expect(result.allowed).toBe(true)
  })

  it('tracks users separately', () => {
    for (let i = 0; i < 3; i++) {
      checkRateLimit('alice', '/test', 3, 60000)
    }
    const result = checkRateLimit('bob', '/test', 3, 60000)
    expect(result.allowed).toBe(true)
  })

  it('allows requests after window expires', () => {
    for (let i = 0; i < 3; i++) {
      checkRateLimit(userId, '/expire', 3, 1)
    }
    const start = Date.now()
    while (Date.now() - start < 5) { /* busy wait */ }
    const result = checkRateLimit(userId, '/expire', 3, 1)
    expect(result.allowed).toBe(true)
  })

  it('returns retryAfterMs when blocked', () => {
    for (let i = 0; i < 2; i++) {
      checkRateLimit(userId, '/retry', 2, 60000)
    }
    const result = checkRateLimit(userId, '/retry', 2, 60000)
    expect(result.allowed).toBe(false)
    expect(result.retryAfterMs).toBeGreaterThanOrEqual(1000)
  })
})
