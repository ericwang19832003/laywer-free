import { describe, it, expect } from 'vitest'
import { jurisdictionRuleConfigSchema } from '@lawyer-free/shared/jurisdiction-rules/schema'
import { nyContract } from '@lawyer-free/shared/jurisdiction-rules/ny/contract'

describe('NY contract config', () => {
  it('passes schema validation', () => {
    const result = jurisdictionRuleConfigSchema.safeParse(nyContract)
    expect(result.success).toBe(true)
  })

  it('has state NY and disputeType contract', () => {
    expect(nyContract.state).toBe('NY')
    expect(nyContract.disputeType).toBe('contract')
  })

  it('includes required petition sections', () => {
    const sectionIds = nyContract.requiredSections.map(s => s.id)
    expect(sectionIds).toContain('caption')
    expect(sectionIds).toContain('contract_description')
    expect(sectionIds).toContain('breach_allegations')
    expect(sectionIds).toContain('damages')
    expect(sectionIds).toContain('verification')
    expect(sectionIds).toContain('proof_of_service')
  })

  it('has legal elements for breach allegations with all four elements', () => {
    const breach = nyContract.requiredSections.find(s => s.id === 'breach_allegations')
    expect(breach?.legalElements).toBeDefined()
    expect(breach!.legalElements!.length).toBeGreaterThanOrEqual(4)
    const joined = breach!.legalElements!.join(' ')
    expect(joined).toContain('valid')
    expect(joined).toContain('Performance')
    expect(joined).toContain('Breach')
    expect(joined).toContain('Damages')
  })

  it('has legal elements for damages including pre-judgment interest', () => {
    const damages = nyContract.requiredSections.find(s => s.id === 'damages')
    expect(damages?.legalElements).toBeDefined()
    const hasCPLR5004 = damages!.legalElements!.some(e => e.includes('§5004'))
    expect(hasCPLR5004).toBe(true)
  })

  it('has legal elements for damages noting attorney fees are not default', () => {
    const damages = nyContract.requiredSections.find(s => s.id === 'damages')
    const feesElement = damages!.legalElements!.find(e => e.toLowerCase().includes('attorney'))
    expect(feesElement).toBeDefined()
    expect(feesElement).toContain('not default')
  })

  it('has step validations for facts with contract_date required', () => {
    expect(nyContract.stepValidations.facts).toBeDefined()
    expect(nyContract.stepValidations.facts.required).toContain('contract_date')
  })

  it('has step validations for facts with Statute of Frauds warning', () => {
    const hasSOFWarning = nyContract.stepValidations.facts.warnings.some(
      w => w.message.includes('GOL §5-701')
    )
    expect(hasSOFWarning).toBe(true)
  })

  it('has step validations for claims with breach_type required', () => {
    expect(nyContract.stepValidations.claims).toBeDefined()
    expect(nyContract.stepValidations.claims.required).toContain('breach_type')
  })

  it('has step validations for claims with CPLR §3015 specificity warning', () => {
    const hasSpecificityWarning = nyContract.stepValidations.claims.warnings.some(
      w => w.message.includes('§3015')
    )
    expect(hasSpecificityWarning).toBe(true)
  })

  it('has step validations for claims with accelerated judgment option', () => {
    const hasAcceleratedWarning = nyContract.stepValidations.claims.warnings.some(
      w => w.message.includes('§3213')
    )
    expect(hasAcceleratedWarning).toBe(true)
  })

  it('has step validations for relief with pre-judgment interest warning', () => {
    expect(nyContract.stepValidations.relief).toBeDefined()
    const hasInterestWarning = nyContract.stepValidations.relief.warnings.some(
      w => w.message.includes('§5004')
    )
    expect(hasInterestWarning).toBe(true)
  })

  it('has step validations for relief with attorney fees warning', () => {
    const hasFeesWarning = nyContract.stepValidations.relief.warnings.some(
      w => w.message.toLowerCase().includes('attorney')
    )
    expect(hasFeesWarning).toBe(true)
  })

  it('has at least 7 glossary entries', () => {
    expect(nyContract.glossary.length).toBeGreaterThanOrEqual(7)
  })

  it('includes key glossary terms', () => {
    const terms = nyContract.glossary.map(g => g.term)
    expect(terms).toContain('Breach of Contract')
    expect(terms).toContain('Statute of Limitations')
    expect(terms).toContain('Specific Performance')
    expect(terms).toContain('Consequential Damages')
    expect(terms).toContain('Statute of Frauds')
    expect(terms).toContain('Pre-judgment Interest')
    expect(terms).toContain('Liquidated Damages')
    expect(terms).toContain('Mitigation of Damages')
  })

  it('references correct statute of limitations (CPLR §213)', () => {
    const solEntry = nyContract.glossary.find(g => g.term === 'Statute of Limitations')
    expect(solEntry?.plainEnglish).toContain('§213')
    expect(solEntry?.plainEnglish).toContain('6 years')
  })

  it('maps every rejectionReason to a valid wizard step', () => {
    const validSteps = ['preflight', 'parties', 'venue', 'facts', 'claims', 'relief', 'how_to_file', 'review']
    for (const r of nyContract.rejectionReasons) {
      expect(validSteps).toContain(r.wizardStep)
    }
  })

  it('references venue rules (CPLR §503)', () => {
    const venueRejection = nyContract.rejectionReasons.find(r => r.wizardStep === 'venue')
    expect(venueRejection?.howToAvoid).toContain('§503')
  })
})
