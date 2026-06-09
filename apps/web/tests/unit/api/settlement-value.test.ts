import { describe, it, expect } from 'vitest'
import {
  buildSettlementValuationPrompt,
  settlementValuationSchema,
  SETTLEMENT_VALUATION_SYSTEM_PROMPT,
  buildStaticSettlementValuation,
} from '@/lib/ai/settlement-valuation'

// ---------------------------------------------------------------------------
// buildSettlementValuationPrompt
// ---------------------------------------------------------------------------

describe('buildSettlementValuationPrompt', () => {
  const base = {
    dispute_type: 'breach-of-contract',
    state: 'TX',
    role: 'plaintiff',
    case_name: 'Smith v. Acme',
    opposing_party: 'Acme Corp',
    overall_score: 72,
    evidence_count: 5,
    tasks_completed: 3,
    upcoming_deadlines: 2,
  }

  it('includes dispute_type in the output', () => {
    const prompt = buildSettlementValuationPrompt(base)
    expect(prompt).toContain('breach-of-contract')
  })

  it('includes state in the output', () => {
    const prompt = buildSettlementValuationPrompt(base)
    expect(prompt).toContain('TX')
  })

  it('includes role in the output', () => {
    const prompt = buildSettlementValuationPrompt(base)
    expect(prompt).toContain('plaintiff')
  })

  it('includes overall_score in the output', () => {
    const prompt = buildSettlementValuationPrompt(base)
    expect(prompt).toContain('72')
  })

  it('includes evidence_count in the output', () => {
    const prompt = buildSettlementValuationPrompt(base)
    expect(prompt).toContain('5')
  })

  it('includes tasks_completed in the output', () => {
    const prompt = buildSettlementValuationPrompt(base)
    expect(prompt).toContain('3')
  })

  it('includes upcoming_deadlines in the output', () => {
    const prompt = buildSettlementValuationPrompt(base)
    expect(prompt).toContain('2')
  })

  it('uses fallback labels when fields are null', () => {
    const prompt = buildSettlementValuationPrompt({
      ...base,
      dispute_type: null,
      state: null,
      role: null,
      case_name: null,
      opposing_party: null,
    })
    expect(prompt).toContain('general')
    expect(prompt).toContain('unknown')
    expect(prompt).toContain('Unnamed case')
    expect(prompt).toContain('Opposing party')
  })
})

// ---------------------------------------------------------------------------
// settlementValuationSchema
// ---------------------------------------------------------------------------

describe('settlementValuationSchema', () => {
  const valid = {
    low: 1000,
    mid: 5000,
    high: 10000,
    currency: 'USD',
    factors: ['Strong evidence', 'Defendant has deep pockets'],
    batna: 'Continue to trial',
    watna: 'Lose at trial with no recovery',
    disclaimer: 'These ranges are illustrative only and are not legal advice.',
  }

  it('accepts a fully valid object', () => {
    const result = settlementValuationSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  it('rejects when low >= mid', () => {
    const result = settlementValuationSchema.safeParse({ ...valid, low: 5000, mid: 5000 })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages.some((m) => m.includes('low') || m.includes('mid'))).toBe(true)
    }
  })

  it('rejects when mid >= high', () => {
    const result = settlementValuationSchema.safeParse({ ...valid, mid: 10000, high: 10000 })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages.some((m) => m.includes('mid') || m.includes('high'))).toBe(true)
    }
  })

  it('rejects when factors array has more than 6 items', () => {
    const result = settlementValuationSchema.safeParse({
      ...valid,
      factors: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
    })
    expect(result.success).toBe(false)
  })

  it('rejects when factors array is empty', () => {
    const result = settlementValuationSchema.safeParse({ ...valid, factors: [] })
    expect(result.success).toBe(false)
  })

  it('rejects when currency is not USD', () => {
    const result = settlementValuationSchema.safeParse({ ...valid, currency: 'EUR' })
    expect(result.success).toBe(false)
  })

  it('requires a disclaimer field', () => {
    const { disclaimer: _omit, ...withoutDisclaimer } = valid
    const result = settlementValuationSchema.safeParse(withoutDisclaimer)
    expect(result.success).toBe(false)
  })

  it('accepts exactly 6 factors (upper bound)', () => {
    const result = settlementValuationSchema.safeParse({
      ...valid,
      factors: ['a', 'b', 'c', 'd', 'e', 'f'],
    })
    expect(result.success).toBe(true)
  })

  it('accepts exactly 1 factor (lower bound)', () => {
    const result = settlementValuationSchema.safeParse({
      ...valid,
      factors: ['Only factor'],
    })
    expect(result.success).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// SETTLEMENT_VALUATION_SYSTEM_PROMPT
// ---------------------------------------------------------------------------

describe('SETTLEMENT_VALUATION_SYSTEM_PROMPT', () => {
  it('contains the word "disclaimer"', () => {
    expect(SETTLEMENT_VALUATION_SYSTEM_PROMPT.toLowerCase()).toContain('disclaimer')
  })

  it('contains negotiation-related language', () => {
    expect(SETTLEMENT_VALUATION_SYSTEM_PROMPT.toLowerCase()).toContain('settlement')
  })

  it('does not contain prohibited predictive phrases like "you will win"', () => {
    expect(SETTLEMENT_VALUATION_SYSTEM_PROMPT.toLowerCase()).not.toContain('you will win')
  })

  it('does not contain affirmative phrases like "I guarantee"', () => {
    expect(SETTLEMENT_VALUATION_SYSTEM_PROMPT.toLowerCase()).not.toContain('i guarantee')
  })

  it('mentions BATNA', () => {
    expect(SETTLEMENT_VALUATION_SYSTEM_PROMPT).toContain('BATNA')
  })

  it('mentions WATNA', () => {
    expect(SETTLEMENT_VALUATION_SYSTEM_PROMPT).toContain('WATNA')
  })

  it('instructs to respond with JSON', () => {
    expect(SETTLEMENT_VALUATION_SYSTEM_PROMPT.toLowerCase()).toContain('json')
  })
})

// ---------------------------------------------------------------------------
// buildStaticSettlementValuation
// ---------------------------------------------------------------------------

describe('buildStaticSettlementValuation', () => {
  it('returns an object that passes the schema', () => {
    const result = buildStaticSettlementValuation()
    const parsed = settlementValuationSchema.safeParse(result)
    expect(parsed.success).toBe(true)
  })

  it('has currency USD', () => {
    expect(buildStaticSettlementValuation().currency).toBe('USD')
  })

  it('has a non-empty disclaimer', () => {
    const { disclaimer } = buildStaticSettlementValuation()
    expect(typeof disclaimer).toBe('string')
    expect(disclaimer.length).toBeGreaterThan(0)
  })

  it('has at least one factor', () => {
    const { factors } = buildStaticSettlementValuation()
    expect(factors.length).toBeGreaterThanOrEqual(1)
  })

  it('satisfies low < mid < high', () => {
    const { low, mid, high } = buildStaticSettlementValuation()
    expect(low).toBeLessThan(mid)
    expect(mid).toBeLessThan(high)
  })

  it('has non-empty batna and watna', () => {
    const { batna, watna } = buildStaticSettlementValuation()
    expect(batna.length).toBeGreaterThan(0)
    expect(watna.length).toBeGreaterThan(0)
  })
})
