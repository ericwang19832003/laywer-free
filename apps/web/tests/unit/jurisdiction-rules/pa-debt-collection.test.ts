import { describe, it, expect } from 'vitest'
import { jurisdictionRuleConfigSchema } from '@lawyer-free/shared/jurisdiction-rules/schema'
import { paDebtCollection } from '@lawyer-free/shared/jurisdiction-rules/pa/debt_collection'

describe('PA debt collection config', () => {
  it('passes schema validation', () => {
    const result = jurisdictionRuleConfigSchema.safeParse(paDebtCollection)
    expect(result.success).toBe(true)
  })

  it('has state PA and disputeType debt_collection', () => {
    expect(paDebtCollection.state).toBe('PA')
    expect(paDebtCollection.disputeType).toBe('debt_collection')
  })

  it('includes at least 5 required sections', () => {
    expect(paDebtCollection.requiredSections.length).toBeGreaterThanOrEqual(5)
  })

  it('includes required petition sections', () => {
    const sectionIds = paDebtCollection.requiredSections.map(s => s.id)
    expect(sectionIds).toContain('caption')
    expect(sectionIds).toContain('preliminary_objections')
    expect(sectionIds).toContain('answer_denials')
    expect(sectionIds).toContain('new_matter')
    expect(sectionIds).toContain('verification')
    expect(sectionIds).toContain('certificate_of_service')
  })

  it('has legal elements for new matter (affirmative defenses)', () => {
    const newMatter = paDebtCollection.requiredSections.find(s => s.id === 'new_matter')
    expect(newMatter?.legalElements).toBeDefined()
    expect(newMatter!.legalElements!.length).toBeGreaterThanOrEqual(3)
  })

  it('has step validations for facts step requiring debt_origination_date', () => {
    expect(paDebtCollection.stepValidations.facts).toBeDefined()
    expect(paDebtCollection.stepValidations.facts.required).toContain('debt_origination_date')
  })

  it('has step validations for claims step requiring defense_type', () => {
    expect(paDebtCollection.stepValidations.claims).toBeDefined()
    expect(paDebtCollection.stepValidations.claims.required).toContain('defense_type')
  })

  it('has at least 7 glossary entries', () => {
    expect(paDebtCollection.glossary.length).toBeGreaterThanOrEqual(7)
  })

  it('maps every rejectionReason to a valid wizard step', () => {
    const validSteps = ['preflight', 'parties', 'venue', 'facts', 'claims', 'relief', 'how_to_file', 'review']
    for (const r of paDebtCollection.rejectionReasons) {
      expect(validSteps).toContain(r.wizardStep)
    }
  })

  it('glossary covers PA-specific terms', () => {
    const terms = paDebtCollection.glossary.map(g => g.term)
    expect(terms).toContain('Specific Denial')
    expect(terms).toContain('New Matter')
    expect(terms).toContain('FCEUA (Fair Credit Extension Uniformity Act)')
    expect(terms).toContain('Confession of Judgment')
    expect(terms).toContain('In Forma Pauperis (IFP)')
    expect(terms).toContain('Magisterial District Court')
  })
})
