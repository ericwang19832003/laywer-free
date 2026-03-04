/**
 * Deterministic Court Recommendation Engine
 *
 * Pure function that recommends the appropriate court
 * based on dispute type, amount in controversy, circumstance flags,
 * and state. Supports Texas, California, and New York.
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
  | 'small_claims'
  | 'other'

export type AmountRange =
  | 'under_20k'
  | '20k_75k'
  | '75k_200k'
  | 'over_200k'
  | 'under_12500'
  | '12500_35k'
  | 'over_35k'
  | 'under_10k'
  | '10k_25k'
  | 'over_25k'
  | 'under_8k'
  | '8k_50k'
  | 'over_50k'
  | 'not_money'

export type CourtType =
  | 'jp'
  | 'county'
  | 'district'
  | 'federal'
  | 'small_claims'
  | 'limited_civil'
  | 'unlimited_civil'
  | 'ny_small_claims'
  | 'ny_civil'
  | 'ny_supreme'
  | 'fl_small_claims'
  | 'fl_county'
  | 'fl_circuit'

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
  subType?: string
  state?: 'TX' | 'CA' | 'NY' | 'FL'
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
 * controversy, circumstance flags, and state. Defaults to Texas.
 * Evaluated top-to-bottom; first matching rule wins.
 */
export function recommendCourt(input: CourtRecommendationInput): CourtRecommendation {
  if (input.state === 'FL') return recommendFloridaCourt(input)
  if (input.state === 'NY') return recommendNewYorkCourt(input)
  if (input.state === 'CA') return recommendCaliforniaCourt(input)
  return recommendTexasCourt(input)
}

// -- Texas Rules --------------------------------------------------------------

