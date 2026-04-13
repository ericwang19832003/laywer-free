import { describe, it, expect } from 'vitest'
import { jurisdictionRuleConfigSchema } from '@lawyer-free/shared/jurisdiction-rules/schema'
import { caContract } from '@lawyer-free/shared/jurisdiction-rules/ca/contract'

describe('CA contract config', () => {
  it('passes schema validation', () => {
    const result = jurisdictionRuleConfigSchema.safeParse(caContract)
    expect(result.success).toBe(true)
  })

  it('has state CA and disputeType contract', () => {
    expect(caContract.state).toBe('CA')
    expect(caContract.disputeType).toBe('contract')
  })

  it('includes required petition sections', () => {
    const sectionIds = caContract.requiredSections.map(s => s.id)
    expect(sectionIds).toContain('caption')
    expect(sectionIds).toContain('contract_description')
    expect(sectionIds).toContain('breach_allegations')
    expect(sectionIds).toContain('damages')
    expect(sectionIds).toContain('verification')
    expect(sectionIds).toContain('proof_of_service')
  })

  it('has legal elements for breach allegations', () => {
    const breach = caContract.requiredSections.find(s => s.id === 'breach_allegations')
    expect(breach?.legalElements).toBeDefined()
    expect(breach!.legalElements!.length).toBeGreaterThanOrEqual(4)
  })

  it('has legal elements for damages including attorney fees and specific performance', () => {
    const damages = caContract.requiredSections.find(s => s.id === 'damages')
    expect(damages?.legalElements).toBeDefined()
    const elements = damages!.legalElements!.join(' ')
    expect(elements).toContain('Civil Code §1717')
    expect(elements).toContain('Civil Code §3384')
    expect(elements).toContain('Quantum meruit')
  })

  it('has step validations for facts step with contract_date required', () => {
    expect(caContract.stepValidations.facts).toBeDefined()
    expect(caContract.stepValidations.facts.required).toContain('contract_date')
  })

  it('has step validations for claims step with breach_type required', () => {
    expect(caContract.stepValidations.claims).toBeDefined()
    expect(caContract.stepValidations.claims.required).toContain('breach_type')
  })

  it('warns about Statute of Frauds in claims step', () => {
    const claimsWarnings = caContract.stepValidations.claims.warnings
    const fraudWarning = claimsWarnings.find(w => w.condition === 'no_statute_of_frauds_analysis')
    expect(fraudWarning).toBeDefined()
    expect(fraudWarning!.message).toContain('Civil Code §1624')
  })

  it('warns about attorney fees under Civil Code §1717 in relief step', () => {
    const reliefWarnings = caContract.stepValidations.relief.warnings
    const feeWarning = reliefWarnings.find(w => w.condition === 'no_attorneys_fees_analysis')
    expect(feeWarning).toBeDefined()
    expect(feeWarning!.message).toContain('Civil Code §1717')
  })

  it('has at least 7 glossary entries', () => {
    expect(caContract.glossary.length).toBeGreaterThanOrEqual(7)
  })

  it('includes glossary entries for key contract terms', () => {
    const terms = caContract.glossary.map(g => g.term)
    expect(terms).toContain('Breach of Contract')
    expect(terms).toContain('Statute of Limitations')
    expect(terms).toContain('Specific Performance')
    expect(terms).toContain('Quantum Meruit')
    expect(terms).toContain('Statute of Frauds (Civil Code §1624)')
  })

  it('references correct SOL periods in glossary', () => {
    const sol = caContract.glossary.find(g => g.term === 'Statute of Limitations')
    expect(sol?.plainEnglish).toContain('4 years')
    expect(sol?.plainEnglish).toContain('CCP §337')
    expect(sol?.plainEnglish).toContain('2 years')
    expect(sol?.plainEnglish).toContain('CCP §339')
  })

  it('maps every rejectionReason to a valid wizard step', () => {
    const validSteps = ['preflight', 'parties', 'venue', 'facts', 'claims', 'relief', 'how_to_file', 'review']
    for (const r of caContract.rejectionReasons) {
      expect(validSteps).toContain(r.wizardStep)
    }
  })

  it('references correct court tiers and filing fees', () => {
    expect(caContract.filingRules.courtName).toContain('Small Claims')
    expect(caContract.filingRules.courtName).toContain('$10,000')
    expect(caContract.filingRules.courtName).toContain('$25,000')
    expect(caContract.filingRules.filingFee).toContain('$75')
    expect(caContract.filingRules.filingFee).toContain('$435')
  })

  it('references correct venue rule CCP §395', () => {
    const venueRejection = caContract.rejectionReasons.find(r => r.wizardStep === 'venue')
    expect(venueRejection?.howToAvoid).toContain('CCP §395')
  })
})
