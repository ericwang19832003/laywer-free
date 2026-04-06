'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { OnboardingFlow } from '@/components/onboarding/onboarding-flow'

export function CasesPageClient() {
  const router = useRouter()

  const handleComplete = useCallback((disputeType?: string) => {
    // Store selected dispute type so the new case dialog can pre-fill it
    if (disputeType) {
      try {
        sessionStorage.setItem('onboarding_dispute_type', disputeType)
      } catch {
        // sessionStorage unavailable
      }
    }
    // Refresh to show the empty state with New Case button
    router.refresh()
  }, [router])

  return (
    <OnboardingFlow onComplete={handleComplete} />
  )
}
