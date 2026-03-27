'use client'

import { useState } from 'react'
import { StepRunner } from '../step-runner'
import { AnnotatedDraftViewer } from '../filing/annotated-draft-viewer'
import type { DraftAnnotation } from '../filing/annotated-draft-viewer'
import { calculateDamages } from '@/lib/small-claims/damages-calculator'
import type { DamageItem } from '@/lib/small-claims/damages-calculator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface DemandLetterStepProps {
  caseId: string
  taskId: string
  existingMetadata?: Record<string, unknown>
  claimDetails: {
    claim_sub_type: string
    claim_amount: number | null
    defendant_is_business: boolean
  } | null
  caseData: { county: string | null }
  skippable?: boolean
}

export function DemandLetterStep({
  caseId,
  taskId,
  existingMetadata,
  claimDetails,
  caseData,
  skippable,
}: DemandLetterStepProps) {
  const meta = existingMetadata ?? {}

  // Section 1: Plaintiff info
  const [plaintiffName, setPlaintiffName] = useState(
    (meta.plaintiff_name as string) ?? ''
  )
  const [plaintiffAddress, setPlaintiffAddress] = useState(
    (meta.plaintiff_address as string) ?? ''
  )

  // Section 2: Defendant info
  const [defendantName, setDefendantName] = useState(
    (meta.defendant_name as string) ?? ''
  )
  const [defendantAddress, setDefendantAddress] = useState(
    (meta.defendant_address as string) ?? ''
  )

  // Section 3: Claim summary
  const [description, setDescription] = useState(
    (meta.description as string) ?? ''
  )

  // Section 4: Damages
  const [damagesItems, setDamagesItems] = useState<DamageItem[]>(
    (meta.damages_items as DamageItem[]) ?? [
      { category: '', amount: 0, description: '' },
    ]
  )

  // Section 5: Demand settings
  const [deadlineDays, setDeadlineDays] = useState(
    (meta.deadline_days as string) ?? '14'
  )
  const [preferredResolution, setPreferredResolution] = useState(
    (meta.preferred_resolution as string) ?? ''
  )

  // Section 6: Incident date
  const [incidentDate, setIncidentDate] = useState(
    (meta.incident_date as string) ?? ''
  )

  // Draft state
  const [draft, setDraft] = useState((meta.draft_text as string) ?? '')
  const [annotations, setAnnotations] = useState<DraftAnnotation[]>([])
  const [acknowledged, setAcknowledged] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState<string | null>(null)

  // ── Damages helpers ──

  const damagesResult = calculateDamages({ items: damagesItems })
  const totalDamages = damagesResult.totalDamages

  function updateDamagesItem(
    index: number,
    field: keyof DamageItem,
    value: string | number
  ) {
    const updated = [...damagesItems]
    updated[index] = { ...updated[index], [field]: value }
    setDamagesItems(updated)
  }

  function addDamagesItem() {
    setDamagesItems([
      ...damagesItems,
      { category: '', amount: 0, description: '' },
    ])
  }

  function removeDamagesItem(index: number) {
    if (damagesItems.length <= 1) return
    setDamagesItems(damagesItems.filter((_, i) => i !== index))
  }

  // ── API calls ──

  async function generateDraft() {
    setGenerating(true)
    setGenError(null)
    try {
      const res = await fetch(`/api/cases/${caseId}/generate-filing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_type: 'demand_letter',
          facts: {
            plaintiff: {
              full_name: plaintiffName,
              address: plaintiffAddress,
            },
            defendant: {
              full_name: defendantName,
              address: defendantAddress,
            },
            claim_sub_type: claimDetails?.claim_sub_type || 'other',
            claim_amount: totalDamages,
            damages_breakdown: damagesItems
              .filter((i) => i.amount > 0)
              .map((i) => ({
                category: i.category,
                amount: i.amount,
                description: i.description,
              })),
            description,
            deadline_days: parseInt(deadlineDays),
            preferred_resolution: preferredResolution || undefined,
            incident_date: incidentDate,
            defendant_is_business:
              claimDetails?.defendant_is_business ?? false,
          },
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to generate demand letter')
      }
      const data = await res.json()
      setDraft(data.draft)
      setAnnotations(data.annotations ?? [])
    } catch (err) {
      setGenError(
        err instanceof Error ? err.message : 'Failed to generate demand letter'
      )
      throw err
    } finally {
      setGenerating(false)
    }
  }

  async function patchTask(
    status: string,
    metadata?: Record<string, unknown>
  ) {
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

  function buildMetadata() {
    return {
      plaintiff_name: plaintiffName,
      plaintiff_address: plaintiffAddress,
      defendant_name: defendantName,
      defendant_address: defendantAddress,
      description,
      damages_items: damagesItems,
      deadline_days: deadlineDays,
      preferred_resolution: preferredResolution || null,
      incident_date: incidentDate || null,
      draft_text: draft || null,
      final_text: draft || null,
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

  // ── Review content ──

  const reviewContent = (
    <div className="space-y-4">
      {genError && (
        <div className="rounded-lg border border-calm-amber bg-calm-amber/5 p-3">
          <p className="text-sm text-warm-text">{genError}</p>
        </div>
      )}
      {draft ? (
        <AnnotatedDraftViewer
          draft={draft}
          annotations={annotations}
          onDraftChange={setDraft}
          onRegenerate={generateDraft}
          regenerating={generating}
          acknowledged={acknowledged}
          onAcknowledgeChange={setAcknowledged}
          documentTitle="Demand Letter"
        />
      ) : (
        <p className="text-sm text-warm-muted">
          Generating your demand letter...
        </p>
      )}
    </div>
  )

  return (
    <StepRunner
      caseId={caseId}
      taskId={taskId}
      title="Prepare Your Demand Letter"
      reassurance="A demand letter is often required before filing a small claims case. We'll help you draft one."
      onConfirm={handleConfirm}
      onSave={handleSave}
      onBeforeReview={generateDraft}
      reviewContent={reviewContent}
      reviewButtonLabel="Generate Letter &rarr;"
      skippable={skippable}
    >
      <div className="space-y-8">
        {genError && (
          <div className="rounded-lg border border-calm-amber bg-calm-amber/5 p-3">
            <p className="text-sm text-warm-text">{genError}</p>
            <p className="text-xs text-warm-muted mt-1">
              Review your information below and try again.
            </p>
          </div>
        )}

        {/* County info summary */}
        {caseData.county && (
          <div className="rounded-lg border border-warm-border bg-white p-4 space-y-1">
            <p className="text-xs font-medium text-warm-muted uppercase tracking-wide">
              County
            </p>
            <p className="text-sm text-warm-text">{caseData.county}</p>
          </div>
        )}

        {/* Section 1: Plaintiff info */}
        <div>
          <h2 className="text-sm font-semibold text-warm-text mb-4">
            1. Your Information (Plaintiff)
          </h2>
          <div className="space-y-3">
            <div>
              <Label htmlFor="plaintiff-name">Full legal name *</Label>
              <Input
                id="plaintiff-name"
                value={plaintiffName}
                onChange={(e) => setPlaintiffName(e.target.value)}
                placeholder="e.g. John Michael Doe"
              />
            </div>
            <div>
              <Label htmlFor="plaintiff-address">Mailing address *</Label>
              <Input
                id="plaintiff-address"
                value={plaintiffAddress}
                onChange={(e) => setPlaintiffAddress(e.target.value)}
                placeholder="123 Main St, City, TX 75001"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Defendant info */}
        <div>
          <h2 className="text-sm font-semibold text-warm-text mb-4">
            2. Defendant Information
          </h2>
          <div className="space-y-3">
            <div>
              <Label htmlFor="defendant-name">
                {claimDetails?.defendant_is_business
                  ? 'Business name *'
                  : 'Full legal name *'}
              </Label>
              <Input
                id="defendant-name"
                value={defendantName}
                onChange={(e) => setDefendantName(e.target.value)}
                placeholder={
                  claimDetails?.defendant_is_business
                    ? 'e.g. Acme Corp LLC'
                    : 'e.g. Jane Smith'
                }
              />
            </div>
            <div>
              <Label htmlFor="defendant-address">Mailing address *</Label>
              <Input
                id="defendant-address"
                value={defendantAddress}
                onChange={(e) => setDefendantAddress(e.target.value)}
                placeholder="456 Oak Ave, City, TX 75002"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Claim summary */}
        <div>
          <h2 className="text-sm font-semibold text-warm-text mb-4">
            3. Describe Your Situation
          </h2>
          <div className="space-y-2">
            <Label htmlFor="description">
              What happened? Why do you believe you are owed money? *
            </Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full min-h-[100px] rounded-md border border-warm-border p-3 text-sm text-warm-text bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Describe the situation in your own words..."
            />
            <p className="text-xs text-warm-muted">
              Be specific about dates, amounts, and what was agreed upon.
            </p>
          </div>
        </div>

        {/* Section 4: Damages */}
        <div>
          <h2 className="text-sm font-semibold text-warm-text mb-4">
            4. Damages
          </h2>
          <p className="text-xs text-warm-muted mb-3">
            List each category of damages you are claiming.
          </p>
          <div className="space-y-3">
            {damagesItems.map((item, i) => (
              <div
                key={i}
                className="rounded-lg border border-warm-border p-3 space-y-3"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <Label htmlFor={`dmg-cat-${i}`}>Category *</Label>
                    <Input
                      id={`dmg-cat-${i}`}
                      value={item.category}
                      onChange={(e) =>
                        updateDamagesItem(i, 'category', e.target.value)
                      }
                      placeholder="e.g. Unpaid rent, Property damage"
                    />
                  </div>
                  <div className="w-32">
                    <Label htmlFor={`dmg-amt-${i}`}>Amount *</Label>
                    <Input
                      id={`dmg-amt-${i}`}
                      type="number"
                      value={item.amount || ''}
                      onChange={(e) =>
                        updateDamagesItem(
                          i,
                          'amount',
                          parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="0.00"
                    />
                  </div>
                  {damagesItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDamagesItem(i)}
                      className="mt-6 text-xs text-warm-muted hover:text-warm-text"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div>
                  <Label htmlFor={`dmg-desc-${i}`}>
                    Description (optional)
                  </Label>
                  <Input
                    id={`dmg-desc-${i}`}
                    value={item.description ?? ''}
                    onChange={(e) =>
                      updateDamagesItem(i, 'description', e.target.value)
                    }
                    placeholder="Brief details about this item"
                  />
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addDamagesItem}
            >
              + Add item
            </Button>

            {/* Running total */}
            <div className="rounded-lg border border-warm-border bg-white p-3 flex items-center justify-between">
              <span className="text-sm font-medium text-warm-text">Total</span>
              <span className="text-sm font-semibold text-warm-text">
                $
                {totalDamages.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>

            {/* Cap warnings */}
            {damagesResult.exceedsCap && (
              <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2">
                <p className="text-xs font-medium text-amber-800">
                  Exceeds the $
                  {damagesResult.capAmount.toLocaleString()} small claims limit
                </p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Your total damages exceed the Texas JP Court cap by $
                  {damagesResult.overCapBy.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                  })}
                  . You may need to reduce your claim or file in a higher court.
                </p>
              </div>
            )}
            {damagesResult.nearingCap && (
              <div className="rounded-md border border-calm-indigo/30 bg-calm-indigo/5 px-3 py-2">
                <p className="text-xs font-medium text-warm-text">
                  Nearing the small claims limit
                </p>
                <p className="text-xs text-warm-muted mt-0.5">
                  Your total is close to the $
                  {damagesResult.capAmount.toLocaleString()} cap. Make sure all
                  amounts are accurate.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Section 5: Demand settings */}
        <div>
          <h2 className="text-sm font-semibold text-warm-text mb-4">
            5. Demand Settings
          </h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="deadline-days">
                Response deadline (days from letter date)
              </Label>
              <select
                id="deadline-days"
                value={deadlineDays}
                onChange={(e) => setDeadlineDays(e.target.value)}
                className="flex h-9 w-full rounded-md border border-warm-border bg-transparent px-3 py-1 text-sm text-warm-text shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo"
              >
                <option value="7">7 days</option>
                <option value="14">14 days</option>
                <option value="21">21 days</option>
                <option value="30">30 days</option>
              </select>
              <p className="text-xs text-warm-muted">
                14 days is standard. Shorter deadlines may be appropriate for
                urgent matters.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="preferred-resolution">
                Preferred resolution (optional)
              </Label>
              <textarea
                id="preferred-resolution"
                value={preferredResolution}
                onChange={(e) => setPreferredResolution(e.target.value)}
                rows={3}
                className="w-full min-h-[80px] rounded-md border border-warm-border p-3 text-sm text-warm-text bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="e.g. Full payment of $X by [date], or a payment plan of $Y/month..."
              />
              <p className="text-xs text-warm-muted">
                Describe what outcome you would accept to resolve this without
                going to court.
              </p>
            </div>
          </div>
        </div>

        {/* Section 6: Incident date */}
        <div>
          <h2 className="text-sm font-semibold text-warm-text mb-4">
            6. Incident Date
          </h2>
          <div className="space-y-2">
            <Label htmlFor="incident-date">
              When did the incident or dispute occur?
            </Label>
            <Input
              id="incident-date"
              type="date"
              value={incidentDate}
              onChange={(e) => setIncidentDate(e.target.value)}
            />
            <p className="text-xs text-warm-muted">
              If it happened over a period of time, use the most recent date.
            </p>
          </div>
        </div>
      </div>
    </StepRunner>
  )
}
