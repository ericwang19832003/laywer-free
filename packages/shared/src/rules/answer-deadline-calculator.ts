/**
 * Texas Answer Deadline Calculator
 *
 * Computes the deadline for filing an answer based on Texas Rules of Civil Procedure:
 * - JP Court: 14 calendar days from service date
 * - County/District Court: first Monday after 20 days from service date
 * - Weekends and Texas observed holidays push the deadline to the next business day
 */

import { getTexasHolidays } from './texas-rule-4'

export interface AnswerDeadline {
  deadline: Date
  daysRemaining: number
  isOverdue: boolean
  courtType: 'jp' | 'county' | 'district'
  explanation: string
  urgency: 'critical' | 'urgent' | 'normal'
}

/** Build a Set of "YYYY-MM-DD" holiday keys for the given year using the dynamic calculator. */
function getHolidaySet(year: number): Set<string> {
  return new Set(getTexasHolidays(year).map((h) => h.dateKey))
}

/** Format a Date as "YYYY-MM-DD" using local time. */
function toDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Add calendar days to a date (returns a new Date). */
function addDays(d: Date, n: number): Date {
  const result = new Date(d)
  result.setDate(result.getDate() + n)
  return result
}

/** True if the date falls on a weekend (Sat=6, Sun=0). */
function isWeekend(d: Date): boolean {
  const day = d.getDay()
  return day === 0 || day === 6
}

/** True if the date is a Texas observed holiday. */
function isHoliday(d: Date): boolean {
  return getHolidaySet(d.getFullYear()).has(toDateKey(d))
}

/** Advance a date forward until it lands on a business day. */
function nextBusinessDay(d: Date): Date {
  let result = new Date(d)
  while (isWeekend(result) || isHoliday(result)) {
    result = addDays(result, 1)
  }
  return result
}

/** Find the first Monday on or after a given date. */
function firstMondayOnOrAfter(d: Date): Date {
  const result = new Date(d)
  while (result.getDay() !== 1) {
    result.setDate(result.getDate() + 1)
  }
  return result
}

/** Format a date like "Monday, April 7, 2026". */
function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/** Compute days between two dates (ignoring time of day). */
function diffCalendarDays(a: Date, b: Date): number {
  const msPerDay = 86_400_000
  const aStart = new Date(a.getFullYear(), a.getMonth(), a.getDate())
  const bStart = new Date(b.getFullYear(), b.getMonth(), b.getDate())
  return Math.round((bStart.getTime() - aStart.getTime()) / msPerDay)
}

export function calculateAnswerDeadline(
  serviceDate: string,
  courtType: 'jp' | 'county' | 'district',
  now?: Date,
): AnswerDeadline {
  const today = now ?? new Date()
  const served = new Date(serviceDate)

  let rawDeadline: Date
  let explanationBase: string

  if (courtType === 'jp') {
    // JP Court: 14 calendar days from service
    rawDeadline = addDays(served, 14)
    explanationBase = '14 calendar days from service'
  } else {
    // County/District: first Monday after 20 days from service
    const twentyDaysOut = addDays(served, 20)
    rawDeadline = firstMondayOnOrAfter(addDays(twentyDaysOut, 1))
    // If the 20th day is already a Monday, the rule says "first Monday AFTER",
    // so we go to the day after and then find Monday.
    // However, if the 20th day itself is not a Monday, firstMondayOnOrAfter
    // from day 21 already works. Let's re-check: the standard reading is
    // "the Monday next after the expiration of 20 days", meaning if day 20
    // is a Sunday, Monday (day 21) qualifies. We use day 20+1 as start.
    rawDeadline = firstMondayOnOrAfter(addDays(twentyDaysOut, 1))
    explanationBase = 'the first Monday after 20 days from service'
  }

  // If deadline falls on a weekend or holiday, push to next business day
  const deadline = nextBusinessDay(rawDeadline)

  const daysRemaining = diffCalendarDays(today, deadline)
  const isOverdue = daysRemaining < 0

  let urgency: 'critical' | 'urgent' | 'normal'
  if (daysRemaining < 3) {
    urgency = 'critical'
  } else if (daysRemaining < 7) {
    urgency = 'urgent'
  } else {
    urgency = 'normal'
  }

  const courtLabel =
    courtType === 'jp' ? 'JP Court' : courtType === 'county' ? 'County Court' : 'District Court'

  let explanation: string
  if (isOverdue) {
    explanation = `Your answer was due ${formatDate(deadline)} (${courtLabel} — ${explanationBase}). It is ${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) === 1 ? '' : 's'} overdue.`
  } else if (daysRemaining === 0) {
    explanation = `Your answer is due TODAY, ${formatDate(deadline)} (${courtLabel} — ${explanationBase}).`
  } else {
    explanation = `Your answer is due ${formatDate(deadline)} (${courtLabel} — ${explanationBase}). You have ${daysRemaining} day${daysRemaining === 1 ? '' : 's'} remaining.`
  }

  return {
    deadline,
    daysRemaining,
    isOverdue,
    courtType,
    explanation,
    urgency,
  }
}
