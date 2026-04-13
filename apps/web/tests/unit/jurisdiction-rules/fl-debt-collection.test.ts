import { describe, it, expect } from 'vitest'
import { jurisdictionRuleConfigSchema } from '@lawyer-free/shared/jurisdiction-rules/schema'
import { flDebtCollection } from '@lawyer-free/shared/jurisdiction-rules/fl'

describe('FL debt collection config', () => {
  it('passes schema validation', () => {
    const result = jurisdictionRuleConfigSchema.safeParse(flDebtCollection)
    expect(result.success).toBe(true)
  })

  it('has state FL and disputeType debt_collection', () => {
    expect(flDebtCollection.state).toBe('FL')
    expect(flDebtCollection.disputeType).toBe('debt_collection')
  })

  it('includes at least 5 required petition sections', () => {
    const sectionIds = flDebtCollection.requiredSections.map(s => s.id)
    expect(sectionIds.length).toBeGreaterThanOrEqual(5)
    expect(sectionIds).toContain('caption')
    expect(sectionIds).toContain('general_denial')
    expect(sectionIds).toContain('affirmative_defenses')
    expect(sectionIds).toContain('verification')
    expect(sectionIds).toContain('certificate_of_service')
  })

  it('has legal elements for affirmative defenses', () => {
    const affDefenses = flDebtCollection.requiredSections.find(s => s.id === 'affirmative_defenses')
    expect(affDefenses?.legalElements).toBeDefined()
    expect(affDefenses!.legalElements!.length).toBeGreaterThanOrEqual(3)
  })

  it('has step validations requiring debt_origination_date for facts', () => {
    expect(flDebtCollection.stepValidations.facts).toBeDefined()
    expect(flDebtCollection.stepValidations.facts.required).toContain('debt_origination_date')
  })

  it('has step validations requiring defense_type for claims', () => {
    expect(flDebtCollection.stepValidations.claims).toBeDefined()
    expect(flDebtCollection.stepValidations.claims.required).toContain('defense_type')
  })

  it('has at least 7 glossary entries', () => {
    expect(flDebtCollection.glossary.length).toBeGreaterThanOrEqual(7)
  })

  it('maps every rejectionReason to a valid wizard step', () => {
    const validSteps = ['preflight', 'parties', 'venue', 'facts', 'claims', 'relief', 'how_to_file', 'review']
    for (const r of flDebtCollection.rejectionReasons) {
      expect(validSteps).toContain(r.wizardStep)
    }
  })
})
