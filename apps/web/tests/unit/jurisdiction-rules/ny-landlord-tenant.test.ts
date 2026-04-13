import { describe, it, expect } from 'vitest'
import { jurisdictionRuleConfigSchema } from '@lawyer-free/shared/jurisdiction-rules/schema'
import { nyLandlordTenant } from '@lawyer-free/shared/jurisdiction-rules/ny/landlord_tenant'

describe('NY landlord tenant config', () => {
  it('passes schema validation', () => {
    const result = jurisdictionRuleConfigSchema.safeParse(nyLandlordTenant)
    expect(result.success).toBe(true)
  })

  it('has state NY and disputeType landlord_tenant', () => {
    expect(nyLandlordTenant.state).toBe('NY')
    expect(nyLandlordTenant.disputeType).toBe('landlord_tenant')
  })

  it('includes required petition sections', () => {
    const sectionIds = nyLandlordTenant.requiredSections.map(s => s.id)
    expect(sectionIds).toContain('caption')
    expect(sectionIds).toContain('facts')
    expect(sectionIds).toContain('defenses')
    expect(sectionIds).toContain('counterclaims')
    expect(sectionIds).toContain('verification')
    expect(sectionIds).toContain('proof_of_service')
  })

  it('has legal elements for defenses', () => {
    const defenses = nyLandlordTenant.requiredSections.find(s => s.id === 'defenses')
    expect(defenses?.legalElements).toBeDefined()
    expect(defenses!.legalElements!.length).toBeGreaterThanOrEqual(3)
  })

  it('has legal elements for counterclaims', () => {
    const counterclaims = nyLandlordTenant.requiredSections.find(s => s.id === 'counterclaims')
    expect(counterclaims?.legalElements).toBeDefined()
    expect(counterclaims!.legalElements!.length).toBeGreaterThanOrEqual(3)
  })

  it('has step validations for facts step with lease_start_date required', () => {
    expect(nyLandlordTenant.stepValidations.facts).toBeDefined()
    expect(nyLandlordTenant.stepValidations.facts.required).toContain('lease_start_date')
  })

  it('has step validations for claims step with defense_type required', () => {
    expect(nyLandlordTenant.stepValidations.claims).toBeDefined()
    expect(nyLandlordTenant.stepValidations.claims.required).toContain('defense_type')
  })

  it('has step validations for parties step', () => {
    expect(nyLandlordTenant.stepValidations.parties).toBeDefined()
    expect(nyLandlordTenant.stepValidations.parties.warnings.length).toBeGreaterThan(0)
  })

  it('has at least 8 glossary entries', () => {
    expect(nyLandlordTenant.glossary.length).toBeGreaterThanOrEqual(8)
  })

  it('includes key glossary terms', () => {
    const terms = nyLandlordTenant.glossary.map(g => g.term)
    expect(terms).toContain('Summary Proceeding')
    expect(terms).toContain('Warranty of Habitability')
    expect(terms).toContain('HSTPA (Housing Stability and Tenant Protection Act)')
    expect(terms).toContain('Rent Stabilization')
    expect(terms).toContain('Predicate Notice')
    expect(terms).toContain('Retaliatory Eviction')
    expect(terms).toContain('Security Deposit')
    expect(terms).toContain('Housing Court')
    expect(terms).toContain('Good Cause Eviction')
  })

  it('maps every rejectionReason to a valid wizard step', () => {
    const validSteps = ['preflight', 'parties', 'venue', 'facts', 'claims', 'relief', 'how_to_file', 'review']
    for (const r of nyLandlordTenant.rejectionReasons) {
      expect(validSteps).toContain(r.wizardStep)
    }
  })

  it('references New York-specific statutes in defenses', () => {
    const defenses = nyLandlordTenant.requiredSections.find(s => s.id === 'defenses')
    const allElements = defenses!.legalElements!.join(' ')
    expect(allElements).toContain('RPAPL §711')
    expect(allElements).toContain('RPL §226-c')
    expect(allElements).toContain('RPL §227-a')
    expect(allElements).toContain('RPL §223-b')
    expect(allElements).toContain('NYC Admin Code §26-516')
  })

  it('references HSTPA and GOL §7-108 in counterclaims', () => {
    const counterclaims = nyLandlordTenant.requiredSections.find(s => s.id === 'counterclaims')
    const allElements = counterclaims!.legalElements!.join(' ')
    expect(allElements).toContain('GOL §7-108')
    expect(allElements).toContain('RPL §227-a')
  })
})
