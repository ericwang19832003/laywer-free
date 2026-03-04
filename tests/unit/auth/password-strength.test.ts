import { describe, it, expect } from 'vitest'
import { getPasswordStrength } from '@/lib/auth/password-strength'

describe('getPasswordStrength', () => {
  it('returns weak for empty string', () => {
    expect(getPasswordStrength('')).toEqual({ level: 'weak', label: 'Weak', score: 0 })
  })

  it('returns weak for under 6 characters', () => {
    expect(getPasswordStrength('ab1')).toEqual({ level: 'weak', label: 'Weak', score: 1 })
  })

  it('returns fair for 6-7 characters', () => {
    const result = getPasswordStrength('abcdef')
    expect(result.level).toBe('fair')
    expect(result.label).toBe('Fair')
  })

  it('returns good for 8+ with mixed case', () => {
    const result = getPasswordStrength('Abcdefgh')
    expect(result.level).toBe('good')
    expect(result.label).toBe('Good')
  })

  it('returns strong for 8+ with mixed case, numbers, and symbols', () => {
    const result = getPasswordStrength('Abcdef1!')
    expect(result.level).toBe('strong')
    expect(result.label).toBe('Strong')
  })
})
