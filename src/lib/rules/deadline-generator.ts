/**
 * Deadline Generator — Pure Function
 *
 * Given a completed task's key, case ID, completion date, and metadata, this
 * function computes all deadlines that should be created based on the
 * config-driven rules in deadline-rules.ts.
 *
 * Pure function: no side effects, no DB calls, no network. Easy to test.
 *
 * Date handling: All date math uses local date constructors (not UTC) to stay
 * consistent with texas-rule-4.ts. Output ISO strings use noon local time to
 * avoid timezone boundary issues.
 */

import { getDeadlineRulesForTask } from '@/lib/rules/deadline-rules'
import { applyTexasRule4 } from '@/lib/rules/texas-rule-4'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GenerateDeadlinesInput {
  /** The task key that was just completed (e.g. 'file_with_court') */
  taskKey: string
  /** The case this task belongs to */
  caseId: string
  /** When the task was completed — ISO 8601 string */
  completedAt: string
  /** Arbitrary metadata attached to the task (may contain reference dates) */
  taskMetadata: Record<string, unknown>
  /** Deadline keys that already exist for this case (for deduplication) */
  existingDeadlineKeys: string[]
}

export interface GeneratedDeadline {
  case_id: string
  key: string
  label: string
  /** ISO 8601 string with time set to noon local to avoid TZ boundary issues */
  due_at: string
  source: 'system'
  rationale: string
  consequence: string
  auto_generated: boolean
  offset_days_used: number
  condition_event?: string
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Parse an ISO 8601 string into a local Date at noon.
 *
 * Extracts year/month/day from the string and constructs a local date,
 * avoiding any UTC offset surprises.
 */
function parseToLocalNoon(isoString: string): Date {
  // ISO strings look like "2026-03-16T12:00:00.000Z" or "2026-03-16"
  const parts = isoString.split('T')[0].split('-')
  const year = parseInt(parts[0], 10)
  const month = parseInt(parts[1], 10) - 1 // 0-indexed
  const day = parseInt(parts[2], 10)
  return new Date(year, month, day, 12, 0, 0)
}

/**
 * Add calendar days to a date, returning a new local Date at noon.
 */
function addCalendarDays(date: Date, days: number): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + days,
    12,
    0,
    0
  )
}

/**
 * Format a local Date as an ISO 8601 string.
 * Uses the built-in toISOString() which converts to UTC, but since we set
 * the time to noon local, the date portion stays correct in most time zones.
 */
function toISOString(date: Date): string {
  return date.toISOString()
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate all deadlines triggered by a completed task.
 *
 * Steps:
 * 1. Look up rules for the task key
 * 2. Skip rules whose deadline key already exists (dedup)
 * 3. Compute the due date from the reference date + offset
 * 4. Apply Texas Rule 4 if the rule requires it
 * 5. Return an array of GeneratedDeadline objects ready for DB insert
 */
export function generateDeadlines(
  input: GenerateDeadlinesInput
): GeneratedDeadline[] {
  const rules = getDeadlineRulesForTask(input.taskKey)

  if (rules.length === 0) {
    return []
  }

  const results: GeneratedDeadline[] = []

  for (const rule of rules) {
    // --- Deduplication: skip if this deadline already exists for the case ---
    if (input.existingDeadlineKeys.includes(rule.deadline_key)) {
      continue
    }

    // --- Determine the reference date ---
    let referenceDate: Date

    if (
      rule.reference === 'metadata_field' &&
      rule.metadata_field &&
      input.taskMetadata[rule.metadata_field]
    ) {
      // Use the date from task metadata
      const metaValue = input.taskMetadata[rule.metadata_field] as string
      referenceDate = parseToLocalNoon(metaValue)
    } else {
      // Default: use the task completion date
      referenceDate = parseToLocalNoon(input.completedAt)
    }

    // --- Compute raw due date: reference + offset_days calendar days ---
    let dueDate = addCalendarDays(referenceDate, rule.offset_days)

    // --- Apply Texas Rule 4 if configured ---
    if (rule.apply_rule_4) {
      dueDate = applyTexasRule4(dueDate)
      // Restore noon time (Rule 4 strips it to midnight)
      dueDate = new Date(
        dueDate.getFullYear(),
        dueDate.getMonth(),
        dueDate.getDate(),
        12,
        0,
        0
      )
    }

    // --- Build the GeneratedDeadline ---
    const deadline: GeneratedDeadline = {
      case_id: input.caseId,
      key: rule.deadline_key,
      label: rule.deadline_label,
      due_at: toISOString(dueDate),
      source: 'system',
      rationale: `Auto-generated: ${rule.deadline_label} (${rule.offset_days} days from ${rule.reference === 'metadata_field' ? rule.metadata_field : 'task completion'}${rule.apply_rule_4 ? ', adjusted per Texas Rule 4' : ''})`,
      consequence: rule.consequence,
      auto_generated: true,
      offset_days_used: rule.offset_days,
      ...(rule.condition_event !== undefined && {
        condition_event: rule.condition_event,
      }),
    }

    results.push(deadline)
  }

  return results
}
