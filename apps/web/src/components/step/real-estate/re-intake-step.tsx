'use client'

import { useState } from 'react'
import { StepRunner } from '../step-runner'

interface REIntakeStepProps {
  caseId: string
  taskId: string
  existingMetadata?: Record<string, unknown>
}

export function REIntakeStep({
  caseId,
  taskId,
  existingMetadata,
}: REIntakeStepProps) {
  const [county, setCounty] = useState(
    (existingMetadata?.county as string) || ''
  )
  const [propertyAddress, setPropertyAddress] = useState(
    (existingMetadata?.property_address as string) || ''
  )
  const [propertyType, setPropertyType] = useState(
    (existingMetadata?.property_type as string) || 'residential'
  )
  const [otherPartyName, setOtherPartyName] = useState(
    (existingMetadata?.other_party_name as string) || ''
  )
  const [otherPartyRole, setOtherPartyRole] = useState(
    (existingMetadata?.other_party_role as string) || 'buyer'
  )
  const [disputeDescription, setDisputeDescription] = useState(
    (existingMetadata?.dispute_description as string) || ''
  )
  const [purchasePrice, setPurchasePrice] = useState(
    (existingMetadata?.purchase_price as string) || ''
  )
  const [damagesSought, setDamagesSought] = useState(
    (existingMetadata?.damages_sought as string) || ''
  )
  const [transactionDate, setTransactionDate] = useState(
    (existingMetadata?.transaction_date as string) || ''
  )
  const [hasPurchaseAgreement, setHasPurchaseAgreement] = useState(
    (existingMetadata?.has_purchase_agreement as boolean) || false
  )
  const [hasTitleInsurance, setHasTitleInsurance] = useState(
    (existingMetadata?.has_title_insurance as boolean) || false
  )
  const [hasInspectionReport, setHasInspectionReport] = useState(
    (existingMetadata?.has_inspection_report as boolean) || false
  )
  const [caseStage, setCaseStage] = useState(
    (existingMetadata?.guided_answers as Record<string, string>)?.case_stage || 'start'
  )

  const parsedPurchasePrice = parseFloat(purchasePrice.replace(/[^0-9.]/g, '')) || 0
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
      property_address: propertyAddress.trim() || null,
      property_type: propertyType,
      other_party_name: otherPartyName.trim() || null,
      other_party_role: otherPartyRole,
      dispute_description: disputeDescription.trim() || null,
      purchase_price: parsedPurchasePrice || null,
      damages_sought: parsedDamagesSought || null,
      transaction_date: transactionDate || null,
      has_purchase_agreement: hasPurchaseAgreement,
      has_title_insurance: hasTitleInsurance,
      has_inspection_report: hasInspectionReport,
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

  const propertyTypeLabels: Record<string, string> = {
    residential: 'Residential',
    commercial: 'Commercial',
    land: 'Land / Vacant Lot',
  }

  const roleLabels: Record<string, string> = {
    buyer: 'Buyer',
    seller: 'Seller',
    agent: 'Agent',
    title_company: 'Title Company',
    builder: 'Builder',
    other: 'Other',
  }

  const reviewContent = (
    <dl className="space-y-4">
      <div>
        <dt className="text-sm font-medium text-warm-muted">Case stage</dt>
        <dd className="text-warm-text mt-0.5">
          {caseStage === 'start' && 'Just getting started'}
          {caseStage === 'demand_sent' && 'Already sent a demand letter'}
          {caseStage === 'filed' && 'Already filed with the court'}
          {caseStage === 'served' && 'Already served the other party'}
        </dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-warm-muted">Filing county</dt>
        <dd className="text-warm-text mt-0.5">
          {county.trim() || 'Not provided'}
        </dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-warm-muted">Property address</dt>
        <dd className="text-warm-text mt-0.5">
          {propertyAddress.trim() || 'Not provided'}
        </dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-warm-muted">Property type</dt>
        <dd className="text-warm-text mt-0.5">
          {propertyTypeLabels[propertyType] || propertyType}
        </dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-warm-muted">Transaction date</dt>
        <dd className="text-warm-text mt-0.5">
          {transactionDate || 'Not provided'}
        </dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-warm-muted">Other party</dt>
        <dd className="text-warm-text mt-0.5">
          {otherPartyName.trim() || 'Not provided'}
          {otherPartyName.trim() && ` (${roleLabels[otherPartyRole] || otherPartyRole})`}
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
        <dt className="text-sm font-medium text-warm-muted">Purchase price</dt>
        <dd className="text-warm-text mt-0.5">
          {parsedPurchasePrice > 0 ? formatCurrency(parsedPurchasePrice) : 'Not provided'}
        </dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-warm-muted">Damages sought</dt>
        <dd className="text-warm-text mt-0.5">
          {parsedDamagesSought > 0 ? formatCurrency(parsedDamagesSought) : 'Not provided'}
        </dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-warm-muted">Supporting documents</dt>
        <dd className="text-warm-text mt-0.5">
          {hasPurchaseAgreement && 'Has purchase agreement'}
          {hasPurchaseAgreement && hasTitleInsurance && ' · '}
          {hasTitleInsurance && 'Has title insurance'}
          {(hasPurchaseAgreement || hasTitleInsurance) && hasInspectionReport && ' · '}
          {hasInspectionReport && 'Has inspection report'}
          {!hasPurchaseAgreement && !hasTitleInsurance && !hasInspectionReport && 'None indicated'}
        </dd>
      </div>
    </dl>
  )

  return (
    <StepRunner
      caseId={caseId}
      taskId={taskId}
      title="Tell Us About Your Real Estate Dispute"
      reassurance="Understanding your real estate situation helps us protect your rights effectively."
      onConfirm={handleConfirm}
      onSave={handleSave}
      reviewContent={reviewContent}
    >
      <div className="space-y-5">
        {/* Where are you in your case? */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-warm-text">
            Where are you in this case?
          </label>
          <p className="text-xs text-warm-muted">
            This helps us skip steps you&apos;ve already completed.
          </p>
          <div className="space-y-2">
            {[
              { value: 'start', label: 'Just getting started', desc: 'I haven\'t taken any action yet.' },
              { value: 'demand_sent', label: 'Already sent a demand letter', desc: 'I\'ve sent a demand letter and need to file.' },
              { value: 'filed', label: 'Already filed with the court', desc: 'I\'ve filed my real estate dispute case.' },
              { value: 'served', label: 'Already served the other party', desc: 'I\'ve served the other party and am waiting for their response.' },
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
                  name="re-case-stage"
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
            htmlFor="re-county"
            className="text-sm font-medium text-warm-text"
          >
            Which Texas county is the property in?
          </label>
          <input
            id="re-county"
            type="text"
            placeholder="e.g. Travis, Harris, Dallas"
            value={county}
            onChange={(e) => setCounty(e.target.value)}
            className="flex h-9 w-full rounded-md border border-warm-border bg-transparent px-3 py-1 text-sm text-warm-text shadow-xs placeholder:text-warm-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo"
          />
          <p className="text-xs text-warm-muted">
            Real estate disputes are typically filed in the county where the property is located.
          </p>
        </div>

        {/* Property Address */}
        <div className="space-y-2">
          <label
            htmlFor="re-address"
            className="text-sm font-medium text-warm-text"
          >
            Property address
          </label>
          <input
            id="re-address"
            type="text"
            placeholder="e.g. 1234 Main St, Austin, TX 78701"
            value={propertyAddress}
            onChange={(e) => setPropertyAddress(e.target.value)}
            className="flex h-9 w-full rounded-md border border-warm-border bg-transparent px-3 py-1 text-sm text-warm-text shadow-xs placeholder:text-warm-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo"
          />
          <p className="text-xs text-warm-muted">
            The full address of the property involved in the dispute.
          </p>
        </div>

        {/* Property Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-warm-text">
            Property type
          </label>
          <div className="space-y-2">
            {[
              { value: 'residential', label: 'Residential', desc: 'Home, condo, townhouse, or apartment.' },
              { value: 'commercial', label: 'Commercial', desc: 'Office, retail, warehouse, or industrial.' },
              { value: 'land', label: 'Land / Vacant Lot', desc: 'Undeveloped land, ranch, or farm.' },
            ].map((option) => (
              <label
                key={option.value}
                className={`flex items-start gap-3 cursor-pointer rounded-lg border p-3 transition-colors ${
                  propertyType === option.value
                    ? 'border-calm-indigo bg-calm-indigo/5'
                    : 'border-warm-border hover:bg-warm-bg/50'
                }`}
              >
                <input
                  type="radio"
                  name="re-property-type"
                  value={option.value}
                  checked={propertyType === option.value}
                  onChange={() => setPropertyType(option.value)}
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

        {/* Transaction Date */}
        <div className="space-y-2">
          <label
            htmlFor="re-transaction-date"
            className="text-sm font-medium text-warm-text"
          >
            Transaction date
          </label>
          <input
            id="re-transaction-date"
            type="date"
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
            className="flex h-9 w-full rounded-md border border-warm-border bg-transparent px-3 py-1 text-sm text-warm-text shadow-xs placeholder:text-warm-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo"
          />
          <p className="text-xs text-warm-muted">
            The date of the real estate transaction (closing date, contract date, etc.).
          </p>
        </div>

        {/* Other Party Name */}
        <div className="space-y-2">
          <label
            htmlFor="re-other-party"
            className="text-sm font-medium text-warm-text"
          >
            Other party&apos;s name
          </label>
          <input
            id="re-other-party"
            type="text"
            placeholder="e.g. John Smith or ABC Realty"
            value={otherPartyName}
            onChange={(e) => setOtherPartyName(e.target.value)}
            className="flex h-9 w-full rounded-md border border-warm-border bg-transparent px-3 py-1 text-sm text-warm-text shadow-xs placeholder:text-warm-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo"
          />
        </div>

        {/* Other Party Role */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-warm-text">
            The other party&apos;s role in the transaction
          </label>
          <div className="space-y-2">
            {[
              { value: 'buyer', label: 'Buyer', desc: 'The buyer of the property.' },
              { value: 'seller', label: 'Seller', desc: 'The seller of the property.' },
              { value: 'agent', label: 'Agent', desc: 'A real estate agent or broker.' },
              { value: 'title_company', label: 'Title Company', desc: 'The title or escrow company.' },
              { value: 'builder', label: 'Builder', desc: 'A builder or developer.' },
              { value: 'other', label: 'Other', desc: 'Another type of role.' },
            ].map((option) => (
              <label
                key={option.value}
                className={`flex items-start gap-3 cursor-pointer rounded-lg border p-3 transition-colors ${
                  otherPartyRole === option.value
                    ? 'border-calm-indigo bg-calm-indigo/5'
                    : 'border-warm-border hover:bg-warm-bg/50'
                }`}
              >
                <input
                  type="radio"
                  name="re-other-party-role"
                  value={option.value}
                  checked={otherPartyRole === option.value}
                  onChange={() => setOtherPartyRole(option.value)}
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
            htmlFor="re-description"
            className="text-sm font-medium text-warm-text"
          >
            Describe the real estate dispute
          </label>
          <textarea
            id="re-description"
            placeholder="What happened? What terms were violated? What have you tried so far?"
            value={disputeDescription}
            onChange={(e) => setDisputeDescription(e.target.value)}
            rows={4}
            className="flex min-h-[60px] w-full rounded-md border border-warm-border bg-transparent px-3 py-2 text-sm text-warm-text shadow-xs placeholder:text-warm-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo"
          />
          <p className="text-xs text-warm-muted">
            Include details about contract breaches, undisclosed defects, title issues, or other concerns.
          </p>
        </div>

        {/* Purchase Price */}
        <div className="space-y-2">
          <label
            htmlFor="re-purchase-price"
            className="text-sm font-medium text-warm-text"
          >
            Purchase price
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-warm-muted">
              $
            </span>
            <input
              id="re-purchase-price"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              className="flex h-9 w-full rounded-md border border-warm-border bg-transparent pl-7 pr-3 py-1 text-sm text-warm-text shadow-xs placeholder:text-warm-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo"
            />
          </div>
          <p className="text-xs text-warm-muted">
            This helps determine the appropriate court and filing fees.
          </p>
        </div>

        {/* Damages Sought */}
        <div className="space-y-2">
          <label
            htmlFor="re-damages"
            className="text-sm font-medium text-warm-text"
          >
            Damages you are seeking
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-warm-muted">
              $
            </span>
            <input
              id="re-damages"
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
            Include repair costs, price difference, lost deposits, or other monetary losses.
          </p>
        </div>

        {/* Has Purchase Agreement */}
        <div className="space-y-2">
          <label className="flex items-start gap-3 cursor-pointer rounded-lg border border-warm-border p-3 transition-colors hover:bg-warm-bg/50">
            <input
              type="checkbox"
              checked={hasPurchaseAgreement}
              onChange={(e) => setHasPurchaseAgreement(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-warm-border text-calm-indigo focus:ring-calm-indigo"
            />
            <div>
              <span className="text-sm text-warm-text">
                I have a purchase agreement
              </span>
              <p className="text-xs text-warm-muted mt-0.5">
                The contract or agreement for the real estate transaction.
              </p>
            </div>
          </label>
        </div>

        {/* Has Title Insurance */}
        <div className="space-y-2">
          <label className="flex items-start gap-3 cursor-pointer rounded-lg border border-warm-border p-3 transition-colors hover:bg-warm-bg/50">
            <input
              type="checkbox"
              checked={hasTitleInsurance}
              onChange={(e) => setHasTitleInsurance(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-warm-border text-calm-indigo focus:ring-calm-indigo"
            />
            <div>
              <span className="text-sm text-warm-text">
                I have title insurance
              </span>
              <p className="text-xs text-warm-muted mt-0.5">
                Title insurance may cover certain property defects and disputes.
              </p>
            </div>
          </label>
        </div>

        {/* Has Inspection Report */}
        <div className="space-y-2">
          <label className="flex items-start gap-3 cursor-pointer rounded-lg border border-warm-border p-3 transition-colors hover:bg-warm-bg/50">
            <input
              type="checkbox"
              checked={hasInspectionReport}
              onChange={(e) => setHasInspectionReport(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-warm-border text-calm-indigo focus:ring-calm-indigo"
            />
            <div>
              <span className="text-sm text-warm-text">
                I have an inspection report
              </span>
              <p className="text-xs text-warm-muted mt-0.5">
                A home inspection report detailing the property&apos;s condition.
              </p>
            </div>
          </label>
        </div>
      </div>
    </StepRunner>
  )
}
