import { describe, it, expect } from 'vitest'
import { buildReminderSms } from '@/lib/sms/reminder-templates'

describe('buildReminderSms', () => {
  const baseParams = {
    deadlineLabel: 'Answer Deadline',
    caseUrl: 'https://lawyer-free.vercel.app/case/abc123/deadlines',
  }

  it('mentions deadline label', () => {
    const msg = buildReminderSms({ ...baseParams, daysUntil: 3 })
    expect(msg).toContain('Answer Deadline')
  })

  it('says "3 days" for daysUntil=3', () => {
    const msg = buildReminderSms({ ...baseParams, daysUntil: 3 })
    expect(msg).toContain('3 days')
  })

  it('says "tomorrow" for daysUntil=1', () => {
    const msg = buildReminderSms({ ...baseParams, daysUntil: 1 })
    expect(msg.toLowerCase()).toContain('tomorrow')
  })

  it('says "TODAY" for daysUntil=0', () => {
    const msg = buildReminderSms({ ...baseParams, daysUntil: 0 })
    expect(msg.toUpperCase()).toContain('TODAY')
  })

  it('includes case URL', () => {
    const msg = buildReminderSms({ ...baseParams, daysUntil: 3 })
    expect(msg).toContain('https://lawyer-free.vercel.app/case/abc123/deadlines')
  })

  it('is under 160 characters for all timing variants', () => {
    for (const daysUntil of [0, 1, 3]) {
      const msg = buildReminderSms({ ...baseParams, daysUntil })
      expect(msg.length).toBeLessThanOrEqual(160)
    }
  })
})
