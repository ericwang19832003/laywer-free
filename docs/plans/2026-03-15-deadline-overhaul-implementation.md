# Deadline System Overhaul — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Auto-generate litigation deadlines when workflow steps complete, overhaul the deadline UI with timeline/calendar/list views, and add multi-channel notifications (push, SMS, calendar export).

**Architecture:** Config-driven deadline rules engine (`src/lib/rules/deadline-rules.ts`) maps task completion events to deadline generation with Texas Rule 4 date adjustments. Hooks into existing `PATCH /api/tasks/[id]` flow. UI rebuilt with three-view deadlines page and upgraded dashboard card with countdown boxes. Notification system extended with user preferences, push/SMS channels, and calendar export.

**Tech Stack:** Next.js 16, TypeScript, Supabase (PostgreSQL + RLS), Vitest, Tailwind CSS 4, shadcn/ui, Resend (email), Web Push API, ics (calendar export)

**Design doc:** `docs/plans/2026-03-15-deadline-system-overhaul-design.md`

---

## Phase 1: Deadline Rules Engine & Auto-Generation

### Task 1: Texas Rule 4 Date Calculator

Pure function — no DB, no side effects. Adjusts a date to the next business day per Texas Rule 4.

**Files:**
- Create: `src/lib/rules/texas-rule-4.ts`
- Test: `tests/unit/rules/texas-rule-4.test.ts`

**Step 1: Write the failing tests**

```typescript
// tests/unit/rules/texas-rule-4.test.ts
import { describe, it, expect } from 'vitest'
import { applyTexasRule4, isTexasHoliday, getTexasHolidays } from '@/lib/rules/texas-rule-4'

describe('getTexasHolidays', () => {
  it('returns all Texas legal holidays for a given year', () => {
    const holidays = getTexasHolidays(2026)
    expect(holidays).toContainEqual(new Date('2026-01-01')) // New Year's
    expect(holidays).toContainEqual(new Date('2026-01-19')) // MLK (3rd Monday Jan)
    expect(holidays).toContainEqual(new Date('2026-06-19')) // Juneteenth
    expect(holidays).toContainEqual(new Date('2026-07-04')) // July 4 (Saturday → observed Friday Jul 3)
    expect(holidays).toContainEqual(new Date('2026-11-26')) // Thanksgiving (4th Thursday Nov)
    expect(holidays).toContainEqual(new Date('2026-11-27')) // Day after Thanksgiving
    expect(holidays).toContainEqual(new Date('2026-12-25')) // Christmas (Friday)
  })
})

describe('isTexasHoliday', () => {
  it('returns true for New Year Day', () => {
    expect(isTexasHoliday(new Date('2026-01-01'))).toBe(true)
  })

  it('returns false for a regular weekday', () => {
    expect(isTexasHoliday(new Date('2026-03-15'))).toBe(false) // Sunday actually, but test the function
  })
})

describe('applyTexasRule4', () => {
  it('returns the same date if it falls on a weekday non-holiday', () => {
    const result = applyTexasRule4(new Date('2026-03-16')) // Monday
    expect(result.getDay()).toBe(1) // Monday
    expect(result.toISOString().slice(0, 10)).toBe('2026-03-16')
  })

  it('moves Saturday to Monday', () => {
    const result = applyTexasRule4(new Date('2026-03-21')) // Saturday
    expect(result.toISOString().slice(0, 10)).toBe('2026-03-23') // Monday
  })

  it('moves Sunday to Monday', () => {
    const result = applyTexasRule4(new Date('2026-03-22')) // Sunday
    expect(result.toISOString().slice(0, 10)).toBe('2026-03-23') // Monday
  })

  it('moves a holiday (MLK Monday) to Tuesday', () => {
    const result = applyTexasRule4(new Date('2026-01-19')) // MLK Day (Monday)
    expect(result.toISOString().slice(0, 10)).toBe('2026-01-20') // Tuesday
  })

  it('handles consecutive non-business days (Christmas Fri 2026 + weekend)', () => {
    // Dec 25 2026 is Friday (Christmas) → Mon Dec 28
    const result = applyTexasRule4(new Date('2026-12-25'))
    expect(result.toISOString().slice(0, 10)).toBe('2026-12-28') // Monday
  })

  it('handles July 4 on Saturday (observed Friday) landing on another deadline', () => {
    // July 4, 2026 is Saturday. A deadline on July 3 (Friday, observed holiday) → Monday July 6
    const result = applyTexasRule4(new Date('2026-07-03'))
    expect(result.toISOString().slice(0, 10)).toBe('2026-07-06') // Monday
  })
})
```

**Step 2: Run tests to verify they fail**

Run: `cd "/Users/minwang/lawyer free" && npx vitest run tests/unit/rules/texas-rule-4.test.ts`
Expected: FAIL — module not found

**Step 3: Implement Texas Rule 4**

