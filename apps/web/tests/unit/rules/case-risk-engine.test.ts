import { describe, it, expect } from 'vitest'
import {
  calculateCaseRisk,
  type RiskInput,
} from '@/lib/rules/case-risk-engine'

// ── Helpers ──────────────────────────────────────────────────────

function makeInput(overrides: Partial<RiskInput> = {}): RiskInput {
  return {
    deadlines: [],
    taskEvents: [],
    evidenceCount: 0,
    exhibitSets: [],
    exhibitCount: 0,
    trialBinders: [],
    discoveryResponseDeadlines: [],
    ...overrides,
  }
}

const NOW = new Date('2026-03-15T12:00:00Z')

// ── Deadline Risk ────────────────────────────────────────────────

describe('calculateCaseRisk — deadline risk', () => {
  it('scores +40 for an overdue deadline', () => {
    const result = calculateCaseRisk(
      makeInput({
        deadlines: [{ key: 'answer_deadline_confirmed', due_at: '2026-03-10T00:00:00Z' }],
      }),
      NOW
    )
    expect(result.deadline_risk).toBe(40)
    expect(result.breakdown).toContainEqual(
      expect.objectContaining({ rule: 'deadline_overdue', points: 40 })
    )
  })

  it('scores +20 for a deadline within 3 days', () => {
    const result = calculateCaseRisk(
      makeInput({
        deadlines: [{ key: 'answer_deadline_confirmed', due_at: '2026-03-17T00:00:00Z' }],
      }),
      NOW
    )
    expect(result.deadline_risk).toBe(20)
  })

  it('scores +10 for a deadline within 7 days', () => {
    const result = calculateCaseRisk(
      makeInput({
        deadlines: [{ key: 'answer_deadline_confirmed', due_at: '2026-03-20T00:00:00Z' }],
      }),
      NOW
    )
    expect(result.deadline_risk).toBe(10)
  })

  it('scores 0 for a deadline more than 7 days away', () => {
    const result = calculateCaseRisk(
      makeInput({
        deadlines: [{ key: 'answer_deadline_confirmed', due_at: '2026-03-30T00:00:00Z' }],
      }),
      NOW
    )
    expect(result.deadline_risk).toBe(0)
  })

  it('scores +20 for a deadline due today (day 0 boundary)', () => {
    const result = calculateCaseRisk(
      makeInput({
        deadlines: [{ key: 'answer_deadline_confirmed', due_at: '2026-03-15T23:59:00Z' }],
      }),
      NOW
    )
    expect(result.deadline_risk).toBe(20)
  })

  it('takes max across multiple deadlines (not cumulative)', () => {
    const result = calculateCaseRisk(
      makeInput({
        deadlines: [
          { key: 'answer_deadline_confirmed', due_at: '2026-03-10T00:00:00Z' },
          { key: 'discovery_deadline', due_at: '2026-03-17T00:00:00Z' },
        ],
      }),
      NOW
    )
    expect(result.deadline_risk).toBe(40)
  })
})

// ── Response Risk ────────────────────────────────────────────────

describe('calculateCaseRisk — response risk', () => {
  it('scores +50 for overdue discovery response with no response', () => {
    const result = calculateCaseRisk(
      makeInput({
        discoveryResponseDeadlines: [
          { due_at: '2026-03-10T00:00:00Z', hasResponse: false },
        ],
      }),
      NOW
    )
    expect(result.response_risk).toBe(50)
  })

  it('scores 0 for overdue discovery response when response exists', () => {
    const result = calculateCaseRisk(
      makeInput({
        discoveryResponseDeadlines: [
          { due_at: '2026-03-10T00:00:00Z', hasResponse: true },
        ],
      }),
      NOW
    )
    expect(result.response_risk).toBe(0)
  })

  it('scores +30 for discovery response due within 3 days with no response', () => {
    const result = calculateCaseRisk(
      makeInput({
        discoveryResponseDeadlines: [
          { due_at: '2026-03-17T00:00:00Z', hasResponse: false },
        ],
      }),
      NOW
    )
    expect(result.response_risk).toBe(30)
  })

  it('scores 0 for discovery response due in more than 3 days', () => {
    const result = calculateCaseRisk(
      makeInput({
        discoveryResponseDeadlines: [
          { due_at: '2026-03-25T00:00:00Z', hasResponse: false },
        ],
      }),
      NOW
    )
    expect(result.response_risk).toBe(0)
  })

  it('takes max across multiple discovery response deadlines', () => {
    const result = calculateCaseRisk(
      makeInput({
        discoveryResponseDeadlines: [
          { due_at: '2026-03-10T00:00:00Z', hasResponse: false },
          { due_at: '2026-03-17T00:00:00Z', hasResponse: false },
        ],
      }),
      NOW
    )
    expect(result.response_risk).toBe(50)
  })
})

