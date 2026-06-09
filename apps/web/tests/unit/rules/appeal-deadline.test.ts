import { describe, it, expect } from 'vitest'
import { appealDeadlineDays, calculateAppealDeadline } from '@lawyer-free/shared/rules/appeal-deadline'

describe('appealDeadlineDays — non-default states', () => {
  it('CA → 60', () => expect(appealDeadlineDays('CA')).toBe(60))
  it('MN → 60', () => expect(appealDeadlineDays('MN')).toBe(60))
  it('NJ → 45', () => expect(appealDeadlineDays('NJ')).toBe(45))
  it('WI → 45', () => expect(appealDeadlineDays('WI')).toBe(45))
  it('CO → 49', () => expect(appealDeadlineDays('CO')).toBe(49))
  it('AL → 42', () => expect(appealDeadlineDays('AL')).toBe(42))
  it('ID → 42', () => expect(appealDeadlineDays('ID')).toBe(42))
  it('MI → 21', () => expect(appealDeadlineDays('MI')).toBe(21))
  it('ME → 21', () => expect(appealDeadlineDays('ME')).toBe(21))
  it('CT → 20', () => expect(appealDeadlineDays('CT')).toBe(20))
  it('RI → 20', () => expect(appealDeadlineDays('RI')).toBe(20))
})

describe('appealDeadlineDays — 30-day default states', () => {
  it('TX → 30', () => expect(appealDeadlineDays('TX')).toBe(30))
  it('NY → 30', () => expect(appealDeadlineDays('NY')).toBe(30))
  it('FL → 30', () => expect(appealDeadlineDays('FL')).toBe(30))
  it('PA → 30', () => expect(appealDeadlineDays('PA')).toBe(30))
  it('IL → 30', () => expect(appealDeadlineDays('IL')).toBe(30))
  it('OH → 30', () => expect(appealDeadlineDays('OH')).toBe(30))
})

describe('appealDeadlineDays — case-insensitive + fallback', () => {
  it('lowercase ca → 60', () => expect(appealDeadlineDays('ca')).toBe(60))
  it('mixed case Ca → 60', () => expect(appealDeadlineDays('Ca')).toBe(60))
  it('unknown state ZZ → 30', () => expect(appealDeadlineDays('ZZ')).toBe(30))
  it('empty string → 30', () => expect(appealDeadlineDays('')).toBe(30))
})

describe('calculateAppealDeadline — date arithmetic', () => {
  it('TX (30d): 2026-01-01 → 2026-01-31', () => {
    const result = calculateAppealDeadline(new Date('2026-01-01T00:00:00Z'), 'TX')
    expect(result.toISOString().slice(0, 10)).toBe('2026-01-31')
  })

  it('CA (60d): 2026-01-01 → 2026-03-02', () => {
    const result = calculateAppealDeadline(new Date('2026-01-01T00:00:00Z'), 'CA')
    expect(result.toISOString().slice(0, 10)).toBe('2026-03-02')
  })

  it('MI (21d): 2026-01-01 → 2026-01-22', () => {
    const result = calculateAppealDeadline(new Date('2026-01-01T00:00:00Z'), 'MI')
    expect(result.toISOString().slice(0, 10)).toBe('2026-01-22')
  })

  it('month boundary: 2026-01-15 + TX(30) → 2026-02-14', () => {
    const result = calculateAppealDeadline(new Date('2026-01-15T00:00:00Z'), 'TX')
    expect(result.toISOString().slice(0, 10)).toBe('2026-02-14')
  })

  it('accepts ISO string input', () => {
    const result = calculateAppealDeadline('2026-01-01T00:00:00Z', 'TX')
    expect(result.toISOString().slice(0, 10)).toBe('2026-01-31')
  })

  it('does not mutate the input Date', () => {
    const input = new Date('2026-01-01T00:00:00Z')
    calculateAppealDeadline(input, 'TX')
    expect(input.toISOString().slice(0, 10)).toBe('2026-01-01')
  })
})
