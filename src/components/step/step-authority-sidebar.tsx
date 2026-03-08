'use client'

import { useState, useEffect } from 'react'
import { ChevronRight, ChevronDown, ExternalLink } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'

interface Authority {
  id: string
  cluster_id: number
  case_name: string
  court_name: string | null
  date_filed: string | null
  citations: string[]
  snippet: string | null
  pinned: boolean
}

interface StepAuthoritySidebarProps {
  caseId: string
  mode: 'select' | 'read-only'
  selectedClusterIds?: number[]
  onSelectionChange?: (clusterIds: number[]) => void
}

function courtListenerUrl(clusterId: number, caseName: string): string {
  const slug = caseName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 75)
  return `https://www.courtlistener.com/opinion/${clusterId}/${slug}/`
}

export function StepAuthoritySidebar({
  caseId,
  mode,
  selectedClusterIds = [],
  onSelectionChange,
}: StepAuthoritySidebarProps) {
  const [authorities, setAuthorities] = useState<Authority[]>([])
  const [loading, setLoading] = useState(true)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    async function fetchAuthorities() {
      try {
        const res = await fetch(`/api/cases/${caseId}/research/authority`)
        if (!res.ok) return
        const data = await res.json()
        setAuthorities(data.authorities ?? [])
      } catch {
        // Non-fatal
      } finally {
        setLoading(false)
      }
    }
    fetchAuthorities()
  }, [caseId])

  function handleToggle(clusterId: number) {
    if (!onSelectionChange) return
    const next = selectedClusterIds.includes(clusterId)
      ? selectedClusterIds.filter((id) => id !== clusterId)
      : [...selectedClusterIds, clusterId]
    onSelectionChange(next)
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-warm-border p-4">
        <p className="text-xs text-warm-muted">Loading saved cases...</p>
      </div>
    )
  }

  if (authorities.length === 0) {
    return (
      <div className="rounded-lg border border-warm-border p-4">
        <p className="text-xs font-medium text-warm-muted uppercase tracking-wide mb-1">
          Saved Cases
        </p>
        <p className="text-sm text-warm-muted">
          No saved cases yet. Use the{' '}
          <a
            href={`/case/${caseId}/research`}
            className="text-calm-indigo hover:underline"
          >
            Research tab
          </a>{' '}
          to find relevant case law.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-warm-border">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between p-3 text-left hover:bg-warm-bg/50 transition-colors"
      >
        <span className="text-xs font-medium text-warm-muted uppercase tracking-wide">
          {mode === 'select' ? 'Cite Saved Cases' : 'Your Saved Cases'}{' '}
          ({authorities.length})
        </span>
        {collapsed ? (
          <ChevronRight className="h-4 w-4 text-warm-muted" />
        ) : (
          <ChevronDown className="h-4 w-4 text-warm-muted" />
        )}
      </button>

      {!collapsed && (
        <div className="border-t border-warm-border divide-y divide-warm-border">
          {mode === 'select' && (
            <div className="px-3 py-2 bg-calm-indigo/5">
              <p className="text-xs text-warm-muted">
                Check the cases you want cited in your draft.
              </p>
            </div>
          )}
          {authorities.map((auth) => (
            <div key={auth.id} className="px-3 py-2.5 flex items-start gap-2">
              {mode === 'select' && (
                <Checkbox
                  checked={selectedClusterIds.includes(auth.cluster_id)}
                  onCheckedChange={() => handleToggle(auth.cluster_id)}
                  className="mt-0.5"
                />
              )}
              <div className="min-w-0 flex-1">
                <a
                  href={courtListenerUrl(auth.cluster_id, auth.case_name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-start gap-1"
                >
                  <span className="text-xs font-medium text-warm-text group-hover:text-blue-700 group-hover:underline transition-colors leading-tight">
                    {auth.case_name}
                  </span>
                  <ExternalLink className="h-2.5 w-2.5 mt-0.5 shrink-0 text-warm-muted group-hover:text-blue-700 transition-colors" />
                </a>
                <p className="text-[11px] text-warm-muted leading-tight">
                  {auth.court_name}
                  {auth.date_filed ? ` · ${auth.date_filed}` : ''}
                </p>
                {auth.citations.length > 0 && (
                  <p className="text-[11px] text-warm-muted/70 leading-tight">
                    {auth.citations.join(', ')}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
