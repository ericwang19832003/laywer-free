import { describe, it, expect } from 'vitest'
import {
  INPUT_LIMITS,
  validateTextLength,
  truncateIfNeeded,
} from '@/lib/validation/input-limits'

describe('INPUT_LIMITS constants', () => {
  it('has expected limits', () => {
    expect(INPUT_LIMITS.CASE_DESCRIPTION).toBe(5000)
    expect(INPUT_LIMITS.NOTE_CONTENT).toBe(10000)
    expect(INPUT_LIMITS.TEXT_SNIPPET).toBe(50000)
    expect(INPUT_LIMITS.DOCUMENT_FACTS).toBe(10000)
    expect(INPUT_LIMITS.DOCUMENT_CLAIMS).toBe(10000)
    expect(INPUT_LIMITS.GENERAL_TEXT).toBe(5000)
  })
})

describe('validateTextLength', () => {
  it('returns null when text is within limit', () => {
    expect(validateTextLength('hello', 10, 'field')).toBeNull()
  })

  it('returns null when text is exactly at limit', () => {
    expect(validateTextLength('ab', 2, 'field')).toBeNull()
  })

  it('returns error message when text exceeds limit', () => {
    const result = validateTextLength('hello world', 5, 'myField')
    expect(result).toBe('myField exceeds maximum length of 5 characters')
  })

  it('returns null for empty string with positive limit', () => {
    expect(validateTextLength('', 100, 'field')).toBeNull()
  })

  it('returns error for single char exceeding zero limit', () => {
    const result = validateTextLength('a', 0, 'field')
    expect(result).toBe('field exceeds maximum length of 0 characters')
  })

  it('includes field name in error message', () => {
    const result = validateTextLength('too long', 3, 'description')
    expect(result).toContain('description')
  })
})

describe('truncateIfNeeded', () => {
  it('returns text unchanged when within limit', () => {
    expect(truncateIfNeeded('hello', 10)).toBe('hello')
  })

  it('returns text unchanged when exactly at limit', () => {
    expect(truncateIfNeeded('ab', 2)).toBe('ab')
  })

  it('truncates text exceeding limit', () => {
    expect(truncateIfNeeded('hello world', 5)).toBe('hello')
  })

  it('handles empty string', () => {
    expect(truncateIfNeeded('', 10)).toBe('')
  })
})
