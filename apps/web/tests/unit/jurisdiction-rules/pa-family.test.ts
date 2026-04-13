import { describe, it, expect } from 'vitest'
import { jurisdictionRuleConfigSchema } from '@lawyer-free/shared/jurisdiction-rules/schema'
import { paFamily } from '@lawyer-free/shared/jurisdiction-rules/pa/family'

describe('PA family config', () => {
  it('passes schema validation', () => {
    const result = jurisdictionRuleConfigSchema.safeParse(paFamily)
    if (!result.success) {
      console.error(result.error.format())
    }
    expect(result.success).toBe(true)
  })

  it('has state PA and disputeType family', () => {
    expect(paFamily.state).toBe('PA')
    expect(paFamily.disputeType).toBe('family')
  })

  it('includes required petition sections', () => {
    const sectionIds = paFamily.requiredSections.map(s => s.id)
    expect(sectionIds).toContain('caption')
    expect(sectionIds).toContain('facts')
    expect(sectionIds).toContain('property_division')
    expect(sectionIds).toContain('custody')
    expect(sectionIds).toContain('child_support')
    expect(sectionIds).toContain('alimony')
    expect(sectionIds).toContain('verification')
    expect(sectionIds).toContain('certificate_of_service')
  })

  it('has legal elements for property_division section', () => {
    const propDiv = paFamily.requiredSections.find(s => s.id === 'property_division')
    expect(propDiv?.legalElements).toBeDefined()
    expect(propDiv!.legalElements!.length).toBeGreaterThanOrEqual(6)
  })

  it('references equitable distribution in property_division', () => {
    const propDiv = paFamily.requiredSections.find(s => s.id === 'property_division')
    const hasEquitable = propDiv!.legalElements!.some(e => e.includes('equitable') || e.includes('3502'))
    expect(hasEquitable).toBe(true)
  })

  it('references marital vs non-marital property distinction', () => {
    const propDiv = paFamily.requiredSections.find(s => s.id === 'property_division')
    const hasMarital = propDiv!.legalElements!.some(e => e.includes('3501(a)'))
    const hasSeparate = propDiv!.legalElements!.some(e => e.includes('3501(b)'))
    expect(hasMarital).toBe(true)
    expect(hasSeparate).toBe(true)
  })

  it('has legal elements for custody section with 16 factors', () => {
    const custody = paFamily.requiredSections.find(s => s.id === 'custody')
    expect(custody?.legalElements).toBeDefined()
    expect(custody!.legalElements!.length).toBeGreaterThanOrEqual(4)
    const has16Factors = custody!.legalElements!.some(e => e.includes('16 factors') || e.includes('§5328'))
    expect(has16Factors).toBe(true)
  })

  it('references custody conciliation in custody section', () => {
    const custody = paFamily.requiredSections.find(s => s.id === 'custody')
    const hasConciliation = custody!.legalElements!.some(e => e.includes('conciliation') || e.includes('mediation'))
    expect(hasConciliation).toBe(true)
  })

  it('has legal elements for child_support section', () => {
    const cs = paFamily.requiredSections.find(s => s.id === 'child_support')
    expect(cs?.legalElements).toBeDefined()
    expect(cs!.legalElements!.length).toBeGreaterThanOrEqual(3)
  })

  it('references income shares model in child_support', () => {
    const cs = paFamily.requiredSections.find(s => s.id === 'child_support')
    const hasIncomeShares = cs!.legalElements!.some(e => e.includes('income shares') || e.includes('1910'))
    expect(hasIncomeShares).toBe(true)
  })

  it('has legal elements for alimony section with 17 factors', () => {
    const alimony = paFamily.requiredSections.find(s => s.id === 'alimony')
    expect(alimony?.legalElements).toBeDefined()
    expect(alimony!.legalElements!.length).toBeGreaterThanOrEqual(4)
    const has17Factors = alimony!.legalElements!.some(e => e.includes('17 factors') || e.includes('§3701'))
    expect(has17Factors).toBe(true)
  })

  it('references alimony pendente lite (APL)', () => {
    const alimony = paFamily.requiredSections.find(s => s.id === 'alimony')
    const hasAPL = alimony!.legalElements!.some(e => e.includes('pendente lite') || e.includes('APL'))
    expect(hasAPL).toBe(true)
  })

  it('has step validations for facts step with marriage_date required', () => {
    expect(paFamily.stepValidations.facts).toBeDefined()
    expect(paFamily.stepValidations.facts.required).toContain('marriage_date')
  })

  it('has step validations for claims step with grounds required', () => {
    expect(paFamily.stepValidations.claims).toBeDefined()
    expect(paFamily.stepValidations.claims.required).toContain('grounds')
  })

  it('has step validations for relief step with warnings', () => {
    expect(paFamily.stepValidations.relief).toBeDefined()
    expect(paFamily.stepValidations.relief.warnings.length).toBeGreaterThan(0)
  })

  it('warns about 6-month residency requirements in facts step', () => {
    const warnings = paFamily.stepValidations.facts.warnings
    const residencyWarning = warnings.find(w => w.condition === 'no_residency_stated')
    expect(residencyWarning).toBeDefined()
    expect(residencyWarning!.message).toContain('6 months')
    expect(residencyWarning!.message).toContain('§3104')
  })

  it('warns about 1-year separation or 90-day mutual consent in facts step', () => {
    const warnings = paFamily.stepValidations.facts.warnings
    const separationWarning = warnings.find(w => w.condition === 'no_separation_period_stated')
    expect(separationWarning).toBeDefined()
    expect(separationWarning!.message).toContain('1 year')
    expect(separationWarning!.message).toContain('90-day')
  })

  it('warns about property inventory in claims step', () => {
    const warnings = paFamily.stepValidations.claims.warnings
    const inventoryWarning = warnings.find(w => w.condition === 'no_property_inventory')
    expect(inventoryWarning).toBeDefined()
    expect(inventoryWarning!.message).toContain('Inventory')
  })

  it('warns about retirement accounts / QDRO in claims step', () => {
    const warnings = paFamily.stepValidations.claims.warnings
    const qdroWarning = warnings.find(w => w.condition === 'no_retirement_accounts_addressed')
    expect(qdroWarning).toBeDefined()
    expect(qdroWarning!.message).toContain('QDRO')
  })

  it('warns about PFA in claims step', () => {
    const warnings = paFamily.stepValidations.claims.warnings
    const pfaWarning = warnings.find(w => w.condition === 'no_pfa_considered')
    expect(pfaWarning).toBeDefined()
    expect(pfaWarning!.message).toContain('6101')
    expect(pfaWarning!.message).toContain('6122')
  })

  it('warns about custody conciliation requirement in relief step', () => {
    const warnings = paFamily.stepValidations.relief.warnings
    const conciliationWarning = warnings.find(w => w.condition === 'no_custody_conciliation_noted')
    expect(conciliationWarning).toBeDefined()
    expect(conciliationWarning!.message).toContain('conciliation')
  })

  it('warns about temporary orders in relief step', () => {
    const warnings = paFamily.stepValidations.relief.warnings
    const tempWarning = warnings.find(w => w.condition === 'no_temporary_orders_requested')
    expect(tempWarning).toBeDefined()
    expect(tempWarning!.message).toContain('alimony pendente lite')
  })

  it('warns about alimony factors in relief step', () => {
    const warnings = paFamily.stepValidations.relief.warnings
    const alimonyWarning = warnings.find(w => w.condition === 'no_alimony_factors_considered')
    expect(alimonyWarning).toBeDefined()
    expect(alimonyWarning!.message).toContain('17 factors')
    expect(alimonyWarning!.message).toContain('§3701')
  })

  it('has at least 9 glossary entries', () => {
    expect(paFamily.glossary.length).toBeGreaterThanOrEqual(9)
  })

  it('includes key glossary terms', () => {
    const terms = paFamily.glossary.map(g => g.term)
    expect(terms).toContain('Equitable Distribution')
    expect(terms).toContain('Marital Property')
    expect(terms).toContain('Separate Property')
    expect(terms).toContain('Legal Custody')
    expect(terms).toContain('Physical Custody')
    expect(terms).toContain('Irretrievable Breakdown')
    expect(terms).toContain('Alimony')
    expect(terms).toContain('Child Support Guidelines')
    expect(terms).toContain('PFA (Protection From Abuse)')
    expect(terms).toContain('Custody Conciliation')
    expect(terms).toContain('90-Day Waiting Period')
  })

  it('maps every rejectionReason to a valid wizard step', () => {
    const validSteps = ['preflight', 'parties', 'venue', 'facts', 'claims', 'relief', 'how_to_file', 'review']
    for (const r of paFamily.rejectionReasons) {
      expect(validSteps).toContain(r.wizardStep)
    }
  })

  it('references Court of Common Pleas in filing rules', () => {
    expect(paFamily.filingRules.courtName).toContain('Court of Common Pleas')
  })

  it('mentions fee waiver availability', () => {
    expect(paFamily.filingRules.filingFee).toContain('fee waiver')
  })

  it('references 90-day waiting period in service requirements', () => {
    expect(paFamily.filingRules.serviceRequirements).toContain('90-day')
  })

  it('references 1-year separation in service requirements', () => {
    expect(paFamily.filingRules.serviceRequirements).toContain('1 year')
  })

  it('references mandatory financial disclosures in service requirements', () => {
    expect(paFamily.filingRules.serviceRequirements).toContain('Income and Expense')
    expect(paFamily.filingRules.serviceRequirements).toContain('Inventory')
  })
})
