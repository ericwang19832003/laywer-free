'use client'

import { useState } from 'react'
import { StepRunner } from './step-runner'
import { PartiesSection } from './filing/parties-section'
import { FactsSection } from './filing/facts-section'
import { ClaimsSection } from './filing/claims-section'
import { ReliefSection } from './filing/relief-section'
import { DefendantSection } from './filing/defendant-section'
import { DraftViewer } from './filing/draft-viewer'
import type { FilingFacts } from '@/lib/schemas/filing'

interface PrepareFilingStepProps {
  caseId: string
  taskId: string
  existingMetadata?: Record<string, unknown>
  caseData: {
    role: string
    court_type: string
    county: string | null
    dispute_type: string | null
  }
}

export function PrepareFilingStep({
  caseId,
  taskId,
  existingMetadata,
  caseData,
}: PrepareFilingStepProps) {
  const meta = existingMetadata ?? {}
  const isDefendant = caseData.role === 'defendant'

  // Party state
  const [yourInfo, setYourInfo] = useState(
    (meta.your_info as { full_name: string; address?: string; city?: string; state?: string; zip?: string }) ?? { full_name: '' }
  )
  const [opposingParties, setOpposingParties] = useState<{ full_name: string; address?: string }[]>(
    (meta.opposing_parties as { full_name: string; address?: string }[]) ?? [{ full_name: '' }]
  )

  // Facts state
  const [description, setDescription] = useState((meta.description as string) ?? '')
  const [incidentDate, setIncidentDate] = useState((meta.incident_date as string) ?? '')
  const [incidentLocation, setIncidentLocation] = useState((meta.incident_location as string) ?? '')

  // Claims state
  const [claimDetails, setClaimDetails] = useState((meta.claim_details as string) ?? '')

  // Relief state
  const [amountSought, setAmountSought] = useState((meta.amount_sought as string) ?? '')
  const [otherRelief, setOtherRelief] = useState((meta.other_relief as string) ?? '')
  const [requestAttorneyFees, setRequestAttorneyFees] = useState((meta.request_attorney_fees as boolean) ?? false)
  const [requestCourtCosts, setRequestCourtCosts] = useState((meta.request_court_costs as boolean) ?? true)

  // Defendant state
  const [isGeneralDenial, setIsGeneralDenial] = useState((meta.is_general_denial as boolean) ?? true)
  const [specificDefenses, setSpecificDefenses] = useState((meta.specific_defenses as string) ?? '')
  const [hasCounterclaim, setHasCounterclaim] = useState((meta.has_counterclaim as boolean) ?? false)
  const [counterclaimDetails, setCounterclaimDetails] = useState((meta.counterclaim_details as string) ?? '')

  // Draft state
  const [draft, setDraft] = useState((meta.draft_text as string) ?? '')
  const [acknowledged, setAcknowledged] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState<string | null>(null)

  function buildFacts(): FilingFacts {
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
      is_general_denial: isDefendant ? isGeneralDenial : undefined,
      specific_defenses: isDefendant ? specificDefenses || undefined : undefined,
      has_counterclaim: isDefendant ? hasCounterclaim : undefined,
      counterclaim_details: isDefendant && hasCounterclaim ? counterclaimDetails || undefined : undefined,
      role: caseData.role as 'plaintiff' | 'defendant',
      dispute_type: caseData.dispute_type ?? undefined,
    }
  }

  function buildMetadata() {
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
      is_general_denial: isGeneralDenial,
      specific_defenses: specificDefenses || null,
      has_counterclaim: hasCounterclaim,
      counterclaim_details: counterclaimDetails || null,
      draft_text: draft || null,
      final_text: draft || null,
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
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'Failed to generate document')
    } finally {
      setGenerating(false)
    }
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

  const title = isDefendant ? 'Prepare Your Answer' : 'Prepare Your Petition'
  const reassurance = isDefendant
    ? "We'll help you draft an answer to the petition. You can edit everything before filing."
    : "We'll help you draft your petition. You can edit everything before filing."

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
        <p className="text-sm text-warm-muted">Generating your draft...</p>
      )}
    </div>
  )

  return (
    <StepRunner
      caseId={caseId}
      taskId={taskId}
      title={title}
      reassurance={reassurance}
      onConfirm={handleConfirm}
      onSave={handleSave}
      onBeforeReview={generateDraft}
      reviewContent={reviewContent}
      reviewButtonLabel="Generate Draft →"
    >
      <div className="space-y-8">
        {genError && (
          <div className="rounded-lg border border-calm-amber bg-calm-amber/5 p-3">
            <p className="text-sm text-warm-text">{genError}</p>
            <p className="text-xs text-warm-muted mt-1">Review your information below and try again.</p>
          </div>
        )}

        {/* Court info summary */}
        <div className="rounded-lg border border-warm-border bg-white p-4 space-y-1">
          <p className="text-xs font-medium text-warm-muted uppercase tracking-wide">Filing for</p>
          <p className="text-sm text-warm-text">
            {caseData.court_type === 'jp' ? 'JP Court' : caseData.court_type === 'county' ? 'County Court' : caseData.court_type === 'district' ? 'District Court' : caseData.court_type === 'federal' ? 'Federal Court' : caseData.court_type}
            {caseData.county ? `, ${caseData.county}` : ''}
            {' — '}
            {isDefendant ? 'Defendant (Answer)' : 'Plaintiff (Petition)'}
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-warm-text mb-4">1. Parties</h2>
          <PartiesSection
            yourInfo={yourInfo}
            opposingParties={opposingParties}
            onYourInfoChange={setYourInfo}
            onOpposingPartiesChange={setOpposingParties}
          />
        </div>

        <div>
          <h2 className="text-sm font-semibold text-warm-text mb-4">2. Facts</h2>
          <FactsSection
            description={description}
            incidentDate={incidentDate}
            incidentLocation={incidentLocation}
            onDescriptionChange={setDescription}
            onIncidentDateChange={setIncidentDate}
            onIncidentLocationChange={setIncidentLocation}
          />
        </div>

        <div>
          <h2 className="text-sm font-semibold text-warm-text mb-4">3. Claims</h2>
          <ClaimsSection
            disputeType={caseData.dispute_type ?? 'other'}
            claimDetails={claimDetails}
            onClaimDetailsChange={setClaimDetails}
          />
        </div>

        <div>
          <h2 className="text-sm font-semibold text-warm-text mb-4">4. Relief Requested</h2>
          <ReliefSection
            amountSought={amountSought}
            otherRelief={otherRelief}
            requestAttorneyFees={requestAttorneyFees}
            requestCourtCosts={requestCourtCosts}
            onAmountChange={setAmountSought}
            onOtherReliefChange={setOtherRelief}
            onAttorneyFeesChange={setRequestAttorneyFees}
            onCourtCostsChange={setRequestCourtCosts}
          />
        </div>

        {isDefendant && (
          <div>
            <h2 className="text-sm font-semibold text-warm-text mb-4">5. Your Response</h2>
            <DefendantSection
              isGeneralDenial={isGeneralDenial}
              specificDefenses={specificDefenses}
              hasCounterclaim={hasCounterclaim}
              counterclaimDetails={counterclaimDetails}
              onGeneralDenialChange={setIsGeneralDenial}
              onDefensesChange={setSpecificDefenses}
              onCounterclaimChange={setHasCounterclaim}
              onCounterclaimDetailsChange={setCounterclaimDetails}
            />
          </div>
        )}
      </div>
    </StepRunner>
  )
}
