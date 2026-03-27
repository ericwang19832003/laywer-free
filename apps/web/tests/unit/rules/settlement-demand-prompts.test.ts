import { describe, it, expect } from 'vitest'
import {
  buildSettlementDemandPrompt,
  settlementDemandFactsSchema,
  settlementDemandConfig,
  type SettlementDemandFacts,
} from '@lawyer-free/shared/motions/configs/settlement-demand'

describe('buildSettlementDemandPrompt', () => {
  const baseFacts: SettlementDemandFacts = {
    your_info: {
      full_name: 'Jane Smith',
      address: '100 Main St',
      city: 'Houston',
      state: 'TX',
      zip: '77001',
    },
    opposing_parties: [{ full_name: 'ACME Corp', address: '200 Corp Ave' }],
    opposing_attorney: {
      name: 'John Lawyer',
      firm: 'Lawyer & Associates',
      address: '300 Legal Blvd, Houston, TX 77002',
    },
    incident_summary:
      'On March 15, 2025, ACME Corp delivered defective products that caused property damage to my business.',
    liability_basis:
      'ACME Corp is liable under breach of warranty and strict product liability theories.',
    damages_breakdown: [
      {
        category: 'Property Damage',
        amount: 8000,
        description: 'Cost to repair warehouse shelving damaged by defective product.',
      },
      {
        category: 'Lost Revenue',
        amount: 5000,
        description: 'Business closure for 5 days during repairs.',
      },
      {
        category: 'Replacement Costs',
        amount: 2000,
      },
    ],
    demand_amount: 20000,
    response_deadline_days: 30,
  }

  it('returns { system, user } object', () => {
    const result = buildSettlementDemandPrompt(baseFacts)
    expect(result).toHaveProperty('system')
    expect(result).toHaveProperty('user')
  })

  it('system includes DRAFT disclaimer', () => {
    const result = buildSettlementDemandPrompt(baseFacts)
    expect(result.system).toContain('DRAFT')
    expect(result.system).toContain('NOT LEGAL ADVICE')
  })

  it('system specifies LETTER format, not court filing', () => {
    const result = buildSettlementDemandPrompt(baseFacts)
    expect(result.system).toContain('LETTER')
  })

  it('user includes opposing attorney info when provided', () => {
    const result = buildSettlementDemandPrompt(baseFacts)
    expect(result.user).toContain('John Lawyer')
    expect(result.user).toContain('Lawyer & Associates')
  })

  it('user includes incident summary', () => {
    const result = buildSettlementDemandPrompt(baseFacts)
    expect(result.user).toContain(
      'ACME Corp delivered defective products'
    )
  })

  it('user includes damages breakdown with itemized amounts', () => {
    const result = buildSettlementDemandPrompt(baseFacts)
    expect(result.user).toContain('Property Damage')
    expect(result.user).toContain('8000')
    expect(result.user).toContain('Lost Revenue')
    expect(result.user).toContain('5000')
  })

  it('user includes total demand amount', () => {
    const result = buildSettlementDemandPrompt(baseFacts)
    expect(result.user).toContain('20000')
  })

  it('user includes response deadline', () => {
    const result = buildSettlementDemandPrompt(baseFacts)
    expect(result.user).toContain('30')
  })

  it('user omits attorney section when not provided', () => {
    const { opposing_attorney, ...factsWithoutAttorney } = baseFacts
    const result = buildSettlementDemandPrompt(
      factsWithoutAttorney as SettlementDemandFacts
    )
    expect(result.user).not.toContain('John Lawyer')
  })

  it('user includes party names', () => {
    const result = buildSettlementDemandPrompt(baseFacts)
    expect(result.user).toContain('Jane Smith')
    expect(result.user).toContain('ACME Corp')
  })
})

describe('settlementDemandFactsSchema', () => {
  const validFacts = {
    your_info: { full_name: 'Jane Smith' },
    opposing_parties: [{ full_name: 'ACME Corp' }],
    incident_summary:
      'Defendant delivered defective products that caused property damage.',
    liability_basis:
      'Defendant is liable under breach of warranty and product liability.',
    damages_breakdown: [
      { category: 'Property Damage', amount: 8000 },
    ],
    demand_amount: 20000,
    response_deadline_days: 30,
  }

  it('accepts valid facts', () => {
    const result = settlementDemandFactsSchema.safeParse(validFacts)
    expect(result.success).toBe(true)
  })

  it('rejects empty damages_breakdown array', () => {
    const result = settlementDemandFactsSchema.safeParse({
      ...validFacts,
      damages_breakdown: [],
    })
    expect(result.success).toBe(false)
  })

  it('rejects non-positive demand_amount', () => {
    const result = settlementDemandFactsSchema.safeParse({
      ...validFacts,
      demand_amount: -100,
    })
    expect(result.success).toBe(false)
  })
})

describe('settlementDemandConfig', () => {
  it('has correct key', () => {
    expect(settlementDemandConfig.key).toBe('settlement_demand')
  })

  it('has correct category', () => {
    expect(settlementDemandConfig.category).toBe('pretrial')
  })

  it('has fields array', () => {
    expect(Array.isArray(settlementDemandConfig.fields)).toBe(true)
    expect(settlementDemandConfig.fields.length).toBeGreaterThan(0)
  })

  it('has buildPrompt function', () => {
    expect(typeof settlementDemandConfig.buildPrompt).toBe('function')
  })

  it('has title and description', () => {
    expect(settlementDemandConfig.title).toBe('Settlement Demand Letter')
    expect(settlementDemandConfig.description).toBeTruthy()
  })

  it('has reassurance text', () => {
    expect(settlementDemandConfig.reassurance).toBeTruthy()
  })
})
