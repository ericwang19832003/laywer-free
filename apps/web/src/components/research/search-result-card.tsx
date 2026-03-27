'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookmarkPlus, Loader2, Check, ExternalLink } from 'lucide-react'

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

function courtListenerUrl(clusterId: number, caseName: string): string {
  const slug = caseName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 75)
  return `https://www.courtlistener.com/opinion/${clusterId}/${slug}/`
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

  // Strip HTML tags from snippet but preserve text
  const cleanSnippet = (result.snippet ?? '').replace(/<[^>]*>/g, '').trim()

  return (
    <Card>
      <CardContent className="pt-4 pb-3 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <a
              href={courtListenerUrl(result.cluster_id, result.case_name)}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-start gap-1"
            >
              <h4 className="text-sm font-semibold text-warm-text group-hover:text-blue-700 group-hover:underline transition-colors">
                {result.case_name}
              </h4>
              <ExternalLink className="h-3 w-3 mt-0.5 shrink-0 text-warm-muted group-hover:text-blue-700 transition-colors" />
            </a>
            <p className="text-xs text-warm-muted">
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
            <span className="ml-1">{saved ? 'Saved' : 'Save Case'}</span>
          </Button>
        </div>
        {cleanSnippet ? (
          <p className="text-xs leading-relaxed text-warm-text/70">
            &ldquo;{cleanSnippet}&rdquo;
          </p>
        ) : (
          <a
            href={courtListenerUrl(result.cluster_id, result.case_name)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 hover:underline"
          >
            Read full opinion on CourtListener
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
        {error && <p className="text-xs" style={{ color: '#D97706' }}>{error}</p>}
      </CardContent>
    </Card>
  )
}
