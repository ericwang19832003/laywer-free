'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SkipForward } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

interface StepRunnerProps {
  caseId: string
  taskId: string
  title: string
  reassurance: string
  children: React.ReactNode
  reviewContent?: React.ReactNode
  onConfirm: () => Promise<void>
  onSave?: () => Promise<void>
  skipReview?: boolean
  onBeforeReview?: () => Promise<void>
  reviewButtonLabel?: string
  wrapperClassName?: string
  skippable?: boolean
}

export function StepRunner({
  caseId,
  taskId,
  title,
  reassurance,
  children,
  reviewContent,
  onConfirm,
  onSave,
  skipReview = false,
  onBeforeReview,
  reviewButtonLabel,
  wrapperClassName,
  skippable = false,
}: StepRunnerProps) {
  const [phase, setPhase] = useState<'input' | 'review'>('input')
  const [loading, setLoading] = useState(false)
  const [skipping, setSkipping] = useState(false)
  const router = useRouter()

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

  async function handleConfirm() {
    setLoading(true)
    try {
      await onConfirm()
      router.push(`/case/${caseId}`)
      router.refresh()
    } catch {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (onSave) {
      setLoading(true)
      try {
        await onSave()
        router.push(`/case/${caseId}`)
        router.refresh()
      } catch {
        setLoading(false)
      }
    }
  }

  return (
    <div className={wrapperClassName ?? "max-w-2xl mx-auto px-4 py-8"}>
      <Link
        href={`/case/${caseId}`}
        className="text-sm text-warm-muted hover:text-warm-text mb-6 inline-block"
      >
        &larr; Back to dashboard
      </Link>

      <h1 className="text-2xl font-semibold text-warm-text mb-1">{title}</h1>
      <p className="text-warm-muted mb-8">{reassurance}</p>

      <Card>
        <CardContent className="pt-6">
          {phase === 'input' ? (
            <>
              {children}
              <div className="mt-6 flex flex-col gap-3">
                {skipReview ? (
                  <Button className="h-11 px-6 text-base" onClick={handleConfirm} disabled={loading}>
                    {loading ? 'Saving...' : "I'm ready"}
                  </Button>
                ) : (
                  <Button
                    className="h-11 px-6 text-base group"
                    onClick={async () => {
                      if (onBeforeReview) {
                        setLoading(true)
                        try {
                          await onBeforeReview()
                          setPhase('review')
                        } finally {
                          setLoading(false)
                        }
                      } else {
                        setPhase('review')
                      }
                    }}
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : (reviewButtonLabel ?? 'Review')}
                    {!loading && <span className="inline-block transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true">→</span>}
                  </Button>
                )}
                {onSave && !skipReview && (
                  <button
                    onClick={handleSave}
                    className="text-sm text-warm-muted hover:text-calm-indigo transition-colors duration-150"
                    disabled={loading}
                  >
                    Save and come back later
                  </button>
                )}
                {skippable && (
                  <button
                    onClick={handleSkip}
                    disabled={skipping}
                    className="inline-flex items-center justify-center gap-1.5 text-sm text-warm-muted/70 hover:text-warm-muted transition-colors duration-150 pt-1"
                  >
                    <SkipForward className="size-3" />
                    {skipping ? 'Skipping...' : 'Already done this? Skip'}
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-lg font-medium text-warm-text mb-4">
                  Review your answers
                </h2>
                {reviewContent}
              </div>
              <div className="flex flex-col gap-3">
                <Button className="h-11 px-6 text-base group" onClick={handleConfirm} disabled={loading}>
                  {loading ? 'Saving...' : 'Confirm & Continue'}
                  {!loading && <span className="inline-block transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true">→</span>}
                </Button>
                <button
                  onClick={() => setPhase('input')}
                  className="text-sm text-warm-muted hover:text-calm-indigo transition-colors duration-150"
                  disabled={loading}
                >
                  &larr; Back to edit
                </button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
