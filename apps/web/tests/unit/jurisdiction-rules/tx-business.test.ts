import { describe, it, expect } from 'vitest'
import { jurisdictionRuleConfigSchema } from '@lawyer-free/shared/jurisdiction-rules/schema'
import { txBusiness } from '@lawyer-free/shared/jurisdiction-rules/tx/business'

describe('TX business config', () => {
  it('passes schema validation', () => {
    const result = jurisdictionRuleConfigSchema.safeParse(txBusiness)
    expect(result.success).toBe(true)
  })

  it('has state TX and disputeType business', () => {
    expect(txBusiness.state).toBe('TX')
    expect(txBusiness.disputeType).toBe('business')
  })

  it('includes all required petition sections', () => {
    const sectionIds = txBusiness.requiredSections.map(s => s.id)
    expect(sectionIds).toContain('caption')
    expect(sectionIds).toContain('facts')
    expect(sectionIds).toContain('claims')
    expect(sectionIds).toContain('damages')
    expect(sectionIds).toContain('injunctive_relief')
    expect(sectionIds).toContain('verification')
    expect(sectionIds).toContain('certificate_of_service')
  })

  it('has legal elements for claims covering all business dispute types', () => {
    const claims = txBusiness.requiredSections.find(s => s.id === 'claims')
    expect(claims?.legalElements).toBeDefined()
    expect(claims!.legalElements!.length).toBeGreaterThanOrEqual(4)

    const elements = claims!.legalElements!.join(' ')
    expect(elements).toContain('fiduciary duty')
    expect(elements).toContain('fraud')
    expect(elements).toContain('trade secret')
    expect(elements).toContain('Non-compete')
    expect(elements).toContain('Shareholder oppression')
  })

  it('has legal elements for damages including exemplary damages', () => {
    const damages = txBusiness.requiredSections.find(s => s.id === 'damages')
    expect(damages?.legalElements).toBeDefined()
    const hasExemplary = damages!.legalElements!.some(e => e.includes('Exemplary'))
    expect(hasExemplary).toBe(true)
    const hasAttorneyFees = damages!.legalElements!.some(e => e.includes('§38.001'))
    expect(hasAttorneyFees).toBe(true)
  })

  it('has legal elements for injunctive relief', () => {
    const injunction = txBusiness.requiredSections.find(s => s.id === 'injunctive_relief')
    expect(injunction?.legalElements).toBeDefined()
    expect(injunction!.legalElements!.length).toBeGreaterThanOrEqual(4)
    const elements = injunction!.legalElements!.join(' ')
    expect(elements).toContain('irreparable')
    expect(elements).toContain('adequate remedy')
  })

  it('has step validations for facts with relationship_start_date required', () => {
    expect(txBusiness.stepValidations.facts).toBeDefined()
    expect(txBusiness.stepValidations.facts.required).toContain('relationship_start_date')
  })

  it('has step validations for claims with claim_type required', () => {
    expect(txBusiness.stepValidations.claims).toBeDefined()
    expect(txBusiness.stepValidations.claims.required).toContain('claim_type')
  })

  it('has step validations for relief with injunctive relief and lost profits warnings', () => {
    expect(txBusiness.stepValidations.relief).toBeDefined()
    const hasInjunctionWarning = txBusiness.stepValidations.relief.warnings.some(
      w => w.message.includes('injunctive relief') || w.message.includes('irreparable')
    )
    expect(hasInjunctionWarning).toBe(true)
    const hasLostProfitsWarning = txBusiness.stepValidations.relief.warnings.some(
      w => w.message.includes('lost profits')
    )
    expect(hasLostProfitsWarning).toBe(true)
  })

  it('has facts warnings about documenting business records and fiduciary relationship', () => {
    const factsWarnings = txBusiness.stepValidations.facts.warnings
    const hasRecordsWarning = factsWarnings.some(w => w.message.toLowerCase().includes('business records'))
    expect(hasRecordsWarning).toBe(true)
    const hasFiduciaryWarning = factsWarnings.some(w => w.message.toLowerCase().includes('fiduciary'))
    expect(hasFiduciaryWarning).toBe(true)
  })

  it('has claims warnings about specifying duties breached', () => {
    const claimsWarnings = txBusiness.stepValidations.claims.warnings
    const hasDutiesWarning = claimsWarnings.some(w => w.message.toLowerCase().includes('dut'))
    expect(hasDutiesWarning).toBe(true)
  })

  it('has at least 7 glossary entries', () => {
    expect(txBusiness.glossary.length).toBeGreaterThanOrEqual(7)
  })

  it('includes key glossary terms', () => {
    const terms = txBusiness.glossary.map(g => g.term)
    expect(terms).toContain('Fiduciary Duty')
    expect(terms).toContain('Trade Secret')
    expect(terms).toContain('Non-Compete (Covenant Not to Compete)')
    expect(terms).toContain('Shareholder Oppression')
    expect(terms).toContain('Breach of Contract')
    expect(terms).toContain('Injunctive Relief')
    expect(terms).toContain('Exemplary Damages')
    expect(terms).toContain('Derivative Action')
  })

  it('references correct statutes of limitation in glossary', () => {
    const solEntry = txBusiness.glossary.find(g => g.term === 'Statute of Limitations')
    expect(solEntry).toBeDefined()
    expect(solEntry!.plainEnglish).toContain('§16.004')
    expect(solEntry!.plainEnglish).toContain('§16.003')
    expect(solEntry!.plainEnglish).toContain('§134A.006')
  })

  it('references TUTSA in trade secret glossary entry', () => {
    const tsEntry = txBusiness.glossary.find(g => g.term === 'Trade Secret')
    expect(tsEntry!.plainEnglish).toContain('§134A')
    expect(tsEntry!.plainEnglish).toContain('TUTSA')
  })

  it('references TX Bus. Orgs. Code in derivative action glossary entry', () => {
    const daEntry = txBusiness.glossary.find(g => g.term === 'Derivative Action')
    expect(daEntry!.plainEnglish).toContain('Bus. Orgs. Code')
  })

  it('maps every rejectionReason to a valid wizard step', () => {
    const validSteps = ['preflight', 'parties', 'venue', 'facts', 'claims', 'relief', 'how_to_file', 'review']
    for (const r of txBusiness.rejectionReasons) {
      expect(validSteps).toContain(r.wizardStep)
    }
  })

  it('filing rules specify District Court', () => {
    expect(txBusiness.filingRules.courtName).toContain('District Court')
  })

  it('filing rules include venue guidance referencing CPRC §15.002', () => {
    const venueRejection = txBusiness.rejectionReasons.find(r => r.reason.includes('venue'))
    expect(venueRejection).toBeDefined()
    expect(venueRejection!.howToAvoid).toContain('§15.002')
  })
})
