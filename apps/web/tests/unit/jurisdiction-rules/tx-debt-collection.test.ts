import { describe, it, expect } from 'vitest'
import { jurisdictionRuleConfigSchema } from '@lawyer-free/shared/jurisdiction-rules/schema'
import { txDebtCollection } from '@lawyer-free/shared/jurisdiction-rules/tx'

describe('TX debt collection config', () => {
  it('passes schema validation', () => {
    const result = jurisdictionRuleConfigSchema.safeParse(txDebtCollection)
    expect(result.success).toBe(true)
  })

  it('has state TX and disputeType debt_collection', () => {
    expect(txDebtCollection.state).toBe('TX')
    expect(txDebtCollection.disputeType).toBe('debt_collection')
  })

  it('includes required petition sections', () => {
    const sectionIds = txDebtCollection.requiredSections.map(s => s.id)
    expect(sectionIds).toContain('caption')
    expect(sectionIds).toContain('general_denial')
    expect(sectionIds).toContain('affirmative_defenses')
    expect(sectionIds).toContain('verification')
    expect(sectionIds).toContain('certificate_of_service')
  })

  it('has legal elements for affirmative defenses', () => {
    const affDefenses = txDebtCollection.requiredSections.find(s => s.id === 'affirmative_defenses')
    expect(affDefenses?.legalElements).toBeDefined()
    expect(affDefenses!.legalElements!.length).toBeGreaterThanOrEqual(3)
  })

  it('has step validations for facts step', () => {
    expect(txDebtCollection.stepValidations.facts).toBeDefined()
    expect(txDebtCollection.stepValidations.facts.required.length).toBeGreaterThan(0)
  })

  it('has at least 5 glossary entries', () => {
    expect(txDebtCollection.glossary.length).toBeGreaterThanOrEqual(5)
  })

  it('maps every rejectionReason to a valid wizard step', () => {
    const validSteps = ['preflight', 'parties', 'venue', 'facts', 'claims', 'relief', 'how_to_file', 'review']
    for (const r of txDebtCollection.rejectionReasons) {
      expect(validSteps).toContain(r.wizardStep)
    }
  })
})
