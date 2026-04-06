import { describe, it, expect } from 'vitest'
import { isUuid } from '@/lib/security/uuid'

describe('isUuid', () => {
  it('accepts valid UUIDs', () => {
    expect(isUuid('550e8400-e29b-41d4-a716-446655440000')).toBe(true)
  })

  it('accepts v7 UUIDs', () => {
    expect(isUuid('01890f1b-0c45-7b3a-9b1e-9a38f8a0d7f5')).toBe(true)
  })

  it('rejects invalid UUIDs', () => {
    expect(isUuid('not-a-uuid')).toBe(false)
  })
})
