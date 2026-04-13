import { describe, it, expect } from 'vitest'
import { jurisdictionRuleConfigSchema } from '@lawyer-free/shared/jurisdiction-rules/schema'
import { paBusiness } from '@lawyer-free/shared/jurisdiction-rules/pa/business'

describe('PA business config', () => {
  it('passes schema validation', () => {
    const result = jurisdictionRuleConfigSchema.safeParse(paBusiness)
    expect(result.success).toBe(true)
  })

  it('has state PA and disputeType business', () => {
    expect(paBusiness.state).toBe('PA')
    expect(paBusiness.disputeType).toBe('business')
  })

  it('includes at least 5 required sections', () => {
    expect(paBusiness.requiredSections.length).toBeGreaterThanOrEqual(5)
  })

  it('includes required petition sections', () => {
    const sectionIds = paBusiness.requiredSections.map(s => s.id)
    expect(sectionIds).toContain('caption')
    expect(sectionIds).toContain('facts')
    expect(sectionIds).toContain('claims')
    expect(sectionIds).toContain('damages')
    expect(sectionIds).toContain('injunctive_relief')
    expect(sectionIds).toContain('verification')
    expect(sectionIds).toContain('certificate_of_service')
  })

  it('has legal elements for claims section', () => {
    const claims = paBusiness.requiredSections.find(s => s.id === 'claims')
    expect(claims?.legalElements).toBeDefined()
    expect(claims!.legalElements!.length).toBeGreaterThanOrEqual(3)
  })

  it('has step validations for facts step requiring relationship_start_date', () => {
    expect(paBusiness.stepValidations.facts).toBeDefined()
    expect(paBusiness.stepValidations.facts.required).toContain('relationship_start_date')
  })

  it('has step validations for claims step requiring claim_type', () => {
    expect(paBusiness.stepValidations.claims).toBeDefined()
    expect(paBusiness.stepValidations.claims.required).toContain('claim_type')
  })

  it('has at least 8 glossary entries', () => {
    expect(paBusiness.glossary.length).toBeGreaterThanOrEqual(8)
  })

  it('maps every rejectionReason to a valid wizard step', () => {
    const validSteps = ['preflight', 'parties', 'venue', 'facts', 'claims', 'relief', 'how_to_file', 'review']
    for (const r of paBusiness.rejectionReasons) {
      expect(validSteps).toContain(r.wizardStep)
    }
  })

  it('glossary covers PA business-specific terms', () => {
    const terms = paBusiness.glossary.map(g => g.term)
    expect(terms).toContain('Fiduciary Duty')
    expect(terms).toContain('Trade Secret')
    expect(terms).toContain('Non-Compete (Reasonableness Test)')
    expect(terms).toContain('UTPCPL (Unfair Trade Practices and Consumer Protection Law)')
    expect(terms).toContain('Shareholder Oppression')
    expect(terms).toContain('Injunctive Relief')
    expect(terms).toContain('Derivative Action')
    expect(terms).toContain('Commerce Court')
  })
})
