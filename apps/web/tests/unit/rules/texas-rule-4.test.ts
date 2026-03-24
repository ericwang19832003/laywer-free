import { describe, it, expect } from 'vitest'
import {
  applyTexasRule4,
  isTexasHoliday,
  getTexasHolidays,
} from '@/lib/rules/texas-rule-4'

// Helper: create a local date (no UTC surprises)
function localDate(year: number, month: number, day: number): Date {
  return new Date(year, month - 1, day)
}

describe('getTexasHolidays', () => {
  it('returns 11 holidays for a given year', () => {
    const holidays = getTexasHolidays(2026)
    expect(holidays).toHaveLength(11)
  })

  it('returns correct fixed holidays for 2026', () => {
    const holidays = getTexasHolidays(2026)
    const keys = holidays.map((h) => h.dateKey)
    // New Year's Day: Jan 1
    expect(keys).toContain('2026-01-01')
    // Juneteenth: Jun 19
    expect(keys).toContain('2026-06-19')
    // Independence Day: Jul 4 (Saturday in 2026) → observed Friday Jul 3
    expect(keys).toContain('2026-07-03')
    // Veterans Day: Nov 11
    expect(keys).toContain('2026-11-11')
    // Christmas: Dec 25 (Friday in 2026)
    expect(keys).toContain('2026-12-25')
  })

  it('returns correct floating holidays for 2026', () => {
    const holidays = getTexasHolidays(2026)
    const keys = holidays.map((h) => h.dateKey)
    // MLK Day: 3rd Monday in January → Jan 19, 2026
    expect(keys).toContain('2026-01-19')
    // Presidents' Day: 3rd Monday in February → Feb 16, 2026
    expect(keys).toContain('2026-02-16')
    // Memorial Day: last Monday in May → May 25, 2026
    expect(keys).toContain('2026-05-25')
    // Labor Day: 1st Monday in September → Sep 7, 2026
    expect(keys).toContain('2026-09-07')
    // Thanksgiving: 4th Thursday in November → Nov 26, 2026
    expect(keys).toContain('2026-11-26')
    // Day after Thanksgiving: Nov 27, 2026
    expect(keys).toContain('2026-11-27')
  })

  it('handles Saturday observation: holiday shifts to Friday', () => {
    // Jul 4, 2026 is Saturday → observed Friday Jul 3
    const holidays = getTexasHolidays(2026)
    const july4 = holidays.find((h) => h.name === 'Independence Day')
    expect(july4).toBeDefined()
    expect(july4!.dateKey).toBe('2026-07-03')
  })

  it('handles Sunday observation: holiday shifts to Monday', () => {
    // Jan 1, 2023 is Sunday → observed Monday Jan 2
    const holidays = getTexasHolidays(2023)
    const newYear = holidays.find((h) => h.name === "New Year's Day")
    expect(newYear).toBeDefined()
    expect(newYear!.dateKey).toBe('2023-01-02')
  })

  it('returns holidays sorted by date', () => {
    const holidays = getTexasHolidays(2026)
    for (let i = 1; i < holidays.length; i++) {
      expect(holidays[i].dateKey >= holidays[i - 1].dateKey).toBe(true)
    }
  })

  it('returns unique date keys (no collisions)', () => {
    // Test a range of years to ensure no two holidays land on the same observed date
    for (let year = 2020; year <= 2030; year++) {
      const holidays = getTexasHolidays(year)
      const keys = holidays.map((h) => h.dateKey)
      const unique = new Set(keys)
      expect(unique.size).toBe(keys.length)
    }
  })
})

describe('isTexasHoliday', () => {
  it('returns true for a fixed holiday', () => {
    // Christmas 2026 is Thursday Dec 25
    expect(isTexasHoliday(localDate(2026, 12, 25))).toBe(true)
  })

  it('returns true for a floating holiday', () => {
    // MLK Day 2026: Jan 19 (3rd Monday)
    expect(isTexasHoliday(localDate(2026, 1, 19))).toBe(true)
  })

  it('returns true for an observed holiday (Saturday → Friday)', () => {
    // Jul 4, 2026 is Saturday → observed Jul 3 Friday
    expect(isTexasHoliday(localDate(2026, 7, 3))).toBe(true)
  })

  it('returns false for the actual date when observed on a different day', () => {
    // Jul 4, 2026 is Saturday — the actual date is NOT the observed holiday
    expect(isTexasHoliday(localDate(2026, 7, 4))).toBe(false)
  })

  it('returns false for a regular business day', () => {
    expect(isTexasHoliday(localDate(2026, 3, 10))).toBe(false)
  })

  it('returns false for a weekend day that is not an observed holiday', () => {
    expect(isTexasHoliday(localDate(2026, 3, 14))).toBe(false) // A Saturday
  })
})

