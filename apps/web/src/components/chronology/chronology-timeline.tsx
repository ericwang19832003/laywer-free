'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface TimelineEntry {
  id: string
  entry_date: string
  description: string
  significance: 'high' | 'medium' | 'background'
  source: string
}

interface ChronologyTimelineProps {
  caseId: string
  initialEntries: TimelineEntry[]
  perspective: 'plaintiff' | 'defendant'
}

const SIGNIFICANCE_CONFIG = {
  high: { label: 'Key fact', className: 'border-l-4 border-l-red-400 bg-red-50' },
  medium: { label: 'Supporting', className: 'border-l-4 border-l-amber-400 bg-amber-50' },
  background: { label: 'Background', className: 'border-l-4 border-l-gray-300 bg-gray-50' },
} as const

export function ChronologyTimeline({ caseId, initialEntries, perspective }: ChronologyTimelineProps) {
  const [entries, setEntries] = useState(initialEntries)
  const [isBuilding, setIsBuilding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function buildChronology() {
    setIsBuilding(true)
    setError(null)
    try {
      const res = await fetch('/api/ai/chronology', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId, perspective }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to build chronology')
      setEntries(data.entries)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred')
    } finally {
      setIsBuilding(false)
    }
  }

  const sorted = [...entries].sort((a, b) => a.entry_date.localeCompare(b.entry_date))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-warm-muted">
          {entries.length > 0 ? `${entries.length} events` : 'No chronology built yet'}
        </p>
        <Button onClick={buildChronology} disabled={isBuilding} size="sm" variant="outline">
          {isBuilding ? 'Building...' : entries.length > 0 ? 'Rebuild' : 'Build chronology'}
        </Button>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
          {error}
        </div>
      )}

      {entries.length === 0 && !isBuilding && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-warm-muted">
              Click &ldquo;Build chronology&rdquo; to extract a timeline of key events from your case facts and evidence.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {sorted.map((entry) => {
          const config = SIGNIFICANCE_CONFIG[entry.significance]
          return (
            <div key={entry.id} className={`p-4 rounded-lg ${config.className}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-warm-muted font-mono mb-1">{entry.entry_date}</p>
                  <p className="text-sm text-warm-text">{entry.description}</p>
                </div>
                <Badge variant="outline" className="shrink-0 text-xs">
                  {config.label}
                </Badge>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