```typescript
// src/lib/rules/texas-rule-4.ts

/**
 * Texas Rule 4 — Computation of Time
 * If the last day for any act falls on a Saturday, Sunday, or legal holiday,
 * the period is extended to include the next day that is not a Saturday,
 * Sunday, or legal holiday.
 *
 * Texas legal holidays (Gov't Code §662.003):
 * New Year's Day, MLK Day, Presidents' Day, Memorial Day, Juneteenth,
 * Independence Day, Labor Day, Veterans Day, Thanksgiving + day after, Christmas
 */

/** Get the Nth occurrence of a weekday in a month (1-indexed). */
function nthWeekdayOfMonth(year: number, month: number, weekday: number, n: number): Date {
  const first = new Date(year, month, 1)
  const firstWeekday = first.getDay()
  let day = 1 + ((weekday - firstWeekday + 7) % 7) + (n - 1) * 7
  return new Date(year, month, day)
}

/** Get the last occurrence of a weekday in a month. */
function lastWeekdayOfMonth(year: number, month: number, weekday: number): Date {
  const last = new Date(year, month + 1, 0) // last day of month
  const lastWeekday = last.getDay()
  const diff = (lastWeekday - weekday + 7) % 7
  return new Date(year, month, last.getDate() - diff)
}

/** Observed date: if holiday falls on Saturday → Friday, Sunday → Monday */
function observed(date: Date): Date {
  const day = date.getDay()
  if (day === 6) return new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1) // Sat → Fri
  if (day === 0) return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1) // Sun → Mon
  return date
}

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function getTexasHolidays(year: number): Date[] {
  const raw = [
    new Date(year, 0, 1),                          // New Year's Day
    nthWeekdayOfMonth(year, 0, 1, 3),               // MLK Day (3rd Monday Jan)
    nthWeekdayOfMonth(year, 1, 1, 3),               // Presidents' Day (3rd Monday Feb)
    lastWeekdayOfMonth(year, 4, 1),                  // Memorial Day (last Monday May)
    new Date(year, 5, 19),                           // Juneteenth
    new Date(year, 6, 4),                            // Independence Day
    nthWeekdayOfMonth(year, 8, 1, 1),               // Labor Day (1st Monday Sep)
    new Date(year, 10, 11),                          // Veterans Day
    nthWeekdayOfMonth(year, 10, 4, 4),               // Thanksgiving (4th Thursday Nov)
    (() => {                                         // Day after Thanksgiving
      const tg = nthWeekdayOfMonth(year, 10, 4, 4)
      return new Date(tg.getFullYear(), tg.getMonth(), tg.getDate() + 1)
    })(),
    new Date(year, 11, 25),                          // Christmas
  ]

  return raw.map(observed)
}

export function isTexasHoliday(date: Date): boolean {
  const year = date.getFullYear()
  const key = toDateKey(date)
  const holidays = getTexasHolidays(year)
  return holidays.some((h) => toDateKey(h) === key)
}

/**
 * Apply Texas Rule 4: if date falls on weekend or Texas holiday,
 * extend to the next business day.
 */
export function applyTexasRule4(date: Date): Date {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  // Max 10 iterations to prevent infinite loop (covers worst-case holiday clusters)
  for (let i = 0; i < 10; i++) {
    const day = result.getDay()
    if (day === 0) { // Sunday → Monday
      result.setDate(result.getDate() + 1)
      continue
    }
    if (day === 6) { // Saturday → Monday
      result.setDate(result.getDate() + 2)
      continue
    }
    if (isTexasHoliday(result)) { // Holiday → next day
      result.setDate(result.getDate() + 1)
      continue
    }
    break // Weekday, non-holiday
  }
  return result
}
```

**Step 4: Run tests to verify they pass**

Run: `cd "/Users/minwang/lawyer free" && npx vitest run tests/unit/rules/texas-rule-4.test.ts`
Expected: PASS (all 7 tests)

**Step 5: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add src/lib/rules/texas-rule-4.ts tests/unit/rules/texas-rule-4.test.ts
git commit -m "feat(deadlines): add Texas Rule 4 date calculator with tests"
```

---

### Task 2: Deadline Rules Config

Config-driven mapping from task completion → deadline generation. Pure data — no DB.

**Files:**
- Create: `src/lib/rules/deadline-rules.ts`
- Test: `tests/unit/rules/deadline-rules.test.ts`

**Step 1: Write the failing tests**

```typescript
// tests/unit/rules/deadline-rules.test.ts
import { describe, it, expect } from 'vitest'
import {
  getDeadlineRulesForTask,
  DEADLINE_RULES,
  type DeadlineRule,
} from '@/lib/rules/deadline-rules'

describe('DEADLINE_RULES', () => {
  it('is a non-empty array', () => {
    expect(DEADLINE_RULES.length).toBeGreaterThan(0)
  })

  it('every rule has required fields', () => {
    for (const rule of DEADLINE_RULES) {
      expect(rule.trigger_task).toBeTruthy()
      expect(rule.deadline_key).toBeTruthy()
      expect(rule.deadline_label).toBeTruthy()
      expect(typeof rule.offset_days).toBe('number')
      expect(['task_completed_at', 'metadata_field']).toContain(rule.reference)
      expect(typeof rule.apply_rule_4).toBe('boolean')
      expect(rule.consequence).toBeTruthy()
    }
  })
})

describe('getDeadlineRulesForTask', () => {
  it('returns service deadline rule for property_file_with_court', () => {
    const rules = getDeadlineRulesForTask('property_file_with_court')
    expect(rules.length).toBeGreaterThanOrEqual(1)
    expect(rules[0].deadline_key).toBe('service_deadline')
    expect(rules[0].offset_days).toBe(90)
    expect(rules[0].apply_rule_4).toBe(true)
  })

  it('returns answer deadline rule for property_serve_defendant', () => {
    const rules = getDeadlineRulesForTask('property_serve_defendant')
    expect(rules.length).toBeGreaterThanOrEqual(1)
    const answerRule = rules.find((r) => r.deadline_key === 'answer_deadline_estimated')
    expect(answerRule).toBeDefined()
    expect(answerRule!.offset_days).toBe(20)
  })

  it('returns divorce waiting period for divorce_file_with_court', () => {
    const rules = getDeadlineRulesForTask('divorce_file_with_court')
    const waitingPeriod = rules.find((r) => r.deadline_key === 'divorce_waiting_period')
    expect(waitingPeriod).toBeDefined()
    expect(waitingPeriod!.offset_days).toBe(60)
  })

  it('returns protective order hearing for po_file_with_court', () => {
    const rules = getDeadlineRulesForTask('po_file_with_court')
    const hearing = rules.find((r) => r.deadline_key === 'po_full_hearing')
    expect(hearing).toBeDefined()
    expect(hearing!.offset_days).toBe(14)
  })

  it('returns empty array for unknown task key', () => {
    const rules = getDeadlineRulesForTask('unknown_task')
    expect(rules).toEqual([])
  })

  it('returns empty array for welcome task', () => {
    const rules = getDeadlineRulesForTask('welcome')
    expect(rules).toEqual([])
  })
})
```

**Step 2: Run tests to verify they fail**

Run: `cd "/Users/minwang/lawyer free" && npx vitest run tests/unit/rules/deadline-rules.test.ts`
Expected: FAIL — module not found

**Step 3: Implement deadline rules config**

```typescript
// src/lib/rules/deadline-rules.ts

export interface DeadlineRule {
  /** Task key that triggers this deadline when completed */
  trigger_task: string
  /** Key stored in the deadlines table */
  deadline_key: string
  /** Human-readable label */
  deadline_label: string
  /** Calendar days from reference date */
  offset_days: number
  /** What date to offset from */
  reference: 'task_completed_at' | 'metadata_field'
  /** If reference = 'metadata_field', read this field from task.metadata */
  metadata_field?: string
  /** Apply Texas Rule 4 (weekends/holidays → next business day) */
  apply_rule_4: boolean
  /** What happens if this deadline is missed */
  consequence: string
  /** Event key that satisfies this deadline (e.g., 'defendant_served') */
  condition_event?: string
}

// ── Service deadline rules (file → must serve within 90 days) ──

