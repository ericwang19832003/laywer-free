import { describe, it, expect } from 'vitest'
import { jurisdictionRuleConfigSchema } from '@lawyer-free/shared/jurisdiction-rules/schema'
import { paPersonalInjury } from '@lawyer-free/shared/jurisdiction-rules/pa/personal_injury'

describe('PA personal injury config', () => {
  it('passes schema validation', () => {
    const result = jurisdictionRuleConfigSchema.safeParse(paPersonalInjury)
    expect(result.success).toBe(true)
  })

  it('has state PA and disputeType personal_injury', () => {
    expect(paPersonalInjury.state).toBe('PA')
    expect(paPersonalInjury.disputeType).toBe('personal_injury')
  })

  it('includes required petition sections', () => {
    const sectionIds = paPersonalInjury.requiredSections.map(s => s.id)
    expect(sectionIds).toContain('caption')
    expect(sectionIds).toContain('facts')
    expect(sectionIds).toContain('negligence_elements')
    expect(sectionIds).toContain('damages')
    expect(sectionIds).toContain('verification')
    expect(sectionIds).toContain('certificate_of_service')
  })

  it('has legal elements for negligence elements section', () => {
    const negligence = paPersonalInjury.requiredSections.find(s => s.id === 'negligence_elements')
    expect(negligence?.legalElements).toBeDefined()
    expect(negligence!.legalElements!.length).toBeGreaterThanOrEqual(4)
  })

  it('has step validations for facts step with incident_date required', () => {
    expect(paPersonalInjury.stepValidations.facts).toBeDefined()
    expect(paPersonalInjury.stepValidations.facts.required).toContain('incident_date')
  })

  it('warns about limited tort in facts step', () => {
    const limitedTortWarning = paPersonalInjury.stepValidations.facts.warnings.find(
      w => w.condition === 'limited_tort_auto_case'
    )
    expect(limitedTortWarning).toBeDefined()
    expect(limitedTortWarning!.message).toContain('limited tort')
    expect(limitedTortWarning!.message).toContain('75 Pa.C.S. §1705')
  })

  it('warns about government entity 6-month notice in facts step', () => {
    const govWarning = paPersonalInjury.stepValidations.facts.warnings.find(
      w => w.condition === 'government_entity_claim_notice'
    )
    expect(govWarning).toBeDefined()
    expect(govWarning!.message).toContain('6 months')
    expect(govWarning!.message).toContain('42 Pa.C.S. §5522')
  })

  it('has step validations for claims step with negligence_basis required', () => {
    expect(paPersonalInjury.stepValidations.claims).toBeDefined()
    expect(paPersonalInjury.stepValidations.claims.required).toContain('negligence_basis')
  })

  it('warns about 51% bar comparative fault in claims step', () => {
    const faultWarning = paPersonalInjury.stepValidations.claims.warnings.find(
      w => w.condition === 'no_comparative_fault_awareness'
    )
    expect(faultWarning).toBeDefined()
    expect(faultWarning!.message).toContain('51% bar')
  })

  it('warns about certificate of merit for medical malpractice', () => {
    const certWarning = paPersonalInjury.stepValidations.claims.warnings.find(
      w => w.condition === 'medical_malpractice_certificate_of_merit'
    )
    expect(certWarning).toBeDefined()
    expect(certWarning!.message).toContain('40 P.S. §1303.508')
    expect(certWarning!.message).toContain('60 days')
  })

  it('has at least 7 glossary entries', () => {
    expect(paPersonalInjury.glossary.length).toBeGreaterThanOrEqual(7)
  })

  it('includes key glossary terms', () => {
    const terms = paPersonalInjury.glossary.map(g => g.term)
    expect(terms).toContain('Statute of Limitations')
    expect(terms).toContain('Negligence')
    expect(terms).toContain('Comparative Fault (51% Bar)')
    expect(terms).toContain('Limited Tort')
    expect(terms).toContain('Full Tort')
    expect(terms).toContain('Certificate of Merit')
    expect(terms).toContain('Sovereign Immunity')
    expect(terms).toContain('Non-Economic Damages')
  })

  it('maps every rejectionReason to a valid wizard step', () => {
    const validSteps = ['preflight', 'parties', 'venue', 'facts', 'claims', 'relief', 'how_to_file', 'review']
    for (const r of paPersonalInjury.rejectionReasons) {
      expect(validSteps).toContain(r.wizardStep)
    }
  })

  it('references PA-specific courts and filing info', () => {
    expect(paPersonalInjury.filingRules.courtName).toContain('Court of Common Pleas')
    expect(paPersonalInjury.filingRules.courtName).toContain('$12,000')
    expect(paPersonalInjury.filingRules.serviceRequirements).toContain('Pa.R.C.P.')
    expect(paPersonalInjury.filingRules.filingFee).toContain('IFP')
  })

  it('has rejection reason for missing certificate of merit', () => {
    const certRejection = paPersonalInjury.rejectionReasons.find(
      r => r.reason.includes('certificate of merit')
    )
    expect(certRejection).toBeDefined()
    expect(certRejection!.howToAvoid).toContain('60 days')
  })

  it('references 2-year SOL in glossary', () => {
    const sol = paPersonalInjury.glossary.find(g => g.term === 'Statute of Limitations')
    expect(sol?.plainEnglish).toContain('2 years')
    expect(sol?.plainEnglish).toContain('42 Pa.C.S. §5524')
  })
})
