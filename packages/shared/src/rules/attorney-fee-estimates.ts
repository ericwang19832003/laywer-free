export interface FeeEstimate {
  lowEnd: number    // dollars
  highEnd: number   // dollars
  source: string    // e.g. "Texas Bar Association survey, Harris County average"
}

const ATTORNEY_FEE_ESTIMATES: Record<string, FeeEstimate> = {
  debt_collection: { lowEnd: 1500, highEnd: 3000, source: 'Texas consumer defense attorney average' },
  landlord_tenant: { lowEnd: 1000, highEnd: 2500, source: 'Texas tenant rights attorney average' },
  personal_injury: { lowEnd: 5000, highEnd: 15000, source: 'Texas PI contingency fee (33% of typical settlement)' },
  family: { lowEnd: 3000, highEnd: 10000, source: 'Texas family law attorney average' },
  small_claims: { lowEnd: 500, highEnd: 1500, source: 'Texas small claims representation average' },
  contract: { lowEnd: 2000, highEnd: 5000, source: 'Texas civil litigation attorney average' },
  property: { lowEnd: 2000, highEnd: 5000, source: 'Texas property dispute attorney average' },
  real_estate: { lowEnd: 3000, highEnd: 8000, source: 'Texas real estate litigation average' },
  business: { lowEnd: 5000, highEnd: 15000, source: 'Texas business litigation attorney average' },
  other: { lowEnd: 2000, highEnd: 5000, source: 'Texas civil attorney average' },
}

export function getAttorneyFeeEstimate(disputeType: string): FeeEstimate {
  return ATTORNEY_FEE_ESTIMATES[disputeType] ?? ATTORNEY_FEE_ESTIMATES.other
}

export function formatSavingsMessage(disputeType: string, userSpent: number): string {
  const fees = getAttorneyFeeEstimate(disputeType)
  const savedLow = fees.lowEnd - userSpent
  const savedHigh = fees.highEnd - userSpent
  if (savedLow <= 0) return ''
  return `Based on typical Texas attorney rates, this case would have cost $${fees.lowEnd.toLocaleString()}-$${fees.highEnd.toLocaleString()} with a lawyer. You saved $${savedLow.toLocaleString()}-$${savedHigh.toLocaleString()}.`
}
