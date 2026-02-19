'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { PlusIcon, FolderOpenIcon } from 'lucide-react'
import type { DiscoveryPack } from './types'
import { STATUS_STEPS } from './types'

// ── Helpers ────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-warm-border text-warm-text',
  ready: 'bg-calm-indigo/10 text-calm-indigo',
  served: 'bg-calm-amber/10 text-calm-amber',
  responses_pending: 'bg-calm-amber/10 text-calm-amber',
  complete: 'bg-calm-green/10 text-calm-green',
}

function statusLabel(status: string): string {
  return STATUS_STEPS.find((s) => s.key === status)?.label ?? status
}

// ── Component ────────────────────────────────────────

interface DiscoveryListViewProps {
  caseId: string
  initialPacks: DiscoveryPack[]
}

export function DiscoveryListView({ caseId, initialPacks }: DiscoveryListViewProps) {
  const router = useRouter()
  const [packs, setPacks] = useState<DiscoveryPack[]>(initialPacks)
  const [showCreate, setShowCreate] = useState(false)
  const [title, setTitle] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCreate() {
    setCreating(true)
    setError(null)

    try {
      const res = await fetch(`/api/cases/${caseId}/discovery/packs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim() || undefined }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to create pack')
      }

      const { pack } = await res.json()
      setPacks((prev) => [pack, ...prev])
      setTitle('')
      setShowCreate(false)

      // Navigate to the new pack
      router.push(`/case/${caseId}/discovery/packs/${pack.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Create pack CTA */}
      {!showCreate ? (
        <Button onClick={() => setShowCreate(true)} className="w-full sm:w-auto">
          <PlusIcon className="size-4" />
          Create a discovery pack
        </Button>
      ) : (
        <Card>
          <CardContent className="py-5 space-y-4">
            <h2 className="font-medium text-warm-text">New discovery pack</h2>
            <Input
              placeholder="e.g., First Set of Interrogatories"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              autoFocus
            />
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Button onClick={handleCreate} disabled={creating}>
                {creating ? 'Creating...' : 'Create'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowCreate(false)
                  setTitle('')
                  setError(null)
                }}
                disabled={creating}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pack list */}
      {packs.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <FolderOpenIcon className="size-8 text-warm-muted mx-auto mb-3" />
            <p className="text-warm-muted">
              No discovery packs yet. Create one to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {packs.map((pack) => (
            <Card
              key={pack.id}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => router.push(`/case/${caseId}/discovery/packs/${pack.id}`)}
              role="link"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  router.push(`/case/${caseId}/discovery/packs/${pack.id}`)
                }
              }}
            >
              <CardContent className="py-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-warm-text truncate">
                      {pack.title}
                    </p>
                    <p className="text-xs text-warm-muted mt-0.5">
                      Created {formatDate(pack.created_at)}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`text-xs shrink-0 ${STATUS_COLORS[pack.status] ?? ''}`}
                  >
                    {statusLabel(pack.status)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
