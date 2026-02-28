'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Loader2Icon,
  TrendingUpIcon,
  TrendingDownIcon,
  MinusIcon,
  RefreshCwIcon,
  ChevronDownIcon,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

// ── Types ────────────────────────────────────────────────────────

interface CaseRiskScore {
  id: string
  overall_score: number
  deadline_risk: number
  response_risk: number
  evidence_risk: number
  activity_risk: number
  risk_level: string
  breakdown: unknown
  computed_at: string | null
}

interface HistoricalScore {
  overall_score: number
}

interface CaseHealthCardProps {
  caseId: string
  riskScore: CaseRiskScore | null
  score7DaysAgo?: HistoricalScore | null
  score30DaysAgo?: HistoricalScore | null
}

interface Explanation {
  summary: string
  focus_areas: string[]
}

// ── Helpers ──────────────────────────────────────────────────────

function getHealthStyle(score: number) {
  if (score >= 85) return { label: 'Great', badgeCls: 'bg-calm-green/10 text-calm-green', scoreCls: 'text-calm-green' }
  if (score >= 70) return { label: 'Good', badgeCls: 'bg-calm-indigo/10 text-calm-indigo', scoreCls: 'text-calm-indigo' }
  if (score >= 50) return { label: 'Needs Attention', badgeCls: 'bg-calm-amber/10 text-calm-amber', scoreCls: 'text-calm-amber' }
  return { label: 'Critical', badgeCls: 'bg-red-500/10 text-red-500', scoreCls: 'text-red-500' }
}

function getBarColor(value: number) {
  if (value >= 85) return 'bg-calm-green'
  if (value >= 70) return 'bg-calm-indigo'
  if (value >= 50) return 'bg-calm-amber'
  return 'bg-red-500'
}

function formatUpdatedAt(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  if (diffHours < 1) return 'Updated just now'
  if (diffHours < 24) return `Updated ${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return 'Updated yesterday'
  return `Updated ${diffDays} days ago`
}

function extractExplanation(breakdown: unknown): Explanation | null {
  if (!breakdown || typeof breakdown !== 'object') return null
  const obj = breakdown as Record<string, unknown>
  const ai = obj.ai_explanation as Explanation | undefined
  return ai?.summary ? ai : null
}

// ── Component ────────────────────────────────────────────────────

export function CaseHealthCard({
  caseId,
  riskScore,
  score7DaysAgo,
  score30DaysAgo,
}: CaseHealthCardProps) {
  const [recalculating, setRecalculating] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [explaining, setExplaining] = useState(false)
  const [explanation, setExplanation] = useState<Explanation | null>(() =>
    riskScore ? extractExplanation(riskScore.breakdown) : null
  )
  const router = useRouter()

  async function handleRecalculate() {
    setRecalculating(true)
    try {
      const res = await fetch(`/api/cases/${caseId}/rules/run-risk-score`, { method: 'POST' })
      if (!res.ok) throw new Error()
      setExplanation(null)
      router.refresh()
      if (detailsOpen) {
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
      toast.error('Could not load details. Please try again.')
    } finally {
      setExplaining(false)
    }
  }

  function handleViewDetails() {
    const willOpen = !detailsOpen
    setDetailsOpen(willOpen)
    if (willOpen && !explanation && !explaining) {
      handleExplain()
    }
  }

  // ── Empty state ──────────────────────────────────────────────

  if (!riskScore) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-warm-text">Case Health</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-warm-muted mb-4">
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

  // ── Computed values ──────────────────────────────────────────

  const style = getHealthStyle(riskScore.overall_score)

  const subHealth = [
    { label: 'Deadline Health', value: Math.min(100, Math.max(0, 100 - riskScore.deadline_risk)) },
    { label: 'Response Health', value: Math.min(100, Math.max(0, 100 - riskScore.response_risk)) },
    { label: 'Evidence Health', value: Math.min(100, Math.max(0, 100 - riskScore.evidence_risk)) },
    { label: 'Activity Health', value: Math.min(100, Math.max(0, 100 - riskScore.activity_risk)) },
  ]

  const trends: { label: string; diff: number }[] = []
  if (score7DaysAgo) {
    trends.push({ label: '7 days ago', diff: riskScore.overall_score - score7DaysAgo.overall_score })
  }
  if (score30DaysAgo) {
    trends.push({ label: '30 days ago', diff: riskScore.overall_score - score30DaysAgo.overall_score })
  }

  // ── Render ───────────────────────────────────────────────────

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-warm-text">Case Health</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* ── Score hero ──────────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-3">
            <span
              className={`text-5xl font-semibold tabular-nums tracking-tight ${style.scoreCls}`}
            >
              {riskScore.overall_score}
            </span>
            <div className="flex flex-col gap-1.5">
              <Badge variant="secondary" className={`border-0 ${style.badgeCls}`}>
                {style.label}
              </Badge>
              {riskScore.computed_at && (
                <span className="text-[11px] text-warm-muted leading-none">
                  {formatUpdatedAt(riskScore.computed_at)}
                </span>
              )}
            </div>
          </div>

          {/* ── Trends ──────────────────────────────────────── */}
          {trends.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
              {trends.map((t) => {
                const positive = t.diff > 0
                const negative = t.diff < 0
                const Icon = positive ? TrendingUpIcon : negative ? TrendingDownIcon : MinusIcon
                const color = positive
                  ? 'text-calm-green'
                  : negative
                    ? 'text-calm-amber'
                    : 'text-warm-muted'
                const prefix = positive ? '+' : ''

                return (
                  <span key={t.label} className={`flex items-center gap-1 text-xs ${color}`}>
                    <Icon className="h-3 w-3 flex-shrink-0" />
                    {prefix}
                    {t.diff} vs {t.label}
                  </span>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Sub-health bars ─────────────────────────────────── */}
        <div className="space-y-3">
          {subHealth.map((item) => (
            <div key={item.label}>
              <div className="flex justify-between mb-1">
                <span className="text-xs font-medium text-warm-muted">{item.label}</span>
                <span className="text-xs tabular-nums text-warm-muted">{item.value}</span>
              </div>
              <div className="h-1.5 rounded-full bg-warm-border">
                <div
                  className={`h-1.5 rounded-full transition-all ${getBarColor(item.value)}`}
                  style={{ width: `${item.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* ── Actions ─────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            size="sm"
            onClick={handleRecalculate}
            disabled={recalculating}
          >
            {recalculating ? (
              <Loader2Icon className="mr-2 h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCwIcon className="mr-2 h-3.5 w-3.5" />
            )}
            Recalculate
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleViewDetails}
            className="text-warm-muted"
          >
            <ChevronDownIcon
              className={`mr-1.5 h-3.5 w-3.5 transition-transform ${detailsOpen ? 'rotate-180' : ''}`}
            />
            {detailsOpen ? 'Hide details' : 'View details'}
          </Button>
        </div>

        {/* ── Expanded details ────────────────────────────────── */}
        {detailsOpen && (
          <div className="border-t border-warm-border pt-4 space-y-3">
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
          </div>
        )}

        {/* ── Disclaimer ──────────────────────────────────────── */}
        <p className="text-[11px] leading-relaxed text-warm-muted">
          This score reflects case management factors only and does not evaluate legal merit.
        </p>
      </CardContent>
    </Card>
  )
}
