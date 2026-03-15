'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Lightbulb, X } from 'lucide-react'
import { useState } from 'react'

interface CaseInsight {
  id: string
  insight_type: string
  title: string
  body: string
  priority: 'info' | 'warning' | 'urgent'
  created_at: string
}

interface InsightsCardProps {
  caseId: string
  initialInsights: CaseInsight[]
}

const PRIORITY_STYLES = {
  info: 'bg-calm-indigo/10 text-calm-indigo',
  warning: 'bg-calm-amber/10 text-calm-amber',
  urgent: 'bg-red-100 text-red-700',
}

export function InsightsCard({ caseId, initialInsights }: InsightsCardProps) {
  const [insights, setInsights] = useState(initialInsights)

  if (insights.length === 0) return null

  async function dismissInsight(insightId: string) {
    setInsights(prev => prev.filter(i => i.id !== insightId))
    await fetch(`/api/cases/${caseId}/insights`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ insightId }),
    })
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-warm-text flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-calm-amber" />
          Case Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.slice(0, 3).map((insight) => (
          <div
            key={insight.id}
            className="flex items-start gap-3 p-3 rounded-lg bg-warm-bg"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge className={PRIORITY_STYLES[insight.priority]} variant="secondary">
                  {insight.priority}
                </Badge>
                <span className="text-sm font-medium text-warm-text truncate">
                  {insight.title}
                </span>
              </div>
              <p className="text-xs text-warm-muted">{insight.body}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-warm-muted hover:text-warm-text shrink-0"
              onClick={() => dismissInsight(insight.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
