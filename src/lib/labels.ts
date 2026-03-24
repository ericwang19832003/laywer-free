import { isPropertyDamageSubType } from '@/lib/guided-steps/personal-injury/constants'

export const DISPUTE_LABELS: Record<string, string> = {
  debt_collection: 'Debt Collection',
  landlord_tenant: 'Landlord/Tenant',
  personal_injury: 'Personal Injury',
  contract: 'Contract',
  property: 'Property',
  family: 'Family',
  small_claims: 'Small Claims',
  other: 'Other',
}

export const COURT_LABELS: Record<string, string> = {
  jp: 'Justice Court',
  county: 'County Court',
  district: 'District Court',
  federal: 'Federal Court',
}

/**
 * Returns a user-friendly dispute type label.
 * For PI cases with a property damage sub-type, returns "Property Damage".
 */
export function getDisputeLabel(disputeType: string | null, piSubType?: string | null): string {
  if (!disputeType) return 'Unknown'
  if (disputeType === 'personal_injury' && isPropertyDamageSubType(piSubType ?? undefined)) {
    return 'Property Damage'
  }
  return DISPUTE_LABELS[disputeType] ?? disputeType
}

/**
 * Returns a user-friendly court type label.
 */
export function getCourtLabel(courtType: string | null): string {
  if (!courtType) return ''
  return COURT_LABELS[courtType] ?? courtType
}
