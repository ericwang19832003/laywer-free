import { describe, it, expect } from 'vitest'
import { jurisdictionRuleConfigSchema } from '@lawyer-free/shared/jurisdiction-rules/schema'
import { txPersonalInjury } from '@lawyer-free/shared/jurisdiction-rules/tx/personal_injury'

describe('TX personal injury config', () => {
  it('passes schema validation', () => {
    const result = jurisdictionRuleConfigSchema.safeParse(txPersonalInjury)
    expect(result.success).toBe(true)
  })

  it('has state TX and disputeType personal_injury', () => {
    expect(txPersonalInjury.state).toBe('TX')
    expect(txPersonalInjury.disputeType).toBe('personal_injury')
  })

  it('includes required petition sections', () => {
    const sectionIds = txPersonalInjury.requiredSections.map(s => s.id)
    expect(sectionIds).toContain('caption')
    expect(sectionIds).toContain('facts')
    expect(sectionIds).toContain('negligence_elements')
    expect(sectionIds).toContain('damages')
    expect(sectionIds).toContain('verification')
    expect(sectionIds).toContain('certificate_of_service')
  })

  it('has 6 required sections', () => {
    expect(txPersonalInjury.requiredSections).toHaveLength(6)
  })

  it('has legal elements for negligence_elements section', () => {
    const negligence = txPersonalInjury.requiredSections.find(s => s.id === 'negligence_elements')
    expect(negligence?.legalElements).toBeDefined()
    expect(negligence!.legalElements!.length).toBeGreaterThanOrEqual(4)
  })

  it('has step validations for facts step with incident_date required', () => {
    expect(txPersonalInjury.stepValidations.facts).toBeDefined()
    expect(txPersonalInjury.stepValidations.facts.required).toContain('incident_date')
  })

  it('has step validations for claims step with negligence_basis required', () => {
    expect(txPersonalInjury.stepValidations.claims).toBeDefined()
    expect(txPersonalInjury.stepValidations.claims.required).toContain('negligence_basis')
  })

  it('has step validations for relief step with damages warnings', () => {
    expect(txPersonalInjury.stepValidations.relief).toBeDefined()
    expect(txPersonalInjury.stepValidations.relief.warnings.length).toBeGreaterThan(0)
  })

  it('has at least 7 glossary entries', () => {
    expect(txPersonalInjury.glossary.length).toBeGreaterThanOrEqual(7)
  })

  it('includes key glossary terms', () => {
    const terms = txPersonalInjury.glossary.map(g => g.term)
    expect(terms).toContain('Statute of Limitations')
    expect(terms).toContain('Negligence')
    expect(terms).toContain('Comparative Fault')
    expect(terms).toContain('Proximate Cause')
    expect(terms).toContain('Damages')
    expect(terms).toContain('Pre-suit Notice')
    expect(terms).toContain('Exemplary (Punitive) Damages')
  })

  it('maps every rejectionReason to a valid wizard step', () => {
    const validSteps = ['preflight', 'parties', 'venue', 'facts', 'claims', 'relief', 'how_to_file', 'review']
    for (const r of txPersonalInjury.rejectionReasons) {
      expect(validSteps).toContain(r.wizardStep)
    }
  })

  it('has at least 4 rejection reasons', () => {
    expect(txPersonalInjury.rejectionReasons.length).toBeGreaterThanOrEqual(4)
  })

  it('warns about comparative fault in claims step', () => {
    const claimsWarnings = txPersonalInjury.stepValidations.claims.warnings
    const hasFaultWarning = claimsWarnings.some(w => w.condition === 'no_comparative_fault_awareness')
    expect(hasFaultWarning).toBe(true)
  })
})
