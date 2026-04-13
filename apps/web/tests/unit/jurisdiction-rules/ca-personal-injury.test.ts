import { describe, it, expect } from 'vitest'
import { jurisdictionRuleConfigSchema } from '@lawyer-free/shared/jurisdiction-rules/schema'
import { caPersonalInjury } from '@lawyer-free/shared/jurisdiction-rules/ca/personal_injury'

describe('CA personal injury config', () => {
  it('passes schema validation', () => {
    const result = jurisdictionRuleConfigSchema.safeParse(caPersonalInjury)
    expect(result.success).toBe(true)
  })

  it('has state CA and disputeType personal_injury', () => {
    expect(caPersonalInjury.state).toBe('CA')
    expect(caPersonalInjury.disputeType).toBe('personal_injury')
  })

  it('includes required petition sections', () => {
    const sectionIds = caPersonalInjury.requiredSections.map(s => s.id)
    expect(sectionIds).toContain('caption')
    expect(sectionIds).toContain('facts')
    expect(sectionIds).toContain('negligence_elements')
    expect(sectionIds).toContain('damages')
    expect(sectionIds).toContain('verification')
    expect(sectionIds).toContain('proof_of_service')
  })

  it('has legal elements for negligence elements section', () => {
    const negligence = caPersonalInjury.requiredSections.find(s => s.id === 'negligence_elements')
    expect(negligence?.legalElements).toBeDefined()
    expect(negligence!.legalElements!.length).toBeGreaterThanOrEqual(4)
  })

  it('has step validations for facts step with incident_date required', () => {
    expect(caPersonalInjury.stepValidations.facts).toBeDefined()
    expect(caPersonalInjury.stepValidations.facts.required).toContain('incident_date')
  })

  it('has step validations for claims step with negligence_basis required', () => {
    expect(caPersonalInjury.stepValidations.claims).toBeDefined()
    expect(caPersonalInjury.stepValidations.claims.required).toContain('negligence_basis')
  })

  it('has step validations for relief step with MICRA warning', () => {
    expect(caPersonalInjury.stepValidations.relief).toBeDefined()
    const micraWarning = caPersonalInjury.stepValidations.relief.warnings.find(
      w => w.condition === 'medical_malpractice_micra_cap'
    )
    expect(micraWarning).toBeDefined()
    expect(micraWarning!.message).toContain('MICRA')
  })

  it('warns about comparative fault in claims step', () => {
    const faultWarning = caPersonalInjury.stepValidations.claims.warnings.find(
      w => w.condition === 'no_comparative_fault_awareness'
    )
    expect(faultWarning).toBeDefined()
    expect(faultWarning!.message).toContain('pure comparative fault')
  })

  it('warns about government tort claim deadline in claims step', () => {
    const govWarning = caPersonalInjury.stepValidations.claims.warnings.find(
      w => w.condition === 'government_entity_claim_deadline'
    )
    expect(govWarning).toBeDefined()
    expect(govWarning!.message).toContain('6 months')
  })

  it('has at least 7 glossary entries', () => {
    expect(caPersonalInjury.glossary.length).toBeGreaterThanOrEqual(7)
  })

  it('includes key glossary terms', () => {
    const terms = caPersonalInjury.glossary.map(g => g.term)
    expect(terms).toContain('Statute of Limitations')
    expect(terms).toContain('Negligence')
    expect(terms).toContain('Comparative Fault')
    expect(terms).toContain('Proximate Cause')
    expect(terms).toContain('MICRA (Medical Injury Compensation Reform Act)')
    expect(terms).toContain('Government Tort Claim')
    expect(terms).toContain('Demand Letter')
    expect(terms).toContain('Non-Economic Damages')
  })

  it('maps every rejectionReason to a valid wizard step', () => {
    const validSteps = ['preflight', 'parties', 'venue', 'facts', 'claims', 'relief', 'how_to_file', 'review']
    for (const r of caPersonalInjury.rejectionReasons) {
      expect(validSteps).toContain(r.wizardStep)
    }
  })

  it('references CA-specific statutes in filing rules', () => {
    expect(caPersonalInjury.filingRules.courtName).toContain('Superior Court of California')
    expect(caPersonalInjury.filingRules.serviceRequirements).toContain('CCP')
    expect(caPersonalInjury.filingRules.filingFee).toContain('fee waiver')
  })

  it('has rejection reason for government tort claims', () => {
    const govRejection = caPersonalInjury.rejectionReasons.find(
      r => r.reason.includes('government tort claim')
    )
    expect(govRejection).toBeDefined()
    expect(govRejection!.howToAvoid).toContain('6 months')
  })
})
