// ---------------------------------------------------------------------------
// Shared deadline utilities — single source of truth for date calculations
// and label formatting across all deadline components.
// ---------------------------------------------------------------------------

/**
 * Number of calendar days from today (negative = overdue).
 * Strips time to midnight to ensure consistent results regardless
 * of when during the day the calculation runs.
 */
export function daysUntil(dateStr: string): number {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const due = new Date(dateStr)
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate())
  return Math.round((dueDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

/** Whether a deadline falls within the next N calendar days (inclusive). */
export function isWithinDays(dateStr: string, days: number): boolean {
  const d = daysUntil(dateStr)
  return d >= 0 && d <= days
}

// ---------------------------------------------------------------------------
// Urgency color helpers
// ---------------------------------------------------------------------------

export type UrgencyColors = { dot: string; border: string; text: string }

export function getUrgencyColor(days: number): UrgencyColors {
  if (days <= 0) {
    return { dot: 'bg-red-500', border: 'border-l-red-500', text: 'text-red-600' }
  }
  if (days <= 7) {
    return { dot: 'bg-amber-500', border: 'border-l-amber-500', text: 'text-amber-600' }
  }
  return { dot: 'bg-emerald-500', border: 'border-l-emerald-500', text: 'text-warm-muted' }
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

const KEY_LABELS: Record<string, string> = {
  answer_deadline: 'Answer Deadline',
  answer_deadline_estimated: 'Answer Deadline (Estimated)',
  answer_deadline_confirmed: 'Answer Deadline (Confirmed)',
  check_docket_after_answer_deadline: 'Check Docket',
  default_earliest_info: 'Earliest Default Info',
  hearing_date: 'Hearing Date',
  service_deadline: 'Service Deadline',
}

/** Short labels for compact displays (e.g. cases table). */
const KEY_LABELS_SHORT: Record<string, string> = {
  answer_deadline_estimated: 'Answer Due',
  answer_deadline_confirmed: 'Answer Due',
  check_docket_after_answer_deadline: 'Check Docket',
  default_earliest_info: 'Default Info',
  service_deadline: 'Service Due',
  hearing_date: 'Hearing',
}

/** Format a deadline key into a human-readable label. Prefers `label` if present. */
export function formatDeadlineLabel(key: string, label?: string | null): string {
  if (label) return label
  if (key.startsWith('discovery_response_due_confirmed:')) return 'Discovery Response Due'
  return KEY_LABELS[key] ?? key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

/** Short version for compact displays. */
export function formatDeadlineLabelShort(key: string, label?: string | null): string {
  if (label) return label
  if (key.startsWith('discovery_response_due_confirmed:')) return 'Discovery Due'
  return KEY_LABELS_SHORT[key] ?? key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

/** Human-readable countdown string. Returns null if > 14 days out. */
export function formatCountdown(dateStr: string): string | null {
  const days = daysUntil(dateStr)
  if (days < 0) return 'Past due'
  if (days === 0) return 'Due today'
  if (days === 1) return 'Due tomorrow'
  if (days <= 14) return `${days} days left`
  return null
}

/** Full countdown (always returns a string, used in timeline). */
export function formatCountdownFull(days: number): string {
  if (days === 0) return 'Due today'
  if (days === 1) return '1 day left'
  if (days > 1) return `${days} days left`
  if (days === -1) return '1d overdue'
  return `${Math.abs(days)}d overdue`
}

/** Format as "Mon, March 16, 2026". */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/** Format as "Mar 16, 2026". */
export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/** Format as "Mar 16, 2026, 2:30 PM". */
export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

/** Human-readable source badge text. */
export function formatSource(source: string): string {
  switch (source) {
    case 'user_confirmed':
      return 'Confirmed'
    case 'court_notice':
      return 'Court notice'
    case 'ai_generated':
      return 'AI generated'
    case 'system':
      return 'System'
    default:
      return source
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase())
  }
}

/** Human-readable reminder status. */
export function formatReminderStatus(status: string): string {
  switch (status) {
    case 'scheduled':
      return 'Scheduled'
    case 'sent':
      return 'Sent'
    case 'failed':
      return 'Failed'
    default:
      return status
  }
}
