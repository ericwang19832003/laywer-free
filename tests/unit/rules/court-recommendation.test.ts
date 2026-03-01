import { describe, it, expect } from 'vitest'
import {
  recommendCourt,
  type CourtRecommendationInput,
  type CircumstanceFlags,
} from '@/lib/rules/court-recommendation'

// -- Helpers ------------------------------------------------------------------

const NO_CIRCUMSTANCES: CircumstanceFlags = {
  realProperty: false,
  outOfState: false,
  governmentEntity: false,
  federalLaw: false,
}

function makeInput(
  overrides: Partial<CourtRecommendationInput> = {}
): CourtRecommendationInput {
  return {
    disputeType: 'contract',
    amount: 'under_20k',
    circumstances: NO_CIRCUMSTANCES,
    ...overrides,
  }
}

// -- Federal Law Override -----------------------------------------------------

describe('recommendCourt -- federal law', () => {
  it('recommends federal court when federalLaw is true', () => {
    const result = recommendCourt(
      makeInput({
        circumstances: { ...NO_CIRCUMSTANCES, federalLaw: true },
      })
    )
    expect(result.recommended).toBe('federal')
    expect(result.confidence).toBe('high')
  })

  it('federal law overrides small amount', () => {
    const result = recommendCourt(
      makeInput({
        amount: 'under_20k',
        circumstances: { ...NO_CIRCUMSTANCES, federalLaw: true },
      })
    )
    expect(result.recommended).toBe('federal')
  })

  it('federal law overrides family dispute type', () => {
    const result = recommendCourt(
      makeInput({
        disputeType: 'family',
        circumstances: { ...NO_CIRCUMSTANCES, federalLaw: true },
      })
    )
    expect(result.recommended).toBe('federal')
  })
})

// -- Family Jurisdiction ------------------------------------------------------

describe('recommendCourt -- family', () => {
  it('recommends district court for family disputes', () => {
    const result = recommendCourt(
      makeInput({
        disputeType: 'family',
        amount: 'not_money',
      })
    )
    expect(result.recommended).toBe('district')
    expect(result.confidence).toBe('high')
  })

  it('family overrides small amount', () => {
    const result = recommendCourt(
      makeInput({
        disputeType: 'family',
        amount: 'under_20k',
      })
    )
    expect(result.recommended).toBe('district')
  })

  it('family overrides real property and reasoning mentions family', () => {
    const result = recommendCourt(
      makeInput({
        disputeType: 'family',
        amount: 'not_money',
        circumstances: { ...NO_CIRCUMSTANCES, realProperty: true },
      })
    )
    expect(result.recommended).toBe('district')
    expect(result.reasoning.toLowerCase()).toContain('family')
  })
})

// -- Real Property ------------------------------------------------------------

describe('recommendCourt -- real property', () => {
  it('recommends district court when real property is involved', () => {
    const result = recommendCourt(
      makeInput({
        circumstances: { ...NO_CIRCUMSTANCES, realProperty: true },
      })
    )
    expect(result.recommended).toBe('district')
    expect(result.confidence).toBe('high')
  })
})

// -- Diversity Jurisdiction (Out-of-State) ------------------------------------

describe('recommendCourt -- out-of-state diversity', () => {
  it('recommends federal when out-of-state and amount is 75k-200k', () => {
    const result = recommendCourt(
      makeInput({
        amount: '75k_200k',
        circumstances: { ...NO_CIRCUMSTANCES, outOfState: true },
      })
    )
    expect(result.recommended).toBe('federal')
    expect(result.confidence).toBe('moderate')
    expect(result.alternativeNote).toBeDefined()
    expect(result.alternativeNote!.length).toBeGreaterThan(0)
  })

  it('recommends federal when out-of-state and amount is over 200k', () => {
    const result = recommendCourt(
      makeInput({
        amount: 'over_200k',
        circumstances: { ...NO_CIRCUMSTANCES, outOfState: true },
      })
    )
    expect(result.recommended).toBe('federal')
    expect(result.confidence).toBe('moderate')
  })

  it('does not escalate to federal when out-of-state and amount is under 75k', () => {
    const result = recommendCourt(
      makeInput({
        amount: 'under_20k',
        circumstances: { ...NO_CIRCUMSTANCES, outOfState: true },
      })
    )
    expect(result.recommended).toBe('jp')
    expect(result.confidence).toBe('high')
  })
})

// -- Amount-Based Recommendations ---------------------------------------------

describe('recommendCourt -- amount-based', () => {
  it('recommends JP court for under 20k', () => {
    const result = recommendCourt(
      makeInput({ amount: 'under_20k' })
    )
    expect(result.recommended).toBe('jp')
    expect(result.confidence).toBe('high')
  })

  it('recommends county court for 20k-75k', () => {
    const result = recommendCourt(
      makeInput({ amount: '20k_75k' })
    )
    expect(result.recommended).toBe('county')
    expect(result.confidence).toBe('high')
  })

  it('recommends county court for 75k-200k without out-of-state', () => {
    const result = recommendCourt(
      makeInput({ amount: '75k_200k' })
    )
    expect(result.recommended).toBe('county')
    expect(result.confidence).toBe('high')
  })

  it('recommends district court for over 200k', () => {
    const result = recommendCourt(
      makeInput({ amount: 'over_200k' })
    )
    expect(result.recommended).toBe('district')
    expect(result.confidence).toBe('high')
  })

  it('recommends district court when amount is not about money', () => {
    const result = recommendCourt(
      makeInput({ amount: 'not_money' })
    )
    expect(result.recommended).toBe('district')
    expect(result.confidence).toBe('high')
  })
})

// -- Government Entity --------------------------------------------------------

describe('recommendCourt -- government entity', () => {
  it('government entity alone does not change recommendation', () => {
    const withGovt = recommendCourt(
      makeInput({
        circumstances: { ...NO_CIRCUMSTANCES, governmentEntity: true },
      })
    )
    const withoutGovt = recommendCourt(makeInput())

    expect(withGovt.recommended).toBe(withoutGovt.recommended)
    expect(withGovt.confidence).toBe(withoutGovt.confidence)
  })
})

// -- Reasoning ----------------------------------------------------------------

describe('recommendCourt -- reasoning', () => {
  it('every recommendation includes non-empty reasoning text', () => {
    const inputs: CourtRecommendationInput[] = [
      makeInput({ amount: 'under_20k' }),
      makeInput({ amount: '20k_75k' }),
      makeInput({ amount: '75k_200k' }),
      makeInput({ amount: 'over_200k' }),
      makeInput({ amount: 'not_money' }),
      makeInput({ disputeType: 'family', amount: 'not_money' }),
      makeInput({ circumstances: { ...NO_CIRCUMSTANCES, federalLaw: true } }),
      makeInput({ circumstances: { ...NO_CIRCUMSTANCES, realProperty: true } }),
      makeInput({
        amount: '75k_200k',
        circumstances: { ...NO_CIRCUMSTANCES, outOfState: true },
      }),
    ]

    for (const input of inputs) {
      const result = recommendCourt(input)
      expect(result.reasoning).toBeTruthy()
      expect(result.reasoning.length).toBeGreaterThan(0)
    }
  })
})
