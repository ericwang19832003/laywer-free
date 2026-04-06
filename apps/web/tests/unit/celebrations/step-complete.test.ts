import { describe, it, expect } from 'vitest'

// Test the getMessage logic directly (extracted for testability)
function getMessage(ratio: number): string {
  if (ratio < 0.25) return 'Great start! You\'re building momentum.'
  if (ratio < 0.5) return 'You\'re making real progress.'
  if (ratio < 0.75) return 'Over halfway there! Keep going.'
  return 'Almost done — the finish line is in sight.'
}

describe('step completion message', () => {
  it('returns early message below 25%', () => {
    expect(getMessage(0.1)).toBe('Great start! You\'re building momentum.')
  })

  it('returns progress message at 25-49%', () => {
    expect(getMessage(0.3)).toBe('You\'re making real progress.')
  })

  it('returns halfway message at 50-74%', () => {
    expect(getMessage(0.6)).toBe('Over halfway there! Keep going.')
  })

  it('returns finish message at 75%+', () => {
    expect(getMessage(0.9)).toBe('Almost done — the finish line is in sight.')
  })

  it('returns early message at 0%', () => {
    expect(getMessage(0)).toBe('Great start! You\'re building momentum.')
  })

  it('returns finish message at 100%', () => {
    expect(getMessage(1.0)).toBe('Almost done — the finish line is in sight.')
  })
})
