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

interface LtDemandLetterStepProps {
  caseId: string
  taskId: string
  existingMetadata?: Record<string, unknown>
  landlordTenantDetails: {
    landlord_tenant_sub_type: string
    party_role: string
    property_address: string | null
    monthly_rent: number | null
    deposit_amount: number | null
    demand_letter_sent: boolean
  } | null
  caseData: { county: string | null }
  skippable?: boolean
}

const SUB_TYPE_LABELS: Record<string, string> = {
  eviction: 'Eviction',
  nonpayment: 'Non-Payment of Rent',
  security_deposit: 'Security Deposit',
  property_damage: 'Property Damage',
  repair_maintenance: 'Repair & Maintenance',
  lease_termination: 'Lease Termination',
  habitability: 'Habitability',
  other: 'Other',
}

export function LtDemandLetterStep({
  caseId,
  taskId,
  existingMetadata,
  landlordTenantDetails,
  caseData,
  skippable,
}: LtDemandLetterStepProps) {
  const meta = existingMetadata ?? {}
  const partyRole = landlordTenantDetails?.party_role ?? 'tenant'
  const subType = landlordTenantDetails?.landlord_tenant_sub_type ?? 'other'
  const isLandlord = partyRole === 'landlord'

  // Section 1: Your info
  const [yourName, setYourName] = useState(
    (meta.your_name as string) ?? ''
  )
  const [yourAddress, setYourAddress] = useState(
    (meta.your_address as string) ?? ''
  )

  // Section 2: Other party info
  const [otherName, setOtherName] = useState(
    (meta.other_name as string) ?? ''
  )
  const [otherAddress, setOtherAddress] = useState(
    (meta.other_address as string) ?? ''
  )

  // Section 3: Property address
  const [propertyAddress, setPropertyAddress] = useState(
    (meta.property_address as string) ?? landlordTenantDetails?.property_address ?? ''
  )

  // Section 4: Description
  const [description, setDescription] = useState(
    (meta.description as string) ?? ''
  )

  // Section 5: Damages
  const [damagesItems, setDamagesItems] = useState<DamageItem[]>(
    (meta.damages_items as DamageItem[]) ?? [
      { category: '', amount: 0, description: '' },
    ]
  )

  // Section 6: Demand settings
  const [deadlineDays, setDeadlineDays] = useState(
    (meta.deadline_days as string) ?? '14'
  )
  const [preferredResolution, setPreferredResolution] = useState(
    (meta.preferred_resolution as string) ?? ''
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
      const validItems = damagesItems
        .filter((i) => i.amount > 0)
        .map((i) => ({
          category: i.category,
          amount: i.amount,
          description: i.description,
        }))

      const res = await fetch(`/api/cases/${caseId}/generate-filing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_type: 'landlord_tenant_demand_letter',
          facts: {
            party_role: partyRole,
            your_info: { full_name: yourName, address: yourAddress },
            other_party: { full_name: otherName, address: otherAddress },
            landlord_tenant_sub_type: subType,
            property_address: propertyAddress,
            claim_amount: totalDamages,
            damages_breakdown: validItems,
            description,
            deadline_days: parseInt(deadlineDays),
            preferred_resolution: preferredResolution || undefined,
            monthly_rent: landlordTenantDetails?.monthly_rent || undefined,
            deposit_amount: landlordTenantDetails?.deposit_amount || undefined,
            county: caseData.county || undefined,
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
      your_name: yourName,
      your_address: yourAddress,
      other_name: otherName,
      other_address: otherAddress,
      property_address: propertyAddress,
      description,
      damages_items: damagesItems,
      deadline_days: deadlineDays,
      preferred_resolution: preferredResolution || null,
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
          documentTitle="Landlord-Tenant Demand Letter"
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
      reassurance="A demand letter puts the other party on notice and is often required before filing a landlord-tenant case. We'll help you draft one."
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

        {/* Sub-type info summary */}
        <div className="rounded-lg border border-warm-border bg-white p-4 space-y-1">
          <p className="text-xs font-medium text-warm-muted uppercase tracking-wide">
            Dispute Type
          </p>
          <p className="text-sm text-warm-text">
            {SUB_TYPE_LABELS[subType] ?? subType} &mdash;{' '}
            {isLandlord ? 'You are the landlord' : 'You are the tenant'}
          </p>
        </div>

        {/* Section 1: Your info */}
        <div>
          <h2 className="text-sm font-semibold text-warm-text mb-4">
            1. Your Information ({isLandlord ? 'Landlord' : 'Tenant'})
          </h2>
          <div className="space-y-3">
            <div>
              <Label htmlFor="your-name">Full legal name *</Label>
              <Input
                id="your-name"
                value={yourName}
                onChange={(e) => setYourName(e.target.value)}
                placeholder="e.g. John Michael Doe"
              />
            </div>
            <div>
              <Label htmlFor="your-address">Mailing address *</Label>
              <Input
                id="your-address"
                value={yourAddress}
                onChange={(e) => setYourAddress(e.target.value)}
                placeholder="123 Main St, City, TX 75001"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Other party info */}
        <div>
          <h2 className="text-sm font-semibold text-warm-text mb-4">
            2. Other Party&apos;s Information ({isLandlord ? 'Tenant' : 'Landlord'})
          </h2>
          <div className="space-y-3">
            <div>
              <Label htmlFor="other-name">Full legal name *</Label>
              <Input
                id="other-name"
                value={otherName}
                onChange={(e) => setOtherName(e.target.value)}
                placeholder={
                  isLandlord
                    ? 'e.g. Jane Smith'
                    : 'e.g. Acme Property Management LLC'
                }
              />
            </div>
            <div>
              <Label htmlFor="other-address">Mailing address *</Label>
              <Input
                id="other-address"
                value={otherAddress}
                onChange={(e) => setOtherAddress(e.target.value)}
                placeholder="456 Oak Ave, City, TX 75002"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Property address */}
        <div>
          <h2 className="text-sm font-semibold text-warm-text mb-4">
            3. Property Address
          </h2>
          <div className="space-y-2">
            <Label htmlFor="property-address">
              Address of the rental property *
            </Label>
            <Input
              id="property-address"
              value={propertyAddress}
              onChange={(e) => setPropertyAddress(e.target.value)}
              placeholder="789 Elm St, Apt 4B, City, TX 75003"
            />
            <p className="text-xs text-warm-muted">
              The full address of the property this dispute is about.
            </p>
          </div>
        </div>

        {/* Section 4: Description */}
        <div>
          <h2 className="text-sm font-semibold text-warm-text mb-4">
            4. Describe Your Situation
          </h2>
          <div className="space-y-2">
            <Label htmlFor="description">
              What happened? Why are you making this demand? *
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

        {/* Section 5: Damages */}
        <div>
          <h2 className="text-sm font-semibold text-warm-text mb-4">
            5. Damages
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
                      placeholder="e.g. Unpaid rent, Security deposit, Repair costs"
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

        {/* Section 6: Demand settings */}
        <div>
          <h2 className="text-sm font-semibold text-warm-text mb-4">
            6. Demand Settings
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

            {/* Sub-type specific legal notes */}
            {subType === 'security_deposit' && (
              <div className="rounded-md border border-calm-indigo/30 bg-calm-indigo/5 px-3 py-2">
                <p className="text-xs font-medium text-warm-text">
                  Security deposit law
                </p>
                <p className="text-xs text-warm-muted mt-0.5">
                  Texas law requires landlords to return deposits within 30 days
                  (Tex. Prop. Code &sect; 92.104). If your landlord has not
                  returned your deposit or provided an itemized list of
                  deductions, you may be entitled to up to 3x the deposit plus
                  $100 in statutory damages.
                </p>
              </div>
            )}
            {subType === 'repair_maintenance' && (
              <div className="rounded-md border border-calm-indigo/30 bg-calm-indigo/5 px-3 py-2">
                <p className="text-xs font-medium text-warm-text">
                  Repair &amp; maintenance rights
                </p>
                <p className="text-xs text-warm-muted mt-0.5">
                  Tenants may have repair-and-deduct rights under Texas law
                  (Tex. Prop. Code &sect; 92.0561). You must give the landlord
                  reasonable time to make repairs after written notice before
                  exercising this right.
                </p>
              </div>
            )}

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
                placeholder="e.g. Full refund of security deposit by [date], completion of repairs within 14 days..."
              />
              <p className="text-xs text-warm-muted">
                Describe what outcome you would accept to resolve this without
                going to court.
              </p>
            </div>
          </div>
        </div>
      </div>
    </StepRunner>
  )
}
