import { describe, it, expect } from 'vitest'
import {
  evaluateEscalations,
  daysUntil,
  isMessageSafe,
  BLOCKED_PHRASES,
} from '@/lib/rules/escalation-engine'
import type {
  Deadline,
  EscalationRule,
  ExistingEscalation,
  TaskEvent,
} from '@/lib/rules/escalation-engine'

// ── Seed rules (mirrors migration seed data) ──────────────────────

const ANSWER_RULES: EscalationRule[] = [
  {
    deadline_key: 'answer_deadline_confirmed',
    level: 1,
    offset_days: 7,
    condition_type: 'always',
    condition_key: null,
    message_template:
      'Your answer deadline is in {due_date}. Start preparing your response.',
  },
  {
    deadline_key: 'answer_deadline_confirmed',
    level: 2,
    offset_days: 3,
    condition_type: 'no_event',
    condition_key: 'answer_filed',
    message_template:
      'Your answer deadline is in {due_date}. No answer has been filed yet.',
  },
  {
    deadline_key: 'answer_deadline_confirmed',
    level: 3,
    offset_days: 1,
    condition_type: 'no_event',
    condition_key: 'answer_filed',
    message_template:
      'URGENT: Your answer deadline is tomorrow ({due_date}). Missing this deadline may result in a default judgment.',
  },
]

const DISCOVERY_RULES: EscalationRule[] = [
  {
    deadline_key: 'discovery_response_due_confirmed',
    level: 1,
    offset_days: 7,
    condition_type: 'always',
    condition_key: null,
    message_template:
      'Discovery responses are due in {due_date}. Review what you need to prepare.',
  },
  {
    deadline_key: 'discovery_response_due_confirmed',
    level: 2,
    offset_days: 3,
    condition_type: 'no_event',
    condition_key: 'discovery_response_uploaded',
    message_template:
      'Discovery responses are due in {due_date}. No responses have been uploaded yet.',
  },
  {
    deadline_key: 'discovery_response_due_confirmed',
    level: 3,
    offset_days: 1,
    condition_type: 'no_event',
    condition_key: 'discovery_response_uploaded',
    message_template:
      'URGENT: Discovery responses are due tomorrow ({due_date}). Prepare and upload your responses now.',
  },
]

const ALL_RULES = [...ANSWER_RULES, ...DISCOVERY_RULES]

// ── Helpers ──────────────────────────────────────────────────────

function makeDeadline(overrides: Partial<Deadline> = {}): Deadline {
  return {
    id: 'deadline-1',
    case_id: 'case-1',
    key: 'answer_deadline_confirmed',
    due_at: '2026-03-15T00:00:00Z',
    created_at: '2026-03-01T00:00:00Z',
    ...overrides,
  }
}

// ── isMessageSafe ────────────────────────────────────────────────

describe('isMessageSafe', () => {
  it('returns true for a clean message', () => {
    expect(isMessageSafe('Your answer deadline is in March 15, 2026.')).toBe(true)
  })

  it('returns true for an empty string', () => {
    expect(isMessageSafe('')).toBe(true)
  })

  it.each([
    ['you must', 'You must file your answer immediately'],
    ['file immediately', 'File immediately or face consequences'],
    ['sanctions', 'The court will impose sanctions on you'],
    ['legal penalty', 'You may face a legal penalty'],
    ['automatic judgment', 'This will result in automatic judgment'],
    ['guaranteed outcome', 'There is no guaranteed outcome'],
  ] as const)('returns false when message contains "%s"', (phrase, message) => {
    expect(isMessageSafe(message)).toBe(false)
  })

  it('detects blocked phrases case-insensitively', () => {
    expect(isMessageSafe('YOU MUST respond now')).toBe(false)
    expect(isMessageSafe('Legal Penalty warning')).toBe(false)
  })

  it('detects blocked phrases mid-sentence', () => {
    expect(isMessageSafe('Failure to act: you must respond by the deadline')).toBe(false)
  })

  it('does not false-positive on "default judgment"', () => {
    expect(
      isMessageSafe(
        'URGENT: Your answer deadline is tomorrow (March 15, 2026). Missing this deadline may result in a default judgment.'
      )
    ).toBe(true)
  })

  it('does not false-positive on standalone "must" without "you" prefix', () => {
    expect(isMessageSafe('All documents must be submitted before the deadline.')).toBe(true)
  })

  it('passes all 6 current seed templates', () => {
    const seedTemplates = [
      ...ANSWER_RULES.map((r) => r.message_template),
      ...DISCOVERY_RULES.map((r) => r.message_template),
    ]
    expect(seedTemplates).toHaveLength(6)
    seedTemplates.forEach((tpl) => {
      const rendered = tpl.replace('{due_date}', 'March 15, 2026')
      expect(isMessageSafe(rendered)).toBe(true)
    })
  })

  it('BLOCKED_PHRASES is frozen with 6 entries', () => {
    expect(BLOCKED_PHRASES).toHaveLength(6)
    expect(Object.isFrozen(BLOCKED_PHRASES)).toBe(true)
  })
})

