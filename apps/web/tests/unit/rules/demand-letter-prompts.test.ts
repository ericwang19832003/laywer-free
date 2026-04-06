import { describe, it, expect } from 'vitest'
import { buildDemandLetterPrompt, demandLetterFactsSchema } from '@lawyer-free/shared/rules/demand-letter-prompts'
import type { DemandLetterFacts } from '@lawyer-free/shared/rules/demand-letter-prompts'

const baseFacts: DemandLetterFacts = {
  plaintiff: { full_name: 'Maria Garcia', address: '123 Main St', city: 'Houston', state: 'TX', zip: '77001' },
  defendant: { full_name: 'ABC Properties LLC', address: '456 Oak Ave', city: 'Houston', state: 'TX', zip: '77002' },
  claim_sub_type: 'security_deposit',
  claim_amount: 3200,
  damages_breakdown: [
    { category: 'Security deposit', amount: 2500, description: 'Unreturned deposit' },
    { category: 'Statutory damages', amount: 700, description: 'Bad faith penalty' },
  ],
  description: 'Landlord failed to return security deposit within 30 days of lease termination and move-out on September 15, 2025.',
  deadline_days: 14,
  incident_date: '2025-09-15',
  defendant_is_business: true,
  county: 'Harris',
}

describe('buildDemandLetterPrompt', () => {
  it('returns system and user strings', () => {
    const result = buildDemandLetterPrompt({ ...baseFacts })
    expect(result.system).toBeDefined()
    expect(result.user).toBeDefined()
    expect(result.system.length).toBeGreaterThan(50)
    expect(result.user.length).toBeGreaterThan(50)
  })

  it('includes DRAFT disclaimer', () => {
    const result = buildDemandLetterPrompt({ ...baseFacts })
    expect(result.system).toContain('DRAFT')
  })

  it('includes deadline language', () => {
    const result = buildDemandLetterPrompt({ ...baseFacts })
    expect(result.system).toContain('14 days')
  })

  it('includes consequence language about small claims filing', () => {
    const result = buildDemandLetterPrompt({ ...baseFacts })
    expect(result.system).toContain('small claims lawsuit')
    expect(result.system).toContain('Justice Court')
  })

  it('includes plaintiff name in user prompt', () => {
    const result = buildDemandLetterPrompt({ ...baseFacts })
    expect(result.user).toContain('Maria Garcia')
  })

  it('includes defendant name in user prompt', () => {
    const result = buildDemandLetterPrompt({ ...baseFacts })
    expect(result.user).toContain('ABC Properties LLC')
  })

  it('includes damages in user prompt', () => {
    const result = buildDemandLetterPrompt({ ...baseFacts })
    expect(result.user).toContain('Security deposit')
    expect(result.user).toContain('2,500')
    expect(result.user).toContain('Statutory damages')
    expect(result.user).toContain('700')
  })

  it('includes incident date in user prompt', () => {
    const result = buildDemandLetterPrompt({ ...baseFacts })
    expect(result.user).toContain('2025-09-15')
  })

  it('adapts system prompt for business defendant', () => {
    const result = buildDemandLetterPrompt({ ...baseFacts, defendant_is_business: true })
    expect(result.system).toContain('business entity')
  })

  it('does not include business note for individual defendant', () => {
    const result = buildDemandLetterPrompt({ ...baseFacts, defendant_is_business: false })
    expect(result.system).not.toContain('business entity')
  })

  it('includes county in consequence section', () => {
    const result = buildDemandLetterPrompt({ ...baseFacts, county: 'Travis' })
    expect(result.system).toContain('Travis County')
  })

  it('uses custom deadline_days', () => {
    const result = buildDemandLetterPrompt({ ...baseFacts, deadline_days: 30 })
    expect(result.system).toContain('30 days')
  })
})

describe('demandLetterFactsSchema', () => {
  it('accepts valid facts', () => {
    const result = demandLetterFactsSchema.safeParse({
      plaintiff: { full_name: 'Maria Garcia' },
      defendant: { full_name: 'ABC Properties LLC' },
      claim_sub_type: 'security_deposit',
      claim_amount: 3200,
      damages_breakdown: [{ category: 'Deposit', amount: 2500 }],
      description: 'Landlord failed to return security deposit within 30 days.',
      incident_date: '2025-09-15',
    })
    expect(result.success).toBe(true)
  })

  it('rejects claim_amount of 0', () => {
    const result = demandLetterFactsSchema.safeParse({
      plaintiff: { full_name: 'Maria Garcia' },
      defendant: { full_name: 'ABC Properties LLC' },
      claim_sub_type: 'security_deposit',
      claim_amount: 0,
      damages_breakdown: [{ category: 'Deposit', amount: 2500 }],
      description: 'Landlord failed to return security deposit within 30 days.',
      incident_date: '2025-09-15',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty description', () => {
    const result = demandLetterFactsSchema.safeParse({
      plaintiff: { full_name: 'Maria Garcia' },
      defendant: { full_name: 'ABC Properties LLC' },
      claim_sub_type: 'security_deposit',
      claim_amount: 3200,
      damages_breakdown: [{ category: 'Deposit', amount: 2500 }],
      description: '',
      incident_date: '2025-09-15',
    })
    expect(result.success).toBe(false)
  })
})
