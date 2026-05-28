import { describe, it, expect } from 'vitest'
import { buildSmallClaimsFilingPrompt, getDocumentTitle } from '@lawyer-free/shared/rules/small-claims-filing-prompts'
import { smallClaimsFilingFactsSchema } from '@lawyer-free/shared/schemas/small-claims-filing'
import type { SmallClaimsFilingFacts } from '@lawyer-free/shared/schemas/small-claims-filing'

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

describe('NY state — buildSmallClaimsFilingPrompt', () => {
  const nyFacts: SmallClaimsFilingFacts = {
    plaintiff: { full_name: 'James Park', address: '123 Main St', city: 'New York', state: 'NY', zip: '10001' },
    defendant: { full_name: 'Brooklyn Storage LLC', address: '456 Atlantic Ave', city: 'Brooklyn', state: 'NY', zip: '11201' },
    court_type: 'jp',
    county: 'Kings',
    claim_sub_type: 'security_deposit',
    claim_amount: 3500,
    damages_breakdown: [
      { category: 'Security deposit', amount: 3000, description: 'Unreturned deposit' },
      { category: 'Statutory damages', amount: 500, description: 'Bad faith penalty' },
    ],
    incident_date: '2025-11-01',
    description: 'Landlord failed to return security deposit within 14 days of move-out and provided no itemized statement.',
    demand_letter_sent: true,
    demand_letter_date: '2025-11-20',
    defendant_is_business: true,
    state: 'NY',
  }

  it('uses NY court caption, not Texas', () => {
    const result = buildSmallClaimsFilingPrompt(nyFacts)
    // Kings County is an NYC borough — should use NYC Civil Court caption
    expect(result.system).toContain('CIVIL COURT OF THE CITY OF NEW YORK')
    expect(result.system).toContain('KINGS')
    expect(result.system).not.toContain('Texas')
    expect(result.system).not.toContain('TRCP')
    expect(result.system).not.toContain('Justice Court')
  })

  it('uses UCCA jurisdiction, not Tex. Gov. Code', () => {
    const result = buildSmallClaimsFilingPrompt(nyFacts)
    expect(result.system).toContain('UCCA')
    expect(result.system).not.toContain('Tex. Gov. Code')
  })

  it('uses NOTICE OF SMALL CLAIM document title', () => {
    const result = buildSmallClaimsFilingPrompt(nyFacts)
    expect(result.system).toContain('NOTICE OF SMALL CLAIM')
  })

  it('uses NY certification verification, not Texas declaration', () => {
    const result = buildSmallClaimsFilingPrompt(nyFacts)
    expect(result.system).toContain('I certify')
    expect(result.system).toContain('willfully false')
    expect(result.system).not.toContain('Tex.')
  })

  it('cites GOL § 7-108 (14-day rule) for security_deposit', () => {
    const result = buildSmallClaimsFilingPrompt(nyFacts)
    expect(result.system).toContain('7-108')
    expect(result.system).toContain('14 days')
    expect(result.system).not.toContain('92.104')
    expect(result.system).not.toContain('227-e')
  })

  it('cites CPLR § 1411 comparative negligence for car_accident', () => {
    const result = buildSmallClaimsFilingPrompt({ ...nyFacts, claim_sub_type: 'car_accident' })
    expect(result.system).toContain('1411')
  })

  it('cites GBL § 349 for consumer_refund', () => {
    const result = buildSmallClaimsFilingPrompt({ ...nyFacts, claim_sub_type: 'consumer_refund' })
    expect(result.system).toContain('349')
  })

  it('cites CPLR § 213 for breach_of_contract', () => {
    const result = buildSmallClaimsFilingPrompt({ ...nyFacts, claim_sub_type: 'breach_of_contract' })
    expect(result.system).toContain('213')
  })

  it('user prompt shows NY Small Claims Court type, not JP', () => {
    const result = buildSmallClaimsFilingPrompt(nyFacts)
    expect(result.user).toContain('Small Claims Court')
    expect(result.user).not.toContain('Justice Court (JP)')
  })

  it('still uses Plaintiff/Defendant terminology', () => {
    const result = buildSmallClaimsFilingPrompt(nyFacts)
    expect(result.system).toContain('Plaintiff')
    expect(result.system).toContain('Defendant')
  })

  it('resolvedState from second parameter overrides facts.state', () => {
    const factsNoState = { ...nyFacts, state: undefined }
    const result = buildSmallClaimsFilingPrompt(factsNoState, 'NY')
    expect(result.system).toContain('UCCA')
    expect(result.system).not.toContain('Tex. Gov. Code')
  })
})

