'use client'

import { useState, useRef, useCallback } from 'react'
import { StepRunner } from './step-runner'
import { Button } from '@/components/ui/button'
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from '@/lib/schemas/court-document'

interface UploadAnswerStepProps {
  caseId: string
  taskId: string
}

interface UploadedDoc {
  id: string
  file_name: string
  mime_type: string
  sha256: string
  file_size: number
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatMimeType(mime: string): string {
  switch (mime) {
    case 'application/pdf': return 'PDF'
    case 'image/jpeg': return 'JPEG Image'
    case 'image/png': return 'PNG Image'
    default: return mime
  }
}

async function computeSHA256(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function UploadAnswerStep({ caseId, taskId }: UploadAnswerStepProps) {
  // Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadedDoc, setUploadedDoc] = useState<UploadedDoc | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Extraction state
  const [extractionId, setExtractionId] = useState<string | null>(null)
  const [extractionWarning, setExtractionWarning] = useState<string | null>(null)

  // Editable extracted fields
  const [isGeneralDenial, setIsGeneralDenial] = useState(false)
  const [affirmativeDefenses, setAffirmativeDefenses] = useState('')
  const [hasCounterclaim, setHasCounterclaim] = useState(false)
  const [counterclaimSummary, setCounterclaimSummary] = useState('')
  const [keyAdmissions, setKeyAdmissions] = useState('')
  const [keyDenials, setKeyDenials] = useState('')

  const validateFile = useCallback((file: File): string | null => {
    if (!ALLOWED_MIME_TYPES.includes(file.type as typeof ALLOWED_MIME_TYPES[number])) {
      return `Invalid file type. Please upload a PDF, JPEG, or PNG file.`
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File is too large (${formatFileSize(file.size)}). Maximum size is 10 MB.`
    }
    return null
  }, [])

  function resetExtractionState() {
    setExtractionId(null)
    setExtractionWarning(null)
    setIsGeneralDenial(false)
    setAffirmativeDefenses('')
    setHasCounterclaim(false)
    setCounterclaimSummary('')
    setKeyAdmissions('')
    setKeyDenials('')
  }

  function handleFileSelect(file: File) {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      setSelectedFile(null)
      return
    }
    setError(null)
    setSelectedFile(file)
    setUploadedDoc(null)
    resetExtractionState()
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
  }

  async function handleBeforeReview() {
    if (!selectedFile) {
      throw new Error('Please select a file first.')
    }

    setError(null)

    // Step 1: Upload the court document
    const sha256 = await computeSHA256(selectedFile)

    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('doc_type', 'answer')
    formData.append('sha256', sha256)

    const res = await fetch(`/api/cases/${caseId}/court-documents`, {
      method: 'POST',
      body: formData,
    })

    if (!res.ok) {
      const err = await res.json()
      const message = err.error || 'Upload failed. Please try again.'
      setError(message)
      throw new Error(message)
    }

    const { document } = await res.json()
    setUploadedDoc({
      id: document.id,
      file_name: selectedFile.name,
      mime_type: selectedFile.type,
      sha256,
      file_size: selectedFile.size,
    })

    // Step 2: Extract fields via AI (non-fatal on failure)
    try {
      const extractRes = await fetch(`/api/cases/${caseId}/answer/extract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ court_document_id: document.id }),
      })

      if (!extractRes.ok) {
        const extractErr = await extractRes.json()
        setExtractionWarning(
          extractErr.error || 'AI extraction failed. Please fill in the fields manually.'
        )
        return
      }

      const { extraction } = await extractRes.json()
      setExtractionId(extraction.id)

      // Populate editable fields from extraction
      const fields = extraction.fields
      if (fields) {
        setIsGeneralDenial(fields.is_general_denial ?? false)
        setAffirmativeDefenses(
          Array.isArray(fields.affirmative_defenses)
            ? fields.affirmative_defenses.join('\n')
            : ''
        )
        setHasCounterclaim(fields.has_counterclaim ?? false)
        setCounterclaimSummary(fields.counterclaim_summary ?? '')
        setKeyAdmissions(
          Array.isArray(fields.key_admissions)
            ? fields.key_admissions.join('\n')
            : ''
        )
        setKeyDenials(
          Array.isArray(fields.key_denials)
            ? fields.key_denials.join('\n')
            : ''
        )
      }
    } catch {
      setExtractionWarning(
        'AI extraction encountered an error. Please fill in the fields manually.'
      )
    }
  }

  async function handleConfirm() {
    // Transition: todo → in_progress (with metadata)
    const firstRes = await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'in_progress',
        metadata: {
          document_id: uploadedDoc?.id,
          extraction_id: extractionId,
          is_general_denial: isGeneralDenial,
          affirmative_defenses: affirmativeDefenses.split('\n').filter(Boolean),
          has_counterclaim: hasCounterclaim,
          counterclaim_summary: hasCounterclaim ? counterclaimSummary : null,
          key_admissions: keyAdmissions.split('\n').filter(Boolean),
          key_denials: keyDenials.split('\n').filter(Boolean),
        },
      }),
    })

    if (!firstRes.ok) {
      const err = await firstRes.json()
      if (!err.details?.includes?.("'in_progress'")) {
        throw new Error(err.error || 'Failed to update task')
      }
    }

    // Transition: in_progress → completed
    const secondRes = await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' }),
    })

    if (!secondRes.ok) {
      throw new Error('Failed to complete task')
    }

    // Gatekeeper call to unlock discovery_starter_pack
    await fetch(`/api/cases/${caseId}/rules/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
  }

  const reviewContent = uploadedDoc ? (
    <div className="space-y-5">
      {/* AI extraction warning */}
      <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3">
        <p className="text-sm text-amber-800">
          AI-extracted fields may be incomplete. Review carefully.
        </p>
      </div>

      {/* Extraction failure warning */}
      {extractionWarning && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm text-amber-800">{extractionWarning}</p>
        </div>
      )}

      {/* General denial checkbox */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="general-denial"
          checked={isGeneralDenial}
          onChange={(e) => setIsGeneralDenial(e.target.checked)}
          className="rounded border-warm-border"
        />
        <label htmlFor="general-denial" className="text-sm font-medium text-warm-text">
          General denial
        </label>
      </div>

      {/* Affirmative defenses */}
      <div>
        <label htmlFor="affirmative-defenses" className="text-sm font-medium text-warm-text block mb-1">
          Affirmative defenses <span className="font-normal text-warm-muted">(one per line)</span>
        </label>
        <textarea
          id="affirmative-defenses"
          rows={4}
          value={affirmativeDefenses}
          onChange={(e) => setAffirmativeDefenses(e.target.value)}
          className="w-full rounded-md border border-warm-border p-3 text-sm text-warm-text bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Counterclaim checkbox + conditional textarea */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="has-counterclaim"
            checked={hasCounterclaim}
            onChange={(e) => setHasCounterclaim(e.target.checked)}
            className="rounded border-warm-border"
          />
          <label htmlFor="has-counterclaim" className="text-sm font-medium text-warm-text">
            Counterclaim asserted
          </label>
        </div>
        {hasCounterclaim && (
          <div>
            <label htmlFor="counterclaim-summary" className="text-sm font-medium text-warm-text block mb-1">
              Counterclaim summary
            </label>
            <textarea
              id="counterclaim-summary"
              rows={3}
              value={counterclaimSummary}
              onChange={(e) => setCounterclaimSummary(e.target.value)}
              className="w-full rounded-md border border-warm-border p-3 text-sm text-warm-text bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        )}
      </div>

      {/* Key admissions */}
      <div>
        <label htmlFor="key-admissions" className="text-sm font-medium text-warm-text block mb-1">
          Key admissions <span className="font-normal text-warm-muted">(one per line)</span>
        </label>
        <textarea
          id="key-admissions"
          rows={4}
          value={keyAdmissions}
          onChange={(e) => setKeyAdmissions(e.target.value)}
          className="w-full rounded-md border border-warm-border p-3 text-sm text-warm-text bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Key denials */}
      <div>
        <label htmlFor="key-denials" className="text-sm font-medium text-warm-text block mb-1">
          Key denials <span className="font-normal text-warm-muted">(one per line)</span>
        </label>
        <textarea
          id="key-denials"
          rows={4}
          value={keyDenials}
          onChange={(e) => setKeyDenials(e.target.value)}
          className="w-full rounded-md border border-warm-border p-3 text-sm text-warm-text bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
    </div>
  ) : null

  return (
    <StepRunner
      caseId={caseId}
      taskId={taskId}
      title="Upload Answer"
      reassurance="Upload the defendant's answer to your petition. We'll extract key information to help with your case strategy."
      onConfirm={handleConfirm}
      onBeforeReview={handleBeforeReview}
      reviewButtonLabel="Upload & Extract →"
      reviewContent={reviewContent}
    >
      <div className="space-y-4">
        <p className="text-sm text-warm-muted">
          Upload the defendant&apos;s answer document. We&apos;ll use AI to extract key
          information like defenses, admissions, denials, and counterclaims so you can
          review and confirm them.
        </p>

        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          className={`
            cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors
            ${isDragging
              ? 'border-blue-400 bg-blue-50'
              : selectedFile
                ? 'border-green-300 bg-green-50'
                : 'border-gray-300 hover:border-gray-400'
            }
          `}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleInputChange}
            className="hidden"
          />

          {selectedFile ? (
            <div>
              <p className="text-sm font-medium text-warm-text">
                {selectedFile.name}
              </p>
              <p className="text-xs text-warm-muted mt-1">
                {formatMimeType(selectedFile.type)} &middot;{' '}
                {formatFileSize(selectedFile.size)}
              </p>
              <p className="text-xs text-warm-muted mt-2">
                Click or drag to replace
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sm text-warm-text mb-1">
                Drag and drop your file here
              </p>
              <p className="text-xs text-warm-muted">
                or click to browse &middot; PDF, JPEG, or PNG &middot; up to 10 MB
              </p>
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Remove file button */}
        {selectedFile && !uploadedDoc && (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              setSelectedFile(null)
              setError(null)
              if (inputRef.current) inputRef.current.value = ''
            }}
          >
            Remove file
          </Button>
        )}
      </div>
    </StepRunner>
  )
}
