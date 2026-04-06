import { describe, it, expect } from 'vitest'

// Extract the reminder calculation logic
function calculateReminderDates(dueAt: string, now: Date = new Date()): Date[] {
  const dueDate = new Date(dueAt)
  const offsets = [7, 3, 1]
  return offsets
    .map(days => new Date(dueDate.getTime() - days * 24 * 60 * 60 * 1000))
    .filter(sendAt => sendAt > now)
}

describe('calculateReminderDates', () => {
  it('creates 3 reminders for deadline 30 days out', () => {
    const now = new Date('2026-01-01T00:00:00Z')
    const dueAt = '2026-01-31T00:00:00Z'
    const reminders = calculateReminderDates(dueAt, now)
    expect(reminders).toHaveLength(3)
  })

  it('creates 1 reminder for deadline 2 days out', () => {
    const now = new Date('2026-01-01T00:00:00Z')
    const dueAt = '2026-01-03T00:00:00Z'
    const reminders = calculateReminderDates(dueAt, now)
    expect(reminders).toHaveLength(1)
  })

  it('creates 0 reminders for deadline in the past', () => {
    const now = new Date('2026-01-10T00:00:00Z')
    const dueAt = '2026-01-05T00:00:00Z'
    const reminders = calculateReminderDates(dueAt, now)
    expect(reminders).toHaveLength(0)
  })

  it('creates 2 reminders for deadline 5 days out', () => {
    const now = new Date('2026-01-01T00:00:00Z')
    const dueAt = '2026-01-06T00:00:00Z'
    const reminders = calculateReminderDates(dueAt, now)
    expect(reminders).toHaveLength(2)
  })
})