// ── Evidence Risk ────────────────────────────────────────────────

describe('calculateCaseRisk — evidence risk', () => {
  it('scores +15 when evidence count < 3', () => {
    const result = calculateCaseRisk(
      makeInput({ evidenceCount: 2 }),
      NOW
    )
    expect(result.evidence_risk).toBeGreaterThanOrEqual(15)
    expect(result.breakdown).toContainEqual(
      expect.objectContaining({ rule: 'low_evidence_count', points: 15 })
    )
  })

  it('scores +10 when no exhibit set', () => {
    const result = calculateCaseRisk(
      makeInput({ exhibitSets: [] }),
      NOW
    )
    expect(result.breakdown).toContainEqual(
      expect.objectContaining({ rule: 'no_exhibit_set', points: 10 })
    )
  })

  it('scores +10 when exhibit count < 2', () => {
    const result = calculateCaseRisk(
      makeInput({ exhibitSets: [{ id: 'set-1' }], exhibitCount: 1 }),
      NOW
    )
    expect(result.breakdown).toContainEqual(
      expect.objectContaining({ rule: 'low_exhibit_count', points: 10 })
    )
  })

  it('scores +5 when no trial binder', () => {
    const result = calculateCaseRisk(
      makeInput({ trialBinders: [] }),
      NOW
    )
    expect(result.breakdown).toContainEqual(
      expect.objectContaining({ rule: 'no_trial_binder', points: 5 })
    )
  })

  it('scores 0 evidence risk when fully prepared', () => {
    const result = calculateCaseRisk(
      makeInput({
        evidenceCount: 5,
        exhibitSets: [{ id: 'set-1' }],
        exhibitCount: 3,
        trialBinders: [{ id: 'binder-1' }],
      }),
      NOW
    )
    expect(result.evidence_risk).toBe(0)
  })

  it('accumulates all evidence sub-risks (max 40)', () => {
    const result = calculateCaseRisk(
      makeInput({
        evidenceCount: 0,
        exhibitSets: [],
        exhibitCount: 0,
        trialBinders: [],
      }),
      NOW
    )
    expect(result.evidence_risk).toBe(40)
  })
})

// ── Activity Risk ────────────────────────────────────────────────

describe('calculateCaseRisk — activity risk', () => {
  it('scores +40 when no task event in 30 days', () => {
    const result = calculateCaseRisk(
      makeInput({
        taskEvents: [{ created_at: '2026-02-01T00:00:00Z' }],
      }),
      NOW
    )
    expect(result.activity_risk).toBe(40)
  })

  it('scores +20 when no task event in 14 days (but within 30)', () => {
    const result = calculateCaseRisk(
      makeInput({
        taskEvents: [{ created_at: '2026-02-25T00:00:00Z' }],
      }),
      NOW
    )
    expect(result.activity_risk).toBe(20)
  })

  it('scores 0 when recent task event within 14 days', () => {
    const result = calculateCaseRisk(
      makeInput({
        taskEvents: [{ created_at: '2026-03-10T00:00:00Z' }],
      }),
      NOW
    )
    expect(result.activity_risk).toBe(0)
  })

  it('scores +40 when no task events at all', () => {
    const result = calculateCaseRisk(
      makeInput({ taskEvents: [] }),
      NOW
    )
    expect(result.activity_risk).toBe(40)
  })

  it('scores +20 at exactly 14 days boundary', () => {
    const result = calculateCaseRisk(
      makeInput({
        taskEvents: [{ created_at: '2026-03-01T12:00:00Z' }], // exactly 14 days before NOW
      }),
      NOW
    )
    expect(result.activity_risk).toBe(20)
  })

  it('scores +40 at exactly 30 days boundary', () => {
    const result = calculateCaseRisk(
      makeInput({
        taskEvents: [{ created_at: '2026-02-13T12:00:00Z' }], // exactly 30 days before NOW
      }),
      NOW
    )
    expect(result.activity_risk).toBe(40)
  })

  it('uses the most recent task event', () => {
    const result = calculateCaseRisk(
      makeInput({
        taskEvents: [
          { created_at: '2026-01-01T00:00:00Z' },
          { created_at: '2026-03-14T00:00:00Z' },
        ],
      }),
      NOW
    )
    expect(result.activity_risk).toBe(0)
  })
})

