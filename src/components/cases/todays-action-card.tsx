'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Zap, Clock, RefreshCw } from 'lucide-react'
import type { TodaysAction } from '@/app/api/cases/todays-action/route'

export function TodaysActionCard() {
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
  }, [])

  if (loading) {
    return (
      <Card className="mb-6 border-calm-indigo/20 bg-calm-indigo/5">
        <CardContent className="py-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 w-32 bg-warm-border rounded" />
            <div className="h-5 w-64 bg-warm-border rounded" />
            <div className="h-4 w-48 bg-warm-border rounded" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="mb-6 border-warm-border">
        <CardContent className="py-6 text-center">
          <p className="text-warm-muted mb-3">
            We couldn&apos;t load your next step. Your cases are safe.
          </p>
          <Button variant="outline" size="sm" onClick={fetchAction}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try again
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!action || action.type === 'no_cases') {
    return (
      <Card className="mb-6 border-warm-border">
        <CardContent className="py-6 text-center">
          <p className="text-warm-muted mb-3">
            No cases yet. Let&apos;s get started — one step at a time.
          </p>
          <Button asChild>
            <Link href="/cases">Start a case</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (action.type === 'empty') {
    return (
      <Card className="mb-6 border-calm-green/20 bg-calm-green/5">
        <CardContent className="py-6 text-center">
          <p className="text-warm-muted">
            You&apos;re all caught up! No actions needed today.
          </p>
        </CardContent>
      </Card>
    )
  }

  const caseName = [action.caseName, action.county].filter(Boolean).join(' \u2022 ')

  function deadlineText() {
    if (action?.daysOverdue) {
      return action.daysOverdue === 1
        ? 'Due 1 day ago'
        : `Due ${action.daysOverdue} days ago`
    }
    if (action?.daysUntilDue !== undefined) {
      if (action.daysUntilDue === 0) return 'Due today'
      if (action.daysUntilDue === 1) return 'Due tomorrow'
      return `Due in ${action.daysUntilDue} days`
    }
    return null
  }

  const href = action.taskId
    ? `/case/${action.caseId}/step/${action.taskId}`
    : `/case/${action.caseId}`

  return (
    <Card className="mb-6 border-calm-indigo/20 bg-calm-indigo/5">
      <CardContent className="py-6">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="h-4 w-4 text-calm-indigo" />
          <span className="text-sm font-medium text-warm-muted uppercase tracking-wide">
            Your Next Step
          </span>
        </div>

        {caseName && (
          <p className="text-sm text-warm-muted mb-1">
            Case: &ldquo;{caseName}&rdquo;
          </p>
        )}

        <h3 className="text-lg font-semibold text-warm-text mb-1">
          {action.actionText}
        </h3>

        {deadlineText() && (
          <p className="flex items-center gap-1.5 text-sm text-calm-amber mb-4">
            <Clock className="h-3.5 w-3.5" />
            {deadlineText()}
          </p>
        )}

        {!deadlineText() && <div className="mb-4" />}

        <Button asChild className="group">
          <Link href={href}>
            Do this now
            <span
              className="inline-block ml-1 transition-transform duration-200 group-hover:translate-x-1"
              aria-hidden="true"
            >
              &rarr;
            </span>
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