// ── daysUntil ────────────────────────────────────────────────────

describe('daysUntil', () => {
  it('returns 7 for a deadline 7 days away', () => {
    const from = new Date('2026-03-08T12:00:00Z')
    const to = new Date('2026-03-15T00:00:00Z')
    expect(daysUntil(from, to)).toBe(7)
  })

  it('returns 0 for same-day', () => {
    const from = new Date('2026-03-15T06:00:00Z')
    const to = new Date('2026-03-15T23:00:00Z')
    expect(daysUntil(from, to)).toBe(0)
  })

  it('returns negative for past deadlines', () => {
    const from = new Date('2026-03-16T00:00:00Z')
    const to = new Date('2026-03-15T00:00:00Z')
    expect(daysUntil(from, to)).toBe(-1)
  })

  it('ignores time-of-day differences', () => {
    const from = new Date('2026-03-08T23:59:59Z')
    const to = new Date('2026-03-15T00:00:01Z')
    expect(daysUntil(from, to)).toBe(7)
  })
})

// ── evaluateEscalations ──────────────────────────────────────────

describe('evaluateEscalations', () => {
  // ── Basic triggering ──

  it('triggers level 1 at exactly 7 days before deadline', () => {
    const now = new Date('2026-03-08T12:00:00Z')
    const actions = evaluateEscalations({
      deadlines: [makeDeadline()],
      rules: ANSWER_RULES,
      existingEscalations: [],
      taskEvents: [],
      now,
    })

    expect(actions).toHaveLength(1)
    expect(actions[0].escalation_level).toBe(1)
    expect(actions[0].case_id).toBe('case-1')
    expect(actions[0].deadline_id).toBe('deadline-1')
    expect(actions[0].message).toContain('March 15, 2026')
  })

  it('triggers level 2 at 3 days when no answer_filed event', () => {
    const now = new Date('2026-03-12T12:00:00Z')
    const actions = evaluateEscalations({
      deadlines: [makeDeadline()],
      rules: ANSWER_RULES,
      existingEscalations: [],
      taskEvents: [],
      now,
    })

    expect(actions).toHaveLength(1)
    expect(actions[0].escalation_level).toBe(2)
  })

  it('triggers level 3 at 1 day when no answer_filed event', () => {
    const now = new Date('2026-03-14T08:00:00Z')
    const actions = evaluateEscalations({
      deadlines: [makeDeadline()],
      rules: ANSWER_RULES,
      existingEscalations: [],
      taskEvents: [],
      now,
    })

    expect(actions).toHaveLength(1)
    expect(actions[0].escalation_level).toBe(3)
    expect(actions[0].message).toContain('URGENT')
  })

  // ── Condition checks ──

  it('suppresses level 2 when answer_filed event exists after deadline creation', () => {
    const now = new Date('2026-03-12T12:00:00Z')
    const actions = evaluateEscalations({
      deadlines: [makeDeadline()],
      rules: ANSWER_RULES,
      existingEscalations: [],
      taskEvents: [
        {
          case_id: 'case-1',
          kind: 'answer_filed',
          created_at: '2026-03-05T00:00:00Z',
        },
      ],
      now,
    })

    expect(actions).toHaveLength(0)
  })

  it('ignores answer_filed event from before deadline creation', () => {
    const now = new Date('2026-03-12T12:00:00Z')
    const actions = evaluateEscalations({
      deadlines: [makeDeadline()],
      rules: ANSWER_RULES,
      existingEscalations: [],
      taskEvents: [
        {
          case_id: 'case-1',
          kind: 'answer_filed',
          created_at: '2026-02-15T00:00:00Z', // Before deadline created_at
        },
      ],
      now,
    })

    expect(actions).toHaveLength(1)
    expect(actions[0].escalation_level).toBe(2)
  })

  it('ignores events from a different case', () => {
    const now = new Date('2026-03-12T12:00:00Z')
    const actions = evaluateEscalations({
      deadlines: [makeDeadline()],
      rules: ANSWER_RULES,
      existingEscalations: [],
      taskEvents: [
        {
          case_id: 'other-case',
          kind: 'answer_filed',
          created_at: '2026-03-05T00:00:00Z',
        },
      ],
      now,
    })

    expect(actions).toHaveLength(1)
    expect(actions[0].escalation_level).toBe(2)
  })

  it('always triggers level 1 even when answer_filed exists', () => {
    const now = new Date('2026-03-08T12:00:00Z')
    const actions = evaluateEscalations({
      deadlines: [makeDeadline()],
      rules: ANSWER_RULES,
      existingEscalations: [],
      taskEvents: [
        {
          case_id: 'case-1',
          kind: 'answer_filed',
          created_at: '2026-03-05T00:00:00Z',
        },
      ],
      now,
    })

    expect(actions).toHaveLength(1)
    expect(actions[0].escalation_level).toBe(1)
  })

  // ── Deduplication ──

  it('prevents duplicate: skips level already triggered for same deadline', () => {
    const now = new Date('2026-03-08T12:00:00Z')
    const actions = evaluateEscalations({
      deadlines: [makeDeadline()],
      rules: ANSWER_RULES,
      existingEscalations: [
        { deadline_id: 'deadline-1', escalation_level: 1 },
      ],
      taskEvents: [],
      now,
    })

    expect(actions).toHaveLength(0)
  })

  it('allows same level on a different deadline', () => {
    const now = new Date('2026-03-08T12:00:00Z')
    const actions = evaluateEscalations({
      deadlines: [
        makeDeadline({ id: 'deadline-1' }),
        makeDeadline({ id: 'deadline-2' }),
      ],
      rules: ANSWER_RULES,
      existingEscalations: [
        { deadline_id: 'deadline-1', escalation_level: 1 },
      ],
      taskEvents: [],
      now,
    })

    expect(actions).toHaveLength(1)
    expect(actions[0].deadline_id).toBe('deadline-2')
  })

  // ── Edge cases ──

  it('returns empty for past deadlines', () => {
    const now = new Date('2026-03-20T00:00:00Z')
    const actions = evaluateEscalations({
      deadlines: [makeDeadline()],
      rules: ANSWER_RULES,
      existingEscalations: [],
      taskEvents: [],
      now,
    })

    expect(actions).toHaveLength(0)
  })

  it('returns empty when no rules match the deadline key', () => {
    const now = new Date('2026-03-08T12:00:00Z')
    const actions = evaluateEscalations({
      deadlines: [makeDeadline({ key: 'unknown_deadline_type' })],
      rules: ANSWER_RULES,
      existingEscalations: [],
      taskEvents: [],
      now,
    })

    expect(actions).toHaveLength(0)
  })

  it('returns empty when offset does not match any rule', () => {
    const now = new Date('2026-03-10T12:00:00Z') // 5 days out — no rule
    const actions = evaluateEscalations({
      deadlines: [makeDeadline()],
      rules: ANSWER_RULES,
      existingEscalations: [],
      taskEvents: [],
      now,
    })

    expect(actions).toHaveLength(0)
  })

  it('returns empty for empty deadlines list', () => {
    const actions = evaluateEscalations({
      deadlines: [],
      rules: ANSWER_RULES,
      existingEscalations: [],
      taskEvents: [],
    })

    expect(actions).toHaveLength(0)
  })

  // ── Multiple deadline types ──

  it('triggers escalations across different deadline types', () => {
    const now = new Date('2026-03-08T12:00:00Z') // 7 days before Mar 15
    const actions = evaluateEscalations({
      deadlines: [
        makeDeadline({ id: 'dl-answer', key: 'answer_deadline_confirmed' }),
        makeDeadline({
          id: 'dl-discovery',
          key: 'discovery_response_due_confirmed',
        }),
      ],
      rules: ALL_RULES,
      existingEscalations: [],
      taskEvents: [],
      now,
    })

    expect(actions).toHaveLength(2)
    expect(actions.map((a) => a.deadline_id).sort()).toEqual([
      'dl-answer',
      'dl-discovery',
    ])
    expect(actions.every((a) => a.escalation_level === 1)).toBe(true)
  })

  // ── status_not_changed condition ──

  it('triggers when condition_type is status_not_changed and no matching event', () => {
    const rules: EscalationRule[] = [
      {
        deadline_key: 'answer_deadline_confirmed',
        level: 2,
        offset_days: 3,
        condition_type: 'status_not_changed',
        condition_key: 'answer_status_updated',
        message_template: 'Status unchanged. {due_date} approaching.',
      },
    ]

    const now = new Date('2026-03-12T12:00:00Z')
    const actions = evaluateEscalations({
      deadlines: [makeDeadline()],
      rules,
      existingEscalations: [],
      taskEvents: [],
      now,
    })

    expect(actions).toHaveLength(1)
  })

  it('suppresses when condition_type is status_not_changed and matching event found', () => {
    const rules: EscalationRule[] = [
      {
        deadline_key: 'answer_deadline_confirmed',
        level: 2,
        offset_days: 3,
        condition_type: 'status_not_changed',
        condition_key: 'answer_status_updated',
        message_template: 'Status unchanged. {due_date} approaching.',
      },
    ]

    const now = new Date('2026-03-12T12:00:00Z')
    const actions = evaluateEscalations({
      deadlines: [makeDeadline()],
      rules,
      existingEscalations: [],
      taskEvents: [
        {
          case_id: 'case-1',
          kind: 'answer_status_updated',
          created_at: '2026-03-05T00:00:00Z',
        },
      ],
      now,
    })

    expect(actions).toHaveLength(0)
  })

  // ── Message rendering ──

  it('renders {due_date} placeholder with formatted date', () => {
    const now = new Date('2026-03-08T12:00:00Z')
    const actions = evaluateEscalations({
      deadlines: [makeDeadline({ due_at: '2026-03-15T00:00:00Z' })],
      rules: ANSWER_RULES,
      existingEscalations: [],
      taskEvents: [],
      now,
    })

    expect(actions[0].message).toBe(
      'Your answer deadline is in March 15, 2026. Start preparing your response.'
    )
  })

  it('sets triggered_at to the current timestamp', () => {
    const now = new Date('2026-03-08T12:00:00Z')
    const actions = evaluateEscalations({
      deadlines: [makeDeadline()],
      rules: ANSWER_RULES,
      existingEscalations: [],
      taskEvents: [],
      now,
    })

    expect(actions[0].triggered_at).toBe('2026-03-08T12:00:00.000Z')
  })

  // ── Safety validation integration ──

  it('filters out unsafe messages and keeps safe ones', () => {
    const now = new Date('2026-03-08T12:00:00Z')
    const unsafeRule: EscalationRule = {
      deadline_key: 'answer_deadline_confirmed',
      level: 4,
      offset_days: 7,
      condition_type: 'always',
      condition_key: null,
      message_template: 'You must file immediately or face sanctions.',
    }

    const actions = evaluateEscalations({
      deadlines: [makeDeadline()],
      rules: [...ANSWER_RULES, unsafeRule],
      existingEscalations: [],
      taskEvents: [],
      now,
    })

    // Only the safe level-1 rule fires at 7 days, unsafe level-4 is filtered
    expect(actions).toHaveLength(1)
    expect(actions[0].escalation_level).toBe(1)
  })

  it('returns empty array when all matching rules produce unsafe messages', () => {
    const now = new Date('2026-03-08T12:00:00Z')
    const unsafeRules: EscalationRule[] = [
      {
        deadline_key: 'answer_deadline_confirmed',
        level: 1,
        offset_days: 7,
        condition_type: 'always',
        condition_key: null,
        message_template: 'You must respond or face automatic judgment.',
      },
      {
        deadline_key: 'answer_deadline_confirmed',
        level: 2,
        offset_days: 7,
        condition_type: 'always',
        condition_key: null,
        message_template: 'Sanctions will be imposed. File immediately.',
      },
    ]

    const actions = evaluateEscalations({
      deadlines: [makeDeadline()],
      rules: unsafeRules,
      existingEscalations: [],
      taskEvents: [],
      now,
    })

    expect(actions).toHaveLength(0)
  })
})
