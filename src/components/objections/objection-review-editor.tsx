'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Loader2Icon,
  CheckCircleIcon,
  FlagIcon,
  ShieldCheckIcon,
  FileTextIcon,
} from 'lucide-react'
import { OBJECTION_LABELS } from '@/lib/schemas/objection-classification'
import type { ObjectionLabel } from '@/lib/schemas/objection-classification'

// ── Types ────────────────────────────────────────

interface ObjectionItem {
  id: string
  review_id: string
  item_type: string
  item_no: number | null
  labels: string[]
  neutral_summary: string | null
  follow_up_flag: boolean
  confidence: number | null
  status: string
  created_at: string
}

interface ObjectionReview {
  id: string
  case_id: string
  pack_id: string
  response_id: string
  status: string
  model: string | null
  prompt_version: string | null
  error: string | null
  created_at: string
}

interface Props {
  caseId: string
  packId: string
  review: ObjectionReview
  initialItems: ObjectionItem[]
}

// ── Label display helpers ────────────────────────

const LABEL_DISPLAY: Record<string, string> = {
  relevance: 'Relevance',
  overbroad: 'Overbroad',
  vague_ambiguous: 'Vague / Ambiguous',
  undue_burden: 'Undue Burden',
  privilege: 'Privilege',
  confidentiality: 'Confidentiality',
  not_in_possession: 'Not in Possession',
  already_produced: 'Already Produced',
  premature: 'Premature',
  general_objection: 'General Objection',
  non_responsive: 'Non-responsive',
  incomplete: 'Incomplete',
  other: 'Other',
}

const TYPE_DISPLAY: Record<string, string> = {
  rfp: 'Request for Production',
  rog: 'Interrogatory',
  rfa: 'Request for Admission',
  unknown: 'Discovery Item',
}

const TYPE_SHORT: Record<string, string> = {
  rfp: 'RFP',
  rog: 'ROG',
  rfa: 'RFA',
  unknown: 'Item',
}

function confidenceLevel(value: number | null): { label: string; className: string } {
  if (value === null) return { label: 'Unknown', className: 'text-warm-muted' }
  if (value >= 0.8) return { label: 'High', className: 'text-calm-green' }
  if (value >= 0.5) return { label: 'Medium', className: 'text-calm-amber' }
  return { label: 'Low', className: 'text-warm-muted' }
}

function itemTitle(item: { item_type: string; item_no: number | null }): string {
  const type = TYPE_SHORT[item.item_type] ?? 'Item'
  if (item.item_no) return `${type} #${item.item_no}`
  return 'Unnumbered section'
}

// ── Editable item state ──────────────────────────

interface EditableItem {
  id: string
  item_type: string
  item_no: number | null
  labels: ObjectionLabel[]
  neutral_summary: string
  follow_up_flag: boolean
  confidence: number | null
  original_labels: string[]
}

function toEditable(item: ObjectionItem): EditableItem {
  return {
    id: item.id,
    item_type: item.item_type,
    item_no: item.item_no,
    labels: (item.labels ?? []) as ObjectionLabel[],
    neutral_summary: item.neutral_summary ?? '',
    follow_up_flag: item.follow_up_flag,
    confidence: item.confidence,
    original_labels: item.labels ?? [],
  }
}

// ── Main Component ───────────────────────────────

