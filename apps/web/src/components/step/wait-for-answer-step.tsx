'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

interface WaitForAnswerStepProps {
  caseId: string
  taskId: string
  dueAt: string | null
}

function daysUntil(dateStr: string): number {
  const now = new Date()
  const due = new Date(dateStr)
  const diffMs = due.getTime() - now.getTime()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function WaitForAnswerStep({ caseId, taskId, dueAt }: WaitForAnswerStepProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const deadlinePassed = dueAt ? new Date(dueAt) <= new Date() : false
  const remaining = dueAt ? daysUntil(dueAt) : null

  async function handleContinue() {
    setLoading(true)
    try {
      // Transition task to in_progress then completed
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'in_progress' }),
      })
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      })

      // Run gatekeeper to unlock next tasks
      await fetch(`/api/cases/${caseId}/rules/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      router.push(`/case/${caseId}`)
      router.refresh()
    } catch {
      setLoading(false)
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

      <h1 className="text-2xl font-semibold text-warm-text mb-1">
        Wait for Answer Deadline
      </h1>
      <p className="text-warm-muted mb-8">
        The other side has a limited time to respond to your lawsuit. Here&apos;s what to expect.
      </p>

      <Card>
        <CardContent className="pt-6">
          {dueAt ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-warm-muted">
                  Answer deadline
                </p>
                <p className="text-lg text-warm-text mt-0.5">
                  {formatDate(dueAt)}
                </p>
              </div>

              {deadlinePassed ? (
                <>
                  <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3">
                    <p className="text-sm text-amber-800">
                      The answer deadline has passed. It&apos;s time to check the court
                      docket to see if an answer was filed.
                    </p>
                  </div>
                  <Button onClick={handleContinue} disabled={loading}>
                    {loading ? 'Processing...' : 'Continue to Next Step'}
                  </Button>
                </>
              ) : (
                <div className="rounded-md border border-warm-border bg-warm-surface px-4 py-3">
                  <p className="text-sm text-warm-text">
                    {remaining !== null && remaining > 0
                      ? `${remaining} day${remaining === 1 ? '' : 's'} remaining. `
                      : ''}
                    We&apos;ll let you know when it&apos;s time to check the docket.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-warm-muted">
              No deadline date set. Please go back and confirm your answer deadline first.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