const SERVICE_DEADLINE_TASKS = [
  'property_file_with_court',
  'contract_file_with_court',
  'sc_file_with_court',
  'lt_file_with_court',
  'pi_file_with_court',
  're_file_with_court',
  'debt_file_with_court',
  'biz_partnership_file_with_court',
  'biz_b2b_file_with_court',
  'biz_employment_file_with_court',
  'divorce_file_with_court',
  'custody_file_with_court',
  'child_support_file_with_court',
  'spousal_support_file_with_court',
  'visitation_file_with_court',
  'mod_file_with_court',
  'other_file_with_court',
  'file_with_court',
] as const

const serviceDeadlineRules: DeadlineRule[] = SERVICE_DEADLINE_TASKS.map((task) => ({
  trigger_task: task,
  deadline_key: 'service_deadline',
  deadline_label: 'Service Deadline',
  offset_days: 90,
  reference: 'task_completed_at',
  apply_rule_4: true,
  consequence:
    'If you do not serve the other party within 90 days of filing, your case may be dismissed for want of prosecution under TRCP 99.',
  condition_event: 'defendant_served',
}))

// ── Answer deadline rules (serve → answer due in 20 days, first Monday after) ──

const ANSWER_DEADLINE_TASKS = [
  'property_serve_defendant',
  'contract_serve_defendant',
  'sc_serve_defendant',
  'serve_other_party',
  'pi_serve_defendant',
  're_serve_defendant',
  'serve_plaintiff',
  'biz_partnership_serve_defendant',
  'biz_b2b_serve_defendant',
  'biz_employment_serve_defendant',
  'divorce_serve_respondent',
  'custody_serve_respondent',
  'child_support_serve_respondent',
  'spousal_support_serve_respondent',
  'visitation_serve_respondent',
  'mod_serve_respondent',
  'other_serve_defendant',
  'upload_return_of_service',
  'confirm_service_facts',
] as const

const answerDeadlineRules: DeadlineRule[] = ANSWER_DEADLINE_TASKS.map((task) => ({
  trigger_task: task,
  deadline_key: 'answer_deadline_estimated',
  deadline_label: 'Answer Deadline',
  offset_days: 20,
  reference: 'task_completed_at',
  apply_rule_4: true,
  consequence:
    'If the other party does not file an answer by this date, you may be able to request a default judgment.',
  condition_event: 'answer_filed',
}))

// ── Dispute-specific rules ──

const DISPUTE_SPECIFIC_RULES: DeadlineRule[] = [
  // Divorce: 60-day waiting period (TX Family Code 6.702)
  {
    trigger_task: 'divorce_file_with_court',
    deadline_key: 'divorce_waiting_period',
    deadline_label: '60-Day Waiting Period',
    offset_days: 60,
    reference: 'task_completed_at',
    apply_rule_4: false, // Calendar days, not business days
    consequence:
      'Texas requires a 60-day waiting period after filing before a divorce can be finalized. No final hearing can be scheduled before this date.',
  },
  // Protective Order: 14-day full hearing (TX Family Code 82.009)
  {
    trigger_task: 'po_file_with_court',
    deadline_key: 'po_full_hearing',
    deadline_label: 'Full Hearing Deadline',
    offset_days: 14,
    reference: 'task_completed_at',
    apply_rule_4: true,
    consequence:
      'The court must set a full hearing within 14 days of issuing a temporary ex parte protective order.',
  },
]

// ── Combined rules ──

export const DEADLINE_RULES: DeadlineRule[] = [
  ...serviceDeadlineRules,
  ...answerDeadlineRules,
  ...DISPUTE_SPECIFIC_RULES,
]

/** Look up all deadline rules triggered by a given task key. */
export function getDeadlineRulesForTask(taskKey: string): DeadlineRule[] {
  return DEADLINE_RULES.filter((rule) => rule.trigger_task === taskKey)
}
```

**Step 4: Run tests to verify they pass**

Run: `cd "/Users/minwang/lawyer free" && npx vitest run tests/unit/rules/deadline-rules.test.ts`
Expected: PASS (all 6 tests)

**Step 5: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add src/lib/rules/deadline-rules.ts tests/unit/rules/deadline-rules.test.ts
git commit -m "feat(deadlines): add config-driven deadline rules for all dispute types"
```

---

### Task 3: Deadline Generator (Pure Logic)

Computes deadlines from rules + task data. Pure function — takes inputs, returns deadline records to insert.

**Files:**
- Create: `src/lib/rules/deadline-generator.ts`
- Test: `tests/unit/rules/deadline-generator.test.ts`

**Step 1: Write the failing tests**

```typescript
// tests/unit/rules/deadline-generator.test.ts
import { describe, it, expect } from 'vitest'
import { generateDeadlines, type GenerateDeadlinesInput } from '@/lib/rules/deadline-generator'

const NOW = new Date('2026-03-16T12:00:00Z') // Monday

function makeInput(overrides: Partial<GenerateDeadlinesInput> = {}): GenerateDeadlinesInput {
  return {
    taskKey: 'property_file_with_court',
    caseId: 'case-123',
    completedAt: NOW.toISOString(),
    taskMetadata: {},
    existingDeadlineKeys: [],
    ...overrides,
  }
}

describe('generateDeadlines', () => {
  it('generates a service deadline when filing task completes', () => {
    const result = generateDeadlines(makeInput())
    expect(result.length).toBeGreaterThanOrEqual(1)
    const service = result.find((d) => d.key === 'service_deadline')
    expect(service).toBeDefined()
    expect(service!.label).toBe('Service Deadline')
    expect(service!.source).toBe('system')
  })

  it('computes due_at as completedAt + offset_days with Rule 4', () => {
    const result = generateDeadlines(makeInput({
      completedAt: '2026-03-16T12:00:00Z', // Monday
    }))
    const service = result.find((d) => d.key === 'service_deadline')!
    // March 16 + 90 days = June 14 (Sunday) → Rule 4 → June 15 (Monday)
    expect(service.due_at.slice(0, 10)).toBe('2026-06-15')
  })

  it('generates answer deadline when serve task completes', () => {
    const result = generateDeadlines(makeInput({
      taskKey: 'property_serve_defendant',
    }))
    const answer = result.find((d) => d.key === 'answer_deadline_estimated')
    expect(answer).toBeDefined()
    expect(answer!.offset_days_used).toBe(20)
  })

  it('returns empty array for tasks with no rules', () => {
    const result = generateDeadlines(makeInput({ taskKey: 'welcome' }))
    expect(result).toEqual([])
  })

  it('skips deadlines that already exist for this case', () => {
    const result = generateDeadlines(makeInput({
      existingDeadlineKeys: ['service_deadline'],
    }))
    const service = result.find((d) => d.key === 'service_deadline')
    expect(service).toBeUndefined()
  })

  it('generates divorce waiting period for divorce filing', () => {
    const result = generateDeadlines(makeInput({
      taskKey: 'divorce_file_with_court',
      completedAt: '2026-04-01T12:00:00Z',
    }))
    const waiting = result.find((d) => d.key === 'divorce_waiting_period')
    expect(waiting).toBeDefined()
    // April 1 + 60 = May 31 (Sunday) — but apply_rule_4 is false for this rule
    expect(waiting!.due_at.slice(0, 10)).toBe('2026-05-31')
    // Also should generate service_deadline
    const service = result.find((d) => d.key === 'service_deadline')
    expect(service).toBeDefined()
  })
})
```

