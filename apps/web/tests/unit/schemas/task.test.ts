import { describe, it, expect } from 'vitest'
import { updateTaskSchema, VALID_TRANSITIONS } from '@lawyer-free/shared/schemas/task'

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

  it('accepts empty object (both fields optional)', () => {
    const result = updateTaskSchema.safeParse({})
    expect(result.success).toBe(true)
  })
})

describe('VALID_TRANSITIONS', () => {
  it('todo can go to in_progress, completed, and skipped', () => {
    expect(VALID_TRANSITIONS['todo']).toEqual(['in_progress', 'completed', 'skipped'])
  })

  it('in_progress can go to in_progress, needs_review, completed, skipped', () => {
    expect(VALID_TRANSITIONS['in_progress']).toEqual(['in_progress', 'needs_review', 'completed', 'skipped'])
  })

  it('completed can re-complete or reopen to in_progress', () => {
    expect(VALID_TRANSITIONS['completed']).toEqual(['completed', 'in_progress'])
  })

  it('locked has no valid transitions', () => {
    expect(VALID_TRANSITIONS['locked']).toEqual([])
  })

  it('skipped can go to todo, in_progress, or completed', () => {
    expect(VALID_TRANSITIONS['skipped']).toEqual(['todo', 'in_progress', 'completed'])
  })
})
