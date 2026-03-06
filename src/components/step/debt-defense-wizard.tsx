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

// Import all debt defense wizard steps
import { DebtPreflight } from './debt-defense-wizard-steps/debt-preflight'
import { DebtInfoStep } from './debt-defense-wizard-steps/debt-info-step'
import { DebtDatesStep } from './debt-defense-wizard-steps/debt-dates-step'
import { DefenseSelectionStep } from './debt-defense-wizard-steps/defense-selection-step'
import { AnswerTypeStep } from './debt-defense-wizard-steps/answer-type-step'
import { DebtPartiesStep } from './debt-defense-wizard-steps/debt-parties-step'
import { DebtVenueStep } from './debt-defense-wizard-steps/debt-venue-step'
import { DebtReviewStep } from './debt-defense-wizard-steps/debt-review-step'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface DebtDefenseWizardProps {
  caseId: string
  taskId: string
  existingMetadata?: Record<string, unknown> | null
  debtDefenseDetails: {
    debt_sub_type: string
    creditor_name?: string
    debt_buyer_name?: string
    original_amount?: number
    current_amount_claimed?: number
    account_number_last4?: string
    last_payment_date?: string
    account_open_date?: string
    account_default_date?: string
    selected_defenses?: string[]
    defense_details?: Record<string, unknown>
    answer_type?: string
    service_date?: string
    answer_deadline?: string
  } | null
  caseData: {
    county: string | null
    court_type: string
  }
}

/* ------------------------------------------------------------------ */
/*  Steps                                                              */
/* ------------------------------------------------------------------ */

