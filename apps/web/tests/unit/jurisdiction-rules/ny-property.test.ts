import { describe, it, expect } from 'vitest'
import { jurisdictionRuleConfigSchema } from '@lawyer-free/shared/jurisdiction-rules/schema'
import { nyProperty } from '@lawyer-free/shared/jurisdiction-rules/ny/property'

describe('NY property config', () => {
  it('passes schema validation', () => {
    const result = jurisdictionRuleConfigSchema.safeParse(nyProperty)
    expect(result.success).toBe(true)
  })

  it('has state NY and disputeType property', () => {
    expect(nyProperty.state).toBe('NY')
    expect(nyProperty.disputeType).toBe('property')
  })

  it('includes at least 5 required sections', () => {
    const sectionIds = nyProperty.requiredSections.map(s => s.id)
    expect(sectionIds.length).toBeGreaterThanOrEqual(5)
    expect(sectionIds).toContain('caption')
    expect(sectionIds).toContain('facts')
    expect(sectionIds).toContain('liability_basis')
    expect(sectionIds).toContain('damages')
    expect(sectionIds).toContain('verification')
    expect(sectionIds).toContain('proof_of_service')
  })

  it('has legal elements for liability basis covering trespass, negligence, conversion, and nuisance', () => {
    const liability = nyProperty.requiredSections.find(s => s.id === 'liability_basis')
    expect(liability?.legalElements).toBeDefined()
    expect(liability!.legalElements!.length).toBeGreaterThanOrEqual(4)
    const joined = liability!.legalElements!.join(' ')
    expect(joined).toContain('Trespass')
    expect(joined).toContain('Conversion')
    expect(joined).toContain('nuisance')
    expect(joined).toContain('Negligence')
  })

  it('has step validations for facts with required incident_date', () => {
    expect(nyProperty.stepValidations.facts).toBeDefined()
    expect(nyProperty.stepValidations.facts.required).toContain('incident_date')
  })

  it('has step validations for claims with required liability_type', () => {
    expect(nyProperty.stepValidations.claims).toBeDefined()
    expect(nyProperty.stepValidations.claims.required).toContain('liability_type')
  })

  it('has step validations for relief with warnings', () => {
    expect(nyProperty.stepValidations.relief).toBeDefined()
    expect(nyProperty.stepValidations.relief.warnings.length).toBeGreaterThan(0)
  })

  it('has at least 7 glossary entries', () => {
    expect(nyProperty.glossary.length).toBeGreaterThanOrEqual(7)
  })

  it('maps every rejectionReason to a valid wizard step', () => {
    const validSteps = ['preflight', 'parties', 'venue', 'facts', 'claims', 'relief', 'how_to_file', 'review']
    for (const r of nyProperty.rejectionReasons) {
      expect(validSteps).toContain(r.wizardStep)
    }
  })

  it('references New York-specific statutes in glossary', () => {
    const allText = nyProperty.glossary.map(g => g.plainEnglish).join(' ')
    expect(allText).toContain('CPLR')
  })

  it('uses proof_of_service instead of certificate_of_service', () => {
    const sectionIds = nyProperty.requiredSections.map(s => s.id)
    expect(sectionIds).toContain('proof_of_service')
    expect(sectionIds).not.toContain('certificate_of_service')
  })

  it('includes injunctive relief in glossary', () => {
    const terms = nyProperty.glossary.map(g => g.term)
    expect(terms).toContain('Injunctive Relief')
  })

  it('references CPLR venue rules in rejection reasons', () => {
    const allReasons = nyProperty.rejectionReasons.map(r => r.howToAvoid).join(' ')
    expect(allReasons).toContain('CPLR §503')
  })

  it('covers all four property dispute types in liability basis', () => {
    const liability = nyProperty.requiredSections.find(s => s.id === 'liability_basis')
    const joined = liability!.legalElements!.join(' ')
    expect(joined).toContain('Trespass')
    expect(joined).toContain('Conversion')
    expect(joined).toContain('nuisance')
    expect(joined).toContain('Property damage')
  })
})
