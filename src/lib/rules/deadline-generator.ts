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
// ---------------------------------------------------------------------------
// Dispute type → trigger task key mapping (for intake-driven seeding)
// ---------------------------------------------------------------------------

/** Maps a dispute type string to the corresponding file_with_court task key */
const FILING_TASK_MAP: Record<string, string> = {
  property_damage: 'property_file_with_court',
  property: 'property_file_with_court',
  personal_injury: 'pi_file_with_court',
  contract: 'contract_file_with_court',
  small_claims: 'sc_file_with_court',
  landlord_tenant: 'lt_file_with_court',
  real_estate: 're_file_with_court',
  debt: 'debt_file_with_court',
  divorce: 'divorce_file_with_court',
  custody: 'custody_file_with_court',
  child_support: 'child_support_file_with_court',
  spousal_support: 'spousal_support_file_with_court',
  visitation: 'visitation_file_with_court',
  modification: 'mod_file_with_court',
  protective_order: 'po_file_with_court',
  other: 'other_file_with_court',
}

/** Maps a dispute type string to the corresponding serve task key */
const SERVICE_TASK_MAP: Record<string, string> = {
  property_damage: 'property_serve_defendant',
  property: 'property_serve_defendant',
  personal_injury: 'pi_serve_defendant',
  contract: 'contract_serve_defendant',
  small_claims: 'sc_serve_defendant',
  landlord_tenant: 'serve_other_party',
  real_estate: 're_serve_defendant',
  debt: 'serve_plaintiff',
  divorce: 'divorce_serve_respondent',
  custody: 'custody_serve_respondent',
  child_support: 'child_support_serve_respondent',
  spousal_support: 'spousal_support_serve_respondent',
  visitation: 'visitation_serve_respondent',
  modification: 'mod_serve_respondent',
  other: 'other_serve_defendant',
}

// Also handle business sub-types
const BIZ_FILING_MAP: Record<string, string> = {
  partnership: 'biz_partnership_file_with_court',
  b2b: 'biz_b2b_file_with_court',
  employment: 'biz_employment_file_with_court',
}

const BIZ_SERVICE_MAP: Record<string, string> = {
  partnership: 'biz_partnership_serve_defendant',
  b2b: 'biz_b2b_serve_defendant',
  employment: 'biz_employment_serve_defendant',
}

export interface SeedDeadlinesInput {
  caseId: string
  disputeType: string
  /** Business sub-type, if dispute is 'business' */
  businessSubType?: string
  /** ISO date when the case was filed with the court */
  filingDate?: string
  /** ISO date when the other party was served */
  serviceDate?: string
  /** Deadline keys that already exist for this case */
  existingDeadlineKeys: string[]
}

/**
 * Generate deadlines from known dates (filing date, service date) provided
 * during case import / intake. This is the primary fix for pre-filing cases
 * that already have filing/service dates but haven't triggered auto-generation.
 */
export function seedDeadlinesFromDates(
  input: SeedDeadlinesInput
): GeneratedDeadline[] {
  const results: GeneratedDeadline[] = []

  // Resolve task keys for this dispute type
  let filingTaskKey: string | undefined
  let serviceTaskKey: string | undefined

  if (input.disputeType === 'business' && input.businessSubType) {
    filingTaskKey = BIZ_FILING_MAP[input.businessSubType]
    serviceTaskKey = BIZ_SERVICE_MAP[input.businessSubType]
  } else {
    filingTaskKey = FILING_TASK_MAP[input.disputeType]
    serviceTaskKey = SERVICE_TASK_MAP[input.disputeType]
  }

  // Seed deadlines from filing date (service deadline + dispute-specific)
  if (input.filingDate && filingTaskKey) {
    const filingDeadlines = generateDeadlines({
      taskKey: filingTaskKey,
      caseId: input.caseId,
      completedAt: input.filingDate,
      taskMetadata: {},
      existingDeadlineKeys: [
        ...input.existingDeadlineKeys,
        ...results.map((d) => d.key),
      ],
    })
    results.push(...filingDeadlines)
  }

  // Seed deadlines from service date (answer deadline)
  if (input.serviceDate && serviceTaskKey) {
    const serviceDeadlines = generateDeadlines({
      taskKey: serviceTaskKey,
      caseId: input.caseId,
      completedAt: input.serviceDate,
      taskMetadata: {},
      existingDeadlineKeys: [
        ...input.existingDeadlineKeys,
        ...results.map((d) => d.key),
      ],
    })
    results.push(...serviceDeadlines)
  }

  return results
}

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
