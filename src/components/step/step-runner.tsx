'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
}: StepRunnerProps) {
  const [phase, setPhase] = useState<'input' | 'review'>('input')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

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
    <div className="max-w-2xl mx-auto px-4 py-8">
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
                  <Button onClick={handleConfirm} disabled={loading}>
                    {loading ? 'Saving...' : "I'm ready"}
                  </Button>
                ) : (
                  <Button
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
                    {loading ? 'Processing...' : (reviewButtonLabel ?? 'Review \u2192')}
                  </Button>
                )}
                {onSave && !skipReview && (
                  <button
                    onClick={handleSave}
                    className="text-sm text-warm-muted hover:text-warm-text"
                    disabled={loading}
                  >
                    Save and come back later
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
                <Button onClick={handleConfirm} disabled={loading}>
                  {loading ? 'Saving...' : 'Confirm & Continue'}
                </Button>
                <button
                  onClick={() => setPhase('input')}
                  className="text-sm text-warm-muted hover:text-warm-text"
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
