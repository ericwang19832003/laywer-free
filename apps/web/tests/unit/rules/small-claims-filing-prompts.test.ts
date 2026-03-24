import { describe, it, expect } from 'vitest'
import { buildSmallClaimsFilingPrompt, getDocumentTitle } from '@/lib/rules/small-claims-filing-prompts'
import { smallClaimsFilingFactsSchema } from '@/lib/schemas/small-claims-filing'
import type { SmallClaimsFilingFacts } from '@/lib/schemas/small-claims-filing'

const baseFacts: SmallClaimsFilingFacts = {
  plaintiff: { full_name: 'Maria Garcia' },
  defendant: { full_name: 'ABC Properties LLC' },
  court_type: 'jp',
  county: 'Harris',
  precinct: '1',
  claim_sub_type: 'security_deposit',
  claim_amount: 3200,
  damages_breakdown: [
    { category: 'Security deposit', amount: 2500, description: 'Unreturned deposit' },
    { category: 'Statutory damages', amount: 700, description: 'Bad faith penalty' },
  ],
  incident_date: '2025-09-15',
  description: 'Landlord failed to return security deposit within 30 days of lease termination and move-out.',
  demand_letter_sent: true,
  demand_letter_date: '2025-10-20',
  defendant_is_business: true,
}

describe('buildSmallClaimsFilingPrompt', () => {
  it('returns system and user strings', () => {
    const result = buildSmallClaimsFilingPrompt({ ...baseFacts })
    expect(result.system).toBeDefined()
    expect(result.user).toBeDefined()
    expect(result.system.length).toBeGreaterThan(50)
    expect(result.user.length).toBeGreaterThan(50)
  })

  it('includes DRAFT disclaimer', () => {
    const result = buildSmallClaimsFilingPrompt({ ...baseFacts })
    expect(result.system).toContain('DRAFT')
  })

  it('includes JP Court caption format', () => {
    const result = buildSmallClaimsFilingPrompt({ ...baseFacts })
    expect(result.system).toContain('Justice Court')
    expect(result.system).toContain('Precinct')
    expect(result.system).toContain('Harris County, Texas')
  })

  it('uses Plaintiff/Defendant terminology, not Petitioner/Respondent', () => {
    const result = buildSmallClaimsFilingPrompt({ ...baseFacts })
    expect(result.system).toContain('Plaintiff')
    expect(result.system).toContain('Defendant')
    expect(result.system).not.toContain('Petitioner')
    expect(result.system).not.toContain('Respondent')
    expect(result.user).toContain('Maria Garcia')
    expect(result.user).toContain('ABC Properties LLC')
  })

  it('includes TRCP 500-507 citation', () => {
    const result = buildSmallClaimsFilingPrompt({ ...baseFacts })
    expect(result.system).toContain('500-507')
  })

  it('includes damages breakdown instruction', () => {
    const result = buildSmallClaimsFilingPrompt({ ...baseFacts })
    expect(result.system).toContain('DAMAGES')
    expect(result.user).toContain('Security deposit')
    expect(result.user).toContain('2,500')
  })

  it('includes verification section', () => {
    const result = buildSmallClaimsFilingPrompt({ ...baseFacts })
    expect(result.system).toContain('VERIFICATION')
    expect(result.system).toContain('penalty of perjury')
  })

  // Sub-type document title tests
  it('generates Security Deposit Dispute title', () => {
    const title = getDocumentTitle('security_deposit')
    expect(title).toBe('Security Deposit Dispute')
    const result = buildSmallClaimsFilingPrompt({ ...baseFacts, claim_sub_type: 'security_deposit' })
    expect(result.system).toContain('Security Deposit Dispute')
  })

  it('generates Breach of Contract title', () => {
    const title = getDocumentTitle('breach_of_contract')
    expect(title).toBe('Breach of Contract')
    const result = buildSmallClaimsFilingPrompt({
      ...baseFacts,
      claim_sub_type: 'breach_of_contract',
    })
    expect(result.system).toContain('Breach of Contract')
  })

  it('generates Vehicle Damage Claim title for car_accident', () => {
    const title = getDocumentTitle('car_accident')
    expect(title).toBe('Vehicle Damage Claim')
    const result = buildSmallClaimsFilingPrompt({
      ...baseFacts,
      claim_sub_type: 'car_accident',
    })
    expect(result.system).toContain('Vehicle Damage Claim')
  })

  it('includes Tex. Prop. Code citations for security_deposit sub-type', () => {
    const result = buildSmallClaimsFilingPrompt({ ...baseFacts, claim_sub_type: 'security_deposit' })
    expect(result.system).toContain('92.104')
    expect(result.system).toContain('92.109')
  })

  it('includes DTPA citation for consumer_refund sub-type', () => {
    const result = buildSmallClaimsFilingPrompt({
      ...baseFacts,
      claim_sub_type: 'consumer_refund',
    })
    expect(result.system).toContain('17.50')
  })

  it('includes comparative negligence note for car_accident sub-type', () => {
    const result = buildSmallClaimsFilingPrompt({
      ...baseFacts,
      claim_sub_type: 'car_accident',
    })
    expect(result.system).toContain('comparative negligence')
  })
})

describe('smallClaimsFilingFactsSchema', () => {
  it('accepts valid facts', () => {
    const result = smallClaimsFilingFactsSchema.safeParse({
      plaintiff: { full_name: 'Maria Garcia' },
      defendant: { full_name: 'ABC Properties LLC' },
      court_type: 'jp',
      county: 'Harris',
      claim_sub_type: 'security_deposit',
      claim_amount: 3200,
      damages_breakdown: [{ category: 'Security deposit', amount: 2500 }],
      incident_date: '2025-09-15',
      description: 'Landlord failed to return security deposit within 30 days.',
      demand_letter_sent: true,
    })
    expect(result.success).toBe(true)
  })

  it('rejects claim_amount greater than 20000', () => {
    const result = smallClaimsFilingFactsSchema.safeParse({
      plaintiff: { full_name: 'Maria Garcia' },
      defendant: { full_name: 'ABC Properties LLC' },
      court_type: 'jp',
      county: 'Harris',
      claim_sub_type: 'security_deposit',
      claim_amount: 25000,
      damages_breakdown: [{ category: 'Deposit', amount: 25000 }],
      incident_date: '2025-09-15',
      description: 'Landlord failed to return security deposit within 30 days.',
      demand_letter_sent: true,
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty damages_breakdown array', () => {
    const result = smallClaimsFilingFactsSchema.safeParse({
      plaintiff: { full_name: 'Maria Garcia' },
      defendant: { full_name: 'ABC Properties LLC' },
      court_type: 'jp',
      county: 'Harris',
      claim_sub_type: 'security_deposit',
      claim_amount: 3200,
      damages_breakdown: [],
      incident_date: '2025-09-15',
      description: 'Landlord failed to return security deposit within 30 days.',
      demand_letter_sent: true,
    })
    expect(result.success).toBe(false)
  })
})
