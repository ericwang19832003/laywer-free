import { describe, it, expect } from 'vitest'
import {
  generateShareToken,
  shareExpiresAt,
  SHARE_TOKEN_BYTES,
  SHARE_TTL_MS,
} from '@/lib/share-token'

describe('generateShareToken', () => {
  it('returns a base64url string of expected length', () => {
    const token = generateShareToken()
    // 32 bytes -> 43 base64url chars (no padding)
    const expectedLength = Math.ceil((SHARE_TOKEN_BYTES * 4) / 3)
    expect(token).toHaveLength(expectedLength)
  })

  it('contains only base64url-safe characters', () => {
    const token = generateShareToken()
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/)
  })

  it('generates unique tokens on successive calls', () => {
    const tokens = new Set(Array.from({ length: 20 }, () => generateShareToken()))
    expect(tokens.size).toBe(20)
  })

  it('is not a valid UUID format', () => {
    const token = generateShareToken()
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    expect(token).not.toMatch(uuidRegex)
  })
})

describe('shareExpiresAt', () => {
  it('returns a valid ISO-8601 string', () => {
    const expires = shareExpiresAt()
    expect(new Date(expires).toISOString()).toBe(expires)
  })

  it('is approximately 30 days in the future', () => {
    const now = Date.now()
    const expires = new Date(shareExpiresAt()).getTime()
    const diff = expires - now
    // Allow 5 seconds of tolerance for test execution time
    expect(diff).toBeGreaterThan(SHARE_TTL_MS - 5000)
    expect(diff).toBeLessThan(SHARE_TTL_MS + 5000)
  })
})
