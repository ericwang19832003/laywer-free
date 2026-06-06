'use client'

import Link from 'next/link'
import { getDisputeLabel, getCourtLabel } from '@/lib/labels'
import { getHealthLabel } from '@/lib/health-labels'
import { ArrowRight } from 'lucide-react'

interface CaseCardProps {
  id: string
  county: string | null
  role: string
  courtType: string | null
  disputeType: string | null
  piSubType: string | null
  createdAt: string
  healthScore: number | null
  tasksCompleted: number
  tasksTotal: number
  nextDeadline: string | null
  lastActivity: string | null
  nextAction?: string | null
}

function relativeDeadline(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffDays = Math.round((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`
  if (diffDays === 0) return 'today'
  if (diffDays === 1) return 'tomorrow'
  if (diffDays <= 7) return `in ${diffDays} days`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function CircularProgress({ percentage, healthScore, colorClass }: { percentage: number; healthScore: number | null; colorClass: string }) {
  const size = 48
  const strokeWidth = 3.5
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-warm-border"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={colorClass}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-xs font-semibold tabular-nums ${colorClass}`}>
          {healthScore !== null ? healthScore : `${percentage}%`}
        </span>
      </div>
    </div>
  )
}

export function CaseCard({
  id, county, role, courtType, disputeType, piSubType,
  healthScore, tasksCompleted, tasksTotal, nextDeadline, nextAction,
}: CaseCardProps) {
  const healthInfo = getHealthLabel(healthScore)
  const courtLabel = getCourtLabel(courtType) || null
  const roleLabel = role === 'plaintiff' ? 'Plaintiff' : 'Defendant'
  const disputeLabel = disputeType ? getDisputeLabel(disputeType, piSubType) : null
  const percentage = tasksTotal > 0 ? Math.round((tasksCompleted / tasksTotal) * 100) : 0

  const displayName = disputeLabel
    ? `${disputeLabel}${piSubType ? '' : ''} ${roleLabel === 'Defendant' ? 'defense' : 'claim'}`
    : county
    ? `${county} County`
    : 'Case'
  const displayLocation = [county ? `${county} County` : null, courtLabel].filter(Boolean).join(' · ')

  const isDeadlineUrgent = nextDeadline
    ? Math.round((new Date(nextDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) <= 7
    : false

  const progressColorClass = healthScore !== null && healthScore >= 70
    ? 'text-calm-green'
    : healthScore !== null && healthScore >= 40
    ? 'text-calm-amber'
    : healthScore !== null
    ? 'text-destructive'
    : 'text-warm-muted'

  return (
    <Link href={`/case/${id}`} className="block group">
      <div className="rounded-xl border border-warm-border bg-white px-5 py-4 hover:border-calm-indigo/30 hover:shadow-sm transition-all">
        <div className="flex items-center gap-4">
          {/* Case identity */}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-warm-text truncate capitalize">{displayName}</p>
            <p className="text-xs text-warm-muted mt-0.5">{displayLocation}</p>
            {nextAction && (
              <p className="text-xs text-warm-text mt-1.5">
                <span className="text-warm-muted">Next: </span>
                <span className="font-medium">{nextAction}</span>
                {nextDeadline && (
                  <span className={`ml-2 inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                    isDeadlineUrgent ? 'bg-calm-amber/10 text-calm-amber' : 'bg-warm-border text-warm-muted'
                  }`}>
                    {relativeDeadline(nextDeadline)}
                  </span>
                )}
              </p>
            )}
          </div>

          {/* Circular progress ring */}
          <CircularProgress
            percentage={percentage}
            healthScore={healthScore}
            colorClass={progressColorClass}
          />

          <ArrowRight className="h-4 w-4 text-warm-muted shrink-0 group-hover:text-calm-indigo transition-colors" />
        </div>
      </div>
    </Link>
  )
}
