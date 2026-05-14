import { describe, it, expect } from 'vitest'
import { jurisdictionRuleConfigSchema } from '@lawyer-free/shared/jurisdiction-rules/schema'
import { txProperty } from '@lawyer-free/shared/jurisdiction-rules/tx'

describe('TX property config', () => {
  it('passes schema validation', () => {
    const result = jurisdictionRuleConfigSchema.safeParse(txProperty)
    expect(result.success).toBe(true)
  })

  it('has state TX and disputeType property', () => {
    expect(txProperty.state).toBe('TX')
    expect(txProperty.disputeType).toBe('property')
  })

  it('includes at least 5 required sections', () => {
    const sectionIds = txProperty.requiredSections.map(s => s.id)
    expect(sectionIds.length).toBeGreaterThanOrEqual(5)
    expect(sectionIds).toContain('caption')
    expect(sectionIds).toContain('facts')
    expect(sectionIds).toContain('liability_basis')
    expect(sectionIds).toContain('damages')
    expect(sectionIds).toContain('verification')
    expect(sectionIds).toContain('certificate_of_service')
  })

  it('has at least 7 glossary entries', () => {
    expect(txProperty.glossary.length).toBeGreaterThanOrEqual(7)
  })

  it('has step validations for facts with required incident_date', () => {
    expect(txProperty.stepValidations.facts).toBeDefined()
    expect(txProperty.stepValidations.facts.required).toContain('incident_date')
  })

  it('has step validations for claims with required liability_type', () => {
    expect(txProperty.stepValidations.claims).toBeDefined()
    expect(txProperty.stepValidations.claims.required).toContain('liability_type')
  })

  it('has step validations for relief with warnings', () => {
    expect(txProperty.stepValidations.relief).toBeDefined()
    expect(txProperty.stepValidations.relief.warnings.length).toBeGreaterThan(0)
  })

  it('maps every rejectionReason to a valid wizard step', () => {
    const validSteps = ['preflight', 'parties', 'venue', 'facts', 'claims', 'relief', 'how_to_file', 'review']
    for (const r of txProperty.rejectionReasons) {
      expect(validSteps).toContain(r.wizardStep)
    }
  })
})
