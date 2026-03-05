'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookmarkPlus, Loader2, Check } from 'lucide-react'

interface SearchResult {
  cluster_id: number
  case_name: string
  court_name: string
  date_filed: string
  citations: string[]
  snippet: string
}

interface SearchResultCardProps {
  result: SearchResult
  caseId: string
}

export function SearchResultCard({ result, caseId }: SearchResultCardProps) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSaveAuthority() {
    setSaving(true)
    setError(null)

    try {
      const res = await fetch(`/api/cases/${caseId}/research/authority`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cluster_id: result.cluster_id }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save')
      }

      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  // Strip HTML tags from snippet
  const cleanSnippet = (result.snippet ?? '').replace(/<[^>]*>/g, '')

  return (
    <Card>
      <CardContent className="pt-4 pb-3 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold truncate" style={{ color: '#1C1917' }}>
              {result.case_name}
            </h4>
            <p className="text-xs" style={{ color: '#78716C' }}>
              {result.court_name} {result.date_filed ? `\u00b7 ${result.date_filed}` : ''}
            </p>
            {result.citations.length > 0 && (
              <p className="text-xs mt-0.5" style={{ color: '#A8A29E' }}>
                {result.citations.join(', ')}
              </p>
            )}
          </div>
          <Button
            variant={saved ? 'outline' : 'default'}
            size="sm"
            onClick={handleSaveAuthority}
            disabled={saving || saved}
            className="flex-shrink-0"
          >
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : saved ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <BookmarkPlus className="h-3.5 w-3.5" />
            )}
            <span className="ml-1">{saved ? 'Saved' : 'Use as Authority'}</span>
          </Button>
        </div>
        {cleanSnippet && (
          <p className="text-xs leading-relaxed" style={{ color: '#57534E' }}>
            &ldquo;{cleanSnippet}&rdquo;
          </p>
        )}
        {error && <p className="text-xs" style={{ color: '#D97706' }}>{error}</p>}
      </CardContent>
    </Card>
  )
}
