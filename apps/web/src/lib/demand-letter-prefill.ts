/**
 * Transforms demand letter metadata into petition/filing wizard field names.
 *
 * Demand letters and petition wizards use different field naming conventions.
 * This module maps completed demand letter data into the format expected by
 * each filing wizard, so users don't re-enter parties, facts, and damages.
 *
 * Only non-draft fields are carried forward (draft_text, final_text, and
 * internal wizard state like _wizard_step are excluded).
 */

type Meta = Record<string, unknown>

/** Fields that should never carry forward from demand letter to petition */
const EXCLUDED_FIELDS = new Set([
  'draft_text',
  'final_text',
  'annotations',
  '_wizard_step',
  'acknowledged',
])

function omitExcluded(meta: Meta): Meta {
  const result: Meta = {}
  for (const [key, value] of Object.entries(meta)) {
    if (!EXCLUDED_FIELDS.has(key)) {
      result[key] = value
    }
  }
  return result
}

/**
 * Small claims demand letter → Small claims wizard
 *
 * Demand letter fields:        Wizard fields:
 * - plaintiff_name           → plaintiff.full_name
 * - plaintiff_address        → plaintiff.address
 * - defendant_name           → defendant.full_name
 * - defendant_address        → defendant.address
 * - description              → (carried as-is for facts)
 * - damages_items            → damage_items
 * - incident_date            → (carried as-is)
 * - deadline_days            → deadline_days
 * - preferred_resolution     → preferred_resolution
 */
function transformSmallClaims(dl: Meta): Meta {
  const result: Meta = {}

  // Party info → structured party objects
  if (dl.plaintiff_name || dl.plaintiff_address) {
    result.plaintiff = {
      full_name: (dl.plaintiff_name as string) ?? '',
      address: (dl.plaintiff_address as string) ?? '',
    }
  }
  if (dl.defendant_name || dl.defendant_address) {
    result.defendant = {
      full_name: (dl.defendant_name as string) ?? '',
      address: (dl.defendant_address as string) ?? '',
    }
  }

  // Damages items (field name differs slightly)
  if (dl.damages_items) {
    result.damage_items = dl.damages_items
  }

  // Direct carry-forward fields
  if (dl.description) result.description = dl.description
  if (dl.incident_date) result.incident_date = dl.incident_date
  if (dl.deadline_days) result.deadline_days = dl.deadline_days
  if (dl.preferred_resolution) result.preferred_resolution = dl.preferred_resolution
  // Mark that demand letter was sent (since it was completed)
  result.demand_letter_sent = true

  return result
}

/**
 * Landlord-tenant demand letter → LT wizard
 *
 * Demand letter fields:        Wizard fields:
 * - your_name               → your_info.full_name
 * - your_address            → your_info.address
 * - other_name              → opposing_parties[0].full_name
 * - other_address           → opposing_parties[0].address
 * - property_address        → (carried as-is)
 * - description             → description
 * - damages_items           → damages_items
 * - deadline_days           → deadline_days
 * - preferred_resolution    → preferred_resolution
 */
function transformLandlordTenant(dl: Meta): Meta {
  const result: Meta = {}

  if (dl.your_name || dl.your_address) {
    result.your_info = {
      full_name: (dl.your_name as string) ?? '',
      address: (dl.your_address as string) ?? '',
    }
  }
  if (dl.other_name || dl.other_address) {
    result.opposing_parties = [{
      full_name: (dl.other_name as string) ?? '',
      address: (dl.other_address as string) ?? '',
    }]
  }

  if (dl.property_address) result.property_address = dl.property_address
  if (dl.description) result.description = dl.description
  if (dl.damages_items) result.damages_items = dl.damages_items
  if (dl.deadline_days) result.deadline_days = dl.deadline_days
  if (dl.preferred_resolution) result.preferred_resolution = dl.preferred_resolution

  return result
}

/**
 * Personal injury demand letter → PI wizard
 *
 * Demand letter fields:            Wizard fields:
 * - your_name                    → your_info.full_name
 * - your_address                 → your_info.address
 * - defendant_name               → opposing_parties[0].full_name
 * - defendant_address            → opposing_parties[0].address
 * - incident_date                → incident_date
 * - incident_location            → incident_location
 * - incident_description         → description
 * - injuries_description         → injuries_description
 * - injury_severity              → injury_severity
 * - medical_providers            → medical_providers
 * - lost_wages                   → lost_wages
 * - property_damage              → property_damage
 * - insurance_carrier            → insurance_carrier
 * - policy_number                → policy_number
 * - claim_number                 → claim_number
 * - total_demand_amount          → amount_sought
 */
