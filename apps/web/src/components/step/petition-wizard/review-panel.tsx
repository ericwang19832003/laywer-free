'use client'

import { useState } from 'react'
import { ChevronDown, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type {
  TripleReviewResult,
  ReviewAgentResult,
  ReviewCheckResult,
} from '@lawyer-free/shared/validators/triple-review'

interface ReviewPanelProps {
  result: TripleReviewResult | null
  loading?: boolean
  onAutoFix: (failedChecks: ReviewCheckResult[]) => void
}

function AgentRow({ agent }: { agent: ReviewAgentResult }) {
  const [expanded, setExpanded] = useState(false)
  const allPassed = agent.passCount === agent.totalCount
  const failedChecks = agent.checks.filter((c) => !c.passed)

  return (
    <div className="rounded-lg border border-warm-border">
      <button
        type="button"
        className="w-full flex items-center gap-3 py-3 px-4 text-left"
        onClick={() => failedChecks.length > 0 && setExpanded(!expanded)}
        aria-expanded={failedChecks.length > 0 ? expanded : undefined}
      >
        {allPassed ? (
          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
        ) : (
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
        )}
        <span className="text-sm font-medium text-warm-text flex-1">
          {agent.agentName}
        </span>
        <span
          className={`text-sm font-medium ${allPassed ? 'text-green-600' : 'text-amber-600'}`}
        >
          {agent.passCount}/{agent.totalCount} passed
        </span>
        {failedChecks.length > 0 && (
          <ChevronDown
            className={`h-4 w-4 text-warm-muted shrink-0 transition-transform duration-200 ${
              expanded ? 'rotate-180' : ''
            }`}
          />
        )}
      </button>
      {expanded && failedChecks.length > 0 && (
        <div className="border-t border-warm-border px-4 py-3 space-y-2">
          {failedChecks.map((check, i) => (
            <div key={i} className="text-sm text-amber-700">
              <span className="font-medium">{check.element}:</span>{' '}
              {check.reason}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function ReviewPanel({ result, loading, onAutoFix }: ReviewPanelProps) {
  if (loading || !result) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center gap-3">
          <Loader2 className="h-5 w-5 text-calm-indigo animate-spin" />
          <span className="text-sm text-warm-muted">
            Reviewing your petition...
          </span>
        </CardContent>
      </Card>
    )
  }

  const agents: ReviewAgentResult[] = [
    result.legalCorrectness,
    result.jurisdictionCompliance,
    result.plainLanguage,
  ]

  const allFailedChecks = agents.flatMap((a) =>
    a.checks.filter((c) => !c.passed),
  )

  return (
    <Card>
      <CardContent className="p-6 space-y-3">
        <div className="space-y-2">
          {agents.map((agent) => (
            <AgentRow key={agent.agentName} agent={agent} />
          ))}
        </div>

        {!result.allPassed && (
          <div className="pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAutoFix(allFailedChecks)}
            >
              Auto-fix {allFailedChecks.length} issue
              {allFailedChecks.length !== 1 ? 's' : ''}
            </Button>
          </div>
        )}

        <p className="text-xs text-warm-muted pt-1">
          This is a legal document. Please review carefully before filing.
          Consider having a legal aid attorney review it.
        </p>
      </CardContent>
    </Card>
  )
}
