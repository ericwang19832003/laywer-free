export const TIER_LIMITS = {
  free: {
    maxCases: 1,
    aiGenerationsPerMonth: 5,
    discovery: false,
    trialBinders: false,
    research: 3,  // queries per month
    emailIntegration: false,
    caseSharing: false,
    attorneyReview: false,
  },
  pro: {
    maxCases: 3,
    aiGenerationsPerMonth: Infinity,
    discovery: true,
    trialBinders: true,
    research: Infinity,
    emailIntegration: true,
    caseSharing: true,
    attorneyReview: false,
  },
  premium: {
    maxCases: Infinity,
    aiGenerationsPerMonth: Infinity,
    discovery: true,
    trialBinders: true,
    research: Infinity,
    emailIntegration: true,
    caseSharing: true,
    attorneyReview: true,
  },
} as const

export type SubscriptionTier = keyof typeof TIER_LIMITS
export type Feature = keyof typeof TIER_LIMITS.free

// Features that are NEVER gated (safety-critical)
export const NEVER_GATED: string[] = [
  'deadline_tracking',
  'basic_wizard',
  'fee_waiver_info',
  'court_directory',
  'case_dashboard',
  'health_score',
]
