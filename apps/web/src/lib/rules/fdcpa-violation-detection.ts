/**
 * FDCPA Violation Detection Engine
 *
 * Rule-based (non-AI) detector that checks user-provided facts against
 * prohibited debt collector practices under the Fair Debt Collection
 * Practices Act, 15 USC §§ 1692c–1692f.
 *
 * Pure function — no side effects, trivially unit-testable.
 */

// ── Types ────────────────────────────────────────────────────────

export interface FdcpaCheckInput {
  callsBefore8am: boolean
  callsAfter9pm: boolean
  contactedAtWorkAfterStop: boolean
  threatenedArrest: boolean
  misrepresentedAmount: boolean
  failedToValidateWithin30Days: boolean
  usedObsceneLanguage: boolean
  calledThirdParties: boolean
  continuedAfterCeaseRequest: boolean
}

export interface FdcpaViolation {
  violation: string
  statute: string
  description: string
  severity: 'high' | 'medium'
}

// ── Rule Definitions ─────────────────────────────────────────────

interface ViolationRule {
  key: keyof FdcpaCheckInput
  violation: string
  statute: string
  description: string
  severity: 'high' | 'medium'
}

const VIOLATION_RULES: ViolationRule[] = [
  {
    key: 'callsBefore8am',
    violation: 'Calls before 8:00 AM',
    statute: '15 USC § 1692c(a)(1)',
    description:
      'A debt collector may not communicate with a consumer at any unusual time or place. Calling before 8:00 AM local time is presumed inconvenient.',
    severity: 'medium',
  },
  {
    key: 'callsAfter9pm',
    violation: 'Calls after 9:00 PM',
    statute: '15 USC § 1692c(a)(1)',
    description:
      'A debt collector may not communicate with a consumer at any unusual time or place. Calling after 9:00 PM local time is presumed inconvenient.',
    severity: 'medium',
  },
  {
    key: 'contactedAtWorkAfterStop',
    violation: 'Contacted at workplace after being told to stop',
    statute: '15 USC § 1692c(a)(3)',
    description:
      'A debt collector may not contact a consumer at their place of employment if the collector knows or has reason to know the employer prohibits such communication.',
    severity: 'high',
  },
  {
    key: 'threatenedArrest',
    violation: 'Threatened arrest or criminal prosecution',
    statute: '15 USC § 1692e(4)',
    description:
      'A debt collector may not threaten that nonpayment will result in arrest, imprisonment, or seizure of property unless such action is lawful and the collector intends to take it.',
    severity: 'high',
  },
  {
    key: 'misrepresentedAmount',
    violation: 'Misrepresented the amount owed',
    statute: '15 USC § 1692e(2)(A)',
    description:
      'A debt collector may not falsely represent the character, amount, or legal status of any debt.',
    severity: 'high',
  },
  {
    key: 'failedToValidateWithin30Days',
    violation: 'Failed to validate debt within 30 days of request',
    statute: '15 USC § 1692g(b)',
    description:
      'Upon receiving a written dispute within 30 days of initial communication, a collector must cease collection until verification of the debt is mailed to the consumer.',
    severity: 'high',
  },
  {
    key: 'usedObsceneLanguage',
    violation: 'Used obscene or profane language',
    statute: '15 USC § 1692d(2)',
    description:
      'A debt collector may not use obscene, profane, or abusive language in connection with the collection of a debt.',
    severity: 'medium',
  },
  {
    key: 'calledThirdParties',
    violation: 'Disclosed debt to third parties',
    statute: '15 USC § 1692c(b)',
    description:
      'A debt collector may not communicate with third parties (family, friends, neighbors, employers) about the debt, except to obtain location information or as permitted by law.',
    severity: 'high',
  },
  {
    key: 'continuedAfterCeaseRequest',
    violation: 'Continued collection after written cease-and-desist',
    statute: '15 USC § 1692c(c)',
    description:
      'If a consumer notifies a collector in writing to cease communication, the collector must stop all contact except to advise that collection efforts are being terminated or that the collector may invoke a specific remedy.',
    severity: 'high',
  },
]

// ── Public API ───────────────────────────────────────────────────

/**
 * Detect FDCPA violations based on user-reported facts.
 *
 * @param input - Boolean flags indicating whether each prohibited practice occurred
 * @returns Array of detected violations with statute citations and severity
 */
export function detectFdcpaViolations(input: FdcpaCheckInput): FdcpaViolation[] {
  const violations: FdcpaViolation[] = []

  for (const rule of VIOLATION_RULES) {
    if (input[rule.key]) {
      violations.push({
        violation: rule.violation,
        statute: rule.statute,
        description: rule.description,
        severity: rule.severity,
      })
    }
  }

  return violations
}
