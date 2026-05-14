import { describe, it, expect } from 'vitest'
import { jurisdictionRuleConfigSchema } from '@lawyer-free/shared/jurisdiction-rules/schema'
import { caSmallClaims } from '@lawyer-free/shared/jurisdiction-rules/ca/small_claims'

describe('CA small claims config', () => {
  it('passes schema validation', () => {
    const result = jurisdictionRuleConfigSchema.safeParse(caSmallClaims)
    expect(result.success).toBe(true)
  })

  it('has state CA and disputeType small_claims', () => {
    expect(caSmallClaims.state).toBe('CA')
    expect(caSmallClaims.disputeType).toBe('small_claims')
  })

  it('includes required petition sections', () => {
    const sectionIds = caSmallClaims.requiredSections.map(s => s.id)
    expect(sectionIds).toContain('caption')
    expect(sectionIds).toContain('facts')
    expect(sectionIds).toContain('claim_basis')
    expect(sectionIds).toContain('damages')
    expect(sectionIds).toContain('proof_of_service')
  })

  it('has legal elements for facts section', () => {
    const facts = caSmallClaims.requiredSections.find(s => s.id === 'facts')
    expect(facts?.legalElements).toBeDefined()
    expect(facts!.legalElements!.length).toBeGreaterThanOrEqual(4)
  })

  it('has legal elements for claim_basis section', () => {
    const claimBasis = caSmallClaims.requiredSections.find(s => s.id === 'claim_basis')
    expect(claimBasis?.legalElements).toBeDefined()
    expect(claimBasis!.legalElements!.length).toBeGreaterThanOrEqual(2)
  })

  it('has step validations for facts step', () => {
    expect(caSmallClaims.stepValidations.facts).toBeDefined()
    expect(caSmallClaims.stepValidations.facts.required.length).toBeGreaterThan(0)
    expect(caSmallClaims.stepValidations.facts.required).toContain('incident_date')
  })

  it('has step validations for claims step', () => {
    expect(caSmallClaims.stepValidations.claims).toBeDefined()
    expect(caSmallClaims.stepValidations.claims.required).toContain('claim_type')
  })

  it('has step validations for relief step', () => {
    expect(caSmallClaims.stepValidations.relief).toBeDefined()
    expect(caSmallClaims.stepValidations.relief.warnings.length).toBeGreaterThan(0)
  })

  it('has at least 7 glossary entries', () => {
    expect(caSmallClaims.glossary.length).toBeGreaterThanOrEqual(7)
  })

  it('includes key glossary terms', () => {
    const terms = caSmallClaims.glossary.map(g => g.term)
    expect(terms).toContain('Small Claims Court')
    expect(terms).toContain('SC-100 Form')
    expect(terms).toContain('Personal Service')
    expect(terms).toContain('Substituted Service')
    expect(terms).toContain('Default Judgment')
    expect(terms).toContain('Counterclaim')
    expect(terms).toContain('Fee Waiver')
  })

  it('maps every rejectionReason to a valid wizard step', () => {
    const validSteps = ['preflight', 'parties', 'venue', 'facts', 'claims', 'relief', 'how_to_file', 'review']
    for (const r of caSmallClaims.rejectionReasons) {
      expect(validSteps).toContain(r.wizardStep)
    }
  })

  it('references CCP statutes in filing rules', () => {
    expect(caSmallClaims.filingRules.courtName).toContain('CCP')
    expect(caSmallClaims.filingRules.serviceRequirements).toContain('CCP §116.340')
  })

  it('includes SC-100 form in rejection reasons', () => {
    const sc100Rejection = caSmallClaims.rejectionReasons.find(r => r.reason.includes('SC-100'))
    expect(sc100Rejection).toBeDefined()
  })
})
