'use client'

interface DebtReviewStepProps {
  creditorName: string
  debtBuyerName: string
  originalAmount: number
  currentAmountClaimed: number
  accountLast4: string
  lastPaymentDate: string
  serviceDate: string
  answerDeadline: string
  selectedDefenses: string[]
  answerType: string
  yourName: string
  plaintiffName: string
  county: string
  courtType: string
  causeNumber: string
}

const DEFENSE_LABELS: Record<string, string> = {
  statute_of_limitations: 'Statute of Limitations',
  lack_of_standing: 'Lack of Standing',
  insufficient_evidence: 'Insufficient Evidence',
  wrong_amount: 'Wrong Amount / Already Paid',
  identity_theft: 'Identity Theft',
  fdcpa_violations: 'FDCPA Violations',
  improper_service: 'Improper Service',
  general_denial: 'General Denial',
}

function formatCourtType(courtType: string): string {
  switch (courtType) {
    case 'jp':
      return 'Justice Court'
    case 'county':
      return 'County Court'
    case 'district':
      return 'District Court'
    default:
      return courtType || 'Not specified'
  }
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  })
}

function ReviewField({
  label,
  value,
}: {
  label: string
  value: string | undefined | null
}) {
  return (
    <div>
      <dt className="text-xs text-warm-muted">{label}</dt>
      <dd className="text-sm text-warm-text mt-0.5">
        {value || <span className="italic text-warm-muted">Not provided</span>}
      </dd>
    </div>
  )
}

function SectionCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-warm-border bg-warm-bg/30 p-4">
      <h3 className="text-sm font-semibold text-warm-text mb-3">{title}</h3>
      {children}
    </div>
  )
}

export function DebtReviewStep({
  creditorName,
  debtBuyerName,
  originalAmount,
  currentAmountClaimed,
  accountLast4,
  lastPaymentDate,
  serviceDate,
  answerDeadline,
  selectedDefenses,
  answerType,
  yourName,
  plaintiffName,
  county,
  courtType,
  causeNumber,
}: DebtReviewStepProps) {
  // SOL status calculation
  const daysSinceLastPayment = lastPaymentDate
    ? Math.floor(
        (Date.now() - new Date(lastPaymentDate).getTime()) / (1000 * 60 * 60 * 24)
      )
    : null
  const solYears = 4
  const solDays = solYears * 365

  let solStatusLabel = 'Unknown'
  if (daysSinceLastPayment !== null) {
    solStatusLabel =
      daysSinceLastPayment > solDays ? 'Likely expired' : 'Likely active'
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-warm-muted">
        Review the information below before generating your court answer. Make sure
        everything is accurate.
      </p>

      {/* 1. Debt Information */}
      <SectionCard title="Debt Information">
        <dl className="space-y-3">
          <ReviewField label="Original creditor" value={creditorName} />
          {debtBuyerName && (
            <ReviewField label="Plaintiff / debt buyer" value={debtBuyerName} />
          )}
          <ReviewField label="Original amount" value={formatCurrency(originalAmount)} />
          <ReviewField
            label="Amount claimed"
            value={formatCurrency(currentAmountClaimed)}
          />
          {accountLast4 && (
            <ReviewField label="Account (last 4)" value={`****${accountLast4}`} />
          )}
        </dl>
      </SectionCard>

      {/* 2. Key Dates */}
      <SectionCard title="Key Dates">
        <dl className="space-y-3">
          <ReviewField label="Last payment" value={lastPaymentDate || undefined} />
          <ReviewField label="Service date" value={serviceDate || undefined} />
          <ReviewField label="Answer deadline" value={answerDeadline || undefined} />
          <div>
            <dt className="text-xs text-warm-muted">Statute of limitations status</dt>
            <dd className="text-sm text-warm-text mt-0.5">
              <span
                className={
                  daysSinceLastPayment !== null && daysSinceLastPayment > solDays
                    ? 'text-green-700 font-medium'
                    : daysSinceLastPayment !== null
                      ? 'text-amber-700 font-medium'
                      : 'text-warm-muted italic'
                }
              >
                {solStatusLabel}
              </span>
            </dd>
          </div>
        </dl>
      </SectionCard>

      {/* 3. Your Defenses */}
      <SectionCard title="Your Defenses">
        {selectedDefenses.length > 0 ? (
          <ul className="space-y-1">
            {selectedDefenses.map((key) => (
              <li key={key} className="text-sm text-warm-text flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-calm-indigo shrink-0" />
                {DEFENSE_LABELS[key] || key}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-warm-muted italic">No defenses selected</p>
        )}
      </SectionCard>

      {/* 4. Answer Type */}
      <SectionCard title="Answer Type">
        <p className="text-sm text-warm-text">
          {answerType === 'general_denial'
            ? 'General Denial with Affirmative Defenses'
            : answerType === 'specific_answer'
              ? 'Specific Answer'
              : 'Not selected'}
        </p>
      </SectionCard>

      {/* 5. Parties */}
      <SectionCard title="Parties">
        <dl className="space-y-3">
          <ReviewField label="Defendant (you)" value={yourName} />
          <ReviewField label="Plaintiff" value={plaintiffName} />
        </dl>
      </SectionCard>

      {/* 6. Court */}
      <SectionCard title="Court">
        <dl className="space-y-3">
          <ReviewField label="County" value={county} />
          <ReviewField label="Court type" value={formatCourtType(courtType)} />
          <ReviewField label="Cause number" value={causeNumber || undefined} />
        </dl>
      </SectionCard>
    </div>
  )
}
