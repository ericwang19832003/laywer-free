'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface CaseCardProps {
  id: string
  county: string | null
  role: string
  courtType: string | null
  disputeType: string | null
  createdAt: string
  healthScore: number | null
  tasksCompleted: number
  tasksTotal: number
  nextDeadline: string | null
  lastActivity: string | null
}

function healthColor(score: number | null): string {
  if (score === null) return 'bg-gray-100 text-gray-600'
  if (score >= 70) return 'bg-green-100 text-green-700'
  if (score >= 40) return 'bg-amber-100 text-amber-700'
  return 'bg-red-100 text-red-700'
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

const DISPUTE_LABELS: Record<string, string> = {
  debt_collection: 'Debt',
  landlord_tenant: 'Landlord/Tenant',
  personal_injury: 'Personal Injury',
  contract: 'Contract',
  property: 'Property',
  family: 'Family',
  other: 'Other',
}

export function CaseCard({
  id, county, role, courtType, disputeType, createdAt,
  healthScore, tasksCompleted, tasksTotal, nextDeadline, lastActivity,
}: CaseCardProps) {
  const displayCounty = county || 'County not set'
  const roleLabel = role === 'plaintiff' ? 'Plaintiff' : 'Defendant'
  const courtLabel = courtType === 'jp' ? 'JP' : courtType === 'county' ? 'County' : courtType === 'district' ? 'District' : courtType === 'federal' ? 'Federal' : null
  const disputeLabel = disputeType ? DISPUTE_LABELS[disputeType] ?? disputeType : null
  const percentage = tasksTotal > 0 ? Math.round((tasksCompleted / tasksTotal) * 100) : 0

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="py-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-medium text-warm-text">{displayCounty}</span>
              <Badge variant="secondary" className="text-xs">{roleLabel}</Badge>
              {courtLabel && <Badge variant="outline" className="text-xs">{courtLabel}</Badge>}
              {disputeLabel && <Badge variant="outline" className="text-xs">{disputeLabel}</Badge>}
            </div>
            <p className="text-xs text-warm-muted">
              Started {new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              {lastActivity && <> &middot; Active {timeAgo(lastActivity)}</>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`text-xs ${healthColor(healthScore)}`}>
              {healthScore !== null ? `${healthScore}%` : '\u2014'}
            </Badge>
            <Button asChild size="sm">
              <Link href={`/case/${id}`}>Continue</Link>
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-warm-muted">{tasksCompleted}/{tasksTotal} tasks</span>
              {nextDeadline && (
                <span className="text-xs text-calm-amber font-medium">
                  Due {relativeDate(nextDeadline)}
                </span>
              )}
            </div>
            <Progress value={percentage} className="h-1.5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
