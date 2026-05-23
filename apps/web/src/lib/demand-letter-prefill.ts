const COMMON_FIELD_ALIASES: Record<string, string[]> = {
  facts: ['facts', 'background', 'incident_description', 'what_happened', 'dispute_summary'],
  amount_claimed: ['amount_claimed', 'claim_amount', 'total_damages', 'damages_total', 'estimated_damage_amount'],
  damages_sought: ['damages_sought', 'total_damages', 'damages_total'],
  demand_letter_date: ['demand_letter_date', 'sent_date'],
  opposing_party_name: ['opposing_party_name', 'defendant_name', 'landlord_name', 'business_name'],
}

function firstDefined(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = source[key]
    if (value !== undefined && value !== null && value !== '') return value
  }
  return undefined
}

export function transformDemandLetterToFiling(
  demandLetterMetadata: Record<string, unknown>,
  filingTaskKey: string
): Record<string, unknown> {
  const prefill: Record<string, unknown> = {
    ...demandLetterMetadata,
  }

  for (const [targetKey, aliases] of Object.entries(COMMON_FIELD_ALIASES)) {
    const value = firstDefined(demandLetterMetadata, aliases)
    if (value !== undefined) prefill[targetKey] = value
  }

  if (filingTaskKey.includes('landlord_tenant')) {
    prefill.claim_amount = firstDefined(demandLetterMetadata, [
      'claim_amount',
      'total_damages',
      'damages_total',
      'amount_claimed',
    ])
  }

  if (filingTaskKey.includes('pi_')) {
    prefill.incident_description = firstDefined(demandLetterMetadata, [
      'incident_description',
      'facts',
      'what_happened',
    ])
  }

  prefill.demand_letter_sent = true

  return prefill
}