describe('applyTexasRule4', () => {
  it('returns the same date if it falls on a business day (not a holiday)', () => {
    // March 10, 2026 is Tuesday
    const input = localDate(2026, 3, 10)
    const result = applyTexasRule4(input)
    expect(result.getFullYear()).toBe(2026)
    expect(result.getMonth()).toBe(2) // March (0-indexed)
    expect(result.getDate()).toBe(10)
  })

  it('rolls Saturday to next Monday', () => {
    // March 14, 2026 is Saturday → March 16 Monday
    const result = applyTexasRule4(localDate(2026, 3, 14))
    expect(result.getFullYear()).toBe(2026)
    expect(result.getMonth()).toBe(2)
    expect(result.getDate()).toBe(16)
    expect(result.getDay()).toBe(1) // Monday
  })

  it('rolls Sunday to next Monday', () => {
    // March 15, 2026 is Sunday → March 16 Monday
    const result = applyTexasRule4(localDate(2026, 3, 15))
    expect(result.getFullYear()).toBe(2026)
    expect(result.getMonth()).toBe(2)
    expect(result.getDate()).toBe(16)
    expect(result.getDay()).toBe(1) // Monday
  })

  it('rolls a holiday (weekday) to next business day', () => {
    // Christmas 2026 is Friday Dec 25 → Dec 26 is Saturday → Dec 28 Monday
    // Wait, Christmas 2026: Dec 25 is Friday. That's a holiday.
    // Dec 26 is Saturday, Dec 27 is Sunday, Dec 28 is Monday (not a holiday) → Dec 28.
    const result = applyTexasRule4(localDate(2026, 12, 25))
    expect(result.getFullYear()).toBe(2026)
    expect(result.getMonth()).toBe(11) // December (0-indexed)
    expect(result.getDate()).toBe(28)
    expect(result.getDay()).toBe(1) // Monday
  })

  it('rolls an observed holiday (Friday) to next Monday', () => {
    // Jul 4, 2026 is Saturday → observed Friday Jul 3.
    // Jul 3 is observed holiday → skip to Jul 4 (Saturday) → skip to Jul 5 (Sunday) → Jul 6 Monday
    const result = applyTexasRule4(localDate(2026, 7, 3))
    expect(result.getFullYear()).toBe(2026)
    expect(result.getMonth()).toBe(6) // July (0-indexed)
    expect(result.getDate()).toBe(6)
    expect(result.getDay()).toBe(1) // Monday
  })

  it('handles consecutive holiday + weekend (Thanksgiving cluster)', () => {
    // Thanksgiving 2026: Nov 26 (Thursday), Day after: Nov 27 (Friday)
    // Nov 26 (Thu, holiday) → Nov 27 (Fri, holiday) → Nov 28 (Sat) → Nov 29 (Sun) → Nov 30 (Mon)
    const result = applyTexasRule4(localDate(2026, 11, 26))
    expect(result.getFullYear()).toBe(2026)
    expect(result.getMonth()).toBe(10) // November (0-indexed)
    expect(result.getDate()).toBe(30)
    expect(result.getDay()).toBe(1) // Monday
  })

  it('handles Day after Thanksgiving directly', () => {
    // Nov 27, 2026 (Friday, holiday) → Nov 28 (Sat) → Nov 29 (Sun) → Nov 30 (Mon)
    const result = applyTexasRule4(localDate(2026, 11, 27))
    expect(result.getMonth()).toBe(10)
    expect(result.getDate()).toBe(30)
  })

  it('handles year boundary: New Year on a weekday', () => {
    // Jan 1, 2026 is Thursday → holiday → Jan 2 (Friday, not a holiday) → Jan 2
    const result = applyTexasRule4(localDate(2026, 1, 1))
    expect(result.getFullYear()).toBe(2026)
    expect(result.getMonth()).toBe(0)
    expect(result.getDate()).toBe(2)
  })

  it('handles year boundary: Dec 31 weekend into New Year', () => {
    // Dec 31, 2027 is Friday, not a holiday → stays Dec 31
    const result = applyTexasRule4(localDate(2027, 12, 31))
    expect(result.getFullYear()).toBe(2027)
    expect(result.getMonth()).toBe(11)
    expect(result.getDate()).toBe(31)
  })

  it('handles New Year observed on Monday (Sunday Jan 1)', () => {
    // Jan 1, 2023 is Sunday → observed Monday Jan 2
    // If deadline is Jan 2, 2023 (observed holiday) → Jan 3 (Tuesday)
    const result = applyTexasRule4(localDate(2023, 1, 2))
    expect(result.getFullYear()).toBe(2023)
    expect(result.getMonth()).toBe(0)
    expect(result.getDate()).toBe(3)
  })

  it('does not modify the input date object', () => {
    const input = localDate(2026, 3, 14) // Saturday
    const originalTime = input.getTime()
    applyTexasRule4(input)
    expect(input.getTime()).toBe(originalTime)
  })

  it('returns a new Date instance, not the input', () => {
    const input = localDate(2026, 3, 10) // Tuesday, stays same
    const result = applyTexasRule4(input)
    expect(result).not.toBe(input)
  })

  it('handles MLK Day (Monday holiday) by rolling to Tuesday', () => {
    // MLK Day 2026: Jan 19 (Monday) → Jan 20 (Tuesday)
    const result = applyTexasRule4(localDate(2026, 1, 19))
    expect(result.getFullYear()).toBe(2026)
    expect(result.getMonth()).toBe(0)
    expect(result.getDate()).toBe(20)
    expect(result.getDay()).toBe(2) // Tuesday
  })

  it('handles a regular Friday (no holiday) — stays on Friday', () => {
    // March 13, 2026 is Friday, not a holiday
    const result = applyTexasRule4(localDate(2026, 3, 13))
    expect(result.getDate()).toBe(13)
  })

  it('handles Veterans Day 2026 (Wednesday)', () => {
    // Nov 11, 2026 is Wednesday → holiday → Nov 12 (Thursday, not a holiday) → Nov 12
    const result = applyTexasRule4(localDate(2026, 11, 11))
    expect(result.getMonth()).toBe(10) // November
    expect(result.getDate()).toBe(12)
  })

  it('handles Juneteenth 2026 (Friday)', () => {
    // Jun 19, 2026 is Friday → holiday → Jun 20 (Saturday) → Jun 21 (Sunday) → Jun 22 (Monday)
    const result = applyTexasRule4(localDate(2026, 6, 19))
    expect(result.getMonth()).toBe(5) // June
    expect(result.getDate()).toBe(22)
    expect(result.getDay()).toBe(1) // Monday
  })
})
