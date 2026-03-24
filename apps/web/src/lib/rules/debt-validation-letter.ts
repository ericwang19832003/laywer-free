/**
 * Debt Validation Letter Generator
 *
 * Template-based (non-AI) generator that produces a formal debt validation
 * demand letter per 15 USC § 1692g. The letter requests verification of
 * the debt and demands cessation of collection activity until validation
 * is provided.
 *
 * Pure function — no side effects, trivially unit-testable.
 */

// ── Types ────────────────────────────────────────────────────────

export interface ValidationLetterInput {
  creditorName: string
  creditorAddress: string
  accountNumber: string
  amountClaimed: string
  dateOfFirstContact: string
  debtorName: string
  debtorAddress: string
}

export interface ValidationLetterResult {
  /** The formatted letter text */
  letterText: string
  /** ISO date string for the 30-day deadline */
  deadlineDate: string
  /** Days remaining to send the letter within the 30-day window */
  daysRemaining: number
}

// ── Helpers ──────────────────────────────────────────────────────

const MS_PER_DAY = 24 * 60 * 60 * 1000

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// ── Public API ───────────────────────────────────────────────────

/**
 * Generate a debt validation demand letter per 15 USC § 1692g.
 *
 * @param input - Debtor and creditor details
 * @param now - Current date (injectable for testing)
 * @returns The letter text, deadline date, and days remaining
 * @throws Error if dateOfFirstContact is invalid
 */
export function generateValidationLetter(
  input: ValidationLetterInput,
  now: Date = new Date()
): ValidationLetterResult {
  const firstContact = new Date(input.dateOfFirstContact)
  if (isNaN(firstContact.getTime())) {
    throw new Error(
      `Invalid date: "${input.dateOfFirstContact}". Expected ISO format (YYYY-MM-DD).`
    )
  }

  // 30-day window from date of first contact per 15 USC § 1692g(a)
  const deadline = new Date(firstContact)
  deadline.setDate(deadline.getDate() + 30)

  const daysRemaining = Math.ceil((deadline.getTime() - now.getTime()) / MS_PER_DAY)
  const deadlineDate = deadline.toISOString().split('T')[0]

  const todayFormatted = formatDate(now)
  const deadlineFormatted = formatDate(deadline)

  const letterText = `${input.debtorName}
${input.debtorAddress}

${todayFormatted}

${input.creditorName}
${input.creditorAddress}

Re: Account No. ${input.accountNumber}
Amount Claimed: ${input.amountClaimed}

SENT VIA CERTIFIED MAIL, RETURN RECEIPT REQUESTED

To Whom It May Concern:

I am writing in response to your communication dated ${formatDate(firstContact)} regarding the above-referenced account. This letter is a formal request for debt validation pursuant to my rights under the Fair Debt Collection Practices Act, 15 USC § 1692g.

I do not acknowledge that I owe this debt. Under 15 USC § 1692g(b), I am exercising my right to dispute this debt and request validation within the 30-day period provided by law. The deadline for this dispute is ${deadlineFormatted}.

Please provide the following documentation:

1. PROOF THE DEBT EXISTS — Provide a copy of the original signed contract, agreement, or other document that created the obligation, bearing my signature.

2. PROOF THE AMOUNT IS CORRECT — Provide a complete payment history and accounting from the original creditor, showing how the amount of ${input.amountClaimed} was calculated, including any interest, fees, or charges added.

3. PROOF YOU HAVE THE RIGHT TO COLLECT — Provide documentation establishing your authority to collect this debt, including the complete chain of assignment or purchase from the original creditor to your organization.

Until you have provided the requested validation, I demand that you:

(a) Cease all collection activity on this account immediately, as required by 15 USC § 1692g(b);
(b) Refrain from reporting this debt to any credit reporting agency, or if already reported, notify the agencies that the debt is disputed;
(c) Preserve all documents and records related to this account.

Please be advised that any continued collection activity prior to providing adequate validation constitutes a violation of the FDCPA and may subject your organization to statutory damages under 15 USC § 1692k.

I expect your response within 30 days of receipt of this letter. If I do not receive adequate validation, I will consider the matter resolved in my favor and expect no further contact regarding this account.

Sincerely,

${input.debtorName}`

  return {
    letterText,
    deadlineDate,
    daysRemaining,
  }
}
