'use client'

import { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
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
import { ChevronLeft, Loader2, Eye, Edit3, Layout } from 'lucide-react'
import Link from 'next/link'
import type { FilingFacts } from '@lawyer-free/shared/schemas/filing'
import { FilingMethodStep } from '@/components/step/filing-method-step'
import { FILING_CONFIGS } from '@/lib/filing-configs'
import { PetitionPreview } from '@/components/step/petition-preview'
import { SectionNavigator } from '@/components/step/section-navigator'
import { CompletenessScore } from '@/components/step/completeness-score'
import { CelebrationBanner, ProgressStats } from '@/components/step/celebration-banner'
import { Confetti, Celebration } from '@/components/ui/celebration'
import { usePetitionCompleteness, PETITION_FIELDS } from '@/hooks/usePetitionCompleteness'
import { cn } from '@/lib/utils'

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

const WIZARD_STEPS: WizardStep[] = [
  { id: 'preflight', title: 'Before You Start', subtitle: "Let's make sure you have what you need." },
  { id: 'parties', title: 'Who Is Involved?', subtitle: 'Tell us about yourself and who you are suing.' },
  { id: 'venue', title: 'Where Should You File?', subtitle: "We'll help you pick the right court location." },
  { id: 'facts', title: 'What Happened?', subtitle: 'Tell your story in your own words.' },
  { id: 'claims', title: 'Why Is This Wrong?', subtitle: "Let's identify the legal basis for your case." },
  { id: 'relief', title: 'What Do You Want the Court to Do?', subtitle: 'Tell us how you want this resolved.' },
  { id: 'how_to_file', title: 'How to File', subtitle: 'Choose how you want to submit your petition.' },
  { id: 'review', title: 'Review Everything', subtitle: 'Check your information before generating your petition.' },
]

export function PetitionWizardEnhanced({
  caseId,
  taskId,
  existingMetadata,
  caseData,
}: PetitionWizardProps) {
  const router = useRouter()
  const meta = existingMetadata ?? {}
  const isDefendant = caseData.role === 'defendant'

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
  const [currentStep, setCurrentStep] = useState(
    typeof meta._wizard_step === 'number' ? meta._wizard_step : 0
  )
  const [draft, setDraft] = useState((meta.draft_text as string) ?? '')
  const [acknowledged, setAcknowledged] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState<string | null>(null)
  const [draftPhase, setDraftPhase] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [filingMethod, setFilingMethod] = useState<'online' | 'in_person' | ''>(
    (meta.filing_method as 'online' | 'in_person' | '') ?? ''
  )

  // TurboTax-style features
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('edit')
  const [activeSectionId, setActiveSectionId] = useState<string>('preflight')
  const [showCelebration, setShowCelebration] = useState(false)
  const [lastCompletedSection, setLastCompletedSection] = useState<string | null>(null)
  const [savedMinutes, setSavedMinutes] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showCompletionCelebration, setShowCompletionCelebration] = useState(false)

  const jurisdictionCheck = useMemo(() => {
    const amount = amountSought ? parseFloat(amountSought) : 0
    if (amount === 0) return null
    const check = validateJurisdiction({ courtType: caseData.court_type, amountSought: amount })
    return check.valid ? null : check.warning ?? null
  }, [amountSought, caseData.court_type])

  // Build answers for completeness check
  const answers = useMemo(() => ({
    'your_info.full_name': yourInfo.full_name,
    'your_info.address': yourInfo.address,
    'opposing_parties.0.full_name': opposingParties[0]?.full_name,
    'opposing_parties.0.address': opposingParties[0]?.address,
    'court_type': caseData.court_type,
    'county': caseData.county,
    'description': description,
    'incident_date': incidentDate,
    'incident_location': incidentLocation,
    'dispute_type': caseData.dispute_type,
    'claim_details': claimDetails,
    'amount_sought': amountSought,
    'other_relief': otherRelief,
    'request_court_costs': requestCourtCosts,
    'request_attorney_fees': requestAttorneyFees,
    'filing_method': filingMethod,
  }), [yourInfo, opposingParties, caseData, description, incidentDate, incidentLocation, claimDetails, amountSought, otherRelief, requestCourtCosts, requestAttorneyFees, filingMethod])

  const completeness = usePetitionCompleteness(PETITION_FIELDS, answers)

  const buildFacts = useCallback((): FilingFacts => ({
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
  }), [yourInfo, opposingParties, caseData, description, incidentDate, incidentLocation, claimDetails, amountSought, otherRelief, requestAttorneyFees, requestCourtCosts])

  const buildMetadata = useCallback(() => ({
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
  }), [yourInfo, opposingParties, description, incidentDate, incidentLocation, claimDetails, amountSought, otherRelief, requestAttorneyFees, requestCourtCosts, defendantCounty, incidentCounty, propertyCounty, contractCounty, draft, filingMethod, currentStep])

  async function patchTask(status: string, metadata?: Record<string, unknown>) {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, ...(metadata ? { metadata } : {}) }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'We couldn\'t save your progress right now. Please try again.')
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
        throw new Error(data.error || 'We couldn\'t generate your document right now. Please try again.')
      }
      const data = await res.json()
      setDraft(data.draft)
      setDraftPhase(true)
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'We couldn\'t generate your document right now. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const handleSave = useCallback(async () => {
    await patchTask('in_progress', buildMetadata())
  }, [buildMetadata])

  const handleComplete = useCallback(async () => {
    await patchTask('in_progress', buildMetadata())
    await generateDraft()
    setShowConfetti(true)
    setShowCompletionCelebration(true)
    setTimeout(() => {
      setShowConfetti(false)
    }, 5000)
  }, [buildMetadata, buildFacts])

  const handleFinalConfirm = useCallback(async () => {
    setConfirming(true)
    try {
      const metadata = buildMetadata()
      await patchTask('in_progress', metadata)
      await patchTask('completed')
      setShowConfetti(true)
      setShowCompletionCelebration(true)
      toast.success('Step completed! Check your dashboard for what\'s next.')
      setTimeout(() => {
        setShowConfetti(false)
        router.push(`/case/${caseId}`)
      }, 3000)
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'We couldn\'t save your progress right now. Please try again.')
    } finally {
      setConfirming(false)
    }
  }, [buildMetadata, caseId, router])

  const canAdvance = useMemo(() => {
    const stepId = WIZARD_STEPS[currentStep]?.id
    switch (stepId) {
      case 'preflight': return true
      case 'parties':
        return yourInfo.full_name.trim() !== '' &&
          opposingParties.length > 0 &&
          opposingParties[0].full_name.trim() !== ''
      case 'venue': return true
      case 'facts': return description.trim().length >= 50
      case 'claims': return true
      case 'relief': return true
      case 'how_to_file': return filingMethod !== ''
      case 'review': return true
      default: return true
    }
  }, [currentStep, yourInfo, opposingParties, description, filingMethod])

  // Handle step completion for celebration
  const handleStepChange = useCallback((step: number) => {
    const prevSectionId = WIZARD_STEPS[currentStep]?.id
    const newSectionId = WIZARD_STEPS[step]?.id

    if (step > currentStep && prevSectionId) {
      setLastCompletedSection(prevSectionId)
      setShowCelebration(true)
      setTimeout(() => setShowCelebration(false), 5000)
    }

    setCurrentStep(step)
    setActiveSectionId(newSectionId)
  }, [currentStep])

  // Petition preview data
  const previewData = useMemo(() => ({
    yourInfo,
    opposingParties,
    courtType: caseData.court_type,
    county: caseData.county,
    state: caseData.state,
    description,
    incidentDate,
    disputeType: caseData.dispute_type,
    claimDetails,
    amountSought,
    otherRelief,
    requestAttorneyFees,
    requestCourtCosts,
    role: caseData.role,
  }), [yourInfo, opposingParties, caseData, description, incidentDate, claimDetails, amountSought, otherRelief, requestAttorneyFees, requestCourtCosts])

  function renderStep() {
    const stepId = WIZARD_STEPS[currentStep]?.id
    switch (stepId) {
      case 'preflight':
        return (
          <PreflightChecklist
            disputeType={caseData.dispute_type}
            onReady={() => handleStepChange(1)}
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
            formData={{
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
            }}
            caseData={caseData}
            onEditStep={(stepIndex) => handleStepChange(stepIndex)}
          />
        )
      default:
        return null
    }
  }

  // Draft phase layout
  if (draftPhase) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link href={`/case/${caseId}`} className="inline-flex items-center gap-1 text-sm text-warm-muted hover:text-warm-text mb-4">
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
                <Button onClick={handleFinalConfirm} disabled={confirming} className="w-full" size="lg">
                  {confirming ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : 'Confirm & Submit'}
                </Button>
                <p className="text-xs text-warm-muted text-center mt-2">
                  This saves your document and marks this step as complete.
                </p>
              </div>
            )}
            <div className="mt-4">
              <button type="button" onClick={() => setDraftPhase(false)} className="text-sm text-warm-muted hover:text-warm-text transition-colors">
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

  // TurboTax-style layout with split view
  if (viewMode === 'split') {
    return (
      <div className="min-h-screen bg-warm-bg">
        <div className="flex">
          {/* Sidebar */}
          <div className="w-72 bg-white border-r border-warm-border p-6 shrink-0 hidden lg:block">
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-warm-text mb-4">Petition Progress</h3>
              <CompletenessScore completeness={completeness} />
            </div>
            <SectionNavigator
              sections={completeness.sections}
              activeSectionId={activeSectionId}
              onSectionClick={(id) => {
                const index = WIZARD_STEPS.findIndex(s => s.id === id)
                if (index >= 0) handleStepChange(index)
              }}
            />
            <div className="mt-6 pt-6 border-t border-warm-border">
              <ProgressStats
                sectionsCompleted={completeness.sections.filter(s => s.isComplete).length}
                totalSections={completeness.sections.length}
                questionsAnswered={completeness.sections.reduce((sum, s) => sum + s.completedFields, 0)}
                totalQuestions={completeness.sections.reduce((sum, s) => sum + s.totalFields, 0)}
                estimatedMinutes={Math.round((currentStep / WIZARD_STEPS.length) * 30)}
              />
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 flex flex-col">
            <div className="bg-white border-b border-warm-border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Link href={`/case/${caseId}`} className="text-sm text-warm-muted hover:text-warm-text">
                    ← Back
                  </Link>
                  <h1 className="font-semibold text-warm-text">
                    {isDefendant ? 'Prepare Your Answer' : 'Prepare Your Petition'}
                  </h1>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode('edit')}
                  >
                    <Edit3 className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode('preview')}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex-1 flex">
              {/* Form area */}
              <div className="flex-1 p-6 overflow-y-auto">
                <WizardShell
                  caseId={caseId}
                  title={isDefendant ? 'Prepare Your Answer' : 'Prepare Your Petition'}
                  steps={WIZARD_STEPS}
                  currentStep={currentStep}
                  onStepChange={handleStepChange}
                  onSave={handleSave}
                  onComplete={handleComplete}
                  canAdvance={canAdvance}
                  totalEstimateMinutes={30}
                  completeButtonLabel={generating ? 'Generating...' : 'Generate My Petition'}
                >
                  {showCelebration && lastCompletedSection && (
                    <CelebrationBanner sectionId={lastCompletedSection} className="mb-6" />
                  )}
                  {genError && !draftPhase && (
                    <div className="rounded-lg border border-calm-amber bg-calm-amber/5 p-3 mb-4">
                      <p className="text-sm text-warm-text">{genError}</p>
                    </div>
                  )}
                  {generating ? (
                    <div className="flex items-center gap-3 py-4">
                      <div className="animate-spin h-5 w-5 border-2 border-calm-indigo border-t-transparent rounded-full" />
                      <p className="text-sm text-warm-muted">Generating your document... This usually takes 10-15 seconds.</p>
                    </div>
                  ) : renderStep()}
                </WizardShell>
              </div>

              {/* Live preview */}
              <div className="w-[28rem] border-l border-warm-border p-6 bg-stone-50 overflow-y-auto hidden xl:block">
                <h3 className="text-sm font-semibold text-warm-text mb-4">Live Preview</h3>
                <PetitionPreview data={previewData} />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Preview mode
  if (viewMode === 'preview') {
    return (
      <div className="min-h-screen bg-warm-bg">
        <div className="max-w-3xl mx-auto py-8 px-4">
          <div className="flex items-center justify-between mb-6">
            <Button variant="outline" onClick={() => setViewMode('edit')} className="gap-2">
              <Edit3 className="h-4 w-4" />
              Back to Edit
            </Button>
            <Button variant="outline" onClick={() => setViewMode('split')} className="gap-2">
              <Layout className="h-4 w-4" />
              Split View
            </Button>
          </div>
          <PetitionPreview data={previewData} />
          <div className="mt-6">
            <CompletenessScore completeness={completeness} />
          </div>
        </div>
      </div>
    )
  }

  // Standard edit mode with enhancements
  return (
    <>
      <WizardShell
        caseId={caseId}
        title={isDefendant ? 'Prepare Your Answer' : 'Prepare Your Petition'}
        steps={WIZARD_STEPS}
        currentStep={currentStep}
        onStepChange={handleStepChange}
        onSave={handleSave}
        onComplete={handleComplete}
        canAdvance={canAdvance}
        totalEstimateMinutes={30}
        completeButtonLabel={generating ? 'Generating...' : 'Generate My Petition'}
      >
        {showCelebration && lastCompletedSection && (
          <CelebrationBanner sectionId={lastCompletedSection} className="mb-6" />
        )}
        <div className="mb-4 flex items-center justify-end">
          <div className="flex items-center gap-2 bg-warm-bg rounded-lg p-1">
            <Button
              variant="default"
              size="sm"
              onClick={() => setViewMode('edit')}
              className="gap-1"
            >
              <Edit3 className="h-3.5 w-3.5" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('preview')}
              className="gap-1"
            >
              <Eye className="h-3.5 w-3.5" />
              Preview
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('split')}
              className="gap-1"
            >
              <Layout className="h-3.5 w-3.5" />
              Split
            </Button>
          </div>
        </div>
        {genError && !draftPhase && (
          <div className="rounded-lg border border-calm-amber bg-calm-amber/5 p-3 mb-4">
            <p className="text-sm text-warm-text">{genError}</p>
          </div>
        )}
        {generating ? (
          <div className="flex items-center gap-3 py-4">
            <div className="animate-spin h-5 w-5 border-2 border-calm-indigo border-t-transparent rounded-full" />
            <p className="text-sm text-warm-muted">Generating your document... This usually takes 10-15 seconds.</p>
          </div>
        ) : renderStep()}
      </WizardShell>

      <Confetti show={showConfetti} />
      <Celebration
        show={showCompletionCelebration}
        type="complete"
        title="Petition Complete!"
        message="Your legal document has been generated. Review it and submit when ready."
        onDismiss={() => setShowCompletionCelebration(false)}
        autoDismiss={5000}
      />
    </>
  )
}
