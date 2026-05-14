import { describe, it, expect } from 'vitest'
import { jurisdictionRuleConfigSchema } from '@lawyer-free/shared/jurisdiction-rules/schema'
import { flBusiness } from '@lawyer-free/shared/jurisdiction-rules/fl/business'

describe('FL business config', () => {
  it('passes schema validation', () => {
    const result = jurisdictionRuleConfigSchema.safeParse(flBusiness)
    expect(result.success).toBe(true)
  })

  it('has state FL and disputeType business', () => {
    expect(flBusiness.state).toBe('FL')
    expect(flBusiness.disputeType).toBe('business')
  })

  it('includes at least 5 required sections', () => {
    expect(flBusiness.requiredSections.length).toBeGreaterThanOrEqual(5)
  })

  it('includes key petition sections', () => {
    const sectionIds = flBusiness.requiredSections.map(s => s.id)
    expect(sectionIds).toContain('caption')
    expect(sectionIds).toContain('facts')
    expect(sectionIds).toContain('claims')
    expect(sectionIds).toContain('damages')
    expect(sectionIds).toContain('injunctive_relief')
    expect(sectionIds).toContain('verification')
    expect(sectionIds).toContain('certificate_of_service')
  })

  it('has legal elements for claims section', () => {
    const claims = flBusiness.requiredSections.find(s => s.id === 'claims')
    expect(claims?.legalElements).toBeDefined()
    expect(claims!.legalElements!.length).toBeGreaterThanOrEqual(3)
  })

  it('has step validations for facts requiring relationship_start_date', () => {
    expect(flBusiness.stepValidations.facts).toBeDefined()
    expect(flBusiness.stepValidations.facts.required).toContain('relationship_start_date')
  })

  it('has step validations for claims requiring claim_type', () => {
    expect(flBusiness.stepValidations.claims).toBeDefined()
    expect(flBusiness.stepValidations.claims.required).toContain('claim_type')
  })

  it('has at least 7 glossary entries', () => {
    expect(flBusiness.glossary.length).toBeGreaterThanOrEqual(7)
  })

  it('maps every rejectionReason to a valid wizard step', () => {
    const validSteps = ['preflight', 'parties', 'venue', 'facts', 'claims', 'relief', 'how_to_file', 'review']
    for (const r of flBusiness.rejectionReasons) {
      expect(validSteps).toContain(r.wizardStep)
    }
  })

  it('has at least 3 rejection reasons', () => {
    expect(flBusiness.rejectionReasons.length).toBeGreaterThanOrEqual(3)
  })
})
