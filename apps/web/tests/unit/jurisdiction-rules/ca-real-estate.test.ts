import { describe, it, expect } from 'vitest'
import { jurisdictionRuleConfigSchema } from '@lawyer-free/shared/jurisdiction-rules/schema'
import { caRealEstate } from '@lawyer-free/shared/jurisdiction-rules/ca/real_estate'

describe('CA real estate config', () => {
  it('passes schema validation', () => {
    const result = jurisdictionRuleConfigSchema.safeParse(caRealEstate)
    expect(result.success).toBe(true)
  })

  it('has state CA and disputeType real_estate', () => {
    expect(caRealEstate.state).toBe('CA')
    expect(caRealEstate.disputeType).toBe('real_estate')
  })

  it('includes all required sections', () => {
    const sectionIds = caRealEstate.requiredSections.map(s => s.id)
    expect(sectionIds).toContain('caption')
    expect(sectionIds).toContain('property_description')
    expect(sectionIds).toContain('facts')
    expect(sectionIds).toContain('claims')
    expect(sectionIds).toContain('damages')
    expect(sectionIds).toContain('verification')
    expect(sectionIds).toContain('proof_of_service')
    expect(sectionIds.length).toBeGreaterThanOrEqual(7)
  })

  it('has legal elements for claims section covering key causes of action', () => {
    const claims = caRealEstate.requiredSections.find(s => s.id === 'claims')
    expect(claims?.legalElements).toBeDefined()
    expect(claims!.legalElements!.length).toBeGreaterThanOrEqual(5)

    const joined = claims!.legalElements!.join(' ')
    expect(joined).toContain('1102')
    expect(joined).toContain('2924')
    expect(joined).toContain('Davis-Stirling')
    expect(joined).toContain('17200')
    expect(joined.toLowerCase()).toContain('quiet title')
  })

  it('has property_description section with APN and legal description', () => {
    const propDesc = caRealEstate.requiredSections.find(s => s.id === 'property_description')
    expect(propDesc).toBeDefined()
    const joined = propDesc!.legalElements!.join(' ')
    expect(joined).toContain('APN')
    expect(joined).toContain('Legal description')
  })

  it('has step validations for facts step with transaction_date required', () => {
    expect(caRealEstate.stepValidations.facts).toBeDefined()
    expect(caRealEstate.stepValidations.facts.required).toContain('transaction_date')
  })

  it('has step validations for claims step with claim_type required', () => {
    expect(caRealEstate.stepValidations.claims).toBeDefined()
    expect(caRealEstate.stepValidations.claims.required).toContain('claim_type')
  })

  it('has step validations for relief step with lis pendens warning', () => {
    expect(caRealEstate.stepValidations.relief).toBeDefined()
    const warnings = caRealEstate.stepValidations.relief.warnings
    const lisPendens = warnings.find(w => w.message.toLowerCase().includes('lis pendens'))
    expect(lisPendens).toBeDefined()
  })

  it('has warnings about TDS violations and HBOR protections', () => {
    const claimsWarnings = caRealEstate.stepValidations.claims.warnings
    const tds = claimsWarnings.find(w => w.message.includes('Transfer Disclosure Statement'))
    const hbor = claimsWarnings.find(w => w.message.includes('Homeowner Bill of Rights'))
    expect(tds).toBeDefined()
    expect(hbor).toBeDefined()
  })

  it('has at least 8 glossary entries', () => {
    expect(caRealEstate.glossary.length).toBeGreaterThanOrEqual(8)
  })

  it('includes key glossary terms', () => {
    const terms = caRealEstate.glossary.map(g => g.term)
    expect(terms).toContain('Deed')
    expect(terms).toContain('Foreclosure')
    expect(terms).toContain('Lis Pendens')
    expect(terms).toContain('Specific Performance')
    expect(terms).toContain('Transfer Disclosure Statement (TDS)')
    expect(terms).toContain('Homeowner Bill of Rights (HBOR)')
    expect(terms).toContain('Adverse Possession')
  })

  it('maps every rejectionReason to a valid wizard step', () => {
    const validSteps = ['preflight', 'parties', 'venue', 'facts', 'claims', 'relief', 'how_to_file', 'review']
    for (const r of caRealEstate.rejectionReasons) {
      expect(validSteps).toContain(r.wizardStep)
    }
  })

  it('filing rules reference Superior Court and CCP §392 venue', () => {
    expect(caRealEstate.filingRules.courtName).toContain('Superior Court')
    expect(caRealEstate.filingRules.filingFee).toContain('435')
    expect(caRealEstate.filingRules.filingFee).toContain('FW-001')
  })

  it('uses proof_of_service instead of certificate_of_service', () => {
    const sectionIds = caRealEstate.requiredSections.map(s => s.id)
    expect(sectionIds).toContain('proof_of_service')
    expect(sectionIds).not.toContain('certificate_of_service')
  })
})
