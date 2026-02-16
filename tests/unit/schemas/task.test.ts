import { describe, it, expect } from 'vitest'
import { updateTaskSchema, VALID_TRANSITIONS } from '@/lib/schemas/task'

describe('updateTaskSchema', () => {
  it('accepts valid status completed', () => {
    const result = updateTaskSchema.safeParse({ status: 'completed' })
    expect(result.success).toBe(true)
  })

  it('accepts status with metadata', () => {
    const result = updateTaskSchema.safeParse({
      status: 'in_progress',
      metadata: { started_at: '2026-01-01T00:00:00Z' },
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid status locked', () => {
    const result = updateTaskSchema.safeParse({ status: 'locked' })
    expect(result.success).toBe(false)
  })

  it('rejects missing status', () => {
    const result = updateTaskSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})

describe('VALID_TRANSITIONS', () => {
  it('todo can go to in_progress and skipped', () => {
    expect(VALID_TRANSITIONS['todo']).toEqual(['in_progress', 'skipped'])
  })

  it('in_progress can go to needs_review, completed, skipped', () => {
    expect(VALID_TRANSITIONS['in_progress']).toEqual(['needs_review', 'completed', 'skipped'])
  })

  it('completed has no valid transitions', () => {
    expect(VALID_TRANSITIONS['completed']).toEqual([])
  })

  it('locked has no valid transitions', () => {
    expect(VALID_TRANSITIONS['locked']).toEqual([])
  })

  it('skipped can go to todo', () => {
    expect(VALID_TRANSITIONS['skipped']).toEqual(['todo'])
  })
})
