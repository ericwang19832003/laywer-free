'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import {
  CheckCircle2,
  Clock,
  Shield,
  FileText,
  FolderOpen,
  LayoutDashboard,
  Lightbulb,
} from 'lucide-react'
import { STEP_GUIDANCE } from '@/lib/step-guidance'

interface ContextSidebarProps {
  caseId: string
  tasks: { id: string; task_key: string }[]
  fallbackTaskKey: string | null
  deadline: {
    key: string
    due_at: string
  } | null
  riskScore: {
    overall_score: number
    risk_level: string
    breakdown: Record<string, unknown>
  } | null
}

function formatDeadlineKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function daysUntil(dateStr: string): number {
  const now = new Date()
  const due = new Date(dateStr)
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

function getRiskColor(level: string): string {
  switch (level) {
    case 'low': return 'bg-green-100 text-green-700'
    case 'moderate': return 'bg-amber-100 text-amber-700'
    case 'elevated': return 'bg-orange-100 text-orange-700'
    case 'high': return 'bg-red-100 text-red-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

export function ContextSidebar({ caseId, tasks, fallbackTaskKey, deadline, riskScore }: ContextSidebarProps) {
  const params = useParams()
  const taskId = params?.taskId as string | undefined

  // If on a step page, use that step's task_key; otherwise fall back
  const currentTaskKey = taskId
    ? tasks.find((t) => t.id === taskId)?.task_key ?? fallbackTaskKey
    : fallbackTaskKey

  const guidance = currentTaskKey ? STEP_GUIDANCE[currentTaskKey] : null

  return (
    <div className="flex flex-col gap-4 py-4 pl-2 pr-3">
      {/* Step Guide */}
      {guidance && (
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="h-4 w-4 text-calm-indigo" />
              <h3 className="text-xs font-semibold text-warm-muted uppercase tracking-wide">
                About This Step
              </h3>
            </div>
            <p className="text-sm text-warm-muted mb-3">{guidance.why}</p>
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-warm-text">Have ready:</p>
              {guidance.checklist.map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-warm-muted/60 mt-0.5 shrink-0" />
                  <span className="text-xs text-warm-muted">{item}</span>
                </div>
              ))}
            </div>
            {guidance.tip && (
              <div className="mt-3 rounded-md bg-calm-indigo/5 border border-calm-indigo/10 px-3 py-2">
                <p className="text-xs text-calm-indigo">{guidance.tip}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Next Deadline */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-warm-muted" />
            <h3 className="text-xs font-semibold text-warm-muted uppercase tracking-wide">
              Next Deadline
            </h3>
          </div>
          {deadline ? (() => {
            const days = daysUntil(deadline.due_at)
            const urgent = days <= 3
            return (
              <div>
                <p className="text-sm font-medium text-warm-text">
                  {formatDeadlineKey(deadline.key)}
                </p>
                <p className={`text-xs mt-0.5 ${urgent ? 'text-red-600 font-medium' : 'text-warm-muted'}`}>
                  {days <= 0 ? 'Overdue' : days === 1 ? 'Due tomorrow' : `In ${days} days`}
                </p>
              </div>
            )
          })() : (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-calm-green" />
              <span className="text-xs text-warm-muted">No upcoming deadlines</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Case Health */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-warm-muted" />
            <h3 className="text-xs font-semibold text-warm-muted uppercase tracking-wide">
              Case Health
            </h3>
          </div>
          {riskScore ? (
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getRiskColor(riskScore.risk_level)}`}>
                {riskScore.risk_level === 'low' ? 'Healthy' :
                 riskScore.risk_level === 'moderate' ? 'Moderate' :
                 riskScore.risk_level === 'elevated' ? 'Needs Attention' : 'At Risk'}
              </span>
              <span className="text-xs text-warm-muted">Score: {riskScore.overall_score}</span>
            </div>
          ) : (
            <p className="text-xs text-warm-muted">Complete more steps to unlock insights.</p>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <h3 className="text-xs font-semibold text-warm-muted uppercase tracking-wide mb-2">
            Quick Links
          </h3>
          <div className="space-y-1.5">
            <Link
              href={`/case/${caseId}`}
              className="flex items-center gap-2 text-xs text-warm-muted hover:text-warm-text transition-colors"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              Dashboard
            </Link>
            <Link
              href={`/case/${caseId}/evidence`}
              className="flex items-center gap-2 text-xs text-warm-muted hover:text-warm-text transition-colors"
            >
              <FolderOpen className="h-3.5 w-3.5" />
              Evidence Vault
            </Link>
            <Link
              href={`/case/${caseId}/case-file`}
              className="flex items-center gap-2 text-xs text-warm-muted hover:text-warm-text transition-colors"
            >
              <FileText className="h-3.5 w-3.5" />
              Case File
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