describe('FL state — buildSmallClaimsFilingPrompt', () => {
  const flFacts: SmallClaimsFilingFacts = {
    plaintiff: { full_name: 'Maria Torres', address: '100 Main St', city: 'Miami', state: 'FL', zip: '33101' },
    defendant: { full_name: 'Sunshine Storage LLC', address: '200 Brickell Ave', city: 'Miami', state: 'FL', zip: '33131' },
    court_type: 'jp',
    county: 'Miami-Dade',
    claim_sub_type: 'security_deposit',
    claim_amount: 2500,
    damages_breakdown: [
      { category: 'Security deposit', amount: 2000, description: 'Unreturned deposit' },
      { category: 'Damages', amount: 500, description: 'Bad faith penalty' },
    ],
    incident_date: '2025-10-01',
    description: 'Landlord failed to return security deposit within 15 days and provided no written notice of claim.',
    demand_letter_sent: true,
    demand_letter_date: '2025-10-20',
    defendant_is_business: true,
    state: 'FL',
  }

  it('uses FL court caption, not Texas', () => {
    const result = buildSmallClaimsFilingPrompt(flFacts)
    expect(result.system).toContain('MIAMI-DADE COUNTY')
    expect(result.system).toContain('FLORIDA')
    expect(result.system).not.toContain('Texas')
    expect(result.system).not.toContain('TRCP')
    expect(result.system).not.toContain('Justice Court')
  })

  it('uses Fla. Stat. § 34.01 jurisdiction, not Tex. Gov. Code', () => {
    const result = buildSmallClaimsFilingPrompt(flFacts)
    expect(result.system).toContain('34.01')
    expect(result.system).toContain('$8,000')
    expect(result.system).not.toContain('Tex. Gov. Code')
    expect(result.system).not.toContain('$20,000')
  })

  it('uses PLAINTIFF\'S STATEMENT OF CLAIM document title', () => {
    const result = buildSmallClaimsFilingPrompt(flFacts)
    expect(result.system).toContain('PLAINTIFF\'S STATEMENT OF CLAIM')
  })

  it('uses FL verification language (Fla. Stat. § 92.525)', () => {
    const result = buildSmallClaimsFilingPrompt(flFacts)
    expect(result.system).toContain('penalties of perjury')
    expect(result.system).toContain('92.525')
    expect(result.system).not.toContain('Tex.')
  })

  it('cites Fla. Stat. § 83.49 (15/30-day rule) for security_deposit', () => {
    const result = buildSmallClaimsFilingPrompt(flFacts)
    expect(result.system).toContain('83.49')
    expect(result.system).toContain('15 days')
    expect(result.system).not.toContain('92.104')
  })

  it('cites Fla. Stat. § 768.81 modified comparative negligence for car_accident', () => {
    const result = buildSmallClaimsFilingPrompt({ ...flFacts, claim_sub_type: 'car_accident' })
    expect(result.system).toContain('768.81')
    expect(result.system).toContain('modified comparative')
  })

  it('cites FDUTPA for consumer_refund', () => {
    const result = buildSmallClaimsFilingPrompt({ ...flFacts, claim_sub_type: 'consumer_refund' })
    expect(result.system).toContain('FDUTPA')
    expect(result.system).toContain('501.201')
  })

  it('cites Fla. Stat. § 95.11 for breach_of_contract', () => {
    const result = buildSmallClaimsFilingPrompt({ ...flFacts, claim_sub_type: 'breach_of_contract' })
    expect(result.system).toContain('95.11')
  })

  it('user prompt shows County Court type, not Justice Court (JP)', () => {
    const result = buildSmallClaimsFilingPrompt(flFacts)
    expect(result.user).toContain('County Court')
    expect(result.user).not.toContain('Justice Court (JP)')
  })

  it('resolvedState from second parameter overrides facts.state', () => {
    const factsNoState = { ...flFacts, state: undefined }
    const result = buildSmallClaimsFilingPrompt(factsNoState, 'FL')
    expect(result.system).toContain('34.01')
    expect(result.system).not.toContain('Tex. Gov. Code')
  })
})

