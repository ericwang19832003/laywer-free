import { describe, it, expect } from 'vitest'
import { jurisdictionRuleConfigSchema } from '@lawyer-free/shared/jurisdiction-rules/schema'
import { nyPersonalInjury } from '@lawyer-free/shared/jurisdiction-rules/ny/personal_injury'

describe('NY personal injury config', () => {
  it('passes schema validation', () => {
    const result = jurisdictionRuleConfigSchema.safeParse(nyPersonalInjury)
    expect(result.success).toBe(true)
  })

  it('has state NY and disputeType personal_injury', () => {
    expect(nyPersonalInjury.state).toBe('NY')
    expect(nyPersonalInjury.disputeType).toBe('personal_injury')
  })

  it('includes required petition sections', () => {
    const sectionIds = nyPersonalInjury.requiredSections.map(s => s.id)
    expect(sectionIds).toContain('caption')
    expect(sectionIds).toContain('facts')
    expect(sectionIds).toContain('negligence_elements')
    expect(sectionIds).toContain('damages')
    expect(sectionIds).toContain('verification')
    expect(sectionIds).toContain('proof_of_service')
  })

  it('has legal elements for negligence elements section', () => {
    const negligence = nyPersonalInjury.requiredSections.find(s => s.id === 'negligence_elements')
    expect(negligence?.legalElements).toBeDefined()
    expect(negligence!.legalElements!.length).toBeGreaterThanOrEqual(4)
  })

  it('has step validations for facts step with incident_date required', () => {
    expect(nyPersonalInjury.stepValidations.facts).toBeDefined()
    expect(nyPersonalInjury.stepValidations.facts.required).toContain('incident_date')
  })

  it('has step validations for claims step with negligence_basis required', () => {
    expect(nyPersonalInjury.stepValidations.claims).toBeDefined()
    expect(nyPersonalInjury.stepValidations.claims.required).toContain('negligence_basis')
  })

  it('warns about serious injury threshold for auto accidents in facts step', () => {
    const autoWarning = nyPersonalInjury.stepValidations.facts.warnings.find(
      w => w.condition === 'auto_accident_no_serious_injury'
    )
    expect(autoWarning).toBeDefined()
    expect(autoWarning!.message).toContain('serious injury')
    expect(autoWarning!.message).toContain('§5102(d)')
  })

  it('warns about government notice of claim 90-day deadline in facts step', () => {
    const govWarning = nyPersonalInjury.stepValidations.facts.warnings.find(
      w => w.condition === 'government_entity_notice_of_claim'
    )
    expect(govWarning).toBeDefined()
    expect(govWarning!.message).toContain('90 days')
    expect(govWarning!.message).toContain('§50-e')
  })

  it('warns about comparative fault in claims step', () => {
    const faultWarning = nyPersonalInjury.stepValidations.claims.warnings.find(
      w => w.condition === 'no_comparative_fault_awareness'
    )
    expect(faultWarning).toBeDefined()
    expect(faultWarning!.message).toContain('pure comparative fault')
    expect(faultWarning!.message).toContain('CPLR §1411')
  })

  it('warns about no-fault threshold in claims step', () => {
    const noFaultWarning = nyPersonalInjury.stepValidations.claims.warnings.find(
      w => w.condition === 'auto_accident_no_fault_threshold'
    )
    expect(noFaultWarning).toBeDefined()
    expect(noFaultWarning!.message).toContain('§5104')
  })

  it('has step validations for relief step with non-economic damages warning', () => {
    expect(nyPersonalInjury.stepValidations.relief).toBeDefined()
    const nonEconWarning = nyPersonalInjury.stepValidations.relief.warnings.find(
      w => w.condition === 'non_economic_damages_proportional_liability'
    )
    expect(nonEconWarning).toBeDefined()
    expect(nonEconWarning!.message).toContain('§1601-1602')
  })

  it('warns about specifying serious injury category in relief step', () => {
    const seriousInjuryWarning = nyPersonalInjury.stepValidations.relief.warnings.find(
      w => w.condition === 'serious_injury_category_not_specified'
    )
    expect(seriousInjuryWarning).toBeDefined()
    expect(seriousInjuryWarning!.message).toContain('§5102(d)')
  })

  it('has at least 8 glossary entries', () => {
    expect(nyPersonalInjury.glossary.length).toBeGreaterThanOrEqual(8)
  })

  it('includes key glossary terms', () => {
    const terms = nyPersonalInjury.glossary.map(g => g.term)
    expect(terms).toContain('Statute of Limitations')
    expect(terms).toContain('Negligence')
    expect(terms).toContain('Comparative Fault')
    expect(terms).toContain('Serious Injury Threshold')
    expect(terms).toContain('No-Fault Insurance')
    expect(terms).toContain('Notice of Claim')
    expect(terms).toContain('Certificate of Merit')
    expect(terms).toContain('Non-Economic Damages')
  })

  it('maps every rejectionReason to a valid wizard step', () => {
    const validSteps = ['preflight', 'parties', 'venue', 'facts', 'claims', 'relief', 'how_to_file', 'review']
    for (const r of nyPersonalInjury.rejectionReasons) {
      expect(validSteps).toContain(r.wizardStep)
    }
  })

  it('references NY-specific statutes in filing rules', () => {
    expect(nyPersonalInjury.filingRules.courtName).toContain('Supreme Court')
    expect(nyPersonalInjury.filingRules.serviceRequirements).toContain('CPLR §308')
    expect(nyPersonalInjury.filingRules.filingFee).toContain('$210')
  })

  it('has rejection reason for government notice of claim', () => {
    const govRejection = nyPersonalInjury.rejectionReasons.find(
      r => r.reason.includes('notice of claim')
    )
    expect(govRejection).toBeDefined()
    expect(govRejection!.howToAvoid).toContain('90 days')
  })

  it('has rejection reason for auto accident serious injury', () => {
    const autoRejection = nyPersonalInjury.rejectionReasons.find(
      r => r.reason.includes('serious injury')
    )
    expect(autoRejection).toBeDefined()
    expect(autoRejection!.howToAvoid).toContain('§5102(d)')
  })
})
