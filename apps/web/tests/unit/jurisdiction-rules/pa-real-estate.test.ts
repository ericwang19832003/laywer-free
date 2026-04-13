import { describe, it, expect } from 'vitest'
import { jurisdictionRuleConfigSchema } from '@lawyer-free/shared/jurisdiction-rules/schema'
import { paRealEstate } from '@lawyer-free/shared/jurisdiction-rules/pa/real_estate'

describe('PA real estate config', () => {
  it('passes schema validation', () => {
    const result = jurisdictionRuleConfigSchema.safeParse(paRealEstate)
    expect(result.success).toBe(true)
  })

  it('has state PA and disputeType real_estate', () => {
    expect(paRealEstate.state).toBe('PA')
    expect(paRealEstate.disputeType).toBe('real_estate')
  })

  it('includes at least 5 required sections', () => {
    expect(paRealEstate.requiredSections.length).toBeGreaterThanOrEqual(5)
  })

  it('includes required petition sections', () => {
    const sectionIds = paRealEstate.requiredSections.map(s => s.id)
    expect(sectionIds).toContain('caption')
    expect(sectionIds).toContain('property_description')
    expect(sectionIds).toContain('facts')
    expect(sectionIds).toContain('claims')
    expect(sectionIds).toContain('damages')
    expect(sectionIds).toContain('verification')
    expect(sectionIds).toContain('certificate_of_service')
  })

  it('has legal elements for claims section', () => {
    const claims = paRealEstate.requiredSections.find(s => s.id === 'claims')
    expect(claims?.legalElements).toBeDefined()
    expect(claims!.legalElements!.length).toBeGreaterThanOrEqual(3)
  })

  it('has step validations for facts step requiring transaction_date', () => {
    expect(paRealEstate.stepValidations.facts).toBeDefined()
    expect(paRealEstate.stepValidations.facts.required).toContain('transaction_date')
  })

  it('has step validations for claims step requiring claim_type', () => {
    expect(paRealEstate.stepValidations.claims).toBeDefined()
    expect(paRealEstate.stepValidations.claims.required).toContain('claim_type')
  })

  it('has at least 8 glossary entries', () => {
    expect(paRealEstate.glossary.length).toBeGreaterThanOrEqual(8)
  })

  it('maps every rejectionReason to a valid wizard step', () => {
    const validSteps = ['preflight', 'parties', 'venue', 'facts', 'claims', 'relief', 'how_to_file', 'review']
    for (const r of paRealEstate.rejectionReasons) {
      expect(validSteps).toContain(r.wizardStep)
    }
  })

  it('glossary covers PA real estate-specific terms', () => {
    const terms = paRealEstate.glossary.map(g => g.term)
    expect(terms).toContain('Deed')
    expect(terms).toContain('Title')
    expect(terms).toContain('Foreclosure (Judicial)')
    expect(terms).toContain('Lis Pendens')
    expect(terms).toContain('Specific Performance')
    expect(terms).toContain('Mortgage')
    expect(terms).toContain('Act 91 Notice')
    expect(terms).toContain('Seller Disclosure Act')
  })
})
