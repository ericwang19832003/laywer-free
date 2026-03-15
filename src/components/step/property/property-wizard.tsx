'use client'

import { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { WizardShell } from '@/components/ui/wizard-shell'
import type { WizardStep } from '@/components/ui/wizard-shell'
import { Loader2 } from 'lucide-react'
import { FilingMethodStep } from '@/components/step/filing-method-step'
import { FILING_CONFIGS } from '@/lib/filing-configs'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface PropertyWizardProps {
  caseId: string
  taskId: string
  existingMetadata?: Record<string, unknown>
  propertyDetails?: {
    property_address: string | null
    property_type: string | null
    property_value: number | null
    other_party_name: string | null
    other_party_relationship: string | null
    dispute_description: string | null
    damages_sought: number | null
    has_survey: boolean
    has_title_insurance: boolean
  } | null
  caseData?: { county: string | null; court_type: string; state?: string }
}

/* ------------------------------------------------------------------ */
/*  Step definitions                                                    */
/* ------------------------------------------------------------------ */

const WIZARD_STEPS: WizardStep[] = [
  {
    id: 'preflight',
    title: 'Before You Start',
    subtitle: "Let's make sure you have everything you need.",
    estimateMinutes: 2,
  },
  {
    id: 'property_details',
    title: 'Property Details',
    subtitle: 'Tell us about the property at the center of this dispute.',
    estimateMinutes: 3,
  },
  {
    id: 'dispute',
    title: 'The Dispute',
    subtitle: "Describe what happened and the other party's actions.",
    estimateMinutes: 5,
  },
  {
    id: 'damages',
    title: 'Your Damages',
    subtitle: 'Property damage, diminished value, and repair costs.',
    estimateMinutes: 4,
  },
  {
    id: 'venue',
    title: 'Where to File',
    subtitle: "We'll help you pick the right court.",
    estimateMinutes: 2,
  },
  {
    id: 'how_to_file',
    title: 'How to File',
    subtitle: 'Choose how to submit your petition.',
    estimateMinutes: 2,
  },
  {
    id: 'review',
    title: 'Review Everything',
    subtitle: 'Check your information before generating your petition.',
    estimateMinutes: 3,
  },
  {
    id: 'generate',
    title: 'Generate Draft',
    subtitle: 'We will generate your property dispute petition.',
    estimateMinutes: 2,
  },
]

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function PropertyWizard({
  caseId,
  taskId,
  existingMetadata,
  propertyDetails,
  caseData,
}: PropertyWizardProps) {
  const router = useRouter()
  const meta = (existingMetadata ?? {}) as Record<string, unknown>

  /* ---- Property details ---- */
  const [propertyAddress, setPropertyAddress] = useState<string>(
    (meta.property_address as string) ?? propertyDetails?.property_address ?? ''
  )
  const [propertyType, setPropertyType] = useState<string>(
    (meta.property_type as string) ?? propertyDetails?.property_type ?? 'residential'
  )
  const [ownershipStatus, setOwnershipStatus] = useState<string>(
    (meta.ownership_status as string) ?? ''
  )

  /* ---- Dispute info ---- */
  const [disputeDescription, setDisputeDescription] = useState<string>(
    (meta.dispute_description as string) ?? propertyDetails?.dispute_description ?? ''
  )
  const [otherPartyName, setOtherPartyName] = useState<string>(
    (meta.other_party_name as string) ?? propertyDetails?.other_party_name ?? ''
  )
  const [otherPartyActions, setOtherPartyActions] = useState<string>(
    (meta.other_party_actions as string) ?? ''
  )

  /* ---- Damages ---- */
  const [propertyDamageAmount, setPropertyDamageAmount] = useState<string>(
    (meta.property_damage_amount as string) ?? ''
  )
  const [diminishedValue, setDiminishedValue] = useState<string>(
    (meta.diminished_value as string) ?? ''
  )
  const [repairCosts, setRepairCosts] = useState<string>(
    (meta.repair_costs as string) ?? ''
  )

  /* ---- Venue ---- */
  const [propertyCounty, setPropertyCounty] = useState<string>(
    (meta.property_county as string) ?? caseData?.county ?? ''
  )

  /* ---- Filing method ---- */
  const [filingMethod, setFilingMethod] = useState<'online' | 'in_person' | ''>(
    (meta.filing_method as 'online' | 'in_person') ?? ''
  )

  /* ---- Wizard state ---- */
  const [currentStep, setCurrentStep] = useState(
    typeof meta._wizard_step === 'number' ? meta._wizard_step : 0
  )
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState<string | null>(null)
  const [acknowledged, setAcknowledged] = useState(false)

  /* ---- Helpers ---- */

  function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value)
  }

  const totalDamages = useMemo(() => {
    const pd = parseFloat(propertyDamageAmount) || 0
    const dv = parseFloat(diminishedValue) || 0
    const rc = parseFloat(repairCosts) || 0
    return pd + dv + rc
  }, [propertyDamageAmount, diminishedValue, repairCosts])

  const buildMetadata = useCallback(() => {
    return {
      property_address: propertyAddress || null,
      property_type: propertyType,
      ownership_status: ownershipStatus || null,
      dispute_description: disputeDescription || null,
      other_party_name: otherPartyName || null,
      other_party_actions: otherPartyActions || null,
      property_damage_amount: propertyDamageAmount || null,
      diminished_value: diminishedValue || null,
      repair_costs: repairCosts || null,
      total_damages: totalDamages,
      property_county: propertyCounty || null,
      filing_method: filingMethod || null,
      _wizard_step: currentStep,
    }
  }, [
    propertyAddress,
    propertyType,
    ownershipStatus,
    disputeDescription,
    otherPartyName,
    otherPartyActions,
    propertyDamageAmount,
    diminishedValue,
    repairCosts,
    totalDamages,
    propertyCounty,
    filingMethod,
    currentStep,
  ])

  /* ---- API helpers ---- */

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

  async function generateDraft() {
    setGenerating(true)
    setGenError(null)
    try {
      const res = await fetch(`/api/cases/${caseId}/generate-filing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_type: 'property_petition',
          facts: {
            property_address: propertyAddress,
            property_type: propertyType,
            ownership_status: ownershipStatus,
            other_party_name: otherPartyName,
            other_party_actions: otherPartyActions,
            dispute_description: disputeDescription,
            property_damage_amount: parseFloat(propertyDamageAmount) || 0,
            diminished_value: parseFloat(diminishedValue) || 0,
            repair_costs: parseFloat(repairCosts) || 0,
            total_damages: totalDamages,
            county: propertyCounty,
            court_type: caseData?.court_type || 'district',
          },
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to generate petition')
      }
      // Mark task as completed after successful generation
      const metadata = buildMetadata()
      await patchTask('in_progress', metadata)
      await patchTask('completed')
      router.push(`/case/${caseId}`)
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'Failed to generate petition')
    } finally {
      setGenerating(false)
    }
  }

  /* ---- Wizard handlers ---- */

  const handleSave = useCallback(async () => {
    await patchTask('in_progress', buildMetadata())
  }, [buildMetadata]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleComplete = useCallback(async () => {
    await patchTask('in_progress', buildMetadata())
    await generateDraft()
  }, [buildMetadata]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ---- canAdvance per step ---- */

  const canAdvance = useMemo(() => {
    const stepId = WIZARD_STEPS[currentStep]?.id
    switch (stepId) {
      case 'preflight':
        return true
      case 'property_details':
        return propertyAddress.trim() !== ''
      case 'dispute':
        return disputeDescription.trim() !== ''
      case 'damages':
        return true
      case 'venue':
        return true
      case 'how_to_file':
        return filingMethod !== ''
      case 'review':
        return true
      case 'generate':
        return !generating
      default:
        return true
    }
  }, [currentStep, propertyAddress, disputeDescription, generating, filingMethod])

  /* ---- Step rendering ---- */

  function renderStep() {
    const stepId = WIZARD_STEPS[currentStep]?.id
    switch (stepId) {
      case 'preflight':
        return (
          <div className="space-y-4">
            <p className="text-sm text-warm-text">
              Before you begin, make sure you have the following available:
            </p>
            <ul className="space-y-2">
              {[
                'The property address and a description of the property',
                'The other party\'s name and contact information',
                'Any property surveys, deeds, or title documents',
                'Photos or documentation of property damage',
                'Receipts or estimates for repair costs',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-warm-muted">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-xs text-warm-muted mt-4">
              Don&apos;t worry if you don&apos;t have everything. You can save your progress and come back.
            </p>
          </div>
        )

      case 'property_details':
        return (
          <div className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="pw-address" className="text-sm font-medium text-warm-text">
                Property address
              </label>
              <input
                id="pw-address"
                type="text"
                placeholder="e.g. 1234 Main St, Austin, TX 78701"
                value={propertyAddress}
                onChange={(e) => setPropertyAddress(e.target.value)}
                className="flex h-9 w-full rounded-md border border-warm-border bg-transparent px-3 py-1 text-sm text-warm-text shadow-xs placeholder:text-warm-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-warm-text">Property type</label>
              <div className="space-y-2">
                {[
                  { value: 'residential', label: 'Residential' },
                  { value: 'commercial', label: 'Commercial' },
                  { value: 'land', label: 'Land / Vacant Lot' },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center gap-3 cursor-pointer rounded-lg border p-3 transition-colors ${
                      propertyType === option.value
                        ? 'border-calm-indigo bg-calm-indigo/5'
                        : 'border-warm-border hover:bg-warm-bg/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="pw-property-type"
                      value={option.value}
                      checked={propertyType === option.value}
                      onChange={() => setPropertyType(option.value)}
                      className="h-4 w-4 shrink-0 border-warm-border text-calm-indigo focus:ring-calm-indigo"
                    />
                    <span className="text-sm text-warm-text">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="pw-ownership" className="text-sm font-medium text-warm-text">
                Your ownership status
              </label>
              <select
                id="pw-ownership"
                value={ownershipStatus}
                onChange={(e) => setOwnershipStatus(e.target.value)}
                className="flex h-9 w-full rounded-md border border-warm-border bg-transparent px-3 py-1 text-sm text-warm-text shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo"
              >
                <option value="">Select...</option>
                <option value="owner">I own the property</option>
                <option value="co_owner">I co-own the property</option>
                <option value="buyer">I am buying the property</option>
                <option value="heir">I inherited the property</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        )

      case 'dispute':
        return (
          <div className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="pw-description" className="text-sm font-medium text-warm-text">
                Describe the dispute
              </label>
              <textarea
                id="pw-description"
                placeholder="What is the core issue? How did it start? What property rights are at stake?"
                value={disputeDescription}
                onChange={(e) => setDisputeDescription(e.target.value)}
                rows={4}
                className="flex min-h-[60px] w-full rounded-md border border-warm-border bg-transparent px-3 py-2 text-sm text-warm-text shadow-xs placeholder:text-warm-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="pw-other-party" className="text-sm font-medium text-warm-text">
                Other party&apos;s name
              </label>
              <input
                id="pw-other-party"
                type="text"
                placeholder="e.g. John Smith or Oakwood HOA"
                value={otherPartyName}
                onChange={(e) => setOtherPartyName(e.target.value)}
                className="flex h-9 w-full rounded-md border border-warm-border bg-transparent px-3 py-1 text-sm text-warm-text shadow-xs placeholder:text-warm-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="pw-actions" className="text-sm font-medium text-warm-text">
                What did the other party do?
              </label>
              <textarea
                id="pw-actions"
                placeholder="e.g. Built a fence across my property line, allowed water runoff onto my land, etc."
                value={otherPartyActions}
                onChange={(e) => setOtherPartyActions(e.target.value)}
                rows={3}
                className="flex min-h-[60px] w-full rounded-md border border-warm-border bg-transparent px-3 py-2 text-sm text-warm-text shadow-xs placeholder:text-warm-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo"
              />
            </div>
          </div>
        )

      case 'damages':
        return (
          <div className="space-y-5">
            <p className="text-sm text-warm-muted">
              Enter any amounts that apply. Leave fields blank if they don&apos;t apply to your case.
            </p>

            <div className="space-y-2">
              <label htmlFor="pw-property-damage" className="text-sm font-medium text-warm-text">
                Property damage
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-warm-muted">$</span>
                <input
                  id="pw-property-damage"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={propertyDamageAmount}
                  onChange={(e) => setPropertyDamageAmount(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-warm-border bg-transparent pl-7 pr-3 py-1 text-sm text-warm-text shadow-xs placeholder:text-warm-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo"
                />
              </div>
              <p className="text-xs text-warm-muted">Damage to the property itself (structures, landscaping, etc.).</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="pw-diminished-value" className="text-sm font-medium text-warm-text">
                Diminished property value
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-warm-muted">$</span>
                <input
                  id="pw-diminished-value"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={diminishedValue}
                  onChange={(e) => setDiminishedValue(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-warm-border bg-transparent pl-7 pr-3 py-1 text-sm text-warm-text shadow-xs placeholder:text-warm-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo"
                />
              </div>
              <p className="text-xs text-warm-muted">Reduction in property value caused by the dispute (e.g., encroachment, nuisance).</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="pw-repair-costs" className="text-sm font-medium text-warm-text">
                Repair costs
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-warm-muted">$</span>
                <input
                  id="pw-repair-costs"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={repairCosts}
                  onChange={(e) => setRepairCosts(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-warm-border bg-transparent pl-7 pr-3 py-1 text-sm text-warm-text shadow-xs placeholder:text-warm-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo"
                />
              </div>
              <p className="text-xs text-warm-muted">Cost to repair or restore the property (estimates or invoices).</p>
            </div>

            {totalDamages > 0 && (
              <div className="rounded-lg border border-warm-border bg-calm-indigo/5 p-4">
                <p className="text-sm font-medium text-warm-text">
                  Total damages: {formatCurrency(totalDamages)}
                </p>
              </div>
            )}
          </div>
        )

      case 'venue':
        return (
          <div className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="pw-county" className="text-sm font-medium text-warm-text">
                Which county is the property located in?
              </label>
              <input
                id="pw-county"
                type="text"
                placeholder="e.g. Travis, Harris, Dallas"
                value={propertyCounty}
                onChange={(e) => setPropertyCounty(e.target.value)}
                className="flex h-9 w-full rounded-md border border-warm-border bg-transparent px-3 py-1 text-sm text-warm-text shadow-xs placeholder:text-warm-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo"
              />
              <p className="text-xs text-warm-muted">
                Property disputes are typically filed in the county where the property is located.
              </p>
            </div>
          </div>
        )

      case 'how_to_file':
        return (
          <FilingMethodStep
            filingMethod={filingMethod}
            onFilingMethodChange={setFilingMethod}
            county={propertyCounty}
            courtType={caseData?.court_type || 'district'}
            config={FILING_CONFIGS.property}
            state={caseData?.state}
          />
        )

      case 'review':
        return (
          <div className="space-y-4">
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-warm-muted">Property address</dt>
                <dd className="text-warm-text mt-0.5">{propertyAddress || 'Not provided'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-warm-muted">Property type</dt>
                <dd className="text-warm-text mt-0.5">
                  {{ residential: 'Residential', commercial: 'Commercial', land: 'Land / Vacant Lot' }[propertyType] || propertyType}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-warm-muted">Ownership status</dt>
                <dd className="text-warm-text mt-0.5">
                  {{ owner: 'Owner', co_owner: 'Co-owner', buyer: 'Buyer', heir: 'Heir', other: 'Other' }[ownershipStatus] || 'Not provided'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-warm-muted">Dispute description</dt>
                <dd className="text-warm-text mt-0.5">{disputeDescription || 'Not provided'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-warm-muted">Other party</dt>
                <dd className="text-warm-text mt-0.5">{otherPartyName || 'Not provided'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-warm-muted">Other party&apos;s actions</dt>
                <dd className="text-warm-text mt-0.5">{otherPartyActions || 'Not provided'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-warm-muted">Total damages</dt>
                <dd className="text-warm-text mt-0.5">
                  {totalDamages > 0 ? formatCurrency(totalDamages) : 'Not provided'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-warm-muted">Filing county</dt>
                <dd className="text-warm-text mt-0.5">{propertyCounty || 'Not provided'}</dd>
              </div>
            </dl>
          </div>
        )

      case 'generate':
        return (
          <div className="space-y-4">
            {genError && (
              <div className="rounded-lg border border-calm-amber bg-calm-amber/5 p-3">
                <p className="text-sm text-warm-text">{genError}</p>
              </div>
            )}
            {generating ? (
              <div className="flex items-center gap-3 py-12 justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-warm-muted" />
                <p className="text-sm text-warm-muted">
                  Generating your property dispute petition... This may take a moment.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-warm-text">
                  Ready to generate your property dispute petition. Click &quot;Generate My Petition&quot; to proceed.
                </p>
                <label className="flex items-start gap-3 cursor-pointer rounded-lg border border-warm-border p-3 transition-colors hover:bg-warm-bg/50">
                  <input
                    type="checkbox"
                    checked={acknowledged}
                    onChange={(e) => setAcknowledged(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-warm-border text-calm-indigo focus:ring-calm-indigo"
                  />
                  <span className="text-sm text-warm-text">
                    I understand this is a draft document that may need review and modification before filing.
                  </span>
                </label>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  /* ---- Render ---- */

  return (
    <WizardShell
      caseId={caseId}
      title="Prepare Your Property Dispute Petition"
      steps={WIZARD_STEPS}
      currentStep={currentStep}
      onStepChange={setCurrentStep}
      onSave={handleSave}
      onComplete={handleComplete}
      canAdvance={canAdvance}
      totalEstimateMinutes={21}
      completeButtonLabel={generating ? 'Generating...' : 'Generate My Petition'}
    >
      {renderStep()}
    </WizardShell>
  )
}
