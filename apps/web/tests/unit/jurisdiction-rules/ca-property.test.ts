import { describe, it, expect } from 'vitest'
import { jurisdictionRuleConfigSchema } from '@lawyer-free/shared/jurisdiction-rules/schema'
import { caProperty } from '@lawyer-free/shared/jurisdiction-rules/ca/property'

describe('CA property config', () => {
  it('passes schema validation', () => {
    const result = jurisdictionRuleConfigSchema.safeParse(caProperty)
    expect(result.success).toBe(true)
  })

  it('has state CA and disputeType property', () => {
    expect(caProperty.state).toBe('CA')
    expect(caProperty.disputeType).toBe('property')
  })

  it('includes at least 5 required sections', () => {
    const sectionIds = caProperty.requiredSections.map(s => s.id)
    expect(sectionIds.length).toBeGreaterThanOrEqual(5)
    expect(sectionIds).toContain('caption')
    expect(sectionIds).toContain('facts')
    expect(sectionIds).toContain('liability_basis')
    expect(sectionIds).toContain('damages')
    expect(sectionIds).toContain('verification')
    expect(sectionIds).toContain('proof_of_service')
  })

  it('has legal elements for liability basis covering trespass, negligence, conversion, and nuisance', () => {
    const liability = caProperty.requiredSections.find(s => s.id === 'liability_basis')
    expect(liability?.legalElements).toBeDefined()
    expect(liability!.legalElements!.length).toBeGreaterThanOrEqual(4)
    const joined = liability!.legalElements!.join(' ')
    expect(joined).toContain('Trespass')
    expect(joined).toContain('Conversion')
    expect(joined).toContain('nuisance')
    expect(joined).toContain('Negligent')
  })

  it('has step validations for facts with required incident_date', () => {
    expect(caProperty.stepValidations.facts).toBeDefined()
    expect(caProperty.stepValidations.facts.required).toContain('incident_date')
  })

  it('has step validations for claims with required liability_type', () => {
    expect(caProperty.stepValidations.claims).toBeDefined()
    expect(caProperty.stepValidations.claims.required).toContain('liability_type')
  })

  it('has step validations for relief with warnings', () => {
    expect(caProperty.stepValidations.relief).toBeDefined()
    expect(caProperty.stepValidations.relief.warnings.length).toBeGreaterThan(0)
  })

  it('has at least 7 glossary entries', () => {
    expect(caProperty.glossary.length).toBeGreaterThanOrEqual(7)
  })

  it('maps every rejectionReason to a valid wizard step', () => {
    const validSteps = ['preflight', 'parties', 'venue', 'facts', 'claims', 'relief', 'how_to_file', 'review']
    for (const r of caProperty.rejectionReasons) {
      expect(validSteps).toContain(r.wizardStep)
    }
  })

  it('references California-specific statutes in glossary', () => {
    const allText = caProperty.glossary.map(g => g.plainEnglish).join(' ')
    expect(allText).toContain('CCP')
    expect(allText).toContain('Civil Code')
  })

  it('uses proof_of_service instead of certificate_of_service', () => {
    const sectionIds = caProperty.requiredSections.map(s => s.id)
    expect(sectionIds).toContain('proof_of_service')
    expect(sectionIds).not.toContain('certificate_of_service')
  })

  it('includes nuisance and treble damages in glossary', () => {
    const terms = caProperty.glossary.map(g => g.term)
    expect(terms).toContain('Nuisance')
    expect(terms).toContain('Treble Damages')
  })
})
