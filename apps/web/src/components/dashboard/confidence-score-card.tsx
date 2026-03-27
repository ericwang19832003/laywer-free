'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react'
import { useState } from 'react'
import type { ConfidenceBreakdown } from '@/lib/confidence/types'

interface ConfidenceScoreCardProps {
  score: number
  breakdown: ConfidenceBreakdown
}

const BREAKDOWN_LABELS: Record<keyof ConfidenceBreakdown, string> = {
  case_created: 'Case created',
  intake_completed: 'Intake completed',
  evidence_uploaded: 'Evidence uploaded',
  filing_prep_done: 'Filing preparation done',
  filed_with_court: 'Filed with court',
  served_defendant: 'Served other party',
  no_missed_deadlines: 'No missed deadlines',
  evidence_3plus: '3+ evidence items',
  discovery_created: 'Discovery pack created',
  tasks_current: 'All tasks up to date',
  research_saved: 'Legal research saved',
  notes_added: 'Case notes added',
  trial_binder: 'Trial binder created',
  courtroom_prep: 'Courtroom prep completed',
}

function getMilestoneMessage(score: number): string {
  if (score >= 100) return "Fully prepared! You've done everything possible to give yourself the best chance."
  if (score >= 75) return "Almost ready! You're better prepared than most self-represented litigants."
  if (score >= 50) return 'Halfway there! Your case is more organized than most.'
  if (score >= 25) return "Great start! You've taken the first steps to protect your rights."
  return 'Getting started — every step counts.'
}

function getScoreStyle(score: number) {
  if (score >= 75) return { ring: 'text-calm-green', bg: 'bg-calm-green', badge: 'bg-calm-green/10 text-calm-green' }
  if (score >= 50) return { ring: 'text-calm-indigo', bg: 'bg-calm-indigo', badge: 'bg-calm-indigo/10 text-calm-indigo' }
  if (score >= 25) return { ring: 'text-calm-amber', bg: 'bg-calm-amber', badge: 'bg-calm-amber/10 text-calm-amber' }
  return { ring: 'text-warm-muted', bg: 'bg-warm-muted', badge: 'bg-warm-muted/10 text-warm-muted' }
}

export function ConfidenceScoreCard({ score, breakdown }: ConfidenceScoreCardProps) {
  const [expanded, setExpanded] = useState(false)
  const style = getScoreStyle(score)
  const message = getMilestoneMessage(score)

  const earned = Object.entries(breakdown).filter(([, v]) => v > 0)
  const remaining = Object.entries(breakdown).filter(([, v]) => v === 0)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-warm-text flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-calm-indigo" />
            Case Confidence
          </CardTitle>
          <Badge className={style.badge}>{score}%</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress bar */}
        <div className="w-full h-3 rounded-full bg-warm-bg overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${style.bg}`}
            style={{ width: `${score}%` }}
          />
        </div>

        <p className="text-sm text-warm-muted">{message}</p>

        {/* Expandable breakdown */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-calm-indigo hover:underline"
        >
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          {expanded ? 'Hide details' : 'Show what counts'}
        </button>

        {expanded && (
          <div className="space-y-3 text-xs">
            {earned.length > 0 && (
              <div className="space-y-1">
                <p className="font-medium text-warm-text">Earned</p>
                {earned.map(([key, pts]) => (
                  <div key={key} className="flex justify-between text-warm-muted">
                    <span className="flex items-center gap-1">
                      <span className="text-calm-green">&#10003;</span>
                      {BREAKDOWN_LABELS[key as keyof ConfidenceBreakdown]}
                    </span>
                    <span className="text-calm-green">+{pts}</span>
                  </div>
                ))}
              </div>
            )}
            {remaining.length > 0 && (
              <div className="space-y-1">
                <p className="font-medium text-warm-text">Still available</p>
                {remaining.map(([key]) => (
                  <div key={key} className="flex justify-between text-warm-muted">
                    <span className="opacity-50">{BREAKDOWN_LABELS[key as keyof ConfidenceBreakdown]}</span>
                    <span className="opacity-50">—</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
