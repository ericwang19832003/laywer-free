import { describe, it, expect } from 'vitest'
import { jurisdictionRuleConfigSchema } from '@lawyer-free/shared/jurisdiction-rules/schema'
import { flLandlordTenant } from '@lawyer-free/shared/jurisdiction-rules/fl'

describe('FL landlord tenant config', () => {
  it('passes schema validation', () => {
    const result = jurisdictionRuleConfigSchema.safeParse(flLandlordTenant)
    expect(result.success).toBe(true)
  })

  it('has state FL and disputeType landlord_tenant', () => {
    expect(flLandlordTenant.state).toBe('FL')
    expect(flLandlordTenant.disputeType).toBe('landlord_tenant')
  })

  it('includes at least 5 required petition sections', () => {
    const sectionIds = flLandlordTenant.requiredSections.map(s => s.id)
    expect(sectionIds.length).toBeGreaterThanOrEqual(5)
    expect(sectionIds).toContain('caption')
    expect(sectionIds).toContain('facts')
    expect(sectionIds).toContain('defenses')
    expect(sectionIds).toContain('counterclaims')
    expect(sectionIds).toContain('verification')
    expect(sectionIds).toContain('certificate_of_service')
  })

  it('has legal elements for defenses section', () => {
    const defenses = flLandlordTenant.requiredSections.find(s => s.id === 'defenses')
    expect(defenses?.legalElements).toBeDefined()
    expect(defenses!.legalElements!.length).toBeGreaterThanOrEqual(3)
  })

  it('has step validations requiring lease_start_date for facts', () => {
    expect(flLandlordTenant.stepValidations.facts).toBeDefined()
    expect(flLandlordTenant.stepValidations.facts.required).toContain('lease_start_date')
  })

  it('has step validations requiring defense_type for claims', () => {
    expect(flLandlordTenant.stepValidations.claims).toBeDefined()
    expect(flLandlordTenant.stepValidations.claims.required).toContain('defense_type')
  })

  it('has at least 7 glossary entries', () => {
    expect(flLandlordTenant.glossary.length).toBeGreaterThanOrEqual(7)
  })

  it('maps every rejectionReason to a valid wizard step', () => {
    const validSteps = ['preflight', 'parties', 'venue', 'facts', 'claims', 'relief', 'how_to_file', 'review']
    for (const r of flLandlordTenant.rejectionReasons) {
      expect(validSteps).toContain(r.wizardStep)
    }
  })
})
