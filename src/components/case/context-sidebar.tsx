'use client'

import { useParams } from 'next/navigation'
import {
  Clock,
  Shield,
  Lightbulb,
} from 'lucide-react'
import { STEP_GUIDANCE } from '@/lib/step-guidance'
import { isPropertyDamageSubType } from '@/lib/guided-steps/personal-injury/constants'

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
  disputeType?: string
  piSubType?: string
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

export function ContextSidebar({ caseId, tasks, fallbackTaskKey, deadline, riskScore, disputeType, piSubType }: ContextSidebarProps) {
  const params = useParams()
  const taskId = params?.taskId as string | undefined

  // If on a step page, use that step's task_key; otherwise fall back
  const currentTaskKey = taskId
    ? tasks.find((t) => t.id === taskId)?.task_key ?? fallbackTaskKey
    : fallbackTaskKey

  const isPropertyDamage = disputeType === 'personal_injury' && isPropertyDamageSubType(piSubType)
  const guidanceKey = currentTaskKey
    ? (isPropertyDamage && STEP_GUIDANCE[currentTaskKey + '_property']
        ? currentTaskKey + '_property'
        : currentTaskKey)
    : null
  const guidance = guidanceKey ? STEP_GUIDANCE[guidanceKey] : null

  return (
    <div className="flex flex-col py-4 px-3.5 space-y-4">
      {/* About This Step */}
      {guidance && (
        <div className="rounded-xl bg-calm-indigo/[0.03] border border-calm-indigo/10 p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Lightbulb className="h-3.5 w-3.5 text-calm-indigo" />
            <h3 className="text-xs font-medium text-calm-indigo">
              About This Step
            </h3>
          </div>
          <p className="text-xs text-warm-muted leading-relaxed mb-2">{guidance.why}</p>
          <div className="space-y-1">
            <p className="text-xs font-medium text-warm-text">Have ready:</p>
            {guidance.checklist.map((item, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-calm-indigo/40 mt-1.5 shrink-0" />
                <span className="text-xs text-warm-muted leading-snug">{item}</span>
              </div>
            ))}
          </div>
          {guidance.tip && (
            <div className="mt-2 rounded-lg bg-calm-indigo/[0.06] px-2.5 py-2">
              <p className="text-xs text-calm-indigo leading-snug">{guidance.tip}</p>
            </div>
          )}
        </div>
      )}

      {/* Next Deadline */}
      <div className="rounded-lg bg-warm-bg/80 px-3 py-2.5">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Clock className="h-3.5 w-3.5 text-warm-muted/70" />
          <h3 className="text-xs font-medium text-warm-muted">
            Next Deadline
          </h3>
        </div>
        {deadline ? (() => {
          const days = daysUntil(deadline.due_at)
          const urgent = days <= 3
          return (
            <div className="pl-5">
              <p className="text-xs font-medium text-warm-text">
                {formatDeadlineKey(deadline.key)}
              </p>
              <p className={`text-xs mt-0.5 ${urgent ? 'text-red-600 font-medium' : 'text-warm-muted'}`}>
                {days <= 0 ? 'Overdue' : days === 1 ? 'Due tomorrow' : `In ${days} days`}
              </p>
            </div>
          )
        })() : (
          <p className="text-xs text-warm-muted pl-5">No upcoming deadlines</p>
        )}
      </div>

      {/* Case Health */}
      <div className="rounded-lg bg-warm-bg/80 px-3 py-2.5">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Shield className="h-3.5 w-3.5 text-warm-muted/70" />
          <h3 className="text-xs font-medium text-warm-muted">
            Case Health
          </h3>
        </div>
        {riskScore ? (
          <div className="flex items-center gap-2 pl-5">
            <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium ${getRiskColor(riskScore.risk_level)}`}>
              {riskScore.risk_level === 'low' ? 'Healthy' :
               riskScore.risk_level === 'moderate' ? 'Moderate' :
               riskScore.risk_level === 'elevated' ? 'Needs Attention' : 'At Risk'}
            </span>
            <span className="text-xs text-warm-muted">{riskScore.overall_score}</span>
          </div>
        ) : (
          <p className="text-xs text-warm-muted pl-5">Complete more steps to unlock insights.</p>
        )}
      </div>
    </div>
  )
}
