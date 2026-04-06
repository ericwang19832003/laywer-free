// Cards that are always in the priority section (top 5-6)
const UNIVERSAL_PRIORITY_CARDS = [
  'priority_alerts',
  'next_step',
  'deadlines',
  'progress',
  'case_health',
] as const

// Type-specific cards that get promoted to priority section
const TYPE_SPECIFIC_PRIORITY: Record<string, string[]> = {
  personal_injury: ['sol_banner'],
  debt_collection: ['sol_banner'],
  landlord_tenant: ['filing_instructions'],
  family: ['filing_instructions'],
  small_claims: ['filing_instructions'],
  contract: ['sol_banner'],
  property: [],
  real_estate: [],
  business: [],
  other: [],
}

export function getPriorityCards(disputeType: string): string[] {
  return [
    ...UNIVERSAL_PRIORITY_CARDS,
    ...(TYPE_SPECIFIC_PRIORITY[disputeType] ?? []),
  ]
}

export function isSecondaryCard(disputeType: string, cardName: string): boolean {
  return !getPriorityCards(disputeType).includes(cardName)
}
