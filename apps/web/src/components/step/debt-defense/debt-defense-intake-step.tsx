'use client'

import { useState } from 'react'
import { StepRunner } from '../step-runner'

interface DebtDefenseIntakeStepProps {
  caseId: string
  taskId: string
  existingMetadata?: Record<string, unknown>
}

export function DebtDefenseIntakeStep({
  caseId,
  taskId,
  existingMetadata,
}: DebtDefenseIntakeStepProps) {
  const meta = existingMetadata ?? {}

  const [creditorName, setCreditorName] = useState(
    (meta.creditor_name as string) ?? ''
  )
  const [debtBuyerName, setDebtBuyerName] = useState(
    (meta.debt_buyer_name as string) ?? ''
  )
  const [originalAmount, setOriginalAmount] = useState(
    (meta.original_amount as string) ?? ''
  )
  const [currentAmountClaimed, setCurrentAmountClaimed] = useState(
    (meta.current_amount_claimed as string) ?? ''
  )
  const [accountLast4, setAccountLast4] = useState(
    (meta.account_last4 as string) ?? ''
  )
  const [lastPaymentDate, setLastPaymentDate] = useState(
    (meta.last_payment_date as string) ?? ''
  )
  const [accountOpenDate, setAccountOpenDate] = useState(
    (meta.account_open_date as string) ?? ''
  )
  const [accountDefaultDate, setAccountDefaultDate] = useState(
    (meta.account_default_date as string) ?? ''
  )
  const [serviceDate, setServiceDate] = useState(
    (meta.service_date as string) ?? ''
  )
  const [answerDeadline, setAnswerDeadline] = useState(
    (meta.answer_deadline as string) ?? ''
  )
  const [description, setDescription] = useState(
    (meta.description as string) ?? ''
  )

  // ── SOL calculator ──

  const TEXAS_SOL_DAYS = 1461 // 4 years

  function getSolInfo(): {
    expired: boolean
    daysSince: number
    years: number
    remainingDays: number
  } | null {
    if (!lastPaymentDate) return null
    const lastDate = new Date(lastPaymentDate)
    if (isNaN(lastDate.getTime())) return null
    const now = new Date()
    const diffMs = now.getTime() - lastDate.getTime()
    const daysSince = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const years = Math.floor(daysSince / 365)
    const remainingDays = daysSince - years * 365
    return {
      expired: daysSince > TEXAS_SOL_DAYS,
      daysSince,
      years,
      remainingDays,
    }
  }

  const solInfo = getSolInfo()

  // ── Currency formatting ──

  function formatCurrency(value: string): string {
    const num = parseFloat(value)
    if (isNaN(num) || num <= 0) return ''
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(num)
  }

  // ── Metadata ──

  function buildMetadata() {
    return {
      creditor_name: creditorName.trim() || null,
      debt_buyer_name: debtBuyerName.trim() || null,
      original_amount: parseFloat(originalAmount) || null,
      current_amount_claimed: parseFloat(currentAmountClaimed) || null,
      account_last4: accountLast4.trim() || null,
      last_payment_date: lastPaymentDate || null,
      account_open_date: accountOpenDate || null,
      account_default_date: accountDefaultDate || null,
      service_date: serviceDate || null,
      answer_deadline: answerDeadline || null,
      description: description.trim() || null,
    }
  }

  // ── API calls ──

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

  // ── Review content ──

  const reviewContent = (
    <dl className="space-y-4">
      <div>
        <dt className="text-sm font-medium text-warm-muted">
          Original creditor
        </dt>
        <dd className="text-warm-text mt-0.5">
          {creditorName.trim() || 'Not provided'}
        </dd>
      </div>
      {debtBuyerName.trim() && (
        <div>
          <dt className="text-sm font-medium text-warm-muted">
            Debt buyer / collection agency
          </dt>
          <dd className="text-warm-text mt-0.5">{debtBuyerName.trim()}</dd>
        </div>
      )}
      <div>
        <dt className="text-sm font-medium text-warm-muted">
          Original amount
        </dt>
        <dd className="text-warm-text mt-0.5">
          {formatCurrency(originalAmount) || 'Not provided'}
        </dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-warm-muted">
          Currently claimed
        </dt>
        <dd className="text-warm-text mt-0.5">
          {formatCurrency(currentAmountClaimed) || 'Not provided'}
        </dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-warm-muted">
          Account last 4 digits
        </dt>
        <dd className="text-warm-text mt-0.5">
          {accountLast4.trim() || 'Not provided'}
        </dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-warm-muted">
          Last payment date
        </dt>
        <dd className="text-warm-text mt-0.5">
          {lastPaymentDate || 'Not provided'}
          {solInfo && (
            <span className="text-warm-muted ml-2">
              ({solInfo.expired ? 'SOL likely expired' : 'SOL has not expired'})
            </span>
          )}
        </dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-warm-muted">Service date</dt>
        <dd className="text-warm-text mt-0.5">
          {serviceDate || 'Not provided'}
        </dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-warm-muted">
          Answer deadline
        </dt>
        <dd className="text-warm-text mt-0.5">
          {answerDeadline || 'Not provided'}
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

  // ── Shared input class ──

  const inputClass =
    'flex h-9 w-full rounded-md border border-warm-border bg-transparent px-3 py-1 text-sm text-warm-text shadow-xs placeholder:text-warm-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo'

  return (
    <StepRunner
      caseId={caseId}
      taskId={taskId}
      title="Tell Us About the Debt"
      reassurance="This helps us understand your situation and prepare the strongest defense. You can skip anything you're unsure about."
      onConfirm={handleConfirm}
      onSave={handleSave}
      reviewContent={reviewContent}
    >
      <div className="space-y-5">
        {/* Creditor name */}
        <div className="space-y-2">
          <label
            htmlFor="dd-creditor-name"
            className="text-sm font-medium text-warm-text"
          >
            Who is the original creditor?
          </label>
          <input
            id="dd-creditor-name"
            type="text"
            placeholder="e.g. Chase Bank, Capital One, Discover"
            value={creditorName}
            onChange={(e) => setCreditorName(e.target.value)}
            className={inputClass}
          />
          <p className="text-xs text-warm-muted">
            The company you originally owed the debt to.
          </p>
        </div>

        {/* Debt buyer name */}
        <div className="space-y-2">
          <label
            htmlFor="dd-debt-buyer"
            className="text-sm font-medium text-warm-text"
          >
            Is a different company suing you? (debt buyer / collection agency)
          </label>
          <input
            id="dd-debt-buyer"
            type="text"
            placeholder="e.g. Midland Credit Management, Portfolio Recovery"
            value={debtBuyerName}
            onChange={(e) => setDebtBuyerName(e.target.value)}
            className={inputClass}
          />
          <p className="text-xs text-warm-muted">
            Leave blank if the original creditor is the one suing you.
          </p>
        </div>

        {/* Original amount */}
        <div className="space-y-2">
          <label
            htmlFor="dd-original-amount"
            className="text-sm font-medium text-warm-text"
          >
            What was the original debt amount?
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-warm-muted">
              $
            </span>
            <input
              id="dd-original-amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={originalAmount}
              onChange={(e) => setOriginalAmount(e.target.value)}
              className="flex h-9 w-full rounded-md border border-warm-border bg-transparent pl-7 pr-3 py-1 text-sm text-warm-text shadow-xs placeholder:text-warm-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo"
            />
          </div>
          <p className="text-xs text-warm-muted">
            The amount you originally owed before interest or fees.
          </p>
        </div>

        {/* Current amount claimed */}
        <div className="space-y-2">
          <label
            htmlFor="dd-current-amount"
            className="text-sm font-medium text-warm-text"
          >
            How much are they claiming now?
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-warm-muted">
              $
            </span>
            <input
              id="dd-current-amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={currentAmountClaimed}
              onChange={(e) => setCurrentAmountClaimed(e.target.value)}
              className="flex h-9 w-full rounded-md border border-warm-border bg-transparent pl-7 pr-3 py-1 text-sm text-warm-text shadow-xs placeholder:text-warm-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo"
            />
          </div>
          <p className="text-xs text-warm-muted">
            The total amount in the lawsuit, including interest and fees.
          </p>
        </div>

        {/* Account last 4 */}
        <div className="space-y-2">
          <label
            htmlFor="dd-account-last4"
            className="text-sm font-medium text-warm-text"
          >
            Last 4 digits of account number (if known)
          </label>
          <input
            id="dd-account-last4"
            type="text"
            maxLength={4}
            placeholder="e.g. 1234"
            value={accountLast4}
            onChange={(e) =>
              setAccountLast4(e.target.value.replace(/\D/g, '').slice(0, 4))
            }
            className={inputClass}
          />
          <p className="text-xs text-warm-muted">
            This helps match the debt to your records.
          </p>
        </div>

        {/* Last payment date */}
        <div className="space-y-2">
          <label
            htmlFor="dd-last-payment"
            className="text-sm font-medium text-warm-text"
          >
            When did you last make a payment?
          </label>
          <input
            id="dd-last-payment"
            type="date"
            value={lastPaymentDate}
            onChange={(e) => setLastPaymentDate(e.target.value)}
            className={inputClass}
          />
          <p className="text-xs text-warm-muted">
            This is used to calculate the statute of limitations.
          </p>
        </div>

        {/* SOL calculator callout */}
        {solInfo && solInfo.expired && (
          <div className="rounded-md border border-green-500/30 bg-green-50 px-3 py-2">
            <p className="text-xs font-medium text-green-800">
              The 4-year statute of limitations may have expired.
            </p>
            <p className="text-xs text-green-700 mt-0.5">
              It has been {solInfo.years} years and {solInfo.remainingDays} days
              since your last payment. This could be a strong defense.
            </p>
          </div>
        )}
        {solInfo && !solInfo.expired && (
          <div className="rounded-md border border-warm-border bg-warm-bg px-3 py-2">
            <p className="text-xs font-medium text-warm-text">
              The statute of limitations has not expired.
            </p>
            <p className="text-xs text-warm-muted mt-0.5">
              {solInfo.years} years, {solInfo.remainingDays} days since last
              payment ({TEXAS_SOL_DAYS - solInfo.daysSince} days remaining).
            </p>
          </div>
        )}

        {/* Account open date */}
        <div className="space-y-2">
          <label
            htmlFor="dd-account-open"
            className="text-sm font-medium text-warm-text"
          >
            When was the account opened?
          </label>
          <input
            id="dd-account-open"
            type="date"
            value={accountOpenDate}
            onChange={(e) => setAccountOpenDate(e.target.value)}
            className={inputClass}
          />
          <p className="text-xs text-warm-muted">
            The approximate date you opened the account.
          </p>
        </div>

        {/* Account default date */}
        <div className="space-y-2">
          <label
            htmlFor="dd-account-default"
            className="text-sm font-medium text-warm-text"
          >
            When was the account marked as in default?
          </label>
          <input
            id="dd-account-default"
            type="date"
            value={accountDefaultDate}
            onChange={(e) => setAccountDefaultDate(e.target.value)}
            className={inputClass}
          />
          <p className="text-xs text-warm-muted">
            The date the creditor reported the account as charged off or in
            default.
          </p>
        </div>

        {/* Service date */}
        <div className="space-y-2">
          <label
            htmlFor="dd-service-date"
            className="text-sm font-medium text-warm-text"
          >
            When were you served with the lawsuit?
          </label>
          <input
            id="dd-service-date"
            type="date"
            value={serviceDate}
            onChange={(e) => setServiceDate(e.target.value)}
            className={inputClass}
          />
          <p className="text-xs text-warm-muted">
            The date you received the court papers.
          </p>
        </div>

        {/* Answer deadline */}
        <div className="space-y-2">
          <label
            htmlFor="dd-answer-deadline"
            className="text-sm font-medium text-warm-text"
          >
            What is your deadline to respond?
          </label>
          <input
            id="dd-answer-deadline"
            type="date"
            value={answerDeadline}
            onChange={(e) => setAnswerDeadline(e.target.value)}
            className={inputClass}
          />
          <p className="text-xs text-warm-muted">
            In Texas, you typically have until 10:00 AM on the first Monday
            after 20 days from service.
          </p>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label
            htmlFor="dd-description"
            className="text-sm font-medium text-warm-text"
          >
            Describe your situation in a few sentences
          </label>
          <textarea
            id="dd-description"
            placeholder="What happened? Do you recognize this debt? Have you been contacted by a collector?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="flex min-h-[60px] w-full rounded-md border border-warm-border bg-transparent px-3 py-2 text-sm text-warm-text shadow-xs placeholder:text-warm-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo"
          />
          <p className="text-xs text-warm-muted">
            This is for your own reference. You can always update it later.
          </p>
        </div>

        {/* Texas SOL info callout */}
        <div className="rounded-md border border-calm-indigo/30 bg-calm-indigo/5 px-3 py-2">
          <p className="text-xs font-medium text-warm-text">
            Texas statute of limitations for debt
          </p>
          <p className="text-xs text-warm-muted mt-0.5">
            In Texas, the statute of limitations for most consumer debts is 4
            years from the date of last payment or default (Tex. Civ. Prac.
            &amp; Rem. Code &sect; 16.004). If the SOL has expired, the creditor
            can still sue, but you have a strong affirmative defense.
          </p>
        </div>
      </div>
    </StepRunner>
  )
}
