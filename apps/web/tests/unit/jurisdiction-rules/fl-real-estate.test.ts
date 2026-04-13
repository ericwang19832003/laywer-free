import { describe, it, expect } from 'vitest'
import { jurisdictionRuleConfigSchema } from '@lawyer-free/shared/jurisdiction-rules/schema'
import { flRealEstate } from '@lawyer-free/shared/jurisdiction-rules/fl/real_estate'

describe('FL real estate config', () => {
  it('passes schema validation', () => {
    const result = jurisdictionRuleConfigSchema.safeParse(flRealEstate)
    expect(result.success).toBe(true)
  })

  it('has state FL and disputeType real_estate', () => {
    expect(flRealEstate.state).toBe('FL')
    expect(flRealEstate.disputeType).toBe('real_estate')
  })

  it('includes at least 5 required sections', () => {
    expect(flRealEstate.requiredSections.length).toBeGreaterThanOrEqual(5)
  })

  it('includes key petition sections', () => {
    const sectionIds = flRealEstate.requiredSections.map(s => s.id)
    expect(sectionIds).toContain('caption')
    expect(sectionIds).toContain('property_description')
    expect(sectionIds).toContain('facts')
    expect(sectionIds).toContain('claims')
    expect(sectionIds).toContain('damages')
    expect(sectionIds).toContain('verification')
    expect(sectionIds).toContain('certificate_of_service')
  })

  it('has legal elements for claims section', () => {
    const claims = flRealEstate.requiredSections.find(s => s.id === 'claims')
    expect(claims?.legalElements).toBeDefined()
    expect(claims!.legalElements!.length).toBeGreaterThanOrEqual(3)
  })

  it('has step validations for facts requiring transaction_date', () => {
    expect(flRealEstate.stepValidations.facts).toBeDefined()
    expect(flRealEstate.stepValidations.facts.required).toContain('transaction_date')
  })

  it('has step validations for claims requiring claim_type', () => {
    expect(flRealEstate.stepValidations.claims).toBeDefined()
    expect(flRealEstate.stepValidations.claims.required).toContain('claim_type')
  })

  it('has at least 7 glossary entries', () => {
    expect(flRealEstate.glossary.length).toBeGreaterThanOrEqual(7)
  })

  it('maps every rejectionReason to a valid wizard step', () => {
    const validSteps = ['preflight', 'parties', 'venue', 'facts', 'claims', 'relief', 'how_to_file', 'review']
    for (const r of flRealEstate.rejectionReasons) {
      expect(validSteps).toContain(r.wizardStep)
    }
  })

  it('has at least 3 rejection reasons', () => {
    expect(flRealEstate.rejectionReasons.length).toBeGreaterThanOrEqual(3)
  })
})
