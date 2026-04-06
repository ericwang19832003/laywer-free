'use client'

import { useState } from 'react'
import { StepRunner } from '../step-runner'

interface LtIntakeStepProps {
  caseId: string
  taskId: string
  existingMetadata?: Record<string, unknown>
}

export function LtIntakeStep({
  caseId,
  taskId,
  existingMetadata,
}: LtIntakeStepProps) {
  const [county, setCounty] = useState(
    (existingMetadata?.county as string) || ''
  )
  const [propertyAddress, setPropertyAddress] = useState(
    (existingMetadata?.property_address as string) || ''
  )
  const [claimAmount, setClaimAmount] = useState(
    (existingMetadata?.claim_amount as string) || ''
  )
  const [description, setDescription] = useState(
    (existingMetadata?.description as string) || ''
  )

  const parsedAmount = parseFloat(claimAmount.replace(/[^0-9.]/g, '')) || 0

  function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value)
  }

  function getCourtRouting(): string {
    if (parsedAmount <= 0) return ''
    if (parsedAmount <= 20000) return 'JP Court'
    if (parsedAmount <= 200000) return 'County Court'
    return 'District Court'
  }

  function buildMetadata() {
    return {
      county: county.trim() || null,
      property_address: propertyAddress.trim() || null,
      claim_amount: parsedAmount || null,
      description: description.trim() || null,
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

  const reviewContent = (
    <dl className="space-y-4">
      <div>
        <dt className="text-sm font-medium text-warm-muted">Filing county</dt>
        <dd className="text-warm-text mt-0.5">
          {county.trim() || 'Not provided'}
        </dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-warm-muted">
          Property address
        </dt>
        <dd className="text-warm-text mt-0.5">
          {propertyAddress.trim() || 'Not provided'}
        </dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-warm-muted">Claim amount</dt>
        <dd className="text-warm-text mt-0.5">
          {parsedAmount > 0 ? formatCurrency(parsedAmount) : 'Not provided'}
          {parsedAmount > 0 && (
            <span className="text-warm-muted ml-2">
              ({getCourtRouting()})
            </span>
          )}
        </dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-warm-muted">
          Description of situation
        </dt>
        <dd className="text-warm-text mt-0.5">
          {description.trim() || 'Not provided'}
        </dd>
      </div>
    </dl>
  )

  return (
    <StepRunner
      caseId={caseId}
      taskId={taskId}
      title="Landlord-Tenant Case Information"
      reassurance="This helps us tailor the process to your landlord-tenant matter. You can skip anything you're unsure about."
      onConfirm={handleConfirm}
      onSave={handleSave}
      reviewContent={reviewContent}
    >
      <div className="space-y-5">
        {/* County */}
        <div className="space-y-2">
          <label
            htmlFor="lt-county"
            className="text-sm font-medium text-warm-text"
          >
            Which Texas county is the property in?
          </label>
          <input
            id="lt-county"
            type="text"
            placeholder="e.g. Travis, Harris, Dallas"
            value={county}
            onChange={(e) => setCounty(e.target.value)}
            className="flex h-9 w-full rounded-md border border-warm-border bg-transparent px-3 py-1 text-sm text-warm-text shadow-xs placeholder:text-warm-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo"
          />
          <p className="text-xs text-warm-muted">
            Landlord-tenant cases are filed in the county where the rental
            property is located.
          </p>
        </div>

        {/* Property address */}
        <div className="space-y-2">
          <label
            htmlFor="lt-address"
            className="text-sm font-medium text-warm-text"
          >
            What is the rental property address?
          </label>
          <input
            id="lt-address"
            type="text"
            placeholder="e.g. 123 Main St, Austin, TX 78701"
            value={propertyAddress}
            onChange={(e) => setPropertyAddress(e.target.value)}
            className="flex h-9 w-full rounded-md border border-warm-border bg-transparent px-3 py-1 text-sm text-warm-text shadow-xs placeholder:text-warm-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo"
          />
          <p className="text-xs text-warm-muted">
            The full street address of the rental property at issue.
          </p>
        </div>

        {/* Claim amount */}
        <div className="space-y-2">
          <label
            htmlFor="lt-amount"
            className="text-sm font-medium text-warm-text"
          >
            Approximately how much are you claiming?
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-warm-muted">
              $
            </span>
            <input
              id="lt-amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={claimAmount}
              onChange={(e) => setClaimAmount(e.target.value)}
              className="flex h-9 w-full rounded-md border border-warm-border bg-transparent pl-7 pr-3 py-1 text-sm text-warm-text shadow-xs placeholder:text-warm-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo"
            />
          </div>
          <p className="text-xs text-warm-muted">
            Include unpaid rent, damages, deposit withholding, or repair costs.
          </p>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label
            htmlFor="lt-description"
            className="text-sm font-medium text-warm-text"
          >
            In a few sentences, describe your situation
          </label>
          <textarea
            id="lt-description"
            placeholder="What happened? Are you a landlord or tenant? What is the dispute about?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="flex min-h-[60px] w-full rounded-md border border-warm-border bg-transparent px-3 py-2 text-sm text-warm-text shadow-xs placeholder:text-warm-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo"
          />
          <p className="text-xs text-warm-muted">
            This is just for your own reference. You can always update it later.
          </p>
        </div>

        {/* Court routing info callout */}
        <div className="rounded-md border border-calm-indigo/30 bg-calm-indigo/5 px-3 py-2">
          <p className="text-xs font-medium text-warm-text">
            Court routing for landlord-tenant cases
          </p>
          <p className="text-xs text-warm-muted mt-0.5">
            Eviction cases are always filed in JP Court. Other disputes depend on
            the amount: under $20K in JP Court, $20K&ndash;$200K in County
            Court, over $200K in District Court.
          </p>
        </div>
      </div>
    </StepRunner>
  )
}
