import { describe, it, expect } from 'vitest'
import { jurisdictionRuleConfigSchema } from '@lawyer-free/shared/jurisdiction-rules/schema'
import { flPersonalInjury } from '@lawyer-free/shared/jurisdiction-rules/fl/personal_injury'

describe('FL personal injury config', () => {
  it('passes schema validation', () => {
    const result = jurisdictionRuleConfigSchema.safeParse(flPersonalInjury)
    expect(result.success).toBe(true)
  })

  it('has state FL and disputeType personal_injury', () => {
    expect(flPersonalInjury.state).toBe('FL')
    expect(flPersonalInjury.disputeType).toBe('personal_injury')
  })

  it('includes required petition sections', () => {
    const sectionIds = flPersonalInjury.requiredSections.map(s => s.id)
    expect(sectionIds).toContain('caption')
    expect(sectionIds).toContain('facts')
    expect(sectionIds).toContain('negligence_elements')
    expect(sectionIds).toContain('damages')
    expect(sectionIds).toContain('verification')
    expect(sectionIds).toContain('certificate_of_service')
  })

  it('has at least 5 required sections', () => {
    expect(flPersonalInjury.requiredSections.length).toBeGreaterThanOrEqual(5)
  })

  it('has legal elements for negligence elements section', () => {
    const negligence = flPersonalInjury.requiredSections.find(s => s.id === 'negligence_elements')
    expect(negligence?.legalElements).toBeDefined()
    expect(negligence!.legalElements!.length).toBeGreaterThanOrEqual(4)
  })

  it('has step validations for facts step with incident_date required', () => {
    expect(flPersonalInjury.stepValidations.facts).toBeDefined()
    expect(flPersonalInjury.stepValidations.facts.required).toContain('incident_date')
  })

  it('has step validations for claims step with negligence_basis required', () => {
    expect(flPersonalInjury.stepValidations.claims).toBeDefined()
    expect(flPersonalInjury.stepValidations.claims.required).toContain('negligence_basis')
  })

  it('warns about comparative fault (51% bar) in claims step', () => {
    const faultWarning = flPersonalInjury.stepValidations.claims.warnings.find(
      w => w.condition === 'no_comparative_fault_awareness'
    )
    expect(faultWarning).toBeDefined()
    expect(faultWarning!.message).toContain('51%')
    expect(faultWarning!.message).toContain('768.81')
  })

  it('warns about PIP threshold in relief step', () => {
    expect(flPersonalInjury.stepValidations.relief).toBeDefined()
    const pipWarning = flPersonalInjury.stepValidations.relief.warnings.find(
      w => w.condition === 'pip_threshold_not_met'
    )
    expect(pipWarning).toBeDefined()
    expect(pipWarning!.message).toContain('627.737')
  })

  it('warns about medical malpractice pre-suit notice in claims step', () => {
    const presuit = flPersonalInjury.stepValidations.claims.warnings.find(
      w => w.condition === 'medical_malpractice_pre_suit_notice'
    )
    expect(presuit).toBeDefined()
    expect(presuit!.message).toContain('90-day')
    expect(presuit!.message).toContain('766.106')
  })

  it('warns about sovereign immunity in claims step', () => {
    const sovWarning = flPersonalInjury.stepValidations.claims.warnings.find(
      w => w.condition === 'government_entity_sovereign_immunity'
    )
    expect(sovWarning).toBeDefined()
    expect(sovWarning!.message).toContain('$200')
    expect(sovWarning!.message).toContain('768.28')
  })

  it('has at least 7 glossary entries', () => {
    expect(flPersonalInjury.glossary.length).toBeGreaterThanOrEqual(7)
  })

  it('includes key glossary terms', () => {
    const terms = flPersonalInjury.glossary.map(g => g.term)
    expect(terms).toContain('Statute of Limitations')
    expect(terms).toContain('Negligence')
    expect(terms).toContain('Comparative Fault (51% Bar)')
    expect(terms).toContain('PIP (Personal Injury Protection)')
    expect(terms).toContain('Permanent Injury Threshold')
    expect(terms).toContain('Pre-Suit Notice (Medical Malpractice)')
    expect(terms).toContain('Sovereign Immunity')
  })

  it('maps every rejectionReason to a valid wizard step', () => {
    const validSteps = ['preflight', 'parties', 'venue', 'facts', 'claims', 'relief', 'how_to_file', 'review']
    for (const r of flPersonalInjury.rejectionReasons) {
      expect(validSteps).toContain(r.wizardStep)
    }
  })

  it('has rejection reason for expired statute of limitations', () => {
    const solRejection = flPersonalInjury.rejectionReasons.find(
      r => r.reason.includes('Statute of limitations')
    )
    expect(solRejection).toBeDefined()
    expect(solRejection!.howToAvoid).toContain('2 years')
  })

  it('has rejection reason for medical malpractice pre-suit notice', () => {
    const medmalRejection = flPersonalInjury.rejectionReasons.find(
      r => r.reason.includes('pre-suit notice')
    )
    expect(medmalRejection).toBeDefined()
    expect(medmalRejection!.howToAvoid).toContain('766.106')
  })

  it('references FL-specific statutes in filing rules', () => {
    expect(flPersonalInjury.filingRules.courtName).toContain('Circuit Court')
    expect(flPersonalInjury.filingRules.serviceRequirements).toContain('FL')
    expect(flPersonalInjury.filingRules.filingFee).toContain('fee waiver')
  })
})
