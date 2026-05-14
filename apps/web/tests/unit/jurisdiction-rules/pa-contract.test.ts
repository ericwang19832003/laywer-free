import { describe, it, expect } from 'vitest'
import { jurisdictionRuleConfigSchema } from '@lawyer-free/shared/jurisdiction-rules/schema'
import { paContract } from '@lawyer-free/shared/jurisdiction-rules/pa/contract'

describe('PA contract config', () => {
  it('passes schema validation', () => {
    const result = jurisdictionRuleConfigSchema.safeParse(paContract)
    expect(result.success).toBe(true)
  })

  it('has state PA and disputeType contract', () => {
    expect(paContract.state).toBe('PA')
    expect(paContract.disputeType).toBe('contract')
  })

  it('includes required petition sections', () => {
    const sectionIds = paContract.requiredSections.map(s => s.id)
    expect(sectionIds).toContain('caption')
    expect(sectionIds).toContain('contract_description')
    expect(sectionIds).toContain('breach_allegations')
    expect(sectionIds).toContain('damages')
    expect(sectionIds).toContain('verification')
    expect(sectionIds).toContain('certificate_of_service')
  })

  it('has legal elements for breach allegations', () => {
    const breach = paContract.requiredSections.find(s => s.id === 'breach_allegations')
    expect(breach?.legalElements).toBeDefined()
    expect(breach!.legalElements!.length).toBeGreaterThanOrEqual(4)
  })

  it('has legal elements for damages including pre-judgment interest and attorney fees', () => {
    const damages = paContract.requiredSections.find(s => s.id === 'damages')
    expect(damages?.legalElements).toBeDefined()
    const elements = damages!.legalElements!.join(' ')
    expect(elements).toContain('41 P.S. §202')
    expect(elements).toContain('6%')
    expect(elements).toContain('American Rule')
    expect(elements).toContain('Specific performance')
  })

  it('has step validations for facts step with contract_date required', () => {
    expect(paContract.stepValidations.facts).toBeDefined()
    expect(paContract.stepValidations.facts.required).toContain('contract_date')
  })

  it('has step validations for claims step with breach_type required', () => {
    expect(paContract.stepValidations.claims).toBeDefined()
    expect(paContract.stepValidations.claims.required).toContain('breach_type')
  })

  it('warns about Statute of Frauds in claims step', () => {
    const claimsWarnings = paContract.stepValidations.claims.warnings
    const fraudWarning = claimsWarnings.find(w => w.condition === 'no_statute_of_frauds_analysis')
    expect(fraudWarning).toBeDefined()
    expect(fraudWarning!.message).toContain('33 P.S. §1')
  })

  it('warns about pre-judgment interest at 6% in relief step', () => {
    const reliefWarnings = paContract.stepValidations.relief.warnings
    const interestWarning = reliefWarnings.find(w => w.condition === 'no_prejudgment_interest_analysis')
    expect(interestWarning).toBeDefined()
    expect(interestWarning!.message).toContain('6%')
    expect(interestWarning!.message).toContain('41 P.S. §202')
  })

  it('warns about attorney fees under American Rule in relief step', () => {
    const reliefWarnings = paContract.stepValidations.relief.warnings
    const feeWarning = reliefWarnings.find(w => w.condition === 'no_attorneys_fees_analysis')
    expect(feeWarning).toBeDefined()
    expect(feeWarning!.message).toContain('American Rule')
  })

  it('warns about confession of judgment in claims step', () => {
    const claimsWarnings = paContract.stepValidations.claims.warnings
    const confessionWarning = claimsWarnings.find(w => w.condition === 'confession_of_judgment_clause')
    expect(confessionWarning).toBeDefined()
    expect(confessionWarning!.message).toContain('Pa.R.C.P. 2950')
  })

  it('has at least 7 glossary entries', () => {
    expect(paContract.glossary.length).toBeGreaterThanOrEqual(7)
  })

  it('includes glossary entries for key contract terms', () => {
    const terms = paContract.glossary.map(g => g.term)
    expect(terms).toContain('Breach of Contract')
    expect(terms).toContain('Statute of Limitations')
    expect(terms).toContain('Specific Performance')
    expect(terms).toContain('Consequential Damages')
    expect(terms).toContain('Statute of Frauds')
    expect(terms).toContain('Confession of Judgment')
    expect(terms).toContain('Pre-Judgment Interest')
    expect(terms).toContain('Mitigation')
  })

  it('references correct 4-year SOL in glossary', () => {
    const sol = paContract.glossary.find(g => g.term === 'Statute of Limitations')
    expect(sol?.plainEnglish).toContain('4 years')
    expect(sol?.plainEnglish).toContain('42 Pa.C.S. §5525(a)')
  })

  it('maps every rejectionReason to a valid wizard step', () => {
    const validSteps = ['preflight', 'parties', 'venue', 'facts', 'claims', 'relief', 'how_to_file', 'review']
    for (const r of paContract.rejectionReasons) {
      expect(validSteps).toContain(r.wizardStep)
    }
  })

  it('references correct court tiers and filing fees', () => {
    expect(paContract.filingRules.courtName).toContain('Magisterial District Court')
    expect(paContract.filingRules.courtName).toContain('$12,000')
    expect(paContract.filingRules.courtName).toContain('Court of Common Pleas')
    expect(paContract.filingRules.filingFee).toContain('IFP')
  })

  it('references correct venue rule Pa.R.C.P. 1006', () => {
    const venueRejection = paContract.rejectionReasons.find(r => r.wizardStep === 'venue')
    expect(venueRejection?.howToAvoid).toContain('Pa.R.C.P. 1006')
  })
})
