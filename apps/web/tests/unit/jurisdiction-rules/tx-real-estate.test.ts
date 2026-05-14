import { describe, it, expect } from 'vitest'
import { jurisdictionRuleConfigSchema } from '@lawyer-free/shared/jurisdiction-rules/schema'
import { txRealEstate } from '@lawyer-free/shared/jurisdiction-rules/tx/real_estate'

describe('TX real estate config', () => {
  it('passes schema validation', () => {
    const result = jurisdictionRuleConfigSchema.safeParse(txRealEstate)
    if (!result.success) {
      console.error(result.error.format())
    }
    expect(result.success).toBe(true)
  })

  it('has state TX and disputeType real_estate', () => {
    expect(txRealEstate.state).toBe('TX')
    expect(txRealEstate.disputeType).toBe('real_estate')
  })

  it('includes at least 5 required sections', () => {
    const sectionIds = txRealEstate.requiredSections.map(s => s.id)
    expect(sectionIds.length).toBeGreaterThanOrEqual(5)
    expect(sectionIds).toContain('caption')
    expect(sectionIds).toContain('property_description')
    expect(sectionIds).toContain('facts')
    expect(sectionIds).toContain('claims')
    expect(sectionIds).toContain('damages')
    expect(sectionIds).toContain('verification')
    expect(sectionIds).toContain('certificate_of_service')
  })

  it('has at least 7 glossary entries', () => {
    expect(txRealEstate.glossary.length).toBeGreaterThanOrEqual(7)
  })

  it('includes key real estate glossary terms', () => {
    const terms = txRealEstate.glossary.map(g => g.term)
    expect(terms).toContain('Deed')
    expect(terms).toContain('Title')
    expect(terms).toContain('Foreclosure')
    expect(terms).toContain('Lis Pendens')
    expect(terms).toContain('Specific Performance')
    expect(terms).toContain('Deed of Trust')
    expect(terms).toContain('HOA Lien')
    expect(terms).toContain('Adverse Possession')
  })

  it('has step validations for facts with transaction_date required', () => {
    expect(txRealEstate.stepValidations.facts).toBeDefined()
    expect(txRealEstate.stepValidations.facts.required).toContain('transaction_date')
  })

  it('has step validations for claims with claim_type required', () => {
    expect(txRealEstate.stepValidations.claims).toBeDefined()
    expect(txRealEstate.stepValidations.claims.required).toContain('claim_type')
  })

  it('has step validations for relief with warnings', () => {
    expect(txRealEstate.stepValidations.relief).toBeDefined()
    expect(txRealEstate.stepValidations.relief.warnings.length).toBeGreaterThan(0)
  })

  it('maps every rejectionReason to a valid wizard step', () => {
    const validSteps = ['preflight', 'parties', 'venue', 'facts', 'claims', 'relief', 'how_to_file', 'review']
    for (const r of txRealEstate.rejectionReasons) {
      expect(validSteps).toContain(r.wizardStep)
    }
  })

  it('has rejection reasons covering common filing mistakes', () => {
    const reasons = txRealEstate.rejectionReasons.map(r => r.reason)
    expect(reasons.length).toBeGreaterThanOrEqual(4)
    expect(reasons.some(r => r.toLowerCase().includes('legal description'))).toBe(true)
    expect(reasons.some(r => r.toLowerCase().includes('county'))).toBe(true)
    expect(reasons.some(r => r.toLowerCase().includes('verification'))).toBe(true)
  })

  it('references mandatory venue in filing rules', () => {
    expect(txRealEstate.filingRules.courtName.toLowerCase()).toContain('district court')
    expect(txRealEstate.filingRules.courtName).toContain('15.011')
  })
})
