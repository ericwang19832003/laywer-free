'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Compass, RefreshCw, Sparkles } from 'lucide-react'

interface StrategyCardProps {
  caseId: string
  recommendations: { title: string; body: string; priority: string }[] | null
  generatedAt?: string | null
}

const priorityColors: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-blue-100 text-blue-700',
}

export function StrategyCard({ caseId, recommendations: initial, generatedAt }: StrategyCardProps) {
  const [recommendations, setRecommendations] = useState(initial)
  const [loading, setLoading] = useState(false)
  const [lastGenerated, setLastGenerated] = useState(generatedAt)

  async function generateStrategy() {
    setLoading(true)
    try {
      const res = await fetch(`/api/cases/${caseId}/strategy`)
      if (res.ok) {
        const data = await res.json()
        setRecommendations(data.recommendations)
        setLastGenerated(new Date().toISOString())
      }
    } catch { /* silent */ }
    setLoading(false)
  }

  return (
    <Card className="border-warm-border">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <Compass className="h-5 w-5 text-calm-indigo" />
          <CardTitle className="text-lg">Strategy Insights</CardTitle>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={generateStrategy}
          disabled={loading}
          className="text-xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} />
          {recommendations ? 'Refresh' : 'Generate'}
        </Button>
      </CardHeader>
      <CardContent>
        {loading && !recommendations && (
          <div className="flex items-center gap-2 text-sm text-warm-muted animate-pulse">
            <Sparkles className="h-4 w-4" />
            Analyzing your case...
          </div>
        )}
        {!loading && !recommendations && (
          <p className="text-sm text-warm-muted">
            Get AI-powered strategy insights tailored to your case progress and situation.
          </p>
        )}
        {recommendations && recommendations.length > 0 && (
          <div className="space-y-3">
            {recommendations.map((rec, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={`text-xs ${priorityColors[rec.priority] ?? ''}`}>
                    {rec.priority}
                  </Badge>
                  <span className="text-sm font-medium text-warm-text">{rec.title}</span>
                </div>
                <p className="text-sm text-warm-muted pl-1">{rec.body}</p>
              </div>
            ))}
            {lastGenerated && (
              <p className="text-xs text-warm-muted/60 pt-1">
                Last updated {new Date(lastGenerated).toLocaleDateString()}
              </p>
            )}
          </div>
        )}
        <p className="text-xs text-warm-muted/60 mt-3 italic">
          These are case management suggestions, not legal advice.
        </p>
      </CardContent>
    </Card>
  )
}
