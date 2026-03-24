'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { SubscriptionTier } from '@lawyer-free/shared/subscription/limits'

interface ClientSubscription {
  tier: SubscriptionTier
  aiRemaining: number
  casesRemaining: number
  loading: boolean
}

export function useSubscription(): ClientSubscription {
  const [sub, setSub] = useState<ClientSubscription>({
    tier: 'free', aiRemaining: 5, casesRemaining: 1, loading: true,
  })

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: subData } = await supabase
        .from('user_subscriptions')
        .select('tier')
        .eq('user_id', user.id)
        .single()

      const month = new Date().toISOString().slice(0, 7)
      const { data: usage } = await supabase
        .from('ai_usage')
        .select('generation_count')
        .eq('user_id', user.id)
        .eq('month', month)
        .maybeSingle()

      const { count: caseCount } = await supabase
        .from('cases')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .neq('status', 'archived')

      const tier = (subData?.tier as SubscriptionTier) ?? 'free'
      const { TIER_LIMITS } = await import('@/lib/subscription/limits')
      const limits = TIER_LIMITS[tier]

      setSub({
        tier,
        aiRemaining: limits.aiGenerationsPerMonth === Infinity
          ? Infinity
          : Math.max(0, limits.aiGenerationsPerMonth - (usage?.generation_count ?? 0)),
        casesRemaining: limits.maxCases === Infinity
          ? Infinity
          : Math.max(0, limits.maxCases - (caseCount ?? 0)),
        loading: false,
      })
    }
    load()
  }, [])

  return sub
}
