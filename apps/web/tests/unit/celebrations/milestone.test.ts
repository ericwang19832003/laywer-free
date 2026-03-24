import { describe, it, expect, beforeEach, vi } from 'vitest'
import { shouldShowMilestone } from '@/components/celebrations/milestone-card'

// Mock localStorage
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

describe('shouldShowMilestone', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  it('returns false when totalCount is 0', () => {
    expect(shouldShowMilestone('case-1', 0, 0)).toBe(false)
  })

  it('returns false when below 50%', () => {
    expect(shouldShowMilestone('case-1', 4, 10)).toBe(false)
  })

  it('returns true when at exactly 50%', () => {
    expect(shouldShowMilestone('case-1', 5, 10)).toBe(true)
  })

  it('returns true when above 50%', () => {
    expect(shouldShowMilestone('case-1', 8, 10)).toBe(true)
  })

  it('returns false when already dismissed', () => {
    localStorageMock.setItem('milestone-50-case-1', '1')
    expect(shouldShowMilestone('case-1', 8, 10)).toBe(false)
  })

  it('uses case-specific localStorage key', () => {
    localStorageMock.setItem('milestone-50-case-1', '1')
    // Different case should still show
    expect(shouldShowMilestone('case-2', 8, 10)).toBe(true)
  })
})
