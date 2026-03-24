// Feature flags for gating new dispute type wizards
// Uses Vercel Flags SDK for edge-optimized flag evaluation

export const FEATURE_FLAGS = {
  // New dispute type wizards (Sprint 2)
  wizard_contract: false,
  wizard_property: false,
  wizard_real_estate: false,
  wizard_business: false,
  wizard_other: false,
} as const

export type FeatureFlag = keyof typeof FEATURE_FLAGS

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return FEATURE_FLAGS[flag]
}

// For use in server components
export async function getFeatureFlags(): Promise<Record<FeatureFlag, boolean>> {
  // Simple static flags for now - can be upgraded to Vercel Flags SDK
  // dynamic evaluation when per-user targeting is needed
  return { ...FEATURE_FLAGS }
}
