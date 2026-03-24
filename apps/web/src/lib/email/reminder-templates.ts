/**
 * Email templates for deadline reminders.
 *
 * Plain-text emails (no HTML) for maximum deliverability.
 * Each template is a function that returns { subject, body }.
 */

interface ReminderContext {
  userName: string
  deadlineLabel: string
  dueDate: string          // formatted date string
  daysUntil: number
  caseTitle: string
  caseUrl: string
}

export function buildReminderEmail(ctx: ReminderContext): { subject: string; body: string } {
  const urgencyPrefix = ctx.daysUntil <= 1
    ? 'URGENT: '
    : ctx.daysUntil <= 3
      ? 'Reminder: '
      : ''

  const subject = `${urgencyPrefix}${ctx.deadlineLabel} — due ${ctx.dueDate}`

  const body = [
    `Hi ${ctx.userName},`,
    '',
    ctx.daysUntil <= 1
      ? `Your deadline "${ctx.deadlineLabel}" is due TOMORROW (${ctx.dueDate}).`
      : `Your deadline "${ctx.deadlineLabel}" is due in ${ctx.daysUntil} days (${ctx.dueDate}).`,
    '',
    `Case: ${ctx.caseTitle}`,
    '',
    ctx.daysUntil <= 1
      ? 'Please take action today to avoid missing this deadline.'
      : 'Make sure you are on track to meet this deadline.',
    '',
    `View your case: ${ctx.caseUrl}`,
    '',
    '—',
    'Lawyer Free',
    'This is an automated reminder. You can adjust reminder preferences in Settings.',
    '',
    'DISCLAIMER: Lawyer Free provides general legal information, not legal advice.',
  ].join('\n')

  return { subject, body }
}
