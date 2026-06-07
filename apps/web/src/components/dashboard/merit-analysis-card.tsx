'use client'

import { useState } from 'react'
import { Scale, RefreshCw, Sparkles, ChevronDown, ChevronUp, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { MeritAnalysis } from '@/lib/ai/merit-analysis'

interface MeritAnalysisCardProps {
  caseId: string
  initial: MeritAnalysis | null
  generatedAt?: string | null
}

const VERDICT_CONFIG = {
  strong: {
    label: 'Strong',
    badge: 'bg-calm-green/15 text-calm-green border-calm-green/30',
    bar: 'bg-calm-green',
  },
  moderate: {
    label: 'Moderate',
    badge: 'bg-calm-amber/15 text-calm-amber border-calm-amber/30',
    bar: 'bg-calm-amber',
  },
  weak: {
    label: 'Needs Work',
    badge: 'bg-destructive/15 text-destructive border-destructive/30',
    bar: 'bg-destructive',
  },
} as const

const PRIORITY_COLORS: Record<string, string> = {
  high: 'text-destructive',
  medium: 'text-calm-amber',
  low: 'text-calm-indigo',
}

function formatAge(iso: string): string {
  const hours = Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60))
  if (hours < 1) return 'just now'
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export function MeritAnalysisCard({ caseId, initial, generatedAt }: MeritAnalysisCardProps) {
  const [analysis, setAnalysis] = useState<MeritAnalysis | null>(initial)
  const [lastGenerated, setLastGenerated] = useState(generatedAt ?? null)
  const [loading, setLoading] = useState(false)
  const [showStrengths, setShowStrengths] = useState(true)
  const [showGaps, setShowGaps] = useState(true)

  async function refresh() {
    setLoading(true)
    try {
      const res = await fetch(`/api/cases/${caseId}/merit-analysis?force=1`)
      if (res.ok) {
        const data = await res.json()
        const { _meta: _, ...rest } = data
        setAnalysis(rest as MeritAnalysis)
        setLastGenerated(new Date().toISOString())
      }
    } catch {
      /* silent */
    }
    setLoading(false)
  }

  const cfg = analysis ? VERDICT_CONFIG[analysis.verdict] : null

  return (
    <Card className="border-warm-border">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-calm-indigo" />
          <CardTitle className="text-lg">Case Merit</CardTitle>
          {analysis && cfg && (
            <Badge variant="outline" className={`text-xs ${cfg.badge}`}>
              {cfg.label}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {lastGenerated && (
            <span className="text-xs text-warm-muted">{formatAge(lastGenerated)}</span>
          )}
          <Button variant="ghost" size="sm" onClick={refresh} disabled={loading} className="text-xs">
            <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} />
            {analysis ? 'Refresh' : 'Analyze'}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {loading && !analysis && (
          <div className="flex items-center gap-2 text-sm text-warm-muted animate-pulse">
            <Sparkles className="h-4 w-4" />
            Analyzing case merits…
          </div>
        )}

        {!analysis && !loading && (
          <p className="text-sm text-warm-muted">
            Click <span className="font-medium">Analyze</span> to evaluate your case strengths and gaps based on your intake answers and uploaded evidence.
          </p>
        )}

        {analysis && cfg && (
          <>
            {/* Score bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-warm-muted">
                <span>Merit score</span>
                <span className="font-medium text-warm-text">{analysis.score}/100</span>
              </div>
              <div className="h-2 rounded-full bg-warm-border overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${cfg.bar}`}
                  style={{ width: `${analysis.score}%` }}
                />
              </div>
            </div>

            {/* Summary */}
            <p className="text-sm text-warm-text leading-relaxed">{analysis.summary}</p>

            {/* Strengths */}
            {analysis.strengths.length > 0 && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowStrengths((v) => !v)}
                  className="flex items-center gap-1.5 text-sm font-medium text-calm-green w-full text-left mb-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>What's working ({analysis.strengths.length})</span>
                  {showStrengths ? (
                    <ChevronUp className="h-3.5 w-3.5 ml-auto" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 ml-auto" />
                  )}
                </button>
                {showStrengths && (
                  <ul className="space-y-2">
                    {analysis.strengths.map((s, i) => (
                      <li key={i} className="flex gap-2 text-sm">
                        <CheckCircle2 className="h-3.5 w-3.5 text-calm-green shrink-0 mt-0.5" />
                        <div>
                          <span className="font-medium text-warm-text">{s.element}</span>
                          {' — '}
                          <span className="text-warm-muted">{s.reason}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Gaps */}
            {analysis.gaps.length > 0 && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowGaps((v) => !v)}
                  className="flex items-center gap-1.5 text-sm font-medium text-calm-amber w-full text-left mb-2"
                >
                  <AlertCircle className="h-4 w-4" />
                  <span>Gaps to address ({analysis.gaps.length})</span>
                  {showGaps ? (
                    <ChevronUp className="h-3.5 w-3.5 ml-auto" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 ml-auto" />
                  )}
                </button>
                {showGaps && (
                  <ul className="space-y-2">
                    {analysis.gaps.map((g, i) => (
                      <li key={i} className="flex gap-2 text-sm">
                        <AlertCircle className="h-3.5 w-3.5 text-calm-amber shrink-0 mt-0.5" />
                        <div>
                          <span className="font-medium text-warm-text">{g.element}</span>
                          <p className="text-warm-muted mt-0.5">{g.recommendation}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Next actions */}
            {analysis.next_actions.length > 0 && (
              <div className="rounded-lg bg-warm-bg border border-warm-border p-3 space-y-2">
                <p className="text-xs font-medium text-warm-muted uppercase tracking-wide">Next steps</p>
                <ul className="space-y-1.5">
                  {analysis.next_actions.map((a, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <ArrowRight className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${PRIORITY_COLORS[a.priority]}`} />
                      <span className="text-warm-text">{a.action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
