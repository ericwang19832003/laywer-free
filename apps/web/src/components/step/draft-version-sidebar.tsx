'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { History, Check, RotateCcw, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DraftVersion {
  id: string
  version_number: number
  source: 'generated' | 'edited'
  content: string
  created_at: string
}

interface DraftVersionSidebarProps {
  caseId: string
  taskId: string
  currentDraft: string
  onRestore: (content: string) => void
}

function sourceLabel(source: string, version: number): string {
  if (source === 'edited') return `Version ${version} \u2014 Your edits`
  if (version === 1) return `Version ${version} \u2014 Generated`
  return `Version ${version} \u2014 Regenerated`
}

function formatTime(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)

  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`

  const diffHrs = Math.floor(diffMin / 60)
  if (diffHrs < 24) return `${diffHrs}h ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function DraftVersionSidebar({
  caseId,
  taskId,
  currentDraft,
  onRestore,
}: DraftVersionSidebarProps) {
  const [versions, setVersions] = useState<DraftVersion[]>([])
  const [loading, setLoading] = useState(true)
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [restoring, setRestoring] = useState(false)

  const fetchVersions = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/cases/${caseId}/draft-versions?taskId=${taskId}`
      )
      if (res.ok) {
        const data = await res.json()
        setVersions(data.versions ?? [])
      }
    } catch {
      // Silently fail — sidebar is supplementary
    } finally {
      setLoading(false)
    }
  }, [caseId, taskId])

  useEffect(() => {
    fetchVersions()
  }, [fetchVersions])

  const latestVersion = versions[0] ?? null
  const isCurrentLatest = latestVersion?.content === currentDraft

  const handleRestore = async (version: DraftVersion) => {
    setRestoring(true)
    try {
      onRestore(version.content)
      setPreviewId(null)
    } finally {
      setRestoring(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4 flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-warm-muted" />
          <span className="text-sm text-warm-muted">Loading versions...</span>
        </CardContent>
      </Card>
    )
  }

  if (versions.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <History className="h-4 w-4 text-warm-muted" />
          Version History
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        {versions.map((version) => {
          const isCurrent = version.content === currentDraft
          const isPreviewing = previewId === version.id

          return (
            <button
              key={version.id}
              type="button"
              onClick={() =>
                setPreviewId(isPreviewing ? null : version.id)
              }
              className={cn(
                'w-full text-left rounded-lg border p-3 transition-colors',
                isCurrent
                  ? 'border-primary/30 bg-primary/5'
                  : 'border-warm-border hover:border-primary/20 hover:bg-warm-bg/50',
                isPreviewing && !isCurrent && 'border-calm-amber/30 bg-calm-amber/5'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-warm-text">
                  {sourceLabel(version.source, version.version_number)}
                </span>
                {isCurrent && (
                  <span className="flex items-center gap-1 text-xs text-primary">
                    <Check className="h-3 w-3" />
                    Current
                  </span>
                )}
              </div>
              <span className="text-xs text-warm-muted mt-1 block">
                {formatTime(version.created_at)}
              </span>

              {isPreviewing && !isCurrent && (
                <div className="mt-3 pt-3 border-t border-warm-border">
                  <p className="text-xs text-warm-muted mb-2 line-clamp-3">
                    {version.content.slice(0, 200)}...
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRestore(version)
                    }}
                    disabled={restoring}
                    className="w-full gap-1"
                  >
                    {restoring ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <RotateCcw className="h-3 w-3" />
                    )}
                    Restore this version
                  </Button>
                </div>
              )}
            </button>
          )
        })}

        {!isCurrentLatest && versions.length > 0 && (
          <p className="text-xs text-warm-muted text-center pt-1">
            You have unsaved edits.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
