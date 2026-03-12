'use client'

import { useState } from 'react'
import { StepRunner } from '../step-runner'
import { AnnotatedDraftViewer } from '../filing/annotated-draft-viewer'
import type { DraftAnnotation } from '../filing/annotated-draft-viewer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { isPropertyDamageSubType } from '@/lib/guided-steps/personal-injury/constants'
import { StepAuthoritySidebar } from '../step-authority-sidebar'

interface MedicalProvider {
  name: string
  type: string
  dates: string
  amount: string
}

interface PIDemandLetterStepProps {
  caseId: string
  taskId: string
  existingMetadata?: Record<string, unknown>
  personalInjuryDetails: {
    pi_sub_type?: string
    incident_date?: string
    incident_location?: string
    incident_description?: string
    injury_description?: string
    injury_severity?: string
    medical_providers?: unknown[]
    medical_expenses?: number
    lost_wages?: number
    property_damage_amount?: number
    pain_suffering_multiplier?: number
    your_insurance_carrier?: string
    your_policy_number?: string
  } | null
  caseData: { county: string | null }
  skippable?: boolean
}

export function PIDemandLetterStep({
  caseId,
  taskId,
  existingMetadata,
  personalInjuryDetails,
  caseData,
  skippable,
}: PIDemandLetterStepProps) {
  const meta = existingMetadata ?? {}
  const pid = personalInjuryDetails
  const isPropertyDamage = isPropertyDamageSubType(pid?.pi_sub_type)

  // Section 1: Your Information
  const [yourName, setYourName] = useState(
    (meta.your_name as string) ?? ''
  )
  const [yourAddress, setYourAddress] = useState(
    (meta.your_address as string) ?? ''
  )

  // Section 2: Insurance Information
  const [insuranceCarrier, setInsuranceCarrier] = useState(
    (meta.insurance_carrier as string) ?? pid?.your_insurance_carrier ?? ''
  )
  const [policyNumber, setPolicyNumber] = useState(
    (meta.policy_number as string) ?? pid?.your_policy_number ?? ''
  )
  const [claimNumber, setClaimNumber] = useState(
    (meta.claim_number as string) ?? ''
  )

  // Section 3: At-Fault Party
  const [defendantName, setDefendantName] = useState(
    (meta.defendant_name as string) ?? ''
  )
  const [defendantAddress, setDefendantAddress] = useState(
    (meta.defendant_address as string) ?? ''
  )

  // Section 4: Incident Details
  const [incidentDate, setIncidentDate] = useState(
    (meta.incident_date as string) ?? pid?.incident_date ?? ''
  )
  const [incidentLocation, setIncidentLocation] = useState(
    (meta.incident_location as string) ?? pid?.incident_location ?? ''
  )
  const [incidentDescription, setIncidentDescription] = useState(
    (meta.incident_description as string) ?? pid?.incident_description ?? ''
  )

  // Section 5: Injuries
  const [injuriesDescription, setInjuriesDescription] = useState(
    (meta.injuries_description as string) ?? pid?.injury_description ?? ''
  )
  const [injurySeverity, setInjurySeverity] = useState(
    (meta.injury_severity as string) ?? pid?.injury_severity ?? ''
  )

  // Section 6: Medical Providers
  function initProviders(): MedicalProvider[] {
    if (meta.medical_providers && Array.isArray(meta.medical_providers)) {
      return meta.medical_providers as MedicalProvider[]
    }
    if (pid?.medical_providers && Array.isArray(pid.medical_providers)) {
      return pid.medical_providers.map((p: unknown) => {
        const provider = p as Record<string, unknown>
        return {
          name: (provider.name as string) ?? '',
          type: (provider.type as string) ?? '',
          dates: (provider.dates as string) ?? '',
          amount: (provider.amount as string) ?? (provider.amount != null ? String(provider.amount) : ''),
        }
      })
    }
    return [{ name: '', type: '', dates: '', amount: '' }]
  }

  const [providers, setProviders] = useState<MedicalProvider[]>(initProviders)

  // Section 7: Damages
  const [lostWages, setLostWages] = useState(
    (meta.lost_wages as string) ?? (pid?.lost_wages?.toString() ?? '')
  )
  const [propertyDamage, setPropertyDamage] = useState(
    (meta.property_damage as string) ??
      (pid?.property_damage_amount?.toString() ?? '')
  )

  // Draft state
  const [draft, setDraft] = useState((meta.draft_text as string) ?? '')
  const [annotations, setAnnotations] = useState<DraftAnnotation[]>([])
  const [acknowledged, setAcknowledged] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState<string | null>(null)
  const [selectedAuthorityIds, setSelectedAuthorityIds] = useState<number[]>([])

  // -- Computed damages --

  const totalMedicalExpenses = providers.reduce(
    (sum, p) => sum + (parseFloat(p.amount) || 0),
    0
  )

  const severityMultipliers: Record<string, number> = {
    minor: 1.5,
    moderate: 3,
    severe: 5,
  }
  const multiplier =
    pid?.pain_suffering_multiplier ??
    severityMultipliers[injurySeverity] ??
    1.5

  const painSufferingAmount = multiplier * totalMedicalExpenses
  const totalDemandAmount = isPropertyDamage
    ? totalMedicalExpenses + (parseFloat(lostWages) || 0) + (parseFloat(propertyDamage) || 0)
    : totalMedicalExpenses + (parseFloat(lostWages) || 0) + (parseFloat(propertyDamage) || 0) + painSufferingAmount

  // -- Provider helpers --

  function updateProvider(
    index: number,
    field: keyof MedicalProvider,
    value: string
  ) {
    setProviders((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  function addProvider() {
    setProviders((prev) => [...prev, { name: '', type: '', dates: '', amount: '' }])
  }

  function removeProvider(index: number) {
    setProviders((prev) => prev.filter((_, i) => i !== index))
  }

  // -- Currency formatting --

  function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value)
  }

  // -- API calls --

  async function generateDraft() {
    setGenerating(true)
    setGenError(null)
    try {
      const res = await fetch(`/api/cases/${caseId}/generate-filing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_type: 'pi_demand_letter',
          facts: {
            your_info: { full_name: yourName, address: yourAddress },
            defendant_info: {
              full_name: defendantName,
              address: defendantAddress,
            },
            insurance_carrier: insuranceCarrier,
            policy_number: policyNumber || undefined,
            claim_number: claimNumber || undefined,
            pi_sub_type: pid?.pi_sub_type ?? 'other_injury',
            incident_date: incidentDate,
            incident_location: incidentLocation,
            incident_description: incidentDescription,
            injuries_description: injuriesDescription,
            injury_severity: injurySeverity,
            medical_providers: providers,
            total_medical_expenses: totalMedicalExpenses,
            lost_wages: parseFloat(lostWages) || 0,
            property_damage: parseFloat(propertyDamage) || 0,
            pain_suffering_amount: painSufferingAmount,
            total_demand_amount: totalDemandAmount,
            county: caseData.county || undefined,
          },
          authority_cluster_ids: selectedAuthorityIds.length > 0 ? selectedAuthorityIds : undefined,
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
        err instanceof Error
          ? err.message
          : 'Failed to generate demand letter'
      )
      throw err // Re-throw so StepRunner knows onBeforeReview failed
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
      insurance_carrier: insuranceCarrier || null,
      policy_number: policyNumber || null,
      claim_number: claimNumber || null,
      defendant_name: defendantName,
      defendant_address: defendantAddress,
      incident_date: incidentDate || null,
      incident_location: incidentLocation || null,
      incident_description: incidentDescription || null,
      injuries_description: injuriesDescription || null,
      injury_severity: injurySeverity || null,
      medical_providers: providers,
      total_medical_expenses: totalMedicalExpenses,
      lost_wages: parseFloat(lostWages) || null,
      property_damage: parseFloat(propertyDamage) || null,
      pain_suffering_amount: painSufferingAmount,
      total_demand_amount: totalDemandAmount,
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

  // -- Review content --

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
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex gap-6 items-start">
        <div className="flex-1 min-w-0">
          <StepRunner
            caseId={caseId}
            taskId={taskId}
            title="Draft Your Demand Letter"
            reassurance={isPropertyDamage
              ? "A demand letter formally notifies the at-fault party's insurance of your property damage claim and the compensation you are seeking."
              : "A demand letter is your first step in seeking fair compensation. It puts the insurance company on notice of your claim."
            }
            onConfirm={handleConfirm}
            onSave={handleSave}
            onBeforeReview={generateDraft}
            reviewContent={reviewContent}
            reviewButtonLabel="Generate Letter &rarr;"
            wrapperClassName=""
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

        {/* Context card from personalInjuryDetails */}
        {pid && (
          <div className="rounded-lg border border-warm-border bg-white p-4 space-y-1">
            <p className="text-xs font-medium text-warm-muted uppercase tracking-wide">
              Case Details
            </p>
            <p className="text-sm text-warm-text">
              {pid.pi_sub_type
                ? pid.pi_sub_type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
                : 'Personal Injury'}
              {pid.incident_date && ` — ${pid.incident_date}`}
            </p>
            {pid.incident_location && (
              <p className="text-xs text-warm-muted">
                Location: {pid.incident_location}
              </p>
            )}
            {pid.injury_severity && (
              <p className="text-xs text-warm-muted">
                Injury severity: {pid.injury_severity}
              </p>
            )}
          </div>
        )}

        {/* Section 1: Your Information */}
        <div>
          <h2 className="text-sm font-semibold text-warm-text mb-4">
            1. Your Information
          </h2>
          <div className="space-y-3">
            <div>
              <Label htmlFor="pidl-your-name">Full legal name *</Label>
              <Input
                id="pidl-your-name"
                value={yourName}
                onChange={(e) => setYourName(e.target.value)}
                placeholder="e.g. John Michael Doe"
              />
            </div>
            <div>
              <Label htmlFor="pidl-your-address">Mailing address *</Label>
              <Input
                id="pidl-your-address"
                value={yourAddress}
                onChange={(e) => setYourAddress(e.target.value)}
                placeholder="123 Main St, City, TX 75001"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Insurance Information */}
        <div>
          <h2 className="text-sm font-semibold text-warm-text mb-4">
            2. Insurance Information
          </h2>
          <div className="space-y-3">
            <div>
              <Label htmlFor="pidl-insurance-carrier">
                Insurance carrier *
              </Label>
              <Input
                id="pidl-insurance-carrier"
                value={insuranceCarrier}
                onChange={(e) => setInsuranceCarrier(e.target.value)}
                placeholder="e.g. State Farm, Allstate, GEICO"
              />
            </div>
            <div>
              <Label htmlFor="pidl-policy-number">Policy number</Label>
              <Input
                id="pidl-policy-number"
                value={policyNumber}
                onChange={(e) => setPolicyNumber(e.target.value)}
                placeholder="e.g. POL-123456789"
              />
            </div>
            <div>
              <Label htmlFor="pidl-claim-number">
                Claim number (optional)
              </Label>
              <Input
                id="pidl-claim-number"
                value={claimNumber}
                onChange={(e) => setClaimNumber(e.target.value)}
                placeholder="e.g. CLM-987654321"
              />
            </div>
          </div>
        </div>

        {/* Section 3: At-Fault Party */}
        <div>
          <h2 className="text-sm font-semibold text-warm-text mb-4">
            3. At-Fault Party
          </h2>
          <div className="space-y-3">
            <div>
              <Label htmlFor="pidl-defendant-name">
                At-fault party name *
              </Label>
              <Input
                id="pidl-defendant-name"
                value={defendantName}
                onChange={(e) => setDefendantName(e.target.value)}
                placeholder="e.g. Jane Smith"
              />
            </div>
            <div>
              <Label htmlFor="pidl-defendant-address">
                At-fault party address
              </Label>
              <Input
                id="pidl-defendant-address"
                value={defendantAddress}
                onChange={(e) => setDefendantAddress(e.target.value)}
                placeholder="456 Oak Ave, City, TX 75002"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Incident Details */}
        <div>
          <h2 className="text-sm font-semibold text-warm-text mb-4">
            4. Incident Details
          </h2>
          <div className="space-y-3">
            <div>
              <Label htmlFor="pidl-incident-date">Date of incident *</Label>
              <Input
                id="pidl-incident-date"
                type="date"
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="pidl-incident-location">
                Location of incident *
              </Label>
              <Input
                id="pidl-incident-location"
                value={incidentLocation}
                onChange={(e) => setIncidentLocation(e.target.value)}
                placeholder="e.g. I-35 and 51st Street, Austin, TX"
              />
            </div>
            <div>
              <Label htmlFor="pidl-incident-description">
                Description of incident *
              </Label>
              <textarea
                id="pidl-incident-description"
                value={incidentDescription}
                onChange={(e) => setIncidentDescription(e.target.value)}
                placeholder="Describe what happened in detail..."
                rows={4}
                className="flex min-h-[60px] w-full rounded-md border border-warm-border bg-transparent px-3 py-2 text-sm text-warm-text shadow-xs placeholder:text-warm-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Injuries / Damage Details */}
        {isPropertyDamage ? (
          <div>
            <h2 className="text-sm font-semibold text-warm-text mb-4">
              5. Damage Details
            </h2>
            <div className="space-y-3">
              <div>
                <Label htmlFor="pidl-damage-description">
                  Description of property damage *
                </Label>
                <textarea
                  id="pidl-damage-description"
                  value={injuriesDescription}
                  onChange={(e) => setInjuriesDescription(e.target.value)}
                  placeholder="Describe all property damage in detail..."
                  rows={4}
                  className="flex min-h-[60px] w-full rounded-md border border-warm-border bg-transparent px-3 py-2 text-sm text-warm-text shadow-xs placeholder:text-warm-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo"
                />
              </div>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-sm font-semibold text-warm-text mb-4">
              5. Injuries
            </h2>
            <div className="space-y-3">
              <div>
                <Label htmlFor="pidl-injuries-description">
                  Description of injuries *
                </Label>
                <textarea
                  id="pidl-injuries-description"
                  value={injuriesDescription}
                  onChange={(e) => setInjuriesDescription(e.target.value)}
                  placeholder="Describe all injuries sustained..."
                  rows={4}
                  className="flex min-h-[60px] w-full rounded-md border border-warm-border bg-transparent px-3 py-2 text-sm text-warm-text shadow-xs placeholder:text-warm-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo"
                />
              </div>
              <div>
                <Label>Injury severity *</Label>
                <div className="space-y-2 mt-1">
                  {(['minor', 'moderate', 'severe'] as const).map((level) => (
                    <label
                      key={level}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="pidl-injury-severity"
                        value={level}
                        checked={injurySeverity === level}
                        onChange={() => setInjurySeverity(level)}
                        className="h-4 w-4 border-warm-border text-calm-indigo focus:ring-calm-indigo"
                      />
                      <span className="text-sm text-warm-text capitalize">
                        {level}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section 6: Medical Providers / Repair Vendors */}
        <div>
          <h2 className="text-sm font-semibold text-warm-text mb-4">
            {isPropertyDamage ? '6. Repair Vendors & Contractors' : '6. Medical Providers'}
          </h2>
          <div className="space-y-4">
            {providers.map((provider, index) => (
              <div
                key={index}
                className="rounded-lg border border-warm-border p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-warm-muted">
                    Provider {index + 1}
                  </p>
                  {providers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeProvider(index)}
                      className="text-xs text-warm-muted hover:text-warm-text transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor={`pidl-provider-name-${index}`}>
                      {isPropertyDamage ? 'Vendor / contractor name' : 'Provider name'}
                    </Label>
                    <Input
                      id={`pidl-provider-name-${index}`}
                      value={provider.name}
                      onChange={(e) =>
                        updateProvider(index, 'name', e.target.value)
                      }
                      placeholder="e.g. Dr. Smith"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`pidl-provider-type-${index}`}>
                      {isPropertyDamage ? 'Type of work' : 'Type of treatment'}
                    </Label>
                    <Input
                      id={`pidl-provider-type-${index}`}
                      value={provider.type}
                      onChange={(e) =>
                        updateProvider(index, 'type', e.target.value)
                      }
                      placeholder={isPropertyDamage ? 'e.g. Body shop, Roofer, Electrician' : 'e.g. ER, Orthopedic, PT'}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`pidl-provider-dates-${index}`}>
                      {isPropertyDamage ? 'Date of estimate / service' : 'Dates of treatment'}
                    </Label>
                    <Input
                      id={`pidl-provider-dates-${index}`}
                      value={provider.dates}
                      onChange={(e) =>
                        updateProvider(index, 'dates', e.target.value)
                      }
                      placeholder="e.g. Jan 2024 - Mar 2024"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`pidl-provider-amount-${index}`}>
                      Amount ($)
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-warm-muted">
                        $
                      </span>
                      <Input
                        id={`pidl-provider-amount-${index}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={provider.amount}
                        onChange={(e) =>
                          updateProvider(index, 'amount', e.target.value)
                        }
                        placeholder="0.00"
                        className="pl-7"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addProvider}
              className="text-sm text-calm-indigo hover:text-calm-indigo/80 font-medium transition-colors"
            >
              {isPropertyDamage ? '+ Add another vendor' : '+ Add another provider'}
            </button>
          </div>
        </div>

        {/* Section 7: Damages */}
        <div>
          <h2 className="text-sm font-semibold text-warm-text mb-4">
            7. Damages Summary
          </h2>
          <div className="space-y-4">
            {/* Total medical expenses (auto-summed) */}
            <div className="rounded-lg border border-warm-border bg-warm-bg/50 p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-warm-text">
                  {isPropertyDamage ? 'Total repair / replacement costs' : 'Total medical expenses'}
                </p>
                <p className="text-sm font-medium text-warm-text">
                  {formatCurrency(totalMedicalExpenses)}
                </p>
              </div>
              <p className="text-xs text-warm-muted mt-0.5">
                {isPropertyDamage ? 'Auto-calculated from vendors above' : 'Auto-calculated from medical providers above'}
              </p>
            </div>

            {/* Lost wages */}
            <div>
              <Label htmlFor="pidl-lost-wages">
                {isPropertyDamage ? 'Loss of use costs (rental car, temporary housing, etc.)' : 'Lost wages'}
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-warm-muted">
                  $
                </span>
                <Input
                  id="pidl-lost-wages"
                  type="number"
                  min="0"
                  step="0.01"
                  value={lostWages}
                  onChange={(e) => setLostWages(e.target.value)}
                  placeholder="0.00"
                  className="pl-7"
                />
              </div>
            </div>

            {/* Property damage */}
            <div>
              <Label htmlFor="pidl-property-damage">Property damage</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-warm-muted">
                  $
                </span>
                <Input
                  id="pidl-property-damage"
                  type="number"
                  min="0"
                  step="0.01"
                  value={propertyDamage}
                  onChange={(e) => setPropertyDamage(e.target.value)}
                  placeholder="0.00"
                  className="pl-7"
                />
              </div>
            </div>

            {/* Pain & suffering (hidden for property damage) */}
            {!isPropertyDamage && (
              <div className="rounded-lg border border-warm-border bg-warm-bg/50 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-warm-text">
                    Pain &amp; suffering
                  </p>
                  <p className="text-sm font-medium text-warm-text">
                    {formatCurrency(painSufferingAmount)}
                  </p>
                </div>
                <p className="text-xs text-warm-muted mt-0.5">
                  Pain &amp; suffering = {multiplier}x &times;{' '}
                  {formatCurrency(totalMedicalExpenses)} ={' '}
                  {formatCurrency(painSufferingAmount)}
                </p>
              </div>
            )}

            {/* Total demand */}
            <div className="rounded-lg border border-calm-indigo/30 bg-calm-indigo/5 p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-warm-text">
                  Total demand amount
                </p>
                <p className="text-sm font-bold text-warm-text">
                  {formatCurrency(totalDemandAmount)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Info callout */}
        <div className="rounded-md border border-calm-indigo/30 bg-calm-indigo/5 px-3 py-2">
          <p className="text-xs font-medium text-warm-text">
            What is a demand letter?
          </p>
          <p className="text-xs text-warm-muted mt-0.5">
            {isPropertyDamage
              ? "A demand letter formally notifies the at-fault party's insurance company of your property damage claim. It details the incident, the damage to your property, and the compensation you are seeking. This is typically the first step before filing a lawsuit."
              : "A demand letter formally notifies the at-fault party\u2019s insurance company of your claim. It details the incident, your injuries, and the compensation you are seeking. This is typically the first step before filing a lawsuit."}
          </p>
        </div>
      </div>
          </StepRunner>
        </div>
        <div className="hidden lg:block w-72 shrink-0 sticky top-8">
          <StepAuthoritySidebar
            caseId={caseId}
            mode="select"
            selectedClusterIds={selectedAuthorityIds}
            onSelectionChange={setSelectedAuthorityIds}
          />
        </div>
      </div>
      <div className="lg:hidden mt-6">
        <StepAuthoritySidebar
          caseId={caseId}
          mode="select"
          selectedClusterIds={selectedAuthorityIds}
          onSelectionChange={setSelectedAuthorityIds}
        />
      </div>
    </div>
  )
}
