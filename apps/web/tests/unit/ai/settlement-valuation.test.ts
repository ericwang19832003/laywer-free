import { describe, it, expect } from 'vitest'
import {
  settlementValuationSchema,
  buildSettlementValuationPrompt,
  SETTLEMENT_VALUATION_SYSTEM_PROMPT,
  buildStaticSettlementValuation,
} from '@/lib/ai/settlement-valuation'

describe('settlementValuationSchema', () => {
  it('validates a well-formed valuation', () => {
    const result = settlementValuationSchema.safeParse({
      low: 1000,
      mid: 5000,
      high: 10000,
      currency: 'USD',
      factors: ['Evidence strength', 'Defendant solvency'],
      batna: 'Proceed to trial with current evidence',
      watna: 'Judgment for defendant, pay court costs',
      disclaimer: 'These ranges are for negotiation thinking only',
    })
    expect(result.success).toBe(true)
  })

  it('rejects when low >= mid', () => {
    const result = settlementValuationSchema.safeParse({
      low: 5000,
      mid: 5000,
      high: 10000,
      currency: 'USD',
      factors: ['One factor'],
      batna: 'Try again',
      watna: 'Lose',
      disclaimer: 'Disclaimer here',
    })
    expect(result.success).toBe(false)
  })

  it('rejects when mid >= high', () => {
    const result = settlementValuationSchema.safeParse({
      low: 1000,
      mid: 10000,
      high: 8000,
      currency: 'USD',
      factors: ['Factor'],
      batna: 'BATNA',
      watna: 'WATNA',
      disclaimer: 'Disclaimer',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty factors array', () => {
    const result = settlementValuationSchema.safeParse({
      low: 1000,
      mid: 5000,
      high: 10000,
      currency: 'USD',
      factors: [],
      batna: 'BATNA',
      watna: 'WATNA',
      disclaimer: 'Disclaimer',
    })
    expect(result.success).toBe(false)
  })

  it('rejects more than 6 factors', () => {
    const result = settlementValuationSchema.safeParse({
      low: 1000,
      mid: 5000,
      high: 10000,
      currency: 'USD',
      factors: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
      batna: 'BATNA',
      watna: 'WATNA',
      disclaimer: 'Disclaimer',
    })
    expect(result.success).toBe(false)
  })
})

describe('buildSettlementValuationPrompt', () => {
  it('includes dispute_type, state, role, and overall_score', () => {
    const prompt = buildSettlementValuationPrompt({
      dispute_type: 'landlord_tenant',
      state: 'TX',
      role: 'plaintiff',
      case_name: 'Smith v. Jones',
      opposing_party: 'Jones',
      overall_score: 72,
      evidence_count: 5,
      tasks_completed: 8,
      upcoming_deadlines: 2,
    })
    expect(prompt).toContain('landlord_tenant')
    expect(prompt).toContain('TX')
    expect(prompt).toContain('plaintiff')
    expect(prompt).toContain('72')
  })
})

describe('SETTLEMENT_VALUATION_SYSTEM_PROMPT', () => {
  it('contains disclaimer language', () => {
    expect(SETTLEMENT_VALUATION_SYSTEM_PROMPT.toLowerCase()).toContain('disclaimer')
  })

  it('does not contain blocked phrases', () => {
    const lower = SETTLEMENT_VALUATION_SYSTEM_PROMPT.toLowerCase()
    expect(lower).not.toContain('you must')
    expect(lower).not.toContain('i recommend')
    expect(lower).not.toContain('guaranteed')
    expect(lower).not.toContain('winning')
    expect(lower).not.toContain('losing')
  })
})

describe('buildStaticSettlementValuation', () => {
  it('returns a valid static result with disclaimer', () => {
    const result = buildStaticSettlementValuation()
    expect(result.disclaimer).toBeTruthy()
    expect(result.currency).toBe('USD')
    expect(result.factors.length).toBeGreaterThanOrEqual(1)
    expect(result.batna).toBeTruthy()
    expect(result.watna).toBeTruthy()
  })

  it('passes schema validation', () => {
    const result = buildStaticSettlementValuation()
    expect(settlementValuationSchema.safeParse(result).success).toBe(true)
  })
})
