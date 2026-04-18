export function buildReminderSms(params: {
  deadlineLabel: string
  daysUntil: number
  caseUrl: string
}): string {
  const { deadlineLabel, daysUntil, caseUrl } = params

  let timing: string
  if (daysUntil === 0) {
    timing = 'is DUE TODAY'
  } else if (daysUntil === 1) {
    timing = 'is due TOMORROW'
  } else {
    timing = `is due in ${daysUntil} days`
  }

  return `Lawyer Free: ${deadlineLabel} ${timing}. View case: ${caseUrl}`
}
