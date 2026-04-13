import { describe, it, expect } from 'vitest'
import { jurisdictionRuleConfigSchema } from '@lawyer-free/shared/jurisdiction-rules/schema'
import { txContract } from '@lawyer-free/shared/jurisdiction-rules/tx/contract'

describe('TX contract config', () => {
  it('passes schema validation', () => {
    const result = jurisdictionRuleConfigSchema.safeParse(txContract)
    expect(result.success).toBe(true)
  })

  it('has state TX and disputeType contract', () => {
    expect(txContract.state).toBe('TX')
    expect(txContract.disputeType).toBe('contract')
  })

  it('includes required petition sections', () => {
    const sectionIds = txContract.requiredSections.map(s => s.id)
    expect(sectionIds).toContain('caption')
    expect(sectionIds).toContain('contract_description')
    expect(sectionIds).toContain('breach_allegations')
    expect(sectionIds).toContain('damages')
    expect(sectionIds).toContain('verification')
    expect(sectionIds).toContain('certificate_of_service')
  })

  it('has legal elements for breach allegations', () => {
    const breach = txContract.requiredSections.find(s => s.id === 'breach_allegations')
    expect(breach?.legalElements).toBeDefined()
    expect(breach!.legalElements!.length).toBeGreaterThanOrEqual(4)
  })

  it('has legal elements for damages including attorney fees', () => {
    const damages = txContract.requiredSections.find(s => s.id === 'damages')
    expect(damages?.legalElements).toBeDefined()
    const hasAttorneyFees = damages!.legalElements!.some(e => e.includes('§38.001'))
    expect(hasAttorneyFees).toBe(true)
  })

  it('has step validations for facts with contract_date required', () => {
    expect(txContract.stepValidations.facts).toBeDefined()
    expect(txContract.stepValidations.facts.required).toContain('contract_date')
  })

  it('has step validations for claims with breach_type required', () => {
    expect(txContract.stepValidations.claims).toBeDefined()
    expect(txContract.stepValidations.claims.required).toContain('breach_type')
  })

  it('has step validations for relief with attorney fees warning', () => {
    expect(txContract.stepValidations.relief).toBeDefined()
    const hasFeesWarning = txContract.stepValidations.relief.warnings.some(
      w => w.message.includes('§38.001')
    )
    expect(hasFeesWarning).toBe(true)
  })

  it('has at least 7 glossary entries', () => {
    expect(txContract.glossary.length).toBeGreaterThanOrEqual(7)
  })

  it('includes key glossary terms', () => {
    const terms = txContract.glossary.map(g => g.term)
    expect(terms).toContain('Breach of Contract')
    expect(terms).toContain('Statute of Limitations')
    expect(terms).toContain('Specific Performance')
    expect(terms).toContain('Consequential Damages')
    expect(terms).toContain('Mitigation of Damages')
    expect(terms).toContain('Material Breach')
  })

  it('maps every rejectionReason to a valid wizard step', () => {
    const validSteps = ['preflight', 'parties', 'venue', 'facts', 'claims', 'relief', 'how_to_file', 'review']
    for (const r of txContract.rejectionReasons) {
      expect(validSteps).toContain(r.wizardStep)
    }
  })

  it('references correct statutes of limitation', () => {
    const solEntry = txContract.glossary.find(g => g.term === 'Statute of Limitations')
    expect(solEntry?.plainEnglish).toContain('§16.004')
    expect(solEntry?.plainEnglish).toContain('§16.003')
  })
})
