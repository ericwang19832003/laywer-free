import { describe, it, expect } from 'vitest'
import { jurisdictionRuleConfigSchema } from '@lawyer-free/shared/jurisdiction-rules/schema'
import { caLandlordTenant } from '@lawyer-free/shared/jurisdiction-rules/ca/landlord_tenant'

describe('CA landlord tenant config', () => {
  it('passes schema validation', () => {
    const result = jurisdictionRuleConfigSchema.safeParse(caLandlordTenant)
    expect(result.success).toBe(true)
  })

  it('has state CA and disputeType landlord_tenant', () => {
    expect(caLandlordTenant.state).toBe('CA')
    expect(caLandlordTenant.disputeType).toBe('landlord_tenant')
  })

  it('includes required petition sections', () => {
    const sectionIds = caLandlordTenant.requiredSections.map(s => s.id)
    expect(sectionIds).toContain('caption')
    expect(sectionIds).toContain('facts')
    expect(sectionIds).toContain('defenses')
    expect(sectionIds).toContain('counterclaims')
    expect(sectionIds).toContain('verification')
    expect(sectionIds).toContain('proof_of_service')
  })

  it('has legal elements for defenses', () => {
    const defenses = caLandlordTenant.requiredSections.find(s => s.id === 'defenses')
    expect(defenses?.legalElements).toBeDefined()
    expect(defenses!.legalElements!.length).toBeGreaterThanOrEqual(3)
  })

  it('has legal elements for counterclaims', () => {
    const counterclaims = caLandlordTenant.requiredSections.find(s => s.id === 'counterclaims')
    expect(counterclaims?.legalElements).toBeDefined()
    expect(counterclaims!.legalElements!.length).toBeGreaterThanOrEqual(3)
  })

  it('has step validations for facts step with lease_start_date required', () => {
    expect(caLandlordTenant.stepValidations.facts).toBeDefined()
    expect(caLandlordTenant.stepValidations.facts.required).toContain('lease_start_date')
  })

  it('has step validations for claims step with defense_type required', () => {
    expect(caLandlordTenant.stepValidations.claims).toBeDefined()
    expect(caLandlordTenant.stepValidations.claims.required).toContain('defense_type')
  })

  it('has step validations for parties step', () => {
    expect(caLandlordTenant.stepValidations.parties).toBeDefined()
    expect(caLandlordTenant.stepValidations.parties.warnings.length).toBeGreaterThan(0)
  })

  it('has at least 8 glossary entries', () => {
    expect(caLandlordTenant.glossary.length).toBeGreaterThanOrEqual(8)
  })

  it('includes key glossary terms', () => {
    const terms = caLandlordTenant.glossary.map(g => g.term)
    expect(terms).toContain('Unlawful Detainer')
    expect(terms).toContain('Just Cause Eviction')
    expect(terms).toContain('AB 1482 (Tenant Protection Act)')
    expect(terms).toContain('Security Deposit')
    expect(terms).toContain('Habitability')
    expect(terms).toContain('Retaliation')
    expect(terms).toContain('Rent Cap')
    expect(terms).toContain('Notice to Quit')
    expect(terms).toContain('Repair and Deduct')
  })

  it('maps every rejectionReason to a valid wizard step', () => {
    const validSteps = ['preflight', 'parties', 'venue', 'facts', 'claims', 'relief', 'how_to_file', 'review']
    for (const r of caLandlordTenant.rejectionReasons) {
      expect(validSteps).toContain(r.wizardStep)
    }
  })

  it('references California-specific statutes in defenses', () => {
    const defenses = caLandlordTenant.requiredSections.find(s => s.id === 'defenses')
    const allElements = defenses!.legalElements!.join(' ')
    expect(allElements).toContain('CCP §1161')
    expect(allElements).toContain('Civil Code §1942.5')
    expect(allElements).toContain('Civil Code §1946.2')
    expect(allElements).toContain('Gov Code §12955')
  })
})
