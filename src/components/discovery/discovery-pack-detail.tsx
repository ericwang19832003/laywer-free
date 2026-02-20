'use client'

import { useState, useCallback, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircleIcon,
  CircleIcon,
  PlusIcon,
  UploadIcon,
  FileTextIcon,
  SendIcon,
  InboxIcon,
  AlertTriangleIcon,
  CalendarIcon,
} from 'lucide-react'
import type {
  DiscoveryPack,
  DiscoveryItem,
  ServiceLog,
  DiscoveryResponse,
} from './types'
import { STATUS_STEPS, ITEM_TYPE_SHORT, ITEM_TYPE_LABELS } from './types'

// ── Helpers ────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const TAB_KEYS = ['rfp', 'rog', 'rfa'] as const

// ── Status Progress Bar ────────────────────────────

function StatusProgress({ status }: { status: string }) {
  const currentIdx = STATUS_STEPS.findIndex((s) => s.key === status)

  return (
    <nav aria-label="Pack progress" className="mb-8">
      <ol className="flex items-center gap-0">
        {STATUS_STEPS.map((step, idx) => {
          const done = idx < currentIdx
          const active = idx === currentIdx

          return (
            <li key={step.key} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                {done ? (
                  <CheckCircleIcon className="size-5 text-calm-green" aria-hidden />
                ) : (
                  <CircleIcon
                    className={`size-5 ${active ? 'text-calm-indigo' : 'text-warm-border'}`}
                    aria-hidden
                  />
                )}
                <span
                  className={`text-xs font-medium ${
                    done
                      ? 'text-calm-green'
                      : active
                        ? 'text-calm-indigo'
                        : 'text-warm-muted'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {idx < STATUS_STEPS.length - 1 && (
                <div
                  className={`flex-1 h-px mx-2 mt-[-1.125rem] ${
                    idx < currentIdx ? 'bg-calm-green' : 'bg-warm-border'
                  }`}
                  aria-hidden
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

// ── Main Component ────────────────────────────────

interface DiscoveryPackDetailProps {
  caseId: string
  initialPack: DiscoveryPack
  initialItems: DiscoveryItem[]
  initialLogs: ServiceLog[]
  initialResponses: DiscoveryResponse[]
}

export function DiscoveryPackDetail({
  caseId,
  initialPack,
  initialItems,
  initialLogs,
  initialResponses,
}: DiscoveryPackDetailProps) {
  const [pack, setPack] = useState(initialPack)
  const [items, setItems] = useState(initialItems)
  const [logs, setLogs] = useState(initialLogs)
  const [responses, setResponses] = useState(initialResponses)

  return (
    <div className="space-y-8">
      <StatusProgress status={pack.status} />

      {/* Section A: Add Items (draft only) */}
      {pack.status === 'draft' && (
        <AddItemsSection packId={pack.id} items={items} onItemsChange={setItems} />
      )}

      {/* Items list (always visible if there are items) */}
      {items.length > 0 && (
        <ItemsList items={items} />
      )}

      {/* Section B: Review — mark ready */}
      {pack.status === 'draft' && items.length > 0 && (
        <ReviewSection
          packId={pack.id}
          itemCount={items.length}
          onStatusChange={(updated) => setPack(updated)}
        />
      )}

      {/* Section C: Service log */}
      {(pack.status === 'ready' || pack.status === 'served' || pack.status === 'responses_pending') && (
        <ServiceSection
          packId={pack.id}
          packStatus={pack.status}
          logs={logs}
          onLogAdded={(log) => setLogs((prev) => [log, ...prev])}
          onStatusChange={(updated) => setPack(updated)}
        />
      )}

      {/* Section C½: Response deadline */}
      {(pack.status === 'served' || pack.status === 'responses_pending') && (
        <DeadlineSection packId={pack.id} />
      )}

      {/* Section D: Responses inbox */}
      {(pack.status === 'served' || pack.status === 'responses_pending' || pack.status === 'complete') && (
        <ResponsesSection
          caseId={caseId}
          packId={pack.id}
          packStatus={pack.status}
          responses={responses}
          onResponseAdded={(r) => setResponses((prev) => [r, ...prev])}
          onStatusChange={(updated) => setPack(updated)}
        />
      )}

      {/* Complete state */}
      {pack.status === 'complete' && (
        <Card>
          <CardContent className="py-8 text-center">
            <CheckCircleIcon className="size-10 text-calm-green mx-auto mb-3" />
            <p className="font-medium text-warm-text">Discovery complete</p>
            <p className="text-sm text-warm-muted mt-1">
              All requests have been served and responses received.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ============================================
// Section A: Add Items
// ============================================

function AddItemsSection({
  packId,
  items,
  onItemsChange,
}: {
  packId: string
  items: DiscoveryItem[]
  onItemsChange: (items: DiscoveryItem[]) => void
}) {
  const [activeTab, setActiveTab] = useState<(typeof TAB_KEYS)[number]>('rog')
  const [promptText, setPromptText] = useState('')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [warnings, setWarnings] = useState<string[]>([])

  async function handleAdd() {
    if (!promptText.trim()) return
    setAdding(true)
    setError(null)
    setWarnings([])

    try {
      const res = await fetch(`/api/discovery/packs/${packId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_type: activeTab,
          prompt_text: promptText.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to add item')
      }

      onItemsChange([...items, data.item])
      setPromptText('')

      if (data.warnings?.length > 0) {
        setWarnings(data.warnings.map((w: { message: string }) => w.message))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setAdding(false)
    }
  }

  const tabCounts = TAB_KEYS.reduce(
    (acc, key) => {
      acc[key] = items.filter((i) => i.item_type === key).length
      return acc
    },
    {} as Record<string, number>
  )

  return (
    <Card>
      <CardContent className="py-5 space-y-4">
        <div className="flex items-center gap-2">
          <PlusIcon className="size-4 text-calm-indigo" />
          <h2 className="font-medium text-warm-text">Add discovery requests</h2>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-lg bg-warm-bg p-1" role="tablist">
          {TAB_KEYS.map((key) => (
            <button
              key={key}
              role="tab"
              aria-selected={activeTab === key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === key
                  ? 'bg-white text-warm-text shadow-sm'
                  : 'text-warm-muted hover:text-warm-text'
              }`}
            >
              {ITEM_TYPE_SHORT[key]}
              {tabCounts[key] > 0 && (
                <span className="ml-1.5 text-xs text-warm-muted">
                  ({tabCounts[key]})
                </span>
              )}
            </button>
          ))}
        </div>

        <p className="text-xs text-warm-muted">
          {ITEM_TYPE_LABELS[activeTab]}
        </p>

        {/* Input */}
        <Textarea
          placeholder={
            activeTab === 'rfp'
              ? 'Describe the documents you need...'
              : activeTab === 'rog'
                ? 'Write your question...'
                : 'State what you want admitted or denied...'
          }
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          className="min-h-20"
          maxLength={5000}
        />

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 space-y-1">
            {warnings.map((w, i) => (
              <div key={i} className="flex items-start gap-2">
                <AlertTriangleIcon className="size-3.5 text-calm-amber mt-0.5 shrink-0" />
                <p className="text-xs text-amber-800">{w}</p>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <Button
          onClick={handleAdd}
          disabled={!promptText.trim() || adding}
          className="w-full sm:w-auto"
        >
          {adding ? 'Adding...' : 'Add'}
        </Button>
      </CardContent>
    </Card>
  )
}

// ============================================
// Items List
// ============================================

function ItemsList({ items }: { items: DiscoveryItem[] }) {
  const grouped = TAB_KEYS.reduce(
    (acc, key) => {
      const filtered = items.filter((i) => i.item_type === key)
      if (filtered.length > 0) acc[key] = filtered
      return acc
    },
    {} as Record<string, DiscoveryItem[]>
  )

  if (Object.keys(grouped).length === 0) return null

  return (
    <div className="space-y-4">
      <h2 className="font-medium text-warm-text flex items-center gap-2">
        <FileTextIcon className="size-4 text-calm-indigo" />
        Your requests ({items.length})
      </h2>
      {Object.entries(grouped).map(([type, typeItems]) => (
        <div key={type} className="space-y-2">
          <p className="text-xs font-medium text-warm-muted uppercase tracking-wide">
            {ITEM_TYPE_LABELS[type]}
          </p>
          {typeItems.map((item) => (
            <Card key={item.id}>
              <CardContent className="py-3">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="text-xs shrink-0 mt-0.5">
                    {ITEM_TYPE_SHORT[item.item_type]} #{item.item_no}
                  </Badge>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-warm-text">
                      {item.prompt_text}
                    </p>
                    {item.generated_text && (
                      <p className="text-xs text-warm-muted mt-1.5 line-clamp-2 whitespace-pre-line">
                        {item.generated_text.split('\n').slice(2, 4).join(' ')}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ))}
    </div>
  )
}

// ============================================
// Section B: Review
// ============================================

function ReviewSection({
  packId,
  itemCount,
  onStatusChange,
}: {
  packId: string
  itemCount: number
  onStatusChange: (pack: DiscoveryPack) => void
}) {
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleMarkReady() {
    setUpdating(true)
    setError(null)

    try {
      const res = await fetch(`/api/discovery/packs/${packId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ready' }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to update status')
      }

      const { pack } = await res.json()
      onStatusChange(pack)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <Card>
      <CardContent className="py-5 space-y-3">
        <h2 className="font-medium text-warm-text">Review your pack</h2>
        <p className="text-sm text-warm-muted">
          You have {itemCount} request{itemCount !== 1 ? 's' : ''} ready to go.
          Once marked ready, you won't be able to add more items.
        </p>
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
        <Button onClick={handleMarkReady} disabled={updating}>
          {updating ? 'Updating...' : 'Mark ready for service'}
        </Button>
      </CardContent>
    </Card>
  )
}

// ============================================
// Section C: Service
// ============================================

function ServiceSection({
  packId,
  packStatus,
  logs,
  onLogAdded,
  onStatusChange,
}: {
  packId: string
  packStatus: string
  logs: ServiceLog[]
  onLogAdded: (log: ServiceLog) => void
  onStatusChange: (pack: DiscoveryPack) => void
}) {
  const [showForm, setShowForm] = useState(false)
  const [serviceMethod, setServiceMethod] = useState('')
  const [servedToEmail, setServedToEmail] = useState('')
  const [servedToName, setServedToName] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statusUpdating, setStatusUpdating] = useState(false)

  async function handleServe() {
    if (!serviceMethod.trim()) return
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch(`/api/discovery/packs/${packId}/serve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          served_at: new Date().toISOString(),
          service_method: serviceMethod.trim(),
          served_to_name: servedToName.trim() || undefined,
          served_to_email: servedToEmail.trim() || undefined,
          notes: notes.trim() || undefined,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to record service')
      }

      const { service_log } = await res.json()
      onLogAdded(service_log)

      // Reset form
      setServiceMethod('')
      setServedToEmail('')
      setServedToName('')
      setNotes('')
      setShowForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleTransition(targetStatus: string) {
    setStatusUpdating(true)
    try {
      const res = await fetch(`/api/discovery/packs/${packId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetStatus }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to update status')
      }
      const { pack } = await res.json()
      onStatusChange(pack)
    } catch {
      // Ignore — user can retry
    } finally {
      setStatusUpdating(false)
    }
  }

  return (
    <Card>
      <CardContent className="py-5 space-y-4">
        <div className="flex items-center gap-2">
          <SendIcon className="size-4 text-calm-indigo" />
          <h2 className="font-medium text-warm-text">Service log</h2>
        </div>

        {/* Status transition buttons */}
        {packStatus === 'ready' && logs.length === 0 && (
          <p className="text-sm text-warm-muted">
            Record how and when you served this discovery pack.
          </p>
        )}

        {packStatus === 'ready' && logs.length > 0 && (
          <Button
            onClick={() => handleTransition('served')}
            disabled={statusUpdating}
            size="sm"
          >
            {statusUpdating ? 'Updating...' : 'Mark as served'}
          </Button>
        )}

        {packStatus === 'served' && (
          <Button
            onClick={() => handleTransition('responses_pending')}
            disabled={statusUpdating}
            size="sm"
            variant="outline"
          >
            {statusUpdating ? 'Updating...' : 'Now waiting for responses'}
          </Button>
        )}

        {/* Existing logs */}
        {logs.length > 0 && (
          <div className="space-y-2">
            {logs.map((log) => (
              <div
                key={log.id}
                className="rounded-md border border-warm-border bg-warm-bg px-3 py-2.5"
              >
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-warm-text capitalize">
                    {log.service_method}
                  </span>
                  <span className="text-warm-muted">&middot;</span>
                  <span className="text-warm-muted">
                    {formatDateTime(log.served_at)}
                  </span>
                </div>
                {(log.served_to_name || log.served_to_email) && (
                  <p className="text-xs text-warm-muted mt-1">
                    To: {[log.served_to_name, log.served_to_email].filter(Boolean).join(' — ')}
                  </p>
                )}
                {log.notes && (
                  <p className="text-xs text-warm-muted mt-1">{log.notes}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add service log form */}
        {!showForm ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowForm(true)}
          >
            <PlusIcon className="size-3.5" />
            Record service
          </Button>
        ) : (
          <div className="space-y-3 rounded-md border border-warm-border p-4">
            <div className="space-y-2">
              <Label>Service method</Label>
              <Input
                placeholder="e.g., email, certified mail, hand delivery"
                value={serviceMethod}
                onChange={(e) => setServiceMethod(e.target.value)}
                autoFocus
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>
                  Recipient name{' '}
                  <span className="text-warm-muted font-normal">(optional)</span>
                </Label>
                <Input
                  placeholder="Jane Doe, Esq."
                  value={servedToName}
                  onChange={(e) => setServedToName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>
                  Recipient email{' '}
                  <span className="text-warm-muted font-normal">(optional)</span>
                </Label>
                <Input
                  type="email"
                  placeholder="jane@lawfirm.com"
                  value={servedToEmail}
                  onChange={(e) => setServedToEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>
                Notes <span className="text-warm-muted font-normal">(optional)</span>
              </Label>
              <Textarea
                placeholder="Any details about the service..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-16"
                maxLength={5000}
              />
            </div>

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button
                onClick={handleServe}
                disabled={!serviceMethod.trim() || submitting}
              >
                {submitting ? 'Recording...' : 'Record service'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowForm(false)
                  setError(null)
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================
// Section C½: Response Deadline
// ============================================

function DeadlineSection({ packId }: { packId: string }) {
  const [dueAt, setDueAt] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedDate, setSavedDate] = useState<string | null>(null)

  async function handleSubmit() {
    if (!dueAt) return
    setSubmitting(true)
    setError(null)

    try {
      const isoDate = new Date(dueAt).toISOString()
      const res = await fetch(`/api/discovery/packs/${packId}/deadline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ due_at: isoDate }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to set deadline')
      }

      const { deadline } = await res.json()
      setSavedDate(deadline.due_at)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardContent className="py-5 space-y-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="size-4 text-calm-indigo" />
          <h2 className="font-medium text-warm-text">Response due date</h2>
        </div>

        {savedDate ? (
          <div className="space-y-2">
            <div className="rounded-md border border-calm-green/30 bg-calm-green/5 px-3 py-2.5">
              <p className="text-sm font-medium text-warm-text">
                Response due: {formatDate(savedDate)}
              </p>
              <p className="text-xs text-warm-muted mt-1">
                We&apos;ll remind you at 7, 3, and 1 day(s) before.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSavedDate(null)}
            >
              Update date
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="deadline-due-at">Due date</Label>
              <Input
                id="deadline-due-at"
                type="datetime-local"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
              />
              <p className="text-xs text-warm-muted">
                Based on the date you provided. Please follow your court&apos;s rules.
              </p>
            </div>

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <Button
              onClick={handleSubmit}
              disabled={!dueAt || submitting}
            >
              {submitting ? 'Setting...' : 'Set response due date'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================
// Section D: Responses Inbox
// ============================================

function ResponsesSection({
  caseId,
  packId,
  packStatus,
  responses,
  onResponseAdded,
  onStatusChange,
}: {
  caseId: string
  packId: string
  packStatus: string
  responses: DiscoveryResponse[]
  onResponseAdded: (r: DiscoveryResponse) => void
  onStatusChange: (pack: DiscoveryPack) => void
}) {
  const [file, setFile] = useState<File | null>(null)
  const [responseType, setResponseType] = useState('')
  const [notes, setNotes] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statusUpdating, setStatusUpdating] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const dropped = e.dataTransfer.files[0]
    if (dropped) setFile(dropped)
  }, [])

  async function handleUpload() {
    if (!file || !responseType.trim()) return
    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('response_type', responseType.trim())
      formData.append('received_at', new Date().toISOString())
      if (notes.trim()) formData.append('notes', notes.trim())

      const res = await fetch(`/api/discovery/packs/${packId}/responses`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Upload failed')
      }

      const { response } = await res.json()
      onResponseAdded(response)

      // Reset form
      setFile(null)
      setResponseType('')
      setNotes('')
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function handleComplete() {
    setStatusUpdating(true)
    try {
      const res = await fetch(`/api/discovery/packs/${packId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'complete' }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to update status')
      }
      const { pack } = await res.json()
      onStatusChange(pack)
    } catch {
      // Ignore
    } finally {
      setStatusUpdating(false)
    }
  }

  return (
    <Card>
      <CardContent className="py-5 space-y-4">
        <div className="flex items-center gap-2">
          <InboxIcon className="size-4 text-calm-indigo" />
          <h2 className="font-medium text-warm-text">Responses</h2>
        </div>

        {packStatus !== 'complete' && (
          <>
            {/* Upload area */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-8 cursor-pointer transition-colors ${
                file
                  ? 'border-calm-green bg-calm-green/5'
                  : 'border-warm-border hover:border-warm-muted'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.tiff,.doc,.docx"
                className="hidden"
                onChange={(e) => {
                  const selected = e.target.files?.[0]
                  if (selected) setFile(selected)
                }}
              />
              <UploadIcon className="size-6 text-warm-muted mb-2" />
              {file ? (
                <div className="text-center">
                  <p className="text-sm font-medium text-warm-text">{file.name}</p>
                  <p className="text-xs text-warm-muted mt-0.5">
                    {formatFileSize(file.size)} &middot; Click or drop to replace
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-warm-text">
                    Drop a response document here, or click to browse
                  </p>
                  <p className="text-xs text-warm-muted mt-0.5">
                    PDF, Word, JPEG, PNG, or TIFF up to 25 MB
                  </p>
                </div>
              )}
            </div>

            {/* Response type */}
            <div className="space-y-2">
              <Label>Response type</Label>
              <Input
                placeholder="e.g., answer, objection, partial"
                value={responseType}
                onChange={(e) => setResponseType(e.target.value)}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>
                Notes <span className="text-warm-muted font-normal">(optional)</span>
              </Label>
              <Textarea
                placeholder="Any notes about this response..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-16"
                maxLength={5000}
              />
            </div>

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <Button
              onClick={handleUpload}
              disabled={!file || !responseType.trim() || uploading}
              className="w-full sm:w-auto"
            >
              {uploading ? 'Uploading...' : 'Upload response'}
            </Button>
          </>
        )}

        {/* Existing responses */}
        {responses.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-warm-muted uppercase tracking-wide">
              Received ({responses.length})
            </p>
            {responses.map((r) => (
              <div
                key={r.id}
                className="rounded-md border border-warm-border bg-warm-bg px-3 py-2.5"
              >
                <div className="flex items-center gap-2 text-sm">
                  <FileTextIcon className="size-3.5 text-warm-muted shrink-0" />
                  <span className="font-medium text-warm-text truncate">
                    {r.file_name}
                  </span>
                  <Badge variant="outline" className="text-xs shrink-0">
                    {r.response_type}
                  </Badge>
                </div>
                <p className="text-xs text-warm-muted mt-1">
                  Received {formatDateTime(r.received_at)}
                </p>
                {r.notes && (
                  <p className="text-xs text-warm-muted mt-1">{r.notes}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Mark complete */}
        {packStatus === 'responses_pending' && responses.length > 0 && (
          <Button
            onClick={handleComplete}
            disabled={statusUpdating}
          >
            {statusUpdating ? 'Updating...' : 'Mark discovery complete'}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
