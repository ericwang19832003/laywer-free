'use client'

import { useState } from 'react'
import { StepRunner } from '../step-runner'

interface BizB2bIntakeStepProps {
  caseId: string
  taskId: string
  existingMetadata?: Record<string, unknown>
}

export function BizB2bIntakeStep({
  caseId,
  taskId,
  existingMetadata,
}: BizB2bIntakeStepProps) {
  const [county, setCounty] = useState(
    (existingMetadata?.county as string) || ''
  )
  const [otherBusinessName, setOtherBusinessName] = useState(
    (existingMetadata?.other_business_name as string) || ''
  )
  const [contractType, setContractType] = useState(
    (existingMetadata?.contract_type as string) || 'service'
  )
  const [contractDate, setContractDate] = useState(
    (existingMetadata?.contract_date as string) || ''
  )
  const [contractAmount, setContractAmount] = useState(
    (existingMetadata?.contract_amount as string) || ''
  )
  const [hasWrittenContract, setHasWrittenContract] = useState(
    (existingMetadata?.has_written_contract as boolean) || false
  )
  const [specificDisputeType, setSpecificDisputeType] = useState(
    (existingMetadata?.specific_dispute_type as string) || 'vendor_service'
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

  const parsedContractAmount = parseFloat(contractAmount.replace(/[^0-9.]/g, '')) || 0
  const parsedDamagesSought = parseFloat(damagesSought.replace(/[^0-9.]/g, '')) || 0

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
      other_business_name: otherBusinessName.trim() || null,
      contract_type: contractType,
      contract_date: contractDate || null,
      contract_amount: parsedContractAmount || null,
      has_written_contract: hasWrittenContract,
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

  const contractTypeLabels: Record<string, string> = {
    service: 'Service agreement',
    vendor: 'Vendor/supplier',
    licensing: 'Licensing',
    distribution: 'Distribution',
    other: 'Other',
  }

  const disputeTypeLabels: Record<string, string> = {
    vendor_service: 'Vendor or service dispute',
    ip_trade_secret: 'IP or trade secret',
    unfair_competition: 'Unfair competition',
    breach_of_contract: 'Breach of contract',
  }

  const caseStageLabels: Record<string, string> = {
    start: 'Just getting started',
    demand_sent: 'Already sent a demand letter',
    filed: 'Already filed with the court',
    served: 'Already served the other party',
    in_litigation: 'In active litigation',
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
        <dt className="text-sm font-medium text-warm-muted">Other business</dt>
        <dd className="text-warm-text mt-0.5">
          {otherBusinessName.trim() || 'Not provided'}
        </dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-warm-muted">Contract type</dt>
        <dd className="text-warm-text mt-0.5">
          {contractTypeLabels[contractType] || contractType}
        </dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-warm-muted">Contract date</dt>
        <dd className="text-warm-text mt-0.5">
          {contractDate || 'Not provided'}
        </dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-warm-muted">Contract value</dt>
        <dd className="text-warm-text mt-0.5">
          {parsedContractAmount > 0 ? formatCurrency(parsedContractAmount) : 'Not provided'}
        </dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-warm-muted">Written contract</dt>
        <dd className="text-warm-text mt-0.5">
          {hasWrittenContract ? 'Yes' : 'No'}
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
      title="Tell Us About Your Business Dispute"
      reassurance="Understanding your business situation helps us protect your interests effectively."
      onConfirm={handleConfirm}
      onSave={handleSave}
      reviewContent={reviewContent}
    >
      <div className="space-y-5">
        {/* Where are you in your case? */}
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
              { value: 'in_litigation', label: 'In active litigation', desc: 'The case is already in litigation.' },
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
                  name="b2b-case-stage"
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
            htmlFor="b2b-county"
            className="text-sm font-medium text-warm-text"
          >
            What county is the dispute related to?
          </label>
          <input
            id="b2b-county"
            type="text"
            placeholder="e.g. Travis, Harris, Dallas"
            value={county}
            onChange={(e) => setCounty(e.target.value)}
            className="flex h-9 w-full rounded-md border border-warm-border bg-transparent px-3 py-1 text-sm text-warm-text shadow-xs placeholder:text-warm-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo"
          />
          <p className="text-xs text-warm-muted">
            Business disputes are typically filed in the county where the contract was performed.
          </p>
        </div>

        {/* Other Business Name */}
        <div className="space-y-2">
          <label
            htmlFor="b2b-other-business"
            className="text-sm font-medium text-warm-text"
          >
            What is the other business&apos;s name?
          </label>
          <input
            id="b2b-other-business"
            type="text"
            placeholder="e.g. Acme Corp, XYZ Services LLC"
            value={otherBusinessName}
            onChange={(e) => setOtherBusinessName(e.target.value)}
            className="flex h-9 w-full rounded-md border border-warm-border bg-transparent px-3 py-1 text-sm text-warm-text shadow-xs placeholder:text-warm-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo"
          />
        </div>

        {/* Contract Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-warm-text">
            What type of contract or agreement?
          </label>
          <div className="space-y-2">
            {[
              { value: 'service', label: 'Service agreement', desc: 'A contract for services between businesses.' },
              { value: 'vendor', label: 'Vendor/supplier', desc: 'A vendor or supplier agreement.' },
              { value: 'licensing', label: 'Licensing', desc: 'A licensing or intellectual property agreement.' },
              { value: 'distribution', label: 'Distribution', desc: 'A distribution or reseller agreement.' },
              { value: 'other', label: 'Other', desc: 'Another type of business agreement.' },
            ].map((option) => (
              <label
                key={option.value}
                className={`flex items-start gap-3 cursor-pointer rounded-lg border p-3 transition-colors ${
                  contractType === option.value
                    ? 'border-calm-indigo bg-calm-indigo/5'
                    : 'border-warm-border hover:bg-warm-bg/50'
                }`}
              >
                <input
                  type="radio"
                  name="b2b-contract-type"
                  value={option.value}
                  checked={contractType === option.value}
                  onChange={() => setContractType(option.value)}
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

        {/* Contract Date */}
        <div className="space-y-2">
          <label
            htmlFor="b2b-contract-date"
            className="text-sm font-medium text-warm-text"
          >
            When was the contract signed?
          </label>
          <input
            id="b2b-contract-date"
            type="date"
            value={contractDate}
            onChange={(e) => setContractDate(e.target.value)}
            className="flex h-9 w-full rounded-md border border-warm-border bg-transparent px-3 py-1 text-sm text-warm-text shadow-xs placeholder:text-warm-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo"
          />
          <p className="text-xs text-warm-muted">
            The date the contract or agreement was executed.
          </p>
        </div>

        {/* Contract Amount */}
        <div className="space-y-2">
          <label
            htmlFor="b2b-contract-amount"
            className="text-sm font-medium text-warm-text"
          >
            What is the total contract value?
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-warm-muted">
              $
            </span>
            <input
              id="b2b-contract-amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={contractAmount}
              onChange={(e) => setContractAmount(e.target.value)}
              className="flex h-9 w-full rounded-md border border-warm-border bg-transparent pl-7 pr-3 py-1 text-sm text-warm-text shadow-xs placeholder:text-warm-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo"
            />
          </div>
          <p className="text-xs text-warm-muted">
            This helps determine the appropriate court and filing fees.
          </p>
        </div>

        {/* Has Written Contract */}
        <div className="space-y-2">
          <label className="flex items-start gap-3 cursor-pointer rounded-lg border border-warm-border p-3 transition-colors hover:bg-warm-bg/50">
            <input
              type="checkbox"
              checked={hasWrittenContract}
              onChange={(e) => setHasWrittenContract(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-warm-border text-calm-indigo focus:ring-calm-indigo"
            />
            <div>
              <span className="text-sm text-warm-text">
                Do you have a written contract?
              </span>
              <p className="text-xs text-warm-muted mt-0.5">
                A signed written agreement between the businesses.
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
              { value: 'vendor_service', label: 'Vendor or service dispute', desc: 'Issues with a vendor or service provider.' },
              { value: 'ip_trade_secret', label: 'IP or trade secret', desc: 'Intellectual property theft or trade secret misappropriation.' },
              { value: 'unfair_competition', label: 'Unfair competition', desc: 'Unfair business practices or competition.' },
              { value: 'breach_of_contract', label: 'Breach of contract', desc: 'The other party failed to fulfill contract obligations.' },
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
                  name="b2b-dispute-type"
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
            htmlFor="b2b-description"
            className="text-sm font-medium text-warm-text"
          >
            Briefly describe the dispute
          </label>
          <textarea
            id="b2b-description"
            placeholder="What happened? What terms were violated? What have you tried so far?"
            value={disputeDescription}
            onChange={(e) => setDisputeDescription(e.target.value)}
            rows={4}
            className="flex min-h-[60px] w-full rounded-md border border-warm-border bg-transparent px-3 py-2 text-sm text-warm-text shadow-xs placeholder:text-warm-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo"
          />
          <p className="text-xs text-warm-muted">
            Include details about contract breaches, failed deliverables, unpaid invoices, or other concerns.
          </p>
        </div>

        {/* Damages Sought */}
        <div className="space-y-2">
          <label
            htmlFor="b2b-damages"
            className="text-sm font-medium text-warm-text"
          >
            How much are you seeking in damages?
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-warm-muted">
              $
            </span>
            <input
              id="b2b-damages"
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
            Include lost revenue, additional costs incurred, or other monetary losses.
          </p>
        </div>
      </div>
    </StepRunner>
  )
}
