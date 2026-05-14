import { describe, it, expect } from 'vitest'
import { jurisdictionRuleConfigSchema } from '@lawyer-free/shared/jurisdiction-rules/schema'
import { caDebtCollection } from '@lawyer-free/shared/jurisdiction-rules/ca/debt_collection'

describe('CA debt collection config', () => {
  it('passes schema validation', () => {
    const result = jurisdictionRuleConfigSchema.safeParse(caDebtCollection)
    expect(result.success).toBe(true)
  })

  it('has state CA and disputeType debt_collection', () => {
    expect(caDebtCollection.state).toBe('CA')
    expect(caDebtCollection.disputeType).toBe('debt_collection')
  })

  it('includes at least 5 required sections', () => {
    const sectionIds = caDebtCollection.requiredSections.map(s => s.id)
    expect(sectionIds.length).toBeGreaterThanOrEqual(5)
    expect(sectionIds).toContain('caption')
    expect(sectionIds).toContain('general_denial')
    expect(sectionIds).toContain('affirmative_defenses')
    expect(sectionIds).toContain('verification')
    expect(sectionIds).toContain('proof_of_service')
  })

  it('has legal elements for affirmative defenses', () => {
    const affDefenses = caDebtCollection.requiredSections.find(s => s.id === 'affirmative_defenses')
    expect(affDefenses?.legalElements).toBeDefined()
    expect(affDefenses!.legalElements!.length).toBeGreaterThanOrEqual(4)
  })

  it('has step validations for facts step with required fields', () => {
    expect(caDebtCollection.stepValidations.facts).toBeDefined()
    expect(caDebtCollection.stepValidations.facts.required.length).toBeGreaterThan(0)
    expect(caDebtCollection.stepValidations.facts.required).toContain('debt_origination_date')
  })

  it('has step validations for claims step with required fields', () => {
    expect(caDebtCollection.stepValidations.claims).toBeDefined()
    expect(caDebtCollection.stepValidations.claims.required).toContain('defense_type')
  })

  it('has at least 7 glossary entries', () => {
    expect(caDebtCollection.glossary.length).toBeGreaterThanOrEqual(7)
  })

  it('maps every rejectionReason to a valid wizard step', () => {
    const validSteps = ['preflight', 'parties', 'venue', 'facts', 'claims', 'relief', 'how_to_file', 'review']
    for (const r of caDebtCollection.rejectionReasons) {
      expect(validSteps).toContain(r.wizardStep)
    }
  })

  it('includes Rosenthal Act in glossary', () => {
    const rosenthal = caDebtCollection.glossary.find(g => g.term.includes('Rosenthal'))
    expect(rosenthal).toBeDefined()
  })

  it('uses proof_of_service instead of certificate_of_service', () => {
    const sectionIds = caDebtCollection.requiredSections.map(s => s.id)
    expect(sectionIds).toContain('proof_of_service')
    expect(sectionIds).not.toContain('certificate_of_service')
  })
})