**Step 2: Run tests to verify they fail**

Run: `cd "/Users/minwang/lawyer free" && npx vitest run tests/unit/rules/deadline-generator.test.ts`
Expected: FAIL — module not found

**Step 3: Implement deadline generator**

```typescript
// src/lib/rules/deadline-generator.ts
import { getDeadlineRulesForTask } from './deadline-rules'
import { applyTexasRule4 } from './texas-rule-4'

export interface GenerateDeadlinesInput {
  taskKey: string
  caseId: string
  completedAt: string            // ISO 8601
  taskMetadata: Record<string, unknown>
  existingDeadlineKeys: string[] // Already-existing deadline keys for this case
}

export interface GeneratedDeadline {
  case_id: string
  key: string
  label: string
  due_at: string                 // ISO 8601
  source: 'system'
  rationale: string
  consequence: string
  auto_generated: boolean
  offset_days_used: number
  condition_event?: string
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

/**
 * Given a completed task, compute all deadlines that should be auto-generated.
 * Pure function — no DB access.
 */
export function generateDeadlines(input: GenerateDeadlinesInput): GeneratedDeadline[] {
  const { taskKey, caseId, completedAt, taskMetadata, existingDeadlineKeys } = input
  const rules = getDeadlineRulesForTask(taskKey)

  if (rules.length === 0) return []

  const results: GeneratedDeadline[] = []

  for (const rule of rules) {
    // Skip if this deadline already exists for this case
    if (existingDeadlineKeys.includes(rule.deadline_key)) continue

    // Determine reference date
    let referenceDate: Date
    if (rule.reference === 'metadata_field' && rule.metadata_field) {
      const metaValue = taskMetadata[rule.metadata_field]
      if (typeof metaValue !== 'string') continue // Skip if metadata not available
      referenceDate = new Date(metaValue)
    } else {
      referenceDate = new Date(completedAt)
    }

    // Compute raw due date
    let dueDate = addDays(referenceDate, rule.offset_days)

    // Apply Texas Rule 4 if configured
    if (rule.apply_rule_4) {
      dueDate = applyTexasRule4(dueDate)
    }

    results.push({
      case_id: caseId,
      key: rule.deadline_key,
      label: rule.deadline_label,
      due_at: dueDate.toISOString(),
      source: 'system',
      rationale: `Auto-generated: ${rule.deadline_label} (${rule.offset_days} days from ${rule.reference === 'task_completed_at' ? 'task completion' : rule.metadata_field}).`,
      consequence: rule.consequence,
      auto_generated: true,
      offset_days_used: rule.offset_days,
      condition_event: rule.condition_event,
    })
  }

  return results
}
```

**Step 4: Run tests to verify they pass**

Run: `cd "/Users/minwang/lawyer free" && npx vitest run tests/unit/rules/deadline-generator.test.ts`
Expected: PASS (all 6 tests)

**Step 5: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add src/lib/rules/deadline-generator.ts tests/unit/rules/deadline-generator.test.ts
git commit -m "feat(deadlines): add deadline generator pure function"
```

---

### Task 4: Database Migration — Extend Deadlines Table

Add `label`, `consequence`, and `auto_generated` columns to the `deadlines` table. Add levels 4 & 5 to escalation rules. Update unique constraint on `escalation_rules`.

**Files:**
- Create: `supabase/migrations/20260316000001_deadline_auto_generation.sql`

**Step 1: Write the migration**

```sql
-- ============================================
-- Deadline Auto-Generation Support
-- Adds label, consequence, auto_generated to deadlines table.
-- Extends escalation_rules unique constraint to support
-- multiple deadline types with same level.
-- ============================================

-- 1) Add new columns to deadlines
ALTER TABLE public.deadlines
  ADD COLUMN IF NOT EXISTS label text,
  ADD COLUMN IF NOT EXISTS consequence text,
  ADD COLUMN IF NOT EXISTS auto_generated boolean NOT NULL DEFAULT false;

-- 2) Drop the old unique constraint on escalation_rules (deadline_key, level)
-- and recreate it — the existing one is fine, we just need to allow
-- more deadline_key values to be inserted.
-- (No schema change needed — the UNIQUE(deadline_key, level) already supports
-- different deadline_keys with different levels.)

-- 3) Add index for auto_generated deadline queries
CREATE INDEX IF NOT EXISTS idx_deadlines_auto_generated
  ON public.deadlines (case_id, auto_generated)
  WHERE auto_generated = true;

-- 4) Seed escalation rules for service_deadline
INSERT INTO public.escalation_rules (deadline_key, level, offset_days, condition_type, condition_key, message_template) VALUES
  ('service_deadline', 1, 30, 'always', NULL,
   'You have 60 days left to serve the other party. Start planning service now.'),
  ('service_deadline', 2, 14, 'no_event', 'defendant_served',
   'Your service deadline is in {due_date}. The other party has not been served yet.'),
  ('service_deadline', 3, 7, 'no_event', 'defendant_served',
   'Only 7 days left to serve the other party. Your case could be dismissed if service is not completed by {due_date}.')
ON CONFLICT (deadline_key, level) DO NOTHING;

-- 5) Seed escalation rules for answer_deadline_estimated
INSERT INTO public.escalation_rules (deadline_key, level, offset_days, condition_type, condition_key, message_template) VALUES
  ('answer_deadline_estimated', 1, 7, 'always', NULL,
   'The estimated answer deadline is {due_date}. Confirm the exact date from your citation.'),
  ('answer_deadline_estimated', 2, 3, 'no_event', 'answer_deadline_confirmed_event',
   'The answer deadline is in {due_date}. Please confirm the exact date.'),
  ('answer_deadline_estimated', 3, 1, 'no_event', 'answer_deadline_confirmed_event',
   'The answer deadline is tomorrow ({due_date}). Confirm or update this date.')
ON CONFLICT (deadline_key, level) DO NOTHING;

