import { describe, it, expect } from 'vitest'
import { reminderEscalationSchema } from '@/lib/schemas/reminder-escalation'

describe('reminderEscalationSchema', () => {
  const valid = {
    id: 'esc-001',
    case_id: 'case-001',
    deadline_id: 'dl-001',
    escalation_level: 3,
    message: 'Your answer deadline is tomorrow.',
    triggered_at: '2026-03-14T00:00:00Z',
    due_at: '2026-03-15T00:00:00Z',
    deadline_key: 'answer_deadline_confirmed',
  }

  it('accepts valid escalation data', () => {
    const result = reminderEscalationSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  it('rejects missing id', () => {
    const { id, ...rest } = valid
    const result = reminderEscalationSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it('rejects escalation_level outside 1-3', () => {
    const result = reminderEscalationSchema.safeParse({ ...valid, escalation_level: 5 })
    expect(result.success).toBe(false)
  })

  it('rejects escalation_level of 0', () => {
    const result = reminderEscalationSchema.safeParse({ ...valid, escalation_level: 0 })
    expect(result.success).toBe(false)
  })

  it('rejects empty message', () => {
    const result = reminderEscalationSchema.safeParse({ ...valid, message: '' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid triggered_at datetime', () => {
    const result = reminderEscalationSchema.safeParse({ ...valid, triggered_at: 'not-a-date' })
    expect(result.success).toBe(false)
  })
})
