import { describe, it, expect, beforeEach, vi } from 'vitest'
import { computeMilestone, type MilestoneType } from '@/components/celebrations/use-milestone'
import { getEncouragingMessage } from '@/components/celebrations/milestone-modal'

/* ------------------------------------------------------------------ */
/*  localStorage mock                                                 */
/* ------------------------------------------------------------------ */

const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
  }
})()

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

/* ------------------------------------------------------------------ */
/*  computeMilestone                                                  */
/* ------------------------------------------------------------------ */

describe('computeMilestone', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  // --- resolved cases ---

  it('returns "resolved" for a won case', () => {
    expect(computeMilestone('c1', 10, 10, 'won')).toBe('resolved')
  })

  it('returns "resolved" for a settled case', () => {
    expect(computeMilestone('c1', 8, 10, 'settled')).toBe('resolved')
  })

  it('returns "resolved" for a resolved case', () => {
    expect(computeMilestone('c1', 6, 10, 'resolved')).toBe('resolved')
  })

  it('does not return "resolved" after it has been dismissed', () => {
    localStorageMock.setItem('milestone_shown_c1_resolved', '1')
    expect(computeMilestone('c1', 10, 10, 'won')).not.toBe('resolved')
  })

  // --- halfway milestone ---

  it('returns "halfway" when at exactly 50%', () => {
    expect(computeMilestone('c2', 5, 10, 'active')).toBe('halfway')
  })

  it('returns "halfway" when above 50%', () => {
    expect(computeMilestone('c2', 7, 10, 'active')).toBe('halfway')
  })

  it('does not return "halfway" below 50%', () => {
    const result = computeMilestone('c2', 4, 10, 'active')
    expect(result).not.toBe('halfway')
  })

  it('does not return "halfway" after it has been dismissed', () => {
    localStorageMock.setItem('milestone_shown_c2_halfway', '1')
    expect(computeMilestone('c2', 7, 10, 'active')).not.toBe('halfway')
  })

  // --- step completion ---

  it('returns "step" for a completed step', () => {
    expect(computeMilestone('c3', 2, 10, 'active')).toBe('step')
  })

  it('returns null when no steps are completed', () => {
    expect(computeMilestone('c3', 0, 10, 'active')).toBeNull()
  })

  it('returns null when totalSteps is 0', () => {
    expect(computeMilestone('c3', 0, 0, 'active')).toBeNull()
  })

  it('does not return "step" after it has been dismissed for that step count', () => {
    localStorageMock.setItem('milestone_shown_c3_step_3', '1')
    expect(computeMilestone('c3', 3, 10, 'active')).toBeNull()
  })

  // --- priority: resolved > halfway > step ---

  it('prioritizes "resolved" over "halfway"', () => {
    expect(computeMilestone('c4', 6, 10, 'won')).toBe('resolved')
  })

  it('falls back to "halfway" when resolved is dismissed', () => {
    localStorageMock.setItem('milestone_shown_c4_resolved', '1')
    expect(computeMilestone('c4', 6, 10, 'won')).toBe('halfway')
  })

  // --- case-specific isolation ---

  it('uses case-specific localStorage keys', () => {
    localStorageMock.setItem('milestone_shown_c1_halfway', '1')
    expect(computeMilestone('c1', 6, 10, 'active')).not.toBe('halfway')
    expect(computeMilestone('c2', 6, 10, 'active')).toBe('halfway')
  })
})

/* ------------------------------------------------------------------ */
/*  getEncouragingMessage                                             */
/* ------------------------------------------------------------------ */

describe('getEncouragingMessage', () => {
  it('returns early message below 25%', () => {
    expect(getEncouragingMessage(0.1)).toBe('Great start! You\'re building momentum.')
  })

  it('returns progress message at 25-49%', () => {
    expect(getEncouragingMessage(0.3)).toBe('You\'re making real progress.')
  })

  it('returns halfway message at 50-74%', () => {
    expect(getEncouragingMessage(0.6)).toBe('Over halfway there! Keep going.')
  })

  it('returns finish message at 75%+', () => {
    expect(getEncouragingMessage(0.9)).toBe('Almost done — the finish line is in sight.')
  })

  it('returns early message at 0%', () => {
    expect(getEncouragingMessage(0)).toBe('Great start! You\'re building momentum.')
  })

  it('returns finish message at 100%', () => {
    expect(getEncouragingMessage(1.0)).toBe('Almost done — the finish line is in sight.')
  })
})
