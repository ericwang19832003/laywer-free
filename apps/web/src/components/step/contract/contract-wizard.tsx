'use client'

import { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { WizardShell } from '@/components/ui/wizard-shell'
import type { WizardStep } from '@/components/ui/wizard-shell'
import type { DraftAnnotation } from '@/components/step/filing/annotated-draft-viewer'

import { IntakeStep } from './steps/intake-step'
import { ContractDetailsStep } from './steps/contract-details-step'
import { BreachStep } from './steps/breach-step'
import { DamagesStep, type DamageLineItem } from './steps/damages-step'
import { EvidenceStep } from './steps/evidence-step'
import { LegalBasisStep } from './steps/legal-basis-step'
import { FilingStep } from './steps/filing-step'
import { ReviewStep } from './steps/review-step'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ContractWizardProps {
  caseId: string
  taskId: string
  existingMetadata?: Record<string, unknown>
  contractDetails?: {
    contract_sub_type?: string
    contract_date?: string
    contract_amount?: string
    has_written_contract?: boolean
    breach_description?: string
    damages_sought?: string
    other_party_name?: string
    other_party_type?: string
  } | null
  caseData?: { county: string | null; court_type: string; state?: string }
}

/* ------------------------------------------------------------------ */
/*  Wizard steps                                                       */
/* ------------------------------------------------------------------ */

const WIZARD_STEPS: WizardStep[] = [
  { id: 'intake', title: 'Getting Started', subtitle: 'Basic information about your contract dispute.' },
  { id: 'contract_details', title: 'Contract Details', subtitle: 'What was the agreement about?' },
  { id: 'breach', title: 'The Breach', subtitle: 'What went wrong?' },
  { id: 'damages', title: 'Your Damages', subtitle: 'Calculate what you are owed.' },
  { id: 'evidence', title: 'Your Evidence', subtitle: 'Documents that support your case.' },
  { id: 'legal_basis', title: 'Legal Basis', subtitle: 'Choose the basis for your claim.' },
  { id: 'how_to_file', title: 'How to File', subtitle: 'Your info and filing method.' },
  { id: 'review', title: 'Review & Generate', subtitle: 'Check everything, then generate your petition.' },
]

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ContractWizard({
  caseId,
  taskId,
  existingMetadata,
  contractDetails,
  caseData,
}: ContractWizardProps) {
  const router = useRouter()
  const meta = (existingMetadata ?? {}) as Record<string, unknown>
  const totalEstimateMinutes = 25

  /* ---- Intake ---- */
  const [contractSubType, setContractSubType] = useState<string>(
    (meta.contract_sub_type as string) ?? contractDetails?.contract_sub_type ?? ''
  )
  const [otherPartyName, setOtherPartyName] = useState<string>(
    (meta.other_party_name as string) ?? contractDetails?.other_party_name ?? ''
  )
  const [otherPartyType, setOtherPartyType] = useState<string>(
    (meta.other_party_type as string) ?? contractDetails?.other_party_type ?? 'individual'
  )
  const [contractDate, setContractDate] = useState<string>(
    (meta.contract_date as string) ?? contractDetails?.contract_date ?? ''
  )
  const [breachDate, setBreachDate] = useState<string>(
    (meta.breach_date as string) ?? ''
  )

  /* ---- Contract Details ---- */
  const [contractAmount, setContractAmount] = useState<string>(
    (meta.contract_amount as string) ?? contractDetails?.contract_amount ?? ''
  )
  const [hasWrittenContract, setHasWrittenContract] = useState<boolean>(
    (meta.has_written_contract as boolean) ?? contractDetails?.has_written_contract ?? false
  )
  const [contractDescription, setContractDescription] = useState<string>(
    (meta.contract_description as string) ?? ''
  )
  const [keyTerms, setKeyTerms] = useState<string>((meta.key_terms as string) ?? '')
  const [whatWasPromised, setWhatWasPromised] = useState<string>(
    (meta.what_was_promised as string) ?? ''
  )

  /* ---- Breach ---- */
  const [breachDescription, setBreachDescription] = useState<string>(
    (meta.breach_description as string) ?? contractDetails?.breach_description ?? ''
  )
  const [discoveryDate, setDiscoveryDate] = useState<string>(
    (meta.discovery_date as string) ?? ''
  )
  const [performedObligations, setPerformedObligations] = useState<string>(
    (meta.performed_obligations as string) ?? ''
  )
  const [priorDemandSent, setPriorDemandSent] = useState<boolean>(
    (meta.prior_demand_sent as boolean) ?? false
  )

  /* ---- Damages ---- */
  const [damageLineItems, setDamageLineItems] = useState<DamageLineItem[]>(
    (meta.damage_line_items as DamageLineItem[]) ?? [{ description: '', amount: '' }]
  )
  const [consequentialDamages, setConsequentialDamages] = useState<string>(
    (meta.consequential_damages as string) ?? ''
  )
  const [mitigationEfforts, setMitigationEfforts] = useState<string>(
    (meta.mitigation_efforts as string) ?? ''
  )
  const [costToCure, setCostToCure] = useState<string>(
    (meta.cost_to_cure as string) ?? ''
  )

  /* ---- Evidence ---- */
  const [availableEvidence, setAvailableEvidence] = useState<string[]>(
    (meta.available_evidence as string[]) ?? []
  )
  const [evidenceNotes, setEvidenceNotes] = useState<string>(
    (meta.evidence_notes as string) ?? ''
  )

  /* ---- Legal Basis ---- */
  const [causesOfAction, setCausesOfAction] = useState<string[]>(
    (meta.causes_of_action as string[]) ?? []
  )

  /* ---- Venue / Parties ---- */
  const [yourName, setYourName] = useState<string>((meta.your_name as string) ?? '')
  const [yourAddress, setYourAddress] = useState<string>((meta.your_address as string) ?? '')
  const [yourCity, setYourCity] = useState<string>((meta.your_city as string) ?? '')
  const [yourState, setYourState] = useState<string>((meta.your_state as string) ?? 'TX')
  const [yourZip, setYourZip] = useState<string>((meta.your_zip as string) ?? '')
  const [county, setCounty] = useState<string>(
    (meta.county as string) ?? caseData?.county ?? ''
  )
  const [courtType, setCourtType] = useState<string>(
    (meta.court_type as string) ?? caseData?.court_type ?? 'county'
  )
  const [causeNumber, setCauseNumber] = useState<string>(
    (meta.cause_number as string) ?? ''
  )
  const [filingMethod, setFilingMethod] = useState<'online' | 'in_person' | ''>(
    (meta.filing_method as 'online' | 'in_person') ?? ''
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

  /* ---- Computed totals ---- */

  const lineItemTotal = useMemo(
    () => damageLineItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0),
    [damageLineItems]
  )

  const grandTotal = useMemo(
    () => lineItemTotal + (parseFloat(consequentialDamages) || 0) + (parseFloat(costToCure) || 0),
    [lineItemTotal, consequentialDamages, costToCure]
  )

  /* ---- Damage line item handlers ---- */

  const addLineItem = useCallback(() => {
    setDamageLineItems((prev) => [...prev, { description: '', amount: '' }])
  }, [])

  const removeLineItem = useCallback((index: number) => {
    setDamageLineItems((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const updateLineItem = useCallback(
    (index: number, field: keyof DamageLineItem, value: string) => {
      setDamageLineItems((prev) =>
        prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
      )
    },
    []
  )

  /* ---- Toggle helpers ---- */

  const toggleEvidence = useCallback((id: string) => {
    setAvailableEvidence((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    )
  }, [])

  const toggleCause = useCallback((id: string) => {
    setCausesOfAction((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }, [])

  /* ---- Build helpers ---- */

  const buildFacts = useCallback(() => ({
    your_info: {
      full_name: yourName,
      address: yourAddress || undefined,
      city: yourCity || undefined,
      state: yourState || undefined,
      zip: yourZip || undefined,
    },
    opposing_parties: [{
      full_name: otherPartyName || 'Unknown Defendant',
      party_type: otherPartyType,
    }],
    court_type: courtType as 'jp' | 'county' | 'district',
    county: county || '',
    cause_number: causeNumber || undefined,
    contract_sub_type: contractSubType || undefined,
    contract_date: contractDate,
    contract_amount: parseFloat(contractAmount) || 0,
    has_written_contract: hasWrittenContract,
    contract_description: contractDescription || undefined,
    key_terms: keyTerms || undefined,
    what_was_promised: whatWasPromised || undefined,
    breach_date: breachDate || undefined,
    breach_description: breachDescription,
    discovery_date: discoveryDate || undefined,
    performed_obligations: performedObligations || undefined,
    prior_demand_sent: priorDemandSent,
    causes_of_action: causesOfAction,
    available_evidence: availableEvidence,
    damages: {
      line_items: damageLineItems.filter((i) => i.description || i.amount),
      consequential_damages: parseFloat(consequentialDamages) || 0,
      cost_to_cure: parseFloat(costToCure) || 0,
      total: grandTotal,
    },
    mitigation_efforts: mitigationEfforts || undefined,
  }), [
    yourName, yourAddress, yourCity, yourState, yourZip,
    otherPartyName, otherPartyType, courtType, county, causeNumber,
    contractSubType, contractDate, contractAmount, hasWrittenContract,
    contractDescription, keyTerms, whatWasPromised,
    breachDate, breachDescription, discoveryDate,
    performedObligations, priorDemandSent,
    causesOfAction, availableEvidence,
    damageLineItems, consequentialDamages, costToCure, grandTotal,
    mitigationEfforts,
  ])

  const buildMetadata = useCallback(() => ({
    contract_sub_type: contractSubType || null,
    other_party_name: otherPartyName || null,
    other_party_type: otherPartyType,
    contract_date: contractDate || null,
    breach_date: breachDate || null,
    contract_amount: contractAmount || null,
    has_written_contract: hasWrittenContract,
    contract_description: contractDescription || null,
    key_terms: keyTerms || null,
    what_was_promised: whatWasPromised || null,
    breach_description: breachDescription || null,
    discovery_date: discoveryDate || null,
    performed_obligations: performedObligations || null,
    prior_demand_sent: priorDemandSent,
    damage_line_items: damageLineItems,
    consequential_damages: consequentialDamages || null,
    cost_to_cure: costToCure || null,
    mitigation_efforts: mitigationEfforts || null,
    available_evidence: availableEvidence,
    evidence_notes: evidenceNotes || null,
    causes_of_action: causesOfAction,
    your_name: yourName || null,
    your_address: yourAddress || null,
    your_city: yourCity || null,
    your_state: yourState || null,
    your_zip: yourZip || null,
    county: county || null,
    court_type: courtType || null,
    cause_number: causeNumber || null,
    filing_method: filingMethod || null,
    draft_text: draft || null,
    final_text: draft || null,
    annotations,
    _wizard_step: currentStep,
  }), [
    contractSubType, otherPartyName, otherPartyType,
    contractDate, breachDate, contractAmount, hasWrittenContract,
    contractDescription, keyTerms, whatWasPromised,
    breachDescription, discoveryDate, performedObligations, priorDemandSent,
    damageLineItems, consequentialDamages, costToCure, mitigationEfforts,
    availableEvidence, evidenceNotes, causesOfAction,
    yourName, yourAddress, yourCity, yourState, yourZip,
    county, courtType, causeNumber, filingMethod, draft, annotations, currentStep,
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
      throw new Error(err.error || 'Something went wrong. Let\u2019s try again.')
    }
  }

  async function generateDraft() {
    setGenerating(true)
    setGenError(null)
    try {
      const res = await fetch(`/api/cases/${caseId}/generate-filing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document_type: 'contract_petition', facts: buildFacts() }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Something went wrong. Let\u2019s try again.')
      }
      const data = await res.json()
      setDraft(data.draft)
      setAnnotations(data.annotations ?? [])
      setDraftPhase(true)
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'Something went wrong. Let\u2019s try again.')
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
      setGenError(err instanceof Error ? err.message : 'Something went wrong. Let\u2019s try again.')
    } finally {
      setConfirming(false)
    }
  }, [buildMetadata, caseId, router]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ---- canAdvance per step ---- */

  const canAdvance = useMemo(() => {
    const stepId = WIZARD_STEPS[currentStep]?.id
    switch (stepId) {
      case 'intake':
        return otherPartyName.trim() !== ''
      case 'contract_details':
        return contractDescription.trim().length >= 10 || whatWasPromised.trim().length >= 10
      case 'breach':
        return breachDescription.trim().length >= 10
      case 'damages':
        return grandTotal > 0
      case 'evidence':
        return true
      case 'legal_basis':
        return causesOfAction.length > 0
      case 'how_to_file':
        return filingMethod !== '' && yourName.trim() !== '' && county.trim() !== ''
      case 'review':
        return true
      default:
        return true
    }
  }, [
    currentStep, otherPartyName, contractDescription, whatWasPromised,
    breachDescription, grandTotal, causesOfAction, filingMethod, yourName, county,
  ])

  /* ---- Review step onEdit ---- */

  const handleReviewEdit = useCallback((stepId: string) => {
    const idx = WIZARD_STEPS.findIndex((s) => s.id === stepId)
    if (idx >= 0) setCurrentStep(idx)
  }, [])

  /* ---- Step rendering ---- */

  function renderStep() {
    const stepId = WIZARD_STEPS[currentStep]?.id
    switch (stepId) {
      case 'intake':
        return (
          <IntakeStep
            contractSubType={contractSubType} onContractSubTypeChange={setContractSubType}
            otherPartyName={otherPartyName} onOtherPartyNameChange={setOtherPartyName}
            otherPartyType={otherPartyType} onOtherPartyTypeChange={setOtherPartyType}
            contractDate={contractDate} onContractDateChange={setContractDate}
            breachDate={breachDate} onBreachDateChange={setBreachDate}
          />
        )
      case 'contract_details':
        return (
          <ContractDetailsStep
            contractDescription={contractDescription} onContractDescriptionChange={setContractDescription}
            keyTerms={keyTerms} onKeyTermsChange={setKeyTerms}
            whatWasPromised={whatWasPromised} onWhatWasPromisedChange={setWhatWasPromised}
            contractAmount={contractAmount} onContractAmountChange={setContractAmount}
            hasWrittenContract={hasWrittenContract} onHasWrittenContractChange={setHasWrittenContract}
          />
        )
      case 'breach':
        return (
          <BreachStep
            breachDescription={breachDescription} onBreachDescriptionChange={setBreachDescription}
            discoveryDate={discoveryDate} onDiscoveryDateChange={setDiscoveryDate}
            performedObligations={performedObligations} onPerformedObligationsChange={setPerformedObligations}
            priorDemandSent={priorDemandSent} onPriorDemandSentChange={setPriorDemandSent}
          />
        )
      case 'damages':
        return (
          <DamagesStep
            damageLineItems={damageLineItems}
            onAddLineItem={addLineItem}
            onRemoveLineItem={removeLineItem}
            onUpdateLineItem={updateLineItem}
            consequentialDamages={consequentialDamages} onConsequentialDamagesChange={setConsequentialDamages}
            costToCure={costToCure} onCostToCureChange={setCostToCure}
            mitigationEfforts={mitigationEfforts} onMitigationEffortsChange={setMitigationEfforts}
            lineItemTotal={lineItemTotal} grandTotal={grandTotal}
          />
        )
      case 'evidence':
        return (
          <EvidenceStep
            availableEvidence={availableEvidence} onToggleEvidence={toggleEvidence}
            evidenceNotes={evidenceNotes} onEvidenceNotesChange={setEvidenceNotes}
          />
        )
      case 'legal_basis':
        return (
          <LegalBasisStep
            causesOfAction={causesOfAction} onToggleCause={toggleCause}
          />
        )
      case 'how_to_file':
        return (
          <FilingStep
            yourName={yourName} onYourNameChange={setYourName}
            yourAddress={yourAddress} onYourAddressChange={setYourAddress}
            yourCity={yourCity} onYourCityChange={setYourCity}
            yourState={yourState} onYourStateChange={setYourState}
            yourZip={yourZip} onYourZipChange={setYourZip}
            county={county} onCountyChange={setCounty}
            courtType={courtType} onCourtTypeChange={setCourtType}
            causeNumber={causeNumber} onCauseNumberChange={setCauseNumber}
            filingMethod={filingMethod} onFilingMethodChange={setFilingMethod}
            grandTotal={grandTotal} state={caseData?.state}
          />
        )
      case 'review':
        return (
          <ReviewStep
            draftPhase={draftPhase} draft={draft} annotations={annotations}
            onDraftChange={setDraft} onRegenerate={generateDraft}
            generating={generating} acknowledged={acknowledged}
            onAcknowledgeChange={setAcknowledged}
            confirming={confirming} onFinalConfirm={handleFinalConfirm}
            genError={genError} onGenerateDraft={generateDraft}
            contractSubType={contractSubType} otherPartyName={otherPartyName}
            otherPartyType={otherPartyType} contractDate={contractDate}
            breachDate={breachDate} contractAmount={contractAmount}
            hasWrittenContract={hasWrittenContract}
            contractDescription={contractDescription}
            whatWasPromised={whatWasPromised}
            breachDescription={breachDescription} discoveryDate={discoveryDate}
            priorDemandSent={priorDemandSent}
            damageLineItems={damageLineItems}
            consequentialDamages={consequentialDamages}
            costToCure={costToCure} grandTotal={grandTotal}
            availableEvidence={availableEvidence} causesOfAction={causesOfAction}
            yourName={yourName} county={county} courtType={courtType}
            filingMethod={filingMethod} causeNumber={causeNumber}
            onEdit={handleReviewEdit}
          />
        )
      default:
        return null
    }
  }

  /* ---- Render ---- */

  return (
    <WizardShell
      caseId={caseId}
      title="Prepare Your Contract Petition"
      steps={WIZARD_STEPS}
      currentStep={currentStep}
      onStepChange={setCurrentStep}
      onSave={handleSave}
      onComplete={currentStep === WIZARD_STEPS.length - 1 ? handleComplete : undefined}
      canAdvance={canAdvance}
      totalEstimateMinutes={totalEstimateMinutes}
      completeButtonLabel={generating ? 'Generating...' : 'Generate My Petition'}
    >
      {renderStep()}
    </WizardShell>
  )
}
