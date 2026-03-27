'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Trash2, RefreshCw, Star, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Authority {
  id: string
  cluster_id: number
  status: string
  pinned: boolean
  folder_id: string | null
  tags: string[] | null
  added_at: string
  cl_case_clusters: {
    case_name: string
    court_name: string | null
    date_filed: string | null
    citations: unknown
    snippet: string | null
  } | null
  authority_folders: {
    id: string
    name: string
  } | null
}

interface AuthorityListProps {
  authorities: Authority[]
  folders: Array<{ id: string; name: string }>
  onRemove: (clusterId: number) => void
  onRetry: (clusterId: number) => void
  onTogglePinned: (authority: Authority) => void
  onFolderChange: (authority: Authority, folderId: string | null) => void
  onAddTag: (authority: Authority, tag: string) => void
  onRemoveTag: (authority: Authority, tag: string) => void
  title?: string
}

export function AuthorityList({
  authorities,
  folders,
  onRemove,
  onRetry,
  onTogglePinned,
  onFolderChange,
  onAddTag,
  onRemoveTag,
  title = 'Authorities',
}: AuthorityListProps) {
  const [tagInputs, setTagInputs] = useState<Record<string, string>>({})

  if (authorities.length === 0) return null

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold" style={{ color: '#1C1917' }}>
        {title} ({authorities.length})
      </h3>
      {authorities.map((auth) => {
        const cluster = auth.cl_case_clusters
        const tags = auth.tags ?? []
        return (
          <Card key={auth.id}>
            <CardContent className="pt-3 pb-3 space-y-3">
              <div className="flex items-center justify-between gap-3">
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onTogglePinned(auth)}
                    aria-label={auth.pinned ? 'Unpin authority' : 'Pin authority'}
                  >
                    <Star className={cn('h-3.5 w-3.5', auth.pinned ? 'text-calm-amber' : 'text-warm-muted')} />
                  </Button>
                  {auth.status === 'failed' && (
                    <Button variant="ghost" size="sm" onClick={() => onRetry(auth.cluster_id)}>
                      <RefreshCw className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => onRemove(auth.cluster_id)}>
                    <Trash2 className="h-3.5 w-3.5" style={{ color: '#D97706' }} />
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <label className="text-xs font-medium text-warm-muted">Folder</label>
                <select
                  className="rounded-md border border-warm-border bg-white px-2 py-1 text-xs text-warm-text"
                  value={auth.folder_id ?? ''}
                  onChange={(event) => onFolderChange(auth, event.target.value || null)}
                >
                  <option value="">Unassigned</option>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>{folder.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-warm-muted">
                  <Tag className="h-3.5 w-3.5" />
                  Tags
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.length === 0 && (
                    <span className="text-xs text-warm-muted">No tags yet</span>
                  )}
                  {tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => onRemoveTag(auth, tag)}
                      className="rounded-full border border-warm-border bg-warm-bg px-2 py-0.5 text-xs text-warm-text hover:border-calm-amber"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={tagInputs[auth.id] ?? ''}
                    onChange={(event) => setTagInputs((prev) => ({ ...prev, [auth.id]: event.target.value }))}
                    placeholder="Add tag"
                    className="h-8 text-xs"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const value = tagInputs[auth.id] ?? ''
                      if (!value.trim()) return
                      onAddTag(auth, value)
                      setTagInputs((prev) => ({ ...prev, [auth.id]: '' }))
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
