import { describe, it, expect } from 'vitest'
import { jurisdictionRuleConfigSchema } from '@lawyer-free/shared/jurisdiction-rules/schema'
import { caFamily } from '@lawyer-free/shared/jurisdiction-rules/ca/family'

describe('CA family config', () => {
  it('passes schema validation', () => {
    const result = jurisdictionRuleConfigSchema.safeParse(caFamily)
    if (!result.success) {
      console.error(result.error.format())
    }
    expect(result.success).toBe(true)
  })

  it('has state CA and disputeType family', () => {
    expect(caFamily.state).toBe('CA')
    expect(caFamily.disputeType).toBe('family')
  })

  it('includes required petition sections', () => {
    const sectionIds = caFamily.requiredSections.map(s => s.id)
    expect(sectionIds).toContain('caption')
    expect(sectionIds).toContain('facts')
    expect(sectionIds).toContain('property_division')
    expect(sectionIds).toContain('conservatorship')
    expect(sectionIds).toContain('child_support')
    expect(sectionIds).toContain('spousal_support')
    expect(sectionIds).toContain('verification')
    expect(sectionIds).toContain('proof_of_service')
  })

  it('has legal elements for property_division section', () => {
    const propDiv = caFamily.requiredSections.find(s => s.id === 'property_division')
    expect(propDiv?.legalElements).toBeDefined()
    expect(propDiv!.legalElements!.length).toBeGreaterThanOrEqual(6)
  })

  it('references community property 50/50 presumption', () => {
    const propDiv = caFamily.requiredSections.find(s => s.id === 'property_division')
    const hasEqual = propDiv!.legalElements!.some(e => e.includes('50/50') || e.includes('equal'))
    expect(hasEqual).toBe(true)
  })

  it('has legal elements for conservatorship (custody) section', () => {
    const custody = caFamily.requiredSections.find(s => s.id === 'conservatorship')
    expect(custody?.legalElements).toBeDefined()
    expect(custody!.legalElements!.length).toBeGreaterThanOrEqual(4)
  })

  it('references mandatory mediation in custody section', () => {
    const custody = caFamily.requiredSections.find(s => s.id === 'conservatorship')
    const hasMediation = custody!.legalElements!.some(e => e.includes('mediation') || e.includes('§3170'))
    expect(hasMediation).toBe(true)
  })

  it('has legal elements for child_support section', () => {
    const cs = caFamily.requiredSections.find(s => s.id === 'child_support')
    expect(cs?.legalElements).toBeDefined()
    expect(cs!.legalElements!.length).toBeGreaterThanOrEqual(3)
  })

  it('references statewide uniform guideline in child_support', () => {
    const cs = caFamily.requiredSections.find(s => s.id === 'child_support')
    const hasGuideline = cs!.legalElements!.some(e => e.includes('4050') || e.includes('guideline'))
    expect(hasGuideline).toBe(true)
  })

  it('has legal elements for spousal_support section', () => {
    const ss = caFamily.requiredSections.find(s => s.id === 'spousal_support')
    expect(ss?.legalElements).toBeDefined()
    expect(ss!.legalElements!.length).toBeGreaterThanOrEqual(4)
  })

  it('references FC §4320 factors in spousal_support', () => {
    const ss = caFamily.requiredSections.find(s => s.id === 'spousal_support')
    const has4320 = ss!.legalElements!.some(e => e.includes('4320'))
    expect(has4320).toBe(true)
  })

  it('has step validations for facts step with marriage_date required', () => {
    expect(caFamily.stepValidations.facts).toBeDefined()
    expect(caFamily.stepValidations.facts.required).toContain('marriage_date')
  })

  it('has step validations for claims step with grounds required', () => {
    expect(caFamily.stepValidations.claims).toBeDefined()
    expect(caFamily.stepValidations.claims.required).toContain('grounds')
  })

  it('has step validations for relief step with warnings', () => {
    expect(caFamily.stepValidations.relief).toBeDefined()
    expect(caFamily.stepValidations.relief.warnings.length).toBeGreaterThan(0)
  })

  it('warns about residency requirements in facts step', () => {
    const warnings = caFamily.stepValidations.facts.warnings
    const residencyWarning = warnings.find(w => w.condition === 'no_residency_stated')
    expect(residencyWarning).toBeDefined()
    expect(residencyWarning!.message).toContain('6 months')
    expect(residencyWarning!.message).toContain('3 months')
  })

  it('warns about community property disclosures in claims step', () => {
    const warnings = caFamily.stepValidations.claims.warnings
    const inventoryWarning = warnings.find(w => w.condition === 'no_community_property_inventory')
    expect(inventoryWarning).toBeDefined()
    expect(inventoryWarning!.message).toContain('FL-140')
  })

  it('warns about retirement accounts / QDRO in claims step', () => {
    const warnings = caFamily.stepValidations.claims.warnings
    const qdroWarning = warnings.find(w => w.condition === 'no_retirement_accounts_addressed')
    expect(qdroWarning).toBeDefined()
    expect(qdroWarning!.message).toContain('QDRO')
  })

  it('warns about DVPA restraining order in relief step', () => {
    const warnings = caFamily.stepValidations.relief.warnings
    const dvpaWarning = warnings.find(w => w.condition === 'no_dvpa_restraining_order_considered')
    expect(dvpaWarning).toBeDefined()
    expect(dvpaWarning!.message).toContain('6300')
    expect(dvpaWarning!.message).toContain('6389')
  })

  it('warns about mandatory mediation in relief step', () => {
    const warnings = caFamily.stepValidations.relief.warnings
    const mediationWarning = warnings.find(w => w.condition === 'no_custody_mediation_noted')
    expect(mediationWarning).toBeDefined()
    expect(mediationWarning!.message).toContain('§3170')
  })

  it('has at least 9 glossary entries', () => {
    expect(caFamily.glossary.length).toBeGreaterThanOrEqual(9)
  })

  it('includes key glossary terms', () => {
    const terms = caFamily.glossary.map(g => g.term)
    expect(terms).toContain('Community Property')
    expect(terms).toContain('Separate Property')
    expect(terms).toContain('Legal Custody')
    expect(terms).toContain('Physical Custody')
    expect(terms).toContain('Irreconcilable Differences')
    expect(terms).toContain('Spousal Support')
    expect(terms).toContain('Preliminary Declaration of Disclosure')
    expect(terms).toContain('Guideline Child Support')
    expect(terms).toContain('DVPA Restraining Order')
  })

  it('maps every rejectionReason to a valid wizard step', () => {
    const validSteps = ['preflight', 'parties', 'venue', 'facts', 'claims', 'relief', 'how_to_file', 'review']
    for (const r of caFamily.rejectionReasons) {
      expect(validSteps).toContain(r.wizardStep)
    }
  })

  it('mentions 6-month waiting period in service requirements', () => {
    expect(caFamily.filingRules.serviceRequirements).toContain('6-month')
  })

  it('references Superior Court in filing rules', () => {
    expect(caFamily.filingRules.courtName).toContain('Superior Court')
  })

  it('mentions fee waiver availability', () => {
    expect(caFamily.filingRules.filingFee).toContain('fee waiver')
  })

  it('references filing fee of approximately $435', () => {
    expect(caFamily.filingRules.filingFee).toContain('435')
  })

  it('references mandatory disclosure forms in service requirements', () => {
    expect(caFamily.filingRules.serviceRequirements).toContain('FL-140')
    expect(caFamily.filingRules.serviceRequirements).toContain('FL-150')
  })
})
