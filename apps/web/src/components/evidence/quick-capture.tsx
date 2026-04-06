'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Camera } from 'lucide-react'
import { toast } from 'sonner'

interface QuickCaptureProps {
  caseId: string
  onUpload?: () => void
}

export function QuickCapture({ caseId, onUpload }: QuickCaptureProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('caseId', caseId)

      const res = await fetch(`/api/cases/${caseId}/evidence`, {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        toast.success('Photo uploaded to evidence vault')
        onUpload?.()
      } else {
        toast.error('Failed to upload photo')
      }
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleCapture}
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="gap-2"
      >
        <Camera className="h-4 w-4" />
        {uploading ? 'Uploading...' : 'Quick Photo'}
      </Button>
    </>
  )
}
