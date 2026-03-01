'use client'

import { useState } from 'react'
import { StepRunner } from './step-runner'
import { FilingChecklistComponent } from './filing/filing-checklist'
import { FilingFeeCard } from './filing/filing-fee-card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { FilingChecklist } from '@/lib/schemas/filing'

interface FileWithCourtStepProps {
  caseId: string
  taskId: string
  existingMetadata?: Record<string, unknown>
  caseData: {
    role: string
    court_type: string
    county: string | null
  }
}

const DEFAULT_CHECKLIST: FilingChecklist = {
  account_created: false,
  court_selected: false,
  filing_type_chosen: false,
  document_uploaded: false,
  fee_paid: false,
  submitted: false,
}

export function FileWithCourtStep({
  caseId,
  taskId,
  existingMetadata,
  caseData,
}: FileWithCourtStepProps) {
  const meta = existingMetadata ?? {}
  const [checklist, setChecklist] = useState<FilingChecklist>(
    (meta.checklist as FilingChecklist) ?? DEFAULT_CHECKLIST
  )
  const [confirmationNumber, setConfirmationNumber] = useState(
    (meta.confirmation_number as string) ?? ''
  )

  const allChecked = Object.entries(checklist)
    .filter(([key]) => key !== 'confirmation_number')
    .every(([, v]) => v === true)

  async function patchTask(status: string, metadata?: Record<string, unknown>) {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, ...(metadata ? { metadata } : {}) }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Failed to update task')
    }
  }

  async function handleConfirm() {
    const metadata = { checklist, confirmation_number: confirmationNumber || null }
    await patchTask('in_progress', metadata)
    await patchTask('completed')
  }

  async function handleSave() {
    const metadata = { checklist, confirmation_number: confirmationNumber || null }
    await patchTask('in_progress', metadata)
  }

  const filingSystem = caseData.court_type === 'federal' ? 'PACER / CM-ECF' : 'eFileTexas.gov'

  return (
    <StepRunner
      caseId={caseId}
      taskId={taskId}
      title="File With the Court"
      reassurance={`Follow these steps to file your documents through ${filingSystem}. Check off each item as you complete it.`}
      onConfirm={handleConfirm}
      onSave={handleSave}
      skipReview
    >
      <div className="space-y-6">
        <FilingFeeCard courtType={caseData.court_type} />

        <FilingChecklistComponent
          courtType={caseData.court_type}
          role={caseData.role}
          checklist={checklist}
          onChange={setChecklist}
        />

        <div className="space-y-2">
          <Label htmlFor="confirmation">Confirmation / receipt number (optional)</Label>
          <Input
            id="confirmation"
            value={confirmationNumber}
            onChange={(e) => setConfirmationNumber(e.target.value)}
            placeholder="e.g. EFT-2026-12345"
          />
        </div>

        {!allChecked && (
          <p className="text-xs text-warm-muted">
            Complete all checklist items to finish this step.
          </p>
        )}
      </div>
    </StepRunner>
  )
}
