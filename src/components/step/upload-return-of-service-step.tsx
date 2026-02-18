'use client'

import { useState, useRef, useCallback } from 'react'
import { StepRunner } from './step-runner'
import { Button } from '@/components/ui/button'
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from '@/lib/schemas/court-document'

interface UploadReturnOfServiceStepProps {
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

export function UploadReturnOfServiceStep({
  caseId,
  taskId,
}: UploadReturnOfServiceStepProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadedDoc, setUploadedDoc] = useState<UploadedDoc | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const validateFile = useCallback((file: File): string | null => {
    if (!ALLOWED_MIME_TYPES.includes(file.type as typeof ALLOWED_MIME_TYPES[number])) {
      return `Invalid file type. Please upload a PDF, JPEG, or PNG file.`
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File is too large (${formatFileSize(file.size)}). Maximum size is 10 MB.`
    }
    return null
  }, [])

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

    const sha256 = await computeSHA256(selectedFile)

    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('doc_type', 'return_of_service')
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
  }

  async function handleConfirm() {
    // Transition: todo → in_progress (with file metadata)
    const firstRes = await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'in_progress',
        metadata: uploadedDoc
          ? {
              document_id: uploadedDoc.id,
              file_name: uploadedDoc.file_name,
              mime_type: uploadedDoc.mime_type,
              sha256: uploadedDoc.sha256,
            }
          : undefined,
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
  }

  const reviewContent = uploadedDoc ? (
    <div className="space-y-4">
      <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3">
        <p className="text-sm font-medium text-green-800">
          File uploaded successfully
        </p>
      </div>
      <dl className="space-y-3">
        <div>
          <dt className="text-sm font-medium text-warm-muted">File name</dt>
          <dd className="text-warm-text mt-0.5">{uploadedDoc.file_name}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-warm-muted">Type</dt>
          <dd className="text-warm-text mt-0.5">
            {formatMimeType(uploadedDoc.mime_type)}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-warm-muted">Size</dt>
          <dd className="text-warm-text mt-0.5">
            {formatFileSize(uploadedDoc.file_size)}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-warm-muted">SHA-256</dt>
          <dd className="text-warm-text mt-0.5 font-mono text-xs break-all">
            {uploadedDoc.sha256}
          </dd>
        </div>
      </dl>
    </div>
  ) : null

  return (
    <StepRunner
      caseId={caseId}
      taskId={taskId}
      title="Upload Return of Service"
      reassurance="Upload the Return of Service document from your process server. This confirms that the other party was properly served."
      onConfirm={handleConfirm}
      onBeforeReview={handleBeforeReview}
      reviewButtonLabel="Upload & Review →"
      reviewContent={reviewContent}
    >
      <div className="space-y-4">
        <p className="text-sm text-warm-muted">
          Your process server should have given you a signed Return of Service
          (also called Proof of Service or Affidavit of Service). Upload it here
          so we can keep it with your case file.
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
