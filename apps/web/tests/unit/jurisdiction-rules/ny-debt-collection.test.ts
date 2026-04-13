import { describe, it, expect } from 'vitest'
import { jurisdictionRuleConfigSchema } from '@lawyer-free/shared/jurisdiction-rules/schema'
import { nyDebtCollection } from '@lawyer-free/shared/jurisdiction-rules/ny/debt_collection'

describe('NY debt collection config', () => {
  it('passes schema validation', () => {
    const result = jurisdictionRuleConfigSchema.safeParse(nyDebtCollection)
    expect(result.success).toBe(true)
  })

  it('has state NY and disputeType debt_collection', () => {
    expect(nyDebtCollection.state).toBe('NY')
    expect(nyDebtCollection.disputeType).toBe('debt_collection')
  })

  it('includes at least 5 required sections', () => {
    const sectionIds = nyDebtCollection.requiredSections.map(s => s.id)
    expect(sectionIds.length).toBeGreaterThanOrEqual(5)
    expect(sectionIds).toContain('caption')
    expect(sectionIds).toContain('answer_denials')
    expect(sectionIds).toContain('affirmative_defenses')
    expect(sectionIds).toContain('verification')
    expect(sectionIds).toContain('proof_of_service')
  })

  it('has legal elements for affirmative defenses', () => {
    const affDefenses = nyDebtCollection.requiredSections.find(s => s.id === 'affirmative_defenses')
    expect(affDefenses?.legalElements).toBeDefined()
    expect(affDefenses!.legalElements!.length).toBeGreaterThanOrEqual(3)
  })

  it('has at least 7 glossary entries', () => {
    expect(nyDebtCollection.glossary.length).toBeGreaterThanOrEqual(7)
  })

  it('has step validations for facts step', () => {
    expect(nyDebtCollection.stepValidations.facts).toBeDefined()
    expect(nyDebtCollection.stepValidations.facts.required).toContain('debt_origination_date')
  })

  it('has step validations for claims step', () => {
    expect(nyDebtCollection.stepValidations.claims).toBeDefined()
    expect(nyDebtCollection.stepValidations.claims.required).toContain('defense_type')
  })

  it('has step validations for parties step with licensing warning', () => {
    expect(nyDebtCollection.stepValidations.parties).toBeDefined()
    expect(nyDebtCollection.stepValidations.parties.warnings.length).toBeGreaterThan(0)
  })

  it('maps every rejectionReason to a valid wizard step', () => {
    const validSteps = ['preflight', 'parties', 'venue', 'facts', 'claims', 'relief', 'how_to_file', 'review']
    for (const r of nyDebtCollection.rejectionReasons) {
      expect(validSteps).toContain(r.wizardStep)
    }
  })
})