-- 6) Seed escalation rules for divorce_waiting_period
INSERT INTO public.escalation_rules (deadline_key, level, offset_days, condition_type, condition_key, message_template) VALUES
  ('divorce_waiting_period', 1, 7, 'always', NULL,
   'The 60-day waiting period ends on {due_date}. You can begin preparing for the final hearing.'),
  ('divorce_waiting_period', 2, 1, 'always', NULL,
   'The 60-day waiting period ends tomorrow ({due_date}). You may now schedule a final hearing.')
ON CONFLICT (deadline_key, level) DO NOTHING;

-- 7) Seed escalation rules for po_full_hearing
INSERT INTO public.escalation_rules (deadline_key, level, offset_days, condition_type, condition_key, message_template) VALUES
  ('po_full_hearing', 1, 7, 'always', NULL,
   'Your protective order hearing must be held by {due_date}. Contact the court to confirm the hearing date.'),
  ('po_full_hearing', 2, 3, 'always', NULL,
   'Your protective order hearing is in 3 days ({due_date}). Prepare your evidence and testimony.'),
  ('po_full_hearing', 3, 1, 'always', NULL,
   'Your protective order hearing is tomorrow ({due_date}). Make sure you have all documents ready.')
ON CONFLICT (deadline_key, level) DO NOTHING;
```

**Step 2: Apply migration locally**

Run: `cd "/Users/minwang/lawyer free" && npx supabase db push` (or `npx supabase migration up` if using local)
Expected: Migration applies successfully

**Step 3: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add supabase/migrations/20260316000001_deadline_auto_generation.sql
git commit -m "feat(deadlines): add auto_generated columns and escalation rules migration"
```

---

### Task 5: Hook Auto-Generation into Task API

Modify `PATCH /api/tasks/[id]` to call the deadline generator when a task completes.

**Files:**
- Create: `src/lib/rules/auto-generate-deadlines.ts` (DB orchestrator)
- Modify: `src/app/api/tasks/[id]/route.ts:94-108` (add hook after completion)
- Test: `tests/unit/rules/deadline-generator.test.ts` (already covers pure logic)

**Step 1: Create the DB orchestrator**

This function calls the pure generator, then persists results to Supabase.

```typescript
// src/lib/rules/auto-generate-deadlines.ts
import { SupabaseClient } from '@supabase/supabase-js'
import { generateDeadlines } from './deadline-generator'

interface AutoGenerateInput {
  taskKey: string
  caseId: string
  completedAt: string
  taskMetadata: Record<string, unknown>
}

/**
 * Auto-generate deadlines when a task completes.
 * Queries existing deadlines to avoid duplicates, then inserts new ones
 * with reminders and audit trail.
 */
export async function autoGenerateDeadlines(
  supabase: SupabaseClient,
  input: AutoGenerateInput
): Promise<void> {
  const { taskKey, caseId, completedAt, taskMetadata } = input

  // Fetch existing deadline keys for this case to avoid duplicates
  const { data: existingDeadlines } = await supabase
    .from('deadlines')
    .select('key')
    .eq('case_id', caseId)

  const existingKeys = (existingDeadlines ?? []).map((d) => d.key)

  // Generate deadlines (pure function)
  const deadlines = generateDeadlines({
    taskKey,
    caseId,
    completedAt,
    taskMetadata: taskMetadata ?? {},
    existingDeadlineKeys: existingKeys,
  })

  if (deadlines.length === 0) return

  // Insert each deadline with reminders
  for (const deadline of deadlines) {
    const { data: inserted, error: insertError } = await supabase
      .from('deadlines')
      .insert({
        case_id: deadline.case_id,
        key: deadline.key,
        due_at: deadline.due_at,
        source: deadline.source,
        rationale: deadline.rationale,
        label: deadline.label,
        consequence: deadline.consequence,
        auto_generated: deadline.auto_generated,
      })
      .select()
      .single()

    if (insertError || !inserted) {
      console.error(`[auto-generate-deadlines] Failed to insert ${deadline.key}:`, insertError?.message)
      continue
    }

    // Auto-create reminders at -7d, -3d, -1d (skip past dates)
    const dueDate = new Date(deadline.due_at)
    const now = new Date()
    const remindersToInsert = [7, 3, 1]
      .map((days) => new Date(dueDate.getTime() - days * 24 * 60 * 60 * 1000))
      .filter((sendAt) => sendAt > now)
      .map((sendAt) => ({
        case_id: caseId,
        deadline_id: inserted.id,
        channel: 'email' as const,
        send_at: sendAt.toISOString(),
        status: 'scheduled' as const,
      }))

    if (remindersToInsert.length > 0) {
      await supabase.from('reminders').insert(remindersToInsert)
    }

    // Write audit trail
    await supabase.from('task_events').insert({
      case_id: caseId,
      kind: 'deadline_auto_generated',
      payload: {
        deadline_id: inserted.id,
        key: deadline.key,
        label: deadline.label,
        due_at: deadline.due_at,
        trigger_task: taskKey,
      },
    })

    // Create in-app notification
    const { data: caseData } = await supabase
      .from('cases')
      .select('user_id')
      .eq('id', caseId)
      .single()

    if (caseData?.user_id) {
      await supabase.from('notifications').insert({
        user_id: caseData.user_id,
        title: `${deadline.label} added`,
        body: `${deadline.label}: ${new Date(deadline.due_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
        link: `/case/${caseId}/deadlines`,
        read: false,
      })
    }
  }
}
```

**Step 2: Hook into task API**

Modify `src/app/api/tasks/[id]/route.ts`. Add import at top and call after task completion:

Add import at line 5:
```typescript
import { autoGenerateDeadlines } from '@/lib/rules/auto-generate-deadlines'
```

After line 96 (after the `computeAndStoreConfidence` call), add:

```typescript
    // Auto-generate deadlines on task completion
    if (newStatus === 'completed') {
      autoGenerateDeadlines(supabase, {
        taskKey: currentTask.task_key,
        caseId: currentTask.case_id,
        completedAt: new Date().toISOString(),
        taskMetadata: updatedTask.metadata ?? {},
      }).catch((err) => {
        console.error('[task-api] Failed to auto-generate deadlines:', err)
      })
    }
```

**Step 3: Build to verify compilation**

Run: `cd "/Users/minwang/lawyer free" && npx next build --no-lint 2>&1 | tail -20`
Expected: Build succeeds (or dev server shows no type errors)

**Step 4: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add src/lib/rules/auto-generate-deadlines.ts src/app/api/tasks/[id]/route.ts
git commit -m "feat(deadlines): hook auto-generation into task completion API"
```

---

### Task 6: Update Deadline Schema & Dashboard Card for New Fields

Update the Zod schema to accept new fields and update the dashboard card / deadlines page to display `label` and `consequence`.

