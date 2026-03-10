'use client'

import { useState, useRef, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { UploadIcon, FileIcon, TrashIcon, DownloadIcon, StampIcon, Loader2Icon, Sparkles, SearchIcon, PencilIcon, CheckIcon, XIcon } from 'lucide-react'
import { toast } from 'sonner'

// ── Types ──────────────────────────────────────────────

export interface EvidenceItem {
  id: string
  case_id: string
  file_name: string
  storage_path: string
  mime_type: string | null
  file_size: number | null
  sha256: string | null
  label: string | null
  notes: string | null
  captured_at: string | null
  uploaded_by: string
  created_at: string
}

const CATEGORIES = [
  'Contract',
  'Photos',
  'Emails',
  'Text Messages',
  'Financial Records',
  'Medical Records',
  'Other',
] as const

type Category = (typeof CATEGORIES)[number]

// ── Helpers ────────────────────────────────────────────

function formatFileSize(bytes: number | null): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// ── Component ──────────────────────────────────────────

interface EvidenceVaultProps {
  caseId: string
  initialEvidence: EvidenceItem[]
  exhibitedIds?: string[]
}

export function EvidenceVault({ caseId, initialEvidence, exhibitedIds = [] }: EvidenceVaultProps) {
  // Evidence list state
  const [evidence, setEvidence] = useState<EvidenceItem[]>(initialEvidence)
  const [filterCategory, setFilterCategory] = useState<string>('all')

  // Search & status filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'exhibited' | 'not_exhibited'>('all')

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<{ label: string; notes: string; captured_at: string }>({ label: '', notes: '', captured_at: '' })

  // Upload form state
  const [file, setFile] = useState<File | null>(null)
  const [category, setCategory] = useState<string>('')
  const [notes, setNotes] = useState('')
  const [capturedAt, setCapturedAt] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState<{
    suggested_category: string; relevance_note: string
  } | null>(null)
  const [categorizing, setCategorizing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<EvidenceItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Exhibit state
  const [exhibitMap, setExhibitMap] = useState<Record<string, string>>({})
  const [addingExhibit, setAddingExhibit] = useState<string | null>(null)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) {
      setFile(dropped)
      suggestCategory(dropped)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOver(false)
  }, [])

  async function suggestCategory(selectedFile: File) {
    setCategorizing(true)
    setAiSuggestion(null)
    try {
      const res = await fetch(`/api/cases/${caseId}/evidence/categorize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_name: selectedFile.name, mime_type: selectedFile.type }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.suggestion) {
          setAiSuggestion(data.suggestion)
          if (!category) {
            setCategory(data.suggestion.suggested_category)
          }
        }
      }
    } catch { /* silent */ }
    setCategorizing(false)
  }

  async function handleUpload() {
    if (!file) return
    setUploading(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      if (category) formData.append('label', category)
      if (notes.trim()) formData.append('notes', notes.trim())
      if (capturedAt) formData.append('captured_at', capturedAt)

      const res = await fetch(`/api/cases/${caseId}/evidence`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Upload failed')
      }

      const { evidence: newItem } = await res.json()
      setEvidence((prev) => [newItem, ...prev])

      // Reset form
      setFile(null)
      setCategory('')
      setNotes('')
      setCapturedAt('')
      setAiSuggestion(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)

    try {
      const res = await fetch(`/api/cases/${caseId}/evidence`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evidence_id: deleteTarget.id }),
      })

      if (!res.ok) {
        throw new Error('Delete failed')
      }

      setEvidence((prev) => prev.filter((e) => e.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch {
      // Keep dialog open on error so user can retry
    } finally {
      setDeleting(false)
    }
  }

  async function handleDownload(item: EvidenceItem) {
    const res = await fetch(`/api/cases/${caseId}/evidence/download?id=${item.id}`)
    if (!res.ok) {
      // Fallback: construct a signed URL request or show error
      return
    }
    const { url } = await res.json()
    window.open(url, '_blank')
  }

  async function handleAddToExhibits(item: EvidenceItem) {
    setAddingExhibit(item.id)
    try {
      // 1. Fetch existing exhibit sets
      const setsRes = await fetch(`/api/cases/${caseId}/exhibit-sets`)
      if (!setsRes.ok) throw new Error('Failed to load exhibit sets')
      const { exhibit_sets } = await setsRes.json()

      let setId: string

      if (exhibit_sets.length > 0) {
        // Use the first (and typically only) set
        setId = exhibit_sets[0].id
      } else {
        // Auto-create one with numeric numbering
        const createRes = await fetch(`/api/cases/${caseId}/exhibit-sets`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ numbering_style: 'numeric' }),
        })
        if (!createRes.ok) throw new Error('Failed to create exhibit set')
        const { exhibit_set } = await createRes.json()
        setId = exhibit_set.id
      }

      // 2. Add the exhibit
      const addRes = await fetch(`/api/exhibit-sets/${setId}/exhibits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evidence_item_id: item.id }),
      })

      if (addRes.status === 409) {
        toast('Already in your exhibits.')
        return
      }

      if (!addRes.ok) {
        const err = await addRes.json()
        toast.error(err.error || 'Something went wrong. Please try again.')
        return
      }

      const { exhibit } = await addRes.json()
      setExhibitMap((prev) => ({ ...prev, [item.id]: exhibit.exhibit_no }))
      toast.success(`Added as Exhibit ${exhibit.exhibit_no}.`)
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setAddingExhibit(null)
    }
  }

  // ── Inline edit handlers ──────────────────────────

  function startEdit(item: EvidenceItem) {
    setEditingId(item.id)
    setEditForm({
      label: item.label || '',
      notes: item.notes || '',
      captured_at: item.captured_at || '',
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setEditForm({ label: '', notes: '', captured_at: '' })
  }

  async function saveEdit(itemId: string) {
    try {
      const res = await fetch(`/api/cases/${caseId}/evidence/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      if (!res.ok) throw new Error('Failed to save')
      setEvidence((prev) =>
        prev.map((e) =>
          e.id === itemId ? { ...e, ...editForm } : e
        )
      )
      setEditingId(null)
      toast.success('Evidence updated')
    } catch {
      toast.error('Failed to update evidence')
    }
  }

  // ── Filtered evidence ──────────────────────────────

  const filteredEvidence = evidence.filter((item) => {
    // Category filter (existing)
    if (filterCategory !== 'all' && item.label !== filterCategory) return false

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const matchesSearch =
        item.file_name.toLowerCase().includes(q) ||
        (item.label?.toLowerCase().includes(q) ?? false) ||
        (item.notes?.toLowerCase().includes(q) ?? false)
      if (!matchesSearch) return false
    }

    // Status filter
    if (statusFilter === 'exhibited') return exhibitedIds.includes(item.id)
    if (statusFilter === 'not_exhibited') return !exhibitedIds.includes(item.id)

    return true
  })

  return (
    <div className="space-y-8">
      {/* ── Upload Section ──────────────────────────── */}
      <Card>
        <CardContent className="py-5 space-y-4">
          <h2 className="font-medium text-warm-text">Upload evidence</h2>

          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 cursor-pointer transition-colors ${
              dragOver
                ? 'border-primary bg-primary/5'
                : file
                  ? 'border-calm-green bg-calm-green/5'
                  : 'border-warm-border hover:border-warm-muted'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={(e) => {
                const selected = e.target.files?.[0]
                if (selected) {
                  setFile(selected)
                  suggestCategory(selected)
                }
              }}
            />
            <UploadIcon className="size-8 text-warm-muted mb-2" />
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
                  Drag and drop a file here, or click to browse
                </p>
                <p className="text-xs text-warm-muted mt-0.5">
                  PDF, JPG, or PNG up to 10 MB
                </p>
              </div>
            )}
          </div>

          {categorizing && (
            <p className="text-xs text-warm-muted animate-pulse">Analyzing file...</p>
          )}
          {aiSuggestion && !categorizing && (
            <div className="flex items-center gap-2 rounded-md bg-calm-indigo/10 px-3 py-2 text-sm">
              <Sparkles className="h-4 w-4 text-calm-indigo" />
              <span className="text-warm-muted">
                Suggested: <strong className="text-warm-text">{aiSuggestion.suggested_category}</strong>
                {' — '}{aiSuggestion.relevance_note}
              </span>
            </div>
          )}

          {/* Category + Date row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="captured-at">
                Date <span className="text-warm-muted font-normal">(optional)</span>
              </Label>
              <Input
                id="captured-at"
                type="date"
                value={capturedAt}
                onChange={(e) => setCapturedAt(e.target.value)}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">
              Notes <span className="text-warm-muted font-normal">(optional)</span>
            </Label>
            <Textarea
              id="notes"
              placeholder="Describe this evidence..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={2000}
              className="min-h-16"
            />
          </div>

          {/* Upload error */}
          {uploadError && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2">
              <p className="text-sm text-red-800">{uploadError}</p>
            </div>
          )}

          {/* Upload button */}
          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full sm:w-auto"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </CardContent>
      </Card>

      {/* ── Filter + List Section ───────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-medium text-warm-text">Your evidence</h2>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Search + Status filter */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-warm-muted" />
            <Input
              placeholder="Search evidence..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as 'all' | 'exhibited' | 'not_exhibited')}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All evidence</SelectItem>
              <SelectItem value="exhibited">Exhibited</SelectItem>
              <SelectItem value="not_exhibited">Not exhibited</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredEvidence.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <FileIcon className="size-8 text-warm-muted mx-auto mb-3" />
              <p className="text-warm-muted">
                {evidence.length === 0
                  ? 'No documents yet. Upload your first file.'
                  : 'No documents match this filter.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredEvidence.map((item) => (
              <Card key={item.id}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-warm-text truncate">
                          {item.file_name}
                        </p>
                        {item.label && (
                          <Badge variant="secondary" className="text-xs shrink-0">
                            {item.label}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-warm-muted flex-wrap">
                        <span>Uploaded {formatDate(item.created_at)}</span>
                        {item.file_size && (
                          <>
                            <span>&middot;</span>
                            <span>{formatFileSize(item.file_size)}</span>
                          </>
                        )}
                        {item.captured_at && (
                          <>
                            <span>&middot;</span>
                            <span>Captured {formatDate(item.captured_at)}</span>
                          </>
                        )}
                      </div>
                      {item.notes && (
                        <p className="text-sm text-warm-muted mt-1.5 line-clamp-2">
                          {item.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {exhibitMap[item.id] ? (
                        <Badge variant="secondary" className="font-mono text-xs">
                          Ex. {exhibitMap[item.id]}
                        </Badge>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleAddToExhibits(item)}
                          disabled={addingExhibit === item.id}
                          title="Add to Exhibits"
                        >
                          {addingExhibit === item.id ? (
                            <Loader2Icon className="size-3.5 animate-spin" />
                          ) : (
                            <StampIcon className="size-3.5" />
                          )}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => startEdit(item)}
                        title="Edit"
                        disabled={editingId === item.id}
                      >
                        <PencilIcon className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleDownload(item)}
                        title="Download"
                      >
                        <DownloadIcon className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => setDeleteTarget(item)}
                        title="Delete"
                        className="text-destructive hover:text-destructive"
                      >
                        <TrashIcon className="size-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Inline edit form */}
                  {editingId === item.id && (
                    <div className="mt-3 pt-3 border-t border-warm-border space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs text-warm-muted">Category</Label>
                          <Select
                            value={editForm.label}
                            onValueChange={(v) => setEditForm((f) => ({ ...f, label: v }))}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                              {CATEGORIES.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                  {cat}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-warm-muted">Date captured</Label>
                          <Input
                            type="date"
                            value={editForm.captured_at}
                            onChange={(e) => setEditForm((f) => ({ ...f, captured_at: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-warm-muted">Notes</Label>
                        <Textarea
                          placeholder="Describe this evidence..."
                          value={editForm.notes}
                          onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))}
                          maxLength={2000}
                          className="min-h-16"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => saveEdit(item.id)}
                        >
                          <CheckIcon className="size-3.5 mr-1.5" />
                          Save
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={cancelEdit}
                        >
                          <XIcon className="size-3.5 mr-1.5" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* ── Delete Confirmation Dialog ──────────────── */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete evidence?</DialogTitle>
            <DialogDescription>
              This will permanently delete{' '}
              <span className="font-medium text-warm-text">
                {deleteTarget?.file_name}
              </span>{' '}
              and remove it from your case file. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={deleting}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
