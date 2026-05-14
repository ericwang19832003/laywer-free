import { describe, it, expect } from 'vitest'
import { jurisdictionRuleConfigSchema } from '@lawyer-free/shared/jurisdiction-rules/schema'
import { flFamily } from '@lawyer-free/shared/jurisdiction-rules/fl/family'

describe('FL family config', () => {
  it('passes schema validation', () => {
    const result = jurisdictionRuleConfigSchema.safeParse(flFamily)
    if (!result.success) {
      console.error(result.error.format())
    }
    expect(result.success).toBe(true)
  })

  it('has state FL and disputeType family', () => {
    expect(flFamily.state).toBe('FL')
    expect(flFamily.disputeType).toBe('family')
  })

  it('includes at least 5 required sections', () => {
    expect(flFamily.requiredSections.length).toBeGreaterThanOrEqual(5)
  })

  it('includes required petition sections', () => {
    const sectionIds = flFamily.requiredSections.map(s => s.id)
    expect(sectionIds).toContain('caption')
    expect(sectionIds).toContain('facts')
    expect(sectionIds).toContain('property_division')
    expect(sectionIds).toContain('timesharing')
    expect(sectionIds).toContain('child_support')
    expect(sectionIds).toContain('alimony')
    expect(sectionIds).toContain('verification')
    expect(sectionIds).toContain('certificate_of_service')
  })

  it('has legal elements for property_division section', () => {
    const propDiv = flFamily.requiredSections.find(s => s.id === 'property_division')
    expect(propDiv?.legalElements).toBeDefined()
    expect(propDiv!.legalElements!.length).toBeGreaterThanOrEqual(5)
  })

  it('has legal elements for timesharing section', () => {
    const timesharing = flFamily.requiredSections.find(s => s.id === 'timesharing')
    expect(timesharing?.legalElements).toBeDefined()
    expect(timesharing!.legalElements!.length).toBeGreaterThanOrEqual(4)
  })

  it('has legal elements for child_support section', () => {
    const cs = flFamily.requiredSections.find(s => s.id === 'child_support')
    expect(cs?.legalElements).toBeDefined()
    expect(cs!.legalElements!.length).toBeGreaterThanOrEqual(3)
  })

  it('has step validations for facts step with marriage_date required', () => {
    expect(flFamily.stepValidations.facts).toBeDefined()
    expect(flFamily.stepValidations.facts.required).toContain('marriage_date')
  })

  it('has step validations for claims step with grounds required', () => {
    expect(flFamily.stepValidations.claims).toBeDefined()
    expect(flFamily.stepValidations.claims.required).toContain('grounds')
  })

  it('has step validations for relief step with warnings', () => {
    expect(flFamily.stepValidations.relief).toBeDefined()
    expect(flFamily.stepValidations.relief.warnings.length).toBeGreaterThan(0)
  })

  it('warns about residency requirements in facts step', () => {
    const warnings = flFamily.stepValidations.facts.warnings
    const residencyWarning = warnings.find(w => w.condition === 'no_residency_stated')
    expect(residencyWarning).toBeDefined()
    expect(residencyWarning!.message).toContain('6 months')
  })

  it('warns about Financial Affidavit in claims step', () => {
    const warnings = flFamily.stepValidations.claims.warnings
    const affidavitWarning = warnings.find(w => w.condition === 'no_financial_affidavit_mentioned')
    expect(affidavitWarning).toBeDefined()
    expect(affidavitWarning!.message).toContain('Financial Affidavit')
    expect(affidavitWarning!.message).toContain('12.902')
  })

  it('warns about parenting course in claims step', () => {
    const warnings = flFamily.stepValidations.claims.warnings
    const courseWarning = warnings.find(w => w.condition === 'no_parenting_course_mentioned')
    expect(courseWarning).toBeDefined()
    expect(courseWarning!.message).toContain('parenting course')
    expect(courseWarning!.message).toContain('§61.21')
  })

  it('warns about parenting plan in relief step', () => {
    const warnings = flFamily.stepValidations.relief.warnings
    const planWarning = warnings.find(w => w.condition === 'no_parenting_plan_proposed')
    expect(planWarning).toBeDefined()
    expect(planWarning!.message).toContain('parenting plan')
    expect(planWarning!.message).toContain('§61.13001')
  })

  it('warns about alimony type selection in relief step', () => {
    const warnings = flFamily.stepValidations.relief.warnings
    const alimonyWarning = warnings.find(w => w.condition === 'no_alimony_type_selected')
    expect(alimonyWarning).toBeDefined()
    expect(alimonyWarning!.message).toContain('bridge-the-gap')
    expect(alimonyWarning!.message).toContain('rehabilitative')
    expect(alimonyWarning!.message).toContain('durational')
  })

  it('has at least 7 glossary entries', () => {
    expect(flFamily.glossary.length).toBeGreaterThanOrEqual(7)
  })

  it('includes key glossary terms', () => {
    const terms = flFamily.glossary.map(g => g.term)
    expect(terms).toContain('Equitable Distribution')
    expect(terms).toContain('Marital Property')
    expect(terms).toContain('Non-Marital Property')
    expect(terms).toContain('Timesharing')
    expect(terms).toContain('Parental Responsibility')
    expect(terms).toContain('Dissolution of Marriage')
    expect(terms).toContain('Alimony')
    expect(terms).toContain('Financial Affidavit')
    expect(terms).toContain('Parenting Plan')
  })

  it('maps every rejectionReason to a valid wizard step', () => {
    const validSteps = ['preflight', 'parties', 'venue', 'facts', 'claims', 'relief', 'how_to_file', 'review']
    for (const r of flFamily.rejectionReasons) {
      expect(validSteps).toContain(r.wizardStep)
    }
  })

  it('mentions 20-day waiting period in service requirements', () => {
    expect(flFamily.filingRules.serviceRequirements).toContain('20-day')
  })

  it('references Circuit Court in filing rules', () => {
    expect(flFamily.filingRules.courtName).toContain('Circuit Court')
  })

  it('mentions fee waiver availability', () => {
    expect(flFamily.filingRules.filingFee).toContain('fee waiver')
  })

  it('references filing fee of approximately $400', () => {
    expect(flFamily.filingRules.filingFee).toContain('400')
  })

  it('mentions mandatory mediation in service requirements', () => {
    expect(flFamily.filingRules.serviceRequirements).toContain('mediation')
  })

  it('uses timesharing terminology instead of custody', () => {
    const timesharing = flFamily.requiredSections.find(s => s.id === 'timesharing')
    expect(timesharing).toBeDefined()
    expect(timesharing!.label).toContain('Timesharing')
  })

  it('references equitable distribution not community property', () => {
    const propDiv = flFamily.requiredSections.find(s => s.id === 'property_division')
    expect(propDiv!.description).toContain('equitable distribution')
    expect(propDiv!.description).not.toContain('community property state')
  })

  it('references 2023 alimony reform in alimony section', () => {
    const alimony = flFamily.requiredSections.find(s => s.id === 'alimony')
    expect(alimony!.description).toContain('2023')
    expect(alimony!.description).toContain('SB 1416')
  })
})
