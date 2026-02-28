'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDownIcon, Loader2Icon } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface CaseRiskScore {
  id: string
  overall_score: number
  deadline_risk: number
  response_risk: number
  evidence_risk: number
  activity_risk: number
  risk_level: 'low' | 'moderate' | 'elevated' | 'high'
  breakdown: unknown
  created_at: string
}

interface CaseHealthCardProps {
  caseId: string
  riskScore: CaseRiskScore | null
}

const RISK_COLORS: Record<string, { badge: string; score: string; bar: string }> = {
  low:      { badge: 'bg-calm-green/10 text-calm-green', score: 'text-calm-green', bar: 'bg-calm-green' },
  moderate: { badge: 'bg-calm-indigo/10 text-calm-indigo', score: 'text-calm-indigo', bar: 'bg-calm-indigo' },
  elevated: { badge: 'bg-calm-amber/10 text-calm-amber', score: 'text-calm-amber', bar: 'bg-calm-amber' },
  high:     { badge: 'bg-red-500/10 text-red-500', score: 'text-red-500', bar: 'bg-red-500' },
}

const RISK_LABELS: Record<string, string> = {
  low: 'Good',
  moderate: 'Fair',
  elevated: 'Needs Attention',
  high: 'Needs Focus',
}

const SUBSCORE_LABELS: Record<string, string> = {
  deadline_risk: 'Deadlines',
  response_risk: 'Discovery Responses',
  evidence_risk: 'Evidence & Exhibits',
  activity_risk: 'Case Activity',
}

const SUBSCORE_MAX: Record<string, number> = {
  deadline_risk: 40,
  response_risk: 50,
  evidence_risk: 40,
  activity_risk: 40,
}

interface Explanation {
  summary: string
  focus_areas: string[]
}

function normalizeBreakdown(breakdown: unknown): { items: unknown[]; explanation: Explanation | null } {
  if (Array.isArray(breakdown)) return { items: breakdown, explanation: null }
  const obj = breakdown as Record<string, unknown> | null
  return {
    items: Array.isArray(obj?.items) ? (obj!.items as unknown[]) : [],
    explanation: (obj?.ai_explanation as Explanation) ?? null,
  }
}

export function CaseHealthCard({ caseId, riskScore }: CaseHealthCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [recalculating, setRecalculating] = useState(false)
  const [explaining, setExplaining] = useState(false)
  const [explanation, setExplanation] = useState<Explanation | null>(() =>
    riskScore ? normalizeBreakdown(riskScore.breakdown).explanation : null
  )
  const router = useRouter()

  const colors = riskScore ? RISK_COLORS[riskScore.risk_level] ?? RISK_COLORS.low : RISK_COLORS.low

  async function handleRecalculate() {
    setRecalculating(true)
    try {
      const res = await fetch(`/api/cases/${caseId}/rules/run-risk-score`, { method: 'POST' })
      if (!res.ok) throw new Error()
      setExplanation(null)
      router.refresh()
      if (expanded) {
        // Auto re-explain after recalculate when expanded
        await handleExplain()
      }
    } catch {
      toast.error('Could not recalculate. Please try again.')
    } finally {
      setRecalculating(false)
    }
  }

  async function handleExplain() {
    setExplaining(true)
    try {
      const res = await fetch(`/api/cases/${caseId}/risk/explain`, { method: 'POST' })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setExplanation({ summary: data.summary, focus_areas: data.focus_areas })
    } catch {
      toast.error('Could not load explanation. Please try again.')
    } finally {
      setExplaining(false)
    }
  }

  function handleToggleExpand() {
    const willExpand = !expanded
    setExpanded(willExpand)
    if (willExpand && !explanation && !explaining) {
      handleExplain()
    }
  }

  // Empty state
  if (!riskScore) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-warm-text">Case Health</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-warm-muted text-sm mb-4">
            Get a health check on your case to see where things stand.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRecalculate}
            disabled={recalculating}
          >
            {recalculating && <Loader2Icon className="mr-2 h-3.5 w-3.5 animate-spin" />}
            Calculate
          </Button>
        </CardContent>
      </Card>
    )
  }

  const subscoreKeys = ['deadline_risk', 'response_risk', 'evidence_risk', 'activity_risk'] as const

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-warm-text">Case Health</CardTitle>
      </CardHeader>

      <CardContent>
        {/* Score hero */}
        <div className="flex items-center gap-4">
          <div className="flex items-baseline gap-1">
            <span className={`text-4xl font-semibold tabular-nums ${colors.score}`}>
              {riskScore.overall_score}
            </span>
            <span className="text-sm text-warm-muted">/100</span>
          </div>
          <Badge variant="secondary" className={`border-0 ${colors.badge}`}>
            {RISK_LABELS[riskScore.risk_level] ?? riskScore.risk_level}
          </Badge>
        </div>

        {/* Sub-scores */}
        <div className="mt-6 space-y-3">
          {subscoreKeys.map((key) => {
            const value = riskScore[key]
            const max = SUBSCORE_MAX[key]
            const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
            const fillColor =
              value === 0 ? 'bg-calm-green' : pct > 50 ? colors.bar : 'bg-calm-amber'

            return (
              <div key={key}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-medium text-warm-muted">
                    {SUBSCORE_LABELS[key]}
                  </span>
                  <span className="text-xs text-warm-muted">
                    {value === 0 ? 'Good' : `${value} pts`}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-warm-border">
                  <div
                    className={`h-1.5 rounded-full transition-all ${fillColor}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Expand toggle */}
        <button
          className="mt-4 flex items-center gap-1 text-xs font-medium text-warm-muted hover:text-warm-text transition-colors"
          onClick={handleToggleExpand}
        >
          <ChevronDownIcon
            className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
          {expanded ? 'Less detail' : 'More detail'}
        </button>

        {/* Expanded section */}
        {expanded && (
          <div className="border-t border-warm-border mt-4 pt-4 space-y-4">
            {explaining ? (
              <div className="flex items-center gap-2 text-sm text-warm-muted">
                <Loader2Icon className="h-3.5 w-3.5 animate-spin" />
                Analyzing your case...
              </div>
            ) : explanation ? (
              <>
                <p className="text-sm leading-relaxed text-warm-text">
                  {explanation.summary}
                </p>
                {explanation.focus_areas.length > 0 && (
                  <ul className="space-y-2">
                    {explanation.focus_areas.map((area, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span
                          className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-calm-indigo"
                          aria-hidden="true"
                        />
                        <span className="text-sm text-warm-text">{area}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : null}

            <Button
              variant="outline"
              size="sm"
              onClick={handleRecalculate}
              disabled={recalculating}
            >
              {recalculating && <Loader2Icon className="mr-2 h-3.5 w-3.5 animate-spin" />}
              Recalculate
            </Button>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <p className="text-xs text-warm-muted">
          This score reflects case management factors only and does not evaluate legal merit.
        </p>
      </CardFooter>
    </Card>
  )
}
