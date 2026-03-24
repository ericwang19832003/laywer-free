'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Search, Loader2 } from 'lucide-react'
import { SearchResultCard } from './search-result-card'

interface CaseSearchBarProps {
  caseId: string
  caseContext: {
    jurisdiction: string | null
    dispute_type: string | null
    court_type: string | null
  }
}

interface SearchResult {
  cluster_id: number
  case_name: string
  court_id: string
  court_name: string
  date_filed: string
  citations: string[]
  snippet: string
}

export function CaseSearchBar({ caseId, caseContext }: CaseSearchBarProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim().length < 3) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/cases/${caseId}/research/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.trim(),
          filters: caseContext.jurisdiction
            ? { jurisdiction: caseContext.jurisdiction }
            : undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Search failed')
      }

      const data = await res.json()
      setResults(data.results ?? [])
      setSearched(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="case-search" className="text-sm font-medium" style={{ color: '#1C1917' }}>
            Search Case Law
          </Label>
          <div className="flex gap-2">
            <Input
              id="case-search"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., landlord failure to return security deposit within 30 days"
              className="flex-1"
              minLength={3}
            />
            <Button type="submit" disabled={loading || query.trim().length < 3}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              <span className="ml-1.5">Search</span>
            </Button>
          </div>
        </div>
        {caseContext.jurisdiction && (
          <p className="text-xs" style={{ color: '#78716C' }}>
            Searching within {caseContext.jurisdiction} jurisdiction. Results may include federal cases.
          </p>
        )}
      </form>

      {error && (
        <p className="text-sm" style={{ color: '#D97706' }}>{error}</p>
      )}

      {searched && results.length === 0 && !loading && (
        <p className="text-sm" style={{ color: '#78716C' }}>No results found. Try different keywords.</p>
      )}

      {results.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold" style={{ color: '#1C1917' }}>
            Search Results ({results.length})
          </h3>
          {results.map((result) => (
            <SearchResultCard
              key={result.cluster_id}
              result={result}
              caseId={caseId}
            />
          ))}
        </div>
      )}
    </div>
  )
}
