import { describe, it, expect } from 'vitest'
import {
  generateDeadlines,
  type GenerateDeadlinesInput,
  type GeneratedDeadline,
} from '@/lib/rules/deadline-generator'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Fixed base date: March 16, 2026 (Monday) at noon local time.
 * Using noon avoids any timezone boundary issues in ISO strings.
 */
const BASE_DATE = new Date(2026, 2, 16, 12, 0, 0)
const BASE_ISO = BASE_DATE.toISOString()

/** Create a standard input with overrides */
function makeInput(
  overrides: Partial<GenerateDeadlinesInput> = {}
): GenerateDeadlinesInput {
  return {
    taskKey: 'file_with_court',
    caseId: 'case-001',
    completedAt: BASE_ISO,
    taskMetadata: {},
    existingDeadlineKeys: [],
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('generateDeadlines', () => {
  it('generates a service deadline when filing task completes', () => {
    const input = makeInput({ taskKey: 'file_with_court' })
    const results = generateDeadlines(input)

    expect(results.length).toBeGreaterThanOrEqual(1)

    const service = results.find((d) => d.key === 'service_deadline')
    expect(service).toBeDefined()
    expect(service!.case_id).toBe('case-001')
    expect(service!.label).toBe('Deadline to Serve')
    expect(service!.source).toBe('system')
    expect(service!.auto_generated).toBe(true)
    expect(service!.offset_days_used).toBe(90)
    expect(service!.condition_event).toBe('defendant_served')
    expect(service!.rationale).toBeTruthy()
    expect(service!.consequence).toBeTruthy()
  })

  it('computes due_at as completedAt + offset_days with Rule 4', () => {
    // March 16, 2026 + 90 days = June 14, 2026 (Sunday)
    // Rule 4: Sunday -> Monday June 15, 2026
    const input = makeInput({ taskKey: 'file_with_court' })
    const results = generateDeadlines(input)

    const service = results.find((d) => d.key === 'service_deadline')
    expect(service).toBeDefined()

    const dueDate = new Date(service!.due_at)
    expect(dueDate.getFullYear()).toBe(2026)
    expect(dueDate.getMonth()).toBe(5) // June (0-indexed)
    expect(dueDate.getDate()).toBe(15) // Monday
  })

  it('generates answer deadline when serve task completes', () => {
    // March 16, 2026 + 20 days = April 5, 2026 (Sunday)
    // Rule 4: Sunday -> Monday April 6, 2026
    const input = makeInput({ taskKey: 'serve_other_party' })
    const results = generateDeadlines(input)

    expect(results.length).toBeGreaterThanOrEqual(1)

    const answer = results.find((d) => d.key === 'answer_deadline_estimated')
    expect(answer).toBeDefined()
    expect(answer!.label).toBe('Estimated Answer Deadline')
    expect(answer!.offset_days_used).toBe(20)
    expect(answer!.condition_event).toBe('answer_filed')

    const dueDate = new Date(answer!.due_at)
    expect(dueDate.getFullYear()).toBe(2026)
    expect(dueDate.getMonth()).toBe(3) // April (0-indexed)
    expect(dueDate.getDate()).toBe(6) // Monday
  })

  it('returns empty array for tasks with no rules', () => {
    const input = makeInput({ taskKey: 'welcome' })
    const results = generateDeadlines(input)
    expect(results).toEqual([])
  })

  it('skips deadlines that already exist for this case', () => {
    const input = makeInput({
      taskKey: 'file_with_court',
      existingDeadlineKeys: ['service_deadline'],
    })
    const results = generateDeadlines(input)

    const service = results.find((d) => d.key === 'service_deadline')
    expect(service).toBeUndefined()
  })

  it('generates divorce waiting period for divorce filing', () => {
    // March 16, 2026 + 60 days = May 15, 2026 (Friday)
    // Divorce waiting period does NOT apply Rule 4
    const input = makeInput({ taskKey: 'divorce_file_with_court' })
    const results = generateDeadlines(input)

    const waiting = results.find((d) => d.key === 'divorce_waiting_period')
    expect(waiting).toBeDefined()
    expect(waiting!.label).toBe('Divorce Waiting Period')
    expect(waiting!.offset_days_used).toBe(60)
    expect(waiting!.condition_event).toBeUndefined()

    const dueDate = new Date(waiting!.due_at)
    expect(dueDate.getFullYear()).toBe(2026)
    expect(dueDate.getMonth()).toBe(4) // May (0-indexed)
    expect(dueDate.getDate()).toBe(15) // Friday
  })

  it('generates 2 deadlines for divorce_file_with_court (service + waiting)', () => {
    const input = makeInput({ taskKey: 'divorce_file_with_court' })
    const results = generateDeadlines(input)

    expect(results).toHaveLength(2)

    const keys = results.map((d) => d.key)
    expect(keys).toContain('service_deadline')
    expect(keys).toContain('divorce_waiting_period')
  })
})
