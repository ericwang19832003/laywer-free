import { describe, it, expect } from 'vitest'
import {
  buildDebtDefensePrompt,
  debtDefenseFactsSchema,
  type DebtDefenseFacts,
} from '@lawyer-free/shared/rules/debt-defense-prompts'

function makeFacts(overrides: Partial<DebtDefenseFacts> = {}): DebtDefenseFacts {
  return debtDefenseFactsSchema.parse({
    your_info: { full_name: 'Jane Doe' },
    opposing_parties: [{ full_name: 'Acme Collections LLC' }],
    court_type: 'jp',
    county: 'Travis',
    debt_sub_type: 'credit_card',
    answer_type: 'general_denial',
    selected_defenses: ['statute_of_limitations', 'lack_of_standing'],
    original_amount: 5000,
    current_amount_claimed: 7500,
    description: 'Defendant denies owing the amount claimed by plaintiff.',
    ...overrides,
  })
}

// ---------------------------------------------------------------------------
// Schema validation tests
// ---------------------------------------------------------------------------

describe('debtDefenseFactsSchema', () => {
  it('accepts valid general denial facts', () => {
    const result = debtDefenseFactsSchema.safeParse({
      your_info: { full_name: 'Jane Doe' },
      opposing_parties: [{ full_name: 'Acme Collections LLC' }],
      court_type: 'jp',
      county: 'Travis',
      debt_sub_type: 'credit_card',
      answer_type: 'general_denial',
      selected_defenses: ['statute_of_limitations'],
      original_amount: 5000,
      current_amount_claimed: 7500,
      description: 'Defendant denies owing the amount claimed.',
    })
    expect(result.success).toBe(true)
  })

  it('accepts valid specific answer facts', () => {
    const result = debtDefenseFactsSchema.safeParse({
      your_info: { full_name: 'John Smith' },
      opposing_parties: [{ full_name: 'Portfolio Recovery Associates' }],
      court_type: 'county',
      county: 'Harris',
      cause_number: '2025-CV-12345',
      debt_sub_type: 'debt_buyer',
      answer_type: 'specific_answer',
      selected_defenses: ['lack_of_standing', 'insufficient_evidence', 'fdcpa_violations'],
      defense_details: { fdcpa_violations: 'Collector called at 3am repeatedly' },
      original_amount: 3000,
      current_amount_claimed: 4500,
      description: 'Debt buyer purchased alleged debt and is suing without proof of ownership.',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty selected_defenses', () => {
    const result = debtDefenseFactsSchema.safeParse({
      your_info: { full_name: 'Jane Doe' },
      opposing_parties: [{ full_name: 'Acme Collections LLC' }],
      court_type: 'jp',
      county: 'Travis',
      debt_sub_type: 'credit_card',
      answer_type: 'general_denial',
      selected_defenses: [],
      original_amount: 5000,
      current_amount_claimed: 7500,
      description: 'Defendant denies owing the amount claimed.',
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing county', () => {
    const result = debtDefenseFactsSchema.safeParse({
      your_info: { full_name: 'Jane Doe' },
      opposing_parties: [{ full_name: 'Acme Collections LLC' }],
      court_type: 'jp',
      debt_sub_type: 'credit_card',
      answer_type: 'general_denial',
      selected_defenses: ['statute_of_limitations'],
      original_amount: 5000,
      current_amount_claimed: 7500,
      description: 'Defendant denies owing the amount claimed.',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid court_type', () => {
    const result = debtDefenseFactsSchema.safeParse({
      your_info: { full_name: 'Jane Doe' },
      opposing_parties: [{ full_name: 'Acme Collections LLC' }],
      court_type: 'federal',
      county: 'Travis',
      debt_sub_type: 'credit_card',
      answer_type: 'general_denial',
      selected_defenses: ['statute_of_limitations'],
      original_amount: 5000,
      current_amount_claimed: 7500,
      description: 'Defendant denies owing the amount claimed.',
    })
    expect(result.success).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Prompt builder tests
// ---------------------------------------------------------------------------

describe('buildDebtDefensePrompt', () => {
  it('returns system and user strings for general denial', () => {
    const result = buildDebtDefensePrompt(makeFacts({ answer_type: 'general_denial' }))
    expect(typeof result.system).toBe('string')
    expect(typeof result.user).toBe('string')
    expect(result.system.length).toBeGreaterThan(0)
    expect(result.user.length).toBeGreaterThan(0)
  })

  it('returns system and user strings for specific answer', () => {
    const result = buildDebtDefensePrompt(makeFacts({ answer_type: 'specific_answer' }))
    expect(typeof result.system).toBe('string')
    expect(typeof result.user).toBe('string')
    expect(result.system.length).toBeGreaterThan(0)
    expect(result.user.length).toBeGreaterThan(0)
  })

  it('system prompt includes "DRAFT" for general denial', () => {
    const result = buildDebtDefensePrompt(makeFacts({ answer_type: 'general_denial' }))
    expect(result.system).toContain('DRAFT')
  })

  it('system prompt includes "TRCP" or "Rule 92" reference', () => {
    const result = buildDebtDefensePrompt(makeFacts({ answer_type: 'general_denial' }))
    const systemText = result.system
    const hasTRCP = systemText.includes('TRCP')
    const hasRule92 = systemText.includes('Rule 92')
    expect(hasTRCP || hasRule92).toBe(true)
  })

  it('system prompt includes affirmative defenses guidance', () => {
    const result = buildDebtDefensePrompt(makeFacts())
    const systemLower = result.system.toLowerCase()
    expect(systemLower).toContain('affirmative defense')
  })

  it('for specific_answer with fdcpa_violations, system includes counterclaim guidance', () => {
    const result = buildDebtDefensePrompt(makeFacts({
      answer_type: 'specific_answer',
      selected_defenses: ['fdcpa_violations', 'lack_of_standing'],
    }))
    const systemLower = result.system.toLowerCase()
    expect(systemLower).toContain('counterclaim')
  })

  it('for specific_answer without fdcpa_violations, system omits counterclaim', () => {
    const result = buildDebtDefensePrompt(makeFacts({
      answer_type: 'specific_answer',
      selected_defenses: ['statute_of_limitations', 'lack_of_standing'],
    }))
    const systemLower = result.system.toLowerCase()
    expect(systemLower).not.toContain('counterclaim')
  })

  it('court label correct for JP — includes "Justice Court"', () => {
    const result = buildDebtDefensePrompt(makeFacts({ court_type: 'jp', county: 'Travis' }))
    expect(result.user).toContain('Justice Court')
  })

  it('court label correct for district — includes "District Court"', () => {
    const result = buildDebtDefensePrompt(makeFacts({ court_type: 'district', county: 'Dallas' }))
    expect(result.user).toContain('District Court')
  })
})
