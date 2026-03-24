import { describe, it, expect } from 'vitest'
import { createDeadlineSchema } from '@/lib/schemas/deadline'

describe('createDeadlineSchema', () => {
  it('accepts valid deadline with ISO datetime', () => {
    const result = createDeadlineSchema.safeParse({
      key: 'answer_due',
      due_at: '2026-03-15T09:00:00Z',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty key', () => {
    const result = createDeadlineSchema.safeParse({
      key: '',
      due_at: '2026-03-15T09:00:00Z',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid datetime string', () => {
    const result = createDeadlineSchema.safeParse({
      key: 'answer_due',
      due_at: 'not-a-date',
    })
    expect(result.success).toBe(false)
  })

  it('defaults source to user_confirmed', () => {
    const result = createDeadlineSchema.safeParse({
      key: 'answer_due',
      due_at: '2026-03-15T09:00:00Z',
    })
    if (result.success) {
      expect(result.data.source).toBe('user_confirmed')
    }
  })
})
