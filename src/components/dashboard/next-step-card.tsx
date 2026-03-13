'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const SKIPPABLE_TASKS = new Set([
  'prepare_pi_demand_letter',
  'pi_settlement_negotiation',
  'sc_demand_letter',
  're_demand_letter',
  'prepare_lt_demand_letter',
  'preservation_letter',
])

interface NextStepCardProps {
  caseId: string
  nextTask: {
    id: string
    task_key: string
    title: string
    status: string
  } | null
  taskDescription?: { description: string; importance: 'critical' | 'important' | 'helpful' } | null
}

export function NextStepCard({ caseId, nextTask, taskDescription }: NextStepCardProps) {
  const router = useRouter()
  const [skipping, setSkipping] = useState(false)

  async function handleSkip() {
    if (!nextTask || skipping) return
    setSkipping(true)
    try {
      // Transition directly to skipped (todo -> skipped is a valid transition)
      const res = await fetch(`/api/tasks/${nextTask.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'skipped',
          metadata: { skip_reason: 'already_filed_petition' },
        }),
      })
      if (!res.ok) throw new Error('Failed to skip')
      router.refresh()
    } catch {
      setSkipping(false)
    }
  }
  if (!nextTask) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-warm-text">Today&apos;s Next Step</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-warm-muted">You&apos;re all caught up. Nice work!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-calm-indigo/20 bg-calm-indigo/5">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-warm-muted uppercase tracking-wide">
          Today&apos;s Next Step
        </CardTitle>
      </CardHeader>
      <CardContent>
        <h3 className="text-lg font-semibold text-warm-text mb-1">{nextTask.title}</h3>
        {taskDescription ? (
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                taskDescription.importance === 'critical'
                  ? 'bg-red-100 text-red-700'
                  : taskDescription.importance === 'important'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {taskDescription.importance === 'critical' ? 'Critical' :
                 taskDescription.importance === 'important' ? 'Important' : 'Helpful'}
              </span>
            </div>
            <p className="text-sm text-warm-muted">{taskDescription.description}</p>
          </div>
        ) : (
          <p className="text-sm text-warm-muted mb-4">
            This helps us organize your documents and timeline.
          </p>
        )}
        <Button size="lg" asChild className="w-full group">
          <Link href={`/case/${caseId}/step/${nextTask.id}`}>
            Review &amp; Continue
            <span className="inline-block transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true">→</span>
          </Link>
        </Button>
        {SKIPPABLE_TASKS.has(nextTask.task_key) && (
          <button
            onClick={handleSkip}
            disabled={skipping}
            className="mt-2 text-sm text-warm-muted hover:text-warm-text transition-colors"
          >
            {skipping ? 'Skipping...' : 'Already done this? Skip this step'}
          </button>
        )}
      </CardContent>
    </Card>
  )
}
