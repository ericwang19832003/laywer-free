import { describe, it, expect } from 'vitest'
import { jurisdictionRuleConfigSchema } from '@lawyer-free/shared/jurisdiction-rules/schema'
import { paProperty } from '@lawyer-free/shared/jurisdiction-rules/pa/property'

describe('PA property config', () => {
  it('passes schema validation', () => {
    const result = jurisdictionRuleConfigSchema.safeParse(paProperty)
    expect(result.success).toBe(true)
  })

  it('has state PA and disputeType property', () => {
    expect(paProperty.state).toBe('PA')
    expect(paProperty.disputeType).toBe('property')
  })

  it('includes required petition sections', () => {
    const sectionIds = paProperty.requiredSections.map(s => s.id)
    expect(sectionIds).toContain('caption')
    expect(sectionIds).toContain('facts')
    expect(sectionIds).toContain('liability_basis')
    expect(sectionIds).toContain('damages')
    expect(sectionIds).toContain('verification')
    expect(sectionIds).toContain('certificate_of_service')
  })

  it('has legal elements for liability_basis section', () => {
    const liabilityBasis = paProperty.requiredSections.find(s => s.id === 'liability_basis')
    expect(liabilityBasis?.legalElements).toBeDefined()
    expect(liabilityBasis!.legalElements!.length).toBeGreaterThanOrEqual(4)
  })

  it('references PA-specific statutes in liability basis', () => {
    const liabilityBasis = paProperty.requiredSections.find(s => s.id === 'liability_basis')
    const elements = liabilityBasis!.legalElements!.join(' ')
    expect(elements).toContain('42 Pa.C.S. §5524')
    expect(elements).toContain('18 Pa.C.S. §3503')
    expect(elements).toContain('18 Pa.C.S. §3304')
  })

  it('has at least 7 glossary entries', () => {
    expect(paProperty.glossary.length).toBeGreaterThanOrEqual(7)
  })

  it('includes key glossary terms', () => {
    const terms = paProperty.glossary.map(g => g.term)
    expect(terms).toContain('Trespass')
    expect(terms).toContain('Conversion')
    expect(terms).toContain('Nuisance')
    expect(terms).toContain('Diminished Value')
    expect(terms).toContain('Property Damage')
    expect(terms).toContain('Statute of Limitations')
    expect(terms).toContain('Loss of Use')
  })

  it('has step validations for facts with required incident_date', () => {
    expect(paProperty.stepValidations.facts).toBeDefined()
    expect(paProperty.stepValidations.facts.required).toContain('incident_date')
  })

  it('has step validations for claims with required liability_type', () => {
    expect(paProperty.stepValidations.claims).toBeDefined()
    expect(paProperty.stepValidations.claims.required).toContain('liability_type')
  })

  it('references 2-year statute of limitations', () => {
    const solEntry = paProperty.glossary.find(g => g.term === 'Statute of Limitations')
    expect(solEntry?.plainEnglish).toContain('2-year')
  })

  it('references Pa.R.C.P. 1006 venue rule in rejection reasons', () => {
    const venueRejection = paProperty.rejectionReasons.find(r => r.wizardStep === 'venue')
    expect(venueRejection?.howToAvoid).toContain('Pa.R.C.P. 1006')
  })

  it('maps every rejectionReason to a valid wizard step', () => {
    const validSteps = ['preflight', 'parties', 'venue', 'facts', 'claims', 'relief', 'how_to_file', 'review']
    for (const r of paProperty.rejectionReasons) {
      expect(validSteps).toContain(r.wizardStep)
    }
  })
})
