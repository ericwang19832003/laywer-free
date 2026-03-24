'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Download, FileText, Printer } from 'lucide-react'
import { generateDocumentPdf } from '@/lib/pdf/generate-document-pdf'

interface DraftViewerProps {
  draft: string
  onDraftChange: (v: string) => void
  onRegenerate: () => void
  regenerating: boolean
  acknowledged: boolean
  onAcknowledgeChange: (v: boolean) => void
  documentTitle?: string
  caseId?: string
  documentId?: string
  taskId?: string
}

export function DraftViewer({
  draft, onDraftChange, onRegenerate, regenerating, acknowledged, onAcknowledgeChange,
  documentTitle, caseId, documentId, taskId,
}: DraftViewerProps) {
  const [downloading, setDownloading] = useState(false)
  const [courtPdfLoading, setCourtPdfLoading] = useState(false)
  const [versionSaveError, setVersionSaveError] = useState<string | null>(null)
  const [savingVersion, setSavingVersion] = useState(false)

  async function handleDownloadPdf() {
    setDownloading(true)
    try {
      const pdfBytes = await generateDocumentPdf({
        title: documentTitle || 'Legal Document Draft',
        content: draft,
      })
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${(documentTitle || 'draft').replace(/\s+/g, '-').toLowerCase()}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } finally {
      setDownloading(false)
    }
  }

  async function handleRegenerate() {
    setVersionSaveError(null)

    // Save current draft as a version before regenerating
    if (caseId && taskId && draft.trim()) {
      setSavingVersion(true)
      try {
        const res = await fetch(`/api/cases/${caseId}/draft-versions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId, content: draft, source: 'edited' }),
        })
        const body = await res.json()
        if (!res.ok || body.saved === false) {
          setVersionSaveError(
            body.error ||
              'Could not save your current draft. Your changes may be lost if you continue.',
          )
          setSavingVersion(false)
          return // Block regeneration
        }
      } catch {
        setVersionSaveError(
          'Could not save your current draft. Your changes may be lost if you continue.',
        )
        setSavingVersion(false)
        return // Block regeneration
      }
      setSavingVersion(false)
    }

    onRegenerate()
  }

  async function handleDownloadCourtPdf() {
    if (!caseId) return
    setCourtPdfLoading(true)
    try {
      const res = await fetch(`/api/cases/${caseId}/court-form-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document_id: documentId }),
      })
      if (!res.ok) return
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `court-form-${caseId.slice(0, 8)}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } finally {
      setCourtPdfLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-calm-amber bg-calm-amber/5 p-3 print:hidden">
        <p className="text-sm font-medium text-warm-text">DRAFT — NOT LEGAL ADVICE</p>
        <p className="text-xs text-warm-muted mt-1">
          This is a computer-generated starting point. You are responsible for reviewing and editing this document before filing. This is not legal advice.
        </p>
      </div>

      <textarea
        value={draft}
        onChange={(e) => onDraftChange(e.target.value)}
        className="w-full min-h-[400px] rounded-md border border-warm-border p-4 text-sm font-mono text-warm-text bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 print:border-none print:p-0 print:font-serif"
      />

      {versionSaveError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 print:hidden">
          <p className="text-sm font-medium text-destructive">{versionSaveError}</p>
          <button
            type="button"
            className="mt-2 text-xs text-destructive underline"
            onClick={() => setVersionSaveError(null)}
          >
            Dismiss and try again
          </button>
        </div>
      )}

      <div className="flex gap-2 print:hidden">
        <Button type="button" variant="outline" size="sm" onClick={handleRegenerate} disabled={regenerating || savingVersion}>
          {savingVersion ? 'Saving draft...' : regenerating ? 'Regenerating...' : 'Regenerate Draft'}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={handleDownloadPdf} disabled={downloading}>
          <Download className="h-3.5 w-3.5 mr-1.5" />
          {downloading ? 'Generating...' : 'Download PDF'}
        </Button>
        {caseId && (
          <Button type="button" variant="outline" size="sm" onClick={handleDownloadCourtPdf} disabled={courtPdfLoading}>
            <FileText className="h-3.5 w-3.5 mr-1.5" />
            {courtPdfLoading ? 'Generating...' : 'Court-Ready PDF'}
          </Button>
        )}
        <Button type="button" variant="outline" size="sm" onClick={() => window.print()}>
          <Printer className="h-3.5 w-3.5 mr-1.5" />
          Print
        </Button>
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-warm-border p-3 print:hidden">
        <Checkbox id="acknowledge" checked={acknowledged} onCheckedChange={(c) => onAcknowledgeChange(c === true)} />
        <Label htmlFor="acknowledge" className="text-sm text-warm-text leading-tight cursor-pointer">
          I understand this is a draft and not legal advice. I will review and edit this document before filing.
        </Label>
      </div>
    </div>
  )
}
