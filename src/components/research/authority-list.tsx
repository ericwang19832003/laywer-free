'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trash2, RefreshCw } from 'lucide-react'

interface Authority {
  id: string
  cluster_id: number
  status: string
  added_at: string
  cl_case_clusters: {
    case_name: string
    court_name: string | null
    date_filed: string | null
    citations: unknown
    snippet: string | null
  } | null
}

interface AuthorityListProps {
  caseId: string
  initialAuthorities: Authority[]
}

export function AuthorityList({ caseId, initialAuthorities }: AuthorityListProps) {
  const [authorities, setAuthorities] = useState(initialAuthorities)

  async function handleRemove(clusterId: number) {
    try {
      await fetch(`/api/cases/${caseId}/research/authority`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cluster_id: clusterId }),
      })
      setAuthorities((prev) => prev.filter((a) => a.cluster_id !== clusterId))
    } catch {
      // silent fail
    }
  }

  async function handleRetry(clusterId: number) {
    try {
      await fetch(`/api/cases/${caseId}/research/authority`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cluster_id: clusterId }),
      })
      // Refresh the list
      const res = await fetch(`/api/cases/${caseId}/research/authority`)
      if (res.ok) {
        const data = await res.json()
        setAuthorities(data.authorities ?? [])
      }
    } catch {
      // silent fail
    }
  }

  if (authorities.length === 0) return null

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold" style={{ color: '#1C1917' }}>
        My Authorities ({authorities.length})
      </h3>
      {authorities.map((auth) => {
        const cluster = auth.cl_case_clusters
        return (
          <Card key={auth.id}>
            <CardContent className="pt-3 pb-2 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate" style={{ color: '#1C1917' }}>
                    {cluster?.case_name ?? 'Unknown Case'}
                  </p>
                  <Badge
                    variant={auth.status === 'ready' ? 'default' : auth.status === 'failed' ? 'destructive' : 'secondary'}
                    className="text-[10px] flex-shrink-0"
                  >
                    {auth.status === 'ready' ? 'Ready' : auth.status === 'failed' ? 'Failed' : 'Processing'}
                  </Badge>
                </div>
                <p className="text-xs" style={{ color: '#78716C' }}>
                  {cluster?.court_name} {cluster?.date_filed ? `\u00b7 ${cluster.date_filed}` : ''}
                </p>
              </div>
              <div className="flex gap-1">
                {auth.status === 'failed' && (
                  <Button variant="ghost" size="sm" onClick={() => handleRetry(auth.cluster_id)}>
                    <RefreshCw className="h-3.5 w-3.5" />
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => handleRemove(auth.cluster_id)}>
                  <Trash2 className="h-3.5 w-3.5" style={{ color: '#D97706' }} />
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
