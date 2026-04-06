export interface Deadline {
  id: string
  case_id: string
  key: string
  due_at: string
  created_at: string
}

export interface EscalationRule {
  deadline_key: string
  level: number
  offset_days: number
  condition_type: 'always' | 'no_event' | 'status_not_changed'
  condition_key: string | null
  message_template: string
}

export interface ExistingEscalation {
  deadline_id: string
  escalation_level: number
}

export interface TaskEvent {
  case_id: string
  kind: string
  created_at: string
}

export interface EscalationAction {
  case_id: string
  deadline_id: string
  escalation_level: number
  message: string
  triggered_at: string
}

export const BLOCKED_PHRASES = Object.freeze([
  'you must',
  'file immediately',
  'sanctions',
  'legal penalty',
  'automatic judgment',
  'guaranteed outcome',
] as const)

export function isMessageSafe(message: string): boolean {
  const lower = message.toLowerCase()
  return !BLOCKED_PHRASES.some((phrase) => lower.includes(phrase))
}

/** Whole calendar days between two dates using UTC date components. */
export function daysUntil(from: Date, to: Date): number {
  const fromUTC = Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate())
  const toUTC = Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate())
  return Math.round((toUTC - fromUTC) / (24 * 60 * 60 * 1000))
}

function formatDueDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

function checkCondition(
  rule: EscalationRule,
  deadline: Deadline,
  taskEvents: TaskEvent[]
): boolean {
  if (rule.condition_type === 'always') return true

  // Both 'no_event' and 'status_not_changed' fire when condition_key
  // event is absent from task_events after the deadline was created.
  if (!rule.condition_key) return true

  const deadlineCreatedAt = new Date(deadline.created_at)
  const hasMatchingEvent = taskEvents.some(
    (e) =>
      e.case_id === deadline.case_id &&
      e.kind === rule.condition_key &&
      new Date(e.created_at) >= deadlineCreatedAt
  )

  return !hasMatchingEvent
}

export function evaluateEscalations(input: {
  deadlines: Deadline[]
  rules: EscalationRule[]
  existingEscalations: ExistingEscalation[]
  taskEvents: TaskEvent[]
  now?: Date
}): EscalationAction[] {
  const { deadlines, rules, existingEscalations, taskEvents, now = new Date() } = input
  const actions: EscalationAction[] = []

  for (const deadline of deadlines) {
    const dueDate = new Date(deadline.due_at)
    const days = daysUntil(now, dueDate)

    if (days < 0) continue

    const matchingRules = rules.filter(
      (r) => r.deadline_key === deadline.key && r.offset_days === days
    )

    for (const rule of matchingRules) {
      const alreadyTriggered = existingEscalations.some(
        (e) => e.deadline_id === deadline.id && e.escalation_level === rule.level
      )
      if (alreadyTriggered) continue

      if (!checkCondition(rule, deadline, taskEvents)) continue

      const message = rule.message_template.replace(
        '{due_date}',
        formatDueDate(dueDate)
      )

      if (!isMessageSafe(message)) {
        console.warn(
          `[escalation-engine] Blocked unsafe message for deadline ${deadline.id} level ${rule.level}: "${message}"`
        )
        continue
      }

      actions.push({
        case_id: deadline.case_id,
        deadline_id: deadline.id,
        escalation_level: rule.level,
        message,
        triggered_at: now.toISOString(),
      })
    }
  }

  return actions
}
