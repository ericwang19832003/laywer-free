/**
 * Deterministic Court Recommendation Engine
 *
 * Pure function that recommends the appropriate court
 * based on dispute type, amount in controversy, circumstance flags,
 * and state. Supports Texas, California, New York, Florida, and Pennsylvania.
 * Zero side effects -- trivially unit-testable.
 */

// -- Types --------------------------------------------------------------------

export type DisputeType =
  | 'debt_collection'
  | 'landlord_tenant'
  | 'personal_injury'
  | 'contract'
  | 'property'
  | 'real_estate'
  | 'business'
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
  | 'under_12k'
  | 'over_12k'
  | 'over_10k'
  | 'under_6k'
  | '6k_15k'
  | 'under_15k'
  | 'over_15k'
  | 'under_7k'
  | '7k_25k'
  | 'under_5k'
  | '5k_20k'
  | 'over_20k'
  | '5k_25k'
  | '10k_100k'
  | 'over_100k'
  | '5k_10k'
  | 'under_7500'
  | '7500_15k'
  | 'under_2500'
  | '2500_5k'
  | '6k_20k'
  | 'over_5k'
  | 'over_7500'
  | 'under_3500'
  | 'over_3500'
  | 'under_25k'
  | '25k_75k'
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
  | 'ny_family_court'
  | 'fl_small_claims'
  | 'fl_county'
  | 'fl_circuit'
  | 'pa_magisterial'
  | 'pa_common_pleas'
  | 'il_small_claims'
  | 'il_circuit'
  | 'oh_small_claims'
  | 'oh_municipal'
  | 'oh_common_pleas'
  | 'ga_magistrate'
  | 'ga_state_court'
  | 'ga_superior'
  | 'nc_small_claims'
  | 'nc_district'
  | 'nc_superior'
  | 'mi_small_claims'
  | 'mi_district'
  | 'mi_circuit'
  | 'nj_small_claims'
  | 'nj_special_civil'
  | 'nj_civil'
  | 'nj_family'
  | 'va_small_claims'
  | 'va_general_district'
  | 'va_circuit'
  | 'va_jdr'
  | 'wa_small_claims'
  | 'wa_district'
  | 'wa_superior'
  | 'az_small_claims'
  | 'az_justice'
  | 'az_superior'
  | 'co_small_claims'
  | 'co_county'
  | 'co_district'
  | 'tn_general_sessions'
  | 'tn_circuit'
  | 'in_small_claims'
  | 'in_circuit'
  | 'mo_small_claims'
  | 'mo_associate_circuit'
  | 'mo_circuit'
  | 'md_district'
  | 'md_circuit'
  | 'wi_small_claims'
  | 'wi_circuit'
  | 'mn_conciliation'
  | 'mn_district'
  | 'sc_magistrate'
  | 'sc_circuit'
  | 'al_small_claims'
  | 'al_district'
  | 'al_circuit'
  | 'la_small_claims'
  | 'la_district'
  | 'ky_small_claims'
  | 'ky_district'
  | 'ky_circuit'
  | 'or_small_claims'
  | 'or_circuit'
  | 'nv_small_claims'
  | 'nv_district'
  | 'ct_small_claims'
  | 'ct_superior'
  | 'ma_small_claims'
  | 'ma_district'
  | 'ok_small_claims'
  | 'ok_district'
  | 'ar_small_claims'
  | 'ar_circuit'
  | 'ms_justice'
  | 'ms_county'
  | 'ms_circuit'
  | 'ut_small_claims'
  | 'ut_district'
  | 'nm_magistrate'
  | 'nm_district'
  | 'wv_magistrate'
  | 'wv_circuit'
  | 'de_jp'
  | 'de_common_pleas'
  | 'de_superior'
  | 'ri_small_claims'
  | 'ri_district'
  | 'ri_superior'
  | 'nh_small_claims'
  | 'nh_superior'
  | 'vt_small_claims'
  | 'vt_superior'
  | 'me_small_claims'
  | 'me_superior'
  | 'ia_small_claims'
  | 'ia_district'
  | 'ks_small_claims'
  | 'ks_district'
  | 'ne_small_claims'
  | 'ne_county'
  | 'ne_district'
  | 'sd_small_claims'
  | 'sd_circuit'
  | 'nd_small_claims'
  | 'nd_district'
  | 'mt_justice'
  | 'mt_district'
  | 'wy_small_claims'
  | 'wy_district'
  | 'id_small_claims'
  | 'id_magistrate'
  | 'id_district'
  | 'hi_small_claims'
  | 'hi_district'
  | 'hi_circuit'
  | 'ak_small_claims'
  | 'ak_district'

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
  state?: 'TX' | 'CA' | 'NY' | 'FL' | 'PA' | 'IL' | 'OH' | 'GA' | 'NC' | 'MI' | 'NJ' | 'VA' | 'WA' | 'AZ' | 'CO'
    | 'TN' | 'IN' | 'MO' | 'MD' | 'WI' | 'MN' | 'SC' | 'AL' | 'LA' | 'KY'
    | 'OR' | 'NV' | 'CT' | 'MA' | 'OK' | 'AR' | 'MS' | 'UT' | 'NM' | 'WV'
    | 'DE' | 'RI' | 'NH' | 'VT' | 'ME' | 'IA' | 'KS' | 'NE' | 'SD' | 'ND'
    | 'MT' | 'WY' | 'ID' | 'HI' | 'AK'
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
  if (input.state === 'PA') return recommendPennsylvaniaCourt(input)
  if (input.state === 'FL') return recommendFloridaCourt(input)
  if (input.state === 'NY') return recommendNewYorkCourt(input)
  if (input.state === 'CA') return recommendCaliforniaCourt(input)
  if (input.state === 'IL') return recommendIllinoisCourt(input)
  if (input.state === 'OH') return recommendOhioCourt(input)
  if (input.state === 'GA') return recommendGeorgiaCourt(input)
  if (input.state === 'NC') return recommendNorthCarolinaCourt(input)
  if (input.state === 'MI') return recommendMichiganCourt(input)
  if (input.state === 'NJ') return recommendNewJerseyCourt(input)
  if (input.state === 'VA') return recommendVirginiaCourt(input)
  if (input.state === 'WA') return recommendWashingtonCourt(input)
  if (input.state === 'AZ') return recommendArizonaCourt(input)
  if (input.state === 'CO') return recommendColoradoCourt(input)
  if (input.state === 'TN') return recommendTennesseeCourt(input)
  if (input.state === 'IN') return recommendIndianaCourt(input)
  if (input.state === 'MO') return recommendMissouriCourt(input)
  if (input.state === 'MD') return recommendMarylandCourt(input)
  if (input.state === 'WI') return recommendWisconsinCourt(input)
  if (input.state === 'MN') return recommendMinnesotaCourt(input)
  if (input.state === 'SC') return recommendSouthCarolinaCourt(input)
  if (input.state === 'AL') return recommendAlabamaCourt(input)
  if (input.state === 'LA') return recommendLouisianaCourt(input)
  if (input.state === 'KY') return recommendKentuckyCourt(input)
  if (input.state === 'OR') return recommendOregonCourt(input)
  if (input.state === 'NV') return recommendNevadaCourt(input)
  if (input.state === 'CT') return recommendConnecticutCourt(input)
  if (input.state === 'MA') return recommendMassachusettsCourt(input)
  if (input.state === 'OK') return recommendOklahomaCourt(input)
  if (input.state === 'AR') return recommendArkansasCourt(input)
  if (input.state === 'MS') return recommendMississippiCourt(input)
  if (input.state === 'UT') return recommendUtahCourt(input)
  if (input.state === 'NM') return recommendNewMexicoCourt(input)
  if (input.state === 'WV') return recommendWestVirginiaCourt(input)
  if (input.state === 'DE') return recommendDelawareCourt(input)
  if (input.state === 'RI') return recommendRhodeIslandCourt(input)
  if (input.state === 'NH') return recommendNewHampshireCourt(input)
  if (input.state === 'VT') return recommendVermontCourt(input)
  if (input.state === 'ME') return recommendMaineCourt(input)
  if (input.state === 'IA') return recommendIowaCourt(input)
  if (input.state === 'KS') return recommendKansasCourt(input)
  if (input.state === 'NE') return recommendNebraskaCourt(input)
  if (input.state === 'SD') return recommendSouthDakotaCourt(input)
  if (input.state === 'ND') return recommendNorthDakotaCourt(input)
  if (input.state === 'MT') return recommendMontanaCourt(input)
  if (input.state === 'WY') return recommendWyomingCourt(input)
  if (input.state === 'ID') return recommendIdahoCourt(input)
  if (input.state === 'HI') return recommendHawaiiCourt(input)
  if (input.state === 'AK') return recommendAlaskaCourt(input)
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
        'Claims between $20,000 and $250,000 fall within County Court at Law jurisdiction.',
      confidence: 'high',
    }
  }

  // Rule 7: Large amounts -- District Court
  if (amount === 'over_200k') {
    return {
      recommended: 'district',
      reasoning:
        'Claims exceeding $250,000 are best suited for District Court, which has no upper jurisdictional limit.',
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

  // Rule 5: Diversity jurisdiction — requires amount > $75,000 (28 U.S.C. § 1332)
  // CA's amount ranges use 'over_35k' as an unbounded top bucket (no 75k_200k bucket),
  // so 'over_35k' can cover claims above $75k and must be included here.
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

// -- Pennsylvania Rules -------------------------------------------------------

function recommendPennsylvaniaCourt(input: CourtRecommendationInput): CourtRecommendation {
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

  // Rule 2: Family → Court of Common Pleas (Family Division)
  if (disputeType === 'family') {
    return {
      recommended: 'pa_common_pleas',
      reasoning:
        'Family law matters are heard in the Family Division of Pennsylvania Court of Common Pleas.',
      confidence: 'high',
    }
  }

  // Rule 3: Eviction → Magisterial District Court
  if (disputeType === 'landlord_tenant' && input.subType === 'eviction') {
    return {
      recommended: 'pa_magisterial',
      reasoning:
        'Eviction proceedings are filed in Pennsylvania Magisterial District Court (68 P.S. § 250.501).',
      confidence: 'high',
    }
  }

  // Rule 4: Real property → Court of Common Pleas
  if (circumstances.realProperty) {
    return {
      recommended: 'pa_common_pleas',
      reasoning:
        'Disputes involving title to real property are heard in Pennsylvania Court of Common Pleas.',
      confidence: 'high',
    }
  }

  // Rule 5: Diversity jurisdiction ($75K+ out-of-state)
  if (
    circumstances.outOfState &&
    (amount === 'over_12k' || amount === 'over_200k' || amount === '75k_200k')
  ) {
    return {
      recommended: 'federal',
      reasoning:
        'Out-of-state parties with an amount in controversy exceeding $75,000 may qualify for federal diversity jurisdiction.',
      alternativeNote:
        'You may also file in Pennsylvania Court of Common Pleas if you prefer state court.',
      confidence: 'moderate',
    }
  }

  // Rule 6: Under $12K → Magisterial District Court (42 Pa.C.S. § 1515)
  if (amount === 'under_12k') {
    return {
      recommended: 'pa_magisterial',
      reasoning:
        'Claims up to $12,000 can be filed in Pennsylvania Magisterial District Court (42 Pa.C.S. § 1515).',
      confidence: 'high',
    }
  }

  // Rule 7: Over $12K → Court of Common Pleas
  if (amount === 'over_12k' || amount === 'over_200k' || amount === '75k_200k') {
    return {
      recommended: 'pa_common_pleas',
      reasoning:
        'Claims exceeding $12,000 are heard in Pennsylvania Court of Common Pleas, which has unlimited civil jurisdiction.',
      confidence: 'high',
    }
  }

  // Handle TX/CA/NY/FL amount ranges used in PA context
  if (amount === 'under_20k' || amount === 'under_12500' || amount === 'under_10k' || amount === 'under_8k') {
    return {
      recommended: 'pa_common_pleas',
      reasoning:
        'Claims in this range fall within Pennsylvania Court of Common Pleas jurisdiction.',
      confidence: 'high',
    }
  }

  if (amount === '20k_75k' || amount === '12500_35k' || amount === 'over_35k' || amount === '10k_25k' || amount === 'over_25k' || amount === '8k_50k' || amount === 'over_50k') {
    return {
      recommended: 'pa_common_pleas',
      reasoning:
        'Claims in this range are heard in Pennsylvania Court of Common Pleas.',
      confidence: 'high',
    }
  }

  // Default → Court of Common Pleas
  return {
    recommended: 'pa_common_pleas',
    reasoning:
      'Non-monetary disputes are generally heard in Pennsylvania Court of Common Pleas, which has broad general jurisdiction.',
    confidence: 'high',
  }
}

// -- Illinois Rules -----------------------------------------------------------

function recommendIllinoisCourt(input: CourtRecommendationInput): CourtRecommendation {
  const { disputeType, amount, circumstances } = input

  if (circumstances.federalLaw) {
    return { recommended: 'federal', reasoning: 'This dispute involves a federal law claim, which falls under exclusive federal jurisdiction.', confidence: 'high' }
  }

  if (disputeType === 'family') {
    return { recommended: 'il_circuit', reasoning: 'Family law matters (divorce, custody, support) are heard in Illinois Circuit Court — Domestic Relations Division.', confidence: 'high' }
  }

  if (disputeType === 'landlord_tenant' && input.subType === 'eviction') {
    return { recommended: 'il_circuit', reasoning: 'Eviction (forcible entry and detainer) cases are filed in Illinois Circuit Court in the county where the property is located (735 ILCS 5/9-106).', confidence: 'high' }
  }

  if (circumstances.realProperty) {
    return { recommended: 'il_circuit', reasoning: 'Disputes involving title to real property are heard in Illinois Circuit Court.', confidence: 'high' }
  }

  if (circumstances.outOfState && (amount === 'over_10k' || amount === 'over_200k' || amount === '75k_200k' || amount === 'over_25k' || amount === 'over_35k' || amount === 'over_50k')) {
    return { recommended: 'federal', reasoning: 'Out-of-state parties with an amount in controversy exceeding $75,000 may qualify for federal diversity jurisdiction.', alternativeNote: 'You may also file in Illinois Circuit Court if you prefer state court.', confidence: 'moderate' }
  }

  if (amount === 'under_10k') {
    return { recommended: 'il_small_claims', reasoning: 'Claims up to $10,000 can be filed using Small Claims procedures within the Illinois Circuit Court (Ill. Sup. Ct. Rule 281).', confidence: 'high' }
  }

  return { recommended: 'il_circuit', reasoning: 'Claims exceeding $10,000 are heard in Illinois Circuit Court, which has unlimited original civil jurisdiction.', confidence: 'high' }
}

// -- Ohio Rules ---------------------------------------------------------------

function recommendOhioCourt(input: CourtRecommendationInput): CourtRecommendation {
  const { disputeType, amount, circumstances } = input

  if (circumstances.federalLaw) {
    return { recommended: 'federal', reasoning: 'This dispute involves a federal law claim, which falls under exclusive federal jurisdiction.', confidence: 'high' }
  }

  if (disputeType === 'family') {
    return { recommended: 'oh_common_pleas', reasoning: 'Family law matters are heard in the Domestic Relations Division of Ohio Court of Common Pleas (ORC Ch. 3105).', confidence: 'high' }
  }

  if (disputeType === 'landlord_tenant' && input.subType === 'eviction') {
    return { recommended: 'oh_municipal', reasoning: 'Eviction (forcible entry and detainer) cases are filed in Municipal Court or County Court in the county where the property is located (ORC Ch. 1923).', confidence: 'high' }
  }

  if (circumstances.realProperty) {
    return { recommended: 'oh_common_pleas', reasoning: 'Disputes involving title to real property are heard in Ohio Court of Common Pleas.', confidence: 'high' }
  }

  if (circumstances.outOfState && (amount === 'over_15k' || amount === 'over_200k' || amount === '75k_200k' || amount === 'over_25k')) {
    return { recommended: 'federal', reasoning: 'Out-of-state parties with an amount in controversy exceeding $75,000 may qualify for federal diversity jurisdiction.', alternativeNote: 'You may also file in Ohio Court of Common Pleas if you prefer state court.', confidence: 'moderate' }
  }

  if (amount === 'under_6k') {
    return { recommended: 'oh_small_claims', reasoning: 'Claims up to $6,000 can be filed in Ohio Small Claims Court within the Municipal or County Court (ORC § 1925.02).', confidence: 'high' }
  }

  if (amount === '6k_15k') {
    return { recommended: 'oh_municipal', reasoning: 'Claims between $6,000 and $15,000 fall within Ohio Municipal Court (or County Court) jurisdiction (ORC § 1901.17).', confidence: 'high' }
  }

  if (amount === 'over_15k' || amount === 'over_200k' || amount === '75k_200k' || amount === 'over_25k') {
    return { recommended: 'oh_common_pleas', reasoning: 'Claims exceeding $15,000 are heard in Ohio Court of Common Pleas, which has unlimited civil jurisdiction.', confidence: 'high' }
  }

  return { recommended: 'oh_common_pleas', reasoning: 'Non-monetary disputes are generally heard in Ohio Court of Common Pleas, which has broad general jurisdiction.', confidence: 'high' }
}

// -- Georgia Rules ------------------------------------------------------------

function recommendGeorgiaCourt(input: CourtRecommendationInput): CourtRecommendation {
  const { disputeType, amount, circumstances } = input

  if (circumstances.federalLaw) {
    return { recommended: 'federal', reasoning: 'This dispute involves a federal law claim, which falls under exclusive federal jurisdiction.', confidence: 'high' }
  }

  if (disputeType === 'family') {
    return { recommended: 'ga_superior', reasoning: 'Family law matters (divorce, custody, support) have exclusive jurisdiction in Georgia Superior Court (O.C.G.A. § 19-5-1).', confidence: 'high' }
  }

  if (disputeType === 'landlord_tenant' && input.subType === 'eviction') {
    return { recommended: 'ga_magistrate', reasoning: 'Dispossessory (eviction) proceedings are filed in Georgia Magistrate Court in the county where the property is located (O.C.G.A. § 44-7-50).', confidence: 'high' }
  }

  if (circumstances.realProperty) {
    return { recommended: 'ga_superior', reasoning: 'Disputes involving title to real property have exclusive jurisdiction in Georgia Superior Court (O.C.G.A. § 23-2-58).', confidence: 'high' }
  }

  if (circumstances.outOfState && (amount === 'over_15k' || amount === 'over_200k' || amount === '75k_200k' || amount === 'over_25k')) {
    return { recommended: 'federal', reasoning: 'Out-of-state parties with an amount in controversy exceeding $75,000 may qualify for federal diversity jurisdiction.', alternativeNote: 'You may also file in Georgia Superior Court if you prefer state court.', confidence: 'moderate' }
  }

  if (amount === 'under_15k') {
    return { recommended: 'ga_magistrate', reasoning: 'Claims up to $15,000 can be filed in Georgia Magistrate Court (O.C.G.A. § 15-10-2).', confidence: 'high' }
  }

  return { recommended: 'ga_superior', reasoning: 'Claims exceeding $15,000 or involving equitable relief are heard in Georgia Superior Court, which has unlimited civil jurisdiction.', confidence: 'high' }
}

// -- North Carolina Rules -----------------------------------------------------

function recommendNorthCarolinaCourt(input: CourtRecommendationInput): CourtRecommendation {
  const { disputeType, amount, circumstances } = input

  if (circumstances.federalLaw) {
    return { recommended: 'federal', reasoning: 'This dispute involves a federal law claim, which falls under exclusive federal jurisdiction.', confidence: 'high' }
  }

  if (disputeType === 'family') {
    return { recommended: 'nc_district', reasoning: 'Family law matters (divorce, custody, support, domestic violence) have exclusive jurisdiction in North Carolina District Court (N.C.G.S. § 7A-244).', confidence: 'high' }
  }

  if (disputeType === 'landlord_tenant' && input.subType === 'eviction') {
    return { recommended: 'nc_small_claims', reasoning: 'Summary ejectment (eviction) cases are filed before a Magistrate in North Carolina District Court (N.C.G.S. § 42-34). Appeals are heard de novo in District Court.', confidence: 'high' }
  }

  if (circumstances.realProperty) {
    return { recommended: 'nc_superior', reasoning: 'Disputes involving title to real property are heard in North Carolina Superior Court.', confidence: 'high' }
  }

  if (circumstances.outOfState && (amount === 'over_25k' || amount === 'over_200k' || amount === '75k_200k')) {
    return { recommended: 'federal', reasoning: 'Out-of-state parties with an amount in controversy exceeding $75,000 may qualify for federal diversity jurisdiction.', alternativeNote: 'You may also file in North Carolina Superior Court if you prefer state court.', confidence: 'moderate' }
  }

  if (amount === 'under_10k') {
    return { recommended: 'nc_small_claims', reasoning: 'Claims up to $10,000 can be filed before a Magistrate in Small Claims Court (N.C.G.S. § 7A-210). Either party may appeal de novo to District Court.', confidence: 'high' }
  }

  if (amount === '10k_25k') {
    return { recommended: 'nc_district', reasoning: 'Claims between $10,000 and $25,000 fall within North Carolina District Court jurisdiction (N.C.G.S. § 7A-243).', confidence: 'high' }
  }

  if (amount === 'over_25k' || amount === 'over_200k' || amount === '75k_200k') {
    return { recommended: 'nc_superior', reasoning: 'Claims exceeding $25,000 are heard in North Carolina Superior Court, which has unlimited civil jurisdiction.', confidence: 'high' }
  }

  return { recommended: 'nc_superior', reasoning: 'Non-monetary disputes are generally heard in North Carolina Superior Court, which has broad general jurisdiction.', confidence: 'high' }
}

// -- Michigan Rules -----------------------------------------------------------

function recommendMichiganCourt(input: CourtRecommendationInput): CourtRecommendation {
  const { disputeType, amount, circumstances } = input

  if (circumstances.federalLaw) {
    return { recommended: 'federal', reasoning: 'This dispute involves a federal law claim, which falls under exclusive federal jurisdiction.', confidence: 'high' }
  }

  if (disputeType === 'family') {
    return { recommended: 'mi_circuit', reasoning: 'Family law matters (divorce, custody, support) are heard in the Family Division of Michigan Circuit Court (MCL § 552.6).', confidence: 'high' }
  }

  if (disputeType === 'landlord_tenant' && input.subType === 'eviction') {
    return { recommended: 'mi_district', reasoning: 'Eviction (summary proceedings) cases are filed in Michigan District Court in the county where the property is located (MCL § 600.5701).', confidence: 'high' }
  }

  if (circumstances.realProperty) {
    return { recommended: 'mi_circuit', reasoning: 'Disputes involving title to real property are heard in Michigan Circuit Court.', confidence: 'high' }
  }

  if (circumstances.outOfState && (amount === 'over_25k' || amount === 'over_200k' || amount === '75k_200k')) {
    return { recommended: 'federal', reasoning: 'Out-of-state parties with an amount in controversy exceeding $75,000 may qualify for federal diversity jurisdiction.', alternativeNote: 'You may also file in Michigan Circuit Court if you prefer state court.', confidence: 'moderate' }
  }

  if (amount === 'under_7k') {
    return { recommended: 'mi_small_claims', reasoning: 'Claims up to $7,000 can be filed in Michigan Small Claims Court within the District Court (MCL § 600.8401). Note: parties waive the right to appeal.', confidence: 'high' }
  }

  if (amount === '7k_25k') {
    return { recommended: 'mi_district', reasoning: 'Claims between $7,000 and $25,000 fall within Michigan District Court general civil jurisdiction (MCL § 600.8301).', confidence: 'high' }
  }

  if (amount === 'over_25k' || amount === 'over_200k' || amount === '75k_200k') {
    return { recommended: 'mi_circuit', reasoning: 'Claims exceeding $25,000 are heard in Michigan Circuit Court, which has unlimited civil jurisdiction (MCL § 600.605).', confidence: 'high' }
  }

  return { recommended: 'mi_circuit', reasoning: 'Non-monetary disputes are generally heard in Michigan Circuit Court, which has broad general jurisdiction.', confidence: 'high' }
}

// -- New Jersey Rules ---------------------------------------------------------

function recommendNewJerseyCourt(input: CourtRecommendationInput): CourtRecommendation {
  const { disputeType, amount, circumstances } = input

  if (circumstances.federalLaw) {
    return { recommended: 'federal', reasoning: 'This dispute involves a federal law claim, which falls under exclusive federal jurisdiction.', confidence: 'high' }
  }

  if (disputeType === 'family') {
    return { recommended: 'nj_family', reasoning: 'Family law matters (divorce, custody, support, domestic violence) are heard in the Family Part of the New Jersey Superior Court Chancery Division (N.J. Ct. R. 5:1-1).', confidence: 'high' }
  }

  if (disputeType === 'landlord_tenant' && input.subType === 'eviction') {
    return { recommended: 'nj_special_civil', reasoning: 'Eviction proceedings are heard in the Landlord/Tenant Section of the New Jersey Superior Court Special Civil Part (N.J.S.A. 2A:18-61.1).', confidence: 'high' }
  }

  if (circumstances.realProperty) {
    return { recommended: 'nj_civil', reasoning: 'Disputes involving title to real property are heard in New Jersey Superior Court Law Division (Civil Part).', confidence: 'high' }
  }

  if (circumstances.outOfState && (amount === 'over_20k' || amount === 'over_200k' || amount === '75k_200k' || amount === 'over_25k')) {
    return { recommended: 'federal', reasoning: 'Out-of-state parties with an amount in controversy exceeding $75,000 may qualify for federal diversity jurisdiction.', alternativeNote: 'You may also file in New Jersey Superior Court if you prefer state court.', confidence: 'moderate' }
  }

  if (amount === 'under_5k') {
    return { recommended: 'nj_small_claims', reasoning: 'Claims up to $5,000 can be filed in the Small Claims Section of New Jersey Superior Court Special Civil Part (N.J. Ct. R. 6:1-2).', confidence: 'high' }
  }

  if (amount === '5k_20k') {
    return { recommended: 'nj_special_civil', reasoning: 'Claims between $5,000 and $20,000 fall within the Special Civil Part of New Jersey Superior Court (N.J. Ct. R. 6:1-2).', confidence: 'high' }
  }

  if (amount === 'over_20k' || amount === 'over_200k' || amount === '75k_200k' || amount === 'over_25k') {
    return { recommended: 'nj_civil', reasoning: 'Claims exceeding $20,000 are heard in the Law Division (Civil Part) of New Jersey Superior Court, which has unlimited civil jurisdiction.', confidence: 'high' }
  }

  return { recommended: 'nj_civil', reasoning: 'Non-monetary disputes are generally heard in the Law Division of New Jersey Superior Court, which has broad general jurisdiction.', confidence: 'high' }
}

// -- Virginia Rules -----------------------------------------------------------

function recommendVirginiaCourt(input: CourtRecommendationInput): CourtRecommendation {
  const { disputeType, amount, circumstances } = input

  if (circumstances.federalLaw) {
    return { recommended: 'federal', reasoning: 'This dispute involves a federal law claim, which falls under exclusive federal jurisdiction.', confidence: 'high' }
  }

  if (disputeType === 'family') {
    return { recommended: 'va_circuit', reasoning: 'Divorce cases are filed in Virginia Circuit Court. Custody, support, and domestic violence matters may be heard in Juvenile & Domestic Relations District Court (J&DR).', alternativeNote: 'For custody or child support only, you may file in J&DR District Court instead.', confidence: 'high' }
  }

  if (disputeType === 'landlord_tenant' && input.subType === 'eviction') {
    return { recommended: 'va_general_district', reasoning: 'Unlawful detainer (eviction) cases are filed in Virginia General District Court in the county/city where the property is located (Va. Code § 16.1-77(2)).', confidence: 'high' }
  }

  if (circumstances.realProperty) {
    return { recommended: 'va_circuit', reasoning: 'Disputes involving title to real property are heard in Virginia Circuit Court.', confidence: 'high' }
  }

  if (circumstances.outOfState && (amount === 'over_25k' || amount === 'over_200k' || amount === '75k_200k' || amount === '5k_25k')) {
    return { recommended: 'federal', reasoning: 'Out-of-state parties with an amount in controversy exceeding $75,000 may qualify for federal diversity jurisdiction.', alternativeNote: 'You may also file in Virginia Circuit Court if you prefer state court.', confidence: 'moderate' }
  }

  if (amount === 'under_5k') {
    return { recommended: 'va_small_claims', reasoning: 'Claims up to $5,000 can be filed in the Small Claims Division of Virginia General District Court (Va. Code § 16.1-122.2). Attorneys are not permitted in small claims.', confidence: 'high' }
  }

  if (amount === '5k_25k') {
    return { recommended: 'va_general_district', reasoning: 'Claims between $5,000 and $25,000 fall within Virginia General District Court jurisdiction (Va. Code § 16.1-77). Note: the limit increases to $50,000 effective July 1, 2025.', confidence: 'high' }
  }

  if (amount === 'over_25k' || amount === 'over_200k' || amount === '75k_200k') {
    return { recommended: 'va_circuit', reasoning: 'Claims exceeding $25,000 are heard in Virginia Circuit Court, which has unlimited civil jurisdiction (Va. Code § 17.1-513).', confidence: 'high' }
  }

  return { recommended: 'va_circuit', reasoning: 'Non-monetary disputes are generally heard in Virginia Circuit Court, which has broad general jurisdiction.', confidence: 'high' }
}

// -- Washington Rules ---------------------------------------------------------

function recommendWashingtonCourt(input: CourtRecommendationInput): CourtRecommendation {
  const { disputeType, amount, circumstances } = input

  if (circumstances.federalLaw) {
    return { recommended: 'federal', reasoning: 'This dispute involves a federal law claim, which falls under exclusive federal jurisdiction.', confidence: 'high' }
  }

  if (disputeType === 'family') {
    return { recommended: 'wa_superior', reasoning: 'Family law matters (dissolution, custody, legal separation) have exclusive jurisdiction in Washington Superior Court (RCW Title 26).', confidence: 'high' }
  }

  if (disputeType === 'landlord_tenant' && input.subType === 'eviction') {
    return { recommended: 'wa_superior', reasoning: 'Unlawful detainer (eviction) proceedings are primarily filed in Washington Superior Court (RCW 59.12). District Court may hear cases when the monetary claim is within its $100,000 limit.', confidence: 'high' }
  }

  if (circumstances.realProperty) {
    return { recommended: 'wa_superior', reasoning: 'Disputes involving title to real property are heard in Washington Superior Court.', confidence: 'high' }
  }

  if (circumstances.outOfState && (amount === 'over_100k' || amount === 'over_200k' || amount === '75k_200k')) {
    return { recommended: 'federal', reasoning: 'Out-of-state parties with an amount in controversy exceeding $75,000 may qualify for federal diversity jurisdiction.', alternativeNote: 'You may also file in Washington Superior Court if you prefer state court.', confidence: 'moderate' }
  }

  if (amount === 'under_10k') {
    return { recommended: 'wa_small_claims', reasoning: 'Claims up to $10,000 for individuals can be filed in Washington Small Claims Court within District Court (RCW 12.40.010). Attorneys generally not permitted without judge consent.', confidence: 'high' }
  }

  if (amount === '10k_100k') {
    return { recommended: 'wa_district', reasoning: 'Claims between $10,000 and $100,000 fall within Washington District Court jurisdiction (RCW 3.66.020).', confidence: 'high' }
  }

  if (amount === 'over_100k' || amount === 'over_200k' || amount === '75k_200k') {
    return { recommended: 'wa_superior', reasoning: 'Claims exceeding $100,000 are heard in Washington Superior Court, which has unlimited civil jurisdiction.', confidence: 'high' }
  }

  return { recommended: 'wa_superior', reasoning: 'Non-monetary disputes are generally heard in Washington Superior Court, which has broad general jurisdiction.', confidence: 'high' }
}

// -- Arizona Rules ------------------------------------------------------------

function recommendArizonaCourt(input: CourtRecommendationInput): CourtRecommendation {
  const { disputeType, amount, circumstances } = input

  if (circumstances.federalLaw) {
    return { recommended: 'federal', reasoning: 'This dispute involves a federal law claim, which falls under exclusive federal jurisdiction.', confidence: 'high' }
  }

  if (disputeType === 'family') {
    return { recommended: 'az_superior', reasoning: 'Family law matters (dissolution, legal decision-making, parenting time) have exclusive jurisdiction in the Family Court Division of Arizona Superior Court (A.R.S. § 25-101).', confidence: 'high' }
  }

  if (disputeType === 'landlord_tenant' && input.subType === 'eviction') {
    return { recommended: 'az_justice', reasoning: 'Eviction (forcible entry and detainer) cases are filed in Arizona Justice Court in the precinct where the property is located (A.R.S. § 12-1171). Justice Court has jurisdiction regardless of amount.', confidence: 'high' }
  }

  if (circumstances.realProperty) {
    return { recommended: 'az_superior', reasoning: 'Disputes involving title to real property are heard in Arizona Superior Court.', confidence: 'high' }
  }

  if (circumstances.outOfState && (amount === 'over_10k' || amount === 'over_200k' || amount === '75k_200k' || amount === 'over_25k')) {
    return { recommended: 'federal', reasoning: 'Out-of-state parties with an amount in controversy exceeding $75,000 may qualify for federal diversity jurisdiction.', alternativeNote: 'You may also file in Arizona Superior Court if you prefer state court.', confidence: 'moderate' }
  }

  if (amount === 'under_5k') {
    return { recommended: 'az_small_claims', reasoning: 'Claims up to $5,000 can be filed in the Small Claims Division of Arizona Justice Court (A.R.S. § 22-503). No appeals, no attorneys without all parties\' consent.', confidence: 'high' }
  }

  if (amount === '5k_10k') {
    return { recommended: 'az_justice', reasoning: 'Claims between $5,000 and $10,000 fall within Arizona Justice Court regular civil jurisdiction (A.R.S. § 22-201).', confidence: 'high' }
  }

  if (amount === 'over_10k' || amount === 'over_200k' || amount === '75k_200k' || amount === 'over_25k') {
    return { recommended: 'az_superior', reasoning: 'Claims exceeding $10,000 are heard in Arizona Superior Court, which has unlimited civil jurisdiction.', confidence: 'high' }
  }

  return { recommended: 'az_superior', reasoning: 'Non-monetary disputes are generally heard in Arizona Superior Court, which has broad general jurisdiction.', confidence: 'high' }
}

// -- Colorado Rules -----------------------------------------------------------

function recommendColoradoCourt(input: CourtRecommendationInput): CourtRecommendation {
  const { disputeType, amount, circumstances } = input

  if (circumstances.federalLaw) {
    return { recommended: 'federal', reasoning: 'This dispute involves a federal law claim, which falls under exclusive federal jurisdiction.', confidence: 'high' }
  }

  if (disputeType === 'family') {
    return { recommended: 'co_district', reasoning: 'Family law matters (dissolution, legal separation, allocation of parental responsibilities) have exclusive jurisdiction in the Domestic Relations Division of Colorado District Court (C.R.S. § 14-10-106).', confidence: 'high' }
  }

  if (disputeType === 'landlord_tenant' && input.subType === 'eviction') {
    return { recommended: 'co_county', reasoning: 'Forcible entry and detainer (eviction) cases are filed in Colorado County Court in the county where the property is located (C.R.S. § 13-40-104).', confidence: 'high' }
  }

  if (circumstances.realProperty) {
    return { recommended: 'co_district', reasoning: 'Disputes involving title to real property are heard in Colorado District Court.', confidence: 'high' }
  }

  if (circumstances.outOfState && (amount === 'over_15k' || amount === 'over_200k' || amount === '75k_200k' || amount === 'over_25k')) {
    return { recommended: 'federal', reasoning: 'Out-of-state parties with an amount in controversy exceeding $75,000 may qualify for federal diversity jurisdiction.', alternativeNote: 'You may also file in Colorado District Court if you prefer state court.', confidence: 'moderate' }
  }

  if (amount === 'under_7500') {
    return { recommended: 'co_small_claims', reasoning: 'Claims up to $7,500 can be filed in the Small Claims Division of Colorado County Court (C.R.S. § 13-6-403). No attorneys permitted without court permission.', confidence: 'high' }
  }

  if (amount === '7500_15k') {
    return { recommended: 'co_county', reasoning: 'Claims between $7,500 and $15,000 fall within Colorado County Court jurisdiction (C.R.S. § 13-6-104).', confidence: 'high' }
  }

  if (amount === 'over_15k' || amount === 'over_200k' || amount === '75k_200k' || amount === 'over_25k') {
    return { recommended: 'co_district', reasoning: 'Claims exceeding $15,000 are heard in Colorado District Court, which has unlimited civil jurisdiction (C.R.S. § 13-4-102).', confidence: 'high' }
  }

  return { recommended: 'co_district', reasoning: 'Non-monetary disputes are generally heard in Colorado District Court, which has broad general jurisdiction.', confidence: 'high' }
}

// -- Tennessee Rules ----------------------------------------------------------

function recommendTennesseeCourt(input: CourtRecommendationInput): CourtRecommendation {
  const { disputeType, amount, circumstances } = input

  if (circumstances.federalLaw) {
    return { recommended: 'federal', reasoning: 'This dispute involves a federal law claim, which falls under exclusive federal jurisdiction.', confidence: 'high' }
  }

  if (disputeType === 'family') {
    return { recommended: 'tn_circuit', reasoning: 'Divorce and family law matters are filed in Tennessee Circuit Court (or Chancery Court). Child custody matters can also be heard in General Sessions Court with concurrent jurisdiction.', confidence: 'high' }
  }

  if (disputeType === 'landlord_tenant' && input.subType === 'eviction') {
    return { recommended: 'tn_general_sessions', reasoning: 'Unlawful detainer (eviction) proceedings are filed in Tennessee General Sessions Court in the county where the property is located (TCA § 29-18-107).', confidence: 'high' }
  }

  if (circumstances.realProperty) {
    return { recommended: 'tn_circuit', reasoning: 'Disputes involving title to real property are heard in Tennessee Circuit Court or Chancery Court.', confidence: 'high' }
  }

  if (circumstances.outOfState && (amount === 'over_25k' || amount === 'over_200k' || amount === '75k_200k')) {
    return { recommended: 'federal', reasoning: 'Out-of-state parties with an amount in controversy exceeding $75,000 may qualify for federal diversity jurisdiction.', alternativeNote: 'You may also file in Tennessee Circuit Court if you prefer state court.', confidence: 'moderate' }
  }

  if (amount === 'under_10k' || amount === 'under_20k') {
    return { recommended: 'tn_general_sessions', reasoning: 'Claims up to $25,000 can be filed in Tennessee General Sessions Court (TCA § 16-15-501). No formal discovery; cases are heard quickly.', confidence: 'high' }
  }

  if (amount === '10k_25k') {
    return { recommended: 'tn_general_sessions', reasoning: 'Tennessee General Sessions Court has jurisdiction up to $25,000 in most counties (TCA § 16-15-501). This amount falls within that limit.', confidence: 'high' }
  }

  if (amount === 'over_25k' || amount === 'over_200k' || amount === '75k_200k' || amount === '20k_75k') {
    return { recommended: 'tn_circuit', reasoning: 'Claims exceeding $25,000 are heard in Tennessee Circuit Court, which has unlimited civil jurisdiction.', confidence: 'high' }
  }

  return { recommended: 'tn_general_sessions', reasoning: 'Tennessee General Sessions Court handles most civil disputes and is accessible without formal discovery or pleading requirements.', confidence: 'moderate' }
}

// -- Indiana Rules ------------------------------------------------------------

function recommendIndianaCourt(input: CourtRecommendationInput): CourtRecommendation {
  const { disputeType, amount, circumstances } = input

  if (circumstances.federalLaw) {
    return { recommended: 'federal', reasoning: 'This dispute involves a federal law claim, which falls under exclusive federal jurisdiction.', confidence: 'high' }
  }

  if (disputeType === 'family') {
    return { recommended: 'in_circuit', reasoning: 'Family law matters (dissolution, custody, support) are heard in Indiana Circuit or Superior Court (IC § 31-15-2-4).', confidence: 'high' }
  }

  if (disputeType === 'landlord_tenant' && input.subType === 'eviction') {
    return { recommended: 'in_circuit', reasoning: 'Eviction (forcible entry and detainer) cases are filed in Indiana Circuit or Superior Court in the county where the property is located (IC § 32-30-3-4).', confidence: 'high' }
  }

  if (circumstances.realProperty) {
    return { recommended: 'in_circuit', reasoning: 'Disputes involving title to real property are heard in Indiana Circuit or Superior Court.', confidence: 'high' }
  }

  if (circumstances.outOfState && (amount === 'over_10k' || amount === 'over_25k' || amount === 'over_200k' || amount === '75k_200k')) {
    return { recommended: 'federal', reasoning: 'Out-of-state parties with an amount in controversy exceeding $75,000 may qualify for federal diversity jurisdiction.', alternativeNote: 'You may also file in Indiana Circuit/Superior Court if you prefer state court.', confidence: 'moderate' }
  }

  if (amount === 'under_10k' || amount === 'under_7500' || amount === 'under_7k' || amount === 'under_8k' || amount === 'under_5k' || amount === 'under_6k') {
    return { recommended: 'in_small_claims', reasoning: 'Claims up to $10,000 can be filed on the Small Claims Docket of Indiana Circuit or Superior Court (IC § 33-28-3-4). Informal proceedings; no formal discovery.', confidence: 'high' }
  }

  if (amount === 'over_10k' || amount === 'over_25k' || amount === 'over_200k' || amount === '75k_200k' || amount === '10k_25k' || amount === '20k_75k') {
    return { recommended: 'in_circuit', reasoning: 'Claims exceeding $10,000 are heard in the general civil division of Indiana Circuit or Superior Court, which has unlimited civil jurisdiction.', confidence: 'high' }
  }

  return { recommended: 'in_circuit', reasoning: 'Non-monetary disputes are generally heard in Indiana Circuit or Superior Court, which has broad general jurisdiction.', confidence: 'high' }
}

// -- Missouri Rules -----------------------------------------------------------

function recommendMissouriCourt(input: CourtRecommendationInput): CourtRecommendation {
  const { disputeType, amount, circumstances } = input

  if (circumstances.federalLaw) {
    return { recommended: 'federal', reasoning: 'This dispute involves a federal law claim, which falls under exclusive federal jurisdiction.', confidence: 'high' }
  }

  if (disputeType === 'family') {
    return { recommended: 'mo_circuit', reasoning: 'Family law matters (dissolution, custody, support) have exclusive jurisdiction in Missouri Circuit Court (RSMo § 452.300).', confidence: 'high' }
  }

  if (disputeType === 'landlord_tenant' && input.subType === 'eviction') {
    return { recommended: 'mo_associate_circuit', reasoning: 'Unlawful detainer (eviction) cases are filed in the Associate Circuit Court in the county where the property is located (RSMo § 535.020).', confidence: 'high' }
  }

  if (circumstances.realProperty) {
    return { recommended: 'mo_circuit', reasoning: 'Disputes involving title to real property are heard in Missouri Circuit Court.', confidence: 'high' }
  }

  if (circumstances.outOfState && (amount === 'over_25k' || amount === 'over_200k' || amount === '75k_200k')) {
    return { recommended: 'federal', reasoning: 'Out-of-state parties with an amount in controversy exceeding $75,000 may qualify for federal diversity jurisdiction.', alternativeNote: 'You may also file in Missouri Circuit Court if you prefer state court.', confidence: 'moderate' }
  }

  if (amount === 'under_5k') {
    return { recommended: 'mo_small_claims', reasoning: 'Claims up to $5,000 can be filed in the Small Claims Division of Missouri Associate Circuit Court (RSMo § 482.300). Note: a party may file no more than 12 small claims per year.', confidence: 'high' }
  }

  if (amount === '5k_20k' || amount === '5k_25k' || amount === '10k_25k') {
    return { recommended: 'mo_associate_circuit', reasoning: 'Claims between $5,000 and $25,000 are handled in the civil division of Missouri Associate Circuit Court (RSMo § 478.225).', confidence: 'high' }
  }

  if (amount === 'over_25k' || amount === 'over_200k' || amount === '75k_200k' || amount === '20k_75k') {
    return { recommended: 'mo_circuit', reasoning: 'Claims exceeding $25,000 are heard in Missouri Circuit Court, which has unlimited civil jurisdiction.', confidence: 'high' }
  }

  return { recommended: 'mo_circuit', reasoning: 'Non-monetary disputes are generally heard in Missouri Circuit Court, which has broad general jurisdiction.', confidence: 'high' }
}

// -- Maryland Rules -----------------------------------------------------------

function recommendMarylandCourt(input: CourtRecommendationInput): CourtRecommendation {
  const { disputeType, amount, circumstances } = input

  if (circumstances.federalLaw) {
    return { recommended: 'federal', reasoning: 'This dispute involves a federal law claim, which falls under exclusive federal jurisdiction.', confidence: 'high' }
  }

  if (disputeType === 'family') {
    return { recommended: 'md_circuit', reasoning: 'Family law matters (divorce, custody, support) have exclusive jurisdiction in Maryland Circuit Court (Md. Code, FL § 1-201).', confidence: 'high' }
  }

  if (disputeType === 'landlord_tenant' && input.subType === 'eviction') {
    return { recommended: 'md_district', reasoning: 'Eviction (summary ejectment) proceedings are filed in the Maryland District Court for the county where the property is located (Md. Code, RP § 8-402).', confidence: 'high' }
  }

  if (circumstances.realProperty) {
    return { recommended: 'md_circuit', reasoning: 'Disputes involving title to real property are heard in Maryland Circuit Court.', confidence: 'high' }
  }

  if (circumstances.outOfState && (amount === 'over_25k' || amount === 'over_200k' || amount === '75k_200k')) {
    return { recommended: 'federal', reasoning: 'Out-of-state parties with an amount in controversy exceeding $75,000 may qualify for federal diversity jurisdiction.', alternativeNote: 'You may also file in Maryland Circuit Court if you prefer state court.', confidence: 'moderate' }
  }

  if (amount === 'under_5k') {
    return { recommended: 'md_district', reasoning: 'Claims up to $5,000 qualify for the Small Claims track of Maryland District Court (Md. Code, CJP § 4-405). Filing fees are lower and procedures are simplified.', confidence: 'high' }
  }

  if (amount === '5k_25k' || amount === '5k_20k' || amount === '10k_25k' || amount === 'under_10k' || amount === 'under_20k') {
    return { recommended: 'md_district', reasoning: 'Maryland District Court has concurrent civil jurisdiction up to $30,000 (Md. Code, CJP § 4-401). Filing in District Court is typically faster and less expensive than Circuit Court.', confidence: 'high' }
  }

  if (amount === 'over_25k' || amount === 'over_200k' || amount === '75k_200k' || amount === '20k_75k') {
    return { recommended: 'md_circuit', reasoning: 'Claims exceeding $30,000 are heard exclusively in Maryland Circuit Court, which has unlimited civil jurisdiction.', confidence: 'high' }
  }

  return { recommended: 'md_circuit', reasoning: 'Non-monetary disputes are generally heard in Maryland Circuit Court, which has broad general jurisdiction.', confidence: 'high' }
}

// -- Wisconsin Rules ----------------------------------------------------------

function recommendWisconsinCourt(input: CourtRecommendationInput): CourtRecommendation {
  const { disputeType, amount, circumstances } = input

  if (circumstances.federalLaw) {
    return { recommended: 'federal', reasoning: 'This dispute involves a federal law claim, which falls under exclusive federal jurisdiction.', confidence: 'high' }
  }

  if (disputeType === 'family') {
    return { recommended: 'wi_circuit', reasoning: 'Family law matters (divorce, legal separation, paternity, custody) have exclusive jurisdiction in Wisconsin Circuit Court (Wis. Stat. Ch. 767).', confidence: 'high' }
  }

  if (disputeType === 'landlord_tenant' && input.subType === 'eviction') {
    return { recommended: 'wi_small_claims', reasoning: 'Eviction (forcible entry and detainer) cases are filed as small claims actions in Wisconsin Circuit Court under Chapter 799 (Wis. Stat. § 799.01(1)(c)). No dollar limit for evictions.', confidence: 'high' }
  }

  if (circumstances.realProperty) {
    return { recommended: 'wi_circuit', reasoning: 'Disputes involving title to real property are heard in Wisconsin Circuit Court.', confidence: 'high' }
  }

  if (circumstances.outOfState && (amount === 'over_10k' || amount === 'over_25k' || amount === 'over_200k' || amount === '75k_200k')) {
    return { recommended: 'federal', reasoning: 'Out-of-state parties with an amount in controversy exceeding $75,000 may qualify for federal diversity jurisdiction.', alternativeNote: 'You may also file in Wisconsin Circuit Court if you prefer state court.', confidence: 'moderate' }
  }

  if (amount === 'under_10k' || amount === 'under_7500' || amount === 'under_7k' || amount === 'under_8k' || amount === 'under_5k' || amount === 'under_6k') {
    return { recommended: 'wi_small_claims', reasoning: 'Claims up to $10,000 (or $5,000 for personal injury/tort) can be filed under Chapter 799 Small Claims procedure in Wisconsin Circuit Court (Wis. Stat. § 799.01). Filing fees start at $22.', confidence: 'high' }
  }

  if (amount === 'over_10k' || amount === 'over_25k' || amount === 'over_200k' || amount === '75k_200k' || amount === '10k_25k' || amount === '20k_75k') {
    return { recommended: 'wi_circuit', reasoning: 'Claims exceeding $10,000 are filed on the general civil docket of Wisconsin Circuit Court, which has unlimited civil jurisdiction.', confidence: 'high' }
  }

  return { recommended: 'wi_circuit', reasoning: 'Non-monetary disputes are generally heard in Wisconsin Circuit Court, which has broad general jurisdiction.', confidence: 'high' }
}

// -- Minnesota Rules ----------------------------------------------------------

function recommendMinnesotaCourt(input: CourtRecommendationInput): CourtRecommendation {
  const { disputeType, amount, circumstances } = input

  if (circumstances.federalLaw) {
    return { recommended: 'federal', reasoning: 'This dispute involves a federal law claim, which falls under exclusive federal jurisdiction.', confidence: 'high' }
  }

  if (disputeType === 'family') {
    return { recommended: 'mn_district', reasoning: 'Family law matters (dissolution, custody, child support, domestic abuse) have exclusive jurisdiction in Minnesota District Court (Minn. Stat. § 518.002).', confidence: 'high' }
  }

  if (disputeType === 'landlord_tenant' && input.subType === 'eviction') {
    return { recommended: 'mn_district', reasoning: 'Eviction (unlawful detainer) proceedings are filed in Minnesota District Court in the county where the property is located (Minn. Stat. § 504B.285).', confidence: 'high' }
  }

  if (circumstances.realProperty) {
    return { recommended: 'mn_district', reasoning: 'Disputes involving title to real property are heard in Minnesota District Court.', confidence: 'high' }
  }

  if (circumstances.outOfState && (amount === 'over_20k' || amount === 'over_200k' || amount === '75k_200k' || amount === 'over_25k')) {
    return { recommended: 'federal', reasoning: 'Out-of-state parties with an amount in controversy exceeding $75,000 may qualify for federal diversity jurisdiction.', alternativeNote: 'You may also file in Minnesota District Court if you prefer state court.', confidence: 'moderate' }
  }

  if (amount === 'under_20k' || amount === 'under_10k' || amount === 'under_12500' || amount === 'under_7500' || amount === 'under_5k' || amount === '10k_25k') {
    return { recommended: 'mn_conciliation', reasoning: 'Claims up to $20,000 can be filed in Minnesota Conciliation Court (small claims), which is one of the highest limits in the nation (Minn. Stat. § 491A.01). Filing fee is $65.', confidence: 'high' }
  }

  if (amount === 'over_20k' || amount === 'over_200k' || amount === '75k_200k' || amount === 'over_25k' || amount === '20k_75k') {
    return { recommended: 'mn_district', reasoning: 'Claims exceeding $20,000 are heard in Minnesota District Court, which has unlimited civil jurisdiction.', confidence: 'high' }
  }

  return { recommended: 'mn_district', reasoning: 'Non-monetary disputes are generally heard in Minnesota District Court, which has broad general jurisdiction.', confidence: 'high' }
}

// -- South Carolina Rules -----------------------------------------------------

function recommendSouthCarolinaCourt(input: CourtRecommendationInput): CourtRecommendation {
  const { disputeType, amount, circumstances } = input

  if (circumstances.federalLaw) {
    return { recommended: 'federal', reasoning: 'This dispute involves a federal law claim, which falls under exclusive federal jurisdiction.', confidence: 'high' }
  }

  if (disputeType === 'family') {
    return { recommended: 'sc_circuit', reasoning: 'Family court matters (divorce, custody, support, domestic violence) have exclusive jurisdiction in South Carolina Family Court, which is a division of Circuit Court (SC Code § 63-3-510).', confidence: 'high' }
  }

  if (disputeType === 'landlord_tenant' && input.subType === 'eviction') {
    return { recommended: 'sc_magistrate', reasoning: 'Ejectment (eviction) proceedings are filed in South Carolina Magistrate Court in the county where the property is located (SC Code § 27-37-10).', confidence: 'high' }
  }

  if (circumstances.realProperty) {
    return { recommended: 'sc_circuit', reasoning: 'Disputes involving title to real property are heard in South Carolina Circuit Court.', confidence: 'high' }
  }

  if (circumstances.outOfState && (amount === 'over_7500' || amount === 'over_15k' || amount === 'over_25k' || amount === 'over_200k' || amount === '75k_200k')) {
    return { recommended: 'federal', reasoning: 'Out-of-state parties with an amount in controversy exceeding $75,000 may qualify for federal diversity jurisdiction.', alternativeNote: 'You may also file in South Carolina Circuit Court if you prefer state court.', confidence: 'moderate' }
  }

  if (amount === 'under_7500' || amount === 'under_5k' || amount === 'under_6k' || amount === 'under_7k') {
    return { recommended: 'sc_magistrate', reasoning: 'Claims up to $7,500 can be filed in South Carolina Magistrate Court (SC Code § 22-3-10). Jury trials are available upon request — a unique feature of SC small claims.', confidence: 'high' }
  }

  if (amount === '7500_15k' || amount === 'over_7500' || amount === 'over_15k' || amount === 'over_25k' || amount === 'over_200k' || amount === '75k_200k' || amount === '10k_25k' || amount === '20k_75k') {
    return { recommended: 'sc_circuit', reasoning: 'Claims exceeding $7,500 are heard in South Carolina Circuit Court — Court of Common Pleas, which has unlimited civil jurisdiction.', confidence: 'high' }
  }

  return { recommended: 'sc_circuit', reasoning: 'Non-monetary disputes are generally heard in South Carolina Circuit Court, which has broad general jurisdiction.', confidence: 'high' }
}

// -- Alabama Rules ------------------------------------------------------------

function recommendAlabamaCourt(input: CourtRecommendationInput): CourtRecommendation {
  const { disputeType, amount, circumstances } = input

  if (circumstances.federalLaw) {
    return { recommended: 'federal', reasoning: 'This dispute involves a federal law claim, which falls under exclusive federal jurisdiction.', confidence: 'high' }
  }

  if (disputeType === 'family') {
    return { recommended: 'al_circuit', reasoning: 'Family law matters (divorce, custody, support, domestic violence) have exclusive jurisdiction in Alabama Circuit Court (Ala. Code § 12-11-10).', confidence: 'high' }
  }

  if (disputeType === 'landlord_tenant' && input.subType === 'eviction') {
    return { recommended: 'al_district', reasoning: 'Eviction (unlawful detainer) proceedings are filed in Alabama District Court in the county where the property is located (Ala. Code § 35-9A-461).', confidence: 'high' }
  }

  if (circumstances.realProperty) {
    return { recommended: 'al_circuit', reasoning: 'Disputes involving title to real property are heard in Alabama Circuit Court.', confidence: 'high' }
  }

  if (circumstances.outOfState && (amount === 'over_20k' || amount === 'over_200k' || amount === '75k_200k' || amount === 'over_25k')) {
    return { recommended: 'federal', reasoning: 'Out-of-state parties with an amount in controversy exceeding $75,000 may qualify for federal diversity jurisdiction.', alternativeNote: 'You may also file in Alabama Circuit Court if you prefer state court.', confidence: 'moderate' }
  }

  if (amount === 'under_6k') {
    return { recommended: 'al_small_claims', reasoning: 'Claims up to $6,000 can be filed on the Small Claims Docket of Alabama District Court (Ala. Code § 12-12-31). Simplified procedures; no jury trial.', confidence: 'high' }
  }

  if (amount === '6k_15k' || amount === '6k_20k' || amount === '10k_25k') {
    return { recommended: 'al_district', reasoning: 'Claims between $6,000 and $20,000 fall within Alabama District Court general civil jurisdiction (Ala. Code § 12-12-30).', confidence: 'high' }
  }

  if (amount === 'over_20k' || amount === 'over_200k' || amount === '75k_200k' || amount === 'over_25k' || amount === '20k_75k') {
    return { recommended: 'al_circuit', reasoning: 'Claims exceeding $20,000 are heard in Alabama Circuit Court, which has unlimited civil jurisdiction (Ala. Code § 12-11-30).', confidence: 'high' }
  }

  return { recommended: 'al_circuit', reasoning: 'Non-monetary disputes are generally heard in Alabama Circuit Court, which has broad general jurisdiction.', confidence: 'high' }
}

// -- Louisiana Rules ----------------------------------------------------------

function recommendLouisianaCourt(input: CourtRecommendationInput): CourtRecommendation {
  const { disputeType, amount, circumstances } = input

  if (circumstances.federalLaw) {
    return { recommended: 'federal', reasoning: 'This dispute involves a federal law claim, which falls under exclusive federal jurisdiction.', confidence: 'high' }
  }

  if (disputeType === 'family') {
    return { recommended: 'la_district', reasoning: 'Family law matters (divorce, custody, support, community property) have exclusive jurisdiction in Louisiana District Court (La. R.S. 13:1401 et seq.).', confidence: 'high' }
  }

  if (disputeType === 'landlord_tenant' && input.subType === 'eviction') {
    return { recommended: 'la_district', reasoning: 'Eviction (rule to vacate) proceedings are filed in the City Court or District Court for the parish where the property is located (La. Code Civ. Proc. art. 4702).', confidence: 'high' }
  }

  if (circumstances.realProperty) {
    return { recommended: 'la_district', reasoning: 'Disputes involving title to real property are heard in Louisiana District Court.', confidence: 'high' }
  }

  if (circumstances.outOfState && (amount === 'over_5k' || amount === 'over_20k' || amount === 'over_200k' || amount === '75k_200k' || amount === 'over_25k')) {
    return { recommended: 'federal', reasoning: 'Out-of-state parties with an amount in controversy exceeding $75,000 may qualify for federal diversity jurisdiction.', alternativeNote: 'You may also file in Louisiana District Court if you prefer state court.', confidence: 'moderate' }
  }

  if (amount === 'under_5k') {
    return { recommended: 'la_small_claims', reasoning: 'Claims up to $5,000 can be filed in the Small Claims Division of Louisiana City Court (La. R.S. 13:5200). Note: judgments in the Small Claims Division are final and non-appealable — a unique feature of Louisiana law.', confidence: 'high' }
  }

  return { recommended: 'la_district', reasoning: 'Louisiana District Court handles civil claims of all amounts. City Court also handles civil claims up to $50,000 concurrently.', confidence: 'high' }
}

// -- Kentucky Rules -----------------------------------------------------------

function recommendKentuckyCourt(input: CourtRecommendationInput): CourtRecommendation {
  const { disputeType, amount, circumstances } = input

  if (circumstances.federalLaw) {
    return { recommended: 'federal', reasoning: 'This dispute involves a federal law claim, which falls under exclusive federal jurisdiction.', confidence: 'high' }
  }

  if (disputeType === 'family') {
    return { recommended: 'ky_circuit', reasoning: 'Family law matters (dissolution, custody, support) have exclusive jurisdiction in Kentucky Circuit Court — Family Court Division (KRS § 23A.100).', confidence: 'high' }
  }

  if (disputeType === 'landlord_tenant' && input.subType === 'eviction') {
    return { recommended: 'ky_district', reasoning: 'Eviction (forcible entry and detainer) proceedings are filed in Kentucky District Court in the county where the property is located (KRS § 383.210).', confidence: 'high' }
  }

  if (circumstances.realProperty) {
    return { recommended: 'ky_circuit', reasoning: 'Disputes involving title to real property are heard in Kentucky Circuit Court.', confidence: 'high' }
  }

  if (circumstances.outOfState && (amount === 'over_5k' || amount === 'over_25k' || amount === 'over_200k' || amount === '75k_200k')) {
    return { recommended: 'federal', reasoning: 'Out-of-state parties with an amount in controversy exceeding $75,000 may qualify for federal diversity jurisdiction.', alternativeNote: 'You may also file in Kentucky Circuit Court if you prefer state court.', confidence: 'moderate' }
  }

  if (amount === 'under_2500') {
    return { recommended: 'ky_small_claims', reasoning: 'Claims up to $2,500 can be filed in the Small Claims Division of Kentucky District Court (KRS § 24A.230). No discovery; informal procedures. Note: Kentucky has one of the lowest small claims limits nationally.', confidence: 'high' }
  }

  if (amount === '2500_5k' || amount === 'under_5k' || amount === 'under_6k' || amount === 'under_7k' || amount === 'under_7500') {
    return { recommended: 'ky_district', reasoning: 'Claims between $2,500 and $5,000 fall within the regular civil docket of Kentucky District Court (KRS § 24A.120).', confidence: 'high' }
  }

  if (amount === 'over_5k' || amount === 'over_25k' || amount === 'over_200k' || amount === '75k_200k' || amount === '5k_25k' || amount === '10k_25k' || amount === '20k_75k') {
    return { recommended: 'ky_circuit', reasoning: 'Claims exceeding $5,000 are heard in Kentucky Circuit Court, which has unlimited civil jurisdiction (KRS § 23A.010).', confidence: 'high' }
  }

  return { recommended: 'ky_circuit', reasoning: 'Non-monetary disputes are generally heard in Kentucky Circuit Court, which has broad general jurisdiction.', confidence: 'high' }
}

// -- Oregon Rules -------------------------------------------------------------

function recommendOregonCourt(input: CourtRecommendationInput): CourtRecommendation {
  const { disputeType, amount, circumstances } = input

  if (circumstances.federalLaw) {
    return { recommended: 'federal', reasoning: 'This dispute involves a federal law claim, which falls under exclusive federal jurisdiction.', confidence: 'high' }
  }

  if (disputeType === 'family') {
    return { recommended: 'or_circuit', reasoning: 'Family law matters (dissolution, custody, support) have exclusive jurisdiction in Oregon Circuit Court (ORS Chapter 107).', confidence: 'high' }
  }

  if (disputeType === 'landlord_tenant' && input.subType === 'eviction') {
    return { recommended: 'or_circuit', reasoning: 'Eviction (FED) proceedings are filed in Oregon Circuit Court in the county where the property is located (ORS 105.120).', confidence: 'high' }
  }

  if (circumstances.realProperty) {
    return { recommended: 'or_circuit', reasoning: 'Disputes involving title to real property are heard in Oregon Circuit Court.', confidence: 'high' }
  }

  if (circumstances.outOfState && (amount === 'over_10k' || amount === 'over_20k' || amount === 'over_25k' || amount === 'over_200k' || amount === '75k_200k')) {
    return { recommended: 'federal', reasoning: 'Out-of-state parties with an amount in controversy exceeding $75,000 may qualify for federal diversity jurisdiction.', alternativeNote: 'You may also file in Oregon Circuit Court if you prefer state court.', confidence: 'moderate' }
  }

  if (amount === 'under_10k' || amount === 'under_8k' || amount === 'under_7k' || amount === 'under_7500' || amount === 'under_6k' || amount === 'under_5k' || amount === 'under_2500' || amount === 'under_3500') {
    return { recommended: 'or_small_claims', reasoning: 'Claims up to $10,000 can be filed in the Small Claims Department of Oregon Circuit Court (ORS 46.405). Note: no appeals allowed — the judgment is final. Attorneys are not permitted at the hearing.', confidence: 'high' }
  }

  return { recommended: 'or_circuit', reasoning: 'Claims exceeding $10,000 are heard in Oregon Circuit Court, which has unlimited civil jurisdiction (ORS 3.136).', confidence: 'high' }
}

// -- Nevada Rules -------------------------------------------------------------

function recommendNevadaCourt(input: CourtRecommendationInput): CourtRecommendation {
  const { disputeType, amount, circumstances } = input

  if (circumstances.federalLaw) {
    return { recommended: 'federal', reasoning: 'This dispute involves a federal law claim, which falls under exclusive federal jurisdiction.', confidence: 'high' }
  }

  if (disputeType === 'family') {
    return { recommended: 'nv_district', reasoning: 'Family law matters (divorce, custody, support) have exclusive jurisdiction in Nevada District Court — Family Division (NRS Chapter 125).', confidence: 'high' }
  }

  if (disputeType === 'landlord_tenant' && input.subType === 'eviction') {
    return { recommended: 'nv_district', reasoning: 'Eviction (summary eviction) proceedings are filed in Nevada Justice Court in the township where the property is located (NRS 40.253).', confidence: 'high' }
  }

  if (circumstances.realProperty) {
    return { recommended: 'nv_district', reasoning: 'Disputes involving title to real property are heard in Nevada District Court.', confidence: 'high' }
  }

  if (circumstances.outOfState && (amount === 'over_10k' || amount === 'over_20k' || amount === 'over_25k' || amount === 'over_200k' || amount === '75k_200k')) {
    return { recommended: 'federal', reasoning: 'Out-of-state parties with an amount in controversy exceeding $75,000 may qualify for federal diversity jurisdiction.', alternativeNote: 'You may also file in Nevada District Court if you prefer state court.', confidence: 'moderate' }
  }

  if (amount === 'under_10k' || amount === 'under_8k' || amount === 'under_7k' || amount === 'under_7500' || amount === 'under_6k' || amount === 'under_5k' || amount === 'under_2500' || amount === 'under_3500') {
    return { recommended: 'nv_small_claims', reasoning: 'Claims up to $10,000 can be filed in Nevada Small Claims Court (a division of Justice Court) (NRS 73.010). Mandatory mediation may be required in some counties before the hearing.', confidence: 'high' }
  }

  return { recommended: 'nv_district', reasoning: 'Claims exceeding $10,000 are heard in Nevada District Court, which has unlimited civil jurisdiction.', confidence: 'high' }
}

// -- Connecticut Rules --------------------------------------------------------

function recommendConnecticutCourt(input: CourtRecommendationInput): CourtRecommendation {
  const { disputeType, amount, circumstances } = input

  if (circumstances.federalLaw) {
    return { recommended: 'federal', reasoning: 'This dispute involves a federal law claim, which falls under exclusive federal jurisdiction.', confidence: 'high' }
  }

  if (disputeType === 'family') {
    return { recommended: 'ct_superior', reasoning: 'Family law matters (divorce, custody, support) are heard in the Family Division of Connecticut Superior Court (CGS § 46b-1).', confidence: 'high' }
  }

  if (disputeType === 'landlord_tenant' && input.subType === 'eviction') {
    return { recommended: 'ct_superior', reasoning: 'Summary process (eviction) proceedings are filed in Connecticut Superior Court Housing Session in the judicial district where the property is located (CGS § 47a-26).', confidence: 'high' }
  }

  if (circumstances.realProperty) {
    return { recommended: 'ct_superior', reasoning: 'Disputes involving title to real property are heard in Connecticut Superior Court.', confidence: 'high' }
  }

  if (circumstances.outOfState && (amount === 'over_5k' || amount === 'over_10k' || amount === 'over_20k' || amount === 'over_25k' || amount === 'over_200k' || amount === '75k_200k')) {
    return { recommended: 'federal', reasoning: 'Out-of-state parties with an amount in controversy exceeding $75,000 may qualify for federal diversity jurisdiction.', alternativeNote: 'You may also file in Connecticut Superior Court if you prefer state court.', confidence: 'moderate' }
  }

  if (amount === 'under_5k' || amount === 'under_2500' || amount === 'under_3500') {
    return { recommended: 'ct_small_claims', reasoning: 'Claims up to $5,000 can be filed in the Small Claims Session of Connecticut Superior Court (CGS § 51-15). Flat filing fee of $95. Note: no right of appeal from Small Claims judgments.', confidence: 'high' }
  }

  return { recommended: 'ct_superior', reasoning: 'Claims exceeding $5,000 are heard in Connecticut Superior Court, which has general civil jurisdiction. The same court handles small claims — just a different session.', confidence: 'high' }
}

// -- Massachusetts Rules ------------------------------------------------------

function recommendMassachusettsCourt(input: CourtRecommendationInput): CourtRecommendation {
  const { disputeType, amount, circumstances } = input

  if (circumstances.federalLaw) {
    return { recommended: 'federal', reasoning: 'This dispute involves a federal law claim, which falls under exclusive federal jurisdiction.', confidence: 'high' }
  }

  if (disputeType === 'family') {
    return { recommended: 'ma_district', reasoning: 'Family law matters (divorce, custody, support) are heard in Massachusetts Probate and Family Court (MGL c. 208).', confidence: 'high' }
  }

  if (disputeType === 'landlord_tenant' && input.subType === 'eviction') {
    return { recommended: 'ma_district', reasoning: 'Summary process (eviction) proceedings are filed in Massachusetts Housing Court or District Court in the city/town where the property is located (MGL c. 239).', confidence: 'high' }
  }

  if (circumstances.realProperty) {
    return { recommended: 'ma_district', reasoning: 'Disputes involving title to real property may be heard in Massachusetts Land Court (MGL c. 185) or Superior Court.', confidence: 'high' }
  }

  if (circumstances.outOfState && (amount === 'over_20k' || amount === 'over_25k' || amount === 'over_200k' || amount === '75k_200k')) {
    return { recommended: 'federal', reasoning: 'Out-of-state parties with an amount in controversy exceeding $75,000 may qualify for federal diversity jurisdiction.', alternativeNote: 'You may also file in Massachusetts Superior Court if you prefer state court.', confidence: 'moderate' }
  }

  if (amount === 'under_7k' || amount === 'under_7500' || amount === 'under_6k' || amount === 'under_5k' || amount === 'under_2500' || amount === 'under_3500') {
    return { recommended: 'ma_small_claims', reasoning: 'Claims up to $7,000 can be filed in the Small Claims Session of Massachusetts District Court (MGL c. 218, § 21). Exception: no dollar limit for motor vehicle property damage claims.', confidence: 'high' }
  }

  return { recommended: 'ma_district', reasoning: 'Claims exceeding $7,000 are heard in Massachusetts District Court (regular session) or Superior Court for larger amounts.', confidence: 'high' }
}

// -- Oklahoma Rules -----------------------------------------------------------

function recommendOklahomaCourt(input: CourtRecommendationInput): CourtRecommendation {
  const { disputeType, amount, circumstances } = input

  if (circumstances.federalLaw) {
    return { recommended: 'federal', reasoning: 'This dispute involves a federal law claim, which falls under exclusive federal jurisdiction.', confidence: 'high' }
  }

  if (disputeType === 'family') {
    return { recommended: 'ok_district', reasoning: 'Family law matters (divorce, custody, support) have exclusive jurisdiction in Oklahoma District Court — Family Division (43 O.S. § 101 et seq.).', confidence: 'high' }
  }

  if (disputeType === 'landlord_tenant' && input.subType === 'eviction') {
    return { recommended: 'ok_district', reasoning: 'Forcible entry and detainer (eviction) proceedings are filed in Oklahoma District Court in the county where the property is located (41 O.S. § 131).', confidence: 'high' }
  }

  if (circumstances.realProperty) {
    return { recommended: 'ok_district', reasoning: 'Disputes involving title to real property are heard in Oklahoma District Court.', confidence: 'high' }
  }

  if (circumstances.outOfState && (amount === 'over_10k' || amount === 'over_20k' || amount === 'over_25k' || amount === 'over_200k' || amount === '75k_200k')) {
    return { recommended: 'federal', reasoning: 'Out-of-state parties with an amount in controversy exceeding $75,000 may qualify for federal diversity jurisdiction.', alternativeNote: 'You may also file in Oklahoma District Court if you prefer state court.', confidence: 'moderate' }
  }

  if (amount === 'under_10k' || amount === 'under_8k' || amount === 'under_7k' || amount === 'under_7500' || amount === 'under_6k' || amount === 'under_5k' || amount === 'under_2500' || amount === 'under_3500') {
    return { recommended: 'ok_small_claims', reasoning: 'Claims up to $10,000 can be filed on the Small Claims Docket of Oklahoma District Court (12 O.S. § 1751). Cases must be heard within 60 days of filing. Jury trials available for claims over $1,500 if demanded 72 hours in advance.', confidence: 'high' }
  }

  return { recommended: 'ok_district', reasoning: 'Claims exceeding $10,000 are heard on the regular civil docket of Oklahoma District Court, which has unlimited civil jurisdiction.', confidence: 'high' }
}

// -- Arkansas Rules -----------------------------------------------------------

function recommendArkansasCourt(input: CourtRecommendationInput): CourtRecommendation {
  const { disputeType, amount, circumstances } = input

  if (circumstances.federalLaw) {
    return { recommended: 'federal', reasoning: 'This dispute involves a federal law claim, which falls under exclusive federal jurisdiction.', confidence: 'high' }
  }

  if (disputeType === 'family') {
    return { recommended: 'ar_circuit', reasoning: 'Family law matters (divorce, custody, support) have exclusive jurisdiction in Arkansas Circuit Court — Domestic Relations Division (Ark. Code § 9-12-301).', confidence: 'high' }
  }

  if (disputeType === 'landlord_tenant' && input.subType === 'eviction') {
    return { recommended: 'ar_circuit', reasoning: 'Unlawful detainer (eviction) proceedings are filed in Arkansas Circuit Court or District Court in the county where the property is located (Ark. Code § 18-60-304).', confidence: 'high' }
  }

  if (circumstances.realProperty) {
    return { recommended: 'ar_circuit', reasoning: 'Disputes involving title to real property are heard in Arkansas Circuit Court.', confidence: 'high' }
  }

  if (circumstances.outOfState && (amount === 'over_5k' || amount === 'over_10k' || amount === 'over_20k' || amount === 'over_25k' || amount === 'over_200k' || amount === '75k_200k')) {
    return { recommended: 'federal', reasoning: 'Out-of-state parties with an amount in controversy exceeding $75,000 may qualify for federal diversity jurisdiction.', alternativeNote: 'You may also file in Arkansas Circuit Court if you prefer state court.', confidence: 'moderate' }
  }

  if (amount === 'under_5k' || amount === 'under_2500' || amount === 'under_3500') {
    return { recommended: 'ar_small_claims', reasoning: 'Claims under $5,000 can be filed in Arkansas Small Claims Court (a division of District Court) (Ark. Code § 16-17-601). Important: no attorneys allowed — if either party retains an attorney, the case is transferred to regular District Court.', confidence: 'high' }
  }

  return { recommended: 'ar_circuit', reasoning: 'Claims of $5,000 or more are heard in Arkansas Circuit Court, which has unlimited civil jurisdiction.', confidence: 'high' }
}

// -- Mississippi Rules --------------------------------------------------------

function recommendMississippiCourt(input: CourtRecommendationInput): CourtRecommendation {
  const { disputeType, amount, circumstances } = input

  if (circumstances.federalLaw) {
    return { recommended: 'federal', reasoning: 'This dispute involves a federal law claim, which falls under exclusive federal jurisdiction.', confidence: 'high' }
  }

  if (disputeType === 'family') {
    return { recommended: 'ms_circuit', reasoning: 'Family law matters (divorce, custody, support) have exclusive jurisdiction in Mississippi Chancery Court (Miss. Code § 93-5-1). Note: file in Chancery Court, not Circuit Court, for family matters.', confidence: 'high' }
  }

  if (disputeType === 'landlord_tenant' && input.subType === 'eviction') {
    return { recommended: 'ms_justice', reasoning: 'Eviction proceedings are filed in Mississippi Justice Court in the county where the property is located (Miss. Code § 89-7-27).', confidence: 'high' }
  }

  if (circumstances.realProperty) {
    return { recommended: 'ms_circuit', reasoning: 'Disputes involving title to real property are heard in Mississippi Chancery Court or Circuit Court.', confidence: 'high' }
  }

  if (circumstances.outOfState && (amount === 'over_3500' || amount === 'over_5k' || amount === 'over_10k' || amount === 'over_20k' || amount === 'over_25k' || amount === 'over_200k' || amount === '75k_200k')) {
    return { recommended: 'federal', reasoning: 'Out-of-state parties with an amount in controversy exceeding $75,000 may qualify for federal diversity jurisdiction.', alternativeNote: 'You may also file in Mississippi Circuit Court if you prefer state court.', confidence: 'moderate' }
  }

  if (amount === 'under_3500') {
    return { recommended: 'ms_justice', reasoning: 'Claims up to $3,500 can be filed in Mississippi Justice Court — one of the lowest small claims limits in the U.S. (Miss. Code § 9-11-9). All SOLs are uniformly 3 years under the general catchall statute (§ 15-1-49).', confidence: 'high' }
  }

  if (amount === 'over_3500' || amount === 'under_5k' || amount === 'under_6k' || amount === 'under_7k' || amount === 'under_7500' || amount === 'under_10k') {
    return { recommended: 'ms_county', reasoning: 'Claims between $3,500 and $200,000 can be filed in Mississippi County Court where one exists (82 of 82 counties have a County Court judge). County Court is the appropriate intermediate court above Justice Court.', confidence: 'high' }
  }

  return { recommended: 'ms_circuit', reasoning: 'Claims exceeding $200,000 are heard in Mississippi Circuit Court, which has unlimited civil jurisdiction (Miss. Code § 9-7-81).', confidence: 'high' }
}

// -- Utah Rules ---------------------------------------------------------------

function recommendUtahCourt(input: CourtRecommendationInput): CourtRecommendation {
  const { disputeType, amount, circumstances } = input

  if (circumstances.federalLaw) {
    return { recommended: 'federal', reasoning: 'This dispute involves a federal law claim, which falls under exclusive federal jurisdiction.', confidence: 'high' }
  }

  if (disputeType === 'family') {
    return { recommended: 'ut_district', reasoning: 'Family law matters (divorce, custody, support) have exclusive jurisdiction in Utah District Court (Utah Code § 30-3-1).', confidence: 'high' }
  }

  if (disputeType === 'landlord_tenant' && input.subType === 'eviction') {
    return { recommended: 'ut_district', reasoning: 'Eviction (unlawful detainer) proceedings are filed in Utah Justice Court or District Court in the precinct where the property is located (Utah Code § 78B-6-801).', confidence: 'high' }
  }

  if (circumstances.realProperty) {
    return { recommended: 'ut_district', reasoning: 'Disputes involving title to real property are heard in Utah District Court.', confidence: 'high' }
  }

  if (circumstances.outOfState && (amount === 'over_20k' || amount === 'over_25k' || amount === 'over_200k' || amount === '75k_200k')) {
    return { recommended: 'federal', reasoning: 'Out-of-state parties with an amount in controversy exceeding $75,000 may qualify for federal diversity jurisdiction.', alternativeNote: 'You may also file in Utah District Court if you prefer state court.', confidence: 'moderate' }
  }

  if (amount === 'under_20k' || amount === 'under_15k' || amount === 'under_12500' || amount === 'under_10k' || amount === 'under_8k' || amount === 'under_7k' || amount === 'under_7500' || amount === 'under_6k' || amount === 'under_5k' || amount === 'under_2500' || amount === 'under_3500') {
    return { recommended: 'ut_small_claims', reasoning: 'Claims up to $20,000 can be filed in Utah Justice Court Small Claims Division (Utah Code § 78A-8-102). This limit rises to $25,000 in 2030 — Utah\'s inflation-indexed escalator is unique nationally. Online Dispute Resolution (ODR) is available.', confidence: 'high' }
  }

  return { recommended: 'ut_district', reasoning: 'Claims exceeding $20,000 are heard in Utah District Court, which has unlimited civil jurisdiction.', confidence: 'high' }
}

// -- New Mexico Rules ---------------------------------------------------------

function recommendNewMexicoCourt(input: CourtRecommendationInput): CourtRecommendation {
  const { disputeType, amount, circumstances } = input

  if (circumstances.federalLaw) {
    return { recommended: 'federal', reasoning: 'This dispute involves a federal law claim, which falls under exclusive federal jurisdiction.', confidence: 'high' }
  }

  if (disputeType === 'family') {
    return { recommended: 'nm_district', reasoning: 'Family law matters (divorce, custody, support) have exclusive jurisdiction in New Mexico District Court (N.M. Stat. § 40-4-1 et seq.).', confidence: 'high' }
  }

  if (disputeType === 'landlord_tenant' && input.subType === 'eviction') {
    return { recommended: 'nm_magistrate', reasoning: 'Eviction (restitution) proceedings are filed in New Mexico Magistrate Court (or Metropolitan Court in Bernalillo County) in the county where the property is located (N.M. Stat. § 47-8-41).', confidence: 'high' }
  }

  if (circumstances.realProperty) {
    return { recommended: 'nm_district', reasoning: 'Disputes involving title to real property are heard in New Mexico District Court.', confidence: 'high' }
  }

  if (circumstances.outOfState && (amount === 'over_10k' || amount === 'over_20k' || amount === 'over_25k' || amount === 'over_200k' || amount === '75k_200k')) {
    return { recommended: 'federal', reasoning: 'Out-of-state parties with an amount in controversy exceeding $75,000 may qualify for federal diversity jurisdiction.', alternativeNote: 'You may also file in New Mexico District Court if you prefer state court.', confidence: 'moderate' }
  }

  if (amount === 'under_10k' || amount === 'under_8k' || amount === 'under_7k' || amount === 'under_7500' || amount === 'under_6k' || amount === 'under_5k' || amount === 'under_2500' || amount === 'under_3500') {
    return { recommended: 'nm_magistrate', reasoning: 'Claims up to $10,000 can be filed in New Mexico Magistrate Court (N.M. Stat. § 35-3-3) or Metropolitan Court in Bernalillo County (N.M. Stat. § 34-8A-3). Note: answer deadline is 20 days in Magistrate Court but only 10 days in Metropolitan Court.', confidence: 'high' }
  }

  return { recommended: 'nm_district', reasoning: 'Claims exceeding $10,000 are heard in New Mexico District Court, which has unlimited civil jurisdiction.', confidence: 'high' }
}

// -- West Virginia Rules ------------------------------------------------------

function recommendWestVirginiaCourt(input: CourtRecommendationInput): CourtRecommendation {
  const { disputeType, amount, circumstances } = input

  if (circumstances.federalLaw) {
    return { recommended: 'federal', reasoning: 'This dispute involves a federal law claim, which falls under exclusive federal jurisdiction.', confidence: 'high' }
  }

  if (disputeType === 'family') {
    return { recommended: 'wv_circuit', reasoning: 'Family law matters (divorce, custody, support) have exclusive jurisdiction in West Virginia Circuit Court — Family Court Division (W. Va. Code § 51-2A-1 et seq.).', confidence: 'high' }
  }

  if (disputeType === 'landlord_tenant' && input.subType === 'eviction') {
    return { recommended: 'wv_magistrate', reasoning: 'Eviction proceedings are filed in West Virginia Magistrate Court in the county where the property is located (W. Va. Code § 55-3A-1). Service deadline is 5 days for eviction cases.', confidence: 'high' }
  }

  if (circumstances.realProperty) {
    return { recommended: 'wv_circuit', reasoning: 'Disputes involving title to real property are heard in West Virginia Circuit Court.', confidence: 'high' }
  }

  if (circumstances.outOfState && (amount === 'over_20k' || amount === 'over_25k' || amount === 'over_200k' || amount === '75k_200k')) {
    return { recommended: 'federal', reasoning: 'Out-of-state parties with an amount in controversy exceeding $75,000 may qualify for federal diversity jurisdiction.', alternativeNote: 'You may also file in West Virginia Circuit Court if you prefer state court.', confidence: 'moderate' }
  }

  if (amount === 'under_20k' || amount === 'under_15k' || amount === 'under_12500' || amount === 'under_10k' || amount === 'under_8k' || amount === 'under_7k' || amount === 'under_7500' || amount === 'under_6k' || amount === 'under_5k' || amount === 'under_2500' || amount === 'under_3500') {
    return { recommended: 'wv_magistrate', reasoning: 'Claims up to $20,000 can be filed in West Virginia Magistrate Court (W. Va. Code § 50-2-1) — doubled from $10,000 effective July 2025. Note: written contract SOL is 10 years — among the longest in the U.S. (W. Va. Code § 55-2-6).', confidence: 'high' }
  }

  return { recommended: 'wv_circuit', reasoning: 'Claims exceeding $20,000 are heard in West Virginia Circuit Court, which has unlimited civil jurisdiction (W. Va. Code § 51-2-2).', confidence: 'high' }
}

// -- Delaware Rules -----------------------------------------------------------

function recommendDelawareCourt(input: CourtRecommendationInput): CourtRecommendation {
  const { disputeType, amount, circumstances } = input

  if (circumstances.federalLaw) {
    return { recommended: 'federal', reasoning: 'This dispute involves a federal law claim, which falls under exclusive federal jurisdiction.', confidence: 'high' }
  }

  if (disputeType === 'family') {
    return { recommended: 'de_superior', reasoning: 'Family law matters in Delaware are handled by the Family Court, a division of Superior Court (10 Del. C. § 921 et seq.).', confidence: 'high' }
  }

  if (circumstances.realProperty) {
    return { recommended: 'de_superior', reasoning: 'Real property disputes in Delaware are heard in Superior Court, which has jurisdiction over matters involving title to land.', confidence: 'high' }
  }

  if (circumstances.outOfState && (amount === 'over_25k' || amount === 'over_20k' || amount === 'over_200k' || amount === '75k_200k' || amount === '25k_75k')) {
    return { recommended: 'federal', reasoning: 'Out-of-state parties with an amount in controversy exceeding $75,000 may qualify for federal diversity jurisdiction.', alternativeNote: 'You may also file in Delaware Superior Court.', confidence: 'moderate' }
  }

  if (amount === 'under_25k' || amount === 'under_20k' || amount === 'under_15k' || amount === 'under_12500' || amount === 'under_12k' || amount === 'under_10k' || amount === 'under_8k' || amount === 'under_7k' || amount === 'under_7500' || amount === 'under_6k' || amount === 'under_5k' || amount === 'under_3500' || amount === 'under_2500') {
    return { recommended: 'de_jp', reasoning: 'Claims up to $25,000 can be filed in Delaware Justice of the Peace Court (10 Del. C. § 9301) — the highest small claims limit in the U.S. Filing fee is $30–$50. No attorneys allowed in JP Court small claims.', confidence: 'high' }
  }

  if (amount === '25k_75k' || amount === '20k_75k' || amount === '12500_35k') {
    return { recommended: 'de_common_pleas', reasoning: 'Claims between $25,001 and $75,000 are filed in Delaware Court of Common Pleas (10 Del. C. § 1311). Attorneys are permitted.', confidence: 'high' }
  }

  return { recommended: 'de_superior', reasoning: 'Claims exceeding $75,000 are heard in Delaware Superior Court, which has unlimited civil jurisdiction (10 Del. C. § 541).', confidence: 'high' }
}

// -- Rhode Island Rules -------------------------------------------------------

function recommendRhodeIslandCourt(input: CourtRecommendationInput): CourtRecommendation {
  const { disputeType, amount, circumstances } = input

  if (circumstances.federalLaw) {
    return { recommended: 'federal', reasoning: 'This dispute involves a federal law claim, which falls under exclusive federal jurisdiction.', confidence: 'high' }
  }

  if (disputeType === 'family') {
    return { recommended: 'ri_superior', reasoning: 'Family Court in Rhode Island handles divorce, custody, and support matters (R.I. Gen. Laws § 8-10-3 et seq.).', confidence: 'high' }
  }

  if (circumstances.realProperty) {
    return { recommended: 'ri_superior', reasoning: 'Real property disputes are heard in Rhode Island Superior Court (R.I. Gen. Laws § 8-2-13).', confidence: 'high' }
  }

  if (circumstances.outOfState && (amount === 'over_20k' || amount === 'over_25k' || amount === 'over_200k' || amount === '75k_200k')) {
    return { recommended: 'federal', reasoning: 'Out-of-state parties with an amount in controversy exceeding $75,000 may qualify for federal diversity jurisdiction.', alternativeNote: 'You may also file in Rhode Island Superior Court.', confidence: 'moderate' }
  }

  if (amount === 'under_2500' || amount === 'under_3500') {
    return { recommended: 'ri_small_claims', reasoning: 'Claims up to $2,500 can be filed in Rhode Island District Court Small Claims Division (R.I. Gen. Laws § 10-16-1). Filing fee is $65–$80. Note: plaintiff CANNOT appeal a small claims judgment — only defendant can appeal (unique restriction).', confidence: 'high' }
  }

  if (amount === '2500_5k' || amount === 'under_5k' || amount === 'under_6k' || amount === 'under_7k' || amount === 'under_7500' || amount === 'under_8k' || amount === 'under_10k' || amount === 'under_12k' || amount === 'under_12500' || amount === 'under_15k' || amount === 'under_20k' || amount === 'under_25k') {
    return { recommended: 'ri_district', reasoning: 'Claims between $2,501 and $25,000 are filed in Rhode Island District Court (R.I. Gen. Laws § 8-8-3). Attorneys permitted. Post-judgment interest accrues at 12% per annum.', confidence: 'high' }
  }

  return { recommended: 'ri_superior', reasoning: 'Claims exceeding $25,000 are heard in Rhode Island Superior Court, which has unlimited civil jurisdiction (R.I. Gen. Laws § 8-2-13).', confidence: 'high' }
}

// -- New Hampshire Rules ------------------------------------------------------

function recommendNewHampshireCourt(input: CourtRecommendationInput): CourtRecommendation {
  const { disputeType, amount, circumstances } = input

  if (circumstances.federalLaw) {
    return { recommended: 'federal', reasoning: 'This dispute involves a federal law claim, which falls under exclusive federal jurisdiction.', confidence: 'high' }
  }

  if (disputeType === 'family') {
    return { recommended: 'nh_superior', reasoning: 'Family Division of the New Hampshire Circuit Court handles divorce, custody, and support matters (RSA § 490-D:2).', confidence: 'high' }
  }

  if (circumstances.realProperty) {
    return { recommended: 'nh_superior', reasoning: 'Real property disputes in New Hampshire are heard in Superior Court (RSA § 491:7).', confidence: 'high' }
  }

  if (circumstances.outOfState && (amount === 'over_20k' || amount === 'over_25k' || amount === 'over_200k' || amount === '75k_200k')) {
    return { recommended: 'federal', reasoning: 'Out-of-state parties with an amount in controversy exceeding $75,000 may qualify for federal diversity jurisdiction.', alternativeNote: 'You may also file in New Hampshire Superior Court.', confidence: 'moderate' }
  }

  if (amount === 'under_10k' || amount === 'under_7500' || amount === 'under_7k' || amount === 'under_8k' || amount === 'under_6k' || amount === 'under_5k' || amount === 'under_3500' || amount === 'under_2500') {
    return { recommended: 'nh_small_claims', reasoning: 'Claims up to $10,000 can be filed in New Hampshire Circuit Court Small Claims Division (RSA § 503:1). Filing fee is $90–$130. Note: e-filing is mandatory; mediation is required for claims over $5,000. All SOL periods are 3 years (RSA § 508:4).', confidence: 'high' }
  }

  return { recommended: 'nh_superior', reasoning: 'Claims exceeding $10,000 are heard in New Hampshire Superior Court, which has unlimited civil jurisdiction (RSA § 491:7).', confidence: 'high' }
}

// -- Vermont Rules ------------------------------------------------------------

function recommendVermontCourt(input: CourtRecommendationInput): CourtRecommendation {
  const { disputeType, amount, circumstances } = input

  if (circumstances.federalLaw) {
    return { recommended: 'federal', reasoning: 'This dispute involves a federal law claim, which falls under exclusive federal jurisdiction.', confidence: 'high' }
  }

  if (disputeType === 'family') {
    return { recommended: 'vt_superior', reasoning: 'Family Division of Vermont Superior Court handles divorce, custody, and support matters (4 V.S.A. § 33).', confidence: 'high' }
  }

  if (circumstances.realProperty) {
    return { recommended: 'vt_superior', reasoning: 'Real property disputes are heard in Vermont Superior Court, Civil Division (4 V.S.A. § 113).', confidence: 'high' }
  }

  if (circumstances.outOfState && (amount === 'over_20k' || amount === 'over_25k' || amount === 'over_200k' || amount === '75k_200k')) {
    return { recommended: 'federal', reasoning: 'Out-of-state parties with an amount in controversy exceeding $75,000 may qualify for federal diversity jurisdiction.', alternativeNote: 'You may also file in Vermont Superior Court.', confidence: 'moderate' }
  }

  if (amount === 'under_5k' || amount === 'under_3500' || amount === 'under_2500') {
    return { recommended: 'vt_small_claims', reasoning: 'Claims up to $5,000 can be filed in Vermont Small Claims Court (12 V.S.A. § 5531). Filing fee is $90–$120. Attorneys may appear but judge may limit questioning. Personal injury SOL is 3 years (12 V.S.A. § 512).', confidence: 'high' }
  }

  return { recommended: 'vt_superior', reasoning: 'Claims exceeding $5,000 are heard in Vermont Superior Court, Civil Division, which has unlimited civil jurisdiction (4 V.S.A. § 113).', confidence: 'high' }
}

// -- Maine Rules --------------------------------------------------------------

function recommendMaineCourt(input: CourtRecommendationInput): CourtRecommendation {
  const { disputeType, amount, circumstances } = input

  if (circumstances.federalLaw) {
    return { recommended: 'federal', reasoning: 'This dispute involves a federal law claim, which falls under exclusive federal jurisdiction.', confidence: 'high' }
  }

  if (disputeType === 'family') {
    return { recommended: 'me_superior', reasoning: 'Family matters in Maine are handled by the District Court and Superior Court depending on the issue (19-A M.R.S.A. § 251 et seq.).', confidence: 'high' }
  }

  if (circumstances.realProperty) {
    return { recommended: 'me_superior', reasoning: 'Real property disputes are heard in Maine Superior Court (4 M.R.S.A. § 105).', confidence: 'high' }
  }

  if (circumstances.outOfState && (amount === 'over_20k' || amount === 'over_25k' || amount === 'over_200k' || amount === '75k_200k')) {
    return { recommended: 'federal', reasoning: 'Out-of-state parties with an amount in controversy exceeding $75,000 may qualify for federal diversity jurisdiction.', alternativeNote: 'You may also file in Maine Superior Court.', confidence: 'moderate' }
  }

  if (amount === 'under_6k' || amount === 'under_5k' || amount === 'under_3500' || amount === 'under_2500') {
    return { recommended: 'me_small_claims', reasoning: 'Claims up to $6,000 can be filed in Maine District Court Small Claims (14 M.R.S.A. § 7482). Filing fee is $60–$80. Note: plaintiff can appeal only on legal error (law only); defendant can appeal on both law and fact — asymmetric appeal rights (14 M.R.S.A. § 7488). All SOL periods are 6 years (14 M.R.S.A. § 752).', confidence: 'high' }
  }

  return { recommended: 'me_superior', reasoning: 'Claims exceeding $6,000 are heard in Maine Superior Court, which has unlimited civil jurisdiction (4 M.R.S.A. § 105).', confidence: 'high' }
}

// -- Iowa Rules ---------------------------------------------------------------

function recommendIowaCourt(input: CourtRecommendationInput): CourtRecommendation {
  const { disputeType, amount, circumstances } = input

  if (circumstances.federalLaw) {
    return { recommended: 'federal', reasoning: 'This dispute involves a federal law claim, which falls under exclusive federal jurisdiction.', confidence: 'high' }
  }

  if (disputeType === 'family') {
    return { recommended: 'ia_district', reasoning: 'Family law matters in Iowa are handled exclusively by District Court (Iowa Code § 598.1 et seq.).', confidence: 'high' }
  }

  if (circumstances.realProperty) {
    return { recommended: 'ia_district', reasoning: 'Real property disputes in Iowa are heard in District Court (Iowa Code § 602.6101).', confidence: 'high' }
  }

  if (circumstances.outOfState && (amount === 'over_20k' || amount === 'over_25k' || amount === 'over_200k' || amount === '75k_200k')) {
    return { recommended: 'federal', reasoning: 'Out-of-state parties with an amount in controversy exceeding $75,000 may qualify for federal diversity jurisdiction.', alternativeNote: 'You may also file in Iowa District Court.', confidence: 'moderate' }
  }

  if (amount === 'under_6k' || amount === 'under_7k' || amount === 'under_5k' || amount === 'under_3500' || amount === 'under_2500') {
    return { recommended: 'ia_small_claims', reasoning: 'Claims up to $6,500 can be filed in Iowa Small Claims Court (Iowa Code § 631.1). Filing fee is $35–$95. Written contract SOL is 10 years — tied for longest in the U.S. (Iowa Code § 614.1(5)).', confidence: 'high' }
  }

  return { recommended: 'ia_district', reasoning: 'Claims exceeding $6,500 are heard in Iowa District Court, which has unlimited civil jurisdiction (Iowa Code § 602.6101).', confidence: 'high' }
}

// -- Kansas Rules -------------------------------------------------------------

function recommendKansasCourt(input: CourtRecommendationInput): CourtRecommendation {
  const { disputeType, amount, circumstances } = input

  if (circumstances.federalLaw) {
    return { recommended: 'federal', reasoning: 'This dispute involves a federal law claim, which falls under exclusive federal jurisdiction.', confidence: 'high' }
  }

  if (disputeType === 'family') {
    return { recommended: 'ks_district', reasoning: 'Family law matters in Kansas are handled exclusively by District Court (K.S.A. § 23-2101 et seq.).', confidence: 'high' }
  }

  if (circumstances.realProperty) {
    return { recommended: 'ks_district', reasoning: 'Real property disputes in Kansas are heard in District Court (K.S.A. § 61-1703).', confidence: 'high' }
  }

  if (circumstances.outOfState && (amount === 'over_20k' || amount === 'over_25k' || amount === 'over_200k' || amount === '75k_200k')) {
    return { recommended: 'federal', reasoning: 'Out-of-state parties with an amount in controversy exceeding $75,000 may qualify for federal diversity jurisdiction.', alternativeNote: 'You may also file in Kansas District Court.', confidence: 'moderate' }
  }

  if (amount === 'under_5k' || amount === 'under_3500' || amount === 'under_2500') {
    return { recommended: 'ks_small_claims', reasoning: 'Claims up to $4,000 can be filed in Kansas Small Claims Court (K.S.A. § 61-2703). Filing fee is $35–$70. Unique restriction: no attorneys unless the opposing party also has an attorney. Limit: 20 filings per year per individual. Personal injury SOL is 2 years (KSA § 60-513).', confidence: 'high' }
  }

  return { recommended: 'ks_district', reasoning: 'Claims exceeding $4,000 are heard in Kansas District Court, which has unlimited civil jurisdiction (K.S.A. § 4-101).', confidence: 'high' }
}

// -- Nebraska Rules -----------------------------------------------------------

function recommendNebraskaCourt(input: CourtRecommendationInput): CourtRecommendation {
  const { disputeType, amount, circumstances } = input

  if (circumstances.federalLaw) {
    return { recommended: 'federal', reasoning: 'This dispute involves a federal law claim, which falls under exclusive federal jurisdiction.', confidence: 'high' }
  }

  if (disputeType === 'family') {
    return { recommended: 'ne_district', reasoning: 'Family law matters in Nebraska are handled by District Court (Neb. Rev. Stat. § 42-347 et seq.).', confidence: 'high' }
  }

  if (circumstances.realProperty) {
    return { recommended: 'ne_district', reasoning: 'Real property disputes in Nebraska are heard in District Court (Neb. Rev. Stat. § 25-1601).', confidence: 'high' }
  }

  if (circumstances.outOfState && (amount === 'over_20k' || amount === 'over_25k' || amount === 'over_200k' || amount === '75k_200k')) {
    return { recommended: 'federal', reasoning: 'Out-of-state parties with an amount in controversy exceeding $75,000 may qualify for federal diversity jurisdiction.', alternativeNote: 'You may also file in Nebraska District Court.', confidence: 'moderate' }
  }

  if (amount === 'under_3500' || amount === 'under_2500') {
    return { recommended: 'ne_small_claims', reasoning: 'Claims up to $3,600 can be filed in Nebraska County Court Small Claims Division (Neb. Rev. Stat. § 25-2801). Filing fee is $30–$45. Strict no-attorneys rule (Neb. Rev. Stat. § 25-2806); maximum 2 filings per week and 10 per year per party. Personal injury SOL is 4 years (Neb. Rev. Stat. § 25-207).', confidence: 'high' }
  }

  if (amount === '2500_5k' || amount === 'under_5k' || amount === 'under_6k' || amount === 'under_7k' || amount === 'under_7500' || amount === 'under_8k' || amount === 'under_10k' || amount === 'under_12k' || amount === 'under_12500' || amount === 'under_15k' || amount === 'under_20k' || amount === 'under_25k') {
    return { recommended: 'ne_county', reasoning: 'Claims between $3,601 and $67,500 are filed in Nebraska County Court (Neb. Rev. Stat. § 24-517). Attorneys are permitted.', confidence: 'high' }
  }

  return { recommended: 'ne_district', reasoning: 'Claims exceeding $67,500 are heard in Nebraska District Court, which has unlimited civil jurisdiction (Neb. Rev. Stat. § 24-302).', confidence: 'high' }
}

// -- South Dakota Rules -------------------------------------------------------

function recommendSouthDakotaCourt(input: CourtRecommendationInput): CourtRecommendation {
  const { disputeType, amount, circumstances } = input

  if (circumstances.federalLaw) {
    return { recommended: 'federal', reasoning: 'This dispute involves a federal law claim, which falls under exclusive federal jurisdiction.', confidence: 'high' }
  }

  if (disputeType === 'family') {
    return { recommended: 'sd_circuit', reasoning: 'Family law matters in South Dakota are handled exclusively by Circuit Court (SDCL § 26-5-1 et seq.).', confidence: 'high' }
  }

  if (circumstances.realProperty) {
    return { recommended: 'sd_circuit', reasoning: 'Real property disputes in South Dakota are heard in Circuit Court (SDCL § 21-35-1).', confidence: 'high' }
  }

  if (circumstances.outOfState && (amount === 'over_20k' || amount === 'over_25k' || amount === 'over_200k' || amount === '75k_200k')) {
    return { recommended: 'federal', reasoning: 'Out-of-state parties with an amount in controversy exceeding $75,000 may qualify for federal diversity jurisdiction.', alternativeNote: 'You may also file in South Dakota Circuit Court.', confidence: 'moderate' }
  }

  if (amount === 'under_12500' || amount === 'under_12k' || amount === 'under_10k' || amount === 'under_8k' || amount === 'under_7k' || amount === 'under_7500' || amount === 'under_6k' || amount === 'under_5k' || amount === 'under_3500' || amount === 'under_2500') {
    return { recommended: 'sd_small_claims', reasoning: 'Claims up to $12,000 can be filed in South Dakota Small Claims Court (SDCL § 15-39-45). Filing fee is $20–$50. Attorneys are not allowed unless both parties agree. Personal injury and property SOL is 3 years (SDCL § 15-2-14).', confidence: 'high' }
  }

  return { recommended: 'sd_circuit', reasoning: 'Claims exceeding $12,000 are heard in South Dakota Circuit Court, which has unlimited civil jurisdiction (SDCL § 16-6-1).', confidence: 'high' }
}

// -- North Dakota Rules -------------------------------------------------------

function recommendNorthDakotaCourt(input: CourtRecommendationInput): CourtRecommendation {
  const { disputeType, amount, circumstances } = input

  if (circumstances.federalLaw) {
    return { recommended: 'federal', reasoning: 'This dispute involves a federal law claim, which falls under exclusive federal jurisdiction.', confidence: 'high' }
  }

  if (disputeType === 'family') {
    return { recommended: 'nd_district', reasoning: 'Family law matters in North Dakota are handled exclusively by District Court (N.D. Cent. Code § 14-05-03 et seq.).', confidence: 'high' }
  }

  if (circumstances.realProperty) {
    return { recommended: 'nd_district', reasoning: 'Real property disputes in North Dakota are heard in District Court (N.D. Cent. Code § 32-04-01).', confidence: 'high' }
  }

  if (circumstances.outOfState && (amount === 'over_20k' || amount === 'over_25k' || amount === 'over_200k' || amount === '75k_200k')) {
    return { recommended: 'federal', reasoning: 'Out-of-state parties with an amount in controversy exceeding $75,000 may qualify for federal diversity jurisdiction.', alternativeNote: 'You may also file in North Dakota District Court.', confidence: 'moderate' }
  }

  if (amount === 'under_15k' || amount === 'under_12500' || amount === 'under_12k' || amount === 'under_10k' || amount === 'under_8k' || amount === 'under_7k' || amount === 'under_7500' || amount === 'under_6k' || amount === 'under_5k' || amount === 'under_3500' || amount === 'under_2500') {
    return { recommended: 'nd_small_claims', reasoning: 'Claims up to $15,000 can be filed in North Dakota Small Claims Court (N.D.C.C. § 27-08.1-01). Filing fee is $10–$50. Unique rule: individual persons cannot have attorneys, but corporations MUST be represented by an attorney. All SOL periods are 6 years (N.D.C.C. § 28-01-16).', confidence: 'high' }
  }

  return { recommended: 'nd_district', reasoning: 'Claims exceeding $15,000 are heard in North Dakota District Court, which has unlimited civil jurisdiction (N.D.C.C. § 27-05-06).', confidence: 'high' }
}

// -- Montana Rules ------------------------------------------------------------

function recommendMontanaCourt(input: CourtRecommendationInput): CourtRecommendation {
  const { disputeType, amount, circumstances } = input

  if (circumstances.federalLaw) {
    return { recommended: 'federal', reasoning: 'This dispute involves a federal law claim, which falls under exclusive federal jurisdiction.', confidence: 'high' }
  }

  if (disputeType === 'family') {
    return { recommended: 'mt_district', reasoning: 'Family law matters in Montana are handled exclusively by District Court (MCA § 40-4-105 et seq.).', confidence: 'high' }
  }

  if (circumstances.realProperty) {
    return { recommended: 'mt_district', reasoning: 'Real property disputes in Montana are heard in District Court (MCA § 70-19-101).', confidence: 'high' }
  }

  if (circumstances.outOfState && (amount === 'over_20k' || amount === 'over_25k' || amount === 'over_200k' || amount === '75k_200k')) {
    return { recommended: 'federal', reasoning: 'Out-of-state parties with an amount in controversy exceeding $75,000 may qualify for federal diversity jurisdiction.', alternativeNote: 'You may also file in Montana District Court.', confidence: 'moderate' }
  }

  if (amount === 'under_7k' || amount === 'under_7500' || amount === 'under_6k' || amount === 'under_5k' || amount === 'under_3500' || amount === 'under_2500') {
    return { recommended: 'mt_justice', reasoning: 'Claims up to $7,000 can be filed in Montana Justice Court Small Claims Division (MCA § 25-35-502). Filing fee is $30–$50. Unique "all or none" attorney rule: either both parties have attorneys or neither does. Written contract SOL is 8 years — among the longest in the U.S. (MCA § 27-2-202).', confidence: 'high' }
  }

  return { recommended: 'mt_district', reasoning: 'Claims exceeding $7,000 are heard in Montana District Court, which has unlimited civil jurisdiction (MCA § 3-5-302).', confidence: 'high' }
}

// -- Wyoming Rules ------------------------------------------------------------

function recommendWyomingCourt(input: CourtRecommendationInput): CourtRecommendation {
  const { disputeType, amount, circumstances } = input

  if (circumstances.federalLaw) {
    return { recommended: 'federal', reasoning: 'This dispute involves a federal law claim, which falls under exclusive federal jurisdiction.', confidence: 'high' }
  }

  if (disputeType === 'family') {
    return { recommended: 'wy_district', reasoning: 'Family law matters in Wyoming are handled exclusively by District Court (W.S. § 20-2-101 et seq.).', confidence: 'high' }
  }

  if (circumstances.realProperty) {
    return { recommended: 'wy_district', reasoning: 'Real property disputes in Wyoming are heard in District Court (W.S. § 1-32-101).', confidence: 'high' }
  }

  if (circumstances.outOfState && (amount === 'over_20k' || amount === 'over_25k' || amount === 'over_200k' || amount === '75k_200k')) {
    return { recommended: 'federal', reasoning: 'Out-of-state parties with an amount in controversy exceeding $75,000 may qualify for federal diversity jurisdiction.', alternativeNote: 'You may also file in Wyoming District Court.', confidence: 'moderate' }
  }

  if (amount === 'under_6k' || amount === 'under_5k' || amount === 'under_3500' || amount === 'under_2500') {
    return { recommended: 'wy_small_claims', reasoning: 'Claims up to $6,000 can be filed in Wyoming Circuit Court Small Claims Division (W.S. § 1-21-201). Filing fee is only $10 — the lowest in the U.S. Written contract SOL is 10 years (W.S. § 1-3-105).', confidence: 'high' }
  }

  return { recommended: 'wy_district', reasoning: 'Claims exceeding $6,000 are heard in Wyoming District Court, which has unlimited civil jurisdiction (W.S. § 5-9-128).', confidence: 'high' }
}

// -- Idaho Rules --------------------------------------------------------------

function recommendIdahoCourt(input: CourtRecommendationInput): CourtRecommendation {
  const { disputeType, amount, circumstances } = input

  if (circumstances.federalLaw) {
    return { recommended: 'federal', reasoning: 'This dispute involves a federal law claim, which falls under exclusive federal jurisdiction.', confidence: 'high' }
  }

  if (disputeType === 'family') {
    return { recommended: 'id_magistrate', reasoning: 'Family law matters in Idaho are handled by Magistrate Division of District Court (Idaho Code § 32-701 et seq.).', confidence: 'high' }
  }

  if (circumstances.realProperty) {
    return { recommended: 'id_district', reasoning: 'Real property disputes in Idaho are heard in District Court (Idaho Code § 1-705).', confidence: 'high' }
  }

  if (circumstances.outOfState && (amount === 'over_20k' || amount === 'over_25k' || amount === 'over_200k' || amount === '75k_200k')) {
    return { recommended: 'federal', reasoning: 'Out-of-state parties with an amount in controversy exceeding $75,000 may qualify for federal diversity jurisdiction.', alternativeNote: 'You may also file in Idaho District Court.', confidence: 'moderate' }
  }

  if (amount === 'under_5k' || amount === 'under_3500' || amount === 'under_2500') {
    return { recommended: 'id_small_claims', reasoning: 'Claims up to $5,000 can be filed in Idaho Small Claims Court (Idaho Code § 1-2301). Filing fee is $55–$110. No attorneys permitted AND no counterclaims allowed (unique nationally). Personal injury SOL is 2 years (Idaho Code § 5-219).', confidence: 'high' }
  }

  if (amount === '5k_10k' || amount === '5k_20k' || amount === '5k_25k' || amount === 'under_6k' || amount === 'under_7k' || amount === 'under_7500' || amount === 'under_8k' || amount === 'under_10k' || amount === 'under_12k' || amount === 'under_12500' || amount === 'under_15k' || amount === 'under_20k' || amount === 'under_25k') {
    return { recommended: 'id_magistrate', reasoning: 'Claims between $5,001 and $10,000 are filed in Idaho Magistrate Division (Idaho Code § 1-2208). Attorneys permitted.', confidence: 'high' }
  }

  return { recommended: 'id_district', reasoning: 'Claims exceeding $10,000 are heard in Idaho District Court, which has unlimited civil jurisdiction (Idaho Code § 1-705).', confidence: 'high' }
}

// -- Hawaii Rules -------------------------------------------------------------

function recommendHawaiiCourt(input: CourtRecommendationInput): CourtRecommendation {
  const { disputeType, amount, circumstances } = input

  if (circumstances.federalLaw) {
    return { recommended: 'federal', reasoning: 'This dispute involves a federal law claim, which falls under exclusive federal jurisdiction.', confidence: 'high' }
  }

  if (disputeType === 'family') {
    return { recommended: 'hi_circuit', reasoning: 'Family Court in Hawaii is a division of Circuit Court (HRS § 571-11 et seq.).', confidence: 'high' }
  }

  if (circumstances.realProperty) {
    return { recommended: 'hi_circuit', reasoning: 'Real property disputes in Hawaii are heard in Circuit Court (HRS § 603-21.9).', confidence: 'high' }
  }

  if (circumstances.outOfState && (amount === 'over_20k' || amount === 'over_25k' || amount === 'over_200k' || amount === '75k_200k')) {
    return { recommended: 'federal', reasoning: 'Out-of-state parties with an amount in controversy exceeding $75,000 may qualify for federal diversity jurisdiction.', alternativeNote: 'You may also file in Hawaii Circuit Court.', confidence: 'moderate' }
  }

  if (amount === 'under_5k' || amount === 'under_3500' || amount === 'under_2500') {
    return { recommended: 'hi_small_claims', reasoning: 'Claims up to $5,000 can be filed in Hawaii Small Claims Court (HRS § 633-27). Filing fee is $55–$80. Important: there is NO right to appeal a small claims judgment (unique nationally). Security deposit disputes have no dollar limit in small claims. Personal injury SOL is 2 years (HRS § 657-7).', confidence: 'high' }
  }

  if (amount === '2500_5k' || amount === '5k_10k' || amount === '5k_20k' || amount === '5k_25k' || amount === 'under_6k' || amount === 'under_7k' || amount === 'under_7500' || amount === 'under_8k' || amount === 'under_10k' || amount === 'under_12k' || amount === 'under_12500' || amount === 'under_15k' || amount === 'under_20k' || amount === 'under_25k') {
    return { recommended: 'hi_district', reasoning: 'Claims between $5,001 and $40,000 are filed in Hawaii District Court (HRS § 604-5). Attorneys permitted.', confidence: 'high' }
  }

  return { recommended: 'hi_circuit', reasoning: 'Claims exceeding $40,000 are heard in Hawaii Circuit Court, which has unlimited civil jurisdiction (HRS § 603-21.9).', confidence: 'high' }
}

// -- Alaska Rules -------------------------------------------------------------

function recommendAlaskaCourt(input: CourtRecommendationInput): CourtRecommendation {
  const { disputeType, amount, circumstances } = input

  if (circumstances.federalLaw) {
    return { recommended: 'federal', reasoning: 'This dispute involves a federal law claim, which falls under exclusive federal jurisdiction.', confidence: 'high' }
  }

  if (disputeType === 'family') {
    return { recommended: 'ak_district', reasoning: 'Family law matters in Alaska are handled by Superior Court (Alaska R. Civ. P.). District Court handles small claims family matters.', confidence: 'high' }
  }

  if (circumstances.realProperty) {
    return { recommended: 'ak_district', reasoning: 'Real property disputes in Alaska are heard in Superior Court, though District Court handles claims up to $100,000 (AS § 22.15.030).', confidence: 'high' }
  }

  if (circumstances.outOfState && (amount === 'over_20k' || amount === 'over_25k' || amount === 'over_200k' || amount === '75k_200k')) {
    return { recommended: 'federal', reasoning: 'Out-of-state parties with an amount in controversy exceeding $75,000 may qualify for federal diversity jurisdiction.', alternativeNote: 'You may also file in Alaska Superior Court.', confidence: 'moderate' }
  }

  if (amount === 'under_2500') {
    return { recommended: 'ak_small_claims', reasoning: 'Claims up to $2,500 use Alaska Small Claims Level (SCL) in District Court (AS § 22.15.040). Filing fee is $50. No attorneys unless both parties agree.', confidence: 'high' }
  }

  if (amount === 'under_10k' || amount === 'under_7500' || amount === 'under_7k' || amount === 'under_8k' || amount === 'under_6k' || amount === 'under_5k' || amount === 'under_3500' || amount === '2500_5k') {
    return { recommended: 'ak_small_claims', reasoning: 'Claims up to $10,000 use Alaska Small Claims Grade (SCG) in District Court (AS § 22.15.040). Filing fee is $100. No attorneys unless both parties agree. Personal injury SOL is 2 years (AS § 09.10.070).', confidence: 'high' }
  }

  return { recommended: 'ak_district', reasoning: 'Claims exceeding $10,000 are heard in Alaska District Court (up to $100,000) or Superior Court for larger amounts (AS §§ 22.15.030, 22.10.020).', confidence: 'high' }
}
