'use client'

import { useState } from 'react'
import { StepRunner } from './step-runner'
import { DraftViewer } from './filing/draft-viewer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface PrepareRemandMotionStepProps {
  caseId: string
  taskId: string
  existingMetadata?: Record<string, unknown>
  removalDate?: string | null
  federalCaseNumber?: string | null
}

const REMAND_GROUNDS = [
  { key: 'no_federal_question', label: 'No federal question — the case involves only state law claims' },
  { key: 'no_diversity', label: 'No diversity of citizenship — parties are from the same state or amount is under $75,000' },
  { key: 'untimely_removal', label: 'Untimely removal — the Notice of Removal was filed more than 30 days after service' },
  { key: 'forum_defendant', label: 'Forum defendant rule — the defendant is a citizen of the state where the case was filed' },
  { key: 'procedural_defect', label: 'Other procedural defect' },
]

export function PrepareRemandMotionStep({
  caseId,
  taskId,
  existingMetadata,
  removalDate,
  federalCaseNumber,
}: PrepareRemandMotionStepProps) {
  const meta = existingMetadata ?? {}

  const [yourName, setYourName] = useState((meta.your_name as string) ?? '')
  const [opposingName, setOpposingName] = useState((meta.opposing_name as string) ?? '')
  const [originalCourt, setOriginalCourt] = useState((meta.original_court as string) ?? '')
  const [selectedGrounds, setSelectedGrounds] = useState<string[]>(
    (meta.remand_grounds as string[]) ?? []
  )
  const [additionalArguments, setAdditionalArguments] = useState((meta.additional_arguments as string) ?? '')

  // Draft state
  const [draft, setDraft] = useState((meta.draft_text as string) ?? '')
  const [acknowledged, setAcknowledged] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState<string | null>(null)

  function toggleGround(key: string) {
    setSelectedGrounds((prev) =>
      prev.includes(key) ? prev.filter((g) => g !== key) : [...prev, key]
    )
  }

  function buildMetadata() {
    return {
      your_name: yourName,
      opposing_name: opposingName,
      original_court: originalCourt,
      remand_grounds: selectedGrounds,
      additional_arguments: additionalArguments || null,
      draft_text: draft || null,
      final_text: draft || null,
    }
  }

  async function generateDraft() {
    setGenerating(true)
    setGenError(null)
    try {
      const res = await fetch(`/api/cases/${caseId}/generate-filing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_type: 'motion_to_remand',
          facts: {
            your_info: { full_name: yourName },
            opposing_parties: [{ full_name: opposingName }],
            federal_case_number: federalCaseNumber ?? '',
            original_court: originalCourt,
            removal_date: removalDate ?? '',
            remand_grounds: selectedGrounds,
            additional_arguments: additionalArguments || undefined,
          },
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to generate document')
      }
      const data = await res.json()
      setDraft(data.draft)
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'Failed to generate document')
    } finally {
      setGenerating(false)
    }
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
    const metadata = buildMetadata()
    await patchTask('in_progress', metadata)
    await patchTask('completed')
  }

  async function handleSave() {
    const metadata = buildMetadata()
    await patchTask('in_progress', metadata)
  }

  const reviewContent = (
    <div className="space-y-4">
      {genError && (
        <div className="rounded-lg border border-calm-amber bg-calm-amber/5 p-3">
          <p className="text-sm text-warm-text">{genError}</p>
        </div>
      )}
      {draft ? (
        <DraftViewer
          draft={draft}
          onDraftChange={setDraft}
          onRegenerate={generateDraft}
          regenerating={generating}
          acknowledged={acknowledged}
          onAcknowledgeChange={setAcknowledged}
        />
      ) : (
        <p className="text-sm text-warm-muted">Generating your draft...</p>
      )}
    </div>
  )

  return (
    <StepRunner
      caseId={caseId}
      taskId={taskId}
      title="Prepare Motion to Remand"
      reassurance="We'll help you draft a motion asking the federal court to send your case back to state court."
      onConfirm={handleConfirm}
      onSave={handleSave}
      onBeforeReview={generateDraft}
      reviewContent={reviewContent}
      reviewButtonLabel="Generate Draft →"
    >
      <div className="space-y-8">
        {genError && (
          <div className="rounded-lg border border-calm-amber bg-calm-amber/5 p-3">
            <p className="text-sm text-warm-text">{genError}</p>
            <p className="text-xs text-warm-muted mt-1">Review your information below and try again.</p>
          </div>
        )}

        <div>
          <h2 className="text-sm font-semibold text-warm-text mb-4">1. Parties</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="your-name">Your name (moving party)</Label>
              <Input
                id="your-name"
                value={yourName}
                onChange={(e) => setYourName(e.target.value)}
                placeholder="Your full legal name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="opposing-name">Opposing party name</Label>
              <Input
                id="opposing-name"
                value={opposingName}
                onChange={(e) => setOpposingName(e.target.value)}
                placeholder="Defendant's full name"
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-warm-text mb-4">2. Original Court</h2>
          <div className="space-y-2">
            <Label htmlFor="original-court">Name of the original state court</Label>
            <Input
              id="original-court"
              value={originalCourt}
              onChange={(e) => setOriginalCourt(e.target.value)}
              placeholder="e.g. District Court of Harris County, Texas"
            />
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-warm-text mb-4">3. Grounds for Remand</h2>
          <p className="text-sm text-warm-muted mb-3">
            Select all reasons why removal was improper:
          </p>
          <div className="space-y-3">
            {REMAND_GROUNDS.map((ground) => (
              <label key={ground.key} className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedGrounds.includes(ground.key)}
                  onChange={() => toggleGround(ground.key)}
                  className="mt-0.5 h-4 w-4 rounded border-warm-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-warm-text">{ground.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-warm-text mb-4">4. Additional Arguments (optional)</h2>
          <textarea
            value={additionalArguments}
            onChange={(e) => setAdditionalArguments(e.target.value)}
            rows={4}
            className="w-full rounded-md border border-warm-border px-3 py-2 text-sm text-warm-text placeholder:text-warm-muted focus:border-primary focus:ring-1 focus:ring-primary"
            placeholder="Any additional facts or arguments that support your motion to remand..."
          />
        </div>
      </div>
    </StepRunner>
  )
}
