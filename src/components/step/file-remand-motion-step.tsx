'use client'

import { useState } from 'react'
import { StepRunner } from './step-runner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface FileRemandMotionStepProps {
  caseId: string
  taskId: string
  existingMetadata?: Record<string, unknown>
  remandDeadline?: string | null
}

interface RemandFilingChecklist {
  pacer_account: boolean
  case_located: boolean
  motion_uploaded: boolean
  submitted: boolean
}

const DEFAULT_CHECKLIST: RemandFilingChecklist = {
  pacer_account: false,
  case_located: false,
  motion_uploaded: false,
  submitted: false,
}

const CHECKLIST_ITEMS: { key: keyof RemandFilingChecklist; label: string }[] = [
  { key: 'pacer_account', label: 'Created a PACER account (or logged in to existing)' },
  { key: 'case_located', label: 'Located your case in CM/ECF using the federal case number' },
  { key: 'motion_uploaded', label: 'Uploaded your Motion to Remand as a PDF' },
  { key: 'submitted', label: 'Submitted the filing and received a confirmation' },
]

export function FileRemandMotionStep({
  caseId,
  taskId,
  existingMetadata,
  remandDeadline,
}: FileRemandMotionStepProps) {
  const meta = existingMetadata ?? {}
  const [checklist, setChecklist] = useState<RemandFilingChecklist>(
    (meta.checklist as RemandFilingChecklist) ?? DEFAULT_CHECKLIST
  )
  const [confirmationNumber, setConfirmationNumber] = useState(
    (meta.confirmation_number as string) ?? ''
  )
  const [checklistError, setChecklistError] = useState<string | null>(null)

  const allChecked = Object.values(checklist).every(Boolean)

  function toggleItem(key: keyof RemandFilingChecklist) {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }))
  }

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
    if (!allChecked) {
      setChecklistError('Please complete all checklist items before finishing this step.')
      throw new Error('Checklist incomplete')
    }
    setChecklistError(null)
    const metadata = { checklist, confirmation_number: confirmationNumber || null }
    await patchTask('in_progress', metadata)
    await patchTask('completed')
  }

  const daysRemaining = remandDeadline
    ? Math.max(0, Math.ceil((new Date(remandDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null

  return (
    <StepRunner
      caseId={caseId}
      taskId={taskId}
      title="File Your Motion to Remand"
      reassurance="Follow these steps to file your Motion to Remand through PACER / CM-ECF."
      onConfirm={handleConfirm}
      skipReview
    >
      <div className="space-y-6">
        {remandDeadline && (
          <div className={`rounded-lg border p-4 ${
            daysRemaining !== null && daysRemaining <= 7
              ? 'border-red-200 bg-red-50'
              : 'border-calm-amber/30 bg-calm-amber/5'
          }`}>
            <p className="text-sm font-medium text-warm-text">
              Deadline: {new Date(remandDeadline).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
            {daysRemaining !== null && (
              <p className={`text-xs mt-1 ${
                daysRemaining <= 7 ? 'text-red-600 font-medium' : 'text-warm-muted'
              }`}>
                {daysRemaining === 0
                  ? 'Due today!'
                  : `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} remaining`}
              </p>
            )}
          </div>
        )}

        <div className="rounded-lg border border-warm-border bg-white p-4">
          <p className="text-xs font-medium text-warm-muted uppercase tracking-wide">Filing fee</p>
          <p className="text-lg font-semibold text-warm-text">$0</p>
          <p className="text-xs text-warm-muted mt-1">
            No filing fee is required for motions.
          </p>
        </div>

        <div className="space-y-3">
          {CHECKLIST_ITEMS.map((item) => (
            <label key={item.key} className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={checklist[item.key]}
                onChange={() => toggleItem(item.key)}
                className="mt-0.5 h-4 w-4 rounded border-warm-border text-primary focus:ring-primary"
              />
              <span className={`text-sm ${checklist[item.key] ? 'text-warm-muted line-through' : 'text-warm-text'}`}>
                {item.label}
              </span>
            </label>
          ))}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmation">Confirmation / receipt number (optional)</Label>
          <Input
            id="confirmation"
            value={confirmationNumber}
            onChange={(e) => setConfirmationNumber(e.target.value)}
            placeholder="e.g. ECF-2026-12345"
          />
        </div>

        {checklistError && (
          <div className="rounded-lg border border-calm-amber bg-calm-amber/5 p-3">
            <p className="text-sm text-warm-text">{checklistError}</p>
          </div>
        )}

        {!allChecked && !checklistError && (
          <p className="text-xs text-warm-muted">
            Complete all checklist items to finish this step.
          </p>
        )}
      </div>
    </StepRunner>
  )
}
