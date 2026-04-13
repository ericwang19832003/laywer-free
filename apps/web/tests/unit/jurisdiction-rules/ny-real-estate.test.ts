import { describe, it, expect } from 'vitest'
import { jurisdictionRuleConfigSchema } from '@lawyer-free/shared/jurisdiction-rules/schema'
import { nyRealEstate } from '@lawyer-free/shared/jurisdiction-rules/ny/real_estate'

describe('NY real estate config', () => {
  it('passes schema validation', () => {
    const result = jurisdictionRuleConfigSchema.safeParse(nyRealEstate)
    expect(result.success).toBe(true)
  })

  it('has state NY and disputeType real_estate', () => {
    expect(nyRealEstate.state).toBe('NY')
    expect(nyRealEstate.disputeType).toBe('real_estate')
  })

  it('includes all required petition sections', () => {
    const sectionIds = nyRealEstate.requiredSections.map(s => s.id)
    expect(sectionIds).toContain('caption')
    expect(sectionIds).toContain('property_description')
    expect(sectionIds).toContain('facts')
    expect(sectionIds).toContain('claims')
    expect(sectionIds).toContain('damages')
    expect(sectionIds).toContain('verification')
    expect(sectionIds).toContain('proof_of_service')
  })

  it('has legal elements for claims section', () => {
    const claims = nyRealEstate.requiredSections.find(s => s.id === 'claims')
    expect(claims?.legalElements).toBeDefined()
    expect(claims!.legalElements!.length).toBeGreaterThanOrEqual(5)
  })

  it('has legal elements covering fraud, PCDA, GBL §349, foreclosure, and co-op/condo', () => {
    const claims = nyRealEstate.requiredSections.find(s => s.id === 'claims')
    const elements = claims!.legalElements!.join(' ')
    expect(elements).toContain('Fraud')
    expect(elements).toContain('Property Condition Disclosure Act')
    expect(elements).toContain('GBL §349')
    expect(elements).toContain('Foreclosure')
    expect(elements).toContain('Co-op/condo')
  })

  it('has property_description section with block/lot', () => {
    const propDesc = nyRealEstate.requiredSections.find(s => s.id === 'property_description')
    expect(propDesc).toBeDefined()
    const elements = propDesc!.legalElements!.join(' ')
    expect(elements).toContain('Block and lot')
    expect(elements).toContain('County')
  })

  it('has step validations for facts with transaction_date required', () => {
    expect(nyRealEstate.stepValidations.facts).toBeDefined()
    expect(nyRealEstate.stepValidations.facts.required).toContain('transaction_date')
  })

  it('has step validations for claims with claim_type required', () => {
    expect(nyRealEstate.stepValidations.claims).toBeDefined()
    expect(nyRealEstate.stepValidations.claims.required).toContain('claim_type')
  })

  it('has step validations for relief with lis pendens warning', () => {
    expect(nyRealEstate.stepValidations.relief).toBeDefined()
    const warnings = nyRealEstate.stepValidations.relief.warnings.map(w => w.condition)
    expect(warnings).toContain('no_lis_pendens_mentioned')
  })

  it('has at least 8 glossary entries', () => {
    expect(nyRealEstate.glossary.length).toBeGreaterThanOrEqual(8)
  })

  it('glossary covers key real estate terms', () => {
    const terms = nyRealEstate.glossary.map(g => g.term)
    expect(terms).toContain('Deed')
    expect(terms).toContain('Title')
    expect(terms).toContain('Foreclosure (Judicial)')
    expect(terms).toContain('Lis Pendens (Notice of Pendency)')
    expect(terms).toContain('Specific Performance')
    expect(terms).toContain('Mortgage')
    expect(terms).toContain('Co-op / Condo')
    expect(terms).toContain('Property Condition Disclosure Act (PCDA)')
    expect(terms).toContain('Mandatory Settlement Conference')
  })

  it('maps every rejectionReason to a valid wizard step', () => {
    const validSteps = ['preflight', 'parties', 'venue', 'facts', 'claims', 'relief', 'how_to_file', 'review']
    for (const r of nyRealEstate.rejectionReasons) {
      expect(validSteps).toContain(r.wizardStep)
    }
  })

  it('filing rules specify Supreme Court and mandatory venue', () => {
    expect(nyRealEstate.filingRules.courtName).toContain('Supreme Court')
    expect(nyRealEstate.filingRules.filingFee).toContain('210')
  })
})
