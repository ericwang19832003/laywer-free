import { describe, it, expect } from 'vitest'
import { jurisdictionRuleConfigSchema } from '@lawyer-free/shared/jurisdiction-rules/schema'
import { nyBusiness } from '@lawyer-free/shared/jurisdiction-rules/ny/business'

describe('NY business config', () => {
  it('passes schema validation', () => {
    const result = jurisdictionRuleConfigSchema.safeParse(nyBusiness)
    expect(result.success).toBe(true)
  })

  it('has state NY and disputeType business', () => {
    expect(nyBusiness.state).toBe('NY')
    expect(nyBusiness.disputeType).toBe('business')
  })

  it('includes all required petition sections', () => {
    const sectionIds = nyBusiness.requiredSections.map(s => s.id)
    expect(sectionIds).toContain('caption')
    expect(sectionIds).toContain('facts')
    expect(sectionIds).toContain('claims')
    expect(sectionIds).toContain('damages')
    expect(sectionIds).toContain('injunctive_relief')
    expect(sectionIds).toContain('verification')
    expect(sectionIds).toContain('proof_of_service')
  })

  it('has legal elements for claims covering all business dispute types', () => {
    const claims = nyBusiness.requiredSections.find(s => s.id === 'claims')
    expect(claims?.legalElements).toBeDefined()
    expect(claims!.legalElements!.length).toBeGreaterThanOrEqual(4)

    const elements = claims!.legalElements!.join(' ')
    expect(elements).toContain('fiduciary duty')
    expect(elements).toContain('fraud')
    expect(elements).toContain('Trade secret')
    expect(elements).toContain('Non-compete')
    expect(elements).toContain('Shareholder oppression')
    expect(elements).toContain('Gen. Bus. Law §349')
  })

  it('has legal elements for damages including disgorgement', () => {
    const damages = nyBusiness.requiredSections.find(s => s.id === 'damages')
    expect(damages?.legalElements).toBeDefined()
    const hasDisgorgement = damages!.legalElements!.some(e => e.includes('Disgorgement'))
    expect(hasDisgorgement).toBe(true)
    const hasAttorneyFees = damages!.legalElements!.some(e => e.includes('§349'))
    expect(hasAttorneyFees).toBe(true)
  })

  it('has legal elements for injunctive relief referencing CPLR §6301', () => {
    const injunction = nyBusiness.requiredSections.find(s => s.id === 'injunctive_relief')
    expect(injunction?.legalElements).toBeDefined()
    expect(injunction!.legalElements!.length).toBeGreaterThanOrEqual(4)
    const elements = injunction!.legalElements!.join(' ')
    expect(elements).toContain('Irreparable')
    expect(elements).toContain('adequate remedy')
    expect(elements).toContain('CPLR §6301')
  })

  it('has step validations for facts with relationship_start_date required', () => {
    expect(nyBusiness.stepValidations.facts).toBeDefined()
    expect(nyBusiness.stepValidations.facts.required).toContain('relationship_start_date')
  })

  it('has step validations for claims with claim_type required', () => {
    expect(nyBusiness.stepValidations.claims).toBeDefined()
    expect(nyBusiness.stepValidations.claims.required).toContain('claim_type')
  })

  it('has step validations for relief with injunctive relief and lost profits warnings', () => {
    expect(nyBusiness.stepValidations.relief).toBeDefined()
    const hasInjunctionWarning = nyBusiness.stepValidations.relief.warnings.some(
      w => w.message.includes('injunctive relief') || w.message.includes('irreparable')
    )
    expect(hasInjunctionWarning).toBe(true)
    const hasLostProfitsWarning = nyBusiness.stepValidations.relief.warnings.some(
      w => w.message.includes('lost profits')
    )
    expect(hasLostProfitsWarning).toBe(true)
  })

  it('has relief warning about Commercial Division requirements', () => {
    const hasCommDivWarning = nyBusiness.stepValidations.relief.warnings.some(
      w => w.message.includes('Commercial Division')
    )
    expect(hasCommDivWarning).toBe(true)
  })

  it('has facts warnings about documenting business records and fiduciary relationship', () => {
    const factsWarnings = nyBusiness.stepValidations.facts.warnings
    const hasRecordsWarning = factsWarnings.some(w => w.message.toLowerCase().includes('business records'))
    expect(hasRecordsWarning).toBe(true)
    const hasFiduciaryWarning = factsWarnings.some(w => w.message.toLowerCase().includes('fiduciary'))
    expect(hasFiduciaryWarning).toBe(true)
  })

  it('has claims warnings about non-compete reasonableness and trade secret common law', () => {
    const claimsWarnings = nyBusiness.stepValidations.claims.warnings
    const hasReasonablenessWarning = claimsWarnings.some(w => w.message.toLowerCase().includes('reasonableness'))
    expect(hasReasonablenessWarning).toBe(true)
    const hasCommonLawWarning = claimsWarnings.some(w => w.message.includes('common law') && w.message.includes('not UTSA'))
    expect(hasCommonLawWarning).toBe(true)
  })

  it('has at least 8 glossary entries', () => {
    expect(nyBusiness.glossary.length).toBeGreaterThanOrEqual(8)
  })

  it('includes key glossary terms', () => {
    const terms = nyBusiness.glossary.map(g => g.term)
    expect(terms).toContain('Fiduciary Duty')
    expect(terms).toContain('Trade Secret')
    expect(terms).toContain('Non-Compete (Covenant Not to Compete)')
    expect(terms).toContain('Shareholder Oppression')
    expect(terms).toContain('Derivative Action')
    expect(terms).toContain('Injunctive Relief')
    expect(terms).toContain('Commercial Division')
    expect(terms).toContain('Disgorgement')
  })

  it('references correct statutes of limitation in glossary', () => {
    const solEntry = nyBusiness.glossary.find(g => g.term === 'Statute of Limitations')
    expect(solEntry).toBeDefined()
    expect(solEntry!.plainEnglish).toContain('§213(8)')
    expect(solEntry!.plainEnglish).toContain('§213(2)')
    expect(solEntry!.plainEnglish).toContain('§213(1)')
  })

  it('references common law (not UTSA) in trade secret glossary entry', () => {
    const tsEntry = nyBusiness.glossary.find(g => g.term === 'Trade Secret')
    expect(tsEntry!.plainEnglish).toContain('common law')
    expect(tsEntry!.plainEnglish).toContain('not adopted')
  })

  it('references NY BCL §626 in derivative action glossary entry', () => {
    const daEntry = nyBusiness.glossary.find(g => g.term === 'Derivative Action')
    expect(daEntry!.plainEnglish).toContain('BCL §626')
  })

  it('references NY BCL §1104-a in shareholder oppression glossary entry', () => {
    const soEntry = nyBusiness.glossary.find(g => g.term === 'Shareholder Oppression')
    expect(soEntry!.plainEnglish).toContain('BCL §1104-a')
  })

  it('maps every rejectionReason to a valid wizard step', () => {
    const validSteps = ['preflight', 'parties', 'venue', 'facts', 'claims', 'relief', 'how_to_file', 'review']
    for (const r of nyBusiness.rejectionReasons) {
      expect(validSteps).toContain(r.wizardStep)
    }
  })

  it('filing rules specify Supreme Court and Commercial Division', () => {
    expect(nyBusiness.filingRules.courtName).toContain('Supreme Court')
    expect(nyBusiness.filingRules.courtName).toContain('Commercial Division')
  })

  it('filing rules include venue guidance referencing CPLR §503', () => {
    const venueRejection = nyBusiness.rejectionReasons.find(r => r.reason.includes('venue'))
    expect(venueRejection).toBeDefined()
    expect(venueRejection!.howToAvoid).toContain('§503')
  })

  it('filing fee mentions $210 and poor person relief', () => {
    expect(nyBusiness.filingRules.filingFee).toContain('$210')
    expect(nyBusiness.filingRules.filingFee).toContain('poor person')
  })
})
