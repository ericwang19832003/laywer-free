import type { SupabaseClient } from '@supabase/supabase-js'
import { TIER_LIMITS, type SubscriptionTier, type Feature } from './limits'

export interface SubscriptionInfo {
  tier: SubscriptionTier
  canAccess: (feature: Feature) => boolean
  aiRemaining: number
  casesRemaining: number
}

export async function getSubscription(
  supabase: SupabaseClient,
  userId: string
): Promise<SubscriptionInfo> {
  const { data: sub } = await supabase
    .from('user_subscriptions')
    .select('tier, current_period_end')
    .eq('user_id', userId)
    .single()

  const tier: SubscriptionTier = (sub?.tier as SubscriptionTier) ?? 'free'

  // Check if subscription expired
  const isExpired = sub?.current_period_end && new Date(sub.current_period_end) < new Date()
  const effectiveTier = isExpired ? 'free' : tier

  const limits = TIER_LIMITS[effectiveTier]

  // Get AI usage for current month
  const month = new Date().toISOString().slice(0, 7)
  const { data: usage } = await supabase
    .from('ai_usage')
    .select('generation_count')
    .eq('user_id', userId)
    .eq('month', month)
    .maybeSingle()

  const aiUsed = usage?.generation_count ?? 0

  // Get case count
  const { count: caseCount } = await supabase
    .from('cases')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .neq('status', 'archived')

  return {
    tier: effectiveTier,
    canAccess: (feature: Feature) => !!limits[feature],
    aiRemaining: limits.aiGenerationsPerMonth === Infinity
      ? Infinity
      : Math.max(0, limits.aiGenerationsPerMonth - aiUsed),
    casesRemaining: limits.maxCases === Infinity
      ? Infinity
      : Math.max(0, limits.maxCases - (caseCount ?? 0)),
  }
}

export async function hasOneTimePurchase(
  supabase: SupabaseClient,
  userId: string,
  caseId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from('one_time_purchases')
    .select('id')
    .eq('user_id', userId)
    .eq('case_id', caseId)
    .maybeSingle()
  return !!data
}

export function gateResponse(feature: string, tier: SubscriptionTier) {
  return {
    error: 'upgrade_required',
    message: `This feature requires an ${tier === 'free' ? 'Essentials' : 'Pro'} plan.`,
    feature,
    currentTier: tier,
    upgradeUrl: '/pricing',
  }
}

export async function incrementAiUsage(
  supabase: SupabaseClient,
): Promise<void> {
  const month = new Date().toISOString().slice(0, 7)
  await supabase.rpc('increment_ai_usage', { p_month: month })
}
