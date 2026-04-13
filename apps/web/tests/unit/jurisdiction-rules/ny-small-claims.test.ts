import { describe, it, expect } from 'vitest'
import { jurisdictionRuleConfigSchema } from '@lawyer-free/shared/jurisdiction-rules/schema'
import { nySmallClaims } from '@lawyer-free/shared/jurisdiction-rules/ny/small_claims'

describe('NY small claims config', () => {
  it('passes schema validation', () => {
    const result = jurisdictionRuleConfigSchema.safeParse(nySmallClaims)
    expect(result.success).toBe(true)
  })

  it('has state NY and disputeType small_claims', () => {
    expect(nySmallClaims.state).toBe('NY')
    expect(nySmallClaims.disputeType).toBe('small_claims')
  })

  it('includes required petition sections', () => {
    const sectionIds = nySmallClaims.requiredSections.map(s => s.id)
    expect(sectionIds).toContain('caption')
    expect(sectionIds).toContain('facts')
    expect(sectionIds).toContain('claim_basis')
    expect(sectionIds).toContain('damages')
    expect(sectionIds).toContain('proof_of_service')
  })

  it('has legal elements for each required section', () => {
    for (const section of nySmallClaims.requiredSections) {
      expect(section.legalElements).toBeDefined()
      expect(section.legalElements!.length).toBeGreaterThanOrEqual(1)
    }
  })

  it('has step validations for facts with incident_date required', () => {
    expect(nySmallClaims.stepValidations.facts).toBeDefined()
    expect(nySmallClaims.stepValidations.facts.required).toContain('incident_date')
  })

  it('has step validations for claims with claim_type required', () => {
    expect(nySmallClaims.stepValidations.claims).toBeDefined()
    expect(nySmallClaims.stepValidations.claims.required).toContain('claim_type')
  })

  it('has step validations for relief', () => {
    expect(nySmallClaims.stepValidations.relief).toBeDefined()
    expect(nySmallClaims.stepValidations.relief.warnings.length).toBeGreaterThan(0)
  })

  it('has at least 7 glossary entries', () => {
    expect(nySmallClaims.glossary.length).toBeGreaterThanOrEqual(7)
  })

  it('includes key glossary terms', () => {
    const terms = nySmallClaims.glossary.map(g => g.term)
    expect(terms).toContain('Small Claims Court')
    expect(terms).toContain('Arbitration')
    expect(terms).toContain('Default Judgment')
    expect(terms).toContain('Counterclaim')
    expect(terms).toContain('Fee Waiver')
    expect(terms).toContain('Personal Service')
    expect(terms).toContain('Certified Mail Service')
  })

  it('maps every rejectionReason to a valid wizard step', () => {
    const validSteps = ['preflight', 'parties', 'venue', 'facts', 'claims', 'relief', 'how_to_file', 'review']
    for (const r of nySmallClaims.rejectionReasons) {
      expect(validSteps).toContain(r.wizardStep)
    }
  })

  it('references NY jurisdictional limits in filing rules', () => {
    expect(nySmallClaims.filingRules.courtName).toContain('10,000')
    expect(nySmallClaims.filingRules.courtName).toContain('5,000')
  })

  it('mentions certified and regular mail in service requirements', () => {
    expect(nySmallClaims.filingRules.serviceRequirements).toContain('certified mail')
    expect(nySmallClaims.filingRules.serviceRequirements).toContain('first-class mail')
  })
})
