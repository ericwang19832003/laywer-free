/**
 * Texas Deadline Engine v1
 *
 * Computes estimated deadlines from confirmed service facts.
 * Based on common Texas citation language:
 * - Default answer deadline: served_at + 14 days (Monday-at-10am convention)
 * - "Check docket" reminder: answer_deadline + 7 days
 * - Earliest info date: return_filed_at + 1 day (if return was filed)
 *
 * IMPORTANT: These are estimates. The exact deadline depends on the citation
 * language issued by the court. Users must confirm against their citation.
 */

const CALC_VERSION = 'TX_V1'
const ANSWER_DAYS = 14
const CHECK_DOCKET_OFFSET_DAYS = 7

export interface ComputedDeadline {
  key: string
  due_at: string
  rationale: string
  calc_version: string
}

export interface ServiceFactsInput {
  served_at: string | null
  return_filed_at?: string | null
}

function parseLocalDate(dateStr: string): Date {
  // Parse date-only strings (YYYY-MM-DD) as local dates, not UTC
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function addDays(dateStr: string, days: number): Date {
  const d = parseLocalDate(dateStr)
  d.setDate(d.getDate() + days)
  return d
}

function nextMondayAt10am(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  // If it's already Monday, keep it; otherwise advance to next Monday
  const daysUntilMonday = day === 0 ? 1 : day === 1 ? 0 : 8 - day
  if (daysUntilMonday > 0) {
    d.setDate(d.getDate() + daysUntilMonday)
  }
  d.setHours(10, 0, 0, 0)
  return d
}

export function computeDeadlinesFromServiceFacts(
  facts: ServiceFactsInput
): ComputedDeadline[] {
  if (!facts.served_at) return []

  const deadlines: ComputedDeadline[] = []

  // 1. Answer deadline: served_at + 14 days, then next Monday at 10am
  const rawAnswerDate = addDays(facts.served_at, ANSWER_DAYS)
  const answerDeadline = nextMondayAt10am(rawAnswerDate)

  deadlines.push({
    key: 'answer_deadline_estimated',
    due_at: answerDeadline.toISOString(),
    rationale:
      `Estimated answer deadline: ${ANSWER_DAYS} days after service (${facts.served_at}), ` +
      `then next Monday at 10:00 AM. Based on common Texas citation language. ` +
      `Please confirm the exact deadline shown on your citation. [${CALC_VERSION}]`,
    calc_version: CALC_VERSION,
  })

  // 2. Default earliest info: return_filed_at + 1 day (if available)
  if (facts.return_filed_at) {
    const earliestInfo = addDays(facts.return_filed_at, 1)
    deadlines.push({
      key: 'default_earliest_info',
      due_at: earliestInfo.toISOString(),
      rationale:
        `Earliest date default judgment info may be available: ` +
        `1 day after return filed (${facts.return_filed_at}). [${CALC_VERSION}]`,
      calc_version: CALC_VERSION,
    })
  }

  // 3. Check docket reminder: answer_deadline + 7 days
  const checkDocketDate = new Date(answerDeadline)
  checkDocketDate.setDate(checkDocketDate.getDate() + CHECK_DOCKET_OFFSET_DAYS)

  deadlines.push({
    key: 'check_docket_after_answer_deadline',
    due_at: checkDocketDate.toISOString(),
    rationale:
      `Check court docket ${CHECK_DOCKET_OFFSET_DAYS} days after estimated answer deadline ` +
      `to verify whether an answer was filed. [${CALC_VERSION}]`,
    calc_version: CALC_VERSION,
  })

  return deadlines
}
