import { describe, it, expect } from 'vitest'
import { jurisdictionRuleConfigSchema } from '@lawyer-free/shared/jurisdiction-rules/schema'
import { txFamily } from '@lawyer-free/shared/jurisdiction-rules/tx/family'

describe('TX family config', () => {
  it('passes schema validation', () => {
    const result = jurisdictionRuleConfigSchema.safeParse(txFamily)
    if (!result.success) {
      console.error(result.error.format())
    }
    expect(result.success).toBe(true)
  })

  it('has state TX and disputeType family', () => {
    expect(txFamily.state).toBe('TX')
    expect(txFamily.disputeType).toBe('family')
  })

  it('includes required petition sections', () => {
    const sectionIds = txFamily.requiredSections.map(s => s.id)
    expect(sectionIds).toContain('caption')
    expect(sectionIds).toContain('facts')
    expect(sectionIds).toContain('property_division')
    expect(sectionIds).toContain('conservatorship')
    expect(sectionIds).toContain('child_support')
    expect(sectionIds).toContain('verification')
    expect(sectionIds).toContain('certificate_of_service')
  })

  it('has legal elements for property_division section', () => {
    const propDiv = txFamily.requiredSections.find(s => s.id === 'property_division')
    expect(propDiv?.legalElements).toBeDefined()
    expect(propDiv!.legalElements!.length).toBeGreaterThanOrEqual(5)
  })

  it('has legal elements for conservatorship section', () => {
    const custody = txFamily.requiredSections.find(s => s.id === 'conservatorship')
    expect(custody?.legalElements).toBeDefined()
    expect(custody!.legalElements!.length).toBeGreaterThanOrEqual(4)
  })

  it('has legal elements for child_support section', () => {
    const cs = txFamily.requiredSections.find(s => s.id === 'child_support')
    expect(cs?.legalElements).toBeDefined()
    expect(cs!.legalElements!.length).toBeGreaterThanOrEqual(3)
  })

  it('has step validations for facts step with marriage_date required', () => {
    expect(txFamily.stepValidations.facts).toBeDefined()
    expect(txFamily.stepValidations.facts.required).toContain('marriage_date')
  })

  it('has step validations for claims step with grounds required', () => {
    expect(txFamily.stepValidations.claims).toBeDefined()
    expect(txFamily.stepValidations.claims.required).toContain('grounds')
  })

  it('has step validations for relief step with warnings', () => {
    expect(txFamily.stepValidations.relief).toBeDefined()
    expect(txFamily.stepValidations.relief.warnings.length).toBeGreaterThan(0)
  })

  it('warns about residency requirements in facts step', () => {
    const warnings = txFamily.stepValidations.facts.warnings
    const residencyWarning = warnings.find(w => w.condition === 'no_residency_stated')
    expect(residencyWarning).toBeDefined()
    expect(residencyWarning!.message).toContain('6 months')
    expect(residencyWarning!.message).toContain('90 days')
  })

  it('warns about community property inventory in claims step', () => {
    const warnings = txFamily.stepValidations.claims.warnings
    const inventoryWarning = warnings.find(w => w.condition === 'no_community_property_inventory')
    expect(inventoryWarning).toBeDefined()
    expect(inventoryWarning!.message).toContain('Sworn Inventory')
  })

  it('warns about protective orders in relief step', () => {
    const warnings = txFamily.stepValidations.relief.warnings
    const poWarning = warnings.find(w => w.condition === 'no_protective_order_considered')
    expect(poWarning).toBeDefined()
    expect(poWarning!.message).toContain('§83')
    expect(poWarning!.message).toContain('§85')
  })

  it('has at least 8 glossary entries', () => {
    expect(txFamily.glossary.length).toBeGreaterThanOrEqual(8)
  })

  it('includes key glossary terms', () => {
    const terms = txFamily.glossary.map(g => g.term)
    expect(terms).toContain('Community Property')
    expect(terms).toContain('Separate Property')
    expect(terms).toContain('Conservatorship')
    expect(terms).toContain('Possessory Conservator')
    expect(terms).toContain('Managing Conservator')
    expect(terms).toContain('Insupportability')
    expect(terms).toContain('Spousal Maintenance')
    expect(terms).toContain('Sworn Inventory and Appraisement')
  })

  it('maps every rejectionReason to a valid wizard step', () => {
    const validSteps = ['preflight', 'parties', 'venue', 'facts', 'claims', 'relief', 'how_to_file', 'review']
    for (const r of txFamily.rejectionReasons) {
      expect(validSteps).toContain(r.wizardStep)
    }
  })

  it('mentions 60-day waiting period in service requirements', () => {
    expect(txFamily.filingRules.serviceRequirements).toContain('60-day')
  })

  it('references District Court in filing rules', () => {
    expect(txFamily.filingRules.courtName).toContain('District Court')
  })

  it('mentions fee waiver availability', () => {
    expect(txFamily.filingRules.filingFee).toContain('fee waiver')
  })

  it('references filing fee range of $300-350', () => {
    expect(txFamily.filingRules.filingFee).toContain('300')
  })
})
