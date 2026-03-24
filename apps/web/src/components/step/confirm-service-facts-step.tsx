'use client'

import { useState, useEffect } from 'react'
import { StepRunner } from './step-runner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SERVICE_METHODS } from '@/lib/schemas/document-extraction'

interface ConfirmServiceFactsStepProps {
  caseId: string
  taskId: string
}

interface ExtractionData {
  id: string
  fields: {
    served_at: string | null
    return_filed_at: string | null
    service_method: string | null
    served_to: string | null
    server_name: string | null
  }
  confidence: number | null
  status: string
}

const SERVICE_METHOD_LABELS: Record<string, string> = {
  personal: 'Personal Service',
  substituted: 'Substituted Service',
  posting: 'Posting',
  certified_mail: 'Certified Mail',
  secretary_of_state: 'Secretary of State',
  publication: 'Publication',
  other: 'Other',
}

export function ConfirmServiceFactsStep({
  caseId,
  taskId,
}: ConfirmServiceFactsStepProps) {
  const [extraction, setExtraction] = useState<ExtractionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Editable fields
  const [servedAt, setServedAt] = useState('')
  const [returnFiledAt, setReturnFiledAt] = useState('')
  const [serviceMethod, setServiceMethod] = useState('')
  const [servedTo, setServedTo] = useState('')
  const [serverName, setServerName] = useState('')

  useEffect(() => {
    async function loadExtraction() {
      try {
        // Find the most recent non-failed extraction for this case
        const res = await fetch(`/api/cases/${caseId}/return-of-service/extract`, {
          method: 'GET',
        })

        if (!res.ok) {
          setLoadError('Could not load extracted data. You can still enter details manually.')
          setLoading(false)
          return
        }

        const data = await res.json()
        if (data.extraction) {
          setExtraction(data.extraction)
          const f = data.extraction.fields
          setServedAt(f.served_at ?? '')
          setReturnFiledAt(f.return_filed_at ?? '')
          setServiceMethod(f.service_method ?? '')
          setServedTo(f.served_to ?? '')
          setServerName(f.server_name ?? '')
        } else {
          setLoadError('No extraction found. Please enter details manually.')
        }
      } catch {
        setLoadError('Could not load extracted data. You can still enter details manually.')
      }
      setLoading(false)
    }
    loadExtraction()
  }, [caseId])

  async function handleConfirm() {
    if (!extraction) {
      throw new Error('No extraction data available')
    }

    // Call the confirm endpoint
    const res = await fetch(`/api/cases/${caseId}/return-of-service/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        extraction_id: extraction.id,
        served_at: servedAt || null,
        return_filed_at: returnFiledAt || null,
        service_method: serviceMethod || null,
        served_to: servedTo || null,
        server_name: serverName || null,
      }),
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Failed to confirm service details')
    }

    // Transition task: todo → in_progress → completed
    const firstRes = await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'in_progress' }),
    })

    if (!firstRes.ok) {
      const err = await firstRes.json()
      if (!err.details?.includes?.("'in_progress'")) {
        throw new Error(err.error || 'Failed to update task')
      }
    }

    const secondRes = await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' }),
    })

    if (!secondRes.ok) {
      throw new Error('Failed to complete task')
    }
  }

  const reviewContent = (
    <dl className="space-y-4">
      <div>
        <dt className="text-sm font-medium text-warm-muted">Date served</dt>
        <dd className="text-warm-text mt-0.5">{servedAt || 'Not provided'}</dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-warm-muted">Return filed</dt>
        <dd className="text-warm-text mt-0.5">{returnFiledAt || 'Not provided'}</dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-warm-muted">Service method</dt>
        <dd className="text-warm-text mt-0.5">
          {serviceMethod ? SERVICE_METHOD_LABELS[serviceMethod] ?? serviceMethod : 'Not provided'}
        </dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-warm-muted">Served to</dt>
        <dd className="text-warm-text mt-0.5">{servedTo || 'Not provided'}</dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-warm-muted">Server name</dt>
        <dd className="text-warm-text mt-0.5">{serverName || 'Not provided'}</dd>
      </div>
    </dl>
  )

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <p className="text-warm-muted">Loading extracted details...</p>
      </div>
    )
  }

  return (
    <StepRunner
      caseId={caseId}
      taskId={taskId}
      title="Confirm Service Details"
      reassurance="Please confirm what you see on your document. We've done our best to read the details — just correct anything that doesn't look right."
      onConfirm={handleConfirm}
      reviewContent={reviewContent}
      reviewButtonLabel="Review & Confirm →"
    >
      <div className="space-y-5">
        {loadError && (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-sm text-amber-800">{loadError}</p>
          </div>
        )}

        {extraction && extraction.status === 'needs_review' && (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-sm text-amber-800">
              Some fields couldn&apos;t be read clearly. Please check and correct as needed.
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="served-at">Date served</Label>
          <Input
            id="served-at"
            placeholder="e.g. January 15, 2026"
            value={servedAt}
            onChange={(e) => setServedAt(e.target.value)}
          />
          <p className="text-xs text-warm-muted">
            The date the other party was served, as shown on the return.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="return-filed-at">Date return filed</Label>
          <Input
            id="return-filed-at"
            placeholder="e.g. January 20, 2026"
            value={returnFiledAt}
            onChange={(e) => setReturnFiledAt(e.target.value)}
          />
          <p className="text-xs text-warm-muted">
            The date the return was filed with the court, if shown.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="service-method">Service method</Label>
          <Select value={serviceMethod} onValueChange={setServiceMethod}>
            <SelectTrigger id="service-method" className="w-full">
              <SelectValue placeholder="Select method" />
            </SelectTrigger>
            <SelectContent>
              {SERVICE_METHODS.map((method) => (
                <SelectItem key={method} value={method}>
                  {SERVICE_METHOD_LABELS[method] ?? method}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-warm-muted">
            How was the other party served? This is important for calculating deadlines.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="served-to">Person served</Label>
          <Input
            id="served-to"
            placeholder="e.g. Jane Doe"
            value={servedTo}
            onChange={(e) => setServedTo(e.target.value)}
          />
          <p className="text-xs text-warm-muted">
            The name of the person who was served.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="server-name">Process server name</Label>
          <Input
            id="server-name"
            placeholder="e.g. Robert Wilson"
            value={serverName}
            onChange={(e) => setServerName(e.target.value)}
          />
          <p className="text-xs text-warm-muted">
            The name of the person or officer who performed the service.
          </p>
        </div>
      </div>
    </StepRunner>
  )
}
