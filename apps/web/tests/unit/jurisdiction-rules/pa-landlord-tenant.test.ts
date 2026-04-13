import { describe, it, expect } from 'vitest'
import { jurisdictionRuleConfigSchema } from '@lawyer-free/shared/jurisdiction-rules/schema'
import { paLandlordTenant } from '@lawyer-free/shared/jurisdiction-rules/pa/landlord_tenant'

describe('PA landlord tenant config', () => {
  it('passes schema validation', () => {
    const result = jurisdictionRuleConfigSchema.safeParse(paLandlordTenant)
    expect(result.success).toBe(true)
  })

  it('has state PA and disputeType landlord_tenant', () => {
    expect(paLandlordTenant.state).toBe('PA')
    expect(paLandlordTenant.disputeType).toBe('landlord_tenant')
  })

  it('includes at least 5 required sections', () => {
    expect(paLandlordTenant.requiredSections.length).toBeGreaterThanOrEqual(5)
  })

  it('includes required petition sections', () => {
    const sectionIds = paLandlordTenant.requiredSections.map(s => s.id)
    expect(sectionIds).toContain('caption')
    expect(sectionIds).toContain('facts')
    expect(sectionIds).toContain('defenses')
    expect(sectionIds).toContain('counterclaims')
    expect(sectionIds).toContain('verification')
    expect(sectionIds).toContain('certificate_of_service')
  })

  it('has legal elements for defenses', () => {
    const defenses = paLandlordTenant.requiredSections.find(s => s.id === 'defenses')
    expect(defenses?.legalElements).toBeDefined()
    expect(defenses!.legalElements!.length).toBeGreaterThanOrEqual(3)
  })

  it('has step validations for facts step requiring lease_start_date', () => {
    expect(paLandlordTenant.stepValidations.facts).toBeDefined()
    expect(paLandlordTenant.stepValidations.facts.required).toContain('lease_start_date')
  })

  it('has step validations for claims step requiring defense_type', () => {
    expect(paLandlordTenant.stepValidations.claims).toBeDefined()
    expect(paLandlordTenant.stepValidations.claims.required).toContain('defense_type')
  })

  it('has at least 7 glossary entries', () => {
    expect(paLandlordTenant.glossary.length).toBeGreaterThanOrEqual(7)
  })

  it('maps every rejectionReason to a valid wizard step', () => {
    const validSteps = ['preflight', 'parties', 'venue', 'facts', 'claims', 'relief', 'how_to_file', 'review']
    for (const r of paLandlordTenant.rejectionReasons) {
      expect(validSteps).toContain(r.wizardStep)
    }
  })

  it('glossary covers PA-specific terms', () => {
    const terms = paLandlordTenant.glossary.map(g => g.term)
    expect(terms).toContain('Ejectment')
    expect(terms).toContain('Security Deposit')
    expect(terms).toContain('Implied Warranty of Habitability')
    expect(terms).toContain('Supersedeas Bond')
    expect(terms).toContain('Magisterial District Court')
    expect(terms).toContain('Utility Service Tenants Rights Act')
  })
})
