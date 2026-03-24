import { describe, it, expect } from 'vitest'
import {
  buildPiSettlementPrompt,
  piSettlementFactsSchema,
  type PiSettlementFacts,
} from '@/lib/rules/pi-settlement-prompts'

function makeFacts(overrides: Partial<PiSettlementFacts> = {}): PiSettlementFacts {
  return piSettlementFactsSchema.parse({
    your_info: { full_name: 'Jane Doe', address: '123 Main St', city: 'Austin', state: 'TX', zip: '78701' },
    defendant_info: { full_name: 'John Smith', address: '456 Oak Ave', city: 'Austin', state: 'TX', zip: '78702' },
    insurance_carrier: 'State Farm Insurance',
    settlement_amount: 25000,
    incident_date: '2025-06-15',
    incident_description: 'Motor vehicle accident at I-35 and 51st Street resulting in personal injuries to plaintiff.',
    county: 'Travis',
    include_medical_liens_release: true,
    include_confidentiality: true,
    ...overrides,
  })
}

describe('piSettlementFactsSchema', () => {
  it('accepts valid facts', () => {
    const result = piSettlementFactsSchema.safeParse({
      your_info: { full_name: 'Jane Doe', address: '123 Main St', city: 'Austin', state: 'TX', zip: '78701' },
      defendant_info: { full_name: 'John Smith', address: '456 Oak Ave', city: 'Austin', state: 'TX', zip: '78702' },
      insurance_carrier: 'State Farm Insurance',
      settlement_amount: 25000,
      incident_date: '2025-06-15',
      incident_description: 'Motor vehicle accident at I-35 and 51st Street resulting in personal injuries to plaintiff.',
      county: 'Travis',
      include_medical_liens_release: true,
      include_confidentiality: true,
    })
    expect(result.success).toBe(true)
  })

  it('rejects zero settlement_amount', () => {
    const result = piSettlementFactsSchema.safeParse({
      your_info: { full_name: 'Jane Doe' },
      defendant_info: { full_name: 'John Smith' },
      settlement_amount: 0,
      incident_date: '2025-06-15',
      incident_description: 'Motor vehicle accident at I-35 and 51st Street resulting in personal injuries.',
      include_medical_liens_release: true,
      include_confidentiality: false,
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing incident_date', () => {
    const result = piSettlementFactsSchema.safeParse({
      your_info: { full_name: 'Jane Doe' },
      defendant_info: { full_name: 'John Smith' },
      settlement_amount: 25000,
      incident_description: 'Motor vehicle accident at I-35 and 51st Street resulting in personal injuries.',
      include_medical_liens_release: true,
      include_confidentiality: false,
    })
    expect(result.success).toBe(false)
  })
})

describe('buildPiSettlementPrompt', () => {
  it('returns system and user strings', () => {
    const result = buildPiSettlementPrompt(makeFacts())
    expect(typeof result.system).toBe('string')
    expect(typeof result.user).toBe('string')
    expect(result.system.length).toBeGreaterThan(0)
    expect(result.user.length).toBeGreaterThan(0)
  })

  it('system includes DRAFT disclaimer', () => {
    const result = buildPiSettlementPrompt(makeFacts())
    expect(result.system).toContain('DRAFT')
  })

  it('system includes SETTLEMENT AGREEMENT AND RELEASE', () => {
    const result = buildPiSettlementPrompt(makeFacts())
    expect(result.system).toContain('SETTLEMENT AGREEMENT AND RELEASE')
  })

  it('system includes RELEASE OF CLAIMS', () => {
    const result = buildPiSettlementPrompt(makeFacts())
    expect(result.system).toContain('RELEASE OF CLAIMS')
  })

  it('system includes GOVERNING LAW', () => {
    const result = buildPiSettlementPrompt(makeFacts())
    expect(result.system).toContain('GOVERNING LAW')
  })

  it('system includes annotations instructions', () => {
    const result = buildPiSettlementPrompt(makeFacts())
    expect(result.system).toContain('---ANNOTATIONS---')
  })

  it('user includes settlement amount', () => {
    const result = buildPiSettlementPrompt(makeFacts())
    expect(result.user).toMatch(/25[,.]?000/)
  })

  it('user includes plaintiff and defendant names', () => {
    const result = buildPiSettlementPrompt(makeFacts())
    expect(result.user).toContain('Jane Doe')
    expect(result.user).toContain('John Smith')
  })

  it('handles medical liens and confidentiality flags', () => {
    // Both true
    const bothTrue = buildPiSettlementPrompt(makeFacts({
      include_medical_liens_release: true,
      include_confidentiality: true,
    }))
    expect(bothTrue.user).toMatch(/medical liens.*Yes/i)
    expect(bothTrue.user).toMatch(/confidentiality.*Yes/i)

    // Both false
    const bothFalse = buildPiSettlementPrompt(makeFacts({
      include_medical_liens_release: false,
      include_confidentiality: false,
    }))
    expect(bothFalse.user).toMatch(/medical liens.*No/i)
    expect(bothFalse.user).toMatch(/confidentiality.*No/i)

    // Mixed
    const mixed = buildPiSettlementPrompt(makeFacts({
      include_medical_liens_release: true,
      include_confidentiality: false,
    }))
    expect(mixed.user).toMatch(/medical liens.*Yes/i)
    expect(mixed.user).toMatch(/confidentiality.*No/i)
  })
})
