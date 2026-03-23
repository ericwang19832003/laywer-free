'use client'

import { useRouter } from 'next/navigation'
import { OnboardingFlow } from '@/components/onboarding/onboarding-flow'

export function CasesPageClient() {
  const router = useRouter()

  return (
    <OnboardingFlow
      onComplete={() => {
        // Refresh the page — onboarding is now complete, so the server
        // will show either the empty state (with New Case button) or cases list
        router.refresh()
      }}
    />
  )
}
