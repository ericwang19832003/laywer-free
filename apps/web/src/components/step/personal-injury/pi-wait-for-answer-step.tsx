'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CalendarDays, CheckCircle2, FileText, Gavel, UserCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  buildFilingServiceMetadata,
  type FilingServiceFacts,
  type FilingServiceFactErrors,
  validateFilingServiceFacts,
} from '@/lib/filing-service-confirmation'

interface Props {
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
}

const SERVICE_METHODS = [
  { value: 'personal_service', label: 'Personal service' },
  { value: 'certified_mail', label: 'Certified mail' },
  { value: 'constable_sheriff', label: 'Constable / sheriff' },
  { value: 'process_server', label: 'Private process server' },
  { value: 'e_service', label: 'E-service' },
  { value: 'other', label: 'Other / not sure' },
]

function asInitialFacts(existingAnswers?: Record<string, string>): FilingServiceFacts {
  return {
    petition_filed_date: existingAnswers?.petition_filed_date ?? '',
    court_case_number: existingAnswers?.court_case_number ?? '',
    service_completed_date: existingAnswers?.service_completed_date ?? '',
    service_method: existingAnswers?.service_method ?? '',
    defendant_name_served: existingAnswers?.defendant_name_served ?? '',
  }
}

export function PIWaitForAnswerStep({ caseId, taskId, existingAnswers }: Props) {
  const router = useRouter()
  const [facts, setFacts] = useState<FilingServiceFacts>(() => asInitialFacts(existingAnswers))
  const [errors, setErrors] = useState<FilingServiceFactErrors>({})
  const [saving, setSaving] = useState(false)

  const serviceMethodLabel = useMemo(
    () => SERVICE_METHODS.find((method) => method.value === facts.service_method)?.label,
    [facts.service_method]
  )

  function updateFact<K extends keyof FilingServiceFacts>(key: K, value: FilingServiceFacts[K]) {
    setFacts((current) => ({ ...current, [key]: value }))
    setErrors((current) => {
      if (!current[key]) return current
      const next = { ...current }
      delete next[key]
      return next
    })
  }

  async function handleConfirm() {
    const validation = validateFilingServiceFacts(facts)
    if (!validation.valid) {
      setErrors(validation.errors)
      toast.error('Please complete the required filing and service details.')
      return
    }

    setSaving(true)
    try {
      const metadata = buildFilingServiceMetadata(facts)
      const taskRes = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'completed',
          metadata,
        }),
      })

      if (!taskRes.ok) {
        const err = await taskRes.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to save filing and service details.')
      }

      const rulesRes = await fetch(`/api/cases/${caseId}/rules/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      if (!rulesRes.ok) {
        const err = await rulesRes.json().catch(() => ({}))
        throw new Error(
          err.error ||
            'Service details were saved, but deadline tracking could not be started. Please try again or check your deadlines manually.'
        )
      }

      toast.success('Filing and service details confirmed.')
      router.push(`/case/${caseId}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save filing and service details.')
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link
        href={`/case/${caseId}`}
        className="mb-6 inline-block text-sm text-warm-muted hover:text-warm-text"
      >
        &larr; Back to dashboard
      </Link>

      <div className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-calm-indigo">
          Litigation file
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-warm-text">
          Confirm Filing & Service Details
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-warm-muted">
          Before we start tracking the defendant answer deadline, confirm the filing and service facts from your file-stamped petition and return of service.
        </p>
      </div>

      <div className="rounded-lg border border-warm-border bg-white p-6 shadow-sm">
        <div className="mb-6 rounded-lg border border-calm-indigo/15 bg-calm-indigo/[0.03] p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-calm-indigo" />
            <div>
              <p className="text-sm font-medium text-warm-text">Required before litigation tracking starts</p>
              <p className="mt-1 text-sm leading-relaxed text-warm-muted">
                Use exact dates from court documents when possible. These facts will be saved to the case file and used by the deadline workflow.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="petition-filed-date" className="flex items-center gap-2">
              <CalendarDays className="size-4 text-warm-muted" />
              Petition filed date
            </Label>
            <Input
              id="petition-filed-date"
              type="date"
              value={facts.petition_filed_date}
              onChange={(event) => updateFact('petition_filed_date', event.target.value)}
              aria-invalid={Boolean(errors.petition_filed_date)}
            />
            <p className="text-xs text-warm-muted">Use the date shown on the file-stamped petition.</p>
            {errors.petition_filed_date && <p className="text-xs font-medium text-red-600">{errors.petition_filed_date}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="court-case-number" className="flex items-center gap-2">
              <Gavel className="size-4 text-warm-muted" />
              Court / case number
            </Label>
            <Input
              id="court-case-number"
              placeholder="Cause No. / Case No."
              value={facts.court_case_number}
              onChange={(event) => updateFact('court_case_number', event.target.value)}
              aria-invalid={Boolean(errors.court_case_number)}
            />
            <p className="text-xs text-warm-muted">Usually near the top of the filed petition or court receipt.</p>
            {errors.court_case_number && <p className="text-xs font-medium text-red-600">{errors.court_case_number}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="service-completed-date" className="flex items-center gap-2">
              <CalendarDays className="size-4 text-warm-muted" />
              Service completed date
            </Label>
            <Input
              id="service-completed-date"
              type="date"
              value={facts.service_completed_date}
              onChange={(event) => updateFact('service_completed_date', event.target.value)}
              aria-invalid={Boolean(errors.service_completed_date)}
            />
            <p className="text-xs text-warm-muted">Use the date shown on the return of service.</p>
            {errors.service_completed_date && <p className="text-xs font-medium text-red-600">{errors.service_completed_date}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="service-method" className="flex items-center gap-2">
              <FileText className="size-4 text-warm-muted" />
              Service method
            </Label>
            <Select value={facts.service_method} onValueChange={(value) => updateFact('service_method', value)}>
              <SelectTrigger id="service-method" className="w-full" aria-invalid={Boolean(errors.service_method)}>
                <SelectValue placeholder="Select service method" />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_METHODS.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-warm-muted">Choose the method listed on the proof or return of service.</p>
            {errors.service_method && <p className="text-xs font-medium text-red-600">{errors.service_method}</p>}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="defendant-name-served" className="flex items-center gap-2">
              <UserCheck className="size-4 text-warm-muted" />
              Defendant name served
            </Label>
            <Input
              id="defendant-name-served"
              placeholder="Exact person or business listed on the return of service"
              value={facts.defendant_name_served}
              onChange={(event) => updateFact('defendant_name_served', event.target.value)}
              aria-invalid={Boolean(errors.defendant_name_served)}
            />
            <p className="text-xs text-warm-muted">Enter the exact name shown on the return of service.</p>
            {errors.defendant_name_served && <p className="text-xs font-medium text-red-600">{errors.defendant_name_served}</p>}
          </div>
        </div>

        <div className="mt-8 rounded-lg border border-warm-border bg-warm-bg/40 p-4">
          <p className="mb-3 text-sm font-medium text-warm-text">Confirmation summary</p>
          <dl className="grid gap-3 text-sm md:grid-cols-2">
            <div>
              <dt className="text-warm-muted">Petition filed</dt>
              <dd className="font-medium text-warm-text">{facts.petition_filed_date || 'Not entered'}</dd>
            </div>
            <div>
              <dt className="text-warm-muted">Case number</dt>
              <dd className="font-medium text-warm-text">{facts.court_case_number || 'Not entered'}</dd>
            </div>
            <div>
              <dt className="text-warm-muted">Service completed</dt>
              <dd className="font-medium text-warm-text">{facts.service_completed_date || 'Not entered'}</dd>
            </div>
            <div>
              <dt className="text-warm-muted">Service method</dt>
              <dd className="font-medium text-warm-text">{serviceMethodLabel || 'Not selected'}</dd>
            </div>
            <div className="md:col-span-2">
              <dt className="text-warm-muted">Defendant served</dt>
              <dd className="font-medium text-warm-text">{facts.defendant_name_served || 'Not entered'}</dd>
            </div>
          </dl>
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-warm-border pt-5 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => router.push(`/case/${caseId}`)}
            className="text-sm text-warm-muted hover:text-warm-text"
            disabled={saving}
          >
            Cancel
          </button>
          <Button type="button" onClick={handleConfirm} disabled={saving} className="h-11 px-6">
            {saving ? 'Saving...' : 'Confirm & Start Tracking'}
          </Button>
        </div>
      </div>
    </div>
  )
}
