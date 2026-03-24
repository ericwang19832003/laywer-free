'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SkipForward } from 'lucide-react'

interface SkipStepBannerProps {
  caseId: string
  taskId: string
}

export function SkipStepBanner({ caseId, taskId }: SkipStepBannerProps) {
  const router = useRouter()
  const [skipping, setSkipping] = useState(false)

  async function handleSkip() {
    if (skipping) return
    setSkipping(true)
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'skipped',
          metadata: { skip_reason: 'user_skipped_from_step_page' },
        }),
      })
      if (!res.ok) throw new Error('Failed to skip')
      router.push(`/case/${caseId}`)
      router.refresh()
    } catch {
      setSkipping(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 mb-0 -mt-2">
      <button
        onClick={handleSkip}
        disabled={skipping}
        className="inline-flex items-center gap-1.5 text-sm text-warm-muted hover:text-warm-text transition-colors duration-150"
      >
        <SkipForward className="size-3.5" />
        {skipping ? 'Skipping...' : 'Already done this? Skip this step'}
      </button>
    </div>
  )
}
