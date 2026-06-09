import { describe, it, expect } from 'vitest'
import { discoveryCutoffDate, discoveryResponseDeadline } from '@lawyer-free/shared/rules/discovery-deadlines'

describe('discoveryResponseDeadline (+30 days)', () => {
  it('2026-01-01 + 30 → 2026-01-31', () => {
    const result = discoveryResponseDeadline(new Date('2026-01-01T00:00:00Z'))
    expect(result.toISOString().slice(0, 10)).toBe('2026-01-31')
  })

  it('month boundary: 2026-01-15 + 30 → 2026-02-14', () => {
    const result = discoveryResponseDeadline(new Date('2026-01-15T00:00:00Z'))
    expect(result.toISOString().slice(0, 10)).toBe('2026-02-14')
  })

  it('accepts ISO string input', () => {
    const result = discoveryResponseDeadline('2026-01-01T00:00:00Z')
    expect(result.toISOString().slice(0, 10)).toBe('2026-01-31')
  })

  it('does not mutate the input Date', () => {
    const input = new Date('2026-01-01T00:00:00Z')
    discoveryResponseDeadline(input)
    expect(input.toISOString().slice(0, 10)).toBe('2026-01-01')
  })
})

describe('discoveryCutoffDate (+180 days)', () => {
  it('2026-01-01 + 180 → 2026-06-30', () => {
    const result = discoveryCutoffDate(new Date('2026-01-01T00:00:00Z'))
    expect(result.toISOString().slice(0, 10)).toBe('2026-06-30')
  })

  it('leap year: 2024-01-01 + 180 → 2024-06-29', () => {
    const result = discoveryCutoffDate(new Date('2024-01-01T00:00:00Z'))
    expect(result.toISOString().slice(0, 10)).toBe('2024-06-29')
  })

  it('accepts ISO string input', () => {
    const result = discoveryCutoffDate('2026-01-01T00:00:00Z')
    expect(result.toISOString().slice(0, 10)).toBe('2026-06-30')
  })

  it('does not mutate the input Date', () => {
    const input = new Date('2026-01-01T00:00:00Z')
    discoveryCutoffDate(input)
    expect(input.toISOString().slice(0, 10)).toBe('2026-01-01')
  })
})