function transformPersonalInjury(dl: Meta): Meta {
  const result: Meta = {}

  if (dl.your_name || dl.your_address) {
    result.your_info = {
      full_name: (dl.your_name as string) ?? '',
      address: (dl.your_address as string) ?? '',
    }
  }
  if (dl.defendant_name || dl.defendant_address) {
    result.opposing_parties = [{
      full_name: (dl.defendant_name as string) ?? '',
      address: (dl.defendant_address as string) ?? '',
    }]
  }

  // Incident details
  if (dl.incident_date) result.incident_date = dl.incident_date
  if (dl.incident_location) result.incident_location = dl.incident_location
  if (dl.incident_description) result.description = dl.incident_description

  // Injury details
  if (dl.injuries_description) result.injuries_description = dl.injuries_description
  if (dl.injury_severity) result.injury_severity = dl.injury_severity
  if (dl.medical_providers) result.medical_providers = dl.medical_providers

  // Damages
  if (dl.lost_wages) result.lost_wages = dl.lost_wages
  if (dl.property_damage) result.property_damage = dl.property_damage
  if (dl.total_demand_amount) result.amount_sought = String(dl.total_demand_amount)

  // Insurance
  if (dl.insurance_carrier) result.insurance_carrier = dl.insurance_carrier
  if (dl.policy_number) result.policy_number = dl.policy_number
  if (dl.claim_number) result.claim_number = dl.claim_number

  return result
}

/**
 * Generic demand letter → Generic petition wizard
 *
 * Used for contract, property, real estate, business, and other dispute types
 * which use guided-step demand letters (not custom wizard components).
 * These demand letters store answers as `q_{n}` keys, so we carry forward
 * common fields that share the same names between demand letter and wizard.
 *
 * Demand letter fields:        Wizard fields:
 * - your_name               → your_info.full_name
 * - your_address            → your_info.address
 * - defendant_name          → opposing_parties[0].full_name
 * - defendant_address       → opposing_parties[0].address
 * - other_name              → opposing_parties[0].full_name (LT-style naming)
 * - other_address           → opposing_parties[0].address
 * - description             → description
 * - incident_date           → incident_date
 * - damages_items           → damages_items
 */
function transformGeneric(dl: Meta): Meta {
  const result: Meta = {}

  // Try both naming conventions for party info
  const yourName = (dl.your_name ?? dl.plaintiff_name) as string | undefined
  const yourAddress = (dl.your_address ?? dl.plaintiff_address) as string | undefined
  if (yourName || yourAddress) {
    result.your_info = {
      full_name: yourName ?? '',
      address: yourAddress ?? '',
    }
  }

  const oppName = (dl.defendant_name ?? dl.other_name) as string | undefined
  const oppAddress = (dl.defendant_address ?? dl.other_address) as string | undefined
  if (oppName || oppAddress) {
    result.opposing_parties = [{
      full_name: oppName ?? '',
      address: oppAddress ?? '',
    }]
  }

  if (dl.description) result.description = dl.description
  if (dl.incident_date) result.incident_date = dl.incident_date
  if (dl.damages_items) result.damages_items = dl.damages_items
  if (dl.deadline_days) result.deadline_days = dl.deadline_days
  if (dl.preferred_resolution) result.preferred_resolution = dl.preferred_resolution

  return result
}

/**
 * Transform demand letter metadata into petition/filing wizard format.
 * Dispatches to the appropriate transformer based on the filing task key.
 */
export function transformDemandLetterToFiling(
  demandLetterMeta: Meta,
  filingTaskKey: string,
): Meta {
  const dl = omitExcluded(demandLetterMeta)

  switch (filingTaskKey) {
    case 'prepare_small_claims_filing':
      return transformSmallClaims(dl)
    case 'prepare_landlord_tenant_filing':
      return transformLandlordTenant(dl)
    case 'prepare_pi_petition':
      return transformPersonalInjury(dl)
    // All other dispute types use generic transform
    case 'prepare_filing':
    case 'contract_prepare_filing':
    case 'property_prepare_filing':
    case 're_prepare_filing':
    case 'biz_partnership_prepare_filing':
    case 'biz_employment_prepare_filing':
    case 'biz_b2b_prepare_filing':
    case 'other_prepare_filing':
      return transformGeneric(dl)
    default:
      return transformGeneric(dl)
  }
}
