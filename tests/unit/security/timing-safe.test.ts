import { describe, it, expect } from 'vitest'
import { safeEquals } from '@/lib/security/timing-safe'

describe('safeEquals', () => {
  it('returns true for identical strings', () => {
    expect(safeEquals('secret', 'secret')).toBe(true)
  })

  it('returns false for different strings', () => {
    expect(safeEquals('secret', 'other')).toBe(false)
  })
})
