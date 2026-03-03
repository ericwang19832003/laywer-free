import { describe, it, expect } from 'vitest'
import { recommendVenue, validateJurisdiction } from '@/lib/rules/venue-helper'

// ---------------------------------------------------------------------------
// recommendVenue
// ---------------------------------------------------------------------------
describe('recommendVenue', () => {
  it('returns defendant county by default for debt_collection', () => {
    const result = recommendVenue({
      disputeType: 'debt_collection',
      defendantCounty: 'Harris',
      incidentCounty: null,
      propertyCounty: null,
      contractCounty: null,
    })

    expect(result.recommended_county).toBe('Harris')
    expect(result.explanation).toContain('Harris County')
    expect(result.explanation).toContain('defendant lives')
    expect(result.rule_citation).toBe('Tex. Civ. Prac. & Rem. Code § 15.002')
  })

  it('returns property county for property dispute', () => {
    const result = recommendVenue({
      disputeType: 'property',
      defendantCounty: 'Harris',
      incidentCounty: null,
      propertyCounty: 'Travis',
      contractCounty: null,
    })

    expect(result.recommended_county).toBe('Travis')
    expect(result.explanation).toContain('Travis County')
    expect(result.explanation).toContain('property is located')
    expect(result.rule_citation).toBe('Tex. Civ. Prac. & Rem. Code § 15.011')
    expect(result.alternativeNote).toContain('Harris County')
  })

  it('returns property county for landlord_tenant', () => {
    const result = recommendVenue({
      disputeType: 'landlord_tenant',
      defendantCounty: 'Dallas',
      incidentCounty: null,
      propertyCounty: 'Bexar',
      contractCounty: null,
    })

    expect(result.recommended_county).toBe('Bexar')
    expect(result.explanation).toContain('Bexar County')
    expect(result.explanation).toContain('property is located')
    expect(result.rule_citation).toBe('Tex. Civ. Prac. & Rem. Code § 15.0115')
    expect(result.alternativeNote).toContain('Dallas County')
  })

  it('returns incident county for personal_injury', () => {
    const result = recommendVenue({
      disputeType: 'personal_injury',
      defendantCounty: 'Tarrant',
      incidentCounty: 'El Paso',
      propertyCounty: null,
      contractCounty: null,
    })

    expect(result.recommended_county).toBe('El Paso')
    expect(result.explanation).toContain('El Paso County')
    expect(result.explanation).toContain('incident happened')
    expect(result.rule_citation).toBe('Tex. Civ. Prac. & Rem. Code § 15.002')
    expect(result.alternativeNote).toContain('Tarrant County')
  })

  it('returns contract county for contract dispute', () => {
    const result = recommendVenue({
      disputeType: 'contract',
      defendantCounty: 'Harris',
      incidentCounty: null,
      propertyCounty: null,
      contractCounty: 'Collin',
    })

    expect(result.recommended_county).toBe('Collin')
    expect(result.explanation).toContain('Collin County')
    expect(result.explanation).toContain('contract was to be performed')
    expect(result.rule_citation).toBe('Tex. Civ. Prac. & Rem. Code § 15.035')
    expect(result.alternativeNote).toContain('Harris County')
  })

  it('falls back to defendant county when specific county is null', () => {
    const result = recommendVenue({
      disputeType: 'personal_injury',
      defendantCounty: 'Travis',
      incidentCounty: null,
      propertyCounty: null,
      contractCounty: null,
    })

    expect(result.recommended_county).toBe('Travis')
    expect(result.explanation).toContain('Travis County')
    expect(result.explanation).toContain('defendant lives')
    expect(result.alternativeNote).toBeUndefined()
  })

  it('returns null with explanation when all counties are null', () => {
    const result = recommendVenue({
      disputeType: 'property',
      defendantCounty: null,
      incidentCounty: null,
      propertyCounty: null,
      contractCounty: null,
    })

    expect(result.recommended_county).toBeNull()
    expect(result.explanation).toBe('We need at least one county to recommend where to file.')
  })

  // -------------------------------------------------------------------------
  // Family venue rules
  // -------------------------------------------------------------------------
  it('returns petitioner county with family domicile explanation', () => {
    const result = recommendVenue({
      disputeType: 'family',
      defendantCounty: 'Travis',
      incidentCounty: null,
      propertyCounty: null,
      contractCounty: null,
    })
    expect(result.recommended_county).toBe('Travis')
    expect(result.explanation).toContain('90 days')
    expect(result.explanation).toContain('6 months')
    expect(result.rule_citation).toContain('Fam. Code')
  })

  it('includes SAPCR alternative when incident county differs', () => {
    const result = recommendVenue({
      disputeType: 'family',
      defendantCounty: 'Harris',
      incidentCounty: 'Dallas',
      propertyCounty: null,
      contractCounty: null,
    })
    expect(result.recommended_county).toBe('Harris')
    expect(result.alternativeNote).toContain('Dallas County')
    expect(result.alternativeNote).toContain('103.001')
  })

  it('returns null with guidance when no county provided for family', () => {
    const result = recommendVenue({
      disputeType: 'family',
      defendantCounty: null,
      incidentCounty: null,
      propertyCounty: null,
      contractCounty: null,
    })
    expect(result.recommended_county).toBeNull()
    expect(result.explanation).toContain('divorce')
    expect(result.explanation).toContain('custody')
  })

  it('cites Family Code not Civil Practice for family cases', () => {
    const result = recommendVenue({
      disputeType: 'family',
      defendantCounty: 'Bexar',
      incidentCounty: null,
      propertyCounty: null,
      contractCounty: null,
    })
    expect(result.rule_citation).not.toContain('Civ. Prac.')
    expect(result.rule_citation).toContain('Fam. Code')
  })

  it('does not include SAPCR note when incident county matches defendant county', () => {
    const result = recommendVenue({
      disputeType: 'family',
      defendantCounty: 'Travis',
      incidentCounty: 'Travis',
      propertyCounty: null,
      contractCounty: null,
    })
    expect(result.alternativeNote).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// validateJurisdiction
// ---------------------------------------------------------------------------
describe('validateJurisdiction', () => {
  it('is valid for JP under $20K', () => {
    const result = validateJurisdiction({
      courtType: 'JP',
      amountSought: 15000,
    })

    expect(result.valid).toBe(true)
    expect(result.warning).toBeUndefined()
  })

  it('warns for JP over $20K with County Court suggestion', () => {
    const result = validateJurisdiction({
      courtType: 'JP',
      amountSought: 25000,
    })

    expect(result.valid).toBe(false)
    expect(result.warning).toBe('JP Court handles claims up to $20,000.')
    expect(result.suggestion).toBe('Consider filing in County Court instead.')
  })

  it('is valid for county in range', () => {
    const result = validateJurisdiction({
      courtType: 'County',
      amountSought: 150000,
    })

    expect(result.valid).toBe(true)
    expect(result.warning).toBeUndefined()
  })

  it('warns for county over $200K with District Court suggestion', () => {
    const result = validateJurisdiction({
      courtType: 'County',
      amountSought: 250000,
    })

    expect(result.valid).toBe(false)
    expect(result.warning).toBe('County Court handles claims up to $200,000.')
    expect(result.suggestion).toBe('Consider filing in District Court instead.')
  })

  it('warns for federal under $75K with out-of-state', () => {
    const result = validateJurisdiction({
      courtType: 'Federal',
      amountSought: 50000,
      isOutOfState: true,
    })

    expect(result.valid).toBe(false)
    expect(result.warning).toBe(
      'Federal court requires the amount to exceed $75,000 for diversity jurisdiction.'
    )
    expect(result.suggestion).toBe('Consider filing in Texas state court instead.')
  })

  it('is valid for federal over $75K with out-of-state', () => {
    const result = validateJurisdiction({
      courtType: 'Federal',
      amountSought: 100000,
      isOutOfState: true,
    })

    expect(result.valid).toBe(true)
    expect(result.warning).toBeUndefined()
  })

  it('is always valid for district regardless of amount', () => {
    const result = validateJurisdiction({
      courtType: 'District',
      amountSought: 10000000,
    })

    expect(result.valid).toBe(true)
    expect(result.warning).toBeUndefined()
  })
})