// ── Overall Score & Risk Level ───────────────────────────────────

describe('calculateCaseRisk — overall score & risk level', () => {
  it('computes overall_score = 100 when no risks', () => {
    const result = calculateCaseRisk(
      makeInput({
        evidenceCount: 5,
        exhibitSets: [{ id: 'set-1' }],
        exhibitCount: 3,
        trialBinders: [{ id: 'binder-1' }],
        taskEvents: [{ created_at: '2026-03-14T00:00:00Z' }],
      }),
      NOW
    )
    expect(result.overall_score).toBe(100)
    expect(result.risk_level).toBe('low')
  })

  it('clamps overall_score to 0 minimum', () => {
    const result = calculateCaseRisk(
      makeInput({
        deadlines: [{ key: 'x', due_at: '2026-03-01T00:00:00Z' }],
        discoveryResponseDeadlines: [{ due_at: '2026-03-01T00:00:00Z', hasResponse: false }],
        evidenceCount: 0,
        exhibitSets: [],
        exhibitCount: 0,
        trialBinders: [],
        taskEvents: [],
      }),
      NOW
    )
    expect(result.overall_score).toBe(0)
    expect(result.risk_level).toBe('high')
  })

  it('maps score >= 80 to "low"', () => {
    const result = calculateCaseRisk(
      makeInput({
        evidenceCount: 5,
        exhibitSets: [{ id: 'set-1' }],
        exhibitCount: 3,
        trialBinders: [{ id: 'binder-1' }],
        taskEvents: [{ created_at: '2026-03-14T00:00:00Z' }],
        deadlines: [{ key: 'x', due_at: '2026-03-20T00:00:00Z' }],
      }),
      NOW
    )
    expect(result.overall_score).toBe(90)
    expect(result.risk_level).toBe('low')
  })

  it('maps score 60-79 to "moderate"', () => {
    const result = calculateCaseRisk(
      makeInput({
        evidenceCount: 5,
        exhibitSets: [{ id: 'set-1' }],
        exhibitCount: 3,
        trialBinders: [{ id: 'binder-1' }],
        taskEvents: [{ created_at: '2026-03-14T00:00:00Z' }],
        deadlines: [{ key: 'x', due_at: '2026-03-10T00:00:00Z' }],
      }),
      NOW
    )
    expect(result.overall_score).toBe(60)
    expect(result.risk_level).toBe('moderate')
  })

  it('maps score 40-59 to "elevated"', () => {
    const result = calculateCaseRisk(
      makeInput({
        evidenceCount: 5,
        exhibitSets: [{ id: 'set-1' }],
        exhibitCount: 3,
        trialBinders: [{ id: 'binder-1' }],
        taskEvents: [{ created_at: '2026-03-14T00:00:00Z' }],
        discoveryResponseDeadlines: [{ due_at: '2026-03-10T00:00:00Z', hasResponse: false }],
      }),
      NOW
    )
    expect(result.overall_score).toBe(50)
    expect(result.risk_level).toBe('elevated')
  })

  it('maps score < 40 to "high"', () => {
    const result = calculateCaseRisk(
      makeInput({
        evidenceCount: 0,
        exhibitSets: [],
        exhibitCount: 0,
        trialBinders: [],
        taskEvents: [],
      }),
      NOW
    )
    expect(result.overall_score).toBe(20)
    expect(result.risk_level).toBe('high')
  })
})

// ── Determinism ──────────────────────────────────────────────────

describe('calculateCaseRisk — determinism', () => {
  it('returns identical results for identical inputs', () => {
    const input = makeInput({
      deadlines: [{ key: 'x', due_at: '2026-03-17T00:00:00Z' }],
      discoveryResponseDeadlines: [{ due_at: '2026-03-17T00:00:00Z', hasResponse: false }],
      evidenceCount: 2,
      exhibitSets: [{ id: 'set-1' }],
      exhibitCount: 1,
      trialBinders: [],
      taskEvents: [{ created_at: '2026-03-10T00:00:00Z' }],
    })

    const result1 = calculateCaseRisk(input, NOW)
    const result2 = calculateCaseRisk(input, NOW)

    expect(result1).toEqual(result2)
  })

  it('defaults now to current time when not provided', () => {
    const input = makeInput()
    const result = calculateCaseRisk(input)
    expect(result.overall_score).toBeGreaterThanOrEqual(0)
    expect(result.overall_score).toBeLessThanOrEqual(100)
  })
})
