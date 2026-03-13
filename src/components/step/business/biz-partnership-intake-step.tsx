'use client'

import { useState } from 'react'
import { StepRunner } from '../step-runner'

interface BizPartnershipIntakeStepProps {
  caseId: string
  taskId: string
  existingMetadata?: Record<string, unknown>
}

export function BizPartnershipIntakeStep({
  caseId,
  taskId,
  existingMetadata,
}: BizPartnershipIntakeStepProps) {
  const [county, setCounty] = useState(
    (existingMetadata?.county as string) || ''
  )
  const [businessName, setBusinessName] = useState(
    (existingMetadata?.business_name as string) || ''
  )
  const [businessType, setBusinessType] = useState(
    (existingMetadata?.business_type as string) || 'partnership'
  )
  const [partnerNames, setPartnerNames] = useState(
    (existingMetadata?.partner_names as string) || ''
  )
  const [ownershipPercentages, setOwnershipPercentages] = useState(
    (existingMetadata?.ownership_percentages as string) || ''
  )
  const [formationState, setFormationState] = useState(
    (existingMetadata?.formation_state as string) || 'Texas'
  )
  const [hasOperatingAgreement, setHasOperatingAgreement] = useState(
    (existingMetadata?.has_operating_agreement as boolean) || false
  )
  const [specificDisputeType, setSpecificDisputeType] = useState(
    (existingMetadata?.specific_dispute_type as string) || 'breach_fiduciary'
  )
  const [disputeDescription, setDisputeDescription] = useState(
    (existingMetadata?.dispute_description as string) || ''
  )
  const [damagesSought, setDamagesSought] = useState(
    (existingMetadata?.damages_sought as string) || ''
  )
  const [caseStage, setCaseStage] = useState(
    (existingMetadata?.guided_answers as Record<string, string>)?.case_stage || 'start'
  )

  const parsedDamagesSought = parseFloat(String(damagesSought).replace(/[^0-9.]/g, '')) || 0

  function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value)
  }

  function buildMetadata() {
    return {
      county: county.trim() || null,
      business_name: businessName.trim() || null,
      business_type: businessType,
      partner_names: partnerNames.trim() || null,
      ownership_percentages: ownershipPercentages.trim() || null,
      formation_state: formationState.trim() || null,
      has_operating_agreement: hasOperatingAgreement,
      specific_dispute_type: specificDisputeType,
      dispute_description: disputeDescription.trim() || null,
      damages_sought: parsedDamagesSought || null,
      guided_answers: { case_stage: caseStage },
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

  async function handleConfirm() {
    const metadata = buildMetadata()
    await patchTask('in_progress', metadata)
    await patchTask('completed')
  }

  async function handleSave() {
    const metadata = buildMetadata()
    await patchTask('in_progress', metadata)
  }

  const businessTypeLabels: Record<string, string> = {
    partnership: 'Partnership',
    llc: 'LLC',
    corporation: 'Corporation',
    other: 'Other',
  }

  const disputeTypeLabels: Record<string, string> = {
    breach_fiduciary: 'Breach of Fiduciary Duty',
    profit_loss: 'Profit / Loss Dispute',
    dissolution_buyout: 'Dissolution or Buyout',
    management_deadlock: 'Management Deadlock',
  }

  const caseStageLabels: Record<string, string> = {
    start: 'Just getting started',
    demand_sent: 'Already sent a demand letter',
    filed: 'Already filed with the court',
    served: 'Already served the other party',
    in_litigation: 'Already in litigation',
  }

  const reviewContent = (
    <dl className="space-y-4">
      <div>
        <dt className="text-sm font-medium text-warm-muted">Case stage</dt>
        <dd className="text-warm-text mt-0.5">
          {caseStageLabels[caseStage] || caseStage}
        </dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-warm-muted">Filing county</dt>
        <dd className="text-warm-text mt-0.5">
          {county.trim() || 'Not provided'}
        </dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-warm-muted">Business name</dt>
        <dd className="text-warm-text mt-0.5">
          {businessName.trim() || 'Not provided'}
        </dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-warm-muted">Business type</dt>
        <dd className="text-warm-text mt-0.5">
          {businessTypeLabels[businessType] || businessType}
        </dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-warm-muted">Partners / members</dt>
        <dd className="text-warm-text mt-0.5">
          {partnerNames.trim() || 'Not provided'}
        </dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-warm-muted">Ownership percentages</dt>
        <dd className="text-warm-text mt-0.5">
          {ownershipPercentages.trim() || 'Not provided'}
        </dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-warm-muted">Formation state</dt>
        <dd className="text-warm-text mt-0.5">
          {formationState.trim() || 'Not provided'}
        </dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-warm-muted">Operating agreement</dt>
        <dd className="text-warm-text mt-0.5">
          {hasOperatingAgreement ? 'Yes' : 'No'}
        </dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-warm-muted">Main issue</dt>
        <dd className="text-warm-text mt-0.5">
          {disputeTypeLabels[specificDisputeType] || specificDisputeType}
        </dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-warm-muted">
          Description of dispute
        </dt>
        <dd className="text-warm-text mt-0.5">
          {disputeDescription.trim() || 'Not provided'}
        </dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-warm-muted">Damages sought</dt>
        <dd className="text-warm-text mt-0.5">
          {parsedDamagesSought > 0 ? formatCurrency(parsedDamagesSought) : 'Not provided'}
        </dd>
      </div>
    </dl>
  )

  return (
    <StepRunner
      caseId={caseId}
      taskId={taskId}
      title="Tell Us About Your Partnership Dispute"
      reassurance="Understanding the details of your business dispute helps us build the strongest strategy for your case."
      onConfirm={handleConfirm}
      onSave={handleSave}
      reviewContent={reviewContent}
    >
      <div className="space-y-5">
        {/* Case Stage */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-warm-text">
            How far along are you?
          </label>
          <p className="text-xs text-warm-muted">
            This helps us skip steps you&apos;ve already completed.
          </p>
          <div className="space-y-2">
            {[
              { value: 'start', label: 'Just getting started', desc: 'I haven\'t taken any action yet.' },
              { value: 'demand_sent', label: 'Already sent a demand letter', desc: 'I\'ve sent a demand letter and need to file.' },
              { value: 'filed', label: 'Already filed with the court', desc: 'I\'ve filed my business dispute case.' },
              { value: 'served', label: 'Already served the other party', desc: 'I\'ve served the other party and am waiting for their response.' },
              { value: 'in_litigation', label: 'Already in litigation', desc: 'The case is actively being litigated.' },
            ].map((option) => (
              <label
                key={option.value}
                className={`flex items-start gap-3 cursor-pointer rounded-lg border p-3 transition-colors ${
                  caseStage === option.value
                    ? 'border-calm-indigo bg-calm-indigo/5'
                    : 'border-warm-border hover:bg-warm-bg/50'
                }`}
              >
                <input
                  type="radio"
                  name="biz-case-stage"
                  value={option.value}
                  checked={caseStage === option.value}
                  onChange={() => setCaseStage(option.value)}
                  className="mt-0.5 h-4 w-4 shrink-0 border-warm-border text-calm-indigo focus:ring-calm-indigo"
                />
                <div>
                  <span className="text-sm font-medium text-warm-text">{option.label}</span>
                  <p className="text-xs text-warm-muted mt-0.5">{option.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* County */}
        <div className="space-y-2">
          <label
            htmlFor="biz-county"
            className="text-sm font-medium text-warm-text"
          >
            What county is the business located in?
          </label>
          <input
            id="biz-county"
            type="text"
            placeholder="e.g. Travis, Harris, Dallas"
            value={county}
            onChange={(e) => setCounty(e.target.value)}
            className="flex h-9 w-full rounded-md border border-warm-border bg-transparent px-3 py-1 text-sm text-warm-text shadow-xs placeholder:text-warm-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo"
          />
          <p className="text-xs text-warm-muted">
            Business disputes are typically filed in the county where the business is located.
          </p>
        </div>

        {/* Business Name */}
        <div className="space-y-2">
          <label
            htmlFor="biz-name"
            className="text-sm font-medium text-warm-text"
          >
            What is the name of the partnership or LLC?
          </label>
          <input
            id="biz-name"
            type="text"
            placeholder="e.g. Smith & Jones Partners, LLC"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="flex h-9 w-full rounded-md border border-warm-border bg-transparent px-3 py-1 text-sm text-warm-text shadow-xs placeholder:text-warm-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo"
          />
        </div>

        {/* Business Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-warm-text">
            What type of business entity?
          </label>
          <div className="space-y-2">
            {[
              { value: 'partnership', label: 'Partnership', desc: 'A general or limited partnership.' },
              { value: 'llc', label: 'LLC', desc: 'A limited liability company.' },
              { value: 'corporation', label: 'Corporation', desc: 'A corporation (S-Corp, C-Corp, etc.).' },
              { value: 'other', label: 'Other', desc: 'Another type of business entity.' },
            ].map((option) => (
              <label
                key={option.value}
                className={`flex items-start gap-3 cursor-pointer rounded-lg border p-3 transition-colors ${
                  businessType === option.value
                    ? 'border-calm-indigo bg-calm-indigo/5'
                    : 'border-warm-border hover:bg-warm-bg/50'
                }`}
              >
                <input
                  type="radio"
                  name="biz-business-type"
                  value={option.value}
                  checked={businessType === option.value}
                  onChange={() => setBusinessType(option.value)}
                  className="mt-0.5 h-4 w-4 shrink-0 border-warm-border text-calm-indigo focus:ring-calm-indigo"
                />
                <div>
                  <span className="text-sm font-medium text-warm-text">{option.label}</span>
                  <p className="text-xs text-warm-muted mt-0.5">{option.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Partner Names */}
        <div className="space-y-2">
          <label
            htmlFor="biz-partner-names"
            className="text-sm font-medium text-warm-text"
          >
            Who are the other partners or members involved?
          </label>
          <input
            id="biz-partner-names"
            type="text"
            placeholder="e.g. John Smith, Jane Doe"
            value={partnerNames}
            onChange={(e) => setPartnerNames(e.target.value)}
            className="flex h-9 w-full rounded-md border border-warm-border bg-transparent px-3 py-1 text-sm text-warm-text shadow-xs placeholder:text-warm-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo"
          />
          <p className="text-xs text-warm-muted">
            List the names of other partners or LLC members involved in the dispute.
          </p>
        </div>

        {/* Ownership Percentages */}
        <div className="space-y-2">
          <label
            htmlFor="biz-ownership"
            className="text-sm font-medium text-warm-text"
          >
            What are the ownership percentages?
          </label>
          <input
            id="biz-ownership"
            type="text"
            placeholder="e.g. 50/50, 60/40, 33/33/34"
            value={ownershipPercentages}
            onChange={(e) => setOwnershipPercentages(e.target.value)}
            className="flex h-9 w-full rounded-md border border-warm-border bg-transparent px-3 py-1 text-sm text-warm-text shadow-xs placeholder:text-warm-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo"
          />
          <p className="text-xs text-warm-muted">
            Ownership splits are important for determining voting rights and profit distribution.
          </p>
        </div>

        {/* Formation State */}
        <div className="space-y-2">
          <label
            htmlFor="biz-formation-state"
            className="text-sm font-medium text-warm-text"
          >
            What state was the business formed in?
          </label>
          <input
            id="biz-formation-state"
            type="text"
            placeholder="e.g. Texas"
            value={formationState}
            onChange={(e) => setFormationState(e.target.value)}
            className="flex h-9 w-full rounded-md border border-warm-border bg-transparent px-3 py-1 text-sm text-warm-text shadow-xs placeholder:text-warm-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo"
          />
          <p className="text-xs text-warm-muted">
            The formation state determines which business laws apply to your dispute.
          </p>
        </div>

        {/* Has Operating Agreement */}
        <div className="space-y-2">
          <label className="flex items-start gap-3 cursor-pointer rounded-lg border border-warm-border p-3 transition-colors hover:bg-warm-bg/50">
            <input
              type="checkbox"
              checked={hasOperatingAgreement}
              onChange={(e) => setHasOperatingAgreement(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-warm-border text-calm-indigo focus:ring-calm-indigo"
            />
            <div>
              <span className="text-sm text-warm-text">
                I have a written partnership or operating agreement
              </span>
              <p className="text-xs text-warm-muted mt-0.5">
                A formal agreement outlining the rights, responsibilities, and profit-sharing among partners or members.
              </p>
            </div>
          </label>
        </div>

        {/* Specific Dispute Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-warm-text">
            What is the main issue?
          </label>
          <div className="space-y-2">
            {[
              { value: 'breach_fiduciary', label: 'Breach of Fiduciary Duty', desc: 'A partner or member violated their duty of loyalty or care.' },
              { value: 'profit_loss', label: 'Profit / Loss Dispute', desc: 'Disagreement over how profits or losses are shared.' },
              { value: 'dissolution_buyout', label: 'Dissolution or Buyout', desc: 'One party wants to dissolve the business or buy out another.' },
              { value: 'management_deadlock', label: 'Management Deadlock', desc: 'Partners cannot agree on key business decisions.' },
            ].map((option) => (
              <label
                key={option.value}
                className={`flex items-start gap-3 cursor-pointer rounded-lg border p-3 transition-colors ${
                  specificDisputeType === option.value
                    ? 'border-calm-indigo bg-calm-indigo/5'
                    : 'border-warm-border hover:bg-warm-bg/50'
                }`}
              >
                <input
                  type="radio"
                  name="biz-dispute-type"
                  value={option.value}
                  checked={specificDisputeType === option.value}
                  onChange={() => setSpecificDisputeType(option.value)}
                  className="mt-0.5 h-4 w-4 shrink-0 border-warm-border text-calm-indigo focus:ring-calm-indigo"
                />
                <div>
                  <span className="text-sm font-medium text-warm-text">{option.label}</span>
                  <p className="text-xs text-warm-muted mt-0.5">{option.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Dispute Description */}
        <div className="space-y-2">
          <label
            htmlFor="biz-description"
            className="text-sm font-medium text-warm-text"
          >
            Briefly describe the dispute
          </label>
          <textarea
            id="biz-description"
            placeholder="What happened? What agreements were violated? What have you tried so far?"
            value={disputeDescription}
            onChange={(e) => setDisputeDescription(e.target.value)}
            rows={4}
            className="flex min-h-[60px] w-full rounded-md border border-warm-border bg-transparent px-3 py-2 text-sm text-warm-text shadow-xs placeholder:text-warm-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo"
          />
          <p className="text-xs text-warm-muted">
            Include details about breached agreements, financial disputes, management conflicts, or other concerns.
          </p>
        </div>

        {/* Damages Sought */}
        <div className="space-y-2">
          <label
            htmlFor="biz-damages"
            className="text-sm font-medium text-warm-text"
          >
            How much are you seeking in damages?
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-warm-muted">
              $
            </span>
            <input
              id="biz-damages"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={damagesSought}
              onChange={(e) => setDamagesSought(e.target.value)}
              className="flex h-9 w-full rounded-md border border-warm-border bg-transparent pl-7 pr-3 py-1 text-sm text-warm-text shadow-xs placeholder:text-warm-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo"
            />
          </div>
          <p className="text-xs text-warm-muted">
            Include lost profits, misappropriated funds, buyout value, or other monetary losses.
          </p>
        </div>
      </div>
    </StepRunner>
  )
}