const STEPS: WizardStep[] = [
  { id: 'preflight', title: 'Before You Start', subtitle: "Let's make sure you have what you need." },
  { id: 'debt_info', title: 'About the Debt', subtitle: 'Tell us about the debt being collected.' },
  { id: 'dates', title: 'Important Dates', subtitle: 'Key dates for your defense.' },
  { id: 'defenses', title: 'Choose Your Defenses', subtitle: 'Select which defenses apply to you.' },
  { id: 'answer_type', title: 'Answer Type', subtitle: 'Choose how to respond to the lawsuit.' },
  { id: 'parties', title: 'Parties', subtitle: 'Information about you and the plaintiff.' },
  { id: 'venue', title: 'Court Information', subtitle: 'Where your case is filed.' },
  { id: 'review', title: 'Review Everything', subtitle: 'Check your information before generating.' },
]

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function DebtDefenseWizard({
  caseId,
  taskId,
  existingMetadata,
  debtDefenseDetails,
  caseData,
}: DebtDefenseWizardProps) {
  const router = useRouter()
  const meta = (existingMetadata ?? {}) as Record<string, unknown>
  const totalEstimateMinutes = 30

  /* ---- Debt info ---- */
  const [creditorName, setCreditorName] = useState<string>(
    (meta.creditor_name as string) ?? debtDefenseDetails?.creditor_name ?? ''
  )
  const [debtBuyerName, setDebtBuyerName] = useState<string>(
    (meta.debt_buyer_name as string) ?? debtDefenseDetails?.debt_buyer_name ?? ''
  )
  const [hasDifferentPlaintiff, setHasDifferentPlaintiff] = useState<boolean>(
    (meta.has_different_plaintiff as boolean) ?? !!debtDefenseDetails?.debt_buyer_name
  )
  const [originalAmount, setOriginalAmount] = useState<string>(
    (meta.original_amount as string) ??
      (debtDefenseDetails?.original_amount != null
        ? String(debtDefenseDetails.original_amount)
        : '')
  )
  const [currentAmountClaimed, setCurrentAmountClaimed] = useState<string>(
    (meta.current_amount_claimed as string) ??
      (debtDefenseDetails?.current_amount_claimed != null
        ? String(debtDefenseDetails.current_amount_claimed)
        : '')
  )
  const [accountLast4, setAccountLast4] = useState<string>(
    (meta.account_last4 as string) ?? debtDefenseDetails?.account_number_last4 ?? ''
  )

  /* ---- Dates ---- */
  const [accountOpenDate, setAccountOpenDate] = useState<string>(
    (meta.account_open_date as string) ?? debtDefenseDetails?.account_open_date ?? ''
  )
  const [accountDefaultDate, setAccountDefaultDate] = useState<string>(
    (meta.account_default_date as string) ?? debtDefenseDetails?.account_default_date ?? ''
  )
  const [lastPaymentDate, setLastPaymentDate] = useState<string>(
    (meta.last_payment_date as string) ?? debtDefenseDetails?.last_payment_date ?? ''
  )
  const [serviceDate, setServiceDate] = useState<string>(
    (meta.service_date as string) ?? debtDefenseDetails?.service_date ?? ''
  )
  const [answerDeadline, setAnswerDeadline] = useState<string>(
    (meta.answer_deadline as string) ?? debtDefenseDetails?.answer_deadline ?? ''
  )

  /* ---- Defenses ---- */
  const [selectedDefenses, setSelectedDefenses] = useState<string[]>(
    (meta.selected_defenses as string[]) ?? debtDefenseDetails?.selected_defenses ?? []
  )
  const [defenseDetails, setDefenseDetails] = useState<Record<string, unknown>>(
    (meta.defense_details as Record<string, unknown>) ?? debtDefenseDetails?.defense_details ?? {}
  )

  /* ---- Answer type ---- */
  const [answerType, setAnswerType] = useState<'general_denial' | 'specific_answer' | ''>(
    (meta.answer_type as 'general_denial' | 'specific_answer' | '') ??
      (debtDefenseDetails?.answer_type as 'general_denial' | 'specific_answer' | '') ??
      ''
  )

  /* ---- Party info ---- */
  const [yourName, setYourName] = useState<string>((meta.your_name as string) ?? '')
  const [yourAddress, setYourAddress] = useState<string>((meta.your_address as string) ?? '')
  const [yourCity, setYourCity] = useState<string>((meta.your_city as string) ?? '')
  const [yourState, setYourState] = useState<string>((meta.your_state as string) ?? 'TX')
  const [yourZip, setYourZip] = useState<string>((meta.your_zip as string) ?? '')
  const [plaintiffName, setPlaintiffName] = useState<string>(
    (meta.plaintiff_name as string) ?? ''
  )
  const [plaintiffAttorneyName, setPlaintiffAttorneyName] = useState<string>(
    (meta.plaintiff_attorney_name as string) ?? ''
  )
  const [plaintiffAttorneyAddress, setPlaintiffAttorneyAddress] = useState<string>(
    (meta.plaintiff_attorney_address as string) ?? ''
  )
  const [plaintiffAttorneyCity, setPlaintiffAttorneyCity] = useState<string>(
    (meta.plaintiff_attorney_city as string) ?? ''
  )
  const [plaintiffAttorneyState, setPlaintiffAttorneyState] = useState<string>(
    (meta.plaintiff_attorney_state as string) ?? 'TX'
  )
  const [plaintiffAttorneyZip, setPlaintiffAttorneyZip] = useState<string>(
    (meta.plaintiff_attorney_zip as string) ?? ''
  )

  /* ---- Venue ---- */
  const [county, setCounty] = useState<string>(
    (meta.county as string) ?? caseData.county ?? ''
  )
  const [courtType, setCourtType] = useState<string>(
    (meta.court_type as string) ?? caseData.court_type ?? 'jp'
  )
  const [causeNumber, setCauseNumber] = useState<string>(
    (meta.cause_number as string) ?? ''
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

  /* ---- Debt info field change handler ---- */

  const handleDebtInfoFieldChange = useCallback(
    (field: string, value: string) => {
      switch (field) {
        case 'creditorName':
          setCreditorName(value)
          break
        case 'debtBuyerName':
          setDebtBuyerName(value)
          break
        case 'originalAmount':
          setOriginalAmount(value)
          break
        case 'currentAmountClaimed':
          setCurrentAmountClaimed(value)
          break
        case 'accountLast4':
          setAccountLast4(value)
          break
      }
    },
    []
  )

  /* ---- Dates field change handler ---- */

  const handleDatesFieldChange = useCallback(
    (field: string, value: string) => {
      switch (field) {
        case 'accountOpenDate':
          setAccountOpenDate(value)
          break
        case 'accountDefaultDate':
          setAccountDefaultDate(value)
          break
        case 'lastPaymentDate':
          setLastPaymentDate(value)
          break
        case 'serviceDate':
          setServiceDate(value)
          break
        case 'answerDeadline':
          setAnswerDeadline(value)
          break
      }
    },
    []
  )

  /* ---- Parties field change handler ---- */

  const handlePartiesFieldChange = useCallback(
    (field: string, value: string) => {
      switch (field) {
        case 'yourName':
          setYourName(value)
          break
        case 'yourAddress':
          setYourAddress(value)
          break
        case 'yourCity':
          setYourCity(value)
          break
        case 'yourState':
          setYourState(value)
          break
        case 'yourZip':
          setYourZip(value)
          break
        case 'plaintiffName':
          setPlaintiffName(value)
          break
        case 'plaintiffAttorneyName':
          setPlaintiffAttorneyName(value)
          break
        case 'plaintiffAttorneyAddress':
          setPlaintiffAttorneyAddress(value)
          break
        case 'plaintiffAttorneyCity':
          setPlaintiffAttorneyCity(value)
          break
        case 'plaintiffAttorneyState':
          setPlaintiffAttorneyState(value)
          break
        case 'plaintiffAttorneyZip':
          setPlaintiffAttorneyZip(value)
          break
      }
    },
    []
  )

  /* ---- Venue field change handler ---- */

  const handleVenueFieldChange = useCallback(
    (field: string, value: string) => {
      switch (field) {
        case 'county':
          setCounty(value)
          break
        case 'courtType':
          setCourtType(value)
          break
        case 'causeNumber':
          setCauseNumber(value)
          break
      }
    },
    []
  )

  /* ---- SOL status computation ---- */

  const solStatus = useMemo(() => {
    if (!lastPaymentDate) return 'unknown' as const
    const daysSince = Math.floor(
      (Date.now() - new Date(lastPaymentDate).getTime()) / (1000 * 60 * 60 * 24)
    )
    return daysSince > 4 * 365 ? ('expired' as const) : ('active' as const)
  }, [lastPaymentDate])

  /* ---- Build helpers ---- */

  const buildFacts = useCallback(() => {
    const parsedOriginal = parseFloat(originalAmount) || 0
    const parsedCurrent = parseFloat(currentAmountClaimed) || 0

    const opposingParties = [
      { full_name: plaintiffName || creditorName },
      ...(plaintiffAttorneyName
        ? [
            {
              full_name: plaintiffAttorneyName,
              address: plaintiffAttorneyAddress || undefined,
              city: plaintiffAttorneyCity || undefined,
              state: plaintiffAttorneyState || undefined,
              zip: plaintiffAttorneyZip || undefined,
            },
          ]
        : []),
    ]

    return {
      your_info: {
        full_name: yourName,
        address: yourAddress || undefined,
        city: yourCity || undefined,
        state: yourState || undefined,
        zip: yourZip || undefined,
      },
      opposing_parties: opposingParties,
      court_type: courtType as 'jp' | 'county' | 'district',
      county: county || '',
      cause_number: causeNumber || undefined,
      debt_sub_type: debtDefenseDetails?.debt_sub_type ?? 'other',
      answer_type: answerType as 'general_denial' | 'specific_answer',
      selected_defenses: selectedDefenses,
      defense_details: Object.keys(defenseDetails).length > 0 ? defenseDetails : undefined,
      original_amount: parsedOriginal,
      current_amount_claimed: parsedCurrent,
      description:
        `Debt collection defense - ${debtDefenseDetails?.debt_sub_type ?? 'other'} debt. ` +
        `Original creditor: ${creditorName}. ` +
        (debtBuyerName ? `Debt buyer: ${debtBuyerName}. ` : '') +
        `Original amount: $${parsedOriginal.toFixed(2)}. Currently claimed: $${parsedCurrent.toFixed(2)}.`,
    }
  }, [
    originalAmount,
    currentAmountClaimed,
    plaintiffName,
    creditorName,
    plaintiffAttorneyName,
    plaintiffAttorneyAddress,
    plaintiffAttorneyCity,
    plaintiffAttorneyState,
    plaintiffAttorneyZip,
    yourName,
    yourAddress,
    yourCity,
    yourState,
    yourZip,
    courtType,
    county,
    causeNumber,
    debtDefenseDetails,
    answerType,
    selectedDefenses,
    defenseDetails,
    debtBuyerName,
  ])

  const buildMetadata = useCallback(
    () => ({
      // Debt info
      creditor_name: creditorName,
      debt_buyer_name: debtBuyerName,
      has_different_plaintiff: hasDifferentPlaintiff,
      original_amount: originalAmount,
      current_amount_claimed: currentAmountClaimed,
      account_last4: accountLast4,
      // Dates
      account_open_date: accountOpenDate || null,
      account_default_date: accountDefaultDate || null,
      last_payment_date: lastPaymentDate || null,
      service_date: serviceDate || null,
      answer_deadline: answerDeadline || null,
      // Defenses
      selected_defenses: selectedDefenses,
      defense_details: defenseDetails,
      // Answer type
      answer_type: answerType || null,
      // Parties
      your_name: yourName,
      your_address: yourAddress,
      your_city: yourCity,
      your_state: yourState,
      your_zip: yourZip,
      plaintiff_name: plaintiffName,
      plaintiff_attorney_name: plaintiffAttorneyName,
      plaintiff_attorney_address: plaintiffAttorneyAddress,
      plaintiff_attorney_city: plaintiffAttorneyCity,
      plaintiff_attorney_state: plaintiffAttorneyState,
      plaintiff_attorney_zip: plaintiffAttorneyZip,
      // Venue
      county: county || null,
      court_type: courtType || null,
      cause_number: causeNumber || null,
      // Draft
      draft_text: draft || null,
      final_text: draft || null,
      annotations,
      // Wizard position
      _wizard_step: currentStep,
    }),
    [
      creditorName,
      debtBuyerName,
      hasDifferentPlaintiff,
      originalAmount,
      currentAmountClaimed,
      accountLast4,
      accountOpenDate,
      accountDefaultDate,
      lastPaymentDate,
      serviceDate,
      answerDeadline,
      selectedDefenses,
      defenseDetails,
      answerType,
      yourName,
      yourAddress,
      yourCity,
      yourState,
      yourZip,
      plaintiffName,
      plaintiffAttorneyName,
      plaintiffAttorneyAddress,
      plaintiffAttorneyCity,
      plaintiffAttorneyState,
      plaintiffAttorneyZip,
      county,
      courtType,
      causeNumber,
      draft,
      annotations,
      currentStep,
    ]
  )

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
      const docType =
        answerType === 'general_denial'
          ? 'debt_defense_general_denial'
          : 'debt_defense_specific_answer'
      const res = await fetch(`/api/cases/${caseId}/generate-filing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document_type: docType, facts: buildFacts() }),
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
    const stepId = STEPS[currentStep]?.id
    switch (stepId) {
      case 'preflight':
        return true
      case 'debt_info':
        return creditorName.trim() !== '' && (parseFloat(currentAmountClaimed) || 0) > 0
      case 'dates':
        return true // dates are helpful but not strictly required
      case 'defenses':
        return selectedDefenses.length > 0
      case 'answer_type':
        return answerType !== ''
      case 'parties':
        return yourName.trim() !== '' && plaintiffName.trim() !== ''
      case 'venue':
        return county.trim() !== '' && courtType !== ''
      case 'review':
        return true
      default:
        return true
    }
  }, [
    currentStep,
    creditorName,
    currentAmountClaimed,
    selectedDefenses,
    answerType,
    yourName,
    plaintiffName,
    county,
    courtType,
  ])

  /* ---- Document title helpers ---- */

  const documentTitle = answerType === 'general_denial' ? 'General Denial' : 'Specific Answer'
  const draftTitle = `Your ${answerType === 'general_denial' ? 'General Denial' : 'Specific Answer'} Draft`

  /* ---- Step rendering ---- */

  function renderStep() {
    const stepId = STEPS[currentStep]?.id
    switch (stepId) {
      case 'preflight':
        return (
          <DebtPreflight caseId={caseId} taskId={taskId} existingAnswers={(existingMetadata?.guided_answers as Record<string, string>) ?? undefined} />
        )
      case 'debt_info':
        return (
          <DebtInfoStep
            creditorName={creditorName}
            debtBuyerName={debtBuyerName}
            hasDifferentPlaintiff={hasDifferentPlaintiff}
            originalAmount={originalAmount}
            currentAmountClaimed={currentAmountClaimed}
            accountLast4={accountLast4}
            onFieldChange={handleDebtInfoFieldChange}
            onHasDifferentPlaintiffChange={setHasDifferentPlaintiff}
          />
        )
      case 'dates':
        return (
          <DebtDatesStep
            accountOpenDate={accountOpenDate}
            accountDefaultDate={accountDefaultDate}
            lastPaymentDate={lastPaymentDate}
            serviceDate={serviceDate}
            answerDeadline={answerDeadline}
            onFieldChange={handleDatesFieldChange}
          />
        )
      case 'defenses':
        return (
          <DefenseSelectionStep
            selectedDefenses={selectedDefenses}
            defenseDetails={defenseDetails}
            onDefensesChange={setSelectedDefenses}
            onDefenseDetailsChange={setDefenseDetails}
            solStatus={solStatus}
          />
        )
      case 'answer_type':
        return (
          <AnswerTypeStep
            answerType={answerType}
            onSelect={setAnswerType}
            hasCounterclaim={selectedDefenses.includes('fdcpa_violations')}
          />
        )
      case 'parties':
        return (
          <DebtPartiesStep
            yourName={yourName}
            yourAddress={yourAddress}
            yourCity={yourCity}
            yourState={yourState}
            yourZip={yourZip}
            plaintiffName={plaintiffName}
            plaintiffAttorneyName={plaintiffAttorneyName}
            plaintiffAttorneyAddress={plaintiffAttorneyAddress}
            plaintiffAttorneyCity={plaintiffAttorneyCity}
            plaintiffAttorneyState={plaintiffAttorneyState}
            plaintiffAttorneyZip={plaintiffAttorneyZip}
            onFieldChange={handlePartiesFieldChange}
          />
        )
      case 'venue':
        return (
          <DebtVenueStep
            county={county}
            courtType={courtType}
            causeNumber={causeNumber}
            onFieldChange={handleVenueFieldChange}
          />
        )
      case 'review':
        return (
          <DebtReviewStep
            creditorName={creditorName}
            debtBuyerName={debtBuyerName}
            originalAmount={parseFloat(originalAmount) || 0}
            currentAmountClaimed={parseFloat(currentAmountClaimed) || 0}
            accountLast4={accountLast4}
            lastPaymentDate={lastPaymentDate}
            serviceDate={serviceDate}
            answerDeadline={answerDeadline}
            selectedDefenses={selectedDefenses}
            answerType={answerType}
            yourName={yourName}
            plaintiffName={plaintiffName}
            county={county}
            courtType={courtType}
            causeNumber={causeNumber}
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

        <h1 className="text-2xl font-semibold text-warm-text">{draftTitle}</h1>
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
              documentTitle={documentTitle}
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
      title={`Prepare Your ${documentTitle}`}
      steps={STEPS}
      currentStep={currentStep}
      onStepChange={setCurrentStep}
      onSave={handleSave}
      onComplete={handleComplete}
      canAdvance={canAdvance}
      totalEstimateMinutes={totalEstimateMinutes}
      completeButtonLabel={generating ? 'Generating...' : 'Generate My Answer'}
    >
      {generating ? (
        <div className="flex items-center gap-3 py-12 justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-warm-muted" />
          <p className="text-sm text-warm-muted">
            Generating your {documentTitle.toLowerCase()}... This may take a moment.
          </p>
        </div>
      ) : (
        renderStep()
      )}
    </WizardShell>
  )
}
