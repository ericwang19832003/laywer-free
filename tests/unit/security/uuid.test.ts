import { describe, it, expect } from 'vitest'
import { isUuid } from '@/lib/security/uuid'

describe('isUuid', () => {
  it('accepts valid UUIDs', () => {
    expect(isUuid('550e8400-e29b-41d4-a716-446655440000')).toBe(true)
  })

  it('rejects invalid UUIDs', () => {
    expect(isUuid('not-a-uuid')).toBe(false)
  })
})
