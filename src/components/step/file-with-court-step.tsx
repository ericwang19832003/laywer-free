'use client'

import { useState } from 'react'
import { StepRunner } from './step-runner'
import { FilingChecklistComponent } from './filing/filing-checklist'
import { ServiceGuide } from './filing/service-guide'
import { FAQAccordion } from '@/components/ui/faq-accordion'
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

const FILING_FAQ = [
  {
    question: "Do I need a lawyer to file?",
    answer: "No. Anyone can represent themselves in court. This is called filing 'pro se.' This tool helps you format documents, but it is not a substitute for legal advice."
  },
  {
    question: "How much does it cost to file?",
    answer: "Filing fees vary by court: JP Court ($35-$75), County Court ($200-$300), District Court ($250-$350), Federal Court ($405). If you cannot afford it, you can apply for a fee waiver."
  },
  {
    question: "What if I make a mistake?",
    answer: "You can amend (fix) your petition after filing. Courts are generally lenient with pro se filers. It is better to file and correct later than to wait."
  },
  {
    question: "How long does a case take?",
    answer: "Small claims (JP Court) typically resolve in 1-3 months. County/District Court cases can take 6-18 months. Federal cases often take 1-2 years."
  },
  {
    question: "What happens after I file?",
    answer: "You will need to 'serve' (deliver) the papers to the other party. They then have a deadline to respond. We will guide you through each step."
  },
]

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
  const [checklistError, setChecklistError] = useState<string | null>(null)

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
    if (!allChecked) {
      setChecklistError('Please complete all checklist items before finishing this step.')
      throw new Error('Checklist incomplete')
    }
    setChecklistError(null)
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

        <div className="mt-8 pt-6 border-t border-warm-border">
          <h2 className="text-sm font-semibold text-warm-text mb-4">After Filing: Serve the Other Party</h2>
          <ServiceGuide courtType={caseData.court_type} county={caseData.county} />
        </div>

        <div className="mt-6">
          <FAQAccordion items={FILING_FAQ} />
        </div>
      </div>
    </StepRunner>
  )
}
