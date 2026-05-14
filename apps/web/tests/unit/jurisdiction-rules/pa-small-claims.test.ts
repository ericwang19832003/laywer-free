import { describe, it, expect } from 'vitest'
import { jurisdictionRuleConfigSchema } from '@lawyer-free/shared/jurisdiction-rules/schema'
import { paSmallClaims } from '@lawyer-free/shared/jurisdiction-rules/pa/small_claims'

describe('PA small claims config', () => {
  it('passes schema validation', () => {
    const result = jurisdictionRuleConfigSchema.safeParse(paSmallClaims)
    expect(result.success).toBe(true)
  })

  it('has state PA and disputeType small_claims', () => {
    expect(paSmallClaims.state).toBe('PA')
    expect(paSmallClaims.disputeType).toBe('small_claims')
  })

  it('includes required petition sections', () => {
    const sectionIds = paSmallClaims.requiredSections.map(s => s.id)
    expect(sectionIds).toContain('caption')
    expect(sectionIds).toContain('facts')
    expect(sectionIds).toContain('claim_basis')
    expect(sectionIds).toContain('damages')
    expect(sectionIds).toContain('certificate_of_service')
  })

  it('has legal elements for claim_basis section', () => {
    const claimBasis = paSmallClaims.requiredSections.find(s => s.id === 'claim_basis')
    expect(claimBasis?.legalElements).toBeDefined()
    expect(claimBasis!.legalElements!.length).toBeGreaterThanOrEqual(2)
  })

  it('has legal elements for damages section', () => {
    const damages = paSmallClaims.requiredSections.find(s => s.id === 'damages')
    expect(damages?.legalElements).toBeDefined()
    expect(damages!.legalElements!.length).toBeGreaterThanOrEqual(3)
  })

  it('references $12,000 jurisdiction limit in filing rules', () => {
    expect(paSmallClaims.filingRules.courtName).toContain('12,000')
  })

  it('mentions first class mail service requirement', () => {
    expect(paSmallClaims.filingRules.serviceRequirements).toContain('first class mail')
  })

  it('mentions 60-day hearing requirement', () => {
    expect(paSmallClaims.filingRules.serviceRequirements).toContain('60 days')
  })

  it('has step validations for facts step with incident_date required', () => {
    expect(paSmallClaims.stepValidations.facts).toBeDefined()
    expect(paSmallClaims.stepValidations.facts.required).toContain('incident_date')
  })

  it('has step validations for claims step with claim_type required', () => {
    expect(paSmallClaims.stepValidations.claims).toBeDefined()
    expect(paSmallClaims.stepValidations.claims.required).toContain('claim_type')
  })

  it('warns about $12,000 limit in claims step', () => {
    const warnings = paSmallClaims.stepValidations.claims.warnings
    const limitWarning = warnings.find(w => w.condition === 'amount_may_exceed_jurisdiction')
    expect(limitWarning).toBeDefined()
    expect(limitWarning!.message).toContain('12,000')
  })

  it('has at least 7 glossary entries', () => {
    expect(paSmallClaims.glossary.length).toBeGreaterThanOrEqual(7)
  })

  it('includes key glossary terms', () => {
    const terms = paSmallClaims.glossary.map(g => g.term)
    expect(terms).toContain('Magisterial District Court')
    expect(terms).toContain('Trial de Novo')
    expect(terms).toContain('Default Judgment')
    expect(terms).toContain('Counterclaim')
    expect(terms).toContain('In Forma Pauperis')
    expect(terms).toContain('First Class Mail Service')
    expect(terms).toContain('Appeal')
  })

  it('references 30-day appeal window in glossary', () => {
    const appealEntry = paSmallClaims.glossary.find(g => g.term === 'Appeal')
    expect(appealEntry?.plainEnglish).toContain('30 days')
    expect(appealEntry?.plainEnglish).toContain('Pa.R.C.P.M.D.J. 1002')
  })

  it('references counterclaim 5-day rule in glossary', () => {
    const counterclaim = paSmallClaims.glossary.find(g => g.term === 'Counterclaim')
    expect(counterclaim?.plainEnglish).toContain('5 days')
  })

  it('maps every rejectionReason to a valid wizard step', () => {
    const validSteps = ['preflight', 'parties', 'venue', 'facts', 'claims', 'relief', 'how_to_file', 'review']
    for (const r of paSmallClaims.rejectionReasons) {
      expect(validSteps).toContain(r.wizardStep)
    }
  })
})
