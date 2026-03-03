'use client'

import { useState } from 'react'
import { StepRunner } from '../step-runner'

interface SmallClaimsIntakeStepProps {
  caseId: string
  taskId: string
  existingMetadata?: Record<string, unknown>
}

export function SmallClaimsIntakeStep({
  caseId,
  taskId,
  existingMetadata,
}: SmallClaimsIntakeStepProps) {
  const [county, setCounty] = useState(
    (existingMetadata?.county as string) || ''
  )
  const [claimAmount, setClaimAmount] = useState(
    (existingMetadata?.claim_amount as string) || ''
  )
  const [description, setDescription] = useState(
    (existingMetadata?.description as string) || ''
  )
  const [defendantIsBusiness, setDefendantIsBusiness] = useState(
    (existingMetadata?.defendant_is_business as boolean) || false
  )

  const parsedAmount = parseFloat(claimAmount.replace(/[^0-9.]/g, '')) || 0
  const exceedsLimit = parsedAmount > 20000

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
      claim_amount: parsedAmount || null,
      description: description.trim() || null,
      defendant_is_business: defendantIsBusiness,
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
        <dt className="text-sm font-medium text-warm-muted">Claim amount</dt>
        <dd className="text-warm-text mt-0.5">
          {parsedAmount > 0 ? formatCurrency(parsedAmount) : 'Not provided'}
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
      <div>
        <dt className="text-sm font-medium text-warm-muted">Defendant type</dt>
        <dd className="text-warm-text mt-0.5">
          {defendantIsBusiness ? 'Business' : 'Individual'}
        </dd>
      </div>
    </dl>
  )

  return (
    <StepRunner
      caseId={caseId}
      taskId={taskId}
      title="Small Claims Case Information"
      reassurance="This helps us tailor the process to your small claims matter. You can skip anything you're unsure about."
      onConfirm={handleConfirm}
      onSave={handleSave}
      reviewContent={reviewContent}
    >
      <div className="space-y-5">
        {/* County */}
        <div className="space-y-2">
          <label
            htmlFor="sc-county"
            className="text-sm font-medium text-warm-text"
          >
            Which Texas county do you live in?
          </label>
          <input
            id="sc-county"
            type="text"
            placeholder="e.g. Travis, Harris, Dallas"
            value={county}
            onChange={(e) => setCounty(e.target.value)}
            className="flex h-9 w-full rounded-md border border-warm-border bg-transparent px-3 py-1 text-sm text-warm-text shadow-xs placeholder:text-warm-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo"
          />
          <p className="text-xs text-warm-muted">
            You typically file in the county where the defendant lives or where
            the transaction occurred.
          </p>
        </div>

        {/* Claim amount */}
        <div className="space-y-2">
          <label
            htmlFor="sc-amount"
            className="text-sm font-medium text-warm-text"
          >
            Approximately how much are you claiming?
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-warm-muted">
              $
            </span>
            <input
              id="sc-amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={claimAmount}
              onChange={(e) => setClaimAmount(e.target.value)}
              className="flex h-9 w-full rounded-md border border-warm-border bg-transparent pl-7 pr-3 py-1 text-sm text-warm-text shadow-xs placeholder:text-warm-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo"
            />
          </div>
          {exceedsLimit && (
            <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2">
              <p className="text-xs font-medium text-amber-800">
                This exceeds the $20,000 small claims limit
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                Texas small claims court handles cases up to $20,000. Claims
                above this amount must be filed in a higher court.
              </p>
            </div>
          )}
          <p className="text-xs text-warm-muted">
            Include damages, unpaid amounts, or costs you want to recover.
          </p>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label
            htmlFor="sc-description"
            className="text-sm font-medium text-warm-text"
          >
            In a few sentences, describe your situation
          </label>
          <textarea
            id="sc-description"
            placeholder="What happened? Who is involved? What are you owed?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="flex min-h-[60px] w-full rounded-md border border-warm-border bg-transparent px-3 py-2 text-sm text-warm-text shadow-xs placeholder:text-warm-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo"
          />
          <p className="text-xs text-warm-muted">
            This is just for your own reference. You can always update it later.
          </p>
        </div>

        {/* Defendant is business */}
        <div className="space-y-2">
          <label className="flex items-start gap-3 cursor-pointer rounded-lg border border-warm-border p-3 transition-colors hover:bg-warm-bg/50">
            <input
              type="checkbox"
              checked={defendantIsBusiness}
              onChange={(e) => setDefendantIsBusiness(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-warm-border text-calm-indigo focus:ring-calm-indigo"
            />
            <span className="text-sm text-warm-text">
              The defendant is a business (not an individual)
            </span>
          </label>
          <p className="text-xs text-warm-muted">
            This affects how you serve the lawsuit and who you name in the
            petition.
          </p>
        </div>
      </div>
    </StepRunner>
  )
}
