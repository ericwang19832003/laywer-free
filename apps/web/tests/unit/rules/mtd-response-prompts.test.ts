import { describe, it, expect } from 'vitest'
import {
  buildMtdResponsePrompt,
  mtdResponseFactsSchema,
  mtdResponseConfig,
  type MtdResponseFacts,
} from '@/lib/motions/configs/mtd-response'

describe('buildMtdResponsePrompt', () => {
  const baseFacts: MtdResponseFacts = {
    your_info: {
      full_name: 'Jane Smith',
      address: '100 Main St',
      city: 'Houston',
      state: 'TX',
      zip: '77001',
    },
    opposing_parties: [{ full_name: 'ACME Corp', address: '200 Corp Ave' }],
    court_type: 'district',
    county: 'Harris',
    cause_number: '2026-CI-01234',
    mtd_filing_date: '2026-02-01',
    dismissal_grounds: ['failure_to_state_claim', 'statute_of_limitations'],
    factual_response:
      'Plaintiff filed this action within two years of discovering the breach. The petition clearly states a cause of action for breach of contract with all required elements.',
    legal_arguments:
      'Under Texas law, the statute of limitations for breach of contract is four years. Plaintiff discovered the breach in January 2025 and filed suit in March 2025, well within the limitations period. The petition states all required elements of a breach of contract claim.',
    additional_authority:
      'See Stton Industries v. FDIC, 7 F.3d 420 (5th Cir. 1993) (holding that a motion to dismiss should be denied if the complaint states any set of facts that could entitle plaintiff to relief).',
  }

  it('returns { system, user } object', () => {
    const result = buildMtdResponsePrompt(baseFacts)
    expect(result).toHaveProperty('system')
    expect(result).toHaveProperty('user')
  })

  it('system includes DRAFT disclaimer', () => {
    const result = buildMtdResponsePrompt(baseFacts)
    expect(result.system).toContain('DRAFT')
    expect(result.system).toContain('NOT LEGAL ADVICE')
  })

  it('user includes MTD filing date', () => {
    const result = buildMtdResponsePrompt(baseFacts)
    expect(result.user).toContain('2026-02-01')
  })

  it('user includes dismissal grounds', () => {
    const result = buildMtdResponsePrompt(baseFacts)
    expect(result.user).toContain('failure_to_state_claim')
    expect(result.user).toContain('statute_of_limitations')
  })

  it('user includes factual response', () => {
    const result = buildMtdResponsePrompt(baseFacts)
    expect(result.user).toContain(
      'Plaintiff filed this action within two years'
    )
  })

  it('user includes legal arguments', () => {
    const result = buildMtdResponsePrompt(baseFacts)
    expect(result.user).toContain(
      'statute of limitations for breach of contract is four years'
    )
  })

  it('user includes additional authority when provided', () => {
    const result = buildMtdResponsePrompt(baseFacts)
    expect(result.user).toContain('Stton Industries v. FDIC')
  })

  it('user omits additional authority section when not provided', () => {
    const { additional_authority, ...factsWithoutAuthority } = baseFacts
    const result = buildMtdResponsePrompt(
      factsWithoutAuthority as MtdResponseFacts
    )
    expect(result.user).not.toContain('Additional authority')
  })

  it('user includes party names', () => {
    const result = buildMtdResponsePrompt(baseFacts)
    expect(result.user).toContain('Jane Smith')
    expect(result.user).toContain('ACME Corp')
  })

  it('user includes court info', () => {
    const result = buildMtdResponsePrompt(baseFacts)
    expect(result.user).toContain('District Court of Harris County, Texas')
  })
})

describe('mtdResponseFactsSchema', () => {
  const validFacts = {
    your_info: { full_name: 'Jane Smith' },
    opposing_parties: [{ full_name: 'ACME Corp' }],
    court_type: 'district',
    county: 'Harris',
    mtd_filing_date: '2026-02-01',
    dismissal_grounds: ['failure_to_state_claim'],
    factual_response:
      'Plaintiff clearly stated a cause of action for breach of contract.',
    legal_arguments:
      'The petition meets all requirements under Texas pleading standards.',
  }

  it('accepts valid facts', () => {
    const result = mtdResponseFactsSchema.safeParse(validFacts)
    expect(result.success).toBe(true)
  })

  it('rejects empty dismissal_grounds array', () => {
    const result = mtdResponseFactsSchema.safeParse({
      ...validFacts,
      dismissal_grounds: [],
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid dismissal ground', () => {
    const result = mtdResponseFactsSchema.safeParse({
      ...validFacts,
      dismissal_grounds: ['invalid_ground'],
    })
    expect(result.success).toBe(false)
  })
})

describe('mtdResponseConfig', () => {
  it('has correct key', () => {
    expect(mtdResponseConfig.key).toBe('mtd_response')
  })

  it('has correct category', () => {
    expect(mtdResponseConfig.category).toBe('pretrial')
  })

  it('has fields array', () => {
    expect(Array.isArray(mtdResponseConfig.fields)).toBe(true)
    expect(mtdResponseConfig.fields.length).toBeGreaterThan(0)
  })

  it('has buildPrompt function', () => {
    expect(typeof mtdResponseConfig.buildPrompt).toBe('function')
  })

  it('has title and description', () => {
    expect(mtdResponseConfig.title).toBe('Response to Motion to Dismiss')
    expect(mtdResponseConfig.description).toBeTruthy()
  })

  it('has reassurance text', () => {
    expect(mtdResponseConfig.reassurance).toBeTruthy()
  })
})
