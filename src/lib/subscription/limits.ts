export const TIER_LIMITS = {
  free: {
    maxCases: 1,
    aiGenerationsPerMonth: 5,
    aiModel: 'gpt-4o-mini',
    discovery: false,
    trialBinders: false,
    research: 3,
    emailIntegration: false,
    caseSharing: false,
    attorneyReview: false,
    smsReminders: false,
  },
  essentials: {
    maxCases: Infinity,
    aiGenerationsPerMonth: Infinity,
    aiModel: 'gpt-4o-mini',
    discovery: false,
    trialBinders: false,
    research: Infinity,
    emailIntegration: false,
    caseSharing: true,
    attorneyReview: false,
    smsReminders: true,
  },
  pro: {
    maxCases: Infinity,
    aiGenerationsPerMonth: Infinity,
    aiModel: 'gpt-4o',
    discovery: true,
    trialBinders: true,
    research: Infinity,
    emailIntegration: true,
    caseSharing: true,
    attorneyReview: false,
    smsReminders: true,
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
  'guided_steps',
  'citation_verification',
]

// Pricing display info
export const TIER_PRICING = {
  free: { monthly: 0, label: 'Free' },
  essentials: { monthly: 19, oneTime: 149, label: 'Essentials' },
  pro: { monthly: 39, label: 'Pro' },
} as const
