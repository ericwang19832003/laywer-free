import { describe, it, expect } from 'vitest'
import { jurisdictionRuleConfigSchema } from '@lawyer-free/shared/jurisdiction-rules/schema'
import { flSmallClaims } from '@lawyer-free/shared/jurisdiction-rules/fl/small_claims'

describe('FL small claims config', () => {
  it('passes schema validation', () => {
    const result = jurisdictionRuleConfigSchema.safeParse(flSmallClaims)
    expect(result.success).toBe(true)
  })

  it('has state FL and disputeType small_claims', () => {
    expect(flSmallClaims.state).toBe('FL')
    expect(flSmallClaims.disputeType).toBe('small_claims')
  })

  it('includes required petition sections', () => {
    const sectionIds = flSmallClaims.requiredSections.map(s => s.id)
    expect(sectionIds.length).toBeGreaterThanOrEqual(5)
    expect(sectionIds).toContain('caption')
    expect(sectionIds).toContain('facts')
    expect(sectionIds).toContain('claim_basis')
    expect(sectionIds).toContain('damages')
    expect(sectionIds).toContain('certificate_of_service')
  })

  it('has legal elements for facts section', () => {
    const facts = flSmallClaims.requiredSections.find(s => s.id === 'facts')
    expect(facts?.legalElements).toBeDefined()
    expect(facts!.legalElements!.length).toBeGreaterThanOrEqual(4)
  })

  it('has legal elements for claim_basis section', () => {
    const claimBasis = flSmallClaims.requiredSections.find(s => s.id === 'claim_basis')
    expect(claimBasis?.legalElements).toBeDefined()
    expect(claimBasis!.legalElements!.length).toBeGreaterThanOrEqual(2)
  })

  it('has step validations for facts step with required incident_date', () => {
    expect(flSmallClaims.stepValidations.facts).toBeDefined()
    expect(flSmallClaims.stepValidations.facts.required.length).toBeGreaterThan(0)
    expect(flSmallClaims.stepValidations.facts.required).toContain('incident_date')
  })

  it('has step validations for claims step with required claim_type', () => {
    expect(flSmallClaims.stepValidations.claims).toBeDefined()
    expect(flSmallClaims.stepValidations.claims.required).toContain('claim_type')
  })

  it('has step validations for claims with warning about $8K limit', () => {
    const warnings = flSmallClaims.stepValidations.claims.warnings
    const limitWarning = warnings.find(w => w.message.includes('8,000'))
    expect(limitWarning).toBeDefined()
  })

  it('has step validations for relief with warnings about itemizing', () => {
    expect(flSmallClaims.stepValidations.relief).toBeDefined()
    const warnings = flSmallClaims.stepValidations.relief.warnings
    const itemizeWarning = warnings.find(w => w.message.toLowerCase().includes('itemize'))
    expect(itemizeWarning).toBeDefined()
  })

  it('has at least 7 glossary entries', () => {
    expect(flSmallClaims.glossary.length).toBeGreaterThanOrEqual(7)
  })

  it('includes key glossary terms', () => {
    const terms = flSmallClaims.glossary.map(g => g.term)
    expect(terms).toContain('Small Claims Court')
    expect(terms).toContain('County Court')
    expect(terms).toContain('Pre-Trial Mediation')
    expect(terms).toContain('Default Judgment')
    expect(terms).toContain('Counterclaim')
    expect(terms).toContain('Service of Process')
    expect(terms).toContain('Fee Waiver')
  })

  it('maps every rejectionReason to a valid wizard step', () => {
    const validSteps = ['preflight', 'parties', 'venue', 'facts', 'claims', 'relief', 'how_to_file', 'review']
    for (const r of flSmallClaims.rejectionReasons) {
      expect(validSteps).toContain(r.wizardStep)
    }
  })

  it('references FL Stat. §34.01 in filing rules', () => {
    expect(flSmallClaims.filingRules.courtName).toContain('FL Stat. §34.01')
  })

  it('mentions $8,000 jurisdictional limit in rejection reasons', () => {
    const limitRejection = flSmallClaims.rejectionReasons.find(r => r.reason.includes('$8,000'))
    expect(limitRejection).toBeDefined()
  })
})