**Files:**
- Modify: `src/lib/schemas/deadline.ts` — add label, consequence, auto_generated
- Modify: `src/components/dashboard/deadlines-card.tsx` — use `label` field, add consequence
- Modify: `src/app/(authenticated)/case/[id]/deadlines/page.tsx` — display consequence
- Modify: `src/app/(authenticated)/cases/page.tsx` — enhance Next Deadline column

**Step 1: Update Zod schema**

Add to `src/lib/schemas/deadline.ts` after the existing `createDeadlineSchema`:

```typescript
export const createDeadlineSchema = z.object({
  key: z.string().min(1),
  due_at: z.string().datetime(),
  source: z.enum(['system', 'user_confirmed', 'court_notice']).optional().default('user_confirmed'),
  rationale: z.string().optional(),
  label: z.string().optional(),
  consequence: z.string().optional(),
  auto_generated: z.boolean().optional().default(false),
})
```

**Step 2: Update deadlines-card.tsx to use label field**

In `src/components/dashboard/deadlines-card.tsx`, update the `Deadline` interface (line 8-13):

```typescript
interface Deadline {
  id: string
  key: string
  due_at: string
  source: string
  label: string | null
  consequence: string | null
}
```

Update `formatKeyLabel` (line 27-31) to prefer `label` field:

```typescript
function formatKeyLabel(key: string, label?: string | null): string {
  if (label) return label
  if (key.startsWith('discovery_response_due_confirmed:')) {
    return 'Discovery Response Due'
  }
  return KEY_LABELS[key] ?? key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}
```

Add a countdown box component for the most urgent deadline. Update the card to show consequence text under the hero. Update references to `formatKeyLabel(deadline.key)` → `formatKeyLabel(deadline.key, deadline.label)`.

**Step 3: Update deadlines page to show consequence**

In `src/app/(authenticated)/case/[id]/deadlines/page.tsx`, add `consequence` to the `Deadline` interface and render it after the rationale:

```typescript
interface Deadline {
  id: string
  key: string
  due_at: string
  source: string
  rationale: string | null
  consequence: string | null
  label: string | null
  auto_generated: boolean
  reminders: Reminder[]
}
```

Add after the rationale section (after line 227):

```tsx
{deadline.consequence && (
  <details className="mt-3">
    <summary className="text-sm font-medium text-warm-text cursor-pointer">
      What happens if I miss this?
    </summary>
    <p className="mt-2 text-sm text-warm-muted pl-4 border-l-2 border-calm-amber">
      {deadline.consequence}
    </p>
  </details>
)}
```

**Step 4: Update cases page Next Deadline column**

In `src/app/(authenticated)/cases/page.tsx`, enhance the deadline query (line 42-44) to also fetch `key` and `label`:

```typescript
supabase.from('deadlines').select('case_id, due_at, key, label').in('case_id', caseIds)
  .gte('due_at', new Date().toISOString())
  .order('due_at', { ascending: true })
```

Update the `deadlineByCase` map to store `{ due_at, key, label }` instead of just `due_at`, and pass richer data to the `CaseTable`.

**Step 5: Build to verify**

Run: `cd "/Users/minwang/lawyer free" && npx next build --no-lint 2>&1 | tail -20`
Expected: Build succeeds

**Step 6: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add src/lib/schemas/deadline.ts src/components/dashboard/deadlines-card.tsx \
  src/app/\(authenticated\)/case/\[id\]/deadlines/page.tsx \
  src/app/\(authenticated\)/cases/page.tsx
git commit -m "feat(deadlines): display auto-generated labels, consequences, and urgency"
```

---

## Phase 2: UI Overhaul

### Task 7: Timeline View Component

Create a vertical timeline component for the deadlines page.

**Files:**
- Create: `src/components/deadlines/deadline-timeline.tsx`

**Step 1: Create the timeline component**

A client component that renders deadlines as a vertical timeline with:
- "Today" marker line
- Color-coded cards (red/amber/green)
- Expandable consequence sections
- Source badges

```typescript
// src/components/deadlines/deadline-timeline.tsx
'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

interface Deadline {
  id: string
  key: string
  due_at: string
  source: string
  rationale: string | null
  consequence: string | null
  label: string | null
  auto_generated: boolean
}

interface DeadlineTimelineProps {
  deadlines: Deadline[]
}

function daysUntil(dateStr: string): number {
  const date = new Date(dateStr)
  const now = new Date()
  return Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

function getUrgencyColor(days: number): { dot: string; border: string; text: string } {
  if (days < 0) return { dot: 'bg-red-500', border: 'border-l-red-500', text: 'text-red-600' }
  if (days === 0) return { dot: 'bg-red-500', border: 'border-l-red-500', text: 'text-red-600' }
  if (days <= 7) return { dot: 'bg-amber-500', border: 'border-l-amber-500', text: 'text-amber-600' }
  return { dot: 'bg-emerald-500', border: 'border-l-emerald-500', text: 'text-warm-muted' }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short', month: 'long', day: 'numeric', year: 'numeric',
  })
}

function formatCountdown(days: number): string {
  if (days < 0) return `${Math.abs(days)}d overdue`
  if (days === 0) return 'Due today'
  if (days === 1) return '1 day left'
  return `${days} days left`
}

