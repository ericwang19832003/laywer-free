import { describe, it, expect } from 'vitest'
import { calculateSol, getSolYears } from '@/lib/rules/statute-of-limitations'

describe('calculateSol', () => {
  const now = new Date('2026-03-19')

  it('returns 2-year SOL for TX personal injury', () => {
    const result = calculateSol('TX', 'personal_injury', null, '2025-01-01', now)
    expect(result.years).toBe(2)
    expect(result.expiresAt).toEqual(new Date('2027-01-01'))
    expect(result.daysRemaining).toBeGreaterThan(200)
    expect(result.level).toBe('safe')
  })

  it('returns 4-year SOL for TX contract', () => {
    const result = calculateSol('TX', 'contract', null, '2024-01-01', now)
    expect(result.years).toBe(4)
    expect(result.expiresAt).toEqual(new Date('2028-01-01'))
    expect(result.level).toBe('safe')
  })

  it('returns expired for incident > 2 years ago (TX PI)', () => {
    const result = calculateSol('TX', 'personal_injury', null, '2024-01-01', now)
    expect(result.years).toBe(2)
    expect(result.daysRemaining).toBeLessThan(0)
    expect(result.level).toBe('expired')
  })

  it('returns critical when < 30 days remaining', () => {
    // Set incident date so SOL expires in ~20 days
    const incident = new Date(now)
    incident.setFullYear(incident.getFullYear() - 2)
    incident.setDate(incident.getDate() + 20) // 20 days left
    const result = calculateSol('TX', 'personal_injury', null, incident, now)
    expect(result.level).toBe('critical')
    expect(result.daysRemaining).toBe(20)
  })

  it('returns warning when 30-90 days remaining', () => {
    const incident = new Date(now)
    incident.setFullYear(incident.getFullYear() - 2)
    incident.setDate(incident.getDate() + 60)
    const result = calculateSol('TX', 'personal_injury', null, incident, now)
    expect(result.level).toBe('warning')
  })

  it('returns caution when 90-180 days remaining', () => {
    const incident = new Date(now)
    incident.setFullYear(incident.getFullYear() - 2)
    incident.setDate(incident.getDate() + 120)
    const result = calculateSol('TX', 'personal_injury', null, incident, now)
    expect(result.level).toBe('caution')
  })

  it('returns not_applicable for family law', () => {
    const result = calculateSol('TX', 'family', null, '2025-01-01', now)
    expect(result.years).toBeNull()
    expect(result.level).toBe('not_applicable')
  })

  it('returns caution when no incident date provided', () => {
    const result = calculateSol('TX', 'personal_injury', null, null, now)
    expect(result.years).toBe(2)
    expect(result.expiresAt).toBeNull()
    expect(result.level).toBe('caution')
  })

  it('handles sub-type overrides', () => {
    const result = calculateSol('TX', 'other', 'defamation', '2025-06-01', now)
    expect(result.years).toBe(1) // TX defamation = 1 year
  })

  it('handles CA state rules', () => {
    const result = calculateSol('CA', 'personal_injury', null, '2025-01-01', now)
    expect(result.years).toBe(2) // CA PI = 2 years
  })

  it('handles NY state rules', () => {
    const result = calculateSol('NY', 'personal_injury', null, '2025-01-01', now)
    expect(result.years).toBe(3) // NY PI = 3 years
  })

  it('handles FL state rules', () => {
    const result = calculateSol('FL', 'contract', null, '2024-01-01', now)
    expect(result.years).toBe(5) // FL contract = 5 years
  })

  it('returns not_applicable for unknown state', () => {
    const result = calculateSol('XX', 'personal_injury', null, '2025-01-01', now)
    expect(result.level).toBe('not_applicable')
  })
})

describe('getSolYears', () => {
  it('returns years for known state/dispute', () => {
    expect(getSolYears('TX', 'personal_injury')).toBe(2)
    expect(getSolYears('TX', 'contract')).toBe(4)
    expect(getSolYears('NY', 'personal_injury')).toBe(3)
    expect(getSolYears('CA', 'contract', 'oral')).toBe(2)
  })

  it('returns null for family law', () => {
    expect(getSolYears('TX', 'family')).toBeNull()
  })

  it('returns null for unknown state', () => {
    expect(getSolYears('XX', 'personal_injury')).toBeNull()
  })
})
