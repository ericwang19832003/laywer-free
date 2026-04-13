import { describe, it, expect } from 'vitest'
import { jurisdictionRuleConfigSchema } from '@lawyer-free/shared/jurisdiction-rules/schema'
import { txSmallClaims } from '@lawyer-free/shared/jurisdiction-rules/tx/small_claims'

describe('TX small claims config', () => {
  it('passes schema validation', () => {
    const result = jurisdictionRuleConfigSchema.safeParse(txSmallClaims)
    expect(result.success).toBe(true)
  })

  it('has state TX and disputeType small_claims', () => {
    expect(txSmallClaims.state).toBe('TX')
    expect(txSmallClaims.disputeType).toBe('small_claims')
  })

  it('includes required petition sections', () => {
    const sectionIds = txSmallClaims.requiredSections.map(s => s.id)
    expect(sectionIds).toContain('caption')
    expect(sectionIds).toContain('facts')
    expect(sectionIds).toContain('claim_basis')
    expect(sectionIds).toContain('damages')
    expect(sectionIds).toContain('verification')
    expect(sectionIds).toContain('certificate_of_service')
  })

  it('has legal elements for claim_basis section', () => {
    const claimBasis = txSmallClaims.requiredSections.find(s => s.id === 'claim_basis')
    expect(claimBasis?.legalElements).toBeDefined()
    expect(claimBasis!.legalElements!.length).toBeGreaterThanOrEqual(2)
  })

  it('has legal elements for damages section', () => {
    const damages = txSmallClaims.requiredSections.find(s => s.id === 'damages')
    expect(damages?.legalElements).toBeDefined()
    expect(damages!.legalElements!.length).toBeGreaterThanOrEqual(3)
  })

  it('has step validations for facts step with incident_date required', () => {
    expect(txSmallClaims.stepValidations.facts).toBeDefined()
    expect(txSmallClaims.stepValidations.facts.required).toContain('incident_date')
  })

  it('has step validations for claims step with claim_type required', () => {
    expect(txSmallClaims.stepValidations.claims).toBeDefined()
    expect(txSmallClaims.stepValidations.claims.required).toContain('claim_type')
  })

  it('has step validations for relief step with itemization warnings', () => {
    expect(txSmallClaims.stepValidations.relief).toBeDefined()
    expect(txSmallClaims.stepValidations.relief.warnings.length).toBeGreaterThan(0)
  })

  it('has at least 7 glossary entries', () => {
    expect(txSmallClaims.glossary.length).toBeGreaterThanOrEqual(7)
  })

  it('includes key glossary terms', () => {
    const terms = txSmallClaims.glossary.map(g => g.term)
    expect(terms).toContain('Small Claims')
    expect(terms).toContain('Default Judgment')
    expect(terms).toContain('Preponderance of the Evidence')
    expect(terms).toContain('Service of Process')
    expect(terms).toContain('Counterclaim')
    expect(terms).toContain('Fee Waiver')
  })

  it('maps every rejectionReason to a valid wizard step', () => {
    const validSteps = ['preflight', 'parties', 'venue', 'facts', 'claims', 'relief', 'how_to_file', 'review']
    for (const r of txSmallClaims.rejectionReasons) {
      expect(validSteps).toContain(r.wizardStep)
    }
  })

  it('references $20,000 jurisdiction limit in filing rules', () => {
    expect(txSmallClaims.filingRules.courtName).toContain('20,000')
  })

  it('mentions 14-day service requirement', () => {
    expect(txSmallClaims.filingRules.serviceRequirements).toContain('14 days')
  })
})
