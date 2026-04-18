import { describe, it, expect } from 'vitest'
import { buildReminderRows } from '@/lib/rules/insert-deadlines'

describe('buildReminderRows', () => {
  const deadlineId = 'dl-123'
  const caseId = 'case-456'
  const now = new Date('2026-04-18T12:00:00Z')

  it('creates email rows at T-7, T-3, T-1 for future deadline', () => {
    const dueAt = new Date('2026-04-30T12:00:00Z') // 12 days away
    const rows = buildReminderRows({ deadlineId, caseId, dueAt, now, smsPhone: undefined })
    const emailRows = rows.filter(r => r.channel === 'email')
    expect(emailRows).toHaveLength(3)
    const offsets = emailRows.map(r =>
      Math.round((dueAt.getTime() - new Date(r.send_at).getTime()) / 86400000)
    )
    expect(offsets.sort()).toEqual([1, 3, 7])
  })

  it('skips email rows whose send_at is in the past', () => {
    const dueAt = new Date('2026-04-20T12:00:00Z') // 2 days away — T-7 and T-3 in past
    const rows = buildReminderRows({ deadlineId, caseId, dueAt, now, smsPhone: undefined })
    const emailRows = rows.filter(r => r.channel === 'email')
    expect(emailRows).toHaveLength(1) // only T-1 is future
  })

  it('creates SMS rows at T-3, T-1, T-0 when smsPhone provided', () => {
    const dueAt = new Date('2026-04-30T12:00:00Z')
    const rows = buildReminderRows({ deadlineId, caseId, dueAt, now, smsPhone: '+15551234567' })
    const smsRows = rows.filter(r => r.channel === 'sms')
    expect(smsRows).toHaveLength(3)
    const offsets = smsRows.map(r =>
      Math.round((dueAt.getTime() - new Date(r.send_at).getTime()) / 86400000)
    )
    expect(offsets.sort()).toEqual([0, 1, 3])
  })

  it('creates no SMS rows when smsPhone is undefined', () => {
    const dueAt = new Date('2026-04-30T12:00:00Z')
    const rows = buildReminderRows({ deadlineId, caseId, dueAt, now, smsPhone: undefined })
    expect(rows.filter(r => r.channel === 'sms')).toHaveLength(0)
  })

  it('sets correct case_id and deadline_id on all rows', () => {
    const dueAt = new Date('2026-04-30T12:00:00Z')
    const rows = buildReminderRows({ deadlineId, caseId, dueAt, now, smsPhone: '+15551234567' })
    for (const row of rows) {
      expect(row.case_id).toBe(caseId)
      expect(row.deadline_id).toBe(deadlineId)
      expect(row.status).toBe('scheduled')
    }
  })
})
