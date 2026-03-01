/**
 * Deterministic Court Recommendation Engine
 *
 * Pure function that recommends the appropriate Texas court
 * based on dispute type, amount in controversy, and circumstance flags.
 * Zero side effects -- trivially unit-testable.
 */

// -- Types --------------------------------------------------------------------

export type DisputeType =
  | 'debt_collection'
  | 'landlord_tenant'
  | 'personal_injury'
  | 'contract'
  | 'property'
  | 'family'
  | 'other'

export type AmountRange =
  | 'under_20k'
  | '20k_75k'
  | '75k_200k'
  | 'over_200k'
  | 'not_money'

export type CourtType = 'jp' | 'county' | 'district' | 'federal'

export interface CircumstanceFlags {
  realProperty: boolean
  outOfState: boolean
  governmentEntity: boolean
  federalLaw: boolean
}

export interface CourtRecommendationInput {
  disputeType: DisputeType
  amount: AmountRange
  circumstances: CircumstanceFlags
}

export interface CourtRecommendation {
  recommended: CourtType
  reasoning: string
  alternativeNote?: string
  confidence: 'high' | 'moderate'
}

// -- Engine -------------------------------------------------------------------

/**
 * Recommends the appropriate court based on dispute type, amount in
 * controversy, and circumstance flags. Evaluated top-to-bottom; first
 * matching rule wins.
 */
export function recommendCourt(input: CourtRecommendationInput): CourtRecommendation {
  const { disputeType, amount, circumstances } = input

  // Rule 1: Federal law -- exclusive federal jurisdiction
  if (circumstances.federalLaw) {
    return {
      recommended: 'federal',
      reasoning:
        'This dispute involves a federal law claim, which falls under exclusive federal jurisdiction.',
      confidence: 'high',
    }
  }

  // Rule 2: Family -- exclusive district jurisdiction in Texas
  if (disputeType === 'family') {
    return {
      recommended: 'district',
      reasoning:
        'Family law matters have exclusive jurisdiction in Texas District Courts.',
      confidence: 'high',
    }
  }

  // Rule 3: Real property -- title to real property requires district court
  if (circumstances.realProperty) {
    return {
      recommended: 'district',
      reasoning:
        'Disputes involving title to real property must be heard in District Court.',
      confidence: 'high',
    }
  }

  // Rule 4: Diversity jurisdiction -- out-of-state party with sufficient amount
  if (
    circumstances.outOfState &&
    (amount === '75k_200k' || amount === 'over_200k')
  ) {
    return {
      recommended: 'federal',
      reasoning:
        'Out-of-state parties with an amount in controversy exceeding $75,000 may qualify for federal diversity jurisdiction.',
      alternativeNote:
        'You may also file in Texas District Court if you prefer state court.',
      confidence: 'moderate',
    }
  }

  // Rule 5: Small claims -- Justice of the Peace
  if (amount === 'under_20k') {
    return {
      recommended: 'jp',
      reasoning:
        'Claims under $20,000 are within the jurisdiction of Justice of the Peace (Small Claims) Court.',
      confidence: 'high',
    }
  }

  // Rule 6: Mid-range amounts -- County Court
  if (amount === '20k_75k' || amount === '75k_200k') {
    return {
      recommended: 'county',
      reasoning:
        'Claims between $20,000 and $200,000 fall within County Court at Law jurisdiction.',
      confidence: 'high',
    }
  }

  // Rule 7: Large amounts -- District Court
  if (amount === 'over_200k') {
    return {
      recommended: 'district',
      reasoning:
        'Claims exceeding $200,000 are best suited for District Court, which has no upper jurisdictional limit.',
      confidence: 'high',
    }
  }

  // Rule 8: Default (not_money or other) -- District Court
  return {
    recommended: 'district',
    reasoning:
      'Non-monetary disputes are generally heard in District Court, which has broad general jurisdiction.',
    confidence: 'high',
  }
}
