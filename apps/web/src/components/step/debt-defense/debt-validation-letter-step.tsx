'use client'

import { useState } from 'react'
import { StepRunner } from '../step-runner'
import { AnnotatedDraftViewer } from '../filing/annotated-draft-viewer'
import type { DraftAnnotation } from '../filing/annotated-draft-viewer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface DebtValidationLetterStepProps {
  caseId: string
  taskId: string
  existingMetadata?: Record<string, unknown>
  debtDefenseDetails: {
    creditor_name?: string
    debt_buyer_name?: string
    original_amount?: number
    current_amount_claimed?: number
    account_number_last4?: string
    service_date?: string
  } | null
  caseData: { county: string | null }
}

export function DebtValidationLetterStep({
  caseId,
  taskId,
  existingMetadata,
  debtDefenseDetails,
  caseData,
}: DebtValidationLetterStepProps) {
  const meta = existingMetadata ?? {}

  // Section 1: Your information
  const [yourName, setYourName] = useState(
    (meta.your_name as string) ?? ''
  )
  const [yourAddress, setYourAddress] = useState(
    (meta.your_address as string) ?? ''
  )

  // Section 2: Creditor information (pre-filled from debtDefenseDetails)
  const [creditorName, setCreditorName] = useState(
    (meta.creditor_name as string) ?? debtDefenseDetails?.creditor_name ?? ''
  )
  const [debtBuyerName, setDebtBuyerName] = useState(
    (meta.debt_buyer_name as string) ?? debtDefenseDetails?.debt_buyer_name ?? ''
  )

  // Section 3: Account details (pre-filled from debtDefenseDetails)
  const [accountLast4, setAccountLast4] = useState(
    (meta.account_last4 as string) ?? debtDefenseDetails?.account_number_last4 ?? ''
  )
  const [originalAmount, setOriginalAmount] = useState(
    (meta.original_amount as string) ??
      (debtDefenseDetails?.original_amount?.toString() ?? '')
  )
  const [currentAmountClaimed, setCurrentAmountClaimed] = useState(
    (meta.current_amount_claimed as string) ??
      (debtDefenseDetails?.current_amount_claimed?.toString() ?? '')
  )

  // Section 4: Service date
  const [serviceDate, setServiceDate] = useState(
    (meta.service_date as string) ?? debtDefenseDetails?.service_date ?? ''
  )

  // Draft state
  const [draft, setDraft] = useState((meta.draft_text as string) ?? '')
  const [annotations, setAnnotations] = useState<DraftAnnotation[]>([])
  const [acknowledged, setAcknowledged] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState<string | null>(null)

  // ── API calls ──

  async function generateDraft() {
    setGenerating(true)
    setGenError(null)
    try {
      const res = await fetch(`/api/cases/${caseId}/generate-filing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_type: 'debt_validation_letter',
          facts: {
            your_info: { full_name: yourName, address: yourAddress },
            creditor_name: creditorName,
            debt_buyer_name: debtBuyerName || undefined,
            account_last4: accountLast4 || undefined,
            original_amount: parseFloat(originalAmount) || 0,
            current_amount_claimed: parseFloat(currentAmountClaimed) || 0,
            service_date: serviceDate || undefined,
            county: caseData.county || undefined,
          },
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(
          data.error || 'Failed to generate validation letter'
        )
      }
      const data = await res.json()
      setDraft(data.draft)
      setAnnotations(data.annotations ?? [])
    } catch (err) {
      setGenError(
        err instanceof Error
          ? err.message
          : 'Failed to generate validation letter'
      )
      throw err // Re-throw so StepRunner knows onBeforeReview failed
    } finally {
      setGenerating(false)
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

  function buildMetadata() {
    return {
      your_name: yourName,
      your_address: yourAddress,
      creditor_name: creditorName,
      debt_buyer_name: debtBuyerName || null,
      account_last4: accountLast4 || null,
      original_amount: parseFloat(originalAmount) || null,
      current_amount_claimed: parseFloat(currentAmountClaimed) || null,
      service_date: serviceDate || null,
      draft_text: draft || null,
      final_text: draft || null,
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

  // ── Review content ──

  const reviewContent = (
    <div className="space-y-4">
      {genError && (
        <div className="rounded-lg border border-calm-amber bg-calm-amber/5 p-3">
          <p className="text-sm text-warm-text">{genError}</p>
        </div>
      )}
      {draft ? (
        <AnnotatedDraftViewer
          draft={draft}
          annotations={annotations}
          onDraftChange={setDraft}
          onRegenerate={generateDraft}
          regenerating={generating}
          acknowledged={acknowledged}
          onAcknowledgeChange={setAcknowledged}
          documentTitle="Debt Validation Letter"
        />
      ) : (
        <p className="text-sm text-warm-muted">
          Generating your validation letter...
        </p>
      )}
    </div>
  )

  return (
    <StepRunner
      caseId={caseId}
      taskId={taskId}
      title="Prepare Your Debt Validation Letter"
      reassurance="A debt validation letter demands proof that the creditor has the right to collect this debt. Under the FDCPA, they must respond within 30 days."
      onConfirm={handleConfirm}
      onSave={handleSave}
      onBeforeReview={generateDraft}
      reviewContent={reviewContent}
      reviewButtonLabel="Generate Letter &rarr;"
    >
      <div className="space-y-8">
        {genError && (
          <div className="rounded-lg border border-calm-amber bg-calm-amber/5 p-3">
            <p className="text-sm text-warm-text">{genError}</p>
            <p className="text-xs text-warm-muted mt-1">
              Review your information below and try again.
            </p>
          </div>
        )}

        {/* Context cards from debtDefenseDetails */}
        {debtDefenseDetails && (
          <div className="rounded-lg border border-warm-border bg-white p-4 space-y-1">
            <p className="text-xs font-medium text-warm-muted uppercase tracking-wide">
              Case Details
            </p>
            <p className="text-sm text-warm-text">
              {debtDefenseDetails.creditor_name ?? 'Unknown creditor'}
              {debtDefenseDetails.debt_buyer_name &&
                ` (collected by ${debtDefenseDetails.debt_buyer_name})`}
            </p>
            {debtDefenseDetails.original_amount != null && (
              <p className="text-xs text-warm-muted">
                Original amount: $
                {debtDefenseDetails.original_amount.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            )}
          </div>
        )}

        {/* Section 1: Your Information */}
        <div>
          <h2 className="text-sm font-semibold text-warm-text mb-4">
            1. Your Information
          </h2>
          <div className="space-y-3">
            <div>
              <Label htmlFor="dvl-your-name">Full legal name *</Label>
              <Input
                id="dvl-your-name"
                value={yourName}
                onChange={(e) => setYourName(e.target.value)}
                placeholder="e.g. John Michael Doe"
              />
            </div>
            <div>
              <Label htmlFor="dvl-your-address">Mailing address *</Label>
              <Input
                id="dvl-your-address"
                value={yourAddress}
                onChange={(e) => setYourAddress(e.target.value)}
                placeholder="123 Main St, City, TX 75001"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Creditor Information */}
        <div>
          <h2 className="text-sm font-semibold text-warm-text mb-4">
            2. Creditor Information
          </h2>
          <div className="space-y-3">
            <div>
              <Label htmlFor="dvl-creditor-name">Original creditor *</Label>
              <Input
                id="dvl-creditor-name"
                value={creditorName}
                onChange={(e) => setCreditorName(e.target.value)}
                placeholder="e.g. Chase Bank, Capital One"
              />
            </div>
            <div>
              <Label htmlFor="dvl-debt-buyer">
                Debt buyer / collection agency
              </Label>
              <Input
                id="dvl-debt-buyer"
                value={debtBuyerName}
                onChange={(e) => setDebtBuyerName(e.target.value)}
                placeholder="e.g. Midland Credit Management"
              />
              <p className="text-xs text-warm-muted mt-1">
                Leave blank if the original creditor is the one contacting you.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Account Details */}
        <div>
          <h2 className="text-sm font-semibold text-warm-text mb-4">
            3. Account Details
          </h2>
          <div className="space-y-3">
            <div>
              <Label htmlFor="dvl-account-last4">
                Last 4 digits of account number
              </Label>
              <Input
                id="dvl-account-last4"
                value={accountLast4}
                onChange={(e) =>
                  setAccountLast4(
                    e.target.value.replace(/\D/g, '').slice(0, 4)
                  )
                }
                maxLength={4}
                placeholder="e.g. 1234"
              />
            </div>
            <div>
              <Label htmlFor="dvl-original-amount">Original amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-warm-muted">
                  $
                </span>
                <Input
                  id="dvl-original-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={originalAmount}
                  onChange={(e) => setOriginalAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-7"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="dvl-current-amount">
                Currently claimed amount
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-warm-muted">
                  $
                </span>
                <Input
                  id="dvl-current-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={currentAmountClaimed}
                  onChange={(e) => setCurrentAmountClaimed(e.target.value)}
                  placeholder="0.00"
                  className="pl-7"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Service Date */}
        <div>
          <h2 className="text-sm font-semibold text-warm-text mb-4">
            4. Service Date (Optional)
          </h2>
          <div className="space-y-2">
            <Label htmlFor="dvl-service-date">
              When were you first contacted about this debt?
            </Label>
            <Input
              id="dvl-service-date"
              type="date"
              value={serviceDate}
              onChange={(e) => setServiceDate(e.target.value)}
            />
            <p className="text-xs text-warm-muted">
              The date you received the first letter or were served with court
              papers. You have 30 days from first contact to request validation.
            </p>
          </div>
        </div>

        {/* FDCPA info callout */}
        <div className="rounded-md border border-calm-indigo/30 bg-calm-indigo/5 px-3 py-2">
          <p className="text-xs font-medium text-warm-text">
            What is a debt validation letter?
          </p>
          <p className="text-xs text-warm-muted mt-0.5">
            Under the Fair Debt Collection Practices Act (FDCPA), 15 U.S.C.
            &sect; 1692g, you have the right to request verification of a debt
            within 30 days of first contact. The collector must provide proof of
            the debt, the original creditor, and their authority to collect.
            During validation, collection activity must cease.
          </p>
        </div>
      </div>
    </StepRunner>
  )
}
