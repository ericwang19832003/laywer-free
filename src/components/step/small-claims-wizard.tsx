'use client'

import { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { WizardShell } from '@/components/ui/wizard-shell'
import type { WizardStep } from '@/components/ui/wizard-shell'
import {
  AnnotatedDraftViewer,
  type DraftAnnotation,
} from '@/components/step/filing/annotated-draft-viewer'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

// Import all small claims wizard steps
import { SmallClaimsPreflight } from './small-claims-wizard-steps/small-claims-preflight'
import { SmallClaimsWelcomeStep } from './small-claims-wizard-steps/small-claims-welcome-step'
import { SmallClaimsStepPreview } from './small-claims-wizard-steps/small-claims-step-preview'
import { SmallClaimsPartiesStep } from './small-claims-wizard-steps/small-claims-parties-step'
import { ClaimDetailsStep } from './small-claims-wizard-steps/claim-details-step'
import { DamagesCalculatorStep } from './small-claims-wizard-steps/damages-calculator-step'
import { TimelineStep } from './small-claims-wizard-steps/timeline-step'
import { DemandLetterInfoStep } from './small-claims-wizard-steps/demand-letter-info-step'
import { SmallClaimsVenueStep } from './small-claims-wizard-steps/small-claims-venue-step'
import { SmallClaimsReviewStep } from './small-claims-wizard-steps/small-claims-review-step'

import { calculateDamages, type DamageItem } from '@/lib/small-claims/damages-calculator'
import { FilingMethodStep } from '@/components/step/filing-method-step'
import { FILING_CONFIGS } from '@/lib/filing-configs'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface PartyInfo {
  full_name: string
  address?: string
  city?: string
  state?: string
  zip?: string
}

interface SmallClaimsWizardProps {
  caseId: string
  taskId: string
  existingMetadata?: Record<string, unknown>
  claimDetails: {
    claim_sub_type: string
    claim_amount: number | null
    damages_breakdown: unknown[]
    incident_date: string | null
    defendant_is_business: boolean
    demand_letter_sent: boolean
  } | null
  caseData: { county: string | null }
}

/* ------------------------------------------------------------------ */
/*  Dynamic step generation based on claim sub-type                    */
/* ------------------------------------------------------------------ */

function getStepsForSubType(subType: string): WizardStep[] {
  const welcome: WizardStep = {
    id: 'welcome',
    title: 'Welcome',
    subtitle: 'Here is what to expect in this process.',
  }
  const preview: WizardStep = {
    id: 'preview',
    title: 'Step Preview',
    subtitle: 'A quick overview before we begin.',
  }
  const preflight: WizardStep = {
    id: 'preflight',
    title: 'Before You Start',
    subtitle: "Let's make sure you have what you need.",
  }
  const parties: WizardStep = {
    id: 'parties',
    title: 'Who Is Involved?',
    subtitle: 'Tell us about yourself and the other party.',
  }
  const claimDetails: WizardStep = {
    id: 'claim_details',
    title: 'Claim Details',
    subtitle: 'Tell us the specifics of your claim.',
  }
  const damages: WizardStep = {
    id: 'damages',
    title: 'Damages',
    subtitle: 'How much are you owed?',
  }
  const timeline: WizardStep = {
    id: 'timeline',
    title: 'Timeline',
    subtitle: 'Key events in your case.',
  }
  const demandInfo: WizardStep = {
    id: 'demand_info',
    title: 'Demand Letter',
    subtitle: 'Have you asked for payment?',
  }
  const venue: WizardStep = {
    id: 'venue',
    title: 'Where to File',
    subtitle: "We'll help you pick the right court.",
  }
  const howToFile: WizardStep = {
    id: 'how_to_file',
    title: 'How to File',
    subtitle: 'Choose how you want to submit your petition.',
  }
  const review: WizardStep = {
    id: 'review',
    title: 'Review Everything',
    subtitle: 'Check your information before generating your document.',
  }

  switch (subType) {
    case 'security_deposit':
      return [welcome, preview, preflight, parties, claimDetails, damages, timeline, demandInfo, venue, howToFile, review]
    case 'breach_of_contract':
      return [welcome, preview, preflight, parties, claimDetails, damages, timeline, demandInfo, venue, howToFile, review]
    case 'consumer_refund':
      return [welcome, preview, preflight, parties, claimDetails, damages, demandInfo, venue, howToFile, review]
    case 'property_damage':
      return [welcome, preview, preflight, parties, claimDetails, damages, demandInfo, venue, howToFile, review]
    case 'car_accident':
      return [welcome, preview, preflight, parties, claimDetails, damages, timeline, demandInfo, venue, howToFile, review]
    case 'neighbor_dispute':
      return [welcome, preview, preflight, parties, claimDetails, damages, demandInfo, venue, howToFile, review]
    case 'unpaid_loan':
      return [welcome, preview, preflight, parties, claimDetails, damages, timeline, demandInfo, venue, howToFile, review]
    case 'other':
    default:
      return [welcome, preview, preflight, parties, claimDetails, damages, demandInfo, venue, howToFile, review]
  }
}

/* ------------------------------------------------------------------ */
/*  Document title per sub-type                                        */
/* ------------------------------------------------------------------ */

function getDocumentTitle(subType: string): string {
  switch (subType) {
    case 'security_deposit':
      return 'Small Claims Petition \u2014 Security Deposit'
    case 'breach_of_contract':
      return 'Small Claims Petition \u2014 Breach of Contract'
    case 'consumer_refund':
      return 'Small Claims Petition \u2014 Consumer Refund'
    case 'property_damage':
      return 'Small Claims Petition \u2014 Property Damage'
    case 'car_accident':
      return 'Small Claims Petition \u2014 Car Accident'
    case 'neighbor_dispute':
      return 'Small Claims Petition \u2014 Neighbor Dispute'
    case 'unpaid_loan':
      return 'Small Claims Petition \u2014 Unpaid Loan'
    case 'other':
      return 'Small Claims Petition'
    default:
      return 'Small Claims Petition'
  }
}

function getDraftTitle(subType: string): string {
  switch (subType) {
    case 'security_deposit':
      return 'Your Security Deposit Petition Draft'
    case 'breach_of_contract':
      return 'Your Breach of Contract Petition Draft'
    case 'consumer_refund':
      return 'Your Consumer Refund Petition Draft'
    case 'property_damage':
      return 'Your Property Damage Petition Draft'
    case 'car_accident':
      return 'Your Car Accident Petition Draft'
    case 'neighbor_dispute':
      return 'Your Neighbor Dispute Petition Draft'
    case 'unpaid_loan':
      return 'Your Unpaid Loan Petition Draft'
    case 'other':
      return 'Your Small Claims Petition Draft'
    default:
      return 'Your Small Claims Petition Draft'
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function SmallClaimsWizard({
  caseId,
  taskId,
  existingMetadata,
  claimDetails: claimDetailsProp,
  caseData,
}: SmallClaimsWizardProps) {
  const router = useRouter()
  const meta = (existingMetadata ?? {}) as Record<string, unknown>
  const claimSubType = claimDetailsProp?.claim_sub_type ?? 'other'

  const steps = useMemo(() => getStepsForSubType(claimSubType), [claimSubType])
  const totalEstimateMinutes = 20

  /* ---- Party info ---- */
  const [plaintiff, setPlaintiff] = useState<PartyInfo>(
    (meta.plaintiff as PartyInfo) ?? { full_name: '' }
  )
  const [defendant, setDefendant] = useState<PartyInfo>(
    (meta.defendant as PartyInfo) ?? { full_name: '' }
  )
  const [defendantIsBusiness, setDefendantIsBusiness] = useState<boolean>(
    (meta.defendant_is_business as boolean) ?? claimDetailsProp?.defendant_is_business ?? false
  )
  const [defendantBusinessName, setDefendantBusinessName] = useState<string>(
    (meta.defendant_business_name as string) ?? ''
  )

  /* ---- Claim details (sub-type-specific form fields) ---- */
  const [claimDetails, setClaimDetails] = useState<Record<string, string | boolean>>(
    (meta.claim_details as Record<string, string | boolean>) ?? {}
  )

  /* ---- Damages ---- */
  const [damageItems, setDamageItems] = useState<DamageItem[]>(
    (meta.damage_items as DamageItem[]) ?? []
  )

  /* ---- Timeline ---- */
  const [timelineEvents, setTimelineEvents] = useState<{ date: string; description: string }[]>(
    (meta.timeline_events as { date: string; description: string }[]) ?? []
  )

  /* ---- Demand letter info ---- */
  const [demandLetterSent, setDemandLetterSent] = useState<boolean>(
    (meta.demand_letter_sent as boolean) ?? claimDetailsProp?.demand_letter_sent ?? false
  )
  const [demandLetterDate, setDemandLetterDate] = useState<string>(
    (meta.demand_letter_date as string) ?? ''
  )
  const [deadlineDays, setDeadlineDays] = useState<string>(
    (meta.deadline_days as string) ?? '14'
  )
  const [preferredResolution, setPreferredResolution] = useState<string>(
    (meta.preferred_resolution as string) ?? ''
  )

  /* ---- Venue ---- */
  const [defendantCounty, setDefendantCounty] = useState<string>(
    (meta.defendant_county as string) ?? caseData.county ?? ''
  )
  const [incidentCounty, setIncidentCounty] = useState<string>(
    (meta.incident_county as string) ?? ''
  )
  const [precinct, setPrecinct] = useState<string>(
    (meta.precinct as string) ?? ''
  )

  /* ---- Wizard / draft state ---- */
  const [currentStep, setCurrentStep] = useState(
    typeof meta._wizard_step === 'number' ? meta._wizard_step : 0
  )
  const [draft, setDraft] = useState<string>((meta.draft_text as string) ?? '')
  const [annotations, setAnnotations] = useState<DraftAnnotation[]>(
    (meta.annotations as DraftAnnotation[]) ?? []
  )
  const [acknowledged, setAcknowledged] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState<string | null>(null)
  const [draftPhase, setDraftPhase] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [filingMethod, setFilingMethod] = useState<'online' | 'in_person' | ''>(
    (meta.filing_method as 'online' | 'in_person' | '') ?? ''
  )

  /* ---- Demand letter field change handler ---- */

  const handleDemandFieldChange = useCallback(
    (field: string, value: string | boolean) => {
      switch (field) {
        case 'demandLetterSent':
          setDemandLetterSent(value as boolean)
          break
        case 'demandLetterDate':
          setDemandLetterDate(value as string)
          break
        case 'deadlineDays':
          setDeadlineDays(value as string)
          break
        case 'preferredResolution':
          setPreferredResolution(value as string)
          break
      }
    },
    []
  )

  /* ---- Venue field change handler ---- */

  const handleVenueFieldChange = useCallback(
    (field: string, value: string) => {
      switch (field) {
        case 'defendantCounty':
          setDefendantCounty(value)
          break
        case 'incidentCounty':
          setIncidentCounty(value)
          break
        case 'precinct':
          setPrecinct(value)
          break
      }
    },
    []
  )

  /* ---- Claim details field change handler ---- */

  const handleClaimDetailFieldChange = useCallback(
    (field: string, value: string | boolean) => {
      setClaimDetails((prev) => ({ ...prev, [field]: value }))
    },
    []
  )

  /* ---- Computed total damages ---- */

  const totalDamages = useMemo(() => {
    const result = calculateDamages({ items: damageItems })
    return result.totalDamages
  }, [damageItems])

  const validItems = useMemo(() => {
    const result = calculateDamages({ items: damageItems })
    return result.items
  }, [damageItems])

  /* ---- Build helpers ---- */

  const buildFacts = useCallback(() => {
    // Derive incident_date and description from claimDetails based on sub-type
    let incidentDate = ''
    let description = ''

    switch (claimSubType) {
      case 'security_deposit':
        incidentDate = (claimDetails.moveOutDate as string) || ''
        description = (claimDetails.deductions as string) || ''
        break
      case 'breach_of_contract':
        incidentDate = (claimDetails.breachDate as string) || ''
        description = (claimDetails.whatHappened as string) || ''
        break
      case 'consumer_refund':
        incidentDate = (claimDetails.purchaseDate as string) || ''
        description = (claimDetails.whatWentWrong as string) || ''
        break
      case 'property_damage':
        incidentDate = (claimDetails.damageDate as string) || ''
        description = (claimDetails.howDamaged as string) || ''
        break
      case 'car_accident':
        incidentDate = (claimDetails.accidentDate as string) || ''
        description = (claimDetails.accidentDescription as string) || ''
        break
      case 'neighbor_dispute':
        incidentDate = ''
        description = (claimDetails.disputeNature as string) || ''
        break
      case 'unpaid_loan':
        incidentDate = (claimDetails.loanDate as string) || ''
        description = (claimDetails.loanTerms as string) || ''
        break
      default:
        incidentDate = (claimDetails.incidentDate as string) || ''
        description = (claimDetails.claimDescription as string) || ''
        break
    }

    // Build sub-type-specific optional fields
    const subTypeFields: Record<string, unknown> = {}
    switch (claimSubType) {
      case 'security_deposit':
        if (claimDetails.leaseStartDate && claimDetails.leaseEndDate) {
          subTypeFields.lease_dates = `${claimDetails.leaseStartDate} to ${claimDetails.leaseEndDate}`
        }
        if (claimDetails.depositAmount) {
          subTypeFields.deposit_amount = parseFloat(claimDetails.depositAmount as string) || undefined
        }
        break
      case 'breach_of_contract':
        if (claimDetails.contractDate) {
          subTypeFields.contract_date = claimDetails.contractDate
        }
        break
      case 'unpaid_loan':
        if (claimDetails.loanAmount) {
          subTypeFields.loan_amount = parseFloat(claimDetails.loanAmount as string) || undefined
        }
        if (claimDetails.loanDate) {
          subTypeFields.loan_date = claimDetails.loanDate
        }
        break
      case 'car_accident':
        if (claimDetails.accidentDate) {
          subTypeFields.accident_date = claimDetails.accidentDate
        }
        break
    }

    return {
      plaintiff,
      defendant,
      court_type: 'jp' as const,
      county: defendantCounty || caseData.county || '',
      precinct: precinct || undefined,
      claim_sub_type: claimSubType,
      claim_amount: totalDamages,
      damages_breakdown: validItems,
      incident_date: incidentDate || claimDetailsProp?.incident_date || '',
      description,
      demand_letter_sent: demandLetterSent,
      demand_letter_date: demandLetterDate || undefined,
      defendant_is_business: defendantIsBusiness,
      ...subTypeFields,
    }
  }, [
    plaintiff,
    defendant,
    defendantCounty,
    caseData.county,
    precinct,
    claimSubType,
    totalDamages,
    validItems,
    claimDetails,
    claimDetailsProp?.incident_date,
    demandLetterSent,
    demandLetterDate,
    defendantIsBusiness,
  ])

  const buildMetadata = useCallback(() => {
    return {
      // Parties
      plaintiff,
      defendant,
      defendant_is_business: defendantIsBusiness,
      defendant_business_name: defendantBusinessName,
      // Claim details
      claim_details: claimDetails,
      // Damages
      damage_items: damageItems,
      // Timeline
      timeline_events: timelineEvents,
      // Demand letter
      demand_letter_sent: demandLetterSent,
      demand_letter_date: demandLetterDate || null,
      deadline_days: deadlineDays,
      preferred_resolution: preferredResolution || null,
      // Venue
      defendant_county: defendantCounty || null,
      incident_county: incidentCounty || null,
      precinct: precinct || null,
      // Draft
      draft_text: draft || null,
      final_text: draft || null,
      annotations,
      // Filing method
      filing_method: filingMethod || null,
      // Wizard position
      _wizard_step: currentStep,
    }
  }, [
    plaintiff,
    defendant,
    defendantIsBusiness,
    defendantBusinessName,
    claimDetails,
    damageItems,
    timelineEvents,
    demandLetterSent,
    demandLetterDate,
    deadlineDays,
    preferredResolution,
    defendantCounty,
    incidentCounty,
    precinct,
    draft,
    annotations,
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
          document_type: `small_claims_${claimSubType}`,
          facts: buildFacts(),
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to generate document')
      }
      const data = await res.json()
      setDraft(data.draft)
      setAnnotations(data.annotations ?? [])
      setDraftPhase(true)
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'Failed to generate document')
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
  }, [buildMetadata, buildFacts]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleFinalConfirm = useCallback(async () => {
    setConfirming(true)
    try {
      const metadata = buildMetadata()
      await patchTask('in_progress', metadata)
      await patchTask('completed')
      router.push(`/case/${caseId}`)
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'Failed to complete task')
    } finally {
      setConfirming(false)
    }
  }, [buildMetadata, caseId, router]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ---- canAdvance per step ---- */

  const canAdvance = useMemo(() => {
    const stepId = steps[currentStep]?.id
    switch (stepId) {
      case 'preflight':
        return true
      case 'parties':
        return (
          plaintiff.full_name.trim() !== '' &&
          defendant.full_name.trim() !== ''
        )
      case 'claim_details':
        return Object.values(claimDetails).some(
          (v) => (typeof v === 'string' && v.trim() !== '') || typeof v === 'boolean'
        )
      case 'damages':
        return damageItems.some((item) => item.amount > 0)
      case 'timeline':
        return true
      case 'demand_info':
        return true
      case 'venue':
        return true
      case 'how_to_file':
        return filingMethod !== ''
      case 'review':
        return true
      default:
        return true
    }
  }, [
    currentStep,
    steps,
    plaintiff,
    defendant,
    claimDetails,
    damageItems,
    filingMethod,
  ])

  /* ---- Review step onEdit ---- */

  const handleReviewEdit = useCallback(
    (stepId: string) => {
      // Map review section stepIds to wizard step ids
      const mappedId =
        stepId === 'claim-details'
          ? 'claim_details'
          : stepId === 'demand-letter'
            ? 'demand_info'
            : stepId
      const idx = steps.findIndex((s) => s.id === mappedId)
      if (idx >= 0) setCurrentStep(idx)
    },
    [steps]
  )

  /* ---- Step rendering ---- */

  function renderStep() {
    const stepId = steps[currentStep]?.id
    switch (stepId) {
      case 'welcome':
        return (
          <SmallClaimsWelcomeStep
            onContinue={() => setCurrentStep(currentStep + 1)}
          />
        )
      case 'preview':
        return (
          <SmallClaimsStepPreview
            steps={steps.filter((step) => !['welcome', 'preview'].includes(step.id))}
            totalMinutes={totalEstimateMinutes}
            onContinue={() => setCurrentStep(currentStep + 1)}
          />
        )
      case 'preflight':
        return (
          <SmallClaimsPreflight
            claimSubType={claimSubType}
            onReady={() => setCurrentStep(currentStep + 1)}
          />
        )
      case 'parties':
        return (
          <SmallClaimsPartiesStep
            plaintiff={plaintiff}
            defendant={defendant}
            defendantIsBusiness={defendantIsBusiness}
            defendantBusinessName={defendantBusinessName}
            onPlaintiffChange={setPlaintiff}
            onDefendantChange={setDefendant}
            onDefendantIsBusinessChange={setDefendantIsBusiness}
            onDefendantBusinessNameChange={setDefendantBusinessName}
          />
        )
      case 'claim_details':
        return (
          <ClaimDetailsStep
            claimSubType={claimSubType}
            formValues={claimDetails}
            onFieldChange={handleClaimDetailFieldChange}
          />
        )
      case 'damages':
        return (
          <DamagesCalculatorStep
            items={damageItems}
            onItemsChange={setDamageItems}
            claimSubType={claimSubType}
          />
        )
      case 'timeline':
        return (
          <TimelineStep
            events={timelineEvents}
            onEventsChange={setTimelineEvents}
          />
        )
      case 'demand_info':
        return (
          <DemandLetterInfoStep
            demandLetterSent={demandLetterSent}
            demandLetterDate={demandLetterDate}
            deadlineDays={deadlineDays}
            preferredResolution={preferredResolution}
            onFieldChange={handleDemandFieldChange}
          />
        )
      case 'venue':
        return (
          <SmallClaimsVenueStep
            defendantCounty={defendantCounty}
            incidentCounty={incidentCounty}
            precinct={precinct}
            onFieldChange={handleVenueFieldChange}
          />
        )
      case 'how_to_file':
        return (
          <FilingMethodStep
            filingMethod={filingMethod}
            onFilingMethodChange={setFilingMethod}
            county={defendantCounty || caseData.county || ''}
            courtType="jp"
            config={FILING_CONFIGS.small_claims}
          />
        )
      case 'review':
        return (
          <SmallClaimsReviewStep
            claimSubType={claimSubType}
            plaintiff={plaintiff}
            defendant={defendant}
            defendantIsBusiness={defendantIsBusiness}
            defendantBusinessName={defendantBusinessName}
            claimDetails={claimDetails}
            damageItems={damageItems}
            totalDamages={totalDamages}
            timelineEvents={timelineEvents}
            demandLetterSent={demandLetterSent}
            demandLetterDate={demandLetterDate}
            deadlineDays={deadlineDays}
            preferredResolution={preferredResolution}
            defendantCounty={defendantCounty}
            incidentCounty={incidentCounty}
            precinct={precinct}
            onEdit={handleReviewEdit}
          />
        )
      default:
        return null
    }
  }

  /* ---- Draft phase layout ---- */

  if (draftPhase) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link
          href={`/case/${caseId}`}
          className="inline-flex items-center gap-1 text-sm text-warm-muted hover:text-warm-text mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        <h1 className="text-2xl font-semibold text-warm-text">
          {getDraftTitle(claimSubType)}
        </h1>
        <p className="text-sm text-warm-muted mt-1 mb-6">
          Review your draft below. You can edit it directly, regenerate it, or download a PDF.
        </p>

        {genError && (
          <div className="rounded-lg border border-calm-amber bg-calm-amber/5 p-3 mb-4">
            <p className="text-sm text-warm-text">{genError}</p>
          </div>
        )}

        {draft ? (
          <>
            <AnnotatedDraftViewer
              draft={draft}
              annotations={annotations}
              onDraftChange={setDraft}
              onRegenerate={async () => {
                setDraftPhase(false)
                await generateDraft()
              }}
              regenerating={generating}
              acknowledged={acknowledged}
              onAcknowledgeChange={setAcknowledged}
              documentTitle={getDocumentTitle(claimSubType)}
            />

            {acknowledged && (
              <div className="mt-6">
                <Button
                  onClick={handleFinalConfirm}
                  disabled={confirming}
                  className="w-full"
                  size="lg"
                >
                  {confirming ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Confirm & Submit'
                  )}
                </Button>
                <p className="text-xs text-warm-muted text-center mt-2">
                  This saves your document and marks this step as complete.
                </p>
              </div>
            )}

            <div className="mt-4">
              <button
                type="button"
                onClick={() => setDraftPhase(false)}
                className="text-sm text-warm-muted hover:text-warm-text transition-colors"
              >
                Go back and edit my information
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3 py-12 justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-warm-muted" />
            <p className="text-sm text-warm-muted">Generating your draft...</p>
          </div>
        )}
      </div>
    )
  }

  /* ---- Wizard phase layout ---- */

  return (
    <WizardShell
      caseId={caseId}
      title={`Prepare Your ${getDocumentTitle(claimSubType)}`}
      steps={steps}
      currentStep={currentStep}
      onStepChange={setCurrentStep}
      onSave={handleSave}
      onComplete={handleComplete}
      canAdvance={canAdvance}
      totalEstimateMinutes={totalEstimateMinutes}
      completeButtonLabel={generating ? 'Generating...' : 'Generate My Document'}
    >
      {generating ? (
        <div className="flex items-center gap-3 py-12 justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-warm-muted" />
          <p className="text-sm text-warm-muted">
            Generating your {getDocumentTitle(claimSubType).toLowerCase()}... This may take a moment.
          </p>
        </div>
      ) : (
        renderStep()
      )}
    </WizardShell>
  )
}
