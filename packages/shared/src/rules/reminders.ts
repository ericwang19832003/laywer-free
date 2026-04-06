const REMINDER_OFFSETS_DAYS = [7, 3, 1] as const

export function calculateReminderDates(
  dueAt: string,
  now: Date = new Date()
): Date[] {
  const dueDate = new Date(dueAt)
  return REMINDER_OFFSETS_DAYS
    .map((days) => new Date(dueDate.getTime() - days * 24 * 60 * 60 * 1000))
    .filter((sendAt) => sendAt > now)
}
