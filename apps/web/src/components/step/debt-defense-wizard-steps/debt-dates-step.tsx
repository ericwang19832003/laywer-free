'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { HelpTooltip } from '@/components/ui/help-tooltip'

interface DebtDatesStepProps {
  accountOpenDate: string
  accountDefaultDate: string
  lastPaymentDate: string
  serviceDate: string
  answerDeadline: string
  onFieldChange: (field: string, value: string) => void
}

export function DebtDatesStep({
  accountOpenDate,
  accountDefaultDate,
  lastPaymentDate,
  serviceDate,
  answerDeadline,
  onFieldChange,
}: DebtDatesStepProps) {
  // SOL calculation
  const daysSinceLastPayment = lastPaymentDate
    ? Math.floor(
        (Date.now() - new Date(lastPaymentDate).getTime()) / (1000 * 60 * 60 * 24)
      )
    : null
  const solYears = 4 // Texas SOL for debt on open account
  const solDays = solYears * 365

  return (
    <div className="space-y-6">
      {/* Account opened */}
      <div>
        <Label htmlFor="account-open-date" className="text-sm font-medium text-warm-text">
          When was the account opened?
        </Label>
        <HelpTooltip label="Why does this matter?">
          <p>
            The account opening date helps establish the full timeline of the debt. It can
            also be relevant if there are questions about whether the debt is actually yours
            or if identity theft is involved.
          </p>
        </HelpTooltip>
        <Input
          id="account-open-date"
          type="date"
          value={accountOpenDate}
          onChange={(e) => onFieldChange('accountOpenDate', e.target.value)}
          className="mt-2"
        />
        <p className="text-xs text-warm-muted mt-1">Optional</p>
      </div>

      {/* Account default date */}
      <div>
        <Label
          htmlFor="account-default-date"
          className="text-sm font-medium text-warm-text"
        >
          When did the account go into default?
        </Label>
        <HelpTooltip label="Why does this matter?">
          <p>
            The default date is when the creditor considered the account delinquent. This
            helps establish the timeline and may affect which statutes apply.
          </p>
        </HelpTooltip>
        <Input
          id="account-default-date"
          type="date"
          value={accountDefaultDate}
          onChange={(e) => onFieldChange('accountDefaultDate', e.target.value)}
          className="mt-2"
        />
        <p className="text-xs text-warm-muted mt-1">Optional</p>
      </div>

      {/* Last payment date — THE KEY ONE */}
      <div>
        <Label htmlFor="last-payment-date" className="text-sm font-medium text-warm-text">
          When was your last payment?
        </Label>
        <HelpTooltip label="Why is this so important?">
          <p>
            This is the most important date for your defense. Under Texas law (Tex. Civ.
            Prac. &amp; Rem. Code &sect; 16.004), the statute of limitations for debt is 4
            years from your last payment or last activity on the account. If the SOL has
            expired, the creditor may not be able to collect through the courts.
          </p>
        </HelpTooltip>
        <Input
          id="last-payment-date"
          type="date"
          value={lastPaymentDate}
          onChange={(e) => onFieldChange('lastPaymentDate', e.target.value)}
          className="mt-2"
        />
      </div>

      {/* SOL Calculator display */}
      {daysSinceLastPayment !== null && daysSinceLastPayment > solDays ? (
        <div className="rounded-lg border border-green-300 bg-green-50 p-4">
          <p className="text-sm font-medium text-warm-text">
            The statute of limitations has likely expired
          </p>
          <p className="text-sm text-warm-text mt-1">
            It has been over 4 years since your last payment ({daysSinceLastPayment} days).
            This is a strong defense &mdash; the creditor may not be able to collect through
            the courts.
          </p>
        </div>
      ) : daysSinceLastPayment !== null && daysSinceLastPayment <= solDays ? (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
          <p className="text-sm font-medium text-warm-text">
            The statute of limitations is likely still active
          </p>
          <p className="text-sm text-warm-text mt-1">
            It has been less than 4 years since your last payment ({daysSinceLastPayment}{' '}
            days). You can still raise other defenses.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-calm-indigo/20 bg-calm-indigo/5 p-4">
          <p className="text-sm text-warm-text">
            Enter your last payment date to check if the statute of limitations has expired.
            Under Tex. Civ. Prac. &amp; Rem. Code &sect; 16.004, the SOL for debt is 4 years.
          </p>
        </div>
      )}

      {/* SOL warning */}
      <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-warm-text">
        <strong>Warning:</strong> Making a payment can restart the statute of limitations
        clock. Do not make any payments until you understand your rights.
      </div>

      {/* Service date */}
      <div>
        <Label htmlFor="service-date" className="text-sm font-medium text-warm-text">
          When were you served with the lawsuit?
        </Label>
        <HelpTooltip label="Why does this matter?">
          <p>
            The service date is when you received the court papers. Your deadline to file an
            answer is calculated from this date. If you were not properly served, this can be
            a defense.
          </p>
        </HelpTooltip>
        <Input
          id="service-date"
          type="date"
          value={serviceDate}
          onChange={(e) => onFieldChange('serviceDate', e.target.value)}
          className="mt-2"
        />
      </div>

      {/* Answer deadline */}
      <div>
        <Label htmlFor="answer-deadline" className="text-sm font-medium text-warm-text">
          What is your deadline to file an answer?
        </Label>
        <HelpTooltip label="Where do I find this?">
          <p>
            The deadline is usually printed on the court papers you received. In Texas, the
            standard deadline is the Monday following 20 days after service for district and
            county courts. For justice courts, it is typically 14 days. Missing this deadline
            can result in a default judgment against you.
          </p>
        </HelpTooltip>
        <Input
          id="answer-deadline"
          type="date"
          value={answerDeadline}
          onChange={(e) => onFieldChange('answerDeadline', e.target.value)}
          className="mt-2"
        />
      </div>
    </div>
  )
}