export function ObjectionReviewEditor({ caseId, packId, review, initialItems }: Props) {
  const router = useRouter()
  const [items, setItems] = useState<EditableItem[]>(() => initialItems.map(toEditable))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(review.status === 'completed')

  // Meet-and-confer state
  const [draftPreview, setDraftPreview] = useState<string | null>(null)
  const [draftId, setDraftId] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const followUpItems = items.filter((i) => i.follow_up_flag)

  const updateItem = useCallback((id: string, updates: Partial<EditableItem>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)))
  }, [])

  const toggleLabel = useCallback((itemId: string, label: ObjectionLabel) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item
        const has = item.labels.includes(label)
        const next = has ? item.labels.filter((l) => l !== label) : [...item.labels, label]
        // Ensure at least one label remains
        if (next.length === 0) return item
        return { ...item, labels: next }
      })
    )
  }, [])

  const toggleFollowUp = useCallback((itemId: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, follow_up_flag: !item.follow_up_flag } : item
      )
    )
  }, [])

  const handleConfirm = useCallback(async () => {
    setSaving(true)
    setError(null)

    try {
      const payload = {
        items: items.map((item) => ({
          id: item.id,
          labels: item.labels,
          neutral_summary: item.neutral_summary,
          follow_up_flag: item.follow_up_flag,
        })),
      }

      const res = await fetch(`/api/objections/reviews/${review.id}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Failed to confirm review')
      }

      setConfirmed(true)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }, [items, review.id, router])

  const handleGenerateDraft = useCallback(async () => {
    setGenerating(true)
    setError(null)

    try {
      const res = await fetch(`/api/objections/reviews/${review.id}/meet-and-confer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Failed to generate note')
      }

      const data = await res.json()
      setDraftPreview(data.draft.content_text)
      setDraftId(data.draft.id)
      setShowPreview(true)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setGenerating(false)
    }
  }, [review.id, router])

  // ── Already confirmed ──────────────────────────

  if (confirmed) {
    return (
      <div className="space-y-6">
        <div className="rounded-md border border-calm-green/30 bg-calm-green/5 px-4 py-3">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="size-4 text-calm-green shrink-0" />
            <p className="text-sm font-medium text-warm-text">
              Review confirmed. Your classifications have been saved.
            </p>
          </div>
        </div>

        {/* Read-only item summary */}
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="pt-4 pb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-warm-text">{itemTitle(item)}</p>
                  {item.follow_up_flag && (
                    <Badge variant="outline" className="text-xs shrink-0 border-calm-amber/30 text-calm-amber">
                      <FlagIcon className="mr-1 size-3" />
                      Follow up
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {item.labels.map((label) => (
                    <Badge key={label} variant="secondary" className="text-xs">
                      {LABEL_DISPLAY[label] ?? label}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-warm-muted">{item.neutral_summary}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Error banner */}
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="outline" asChild>
            <Link href={`/case/${caseId}/discovery/packs/${packId}`}>
              Back to discovery pack
            </Link>
          </Button>

          {followUpItems.length > 0 && (
            <Button
              variant="outline"
              onClick={handleGenerateDraft}
              disabled={generating}
            >
              {generating ? (
                <>
                  <Loader2Icon className="mr-2 size-4 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <FileTextIcon className="mr-2 size-4" />
                  Generate meet-and-confer note
                </>
              )}
            </Button>
          )}
        </div>

        {/* Meet-and-confer preview dialog */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-h-[85vh] flex flex-col sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Meet-and-confer note</DialogTitle>
              <DialogDescription>
                Review the draft below. You can copy it or come back to it later.
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto min-h-0">
              <pre className="whitespace-pre-wrap text-sm text-warm-text font-sans leading-relaxed">
                {draftPreview}
              </pre>
            </div>
            <p className="text-xs text-warm-muted text-center pt-2 border-t border-warm-border">
              For reference only. This is not legal advice.
            </p>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // ── Editor mode ────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Disclaimer box */}
      <div className="flex items-start gap-2.5 rounded-md border border-calm-amber/30 bg-calm-amber/5 px-3.5 py-3">
        <ShieldCheckIcon className="size-4 text-calm-amber mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-warm-text">For organization only. Not legal advice.</p>
          <p className="text-xs text-warm-muted mt-1">
            These classifications were generated by AI to help you organize your review.
            Edit anything that doesn&apos;t look right, then confirm when you&apos;re satisfied.
          </p>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Item cards */}
      <div className="space-y-4">
        <p className="text-xs font-medium text-warm-muted uppercase tracking-wide">
          Objections ({items.length})
        </p>

        {items.map((item, idx) => (
          <ItemCard
            key={item.id}
            item={item}
            onToggleLabel={toggleLabel}
            onToggleFollowUp={toggleFollowUp}
            onUpdateSummary={(summary) => updateItem(item.id, { neutral_summary: summary })}
          />
        ))}
      </div>

      {/* Follow-up summary panel */}
      {followUpItems.length > 0 && (
        <Card className="border-calm-amber/20 bg-calm-amber/5">
          <CardContent className="pt-4 pb-4 space-y-3">
            <div className="flex items-center gap-2">
              <FlagIcon className="size-4 text-calm-amber" />
              <p className="text-sm font-medium text-warm-text">
                Items flagged for follow-up ({followUpItems.length})
              </p>
            </div>
            <ul className="space-y-2">
              {followUpItems.map((item) => (
                <li key={item.id} className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-calm-amber" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-warm-text">{itemTitle(item)}</p>
                    <p className="text-xs text-warm-muted mt-0.5">{item.neutral_summary}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="text-xs text-warm-muted">
              You can use these flagged items to draft a meet-and-confer letter after confirming.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Action buttons */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/case/${caseId}/discovery/packs/${packId}`} className="text-calm-indigo">
            Back to discovery pack
          </Link>
        </Button>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            onClick={handleConfirm}
            disabled={saving}
            className="order-first sm:order-last"
          >
            {saving ? (
              <>
                <Loader2Icon className="mr-2 size-4 animate-spin" />
                Saving…
              </>
            ) : (
              'Confirm & Save'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Item Card ────────────────────────────────────

interface ItemCardProps {
  item: EditableItem
  onToggleLabel: (itemId: string, label: ObjectionLabel) => void
  onToggleFollowUp: (itemId: string) => void
  onUpdateSummary: (summary: string) => void
}

function ItemCard({ item, onToggleLabel, onToggleFollowUp, onUpdateSummary }: ItemCardProps) {
  const conf = confidenceLevel(item.confidence)

  return (
    <Card>
      <CardContent className="pt-4 pb-4 space-y-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Badge variant="outline" className="text-xs shrink-0">
              {itemTitle(item)}
            </Badge>
            <span className="text-xs text-warm-muted">
              {TYPE_DISPLAY[item.item_type] ?? item.item_type}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className={`text-xs font-medium ${conf.className}`}>
              {conf.label} confidence
            </span>
          </div>
        </div>

        {/* Labels multi-select */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-warm-muted">Classifications</p>
          <div className="flex flex-wrap gap-1.5">
            {OBJECTION_LABELS.map((label) => {
              const active = item.labels.includes(label)
              return (
                <button
                  key={label}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onToggleLabel(item.id, label)}
                  className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                    active
                      ? 'border-calm-indigo bg-calm-indigo/10 text-calm-indigo'
                      : 'border-warm-border text-warm-muted hover:border-warm-text hover:text-warm-text'
                  }`}
                >
                  {LABEL_DISPLAY[label] ?? label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Summary textarea */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-warm-muted">Summary</p>
          <Textarea
            value={item.neutral_summary}
            onChange={(e) => onUpdateSummary(e.target.value)}
            rows={2}
            className="text-sm"
            placeholder="One sentence, factual summary…"
          />
        </div>

        {/* Follow-up toggle */}
        <label className="flex cursor-pointer items-center justify-between rounded-lg border border-warm-border px-4 py-3 transition-colors hover:bg-warm-bg">
          <div>
            <p className="text-sm font-medium text-warm-text">Flag for follow-up</p>
            <p className="text-xs text-warm-muted">Mark if this objection may need further discussion.</p>
          </div>
          <div className="relative ml-4 shrink-0">
            <input
              type="checkbox"
              className="peer sr-only"
              aria-label={`Flag ${itemTitle(item)} for follow-up`}
              checked={item.follow_up_flag}
              onChange={() => onToggleFollowUp(item.id)}
            />
            <div className="h-5 w-9 rounded-full bg-warm-border transition-colors peer-checked:bg-calm-indigo" />
            <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
          </div>
        </label>
      </CardContent>
    </Card>
  )
}
