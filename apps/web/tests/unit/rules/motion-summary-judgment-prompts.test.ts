import { describe, it, expect } from 'vitest'
import {
  buildSummaryJudgmentPrompt,
  summaryJudgmentFactsSchema,
  summaryJudgmentConfig,
  type SummaryJudgmentFacts,
} from '@lawyer-free/shared/motions/configs/motion-summary-judgment'

describe('buildSummaryJudgmentPrompt', () => {
  const baseFacts: SummaryJudgmentFacts = {
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
    undisputed_facts: [
      {
        fact: 'Defendant entered into a contract with Plaintiff on January 1, 2025.',
        evidence_reference: 'Exhibit A - Contract',
      },
      {
        fact: 'Defendant failed to deliver goods by the agreed deadline of June 1, 2025.',
      },
      {
        fact: 'Plaintiff suffered $15,000 in damages due to the breach.',
        evidence_reference: 'Exhibit C - Invoice records',
      },
    ],
    legal_grounds:
      'Under Texas law, a party is entitled to summary judgment when there are no genuine issues of material fact and the movant is entitled to judgment as a matter of law. Tex. R. Civ. P. 166a.',
    evidence_summary:
      'The attached exhibits include the signed contract (Exhibit A), delivery records showing non-performance (Exhibit B), and invoices documenting damages (Exhibit C).',
    damages_amount: 15000,
  }

  it('returns { system, user } object', () => {
    const result = buildSummaryJudgmentPrompt(baseFacts)
    expect(result).toHaveProperty('system')
    expect(result).toHaveProperty('user')
  })

  it('system includes DRAFT disclaimer', () => {
    const result = buildSummaryJudgmentPrompt(baseFacts)
    expect(result.system).toContain('DRAFT')
    expect(result.system).toContain('NOT LEGAL ADVICE')
  })

  it('system mentions Statement of Undisputed Facts', () => {
    const result = buildSummaryJudgmentPrompt(baseFacts)
    expect(result.system).toContain('Statement of Undisputed Facts')
  })

  it('user includes undisputed facts as numbered items', () => {
    const result = buildSummaryJudgmentPrompt(baseFacts)
    expect(result.user).toContain('1.')
    expect(result.user).toContain('2.')
    expect(result.user).toContain('3.')
    expect(result.user).toContain(
      'Defendant entered into a contract with Plaintiff'
    )
    expect(result.user).toContain('Exhibit A - Contract')
  })

  it('user includes legal grounds', () => {
    const result = buildSummaryJudgmentPrompt(baseFacts)
    expect(result.user).toContain('Tex. R. Civ. P. 166a')
  })

  it('user includes evidence summary', () => {
    const result = buildSummaryJudgmentPrompt(baseFacts)
    expect(result.user).toContain('signed contract (Exhibit A)')
  })

  it('user includes damages amount when provided', () => {
    const result = buildSummaryJudgmentPrompt(baseFacts)
    expect(result.user).toContain('15000')
  })

  it('user omits damages section when not provided', () => {
    const { damages_amount, ...factsWithoutDamages } = baseFacts
    const result = buildSummaryJudgmentPrompt(
      factsWithoutDamages as SummaryJudgmentFacts
    )
    expect(result.user).not.toContain('Damages amount')
  })

  it('user includes party names', () => {
    const result = buildSummaryJudgmentPrompt(baseFacts)
    expect(result.user).toContain('Jane Smith')
    expect(result.user).toContain('ACME Corp')
  })

  it('user includes court info', () => {
    const result = buildSummaryJudgmentPrompt(baseFacts)
    expect(result.user).toContain('District Court of Harris County, Texas')
  })
})

describe('summaryJudgmentFactsSchema', () => {
  const validFacts = {
    your_info: { full_name: 'Jane Smith' },
    opposing_parties: [{ full_name: 'ACME Corp' }],
    court_type: 'district',
    county: 'Harris',
    undisputed_facts: [
      { fact: 'Defendant breached the contract.' },
    ],
    legal_grounds:
      'Movant is entitled to judgment as a matter of law under Rule 166a.',
    evidence_summary:
      'The attached contract and correspondence establish the undisputed facts.',
  }

  it('accepts valid facts', () => {
    const result = summaryJudgmentFactsSchema.safeParse(validFacts)
    expect(result.success).toBe(true)
  })

  it('rejects empty undisputed_facts array', () => {
    const result = summaryJudgmentFactsSchema.safeParse({
      ...validFacts,
      undisputed_facts: [],
    })
    expect(result.success).toBe(false)
  })

  it('rejects short legal_grounds (< 10 chars)', () => {
    const result = summaryJudgmentFactsSchema.safeParse({
      ...validFacts,
      legal_grounds: 'Short',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid court_type', () => {
    const result = summaryJudgmentFactsSchema.safeParse({
      ...validFacts,
      court_type: 'supreme',
    })
    expect(result.success).toBe(false)
  })
})

describe('summaryJudgmentConfig', () => {
  it('has correct key', () => {
    expect(summaryJudgmentConfig.key).toBe('motion_summary_judgment')
  })

  it('has correct category', () => {
    expect(summaryJudgmentConfig.category).toBe('pretrial')
  })

  it('has fields array', () => {
    expect(Array.isArray(summaryJudgmentConfig.fields)).toBe(true)
    expect(summaryJudgmentConfig.fields.length).toBeGreaterThan(0)
  })

  it('has buildPrompt function', () => {
    expect(typeof summaryJudgmentConfig.buildPrompt).toBe('function')
  })

  it('has title and description', () => {
    expect(summaryJudgmentConfig.title).toBe('Motion for Summary Judgment')
    expect(summaryJudgmentConfig.description).toBeTruthy()
  })

  it('has reassurance text', () => {
    expect(summaryJudgmentConfig.reassurance).toBeTruthy()
  })
})