function recommendTexasCourt(input: CourtRecommendationInput): CourtRecommendation {
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

  // Rule 2.5: Eviction -- always JP Court
  if (disputeType === 'landlord_tenant' && input.subType === 'eviction') {
    return {
      recommended: 'jp',
      reasoning:
        'Eviction (forcible entry and detainer) cases are filed in Justice of the Peace Court in Texas, regardless of the amount involved.',
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

// -- California Rules ---------------------------------------------------------

function recommendCaliforniaCourt(input: CourtRecommendationInput): CourtRecommendation {
  const { disputeType, amount, circumstances } = input

  // Rule 1: Federal law
  if (circumstances.federalLaw) {
    return {
      recommended: 'federal',
      reasoning:
        'This dispute involves a federal law claim, which falls under exclusive federal jurisdiction.',
      confidence: 'high',
    }
  }

  // Rule 2: Family — Superior Court (Unlimited Civil)
  if (disputeType === 'family') {
    return {
      recommended: 'unlimited_civil',
      reasoning:
        'Family law matters are heard in California Superior Court (Unlimited Civil division).',
      confidence: 'high',
    }
  }

  // Rule 3: Eviction — always Unlimited Civil (unlawful detainer)
  if (disputeType === 'landlord_tenant' && input.subType === 'eviction') {
    return {
      recommended: 'unlimited_civil',
      reasoning:
        'Unlawful detainer (eviction) cases are heard in California Superior Court regardless of the amount involved.',
      confidence: 'high',
    }
  }

  // Rule 4: Real property — Unlimited Civil
  if (circumstances.realProperty) {
    return {
      recommended: 'unlimited_civil',
      reasoning:
        'Disputes involving title to real property are heard in California Superior Court (Unlimited Civil division).',
      confidence: 'high',
    }
  }

  // Rule 5: Diversity jurisdiction
  if (
    circumstances.outOfState &&
    (amount === 'over_35k' || amount === '75k_200k' || amount === 'over_200k')
  ) {
    return {
      recommended: 'federal',
      reasoning:
        'Out-of-state parties with an amount in controversy exceeding $75,000 may qualify for federal diversity jurisdiction.',
      alternativeNote:
        'You may also file in California Superior Court if you prefer state court.',
      confidence: 'moderate',
    }
  }

  // Rule 6: Small Claims — up to $12,500
  if (amount === 'under_12500') {
    return {
      recommended: 'small_claims',
      reasoning:
        'Claims up to $12,500 for individuals can be filed in California Small Claims Court (Code Civ. Proc. § 116.221).',
      confidence: 'high',
    }
  }

  // Rule 7: Limited Civil — $12,501 to $35,000
  if (amount === '12500_35k') {
    return {
      recommended: 'limited_civil',
      reasoning:
        'Claims between $12,500 and $35,000 fall within Limited Civil jurisdiction in California Superior Court (Code Civ. Proc. § 85).',
      confidence: 'high',
    }
  }

  // Rule 8: Unlimited Civil — over $35,000
  if (amount === 'over_35k' || amount === 'over_200k' || amount === '75k_200k') {
    return {
      recommended: 'unlimited_civil',
      reasoning:
        'Claims exceeding $35,000 are heard in California Superior Court (Unlimited Civil division).',
      confidence: 'high',
    }
  }

  // Handle TX amount ranges used in CA context
  if (amount === 'under_20k') {
    return {
      recommended: 'limited_civil',
      reasoning:
        'Claims in this range fall within Limited Civil jurisdiction in California Superior Court.',
      confidence: 'high',
    }
  }

  if (amount === '20k_75k') {
    return {
      recommended: 'unlimited_civil',
      reasoning:
        'Claims exceeding $35,000 are heard in California Superior Court (Unlimited Civil division).',
      confidence: 'high',
    }
  }

  // Default — Unlimited Civil
  return {
    recommended: 'unlimited_civil',
    reasoning:
      'Non-monetary disputes are generally heard in California Superior Court (Unlimited Civil division).',
    confidence: 'high',
  }
}

// -- New York Rules -----------------------------------------------------------

function recommendNewYorkCourt(input: CourtRecommendationInput): CourtRecommendation {
  const { disputeType, amount, circumstances } = input

  // Rule 1: Federal law
  if (circumstances.federalLaw) {
    return {
      recommended: 'federal',
      reasoning:
        'This dispute involves a federal law claim, which falls under exclusive federal jurisdiction.',
      confidence: 'high',
    }
  }

  // Rule 2: Family → Supreme Court (or Family Court)
  if (disputeType === 'family') {
    return {
      recommended: 'ny_supreme',
      reasoning:
        'Family law matters such as divorce are heard in New York Supreme Court. Custody and support matters may also be heard in Family Court.',
      confidence: 'high',
    }
  }

  // Rule 3: Eviction → Civil Court (Housing Court)
  if (disputeType === 'landlord_tenant' && input.subType === 'eviction') {
    return {
      recommended: 'ny_civil',
      reasoning:
        'Eviction proceedings are heard in Housing Court, which is part of New York Civil Court.',
      confidence: 'high',
    }
  }

  // Rule 4: Real property → Supreme Court
  if (circumstances.realProperty) {
    return {
      recommended: 'ny_supreme',
      reasoning:
        'Disputes involving title to real property are heard in New York Supreme Court.',
      confidence: 'high',
    }
  }

  // Rule 5: Diversity jurisdiction ($75K+ out-of-state)
  if (
    circumstances.outOfState &&
    (amount === 'over_25k' || amount === 'over_200k' || amount === '75k_200k')
  ) {
    return {
      recommended: 'federal',
      reasoning:
        'Out-of-state parties with an amount in controversy exceeding $75,000 may qualify for federal diversity jurisdiction.',
      alternativeNote:
        'You may also file in New York Supreme Court if you prefer state court.',
      confidence: 'moderate',
    }
  }

  // Rule 6: Under $10K → Small Claims (UCCA § 1801)
  if (amount === 'under_10k') {
    return {
      recommended: 'ny_small_claims',
      reasoning:
        'Claims up to $10,000 can be filed in New York Small Claims Court (UCCA § 1801).',
      confidence: 'high',
    }
  }

  // Rule 7: $10K–$25K → Civil Court
  if (amount === '10k_25k') {
    return {
      recommended: 'ny_civil',
      reasoning:
        'Claims between $10,000 and $25,000 fall within New York Civil Court jurisdiction.',
      confidence: 'high',
    }
  }

  // Rule 8: Over $25K → Supreme Court
  if (amount === 'over_25k' || amount === 'over_200k' || amount === '75k_200k') {
    return {
      recommended: 'ny_supreme',
      reasoning:
        'Claims exceeding $25,000 are heard in New York Supreme Court, which has unlimited civil jurisdiction.',
      confidence: 'high',
    }
  }

  // Handle TX/CA amount ranges used in NY context
  if (amount === 'under_20k' || amount === 'under_12500') {
    return {
      recommended: 'ny_civil',
      reasoning:
        'Claims in this range fall within New York Civil Court jurisdiction.',
      confidence: 'high',
    }
  }

  if (amount === '20k_75k' || amount === '12500_35k' || amount === 'over_35k') {
    return {
      recommended: 'ny_supreme',
      reasoning:
        'Claims exceeding $25,000 are heard in New York Supreme Court.',
      confidence: 'high',
    }
  }

  // Default → Supreme Court
  return {
    recommended: 'ny_supreme',
    reasoning:
      'Non-monetary disputes are generally heard in New York Supreme Court, which has broad general jurisdiction.',
    confidence: 'high',
  }
}

// -- Florida Rules ------------------------------------------------------------

function recommendFloridaCourt(input: CourtRecommendationInput): CourtRecommendation {
  const { disputeType, amount, circumstances } = input

  // Rule 1: Federal law
  if (circumstances.federalLaw) {
    return {
      recommended: 'federal',
      reasoning:
        'This dispute involves a federal law claim, which falls under exclusive federal jurisdiction.',
      confidence: 'high',
    }
  }

  // Rule 2: Family → Circuit Court
  if (disputeType === 'family') {
    return {
      recommended: 'fl_circuit',
      reasoning:
        'Family law matters are heard in Florida Circuit Court, which has exclusive jurisdiction over family cases.',
      confidence: 'high',
    }
  }

  // Rule 3: Eviction → County Court
  if (disputeType === 'landlord_tenant' && input.subType === 'eviction') {
    return {
      recommended: 'fl_county',
      reasoning:
        'Eviction proceedings are filed in Florida County Court (Fla. Stat. § 83.59).',
      confidence: 'high',
    }
  }

  // Rule 4: Real property → Circuit Court
  if (circumstances.realProperty) {
    return {
      recommended: 'fl_circuit',
      reasoning:
        'Disputes involving title to real property are heard in Florida Circuit Court.',
      confidence: 'high',
    }
  }

  // Rule 5: Diversity jurisdiction ($75K+ out-of-state)
  if (
    circumstances.outOfState &&
    (amount === 'over_50k' || amount === 'over_200k' || amount === '75k_200k')
  ) {
    return {
      recommended: 'federal',
      reasoning:
        'Out-of-state parties with an amount in controversy exceeding $75,000 may qualify for federal diversity jurisdiction.',
      alternativeNote:
        'You may also file in Florida Circuit Court if you prefer state court.',
      confidence: 'moderate',
    }
  }

  // Rule 6: Under $8K → Small Claims (Fla. Stat. § 34.01)
  if (amount === 'under_8k') {
    return {
      recommended: 'fl_small_claims',
      reasoning:
        'Claims up to $8,000 can be filed in Florida Small Claims Court (Fla. Stat. § 34.01).',
      confidence: 'high',
    }
  }

  // Rule 7: $8K–$50K → County Court
  if (amount === '8k_50k') {
    return {
      recommended: 'fl_county',
      reasoning:
        'Claims between $8,000 and $50,000 fall within Florida County Court jurisdiction (Fla. Stat. § 34.01).',
      confidence: 'high',
    }
  }

  // Rule 8: Over $50K → Circuit Court
  if (amount === 'over_50k' || amount === 'over_200k' || amount === '75k_200k') {
    return {
      recommended: 'fl_circuit',
      reasoning:
        'Claims exceeding $50,000 are heard in Florida Circuit Court, which has unlimited civil jurisdiction.',
      confidence: 'high',
    }
  }

  // Handle TX/CA/NY amount ranges used in FL context
  if (amount === 'under_20k' || amount === 'under_12500' || amount === 'under_10k') {
    return {
      recommended: 'fl_county',
      reasoning:
        'Claims in this range fall within Florida County Court jurisdiction.',
      confidence: 'high',
    }
  }

  if (amount === '20k_75k' || amount === '12500_35k' || amount === 'over_35k' || amount === '10k_25k' || amount === 'over_25k') {
    return {
      recommended: 'fl_circuit',
      reasoning:
        'Claims in this range are heard in Florida Circuit Court.',
      confidence: 'high',
    }
  }

  // Default → Circuit Court
  return {
    recommended: 'fl_circuit',
    reasoning:
      'Non-monetary disputes are generally heard in Florida Circuit Court, which has broad general jurisdiction.',
    confidence: 'high',
  }
}
