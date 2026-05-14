import { describe, it, expect } from 'vitest'
import { jurisdictionRuleConfigSchema } from '@lawyer-free/shared/jurisdiction-rules/schema'
import { nyFamily } from '@lawyer-free/shared/jurisdiction-rules/ny/family'

describe('NY family config', () => {
  it('passes schema validation', () => {
    const result = jurisdictionRuleConfigSchema.safeParse(nyFamily)
    if (!result.success) {
      console.error(result.error.format())
    }
    expect(result.success).toBe(true)
  })

  it('has state NY and disputeType family', () => {
    expect(nyFamily.state).toBe('NY')
    expect(nyFamily.disputeType).toBe('family')
  })

  it('includes required petition sections', () => {
    const sectionIds = nyFamily.requiredSections.map(s => s.id)
    expect(sectionIds).toContain('caption')
    expect(sectionIds).toContain('facts')
    expect(sectionIds).toContain('property_division')
    expect(sectionIds).toContain('custody')
    expect(sectionIds).toContain('child_support')
    expect(sectionIds).toContain('spousal_support')
    expect(sectionIds).toContain('verification')
    expect(sectionIds).toContain('proof_of_service')
  })

  it('has legal elements for property_division section', () => {
    const propDiv = nyFamily.requiredSections.find(s => s.id === 'property_division')
    expect(propDiv?.legalElements).toBeDefined()
    expect(propDiv!.legalElements!.length).toBeGreaterThanOrEqual(5)
  })

  it('has legal elements for custody section', () => {
    const custody = nyFamily.requiredSections.find(s => s.id === 'custody')
    expect(custody?.legalElements).toBeDefined()
    expect(custody!.legalElements!.length).toBeGreaterThanOrEqual(4)
  })

  it('has legal elements for child_support section', () => {
    const cs = nyFamily.requiredSections.find(s => s.id === 'child_support')
    expect(cs?.legalElements).toBeDefined()
    expect(cs!.legalElements!.length).toBeGreaterThanOrEqual(3)
  })

  it('has legal elements for spousal_support section', () => {
    const ss = nyFamily.requiredSections.find(s => s.id === 'spousal_support')
    expect(ss?.legalElements).toBeDefined()
    expect(ss!.legalElements!.length).toBeGreaterThanOrEqual(3)
  })

  it('has step validations for facts step with marriage_date required', () => {
    expect(nyFamily.stepValidations.facts).toBeDefined()
    expect(nyFamily.stepValidations.facts.required).toContain('marriage_date')
  })

  it('has step validations for claims step with grounds required', () => {
    expect(nyFamily.stepValidations.claims).toBeDefined()
    expect(nyFamily.stepValidations.claims.required).toContain('grounds')
  })

  it('has step validations for relief step with warnings', () => {
    expect(nyFamily.stepValidations.relief).toBeDefined()
    expect(nyFamily.stepValidations.relief.warnings.length).toBeGreaterThan(0)
  })

  it('warns about residency requirements in facts step', () => {
    const warnings = nyFamily.stepValidations.facts.warnings
    const residencyWarning = warnings.find(w => w.condition === 'no_residency_stated')
    expect(residencyWarning).toBeDefined()
    expect(residencyWarning!.message).toContain('DRL §230')
    expect(residencyWarning!.message).toContain('1 year')
  })

  it('warns about automatic orders in claims step', () => {
    const warnings = nyFamily.stepValidations.claims.warnings
    const autoOrdersWarning = warnings.find(w => w.condition === 'no_automatic_orders_acknowledged')
    expect(autoOrdersWarning).toBeDefined()
    expect(autoOrdersWarning!.message).toContain('DRL §236(B)(2)(b)')
  })

  it('warns about Statement of Net Worth in claims step', () => {
    const warnings = nyFamily.stepValidations.claims.warnings
    const snwWarning = warnings.find(w => w.condition === 'no_statement_of_net_worth')
    expect(snwWarning).toBeDefined()
    expect(snwWarning!.message).toContain('Statement of Net Worth')
  })

  it('warns about retirement/QDRO in claims step', () => {
    const warnings = nyFamily.stepValidations.claims.warnings
    const qdroWarning = warnings.find(w => w.condition === 'no_retirement_accounts_addressed')
    expect(qdroWarning).toBeDefined()
    expect(qdroWarning!.message).toContain('QDRO')
  })

  it('warns about temporary orders in relief step', () => {
    const warnings = nyFamily.stepValidations.relief.warnings
    const tempWarning = warnings.find(w => w.condition === 'no_temporary_orders_requested')
    expect(tempWarning).toBeDefined()
  })

  it('warns about maintenance formula in relief step', () => {
    const warnings = nyFamily.stepValidations.relief.warnings
    const maintWarning = warnings.find(w => w.condition === 'no_maintenance_formula_calculated')
    expect(maintWarning).toBeDefined()
    expect(maintWarning!.message).toContain('DRL §236(B)')
  })

  it('warns about order of protection in relief step', () => {
    const warnings = nyFamily.stepValidations.relief.warnings
    const oopWarning = warnings.find(w => w.condition === 'no_order_of_protection_considered')
    expect(oopWarning).toBeDefined()
    expect(oopWarning!.message).toContain('§842')
  })

  it('has at least 9 glossary entries', () => {
    expect(nyFamily.glossary.length).toBeGreaterThanOrEqual(9)
  })

  it('includes key glossary terms', () => {
    const terms = nyFamily.glossary.map(g => g.term)
    expect(terms).toContain('Equitable Distribution')
    expect(terms).toContain('Marital Property')
    expect(terms).toContain('Separate Property')
    expect(terms).toContain('Legal Custody')
    expect(terms).toContain('Physical Custody')
    expect(terms).toContain('Irretrievable Breakdown')
    expect(terms).toContain('Maintenance (Spousal Support)')
    expect(terms).toContain('CSSA (Child Support Standards Act)')
    expect(terms).toContain('Automatic Orders')
    expect(terms).toContain('Order of Protection')
    expect(terms).toContain('Statement of Net Worth')
  })

  it('maps every rejectionReason to a valid wizard step', () => {
    const validSteps = ['preflight', 'parties', 'venue', 'facts', 'claims', 'relief', 'how_to_file', 'review']
    for (const r of nyFamily.rejectionReasons) {
      expect(validSteps).toContain(r.wizardStep)
    }
  })

  it('references Supreme Court and Family Court in filing rules', () => {
    expect(nyFamily.filingRules.courtName).toContain('Supreme Court')
    expect(nyFamily.filingRules.courtName).toContain('Family Court')
  })

  it('mentions automatic orders in service requirements', () => {
    expect(nyFamily.filingRules.serviceRequirements).toContain('Automatic Orders')
  })

  it('mentions fee waiver availability', () => {
    expect(nyFamily.filingRules.filingFee).toContain('poor person relief')
  })

  it('references $210 filing fee', () => {
    expect(nyFamily.filingRules.filingFee).toContain('210')
  })

  it('mentions CSSA percentages in child_support section', () => {
    const cs = nyFamily.requiredSections.find(s => s.id === 'child_support')
    const elements = cs!.legalElements!.join(' ')
    expect(elements).toContain('17%')
    expect(elements).toContain('25%')
    expect(elements).toContain('29%')
    expect(elements).toContain('31%')
    expect(elements).toContain('35%')
  })

  it('mentions equitable distribution (not community property) in property_division', () => {
    const propDiv = nyFamily.requiredSections.find(s => s.id === 'property_division')
    expect(propDiv!.description).toContain('equitable distribution')
    expect(propDiv!.description).toContain('NOT community property')
  })
})
