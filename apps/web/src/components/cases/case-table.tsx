'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getDisputeLabel, getCourtLabel } from '@/lib/labels'
import { CaseEditDialog } from '@/components/cases/case-edit-dialog'
import { daysUntil, formatDeadlineLabelShort } from '@/lib/deadline-utils'

interface CaseRow {
  id: string
  county: string | null
  description: string | null
  role: string
  courtType: string | null
  disputeType: string | null
  piSubType: string | null
  createdAt: string
  healthScore: number | null
  tasksCompleted: number
  tasksTotal: number
  nextDeadline: { due_at: string; key: string; label: string | null } | null
  lastActivity: string | null
}

interface CaseTableProps {
  cases: CaseRow[]
}

function healthColor(score: number | null): string {
  if (score === null) return 'text-warm-muted'
  if (score >= 70) return 'text-green-600'
  if (score >= 40) return 'text-amber-600'
  return 'text-destructive'
}

function relativeDate(dateStr: string): string {
  const days = daysUntil(dateStr)
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  if (days > 1 && days <= 7) return `In ${days}d`
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)
  if (diffHours < 1) return 'Just now'
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return '1d ago'
  if (diffDays < 30) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function CaseTable({ cases }: CaseTableProps) {
  return (
    <div className="rounded-lg border border-warm-border bg-white overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-warm-border bg-gray-50/50">
            <th className="text-left text-xs font-medium text-warm-muted px-5 py-3">Case</th>
            <th className="text-left text-xs font-medium text-warm-muted px-5 py-3 hidden sm:table-cell">Type</th>
            <th className="text-left text-xs font-medium text-warm-muted px-5 py-3 hidden md:table-cell">Progress</th>
            <th className="text-left text-xs font-medium text-warm-muted px-5 py-3 hidden lg:table-cell">Next Deadline</th>
            <th className="text-left text-xs font-medium text-warm-muted px-5 py-3 hidden md:table-cell">Updated</th>
            <th className="text-center text-xs font-medium text-warm-muted px-5 py-3">Health</th>
            <th className="w-10 px-3 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-warm-border">
          {cases.map((c) => {
            const displayName = c.county ? `${c.county} County` : 'County not set'
            const courtLabel = getCourtLabel(c.courtType) || null
            const roleLabel = c.role === 'plaintiff' ? 'Plaintiff' : 'Defendant'
            const disputeLabel = c.disputeType ? getDisputeLabel(c.disputeType, c.piSubType) : null
            const pct = c.tasksTotal > 0 ? Math.round((c.tasksCompleted / c.tasksTotal) * 100) : 0

            return (
              <tr key={c.id} className="group hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-start gap-2">
                    <Link href={`/case/${c.id}`} className="block min-w-0 flex-1">
                      <p className="text-sm font-medium text-warm-text">
                        {displayName}{courtLabel ? ` · ${courtLabel}` : ''}
                      </p>
                      {c.description && (
                        <p className="text-xs text-warm-muted mt-0.5 truncate">{c.description}</p>
                      )}
                      <p className="text-xs text-warm-muted mt-0.5">{roleLabel}</p>
                    </Link>
                    <CaseEditDialog
                      caseId={c.id}
                      currentCounty={c.county}
                      currentDescription={c.description}
                    />
                  </div>
                </td>
                <td className="px-5 py-3.5 hidden sm:table-cell">
                  <span className="text-xs text-warm-muted">{disputeLabel ?? '\u2014'}</span>
                </td>
                <td className="px-5 py-3.5 hidden md:table-cell">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-warm-border/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-calm-indigo rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-warm-muted">{c.tasksCompleted}/{c.tasksTotal}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 hidden lg:table-cell">
                  {c.nextDeadline ? (() => {
                    const days = daysUntil(c.nextDeadline.due_at)
                    const color = days < 0 ? 'text-calm-amber' : days <= 7 ? 'text-amber-600' : 'text-warm-muted'
                    const dayText = days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? 'Today' : `${days}d`
                    return (
                      <span className={`text-xs font-medium ${color}`}>
                        {dayText} &mdash; {formatDeadlineLabelShort(c.nextDeadline.key, c.nextDeadline.label)}
                      </span>
                    )
                  })() : (
                    <span className="text-xs text-warm-muted italic">
                      {pct < 50 ? 'After filing' : '\u2014'}
                    </span>
                  )}
                </td>
                <td className="px-5 py-3.5 hidden md:table-cell">
                  <span className="text-xs text-warm-muted">
                    {c.lastActivity ? timeAgo(c.lastActivity) : new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-center">
                  <span className={`text-sm font-semibold ${healthColor(c.healthScore)}`}>
                    {c.healthScore !== null ? c.healthScore : '\u2014'}
                  </span>
                </td>
                <td className="px-3 py-3.5">
                  <Link href={`/case/${c.id}`} className="text-warm-muted hover:text-warm-text">
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
