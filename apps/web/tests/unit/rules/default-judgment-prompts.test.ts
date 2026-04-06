import { describe, it, expect } from 'vitest'
import {
  buildDefaultJudgmentPrompt,
  defaultJudgmentFactsSchema,
  type DefaultJudgmentFacts,
} from '@lawyer-free/shared/rules/default-judgment-prompts'

describe('buildDefaultJudgmentPrompt', () => {
  const baseFacts: DefaultJudgmentFacts = {
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
    description: 'Breach of contract dispute over construction services.',
    amount_sought: 15000,
    damages_breakdown: [
      { category: 'Unpaid invoices', amount: 10000 },
      { category: 'Late fees', amount: 5000 },
    ],
    service_date: '2026-01-15',
    answer_deadline: '2026-02-05',
    non_military_affidavit: true,
  }

  it('returns system and user prompts', () => {
    const result = buildDefaultJudgmentPrompt(baseFacts)
    expect(result).toHaveProperty('system')
    expect(result).toHaveProperty('user')
  })

  it('system includes DRAFT disclaimer', () => {
    const result = buildDefaultJudgmentPrompt(baseFacts)
    expect(result.system).toContain('DRAFT')
  })

  it('system includes Application for Default', () => {
    const result = buildDefaultJudgmentPrompt(baseFacts)
    expect(result.system).toContain('Application for Default')
  })

  it('system includes Motion for Default Judgment', () => {
    const result = buildDefaultJudgmentPrompt(baseFacts)
    expect(result.system).toContain('Motion for Default Judgment')
  })

  it('includes affidavit section when non_military_affidavit is true', () => {
    const result = buildDefaultJudgmentPrompt({ ...baseFacts, non_military_affidavit: true })
    expect(result.system).toContain('Affidavit of Non-Military Service')
  })

  it('omits affidavit when non_military_affidavit is false', () => {
    const result = buildDefaultJudgmentPrompt({ ...baseFacts, non_military_affidavit: false })
    expect(result.system).not.toContain('Affidavit of Non-Military Service')
  })

  it('user includes party names', () => {
    const result = buildDefaultJudgmentPrompt(baseFacts)
    expect(result.user).toContain('Jane Smith')
    expect(result.user).toContain('ACME Corp')
  })

  it('user includes service dates', () => {
    const result = buildDefaultJudgmentPrompt(baseFacts)
    expect(result.user).toContain('2026-01-15')
    expect(result.user).toContain('2026-02-05')
  })

  it('user includes damages items with category and amount', () => {
    const result = buildDefaultJudgmentPrompt(baseFacts)
    expect(result.user).toContain('Unpaid invoices')
    expect(result.user).toContain('10,000')
    expect(result.user).toContain('Late fees')
    expect(result.user).toContain('5,000')
  })

  it('user includes total amount', () => {
    const result = buildDefaultJudgmentPrompt(baseFacts)
    expect(result.user).toContain('15,000')
  })

  it('correct court label for JP', () => {
    const result = buildDefaultJudgmentPrompt({ ...baseFacts, court_type: 'jp' })
    expect(result.user).toContain('Justice Court')
  })

  it('correct court label for county', () => {
    const result = buildDefaultJudgmentPrompt({ ...baseFacts, court_type: 'county' })
    expect(result.user).toContain('County Court')
  })

  it('correct court label for district', () => {
    const result = buildDefaultJudgmentPrompt({ ...baseFacts, court_type: 'district' })
    expect(result.user).toContain('District Court')
  })
})

describe('defaultJudgmentFactsSchema', () => {
  const validFacts = {
    your_info: { full_name: 'Jane Smith' },
    opposing_parties: [{ full_name: 'ACME Corp' }],
    court_type: 'jp',
    county: 'Harris',
    description: 'Breach of contract dispute over construction.',
    amount_sought: 5000,
    damages_breakdown: [{ category: 'Unpaid work', amount: 5000 }],
    service_date: '2026-01-15',
    answer_deadline: '2026-02-05',
    non_military_affidavit: true,
  }

  it('accepts valid facts', () => {
    const result = defaultJudgmentFactsSchema.safeParse(validFacts)
    expect(result.success).toBe(true)
  })

  it('rejects federal court_type', () => {
    const result = defaultJudgmentFactsSchema.safeParse({
      ...validFacts,
      court_type: 'federal',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty damages array', () => {
    const result = defaultJudgmentFactsSchema.safeParse({
      ...validFacts,
      damages_breakdown: [],
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing county', () => {
    const { county, ...withoutCounty } = validFacts
    const result = defaultJudgmentFactsSchema.safeParse(withoutCounty)
    expect(result.success).toBe(false)
  })
})
