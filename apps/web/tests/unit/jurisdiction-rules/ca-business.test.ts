import { describe, it, expect } from 'vitest'
import { jurisdictionRuleConfigSchema } from '@lawyer-free/shared/jurisdiction-rules/schema'
import { caBusiness } from '@lawyer-free/shared/jurisdiction-rules/ca/business'

describe('CA business config', () => {
  it('passes schema validation', () => {
    const result = jurisdictionRuleConfigSchema.safeParse(caBusiness)
    expect(result.success).toBe(true)
  })

  it('has state CA and disputeType business', () => {
    expect(caBusiness.state).toBe('CA')
    expect(caBusiness.disputeType).toBe('business')
  })

  it('includes all required petition sections', () => {
    const sectionIds = caBusiness.requiredSections.map(s => s.id)
    expect(sectionIds).toContain('caption')
    expect(sectionIds).toContain('facts')
    expect(sectionIds).toContain('claims')
    expect(sectionIds).toContain('damages')
    expect(sectionIds).toContain('injunctive_relief')
    expect(sectionIds).toContain('verification')
    expect(sectionIds).toContain('proof_of_service')
  })

  it('uses proof_of_service instead of certificate_of_service', () => {
    const sectionIds = caBusiness.requiredSections.map(s => s.id)
    expect(sectionIds).toContain('proof_of_service')
    expect(sectionIds).not.toContain('certificate_of_service')
  })

  it('has legal elements for claims covering all business dispute types', () => {
    const claims = caBusiness.requiredSections.find(s => s.id === 'claims')
    expect(claims?.legalElements).toBeDefined()
    expect(claims!.legalElements!.length).toBeGreaterThanOrEqual(6)

    const elements = claims!.legalElements!.join(' ')
    expect(elements).toContain('fiduciary duty')
    expect(elements).toContain('fraud')
    expect(elements).toContain('trade secret')
    expect(elements).toContain('Non-compete')
    expect(elements).toContain('Shareholder oppression')
    expect(elements).toContain('UCL')
  })

  it('has legal elements for claims referencing CA-specific statutes', () => {
    const claims = caBusiness.requiredSections.find(s => s.id === 'claims')
    const elements = claims!.legalElements!.join(' ')
    expect(elements).toContain('§1507')
    expect(elements).toContain('§338(d)')
    expect(elements).toContain('CUTSA')
    expect(elements).toContain('§16600')
    expect(elements).toContain('§17200')
    expect(elements).toContain('§1800')
    expect(elements).toContain('§1601')
  })

  it('notes non-competes are VOID in California', () => {
    const claims = caBusiness.requiredSections.find(s => s.id === 'claims')
    const nonCompeteElement = claims!.legalElements!.find(e => e.includes('Non-compete'))
    expect(nonCompeteElement).toContain('VOID')
    expect(nonCompeteElement).toContain('§16600')
  })

  it('has legal elements for damages including punitive damages and disgorgement', () => {
    const damages = caBusiness.requiredSections.find(s => s.id === 'damages')
    expect(damages?.legalElements).toBeDefined()
    const hasPunitive = damages!.legalElements!.some(e => e.includes('Punitive'))
    expect(hasPunitive).toBe(true)
    const hasDisgorgement = damages!.legalElements!.some(e => e.includes('Disgorgement') || e.includes('disgorgement'))
    expect(hasDisgorgement).toBe(true)
    const hasAttorneyFees = damages!.legalElements!.some(e => e.includes('§3426.4'))
    expect(hasAttorneyFees).toBe(true)
  })

  it('has legal elements for injunctive relief', () => {
    const injunction = caBusiness.requiredSections.find(s => s.id === 'injunctive_relief')
    expect(injunction?.legalElements).toBeDefined()
    expect(injunction!.legalElements!.length).toBeGreaterThanOrEqual(5)
    const elements = injunction!.legalElements!.join(' ')
    expect(elements).toContain('irreparable')
    expect(elements).toContain('adequate remedy')
  })

  it('has step validations for facts with relationship_start_date required', () => {
    expect(caBusiness.stepValidations.facts).toBeDefined()
    expect(caBusiness.stepValidations.facts.required).toContain('relationship_start_date')
  })

  it('has facts warnings about documenting business records and fiduciary relationship', () => {
    const factsWarnings = caBusiness.stepValidations.facts.warnings
    const hasRecordsWarning = factsWarnings.some(w => w.message.toLowerCase().includes('business records'))
    expect(hasRecordsWarning).toBe(true)
    const hasFiduciaryWarning = factsWarnings.some(w => w.message.toLowerCase().includes('fiduciary'))
    expect(hasFiduciaryWarning).toBe(true)
  })

  it('has step validations for claims with claim_type required', () => {
    expect(caBusiness.stepValidations.claims).toBeDefined()
    expect(caBusiness.stepValidations.claims.required).toContain('claim_type')
  })

  it('has claims warnings about non-compete unenforceability in CA', () => {
    const claimsWarnings = caBusiness.stepValidations.claims.warnings
    const hasNonCompeteWarning = claimsWarnings.some(
      w => w.message.includes('§16600') || w.message.toLowerCase().includes('void')
    )
    expect(hasNonCompeteWarning).toBe(true)
  })

  it('has claims warnings about UCL standing', () => {
    const claimsWarnings = caBusiness.stepValidations.claims.warnings
    const hasUCLWarning = claimsWarnings.some(
      w => w.message.includes('UCL') || w.message.includes('§17200')
    )
    expect(hasUCLWarning).toBe(true)
  })

  it('has step validations for relief with injunctive relief and lost profits warnings', () => {
    expect(caBusiness.stepValidations.relief).toBeDefined()
    const hasInjunctionWarning = caBusiness.stepValidations.relief.warnings.some(
      w => w.message.includes('injunctive relief') || w.message.includes('irreparable')
    )
    expect(hasInjunctionWarning).toBe(true)
    const hasLostProfitsWarning = caBusiness.stepValidations.relief.warnings.some(
      w => w.message.includes('lost profits')
    )
    expect(hasLostProfitsWarning).toBe(true)
  })

  it('has relief warnings about disgorgement under UCL', () => {
    const reliefWarnings = caBusiness.stepValidations.relief.warnings
    const hasDisgorgementWarning = reliefWarnings.some(
      w => w.message.toLowerCase().includes('disgorgement') && w.message.includes('UCL')
    )
    expect(hasDisgorgementWarning).toBe(true)
  })

  it('has at least 8 glossary entries', () => {
    expect(caBusiness.glossary.length).toBeGreaterThanOrEqual(8)
  })

  it('includes key glossary terms', () => {
    const terms = caBusiness.glossary.map(g => g.term)
    expect(terms).toContain('Fiduciary Duty')
    expect(terms).toContain('Trade Secret')
    expect(terms).toContain('Non-Compete (Void in California)')
    expect(terms).toContain('Unfair Competition Law (UCL)')
    expect(terms).toContain('Shareholder Oppression')
    expect(terms).toContain('Injunctive Relief')
    expect(terms).toContain('Derivative Action')
    expect(terms).toContain('Disgorgement')
    expect(terms).toContain('CUTSA (California Uniform Trade Secrets Act)')
  })

  it('references correct statutes of limitation in glossary', () => {
    const solEntry = caBusiness.glossary.find(g => g.term === 'Statute of Limitations')
    expect(solEntry).toBeDefined()
    expect(solEntry!.plainEnglish).toContain('§338(d)')
    expect(solEntry!.plainEnglish).toContain('§337')
    expect(solEntry!.plainEnglish).toContain('§3426.6')
    expect(solEntry!.plainEnglish).toContain('§343')
  })

  it('references CUTSA in trade secret glossary entry', () => {
    const tsEntry = caBusiness.glossary.find(g => g.term === 'Trade Secret')
    expect(tsEntry!.plainEnglish).toContain('§3426')
    expect(tsEntry!.plainEnglish).toContain('CUTSA')
  })

  it('references CA Corp. Code in derivative action glossary entry', () => {
    const daEntry = caBusiness.glossary.find(g => g.term === 'Derivative Action')
    expect(daEntry!.plainEnglish).toContain('Corp. Code')
    expect(daEntry!.plainEnglish).toContain('§1601')
  })

  it('non-compete glossary entry explains void status', () => {
    const ncEntry = caBusiness.glossary.find(g => g.term.includes('Non-Compete'))
    expect(ncEntry!.plainEnglish).toContain('VOID')
    expect(ncEntry!.plainEnglish).toContain('§16600')
    expect(ncEntry!.plainEnglish).toContain('§16601')
  })

  it('maps every rejectionReason to a valid wizard step', () => {
    const validSteps = ['preflight', 'parties', 'venue', 'facts', 'claims', 'relief', 'how_to_file', 'review']
    for (const r of caBusiness.rejectionReasons) {
      expect(validSteps).toContain(r.wizardStep)
    }
  })

  it('filing rules specify Superior Court', () => {
    expect(caBusiness.filingRules.courtName).toContain('Superior Court')
  })

  it('filing rules include venue guidance referencing CCP §395.5', () => {
    const venueRejection = caBusiness.rejectionReasons.find(r => r.reason.includes('venue'))
    expect(venueRejection).toBeDefined()
    expect(venueRejection!.howToAvoid).toContain('§395.5')
  })

  it('has a rejection reason warning about non-compete claims in CA', () => {
    const ncRejection = caBusiness.rejectionReasons.find(r => r.reason.toLowerCase().includes('non-compete'))
    expect(ncRejection).toBeDefined()
    expect(ncRejection!.howToAvoid).toContain('§16600')
  })

  it('filing fee mentions ~$435', () => {
    expect(caBusiness.filingRules.filingFee).toContain('435')
  })
})
