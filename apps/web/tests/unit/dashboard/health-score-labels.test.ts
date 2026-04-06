import { describe, it, expect } from 'vitest'
import { getHealthLabel } from '@/lib/health-labels'

describe('getHealthLabel', () => {
  // ── Null / pending state ─────────────────────────────────────────
  it('returns "Pending" with muted styling for null score', () => {
    const result = getHealthLabel(null)
    expect(result.label).toBe('Pending')
    expect(result.colorClass).toBe('text-warm-muted')
  })

  // ── Destructive range: 0-39 ──────────────────────────────────────
  describe('0-39 "Needs attention" (destructive)', () => {
    it.each([0, 1, 20, 39])('score %i → "Needs attention"', (score) => {
      const result = getHealthLabel(score)
      expect(result.label).toBe('Needs attention')
      expect(result.colorClass).toBe('text-destructive')
    })
  })

  // ── Amber range: 40-69 ──────────────────────────────────────────
  describe('40-69 "On track" (amber)', () => {
    it.each([40, 50, 68, 69])('score %i → "On track"', (score) => {
      const result = getHealthLabel(score)
      expect(result.label).toBe('On track')
      expect(result.colorClass).toBe('text-calm-amber')
    })
  })

  // ── Green range: 70-100 ─────────────────────────────────────────
  describe('70-100 "Strong position" (green)', () => {
    it.each([70, 85, 99, 100])('score %i → "Strong position"', (score) => {
      const result = getHealthLabel(score)
      expect(result.label).toBe('Strong position')
      expect(result.colorClass).toBe('text-calm-green')
    })
  })

  // ── Boundary tests ──────────────────────────────────────────────
  describe('boundary values', () => {
    it('score 39 is destructive, 40 is amber', () => {
      expect(getHealthLabel(39).colorClass).toBe('text-destructive')
      expect(getHealthLabel(40).colorClass).toBe('text-calm-amber')
    })

    it('score 69 is amber, 70 is green', () => {
      expect(getHealthLabel(69).colorClass).toBe('text-calm-amber')
      expect(getHealthLabel(70).colorClass).toBe('text-calm-green')
    })
  })
})
