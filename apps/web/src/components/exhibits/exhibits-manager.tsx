'use client'

import { useState, useRef, useCallback, useMemo } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  GripVerticalIcon,
  PlusIcon,
  DownloadIcon,
  Trash2Icon,
  PackageIcon,
  FileTextIcon,
  Loader2Icon,
  SearchIcon,
  CheckIcon,
  ListOrderedIcon,
} from 'lucide-react'
import { toast } from 'sonner'

// ── Types ──────────────────────────────────────

export interface ExhibitSet {
  id: string
  case_id: string
  title: string | null
  numbering_style: string
  next_number: number
  created_at: string
}

export interface Exhibit {
  id: string
  exhibit_set_id: string
  evidence_item_id: string
  exhibit_no: string
  sort_order: number
  title: string | null
  description: string | null
  created_at: string
}

export interface EvidenceItem {
  id: string
  file_name: string
  label: string | null
  created_at: string
}

// ── Helpers ────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// ── Main Component ─────────────────────────────

interface ExhibitsManagerProps {
  caseId: string
  initialSet: ExhibitSet | null
  initialExhibits: Exhibit[]
  evidenceItems: EvidenceItem[]
}

export function ExhibitsManager({
  caseId,
  initialSet,
  initialExhibits,
  evidenceItems,
}: ExhibitsManagerProps) {
  const [activeSet, setActiveSet] = useState<ExhibitSet | null>(initialSet)
  const [exhibits, setExhibits] = useState<Exhibit[]>(initialExhibits)
  const [renumbering, setRenumbering] = useState(false)
  const [showRenumberPrompt, setShowRenumberPrompt] = useState(false)
  const [addingEvidence, setAddingEvidence] = useState<string | null>(null)

  // Derive unexhibited evidence from props — no extra fetch needed
  const unexhibitedEvidence = useMemo(() => {
    const exhibitedIds = new Set(exhibits.map((e) => e.evidence_item_id))
    return evidenceItems.filter((e) => !exhibitedIds.has(e.id))
  }, [exhibits, evidenceItems])

  async function handleRenumber() {
    if (!activeSet) return
    setRenumbering(true)
    try {
      const res = await fetch(`/api/exhibit-sets/${activeSet.id}/renumber`, {
        method: 'POST',
      })
      if (!res.ok) throw new Error('Failed to renumber')
      const { exhibits: renumbered } = await res.json()
      setExhibits(renumbered)
      toast.success('Exhibits renumbered successfully')
      setShowRenumberPrompt(false)
    } catch {
      toast.error('Failed to renumber exhibits')
    } finally {
      setRenumbering(false)
    }
  }

  function handleExhibitRemoved(updatedExhibits: Exhibit[]) {
    setExhibits(updatedExhibits)
    // If there are still exhibits after removal, prompt to renumber
    if (updatedExhibits.length > 0) {
      setShowRenumberPrompt(true)
    }
  }

  async function handleAddAsExhibit(evidenceItemId: string) {
    if (!activeSet) return
    setAddingEvidence(evidenceItemId)
    try {
      const res = await fetch(`/api/exhibit-sets/${activeSet.id}/exhibits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evidence_item_id: evidenceItemId }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to add exhibit')
      }
      const { exhibit } = await res.json()
      setExhibits((prev) => [...prev, exhibit])
      toast.success('Evidence added as exhibit')
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to add exhibit'
      )
    } finally {
      setAddingEvidence(null)
    }
  }

  return (
    <div className="space-y-6">
      {!activeSet ? (
        <CreateSetSection caseId={caseId} onCreated={setActiveSet} />
      ) : (
        <>
          <SetHeader activeSet={activeSet} />
          <div className="flex items-center gap-2 flex-wrap">
            <AddFromVaultButton
              caseId={caseId}
              activeSet={activeSet}
              exhibits={exhibits}
              evidenceItems={evidenceItems}
              onExhibitAdded={(exhibit) =>
                setExhibits((prev) => [...prev, exhibit])
              }
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleRenumber}
              disabled={renumbering || exhibits.length === 0}
            >
              {renumbering ? (
                <Loader2Icon className="size-3.5 animate-spin" />
              ) : (
                <ListOrderedIcon className="size-3.5" />
              )}
              Renumber
            </Button>
          </div>

          {showRenumberPrompt && (
            <div className="flex items-center gap-2 rounded-lg border border-calm-amber/30 bg-calm-amber/5 px-3 py-2 text-sm">
              <span className="text-warm-text">
                Exhibits have gaps in numbering.
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={handleRenumber}
                disabled={renumbering}
              >
                {renumbering && (
                  <Loader2Icon className="size-3 animate-spin" />
                )}
                Renumber to close gaps
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowRenumberPrompt(false)}
              >
                Dismiss
              </Button>
            </div>
          )}

          {exhibits.length === 0 ? (
            <EmptyState />
          ) : (
            <ExhibitsList
              caseId={caseId}
              setId={activeSet.id}
              exhibits={exhibits}
              evidenceItems={evidenceItems}
              onExhibitsChange={setExhibits}
              onExhibitRemoved={handleExhibitRemoved}
            />
          )}

          {/* Unexhibited Evidence Section */}
          {unexhibitedEvidence.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-warm-text mb-3">
                Unexhibited Evidence ({unexhibitedEvidence.length})
              </h3>
              <div className="space-y-2">
                {unexhibitedEvidence.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border border-warm-border bg-white px-3 py-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileTextIcon className="size-4 text-warm-muted shrink-0" />
                      <span className="text-sm text-warm-text truncate">
                        {item.label || item.file_name}
                      </span>
                      {item.label && (
                        <span className="text-xs text-warm-muted hidden sm:inline">
                          {item.file_name}
                        </span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddAsExhibit(item.id)}
                      disabled={addingEvidence === item.id}
                      className="shrink-0 ml-2"
                    >
                      {addingEvidence === item.id ? (
                        <Loader2Icon className="size-3 animate-spin" />
                      ) : (
                        <PlusIcon className="size-3" />
                      )}
                      Add as Exhibit
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ── Create Set ─────────────────────────────────

function CreateSetSection({
  caseId,
  onCreated,
}: {
  caseId: string
  onCreated: (set: ExhibitSet) => void
}) {
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCreate() {
    setCreating(true)
    setError(null)

    try {
      const res = await fetch(`/api/cases/${caseId}/exhibit-sets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numbering_style: 'numeric' }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create exhibit set')
      }

      const { exhibit_set } = await res.json()
      onCreated(exhibit_set)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setCreating(false)
    }
  }

  return (
    <Card>
      <CardContent className="py-12 text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-calm-indigo/10 flex items-center justify-center">
          <PackageIcon className="size-6 text-calm-indigo" />
        </div>
        <div>
          <p className="font-medium text-warm-text">
            No exhibits yet. Add your first document from Evidence Vault.
          </p>
          <p className="text-sm text-warm-muted mt-1">
            We&apos;ll create a numbered exhibit list for you.
          </p>
        </div>
        {error && (
          <div className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 mx-auto max-w-sm">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
        <Button onClick={handleCreate} disabled={creating}>
          {creating ? (
            <>
              <Loader2Icon className="size-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <PlusIcon className="size-4" />
              Create exhibit list
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

// ── Set Header ─────────────────────────────────

function SetHeader({ activeSet }: { activeSet: ExhibitSet }) {
  return (
    <div className="flex items-center gap-2">
      <PackageIcon className="size-4 text-calm-indigo" />
      <h2 className="font-medium text-warm-text">
        {activeSet.title || 'Exhibit list'}
      </h2>
      <Badge variant="outline" className="text-xs">
        {activeSet.numbering_style === 'alpha' ? 'A–Z' : '1, 2, 3…'}
      </Badge>
    </div>
  )
}

// ── Add from Vault ─────────────────────────────

function AddFromVaultButton({
  caseId,
  activeSet,
  exhibits,
  evidenceItems,
  onExhibitAdded,
}: {
  caseId: string
  activeSet: ExhibitSet
  exhibits: Exhibit[]
  evidenceItems: EvidenceItem[]
  onExhibitAdded: (exhibit: Exhibit) => void
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [adding, setAdding] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const usedEvidenceIds = new Set(exhibits.map((e) => e.evidence_item_id))
  const available = evidenceItems.filter((e) => !usedEvidenceIds.has(e.id))

  const filtered = search.trim()
    ? available.filter(
        (e) =>
          e.file_name.toLowerCase().includes(search.toLowerCase()) ||
          e.label?.toLowerCase().includes(search.toLowerCase())
      )
    : available

  async function handleAdd(evidenceItemId: string) {
    setAdding(evidenceItemId)
    setError(null)

    try {
      const res = await fetch(`/api/exhibit-sets/${activeSet.id}/exhibits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evidence_item_id: evidenceItemId }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to add exhibit')
      }

      const { exhibit } = await res.json()
      onExhibitAdded(exhibit)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setAdding(null)
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setOpen(true)
          setSearch('')
          setError(null)
        }}
      >
        <PlusIcon className="size-3.5" />
        Add from Evidence Vault
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] flex flex-col sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add from Evidence Vault</DialogTitle>
            <DialogDescription>
              Choose a document to add as your next exhibit.
            </DialogDescription>
          </DialogHeader>

          {/* Search */}
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-warm-muted" />
            <Input
              placeholder="Search by name or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {error && (
            <div className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Items */}
          <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
            {available.length === 0 && (
              <div className="text-center py-12">
                <p className="text-sm text-warm-muted">
                  All evidence items are already in this exhibit list.
                </p>
              </div>
            )}

            {available.length > 0 && filtered.length === 0 && (
              <div className="text-center py-12">
                <p className="text-sm text-warm-muted">
                  No matching documents found.
                </p>
              </div>
            )}

            {filtered.map((item) => {
              const isAdding = adding === item.id
              // Check if it was just added (appeared in exhibits during this session)
              const justAdded = exhibits.some(
                (e) => e.evidence_item_id === item.id
              )

              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-md border border-warm-border p-3"
                >
                  <FileTextIcon className="size-4 text-warm-muted shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-warm-text truncate">
                      {item.file_name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {item.label && (
                        <span className="text-xs text-warm-muted">
                          {item.label}
                        </span>
                      )}
                      <span className="text-xs text-warm-muted">
                        {formatDate(item.created_at)}
                      </span>
                    </div>
                  </div>
                  {justAdded ? (
                    <CheckIcon className="size-4 text-calm-green shrink-0" />
                  ) : (
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => handleAdd(item.id)}
                      disabled={isAdding || adding !== null}
                    >
                      {isAdding ? (
                        <Loader2Icon className="size-3 animate-spin" />
                      ) : (
                        'Add'
                      )}
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ── Empty State ────────────────────────────────

function EmptyState() {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <FileTextIcon className="size-8 text-warm-muted mx-auto mb-3" />
        <p className="text-sm text-warm-muted">
          No exhibits yet. Add your first document from Evidence Vault.
        </p>
      </CardContent>
    </Card>
  )
}

// ── Exhibits List (sortable) ───────────────────

function ExhibitsList({
  caseId,
  setId,
  exhibits,
  evidenceItems,
  onExhibitsChange,
  onExhibitRemoved,
}: {
  caseId: string
  setId: string
  exhibits: Exhibit[]
  evidenceItems: EvidenceItem[]
  onExhibitsChange: (exhibits: Exhibit[]) => void
  onExhibitRemoved: (exhibits: Exhibit[]) => void
}) {
  const [saving, setSaving] = useState(false)

  const evidenceMap = new Map(evidenceItems.map((e) => [e.id, e]))

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return

      const oldIndex = exhibits.findIndex((e) => e.id === active.id)
      const newIndex = exhibits.findIndex((e) => e.id === over.id)
      const reordered = arrayMove(exhibits, oldIndex, newIndex)

      // Optimistic update
      onExhibitsChange(reordered)

      // Persist to server
      setSaving(true)
      try {
        await fetch(`/api/exhibit-sets/${setId}/exhibits/reorder`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ordered_exhibit_ids: reordered.map((e) => e.id),
          }),
        })
      } catch {
        // Revert on failure
        onExhibitsChange(exhibits)
      } finally {
        setSaving(false)
      }
    },
    [exhibits, setId, onExhibitsChange]
  )

  async function handleRemove(exhibitId: string) {
    // Optimistic remove
    const prev = exhibits
    const updated = exhibits.filter((e) => e.id !== exhibitId)
    onExhibitsChange(updated)

    try {
      const res = await fetch(`/api/exhibits/${exhibitId}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        onExhibitsChange(prev)
      } else {
        // Notify parent that an exhibit was removed (triggers renumber prompt)
        onExhibitRemoved(updated)
      }
    } catch {
      onExhibitsChange(prev)
    }
  }

  async function handleDownload(evidenceItemId: string) {
    try {
      const res = await fetch(
        `/api/cases/${caseId}/evidence/download?id=${evidenceItemId}`
      )
      if (!res.ok) return
      const { url } = await res.json()
      window.open(url, '_blank')
    } catch {
      // Silently fail
    }
  }

  async function handleTitleUpdate(exhibitId: string, title: string) {
    const res = await fetch(`/api/exhibits/${exhibitId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title || null }),
    })

    if (res.ok) {
      const { exhibit } = await res.json()
      onExhibitsChange(
        exhibits.map((e) => (e.id === exhibitId ? { ...e, ...exhibit } : e))
      )
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-warm-muted uppercase tracking-wide">
          {exhibits.length} exhibit{exhibits.length !== 1 ? 's' : ''}
        </p>
        {saving && (
          <p className="text-xs text-warm-muted flex items-center gap-1">
            <Loader2Icon className="size-3 animate-spin" />
            Saving order...
          </p>
        )}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={exhibits.map((e) => e.id)}
          strategy={verticalListSortingStrategy}
        >
          {exhibits.map((exhibit) => (
            <SortableExhibitRow
              key={exhibit.id}
              exhibit={exhibit}
              evidence={evidenceMap.get(exhibit.evidence_item_id)}
              onRemove={() => handleRemove(exhibit.id)}
              onDownload={() => handleDownload(exhibit.evidence_item_id)}
              onTitleUpdate={(title) =>
                handleTitleUpdate(exhibit.id, title)
              }
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  )
}

// ── Sortable Exhibit Row ───────────────────────

function SortableExhibitRow({
  exhibit,
  evidence,
  onRemove,
  onDownload,
  onTitleUpdate,
}: {
  exhibit: Exhibit
  evidence: EvidenceItem | undefined
  onRemove: () => void
  onDownload: () => void
  onTitleUpdate: (title: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: exhibit.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-md border bg-white ${
        isDragging
          ? 'border-calm-indigo shadow-md z-10 relative'
          : 'border-warm-border'
      }`}
    >
      <div className="flex items-start gap-2 p-3">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="mt-1 touch-none cursor-grab active:cursor-grabbing rounded p-0.5 hover:bg-warm-bg text-warm-muted"
          aria-label="Drag to reorder"
        >
          <GripVerticalIcon className="size-4" />
        </button>

        {/* Exhibit number badge */}
        <Badge
          variant="outline"
          className="text-xs shrink-0 mt-1 font-mono"
        >
          {exhibit.exhibit_no}
        </Badge>

        {/* Content */}
        <div className="min-w-0 flex-1 space-y-1">
          <InlineEditableTitle
            value={exhibit.title || ''}
            placeholder={evidence?.file_name || 'Untitled exhibit'}
            onSave={onTitleUpdate}
          />
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
            {evidence?.label && (
              <span className="text-xs text-warm-muted">{evidence.label}</span>
            )}
            {evidence && (
              <span className="text-xs text-warm-muted">
                {formatDate(evidence.created_at)}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onDownload}
            aria-label="Download file"
          >
            <DownloadIcon className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onRemove}
            aria-label="Remove exhibit"
            className="text-warm-muted hover:text-destructive"
          >
            <Trash2Icon className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Inline Editable Title ──────────────────────

function InlineEditableTitle({
  value,
  placeholder,
  onSave,
}: {
  value: string
  placeholder: string
  onSave: (title: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  function startEditing() {
    setDraft(value)
    setEditing(true)
    // Focus after render
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  function commit() {
    setEditing(false)
    const trimmed = draft.trim()
    if (trimmed !== value) {
      onSave(trimmed)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      commit()
    }
    if (e.key === 'Escape') {
      setEditing(false)
      setDraft(value)
    }
  }

  if (editing) {
    return (
      <Input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="h-7 text-sm px-1.5 -ml-1.5"
        maxLength={500}
      />
    )
  }

  return (
    <button
      onClick={startEditing}
      className="text-left text-sm font-medium text-warm-text hover:text-calm-indigo transition-colors truncate block w-full"
    >
      {value || (
        <span className="text-warm-muted font-normal">{placeholder}</span>
      )}
    </button>
  )
}
