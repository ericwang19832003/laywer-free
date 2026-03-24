import { describe, it, expect } from 'vitest'
import {
  DEADLINE_RULES,
  getDeadlineRulesForTask,
  type DeadlineRule,
} from '@lawyer-free/shared/rules/deadline-rules'

describe('DEADLINE_RULES', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(DEADLINE_RULES)).toBe(true)
    expect(DEADLINE_RULES.length).toBeGreaterThan(0)
  })

  it('every rule has required fields', () => {
    for (const rule of DEADLINE_RULES) {
      // Required string fields
      expect(typeof rule.trigger_task).toBe('string')
      expect(rule.trigger_task.length).toBeGreaterThan(0)

      expect(typeof rule.deadline_key).toBe('string')
      expect(rule.deadline_key.length).toBeGreaterThan(0)

      expect(typeof rule.deadline_label).toBe('string')
      expect(rule.deadline_label.length).toBeGreaterThan(0)

      // offset_days is a non-negative number
      expect(typeof rule.offset_days).toBe('number')
      expect(rule.offset_days).toBeGreaterThanOrEqual(0)

      // reference must be one of the allowed values
      expect(['task_completed_at', 'metadata_field']).toContain(rule.reference)

      // If reference is 'metadata_field', metadata_field must be set
      if (rule.reference === 'metadata_field') {
        expect(typeof rule.metadata_field).toBe('string')
        expect(rule.metadata_field!.length).toBeGreaterThan(0)
      }

      // apply_rule_4 is boolean
      expect(typeof rule.apply_rule_4).toBe('boolean')

      // consequence is a non-empty string
      expect(typeof rule.consequence).toBe('string')
      expect(rule.consequence.length).toBeGreaterThan(0)

      // condition_event is optional but if present must be a non-empty string
      if (rule.condition_event !== undefined) {
        expect(typeof rule.condition_event).toBe('string')
        expect(rule.condition_event.length).toBeGreaterThan(0)
      }
    }
  })
})

describe('getDeadlineRulesForTask', () => {
  it('returns service deadline rule for property_file_with_court', () => {
    const rules = getDeadlineRulesForTask('property_file_with_court')
    expect(rules.length).toBeGreaterThanOrEqual(1)

    const serviceRule = rules.find((r) => r.deadline_key === 'service_deadline')
    expect(serviceRule).toBeDefined()
    expect(serviceRule!.offset_days).toBe(90)
    expect(serviceRule!.apply_rule_4).toBe(true)
    expect(serviceRule!.condition_event).toBe('defendant_served')
    expect(serviceRule!.reference).toBe('task_completed_at')
  })

  it('returns answer deadline rule for property_serve_defendant', () => {
    const rules = getDeadlineRulesForTask('property_serve_defendant')
    expect(rules.length).toBeGreaterThanOrEqual(1)

    const answerRule = rules.find(
      (r) => r.deadline_key === 'answer_deadline_estimated'
    )
    expect(answerRule).toBeDefined()
    expect(answerRule!.offset_days).toBe(20)
    expect(answerRule!.apply_rule_4).toBe(true)
    expect(answerRule!.condition_event).toBe('answer_filed')
    expect(answerRule!.reference).toBe('task_completed_at')
  })

  it('returns divorce waiting period for divorce_file_with_court', () => {
    const rules = getDeadlineRulesForTask('divorce_file_with_court')

    const waitingRule = rules.find(
      (r) => r.deadline_key === 'divorce_waiting_period'
    )
    expect(waitingRule).toBeDefined()
    expect(waitingRule!.offset_days).toBe(60)
    expect(waitingRule!.apply_rule_4).toBe(false)
    expect(waitingRule!.condition_event).toBeUndefined()
    expect(waitingRule!.reference).toBe('task_completed_at')
  })

  it('returns protective order hearing for po_file_with_court', () => {
    const rules = getDeadlineRulesForTask('po_file_with_court')
    expect(rules.length).toBeGreaterThanOrEqual(1)

    const poRule = rules.find((r) => r.deadline_key === 'po_full_hearing')
    expect(poRule).toBeDefined()
    expect(poRule!.offset_days).toBe(14)
    expect(poRule!.apply_rule_4).toBe(true)
    expect(poRule!.condition_event).toBeUndefined()
    expect(poRule!.reference).toBe('task_completed_at')
  })

  it('returns empty array for unknown task key', () => {
    const rules = getDeadlineRulesForTask('nonexistent_task_xyz')
    expect(rules).toEqual([])
  })

  it('returns empty array for welcome task', () => {
    const rules = getDeadlineRulesForTask('welcome')
    expect(rules).toEqual([])
  })

  it('returns 2 rules for divorce_file_with_court (service + waiting period)', () => {
    const rules = getDeadlineRulesForTask('divorce_file_with_court')
    expect(rules).toHaveLength(2)

    const keys = rules.map((r) => r.deadline_key)
    expect(keys).toContain('service_deadline')
    expect(keys).toContain('divorce_waiting_period')
  })
})
