'use client'

import { useState } from 'react'
import { GitBranch, RefreshCw, Sparkles, ChevronDown, ChevronUp, CheckCircle2, XCircle, Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { OptionsAdvisor, DecisionPoint } from '@/lib/ai/options-advisor'

interface OptionsAdvisorCardProps {
  caseId: string
  initial: OptionsAdvisor | null
  generatedAt?: string | null
}

const URGENCY_CONFIG = {
  now: { label: 'Decide now', class: 'bg-destructive/15 text-destructive border-destructive/30' },
  soon: { label: 'Decide soon', class: 'bg-calm-amber/15 text-calm-amber border-calm-amber/30' },
  when_ready: { label: 'When ready', class: 'bg-primary/10 text-primary border-primary/20' },
} as const

function formatAge(iso: string): string {
  const hours = Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60))
  if (hours < 1) return 'just now'
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function DecisionCard({ decision }: { decision: DecisionPoint }) {
  const [expanded, setExpanded] = useState(true)
  const urgency = URGENCY_CONFIG[decision.urgency]

  return (
    <div className="rounded-lg border border-warm-border overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-warm-bg/50 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Badge variant="outline" className={`text-xs shrink-0 ${urgency.class}`}>
              {urgency.label}
            </Badge>
          </div>
          <p className="text-sm font-medium text-warm-text leading-snug">{decision.question}</p>
          <p className="text-xs text-warm-muted mt-1 leading-relaxed">{decision.context}</p>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-warm-muted shrink-0 mt-0.5" />
        ) : (
          <ChevronDown className="h-4 w-4 text-warm-muted shrink-0 mt-0.5" />
        )}
      </button>

      {/* Options */}
      {expanded && (
        <div className="border-t border-warm-border divide-y divide-warm-border">
          {decision.options.map((option, i) => (
            <div
              key={i}
              className={`p-4 ${option.recommended ? 'bg-calm-indigo/3' : ''}`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-warm-text">{option.name}</p>
                  {option.recommended && (
                    <span className="inline-flex items-center gap-0.5 text-xs text-calm-indigo font-medium">
                      <Star className="h-3 w-3 fill-calm-indigo" />
                      Recommended
                    </span>
                  )}
                </div>
              </div>
              <p className="text-xs text-warm-muted mb-3 leading-relaxed">{option.description}</p>
              <div className="grid grid-cols-1 gap-1.5">
                {option.pros.map((pro, j) => (
                  <div key={`pro-${j}`} className="flex items-start gap-1.5 text-xs">
                    <CheckCircle2 className="h-3.5 w-3.5 text-calm-green shrink-0 mt-0.5" />
                    <span className="text-warm-text">{pro}</span>
                  </div>
                ))}
                {option.cons.map((con, j) => (
                  <div key={`con-${j}`} className="flex items-start gap-1.5 text-xs">
                    <XCircle className="h-3.5 w-3.5 text-destructive/70 shrink-0 mt-0.5" />
                    <span className="text-warm-muted">{con}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function OptionsAdvisorCard({ caseId, initial, generatedAt }: OptionsAdvisorCardProps) {
  const [advisor, setAdvisor] = useState<OptionsAdvisor | null>(initial)
  const [lastGenerated, setLastGenerated] = useState(generatedAt ?? null)
  const [loading, setLoading] = useState(false)

  async function refresh() {
    setLoading(true)
    try {
      const res = await fetch(`/api/cases/${caseId}/options?force=true`)
      if (res.ok) {
        const data = await res.json()
        const { _meta: _, ...rest } = data
        setAdvisor(rest as OptionsAdvisor)
        setLastGenerated(new Date().toISOString())
      }
    } catch {
      /* silent */
    }
    setLoading(false)
  }

  return (
    <Card className="border-warm-border">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-calm-indigo" />
          <CardTitle className="text-lg">Your Options</CardTitle>
          {advisor && (
            <Badge variant="outline" className="text-xs text-warm-muted border-warm-border">
              {advisor.decisions.length} decision{advisor.decisions.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {lastGenerated && (
            <span className="text-xs text-warm-muted">{formatAge(lastGenerated)}</span>
          )}
          <Button variant="ghost" size="sm" onClick={refresh} disabled={loading} className="text-xs">
            <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} />
            {advisor ? 'Refresh' : 'Analyze'}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {loading && !advisor && (
          <div className="flex items-center gap-2 text-sm text-warm-muted animate-pulse">
            <Sparkles className="h-4 w-4" />
            Identifying your key decisions…
          </div>
        )}

        {!advisor && !loading && (
          <p className="text-sm text-warm-muted">
            Click <span className="font-medium">Analyze</span> to see the key decisions in your case right now — with options, tradeoffs, and a recommendation for each.
          </p>
        )}

        {loading && advisor && (
          <div className="flex items-center gap-1.5 text-xs text-warm-muted animate-pulse mb-1">
            <Sparkles className="h-3.5 w-3.5" />
            Re-analyzing your options…
          </div>
        )}

        {advisor && (
          <div className="space-y-3">
            {advisor.decisions.map((decision, i) => (
              <DecisionCard key={i} decision={decision} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