describe('PA state — buildSmallClaimsFilingPrompt', () => {
  const paFacts: SmallClaimsFilingFacts = {
    plaintiff: { full_name: 'Robert Chen', address: '50 Market St', city: 'Lancaster', state: 'PA', zip: '17601' },
    defendant: { full_name: 'Liberty Storage Co', address: '200 Broad St', city: 'Lancaster', state: 'PA', zip: '17602' },
    court_type: 'jp',
    county: 'Lancaster',
    claim_sub_type: 'security_deposit',
    claim_amount: 2800,
    damages_breakdown: [
      { category: 'Security deposit', amount: 2000, description: 'Unreturned deposit' },
      { category: 'Double damages', amount: 800, description: 'Bad faith penalty' },
    ],
    incident_date: '2025-10-01',
    description: 'Landlord failed to return security deposit and itemized list within 30 days of vacating.',
    demand_letter_sent: true,
    demand_letter_date: '2025-11-01',
    defendant_is_business: true,
    state: 'PA',
  }

  it('uses PA court caption, not Texas', () => {
    const result = buildSmallClaimsFilingPrompt(paFacts)
    expect(result.system).toContain('MAGISTERIAL DISTRICT COURT')
    expect(result.system).toContain('LANCASTER')
    expect(result.system).toContain('PENNSYLVANIA')
    expect(result.system).not.toContain('Texas')
    expect(result.system).not.toContain('TRCP')
    expect(result.system).not.toContain('Justice Court')
  })

  it('uses 42 Pa. C.S. § 1515 jurisdiction, not Tex. Gov. Code', () => {
    const result = buildSmallClaimsFilingPrompt(paFacts)
    expect(result.system).toContain('1515')
    expect(result.system).toContain('$12,000')
    expect(result.system).not.toContain('Tex. Gov. Code')
    expect(result.system).not.toContain('$20,000')
  })

  it('uses CIVIL COMPLAINT document title', () => {
    const result = buildSmallClaimsFilingPrompt(paFacts)
    expect(result.system).toContain('CIVIL COMPLAINT')
    expect(result.system).not.toContain('PETITION')
  })

  it('uses PA verification language (18 Pa. C.S. § 4904)', () => {
    const result = buildSmallClaimsFilingPrompt(paFacts)
    expect(result.system).toContain('4904')
    expect(result.system).toContain('unsworn falsification')
    expect(result.system).not.toContain('Tex.')
  })

  it('cites 68 P.S. § 250.512 (30-day rule) for security_deposit', () => {
    const result = buildSmallClaimsFilingPrompt(paFacts)
    expect(result.system).toContain('250.512')
    expect(result.system).toContain('30 days')
    expect(result.system).not.toContain('92.104')
  })

  it('cites 42 Pa. C.S. § 7102 modified comparative negligence for car_accident', () => {
    const result = buildSmallClaimsFilingPrompt({ ...paFacts, claim_sub_type: 'car_accident' })
    expect(result.system).toContain('7102')
    expect(result.system).toContain('modified comparative')
  })

  it('cites UTPCPL for consumer_refund', () => {
    const result = buildSmallClaimsFilingPrompt({ ...paFacts, claim_sub_type: 'consumer_refund' })
    expect(result.system).toContain('UTPCPL')
    expect(result.system).toContain('201-1')
  })

  it('cites 42 Pa. C.S. § 5525 for breach_of_contract', () => {
    const result = buildSmallClaimsFilingPrompt({ ...paFacts, claim_sub_type: 'breach_of_contract' })
    expect(result.system).toContain('5525')
  })

  it('user prompt shows Magisterial District Court type, not Justice Court (JP)', () => {
    const result = buildSmallClaimsFilingPrompt(paFacts)
    expect(result.user).toContain('Magisterial District Court')
    expect(result.user).not.toContain('Justice Court (JP)')
  })

  it('resolvedState from second parameter overrides facts.state', () => {
    const factsNoState = { ...paFacts, state: undefined }
    const result = buildSmallClaimsFilingPrompt(factsNoState, 'PA')
    expect(result.system).toContain('1515')
    expect(result.system).not.toContain('Tex. Gov. Code')
  })
})
