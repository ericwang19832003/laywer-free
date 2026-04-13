import { describe, it, expect } from 'vitest'
import { jurisdictionRuleConfigSchema } from '@lawyer-free/shared/jurisdiction-rules/schema'
import { flProperty } from '@lawyer-free/shared/jurisdiction-rules/fl/property'

describe('FL property config', () => {
  it('passes schema validation', () => {
    const result = jurisdictionRuleConfigSchema.safeParse(flProperty)
    expect(result.success).toBe(true)
  })

  it('has state FL and disputeType property', () => {
    expect(flProperty.state).toBe('FL')
    expect(flProperty.disputeType).toBe('property')
  })

  it('includes at least 5 required sections', () => {
    const sectionIds = flProperty.requiredSections.map(s => s.id)
    expect(sectionIds.length).toBeGreaterThanOrEqual(5)
    expect(sectionIds).toContain('caption')
    expect(sectionIds).toContain('facts')
    expect(sectionIds).toContain('liability_basis')
    expect(sectionIds).toContain('damages')
    expect(sectionIds).toContain('verification')
    expect(sectionIds).toContain('certificate_of_service')
  })

  it('has legal elements for liability basis covering trespass, negligence, conversion, nuisance, and theft', () => {
    const liability = flProperty.requiredSections.find(s => s.id === 'liability_basis')
    expect(liability?.legalElements).toBeDefined()
    expect(liability!.legalElements!.length).toBeGreaterThanOrEqual(5)
    const joined = liability!.legalElements!.join(' ')
    expect(joined).toContain('Trespass')
    expect(joined).toContain('Conversion')
    expect(joined).toContain('Nuisance')
    expect(joined).toContain('Negligent')
    expect(joined).toContain('Civil theft')
  })

  it('has step validations for facts with required incident_date', () => {
    expect(flProperty.stepValidations.facts).toBeDefined()
    expect(flProperty.stepValidations.facts.required).toContain('incident_date')
  })

  it('has step validations for claims with required liability_type', () => {
    expect(flProperty.stepValidations.claims).toBeDefined()
    expect(flProperty.stepValidations.claims.required).toContain('liability_type')
  })

  it('has step validations for relief with warnings', () => {
    expect(flProperty.stepValidations.relief).toBeDefined()
    expect(flProperty.stepValidations.relief.warnings.length).toBeGreaterThan(0)
  })

  it('has at least 7 glossary entries', () => {
    expect(flProperty.glossary.length).toBeGreaterThanOrEqual(7)
  })

  it('maps every rejectionReason to a valid wizard step', () => {
    const validSteps = ['preflight', 'parties', 'venue', 'facts', 'claims', 'relief', 'how_to_file', 'review']
    for (const r of flProperty.rejectionReasons) {
      expect(validSteps).toContain(r.wizardStep)
    }
  })

  it('references Florida-specific statutes in glossary', () => {
    const allText = flProperty.glossary.map(g => g.plainEnglish).join(' ')
    expect(allText).toContain('FL Stat.')
    expect(allText).toContain('§95.11')
  })

  it('uses certificate_of_service for Florida', () => {
    const sectionIds = flProperty.requiredSections.map(s => s.id)
    expect(sectionIds).toContain('certificate_of_service')
  })

  it('includes nuisance and treble damages in glossary', () => {
    const terms = flProperty.glossary.map(g => g.term)
    expect(terms).toContain('Nuisance')
    expect(terms.some(t => t.includes('Treble Damages'))).toBe(true)
  })
})
