/**
 * Texas Rule 4 Date Calculator
 *
 * Implements TRCP Rule 4: If the last day for any act falls on a Saturday,
 * Sunday, or legal holiday, the period extends to the next day that is not
 * a Saturday, Sunday, or legal holiday.
 *
 * Texas Legal Holidays per Government Code §662.003(a).
 *
 * Observed-holiday rule: When a fixed holiday falls on Saturday, it is
 * observed on Friday. When it falls on Sunday, it is observed on Monday.
 *
 * All date math uses local date constructors (not UTC) since we are
 * working with calendar days in Texas.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TexasHoliday {
  /** Display name of the holiday */
  name: string
  /** YYYY-MM-DD string for easy comparison */
  dateKey: string
  /** The observed date as a Date object (local) */
  date: Date
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Format a local date as YYYY-MM-DD */
function toDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Return the Nth occurrence of a given weekday in a month (1-based N). */
function nthWeekdayOfMonth(
  year: number,
  month: number, // 0-indexed (Jan=0)
  weekday: number, // 0=Sun … 6=Sat
  n: number
): Date {
  const first = new Date(year, month, 1)
  const firstDay = first.getDay()
  // Days until the first occurrence of the target weekday
  const offset = (weekday - firstDay + 7) % 7
  const day = 1 + offset + (n - 1) * 7
  return new Date(year, month, day)
}

/** Return the last occurrence of a given weekday in a month. */
function lastWeekdayOfMonth(
  year: number,
  month: number,
  weekday: number
): Date {
  // Start from the last day of the month and walk backwards
  const lastDay = new Date(year, month + 1, 0) // day 0 of next month = last day of this month
  const lastDayOfWeek = lastDay.getDay()
  const diff = (lastDayOfWeek - weekday + 7) % 7
  return new Date(year, month, lastDay.getDate() - diff)
}

/**
 * Apply the observed-holiday rule for fixed-date holidays.
 * Saturday → Friday, Sunday → Monday.
 */
function applyObservedRule(d: Date): Date {
  const day = d.getDay()
  if (day === 6) {
    // Saturday → observed on Friday
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1)
  }
  if (day === 0) {
    // Sunday → observed on Monday
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)
  }
  return d
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Return all Texas legal holidays (observed dates) for a given year,
 * sorted by date. Per Government Code §662.003(a).
 */
export function getTexasHolidays(year: number): TexasHoliday[] {
  const holidays: TexasHoliday[] = []

  // --- Fixed holidays (subject to observed rule) -------------------------

  const fixed: Array<{ name: string; month: number; day: number }> = [
    { name: "New Year's Day", month: 0, day: 1 },
    { name: 'Juneteenth', month: 5, day: 19 },
    { name: 'Independence Day', month: 6, day: 4 },
    { name: 'Veterans Day', month: 10, day: 11 },
    { name: 'Christmas', month: 11, day: 25 },
  ]

  for (const h of fixed) {
    const raw = new Date(year, h.month, h.day)
    const observed = applyObservedRule(raw)
    holidays.push({
      name: h.name,
      dateKey: toDateKey(observed),
      date: observed,
    })
  }

  // --- Floating holidays (always fall on a weekday, no observed rule) ----

  const floating: Array<{
    name: string
    compute: (y: number) => Date
  }> = [
    {
      name: 'Martin Luther King Jr. Day',
      compute: (y) => nthWeekdayOfMonth(y, 0, 1, 3), // 3rd Monday Jan
    },
    {
      name: "Presidents' Day",
      compute: (y) => nthWeekdayOfMonth(y, 1, 1, 3), // 3rd Monday Feb
    },
    {
      name: 'Memorial Day',
      compute: (y) => lastWeekdayOfMonth(y, 4, 1), // Last Monday May
    },
    {
      name: 'Labor Day',
      compute: (y) => nthWeekdayOfMonth(y, 8, 1, 1), // 1st Monday Sep
    },
    {
      name: 'Thanksgiving',
      compute: (y) => nthWeekdayOfMonth(y, 10, 4, 4), // 4th Thursday Nov
    },
    {
      name: 'Day after Thanksgiving',
      compute: (y) => {
        const tg = nthWeekdayOfMonth(y, 10, 4, 4)
        return new Date(y, 10, tg.getDate() + 1)
      },
    },
  ]

  for (const h of floating) {
    const d = h.compute(year)
    holidays.push({
      name: h.name,
      dateKey: toDateKey(d),
      date: d,
    })
  }

  // Sort by dateKey (chronological)
  holidays.sort((a, b) => a.dateKey.localeCompare(b.dateKey))

  return holidays
}

/**
 * Check whether a given date is a Texas legal holiday (observed date).
 */
export function isTexasHoliday(date: Date): boolean {
  const year = date.getFullYear()
  const key = toDateKey(date)
  const holidays = getTexasHolidays(year)
  return holidays.some((h) => h.dateKey === key)
}

/**
 * Apply Texas Rule 4 (TRCP Rule 4):
 *
 * If the date falls on a Saturday, Sunday, or legal holiday, advance to
 * the next day that is not a Saturday, Sunday, or legal holiday.
 *
 * Returns a new Date; does not mutate the input.
 */
export function applyTexasRule4(date: Date): Date {
  let d = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  // Safety valve: prevent infinite loops (max 10 iterations covers any
  // realistic cluster of holidays + weekends).
  let guard = 0
  const MAX_ITERATIONS = 10

  while (guard < MAX_ITERATIONS) {
    const dayOfWeek = d.getDay()

    if (dayOfWeek === 0) {
      // Sunday → skip to Monday
      d.setDate(d.getDate() + 1)
    } else if (dayOfWeek === 6) {
      // Saturday → skip to Monday
      d.setDate(d.getDate() + 2)
    } else if (isTexasHoliday(d)) {
      // Holiday on a weekday → advance one day
      d.setDate(d.getDate() + 1)
    } else {
      // Valid business day
      break
    }

    guard++
  }

  return d
}
