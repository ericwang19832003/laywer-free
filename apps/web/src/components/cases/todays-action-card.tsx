'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import type { TodaysAction } from '@/app/api/cases/todays-action/route'

export function TodaysActionCard({ refreshKey }: { refreshKey?: number }) {
  const [action, setAction] = useState<TodaysAction | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  async function fetchAction() {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch('/api/cases/todays-action')
      if (!res.ok) throw new Error('Failed to fetch')
      const data: TodaysAction = await res.json()
      setAction(data)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAction()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey])

  if (loading) {
    return (
      <div className="mb-6 rounded-xl bg-calm-indigo/10 animate-pulse h-36" />
    )
  }

  if (error) {
    return (
      <div className="mb-6 rounded-xl border border-warm-border bg-white p-6 text-center">
        <p className="text-warm-muted mb-3 text-sm">
          We couldn&apos;t load your next step. Your cases are safe.
        </p>
        <Button variant="outline" size="sm" onClick={fetchAction}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Try again
        </Button>
      </div>
    )
  }

  if (!action || action.type === 'no_cases') {
    return (
      <div className="mb-6 rounded-xl border border-warm-border bg-white p-6 text-center">
        <p className="text-warm-muted mb-3 text-sm">
          No cases yet. Let&apos;s get started — one step at a time.
        </p>
        <Button asChild size="sm">
          <Link href="/cases">Start a case</Link>
        </Button>
      </div>
    )
  }

  if (action.type === 'empty') {
    return (
      <div className="mb-6 rounded-xl border border-calm-green/30 bg-calm-green/5 p-6 text-center">
        <p className="text-warm-muted text-sm">
          You&apos;re all caught up. No actions needed today.
        </p>
      </div>
    )
  }

  const caseTypeLabel = action.caseType
    ? action.caseType.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : null
  const contextLabel = ['YOUR NEXT STEP', caseTypeLabel].filter(Boolean).join(' · ')

  const href = action.taskId
    ? `/case/${action.caseId}/step/${action.taskId}`
    : `/case/${action.caseId}`

  const daysLeft = action.daysUntilDue
  const isOverdue = action.daysOverdue !== undefined && action.daysOverdue > 0
  const dayNumber = isOverdue ? action.daysOverdue : daysLeft

  const deadlineText = () => {
    if (isOverdue) return action.daysOverdue === 1 ? 'overdue by 1 day' : `overdue by ${action.daysOverdue} days`
    if (daysLeft === 0) return 'due today'
    if (daysLeft === 1) return 'due tomorrow'
    if (daysLeft !== undefined) return `due in ${daysLeft} days`
    return null
  }

  return (
    <div className="mb-6 rounded-xl bg-calm-indigo text-white overflow-hidden">
      <div className="p-6 flex items-center gap-6">
        {/* Countdown number */}
        {dayNumber !== undefined && (
          <div className="shrink-0 text-center w-16">
            <p className={`text-5xl font-bold tabular-nums leading-none ${isOverdue ? 'text-calm-amber' : 'text-white'}`}>
              {dayNumber}
            </p>
            <p className="text-xs font-medium text-white/60 uppercase tracking-wider mt-1">
              {isOverdue ? 'days\nover' : 'days\nleft'}
            </p>
          </div>
        )}

        {/* Divider */}
        {dayNumber !== undefined && (
          <div className="w-px h-16 bg-white/20 shrink-0" />
        )}

        {/* Action content */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-white/60 uppercase tracking-wider mb-1">
            {contextLabel}
          </p>
          <h3 className="text-lg font-semibold text-white leading-snug mb-1">
            {action.actionText}
          </h3>
          {deadlineText() && (
            <p className="text-sm text-calm-amber">
              {deadlineText()}
              {action.county ? ` · ${action.county} County` : ''}
            </p>
          )}
        </div>

        {/* CTA */}
        <div className="shrink-0">
          <Link
            href={href}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 hover:bg-white/25 transition-colors px-4 py-2.5 text-sm font-medium text-white"
          >
            Do this now
            <span aria-hidden="true" className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
