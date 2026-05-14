import { describe, it, expect } from 'vitest'
import { jurisdictionRuleConfigSchema } from '@lawyer-free/shared/jurisdiction-rules/schema'
import { flContract } from '@lawyer-free/shared/jurisdiction-rules/fl/contract'

describe('FL contract config', () => {
  it('passes schema validation', () => {
    const result = jurisdictionRuleConfigSchema.safeParse(flContract)
    expect(result.success).toBe(true)
  })

  it('has state FL and disputeType contract', () => {
    expect(flContract.state).toBe('FL')
    expect(flContract.disputeType).toBe('contract')
  })

  it('includes required petition sections', () => {
    const sectionIds = flContract.requiredSections.map(s => s.id)
    expect(sectionIds).toContain('caption')
    expect(sectionIds).toContain('contract_description')
    expect(sectionIds).toContain('breach_allegations')
    expect(sectionIds).toContain('damages')
    expect(sectionIds).toContain('verification')
    expect(sectionIds).toContain('certificate_of_service')
  })

  it('has at least 5 required sections', () => {
    expect(flContract.requiredSections.length).toBeGreaterThanOrEqual(5)
  })

  it('has legal elements for breach allegations section', () => {
    const breach = flContract.requiredSections.find(s => s.id === 'breach_allegations')
    expect(breach?.legalElements).toBeDefined()
    expect(breach!.legalElements!.length).toBeGreaterThanOrEqual(4)
  })

  it('has step validations for facts step with contract_date required', () => {
    expect(flContract.stepValidations.facts).toBeDefined()
    expect(flContract.stepValidations.facts.required).toContain('contract_date')
  })

  it('has step validations for claims step with breach_type required', () => {
    expect(flContract.stepValidations.claims).toBeDefined()
    expect(flContract.stepValidations.claims.required).toContain('breach_type')
  })

  it('warns about attorney fees and offer of judgment in relief step', () => {
    expect(flContract.stepValidations.relief).toBeDefined()
    const feesWarning = flContract.stepValidations.relief.warnings.find(
      w => w.condition === 'no_attorney_fees_clause_check'
    )
    expect(feesWarning).toBeDefined()
    expect(feesWarning!.message).toContain('prevailing party')

    const ojWarning = flContract.stepValidations.relief.warnings.find(
      w => w.condition === 'no_offer_of_judgment_strategy'
    )
    expect(ojWarning).toBeDefined()
    expect(ojWarning!.message).toContain('768.79')
  })

  it('warns about UCC Article 2 in claims step', () => {
    const uccWarning = flContract.stepValidations.claims.warnings.find(
      w => w.condition === 'no_ucc_article_2_analysis'
    )
    expect(uccWarning).toBeDefined()
    expect(uccWarning!.message).toContain('UCC')
    expect(uccWarning!.message).toContain('672')
  })

  it('warns about Statute of Frauds in claims step', () => {
    const sofWarning = flContract.stepValidations.claims.warnings.find(
      w => w.condition === 'no_statute_of_frauds_awareness'
    )
    expect(sofWarning).toBeDefined()
    expect(sofWarning!.message).toContain('725.01')
  })

  it('has at least 7 glossary entries', () => {
    expect(flContract.glossary.length).toBeGreaterThanOrEqual(7)
  })

  it('includes key glossary terms', () => {
    const terms = flContract.glossary.map(g => g.term)
    expect(terms).toContain('Breach of Contract')
    expect(terms).toContain('Statute of Limitations')
    expect(terms).toContain('Specific Performance')
    expect(terms).toContain('Consequential Damages')
    expect(terms).toContain('Statute of Frauds')
    expect(terms).toContain('Attorney\'s Fees')
    expect(terms).toContain('Offer of Judgment')
    expect(terms).toContain('Mitigation')
  })

  it('maps every rejectionReason to a valid wizard step', () => {
    const validSteps = ['preflight', 'parties', 'venue', 'facts', 'claims', 'relief', 'how_to_file', 'review']
    for (const r of flContract.rejectionReasons) {
      expect(validSteps).toContain(r.wizardStep)
    }
  })

  it('has rejection reason for expired statute of limitations', () => {
    const solRejection = flContract.rejectionReasons.find(
      r => r.reason.includes('Statute of limitations')
    )
    expect(solRejection).toBeDefined()
    expect(solRejection!.howToAvoid).toContain('5-year')
  })

  it('has rejection reason for Statute of Frauds', () => {
    const sofRejection = flContract.rejectionReasons.find(
      r => r.reason.includes('Statute of Frauds')
    )
    expect(sofRejection).toBeDefined()
    expect(sofRejection!.howToAvoid).toContain('725.01')
  })

  it('has rejection reason for frivolous claims under FL Stat. §57.105', () => {
    const frivolousRejection = flContract.rejectionReasons.find(
      r => r.reason.includes('Frivolous') || r.reason.includes('57.105')
    )
    expect(frivolousRejection).toBeDefined()
    expect(frivolousRejection!.howToAvoid).toContain('57.105')
  })

  it('references FL-specific court tiers in filing rules', () => {
    expect(flContract.filingRules.courtName).toContain('Small Claims')
    expect(flContract.filingRules.courtName).toContain('County Court')
    expect(flContract.filingRules.courtName).toContain('Circuit Court')
    expect(flContract.filingRules.filingFee).toContain('fee waiver')
  })
})
