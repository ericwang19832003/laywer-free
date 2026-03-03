// Pure TypeScript functions for Texas venue rules and jurisdiction validation.
// No external imports — all pure functions.

export interface VenueRecommendation {
  recommended_county: string | null
  explanation: string
  alternativeNote?: string
  rule_citation: string
}

export interface JurisdictionCheck {
  valid: boolean
  warning?: string
  suggestion?: string
}

/**
 * Recommends the proper Texas county for filing based on dispute type and
 * the counties involved. Implements simplified Texas venue rules with a
 * first-match-wins approach.
 */
export function recommendVenue(input: {
  disputeType: string
  defendantCounty: string | null
  incidentCounty: string | null
  propertyCounty: string | null
  contractCounty: string | null
}): VenueRecommendation {
  const { disputeType, defendantCounty, incidentCounty, propertyCounty, contractCounty } = input

  const noCountyResult: VenueRecommendation = {
    recommended_county: null,
    explanation: 'We need at least one county to recommend where to file.',
    rule_citation: 'Tex. Civ. Prac. & Rem. Code § 15.002',
  }

  // Helper: build a recommendation using a specific county with defendant fallback
  function buildRecommendation(
    specificCounty: string | null,
    specificExplanation: (county: string) => string,
    defendantExplanation: (county: string) => string,
    citation: string
  ): VenueRecommendation {
    if (specificCounty) {
      const result: VenueRecommendation = {
        recommended_county: specificCounty,
        explanation: specificExplanation(specificCounty),
        rule_citation: citation,
      }
      if (defendantCounty && defendantCounty !== specificCounty) {
        result.alternativeNote = `You could also file in ${defendantCounty} County, where the defendant resides.`
      }
      return result
    }

    if (defendantCounty) {
      return {
        recommended_county: defendantCounty,
        explanation: defendantExplanation(defendantCounty),
        rule_citation: citation,
      }
    }

    return { ...noCountyResult, rule_citation: citation }
  }

  switch (disputeType) {
    case 'property':
      return buildRecommendation(
        propertyCounty,
        (c) => `File in ${c} County because that's where the property is located.`,
        (c) => `File in ${c} County because that's where the defendant lives.`,
        'Tex. Civ. Prac. & Rem. Code § 15.011'
      )

    case 'landlord_tenant':
      return buildRecommendation(
        propertyCounty,
        (c) => `File in ${c} County because that's where the property is located.`,
        (c) => `File in ${c} County because that's where the defendant lives.`,
        'Tex. Civ. Prac. & Rem. Code § 15.0115'
      )

    case 'personal_injury':
      return buildRecommendation(
        incidentCounty,
        (c) => `File in ${c} County because that's where the incident happened.`,
        (c) => `File in ${c} County because that's where the defendant lives.`,
        'Tex. Civ. Prac. & Rem. Code § 15.002'
      )

    case 'contract':
      return buildRecommendation(
        contractCounty,
        (c) => `File in ${c} County because that's where the contract was to be performed.`,
        (c) => `File in ${c} County because that's where the defendant lives.`,
        'Tex. Civ. Prac. & Rem. Code § 15.035'
      )

    case 'family': {
      if (defendantCounty) {
        return {
          recommended_county: defendantCounty,
          explanation: `File in ${defendantCounty} County. For divorce, you must have lived in this county for at least 90 days and in Texas for at least 6 months. For custody matters (SAPCR), file in the county where the children have lived for the past 6 months.`,
          alternativeNote: incidentCounty && incidentCounty !== defendantCounty
            ? `If your children primarily live in ${incidentCounty} County, you may need to file there for custody matters under § 103.001.`
            : undefined,
          rule_citation: 'Tex. Fam. Code § 6.301 (divorce); § 103.001 (SAPCR)',
        }
      }
      return {
        recommended_county: null,
        explanation: 'For divorce, file in the county where you have lived for at least 90 days. For custody (SAPCR), file in the county where the child has lived for the past 6 months. For protective orders, file in the county where you or the respondent resides.',
        rule_citation: 'Tex. Fam. Code § 6.301; § 103.001; § 82.003',
      }
    }

    case 'small_claims': {
      if (defendantCounty) {
        return {
          recommended_county: defendantCounty,
          explanation: `File in the Justice Court in ${defendantCounty} County, where the defendant resides. For small claims, you can also file in the county where the obligation was to be performed (e.g., where the work was done or where the property is located).`,
          alternativeNote: incidentCounty && incidentCounty !== defendantCounty
            ? `You may alternatively file in ${incidentCounty} County if that's where the events giving rise to the claim occurred.`
            : undefined,
          rule_citation: 'TRCP 502.4 (venue in justice court cases)',
        }
      }
      return {
        recommended_county: null,
        explanation: 'For small claims, file in the county where the defendant lives, or where the obligation was to be performed. If the defendant is a business, file where the business has an office or representative.',
        rule_citation: 'TRCP 502.4',
      }
    }

    // Default: debt_collection, other, and anything else
    default: {
      if (defendantCounty) {
        return {
          recommended_county: defendantCounty,
          explanation: `File in ${defendantCounty} County because that's where the defendant lives.`,
          rule_citation: 'Tex. Civ. Prac. & Rem. Code § 15.002',
        }
      }
      return noCountyResult
    }
  }
}

/**
 * Validates whether the chosen court type can handle the claim amount.
 * Returns a warning and suggestion when the amount exceeds the court's
 * jurisdictional limit.
 */
export function validateJurisdiction(input: {
  courtType: string
  amountSought: number
  isOutOfState?: boolean
}): JurisdictionCheck {
  const { courtType, amountSought, isOutOfState } = input

  // Non-monetary claims (0 or NaN) are always valid
  if (amountSought === 0 || Number.isNaN(amountSought)) {
    return { valid: true }
  }

  switch (courtType) {
    case 'JP':
      if (amountSought > 20000) {
        return {
          valid: false,
          warning: 'JP Court handles claims up to $20,000.',
          suggestion: 'Consider filing in County Court instead.',
        }
      }
      return { valid: true }

    case 'County':
      if (amountSought > 200000) {
        return {
          valid: false,
          warning: 'County Court handles claims up to $200,000.',
          suggestion: 'Consider filing in District Court instead.',
        }
      }
      return { valid: true }

    case 'District':
      return { valid: true }

    case 'Federal':
      if (isOutOfState && amountSought < 75001) {
        return {
          valid: false,
          warning: 'Federal court requires the amount to exceed $75,000 for diversity jurisdiction.',
          suggestion: 'Consider filing in Texas state court instead.',
        }
      }
      return { valid: true }

    default:
      return { valid: true }
  }
}
