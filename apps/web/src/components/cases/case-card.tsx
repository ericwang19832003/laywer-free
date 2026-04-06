'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ArrowRight } from 'lucide-react'
import { getDisputeLabel, getCourtLabel } from '@/lib/labels'
import { getHealthLabel } from '@/lib/health-labels'

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
}

function relativeDate(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffDays = Math.round((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'today'
  if (diffDays === 1) return 'tomorrow'
  if (diffDays > 1 && diffDays <= 7) return `in ${diffDays} days`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)
  if (diffHours < 1) return 'just now'
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return '1d ago'
  if (diffDays < 30) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function CaseCard({
  id, county, role, courtType, disputeType, piSubType, createdAt,
  healthScore, tasksCompleted, tasksTotal, nextDeadline, lastActivity,
}: CaseCardProps) {
  const healthInfo = getHealthLabel(healthScore)
  const displayCounty = county ? `${county} County` : 'County not set'
  const courtLabel = getCourtLabel(courtType) || null
  const roleLabel = role === 'plaintiff' ? 'Plaintiff' : 'Defendant'
  const disputeLabel = disputeType ? getDisputeLabel(disputeType, piSubType) : null
  const percentage = tasksTotal > 0 ? Math.round((tasksCompleted / tasksTotal) * 100) : 0

  return (
    <Link href={`/case/${id}`} className="block">
      <Card className="bg-white hover:shadow-sm transition-shadow">
        <CardContent className="py-4 px-5">
          <div className="flex items-center gap-4">
            {/* Health score */}
            <div className="shrink-0 text-center w-14">
              <p className={`text-lg font-semibold ${healthInfo.colorClass}`}>
                {healthScore !== null ? healthScore : '\u2014'}
              </p>
              <p className={`text-[10px] ${healthInfo.colorClass}`}>
                {healthInfo.label}
              </p>
            </div>

            {/* Case identity */}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-warm-text truncate">
                {displayCounty}{courtLabel ? ` · ${courtLabel}` : ''}
              </p>
              <p className="text-xs text-warm-muted">
                {roleLabel}{disputeLabel ? ` · ${disputeLabel}` : ''} · Started {new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                {lastActivity && <> · {timeAgo(lastActivity)}</>}
              </p>
            </div>

            {/* Progress */}
            <div className="shrink-0 w-32 hidden sm:block">
              <div className="flex items-center justify-between text-xs text-warm-muted mb-1">
                <span>{tasksCompleted}/{tasksTotal}</span>
                {nextDeadline && (
                  <span className="text-amber-600 font-medium">{relativeDate(nextDeadline)}</span>
                )}
              </div>
              <Progress value={percentage} className="h-1.5" />
            </div>

            <ArrowRight className="h-4 w-4 text-warm-muted shrink-0" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
