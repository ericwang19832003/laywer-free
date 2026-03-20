'use client'

import { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { WizardShell } from '@/components/ui/wizard-shell'
import type { WizardStep } from '@/components/ui/wizard-shell'
import { PreflightChecklist } from '@/components/step/filing/preflight-checklist'
import { PartiesStep } from '@/components/step/wizard-steps/parties-step'
import { VenueStep } from '@/components/step/wizard-steps/venue-step'
import { FactsStep } from '@/components/step/wizard-steps/facts-step'
import { ClaimsStep } from '@/components/step/wizard-steps/claims-step'
import { ReliefStep } from '@/components/step/wizard-steps/relief-step'
import { ReviewStep } from '@/components/step/wizard-steps/review-step'
import { DraftViewer } from '@/components/step/filing/draft-viewer'
import { Button } from '@/components/ui/button'
import { validateJurisdiction } from '@/lib/rules/venue-helper'
import { ChevronLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import type { FilingFacts } from '@/lib/schemas/filing'
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

interface PetitionWizardProps {
  caseId: string
  taskId: string
  existingMetadata?: Record<string, unknown>
  caseData: {
    role: string
    court_type: string
    county: string | null
    dispute_type: string | null
    government_entity?: boolean
    state?: string
  }
}

/* ------------------------------------------------------------------ */
/*  Steps definition                                                   */
/* ------------------------------------------------------------------ */

const WIZARD_STEPS: WizardStep[] = [
  {
    id: 'preflight',
    title: 'Before You Start',
    subtitle: "Let's make sure you have what you need.",
  },
  {
    id: 'parties',
    title: 'Who Is Involved?',
    subtitle: 'Tell us about yourself and who you are suing.',
  },
  {
    id: 'venue',
    title: 'Where Should You File?',
    subtitle: "We'll help you pick the right court location.",
  },
  {
    id: 'facts',
    title: 'What Happened?',
    subtitle: 'Tell your story in your own words.',
  },
  {
    id: 'claims',
    title: 'Why Is This Wrong?',
    subtitle: "Let's identify the legal basis for your case.",
  },
  {
    id: 'relief',
    title: 'What Do You Want the Court to Do?',
    subtitle: 'Tell us how you want this resolved.',
  },
  {
    id: 'how_to_file',
    title: 'How to File',
    subtitle: 'Choose how you want to submit your petition.',
  },
  {
    id: 'review',
    title: 'Review Everything',
    subtitle: 'Check your information before generating your petition.',
  },
]

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function PetitionWizard({
  caseId,
  taskId,
  existingMetadata,
  caseData,
}: PetitionWizardProps) {
  const router = useRouter()
  const meta = existingMetadata ?? {}
  const isDefendant = caseData.role === 'defendant'

  /* ---- Form state ---- */
  const [yourInfo, setYourInfo] = useState<PartyInfo>(
    (meta.your_info as PartyInfo) ?? { full_name: '' }
  )
  const [opposingParties, setOpposingParties] = useState<PartyInfo[]>(
    (meta.opposing_parties as PartyInfo[]) ?? [{ full_name: '' }]
  )

  const [description, setDescription] = useState((meta.description as string) ?? '')
  const [incidentDate, setIncidentDate] = useState((meta.incident_date as string) ?? '')
  const [incidentLocation, setIncidentLocation] = useState(
    (meta.incident_location as string) ?? ''
  )

  const [claimDetails, setClaimDetails] = useState((meta.claim_details as string) ?? '')

  const [amountSought, setAmountSought] = useState((meta.amount_sought as string) ?? '')
  const [otherRelief, setOtherRelief] = useState((meta.other_relief as string) ?? '')
  const [requestAttorneyFees, setRequestAttorneyFees] = useState(
    (meta.request_attorney_fees as boolean) ?? false
  )
  const [requestCourtCosts, setRequestCourtCosts] = useState(
    (meta.request_court_costs as boolean) ?? true
  )

  // Venue-related county inputs
  const [defendantCounty, setDefendantCounty] = useState(
    (meta.defendant_county as string) ?? ''
  )
  const [incidentCounty, setIncidentCounty] = useState(
    (meta.incident_county as string) ?? ''
  )
  const [propertyCounty, setPropertyCounty] = useState(
    (meta.property_county as string) ?? ''
  )
  const [contractCounty, setContractCounty] = useState(
    (meta.contract_county as string) ?? ''
  )

  /* ---- Wizard state ---- */
  const [currentStep, setCurrentStep] = useState(
    typeof meta._wizard_step === 'number' ? meta._wizard_step : 0
  )

  /* ---- Draft state ---- */
  const [draft, setDraft] = useState((meta.draft_text as string) ?? '')
  const [acknowledged, setAcknowledged] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState<string | null>(null)
  const [draftPhase, setDraftPhase] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [filingMethod, setFilingMethod] = useState<'online' | 'in_person' | ''>(
    (meta.filing_method as 'online' | 'in_person' | '') ?? ''
  )

  /* ---- Jurisdiction check ---- */
  const jurisdictionCheck = useMemo(() => {
    const amount = amountSought ? parseFloat(amountSought) : 0
    if (amount === 0) return null
    const check = validateJurisdiction({ courtType: caseData.court_type, amountSought: amount })
    return check.valid ? null : check.warning ?? null
  }, [amountSought, caseData.court_type])

  /* ---- Build helpers ---- */

  const buildFacts = useCallback((): FilingFacts => {
    return {
      your_info: yourInfo,
      opposing_parties: opposingParties,
      court_type: caseData.court_type,
      county: caseData.county ?? undefined,
      description,
      incident_date: incidentDate || undefined,
      incident_location: incidentLocation || undefined,
      claim_details: claimDetails || undefined,
      amount_sought: amountSought ? parseFloat(amountSought) : undefined,
      other_relief: otherRelief || undefined,
      request_attorney_fees: requestAttorneyFees,
      request_court_costs: requestCourtCosts,
      role: caseData.role as 'plaintiff' | 'defendant',
      dispute_type: caseData.dispute_type ?? undefined,
      government_entity: caseData.government_entity ?? false,
    }
  }, [
    yourInfo, opposingParties, caseData, description, incidentDate,
    incidentLocation, claimDetails, amountSought, otherRelief,
    requestAttorneyFees, requestCourtCosts,
  ])

  const buildMetadata = useCallback(() => {
    return {
      your_info: yourInfo,
      opposing_parties: opposingParties,
      description,
      incident_date: incidentDate || null,
      incident_location: incidentLocation || null,
      claim_details: claimDetails || null,
      amount_sought: amountSought || null,
      other_relief: otherRelief || null,
      request_attorney_fees: requestAttorneyFees,
      request_court_costs: requestCourtCosts,
      defendant_county: defendantCounty || null,
      incident_county: incidentCounty || null,
      property_county: propertyCounty || null,
      contract_county: contractCounty || null,
      draft_text: draft || null,
      final_text: draft || null,
      filing_method: filingMethod || null,
      _wizard_step: currentStep,
    }
  }, [
    yourInfo, opposingParties, description, incidentDate, incidentLocation,
    claimDetails, amountSought, otherRelief, requestAttorneyFees,
    requestCourtCosts, defendantCounty, incidentCounty, propertyCounty,
    contractCounty, draft, filingMethod, currentStep,
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
        body: JSON.stringify({ facts: buildFacts() }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to generate document')
      }
      const data = await res.json()
      setDraft(data.draft)
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
    // Save current state first, then generate draft
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
    const stepId = WIZARD_STEPS[currentStep]?.id
    switch (stepId) {
      case 'preflight':
        return true
      case 'parties':
        return (
          yourInfo.full_name.trim() !== '' &&
          opposingParties.length > 0 &&
          opposingParties[0].full_name.trim() !== ''
        )
      case 'venue':
        return true
      case 'facts':
        return description.trim().length >= 50
      case 'claims':
        return true
      case 'relief':
        return true
      case 'how_to_file':
        return filingMethod !== ''
      case 'review':
        return true
      default:
        return true
    }
  }, [currentStep, yourInfo, opposingParties, description, filingMethod])

  /* ---- Form data for review step ---- */

  const formDataForReview = useMemo(
    () => ({
      yourInfo,
      opposingParties,
      description,
      incidentDate,
      incidentLocation,
      claimDetails,
      amountSought,
      otherRelief,
      requestAttorneyFees,
      requestCourtCosts,
      defendantCounty,
      incidentCounty,
      propertyCounty,
      contractCounty,
    }),
    [
      yourInfo, opposingParties, description, incidentDate, incidentLocation,
      claimDetails, amountSought, otherRelief, requestAttorneyFees,
      requestCourtCosts, defendantCounty, incidentCounty, propertyCounty,
      contractCounty,
    ]
  )

  /* ---- Step rendering ---- */

  function renderStep() {
    const stepId = WIZARD_STEPS[currentStep]?.id
    switch (stepId) {
      case 'preflight':
        return (
          <PreflightChecklist
            disputeType={caseData.dispute_type}
            onReady={() => setCurrentStep(1)}
          />
        )
      case 'parties':
        return (
          <PartiesStep
            yourInfo={yourInfo}
            opposingParties={opposingParties}
            onYourInfoChange={setYourInfo}
            onOpposingPartiesChange={setOpposingParties}
          />
        )
      case 'venue':
        return (
          <VenueStep
            courtType={caseData.court_type}
            county={caseData.county}
            disputeType={caseData.dispute_type}
            defendantCounty={defendantCounty}
            onDefendantCountyChange={setDefendantCounty}
            incidentCounty={incidentCounty}
            onIncidentCountyChange={setIncidentCounty}
            propertyCounty={propertyCounty}
            onPropertyCountyChange={setPropertyCounty}
            contractCounty={contractCounty}
            onContractCountyChange={setContractCounty}
          />
        )
      case 'facts':
        return (
          <FactsStep
            description={description}
            onDescriptionChange={setDescription}
            incidentDate={incidentDate}
            onIncidentDateChange={setIncidentDate}
            incidentLocation={incidentLocation}
            onIncidentLocationChange={setIncidentLocation}
            disputeType={caseData.dispute_type}
          />
        )
      case 'claims':
        return (
          <ClaimsStep
            disputeType={caseData.dispute_type}
            claimDetails={claimDetails}
            onClaimDetailsChange={setClaimDetails}
          />
        )
      case 'relief':
        return (
          <ReliefStep
            amountSought={amountSought}
            onAmountChange={setAmountSought}
            otherRelief={otherRelief}
            onOtherReliefChange={setOtherRelief}
            requestAttorneyFees={requestAttorneyFees}
            onAttorneyFeesChange={setRequestAttorneyFees}
            requestCourtCosts={requestCourtCosts}
            onCourtCostsChange={setRequestCourtCosts}
            courtType={caseData.court_type}
            jurisdictionWarning={jurisdictionCheck}
          />
        )
      case 'how_to_file':
        return (
          <FilingMethodStep
            filingMethod={filingMethod}
            onFilingMethodChange={setFilingMethod}
            county={caseData.county ?? ''}
            courtType={caseData.court_type}
            config={FILING_CONFIGS[caseData.dispute_type ?? 'civil'] ?? FILING_CONFIGS.civil}
            state={caseData.state}
          />
        )
      case 'review':
        return (
          <ReviewStep
            formData={formDataForReview}
            caseData={caseData}
            onEditStep={(stepIndex) => setCurrentStep(stepIndex)}
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
          {isDefendant ? 'Your Answer Draft' : 'Your Petition Draft'}
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
            <DraftViewer
              draft={draft}
              onDraftChange={setDraft}
              onRegenerate={async () => {
                setDraftPhase(false)
                await generateDraft()
              }}
              regenerating={generating}
              acknowledged={acknowledged}
              onAcknowledgeChange={setAcknowledged}
              documentTitle={isDefendant ? 'Answer' : 'Petition'}
              caseId={caseId}
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
      title={isDefendant ? 'Prepare Your Answer' : 'Prepare Your Petition'}
      steps={WIZARD_STEPS}
      currentStep={currentStep}
      onStepChange={setCurrentStep}
      onSave={handleSave}
      onComplete={handleComplete}
      canAdvance={canAdvance}
      totalEstimateMinutes={20}
      completeButtonLabel={generating ? 'Generating...' : 'Generate My Petition'}
    >
      {generating ? (
        <div className="flex items-center gap-3 py-12 justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-warm-muted" />
          <p className="text-sm text-warm-muted">
            Generating your {isDefendant ? 'answer' : 'petition'}... This may take a moment.
          </p>
        </div>
      ) : (
        renderStep()
      )}
    </WizardShell>
  )
}
