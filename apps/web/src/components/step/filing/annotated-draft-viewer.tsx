'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Download, Printer, BookOpen } from 'lucide-react'
import { generateDocumentPdf } from '@/lib/pdf/generate-document-pdf'

export interface DraftAnnotation {
  id: number
  section: string
  text: string
}

interface AnnotatedDraftViewerProps {
  draft: string
  annotations: DraftAnnotation[]
  onDraftChange: (v: string) => void
  onRegenerate: () => void
  regenerating: boolean
  acknowledged: boolean
  onAcknowledgeChange: (v: boolean) => void
  documentTitle?: string
}

export function AnnotatedDraftViewer({
  draft,
  annotations,
  onDraftChange,
  onRegenerate,
  regenerating,
  acknowledged,
  onAcknowledgeChange,
  documentTitle,
}: AnnotatedDraftViewerProps) {
  const [downloading, setDownloading] = useState(false)
  const [activeAnnotation, setActiveAnnotation] = useState<number | null>(null)
  const [showMobileAnnotations, setShowMobileAnnotations] = useState(false)

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

  const hasAnnotations = annotations.length > 0

  const annotationCards = annotations.map((ann) => (
    <div
      key={ann.id}
      className={`rounded-lg p-3 border text-sm cursor-pointer transition-colors ${
        activeAnnotation === ann.id
          ? 'bg-calm-indigo/10 border-calm-indigo/30'
          : 'bg-white border-warm-border hover:border-calm-indigo/20'
      }`}
      onClick={() => setActiveAnnotation(activeAnnotation === ann.id ? null : ann.id)}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="h-5 w-5 rounded-full bg-calm-indigo text-white text-xs flex items-center justify-center font-medium shrink-0">
          {ann.id}
        </span>
        <span className="text-xs font-medium text-calm-indigo">{ann.section}</span>
      </div>
      <p className="text-warm-muted text-xs">{ann.text}</p>
    </div>
  ))

  return (
    <div className="space-y-4">
      {/* Safety banner */}
      <div className="rounded-lg border border-calm-amber bg-calm-amber/5 p-3 print:hidden">
        <p className="text-sm font-medium text-warm-text">DRAFT — NOT LEGAL ADVICE</p>
        <p className="text-xs text-warm-muted mt-1">
          This is a computer-generated starting point. Review and edit before filing.
        </p>
      </div>

      {/* Two-column layout */}
      <div className="flex gap-4">
        {/* Draft area (left) */}
        <div className="flex-1 min-w-0">
          <textarea
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            className="w-full min-h-[400px] rounded-md border border-warm-border p-4 text-sm font-mono text-warm-text bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 print:border-none print:p-0 print:font-serif"
          />
        </div>

        {/* Annotation sidebar (right, hidden on mobile or when no annotations) */}
        {hasAnnotations && (
          <div className="w-72 shrink-0 hidden lg:block">
            <h3 className="text-sm font-medium text-warm-text mb-3">What Each Section Means</h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {annotationCards}
            </div>
          </div>
        )}
      </div>

      {/* Mobile annotations (collapsible) */}
      {hasAnnotations && (
        <div className="lg:hidden print:hidden">
          <button
            type="button"
            onClick={() => setShowMobileAnnotations(!showMobileAnnotations)}
            className="flex items-center gap-2 text-sm font-medium text-calm-indigo"
          >
            <BookOpen className="h-4 w-4" />
            {showMobileAnnotations ? 'Hide' : 'Show'} section explanations ({annotations.length})
          </button>
          {showMobileAnnotations && (
            <div className="mt-2 space-y-2">
              {annotationCards}
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 print:hidden">
        <Button type="button" variant="outline" size="sm" onClick={onRegenerate} disabled={regenerating}>
          {regenerating ? 'Regenerating...' : 'Regenerate Draft'}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={handleDownloadPdf} disabled={downloading}>
          <Download className="h-3.5 w-3.5 mr-1.5" />
          {downloading ? 'Generating...' : 'Download PDF'}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => window.print()}>
          <Printer className="h-3.5 w-3.5 mr-1.5" />
          Print
        </Button>
      </div>

      {/* Acknowledge checkbox */}
      <div className="flex items-start gap-3 rounded-lg border border-warm-border p-3 print:hidden">
        <Checkbox id="acknowledge" checked={acknowledged} onCheckedChange={(c) => onAcknowledgeChange(c === true)} />
        <Label htmlFor="acknowledge" className="text-sm text-warm-text leading-tight cursor-pointer">
          I understand this is a draft and not legal advice. I will review and edit before filing.
        </Label>
      </div>
    </div>
  )
}