function formatLabel(key: string, label: string | null): string {
  if (label) return label
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function DeadlineTimeline({ deadlines }: DeadlineTimelineProps) {
  const sorted = [...deadlines].sort(
    (a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime()
  )

  // Find where "today" sits in the timeline
  const now = new Date()
  const todayIndex = sorted.findIndex((d) => new Date(d.due_at) >= now)

  return (
    <div className="relative pl-8">
      {/* Vertical line */}
      <div className="absolute left-3 top-0 bottom-0 w-px bg-warm-border" />

      {sorted.map((deadline, i) => {
        const days = daysUntil(deadline.due_at)
        const colors = getUrgencyColor(days)
        const showTodayMarker = i === todayIndex

        return (
          <div key={deadline.id}>
            {/* Today marker */}
            {showTodayMarker && todayIndex > 0 && (
              <div className="relative flex items-center gap-3 py-3">
                <div className="absolute left-[-20px] w-2 h-2 rounded-full bg-calm-indigo ring-4 ring-calm-indigo/20" />
                <p className="text-xs font-semibold text-calm-indigo uppercase tracking-wide">Today</p>
                <div className="flex-1 h-px bg-calm-indigo/30" />
              </div>
            )}

            {/* Deadline card */}
            <div className="relative pb-6">
              {/* Dot */}
              <div className={`absolute left-[-22px] top-4 w-3 h-3 rounded-full ${colors.dot} ring-4 ring-white`} />

              <Card className={`border-l-4 ${colors.border}`}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <h3 className="font-medium text-warm-text">
                        {formatLabel(deadline.key, deadline.label)}
                      </h3>
                      <p className="text-sm text-warm-muted">{formatDate(deadline.due_at)}</p>
                      <p className={`text-sm font-medium ${colors.text}`}>
                        {formatCountdown(days)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="secondary" className="text-xs">
                        {deadline.source === 'system' ? 'Auto' : deadline.source === 'user_confirmed' ? 'Confirmed' : deadline.source}
                      </Badge>
                      {deadline.auto_generated && (
                        <Badge variant="outline" className="text-xs">Auto-generated</Badge>
                      )}
                    </div>
                  </div>

                  {deadline.rationale && (
                    <p className="mt-2 text-xs text-warm-muted">{deadline.rationale}</p>
                  )}

                  {deadline.consequence && (
                    <details className="mt-3">
                      <summary className="text-sm font-medium text-warm-text cursor-pointer hover:text-calm-indigo">
                        What happens if I miss this?
                      </summary>
                      <p className="mt-2 text-sm text-warm-muted pl-4 border-l-2 border-calm-amber">
                        {deadline.consequence}
                      </p>
                    </details>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )
      })}

      {sorted.length === 0 && (
        <p className="text-warm-muted text-sm py-4">No deadlines to display.</p>
      )}
    </div>
  )
}
```

**Step 2: Build to verify**

Run: `cd "/Users/minwang/lawyer free" && npx next build --no-lint 2>&1 | tail -20`
Expected: Build succeeds

**Step 3: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add src/components/deadlines/deadline-timeline.tsx
git commit -m "feat(deadlines): add timeline view component"
```

---

### Task 8: Calendar View Component

Create a month-grid calendar component showing deadline dots.

**Files:**
- Create: `src/components/deadlines/deadline-calendar.tsx`

**Step 1: Create the calendar component**

A client component rendering a month grid with colored dots and date-tap popovers.

This should be a self-contained component using basic HTML/CSS grid — no external calendar library needed. Include:
- Month/year header with prev/next buttons
- Weekday headers (Su Mo Tu We Th Fr Sa)
- Day cells with colored dots for deadlines
- Click a day with deadlines → show popover list
- Color coding matches timeline (red/amber/green)

**Step 2: Build to verify**

Run: `cd "/Users/minwang/lawyer free" && npx next build --no-lint 2>&1 | tail -20`

**Step 3: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add src/components/deadlines/deadline-calendar.tsx
git commit -m "feat(deadlines): add calendar view component"
```

---

### Task 9: Segmented View Switcher + Updated Deadlines Page

Add a segment control to the deadlines page to switch between Timeline, Calendar, and List views.

**Files:**
- Create: `src/components/deadlines/deadline-views.tsx` (client wrapper with segment control)
- Modify: `src/app/(authenticated)/case/[id]/deadlines/page.tsx` — use new view wrapper

**Step 1: Create the view switcher**

```typescript
// src/components/deadlines/deadline-views.tsx
'use client'

import { useState } from 'react'
import { DeadlineTimeline } from './deadline-timeline'
import { DeadlineCalendar } from './deadline-calendar'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, List } from 'lucide-react'

// ... segment control with 3 buttons, renders the selected view
// Timeline (default) | Calendar | List
```

**Step 2: Update the deadlines page**

Replace the card-list rendering in `page.tsx` with the new `DeadlineViews` component. The page still fetches data server-side and passes it as props.

**Step 3: Build to verify**

Run: `cd "/Users/minwang/lawyer free" && npx next build --no-lint 2>&1 | tail -20`

**Step 4: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add src/components/deadlines/deadline-views.tsx \
  src/app/\(authenticated\)/case/\[id\]/deadlines/page.tsx
git commit -m "feat(deadlines): add segmented view switcher (timeline/calendar/list)"
```

---

### Task 10: Upgraded Dashboard Deadlines Card with Countdown Box

Enhance the dashboard card with a countdown box for the most urgent deadline.

**Files:**
- Modify: `src/components/dashboard/deadlines-card.tsx`

**Step 1: Update the card**

Replace the current AnswerDeadlineHero with a generic "most urgent deadline" countdown box:

```tsx
// Countdown box component
function CountdownBox({ deadline }: { deadline: Deadline }) {
  const days = daysUntil(deadline.due_at)
  const borderColor = days < 0 ? 'border-red-500' : days <= 7 ? 'border-amber-500' : 'border-emerald-500'
  const textColor = days < 0 ? 'text-red-600' : days <= 7 ? 'text-amber-600' : 'text-emerald-600'

  return (
    <div className="flex items-start gap-4">
      <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-lg border-2 ${borderColor} bg-white shrink-0`}>
        <span className={`text-2xl font-bold tabular-nums ${textColor}`}>
          {days < 0 ? Math.abs(days) : days}
        </span>
        <span className="text-xs text-warm-muted">{days < 0 ? 'overdue' : 'days'}</span>
      </div>
      <div className="space-y-1 min-w-0">
        <p className="text-sm font-medium text-warm-text truncate">
          {formatKeyLabel(deadline.key, deadline.label)}
        </p>
        <p className="text-xs text-warm-muted">
          {formatDateShort(deadline.due_at)}
        </p>
        {deadline.consequence && (
          <p className="text-xs text-warm-muted line-clamp-2">
            {deadline.consequence}
          </p>
        )}
      </div>
    </div>
  )
}
```

Find the most urgent deadline (closest future date or most recently overdue), show it in the countdown box. Show remaining deadlines as compact rows below.

**Step 2: Build to verify**

Run: `cd "/Users/minwang/lawyer free" && npx next build --no-lint 2>&1 | tail -20`

**Step 3: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add src/components/dashboard/deadlines-card.tsx
git commit -m "feat(deadlines): upgrade dashboard card with countdown box and consequences"
```

---

### Task 11: Enhanced Cases List Next Deadline Column

Show deadline name + countdown in the cases list table.

**Files:**
- Modify: `src/app/(authenticated)/cases/page.tsx` — richer deadline data
- Modify: `src/components/cases/case-table.tsx` (if exists) — render deadline with color

**Step 1: Update data fetching**

In `cases/page.tsx`, change the deadlines query to fetch ALL future deadlines (not just 7d window) for the "Next Deadline" column, and include `key` and `label`:

```typescript
// Replace line 42-44 with:
supabase.from('deadlines').select('case_id, due_at, key, label')
  .in('case_id', caseIds)
  .gte('due_at', new Date().toISOString())
  .order('due_at', { ascending: true })
```

Update `deadlineByCase` to store `{ due_at, key, label }` and pass to `CaseTable`.

**Step 2: Update CaseTable component**

Render the "Next Deadline" column with:
- `12d — Answer Due` (amber if < 7d)
- `83d — Service` (green)
- `Overdue! — Answer` (red)
- `—` (grey if no deadlines)

**Step 3: Build to verify**

Run: `cd "/Users/minwang/lawyer free" && npx next build --no-lint 2>&1 | tail -20`

**Step 4: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add src/app/\(authenticated\)/cases/page.tsx src/components/cases/case-table.tsx
git commit -m "feat(deadlines): show deadline name + urgency color in cases list"
```

---

## Phase 3: Multi-Channel Notifications

### Task 12: User Notification Preferences

Add user preferences table/column and settings UI for reminder configuration.

**Files:**
- Create: `supabase/migrations/20260316000002_notification_preferences.sql`
- Create: `src/components/settings/notification-preferences.tsx`
- Modify: `src/app/(authenticated)/settings/page.tsx` — add preferences section

**Step 1: Write migration**

```sql
-- Add notification_preferences JSONB to auth.users metadata
-- (Stored in user_metadata, no new table needed)
-- Schema:
-- {
--   reminder_offsets: [7, 3, 1],      -- days before deadline
--   channels: { email: true, push: false, sms: false },
--   quiet_hours: { start: 21, end: 7 },
--   phone: null
-- }

-- Add snoozed_until to reminders table
ALTER TABLE public.reminders
  ADD COLUMN IF NOT EXISTS snoozed_until timestamptz;

-- Update channel check to include new channels
ALTER TABLE public.reminders
  DROP CONSTRAINT IF EXISTS reminders_channel_check;

ALTER TABLE public.reminders
  ADD CONSTRAINT reminders_channel_check
  CHECK (channel IN ('email', 'push', 'sms'));
```

**Step 2: Create preferences component**

A client component with checkboxes for reminder timing and channel preferences. Saves to user metadata via Supabase auth API.

**Step 3: Add to settings page**

**Step 4: Build and commit**

```bash
cd "/Users/minwang/lawyer free"
git add supabase/migrations/20260316000002_notification_preferences.sql \
  src/components/settings/notification-preferences.tsx \
  src/app/\(authenticated\)/settings/page.tsx
git commit -m "feat(notifications): add user notification preferences UI and migration"
```

---

### Task 13: Calendar Export (.ics)

Generate .ics files for deadline calendar export.

**Files:**
- Create: `src/lib/calendar-export.ts`
- Create: `src/app/api/cases/[id]/deadlines/[deadlineId]/ics/route.ts`
- Modify: `src/components/deadlines/deadline-timeline.tsx` — add export buttons
- Test: `tests/unit/logic/calendar-export.test.ts`

**Step 1: Write the failing test**

```typescript
// tests/unit/logic/calendar-export.test.ts
import { describe, it, expect } from 'vitest'
import { generateICS } from '@/lib/calendar-export'

describe('generateICS', () => {
  it('generates valid ICS content with VCALENDAR and VEVENT', () => {
    const ics = generateICS({
      title: 'Lawyer Free: Answer Deadline',
      description: 'If missed, default judgment may be entered.',
      startDate: new Date('2026-04-04T09:00:00Z'),
      url: 'https://lawyerfree.app/case/123/deadlines',
    })

    expect(ics).toContain('BEGIN:VCALENDAR')
    expect(ics).toContain('BEGIN:VEVENT')
    expect(ics).toContain('SUMMARY:Lawyer Free: Answer Deadline')
    expect(ics).toContain('END:VCALENDAR')
  })
})
```

**Step 2: Implement ICS generator**

**Step 3: Create API route for .ics download**

**Step 4: Add export buttons to timeline/calendar views**

**Step 5: Build, test, commit**

```bash
cd "/Users/minwang/lawyer free"
git add src/lib/calendar-export.ts \
  src/app/api/cases/\[id\]/deadlines/\[deadlineId\]/ics/route.ts \
  tests/unit/logic/calendar-export.test.ts \
  src/components/deadlines/deadline-timeline.tsx
git commit -m "feat(deadlines): add .ics calendar export with download and Google/Apple links"
```

---

### Task 14: Enhanced Notification Bell

Upgrade the notification bell in TopNav to show a real notification center.

**Files:**
- Modify: `src/components/layout/notification-bell.tsx` (or create if inline in top-nav)
- Create: `src/components/layout/notification-center.tsx`

**Step 1: Create notification center component**

A popover/dropdown from the bell icon showing:
- Grouped by TODAY / EARLIER
- Each notification: title, body, timestamp, "View" link
- "Mark all as read" button
- Unread count badge

**Step 2: Build and commit**

```bash
cd "/Users/minwang/lawyer free"
git add src/components/layout/notification-center.tsx src/components/layout/notification-bell.tsx
git commit -m "feat(notifications): add notification center dropdown with grouping and badge"
```

---

### Task 15: Update Empty States

Update the empty state messaging across deadlines page and dashboard card to reference auto-generation.

**Files:**
- Modify: `src/components/dashboard/deadlines-card.tsx` — update empty text
- Modify: `src/app/(authenticated)/case/[id]/deadlines/page.tsx` — update empty text

**Step 1: Update empty state copy**

Dashboard card empty state:
```
No deadlines yet. Deadlines will appear automatically as you progress through your case steps. You can also add one manually.
```

Deadlines page empty state:
```
No deadlines yet

Deadlines are created automatically when you complete key steps like filing with the court or serving the other party. You can also add one manually.

[ + Add a Deadline ]
```

**Step 2: Build and commit**

```bash
cd "/Users/minwang/lawyer free"
git add src/components/dashboard/deadlines-card.tsx \
  src/app/\(authenticated\)/case/\[id\]/deadlines/page.tsx
git commit -m "feat(deadlines): update empty states to reference auto-generation"
```

---

## Summary

| Phase | Tasks | What it delivers |
|-------|-------|-----------------|
| **Phase 1** | Tasks 1-6 | Deadline rules engine, Texas Rule 4, auto-generation on task completion, DB migration, schema + display updates |
| **Phase 2** | Tasks 7-11 | Timeline view, calendar view, segmented switcher, countdown box dashboard card, enhanced cases list |
| **Phase 3** | Tasks 12-15 | Notification preferences, calendar export, notification center, updated empty states |

**Total:** 15 tasks, each independently committable and testable.

**Critical path:** Tasks 1 → 2 → 3 → 4 → 5 (engine must work before UI shows results). Tasks 6-15 can be parallelized after Task 5.
