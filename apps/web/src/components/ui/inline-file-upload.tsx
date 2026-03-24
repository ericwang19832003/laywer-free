'use client'

import { useState, useRef } from 'react'
import { Paperclip, X, Loader2 } from 'lucide-react'
import {
  ALLOWED_EVIDENCE_MIME_TYPES,
  MAX_EVIDENCE_FILE_SIZE,
} from '@/lib/schemas/evidence'

// ── Types ──────────────────────────────────────────────

export interface UploadedFile {
  evidenceId: string
  fileName: string
}

export interface InlineFileUploadProps {
  caseId: string
  /** Visible label, e.g. "Attach photos or documents" */
  label: string
  /** Evidence category auto-assigned on upload */
  category: string
  /** Optional note persisted with the evidence record */
  notes?: string
  /** Already-uploaded files */
  files: UploadedFile[]
  /** Called after a successful upload */
  onUpload: (evidenceId: string, fileName: string) => void
  /** Called after a successful delete */
  onRemove: (evidenceId: string) => void
}

// ── Helpers ────────────────────────────────────────────

const ACCEPT = '.pdf,.jpg,.jpeg,.png'
const MAX_SIZE_MB = MAX_EVIDENCE_FILE_SIZE / (1024 * 1024)

function validateFile(file: File): string | null {
  const mime = file.type as string
  if (
    !ALLOWED_EVIDENCE_MIME_TYPES.includes(
      mime as (typeof ALLOWED_EVIDENCE_MIME_TYPES)[number]
    )
  ) {
    return `File type not allowed. Use PDF, JPG, or PNG.`
  }
  if (file.size > MAX_EVIDENCE_FILE_SIZE) {
    return `File exceeds ${MAX_SIZE_MB}MB limit.`
  }
  return null
}

// ── Component ──────────────────────────────────────────

export function InlineFileUpload({
  caseId,
  label,
  category,
  notes,
  files,
  onUpload,
  onRemove,
}: InlineFileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // ── Upload handler ─────────────────────────────────

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Reset input so the same file can be re-selected
    if (inputRef.current) inputRef.current.value = ''

    setError(null)

    // Client-side validation
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('label', category)
      if (notes?.trim()) formData.append('notes', notes.trim())

      const res = await fetch(`/api/cases/${caseId}/evidence`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(
          body?.error || `Upload failed (${res.status})`
        )
      }

      const { evidence } = await res.json()
      onUpload(evidence.id, evidence.file_name)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  // ── Remove handler ─────────────────────────────────

  async function handleRemove(evidenceId: string) {
    setError(null)
    setRemoving(evidenceId)

    try {
      const res = await fetch(`/api/cases/${caseId}/evidence`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evidence_id: evidenceId }),
      })

      if (!res.ok) {
        throw new Error('Failed to remove file')
      }

      onRemove(evidenceId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Remove failed')
    } finally {
      setRemoving(null)
    }
  }

  // ── Render ─────────────────────────────────────────

  return (
    <div className="mt-1.5 space-y-1.5">
      {/* File chips */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {files.map((f) => (
            <span
              key={f.evidenceId}
              className="inline-flex items-center gap-1 rounded-md bg-calm-indigo/10 px-2 py-0.5 text-xs text-calm-indigo"
            >
              <Paperclip className="size-3 shrink-0" />
              <span className="max-w-[160px] truncate">{f.fileName}</span>
              <button
                type="button"
                onClick={() => handleRemove(f.evidenceId)}
                disabled={removing === f.evidenceId}
                className="ml-0.5 rounded p-0.5 hover:bg-calm-indigo/10 disabled:opacity-50"
                aria-label={`Remove ${f.fileName}`}
              >
                {removing === f.evidenceId ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <X className="size-3" />
                )}
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Attach button */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="inline-flex items-center gap-1 text-xs text-warm-muted hover:text-warm-text transition-colors disabled:opacity-50"
      >
        {uploading ? (
          <>
            <Loader2 className="size-3 animate-spin" />
            <span>Uploading...</span>
          </>
        ) : (
          <>
            <Paperclip className="size-3" />
            <span>{label}</span>
          </>
        )}
      </button>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        onChange={handleFileChange}
        className="hidden"
        aria-label={label}
      />

      {/* Error message */}
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  )
}
