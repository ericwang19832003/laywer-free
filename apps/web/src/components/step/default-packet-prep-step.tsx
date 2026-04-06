'use client'

import { useState } from 'react'
import { StepRunner } from './step-runner'
import { DraftViewer } from './filing/draft-viewer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

interface DefaultPacketPrepStepProps {
  caseId: string
  taskId: string
  existingMetadata?: Record<string, unknown>
  caseData: { court_type: string; county: string | null }
  serviceData: { service_date: string | null; answer_deadline: string | null } | null
  partyData: {
    your_info: { full_name: string; address?: string }
    opposing_parties: { full_name: string; address?: string }[]
  } | null
}

interface DamagesItem {
  category: string
  amount: number
}

function getCourtLabel(courtType: string): string {
  switch (courtType) {
    case 'jp': return 'Justice Court'
    case 'county': return 'County Court'
    case 'district': return 'District Court'
    case 'federal': return 'Federal Court'
    default: return courtType
  }
}

export function DefaultPacketPrepStep({
  caseId,
  taskId,
  existingMetadata,
  caseData,
  serviceData,
  partyData,
}: DefaultPacketPrepStepProps) {
  const meta = existingMetadata ?? {}

  // Party state — hydrate from metadata first, then partyData, then empty defaults
  const [yourInfo, setYourInfo] = useState<{ full_name: string; address?: string }>(
    (meta.your_info as { full_name: string; address?: string }) ??
    partyData?.your_info ??
    { full_name: '' }
  )
  const [opposingParties, setOpposingParties] = useState<{ full_name: string; address?: string }[]>(
    (meta.opposing_parties as { full_name: string; address?: string }[]) ??
    partyData?.opposing_parties ??
    [{ full_name: '' }]
  )

  // Case summary
  const [causeNumber, setCauseNumber] = useState((meta.cause_number as string) ?? '')
  const [description, setDescription] = useState((meta.description as string) ?? '')

  // Service information — hydrate from metadata first, then serviceData
  const [serviceDate, setServiceDate] = useState(
    (meta.service_date as string) ?? serviceData?.service_date ?? ''
  )
  const [answerDeadline, setAnswerDeadline] = useState(
    (meta.answer_deadline as string) ?? serviceData?.answer_deadline ?? ''
  )

  // Damages
  const [damagesItems, setDamagesItems] = useState<DamagesItem[]>(
    (meta.damages_items as DamagesItem[]) ?? [{ category: '', amount: 0 }]
  )

  // Affidavit
  const [nonMilitaryAffidavit, setNonMilitaryAffidavit] = useState(
    (meta.non_military_affidavit as boolean) ?? true
  )

  // Draft state
  const [draft, setDraft] = useState((meta.draft_text as string) ?? '')
  const [acknowledged, setAcknowledged] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState<string | null>(null)

  // ── Helpers ──

  function buildFacts() {
    return {
      your_info: yourInfo,
      opposing_parties: opposingParties,
      court_type: caseData.court_type,
      county: caseData.county ?? '',
      cause_number: causeNumber || undefined,
      description,
      amount_sought: damagesItems.reduce((sum, d) => sum + (d.amount || 0), 0),
      damages_breakdown: damagesItems.filter(d => d.category && d.amount > 0),
      service_date: serviceDate,
      answer_deadline: answerDeadline,
      non_military_affidavit: nonMilitaryAffidavit,
    }
  }

  function buildMetadata() {
    return {
      your_info: yourInfo,
      opposing_parties: opposingParties,
      cause_number: causeNumber || null,
      description,
      service_date: serviceDate || null,
      answer_deadline: answerDeadline || null,
      damages_items: damagesItems,
      non_military_affidavit: nonMilitaryAffidavit,
      draft_text: draft || null,
      final_text: draft || null,
    }
  }

  function validate(): string | null {
    if (!yourInfo.full_name.trim()) return 'Your full name is required.'
    if (!opposingParties.some(p => p.full_name.trim())) return 'At least one opposing party name is required.'
    if (description.trim().length < 10) return 'Case description must be at least 10 characters.'
    if (!damagesItems.some(d => d.category.trim() && d.amount > 0)) return 'At least one damages item with category and amount is required.'
    if (!serviceDate) return 'Date served is required.'
    if (!answerDeadline) return 'Answer deadline is required.'
    return null
  }

  // ── Opposing parties ──

  function updateOpposingParty(index: number, field: 'full_name' | 'address', value: string) {
    const updated = [...opposingParties]
    updated[index] = { ...updated[index], [field]: value }
    setOpposingParties(updated)
  }

  function addOpposingParty() {
    setOpposingParties([...opposingParties, { full_name: '' }])
  }

  function removeOpposingParty(index: number) {
    if (opposingParties.length <= 1) return
    setOpposingParties(opposingParties.filter((_, i) => i !== index))
  }

  // ── Damages items ──

  function updateDamagesItem(index: number, field: 'category' | 'amount', value: string | number) {
    const updated = [...damagesItems]
    updated[index] = { ...updated[index], [field]: value }
    setDamagesItems(updated)
  }

  function addDamagesItem() {
    setDamagesItems([...damagesItems, { category: '', amount: 0 }])
  }

  function removeDamagesItem(index: number) {
    if (damagesItems.length <= 1) return
    setDamagesItems(damagesItems.filter((_, i) => i !== index))
  }

  const damagesTotal = damagesItems.reduce((sum, d) => sum + (d.amount || 0), 0)

  // ── API calls ──

  async function generateDraft() {
    setGenerating(true)
    setGenError(null)
    try {
      const res = await fetch(`/api/cases/${caseId}/generate-filing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document_type: 'default_judgment', facts: buildFacts() }),
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

  async function handleBeforeReview() {
    const error = validate()
    if (error) {
      setGenError(error)
      throw new Error(error)
    }
    await generateDraft()
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

  // ── Review content ──

  const courtLabel = getCourtLabel(caseData.court_type)

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
        <p className="text-sm text-warm-muted">Generating your packet...</p>
      )}
    </div>
  )

  // ── Render ──

  return (
    <StepRunner
      caseId={caseId}
      taskId={taskId}
      title="Default Judgment Packet"
      reassurance="We'll help you prepare a default judgment packet. This is used when the defendant failed to respond to your lawsuit on time."
      onConfirm={handleConfirm}
      onSave={handleSave}
      onBeforeReview={handleBeforeReview}
      reviewContent={reviewContent}
      reviewButtonLabel="Generate Packet →"
    >
      <div className="space-y-8">
        {genError && (
          <div className="rounded-lg border border-calm-amber bg-calm-amber/5 p-3">
            <p className="text-sm text-warm-text">{genError}</p>
            <p className="text-xs text-warm-muted mt-1">Review your information below and try again.</p>
          </div>
        )}

        {/* 1. Court info (read-only) */}
        <div className="rounded-lg border border-warm-border bg-white p-4 space-y-1">
          <p className="text-xs font-medium text-warm-muted uppercase tracking-wide">Court</p>
          <p className="text-sm text-warm-text">
            {courtLabel}{caseData.county ? `, ${caseData.county} County` : ''}
          </p>
        </div>

        {/* 2. Parties */}
        <div>
          <h2 className="text-sm font-semibold text-warm-text mb-4">1. Parties</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-warm-text mb-3">Your Information</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="your-name">Full legal name *</Label>
                  <Input
                    id="your-name"
                    value={yourInfo.full_name}
                    onChange={(e) => setYourInfo({ ...yourInfo, full_name: e.target.value })}
                    placeholder="e.g. John Michael Doe"
                  />
                </div>
                <div>
                  <Label htmlFor="your-address">Address</Label>
                  <Input
                    id="your-address"
                    value={yourInfo.address ?? ''}
                    onChange={(e) => setYourInfo({ ...yourInfo, address: e.target.value })}
                    placeholder="123 Main St, City, TX 75001"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-warm-text mb-3">Opposing Party (Defendant)</h3>
              {opposingParties.map((party, i) => (
                <div key={i} className="space-y-3 mb-4">
                  {opposingParties.length > 1 && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-warm-muted">Party {i + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeOpposingParty(i)}
                        className="text-xs text-warm-muted hover:text-warm-text"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  <div>
                    <Label htmlFor={`opp-name-${i}`}>Full legal name *</Label>
                    <Input
                      id={`opp-name-${i}`}
                      value={party.full_name}
                      onChange={(e) => updateOpposingParty(i, 'full_name', e.target.value)}
                      placeholder="e.g. Jane Smith"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`opp-address-${i}`}>Address (if known)</Label>
                    <Input
                      id={`opp-address-${i}`}
                      value={party.address ?? ''}
                      onChange={(e) => updateOpposingParty(i, 'address', e.target.value)}
                    />
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addOpposingParty}>
                + Add another party
              </Button>
            </div>
          </div>
        </div>

        {/* 3. Case Summary */}
        <div>
          <h2 className="text-sm font-semibold text-warm-text mb-4">2. Case Summary</h2>
          <div className="space-y-3">
            <div>
              <Label htmlFor="cause-number">Cause / case number (if known)</Label>
              <Input
                id="cause-number"
                value={causeNumber}
                onChange={(e) => setCauseNumber(e.target.value)}
                placeholder="e.g. CV-2024-12345"
              />
            </div>
            <div>
              <Label htmlFor="description">Description of the case *</Label>
              <p className="text-xs text-warm-muted mb-1">Briefly describe what happened and why you are owed money. Minimum 10 characters.</p>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full min-h-[100px] rounded-md border border-warm-border p-3 text-sm text-warm-text bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="The defendant failed to pay for services rendered..."
              />
            </div>
          </div>
        </div>

        {/* 4. Service Information */}
        <div>
          <h2 className="text-sm font-semibold text-warm-text mb-4">3. Service Information</h2>
          <div className="space-y-3">
            <div>
              <Label htmlFor="service-date">Date served *</Label>
              <p className="text-xs text-warm-muted mb-1">The date the defendant was served with the lawsuit.</p>
              <Input
                id="service-date"
                type="date"
                value={serviceDate}
                onChange={(e) => setServiceDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="answer-deadline">Answer deadline *</Label>
              <p className="text-xs text-warm-muted mb-1">The deadline by which the defendant was required to respond.</p>
              <Input
                id="answer-deadline"
                type="date"
                value={answerDeadline}
                onChange={(e) => setAnswerDeadline(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* 5. Damages */}
        <div>
          <h2 className="text-sm font-semibold text-warm-text mb-4">4. Damages</h2>
          <div className="space-y-3">
            {damagesItems.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex-1">
                  <Label htmlFor={`dmg-cat-${i}`}>Category *</Label>
                  <Input
                    id={`dmg-cat-${i}`}
                    value={item.category}
                    onChange={(e) => updateDamagesItem(i, 'category', e.target.value)}
                    placeholder="e.g. Unpaid invoices"
                  />
                </div>
                <div className="w-32">
                  <Label htmlFor={`dmg-amt-${i}`}>Amount *</Label>
                  <Input
                    id={`dmg-amt-${i}`}
                    type="number"
                    value={item.amount || ''}
                    onChange={(e) => updateDamagesItem(i, 'amount', parseFloat(e.target.value) || 0)}
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
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addDamagesItem}>
              + Add item
            </Button>
            <div className="rounded-lg border border-warm-border bg-white p-3 flex items-center justify-between">
              <span className="text-sm font-medium text-warm-text">Total</span>
              <span className="text-sm font-semibold text-warm-text">
                ${damagesTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* 6. Affidavit */}
        <div>
          <h2 className="text-sm font-semibold text-warm-text mb-4">5. Affidavit</h2>
          <div className="flex items-start gap-3 rounded-lg border border-warm-border p-3">
            <Checkbox
              id="non-military"
              checked={nonMilitaryAffidavit}
              onCheckedChange={(c) => setNonMilitaryAffidavit(c === true)}
            />
            <div>
              <Label htmlFor="non-military" className="cursor-pointer">
                Include Affidavit of Non-Military Service
              </Label>
              <p className="text-xs text-warm-muted mt-1">
                Required under the Servicemembers Civil Relief Act (SCRA). Affirms the defendant is not on active military duty.
              </p>
            </div>
          </div>
        </div>
      </div>
    </StepRunner>
  )
}
