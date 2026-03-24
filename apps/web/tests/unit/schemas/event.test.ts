import { describe, it, expect } from 'vitest'
import { createEventSchema } from '@/lib/schemas/event'

describe('createEventSchema', () => {
  it('accepts valid event with kind', () => {
    const result = createEventSchema.safeParse({
      kind: 'task_completed',
    })
    expect(result.success).toBe(true)
  })

  it('accepts event with task_id uuid', () => {
    const result = createEventSchema.safeParse({
      kind: 'task_started',
      task_id: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty kind', () => {
    const result = createEventSchema.safeParse({
      kind: '',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid uuid for task_id', () => {
    const result = createEventSchema.safeParse({
      kind: 'task_started',
      task_id: 'not-a-uuid',
    })
    expect(result.success).toBe(false)
  })

  it('defaults payload to empty object', () => {
    const result = createEventSchema.safeParse({
      kind: 'task_completed',
    })
    if (result.success) {
      expect(result.data.payload).toEqual({})
    }
  })
})
