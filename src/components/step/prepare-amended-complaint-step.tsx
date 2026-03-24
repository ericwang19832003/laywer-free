'use client'

import { useState } from 'react'
import { StepRunner } from './step-runner'
import { PartiesSection } from './filing/parties-section'
import { FactsSection } from './filing/facts-section'
import { ClaimsSection } from './filing/claims-section'
import { ReliefSection } from './filing/relief-section'
import { DraftViewer } from './filing/draft-viewer'

interface PrepareAmendedComplaintStepProps {
  caseId: string
  taskId: string
  existingMetadata?: Record<string, unknown>
  caseData: {
    court_type: string
    county: string | null
    dispute_type: string | null
    federal_case_number?: string | null
  }
}

type JurisdictionBasis = 'diversity' | 'federal_question' | 'both'

export function PrepareAmendedComplaintStep({
  caseId,
  taskId,
  existingMetadata,
  caseData,
}: PrepareAmendedComplaintStepProps) {
  const meta = existingMetadata ?? {}

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

  // Federal-specific state
  const [jurisdictionBasis, setJurisdictionBasis] = useState<JurisdictionBasis>(
    (meta.jurisdiction_basis as JurisdictionBasis) ?? 'diversity'
  )
  const [requestJuryTrial, setRequestJuryTrial] = useState((meta.request_jury_trial as boolean) ?? false)

  // Draft state
  const [draft, setDraft] = useState((meta.draft_text as string) ?? '')
  const [acknowledged, setAcknowledged] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState<string | null>(null)

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
      jurisdiction_basis: jurisdictionBasis,
      request_jury_trial: requestJuryTrial,
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
        body: JSON.stringify({
          document_type: 'amended_complaint',
          facts: {
            your_info: yourInfo,
            opposing_parties: opposingParties,
            description,
            federal_case_number: caseData.federal_case_number ?? '',
            jurisdiction_basis: jurisdictionBasis,
            amount_sought: amountSought ? parseFloat(amountSought) : undefined,
            claim_details: claimDetails || undefined,
            other_relief: otherRelief || undefined,
            request_jury_trial: requestJuryTrial,
          },
        }),
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
      title="Prepare Your First Amended Complaint"
      reassurance="We'll help you draft a First Amended Complaint for federal court. You can edit everything before filing."
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

        {/* Court info */}
        <div className="rounded-lg border border-warm-border bg-white p-4 space-y-1">
          <p className="text-xs font-medium text-warm-muted uppercase tracking-wide">Filing for</p>
          <p className="text-sm text-warm-text">
            Federal Court{caseData.county ? `, ${caseData.county}` : ''} — Plaintiff (Amended Complaint)
          </p>
        </div>

        {/* Jurisdiction basis */}
        <div>
          <h2 className="text-sm font-semibold text-warm-text mb-4">Jurisdiction</h2>
          <div className="space-y-3">
            <p className="text-sm text-warm-muted">Why does the federal court have jurisdiction?</p>
            {(['diversity', 'federal_question', 'both'] as const).map((basis) => (
              <button
                key={basis}
                type="button"
                onClick={() => setJurisdictionBasis(basis)}
                className={`w-full rounded-md border px-4 py-3 text-left transition-colors ${
                  jurisdictionBasis === basis
                    ? 'border-primary bg-primary/5'
                    : 'border-warm-border hover:border-warm-text'
                }`}
              >
                <p className={`text-sm font-medium ${
                  jurisdictionBasis === basis ? 'text-primary' : 'text-warm-text'
                }`}>
                  {basis === 'diversity'
                    ? 'Diversity of citizenship (28 U.S.C. § 1332)'
                    : basis === 'federal_question'
                      ? 'Federal question (28 U.S.C. § 1331)'
                      : 'Both diversity and federal question'}
                </p>
                <p className="text-xs text-warm-muted mt-0.5">
                  {basis === 'diversity'
                    ? 'Parties are from different states and the amount exceeds $75,000'
                    : basis === 'federal_question'
                      ? 'The case arises under federal law'
                      : 'Multiple jurisdictional bases apply'}
                </p>
              </button>
            ))}
          </div>
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

        {/* Jury demand */}
        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={requestJuryTrial}
              onChange={(e) => setRequestJuryTrial(e.target.checked)}
              className="h-4 w-4 rounded border-warm-border text-primary focus:ring-primary"
            />
            <span className="text-sm text-warm-text">Request a jury trial</span>
          </label>
        </div>
      </div>
    </StepRunner>
  )
}
