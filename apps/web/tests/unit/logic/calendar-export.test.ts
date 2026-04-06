import { describe, it, expect } from 'vitest'
import { generateICS, googleCalendarUrl } from '@/lib/calendar-export'

describe('generateICS', () => {
  it('generates valid ICS with VCALENDAR and VEVENT', () => {
    const ics = generateICS({
      title: 'Lawyer Free: Answer Deadline',
      description: 'If missed, default judgment may be entered.',
      startDate: new Date(2026, 3, 4), // April 4, 2026
    })
    expect(ics).toContain('BEGIN:VCALENDAR')
    expect(ics).toContain('BEGIN:VEVENT')
    expect(ics).toContain('SUMMARY:Lawyer Free: Answer Deadline')
    expect(ics).toContain('DTSTART;VALUE=DATE:20260404')
    expect(ics).toContain('END:VCALENDAR')
  })

  it('includes VALARM reminders', () => {
    const ics = generateICS({
      title: 'Test',
      description: 'Test desc',
      startDate: new Date(2026, 3, 4),
    })
    expect(ics).toContain('BEGIN:VALARM')
    expect(ics).toContain('TRIGGER:-P1D')
    expect(ics).toContain('TRIGGER:-P7D')
  })

  it('escapes special characters', () => {
    const ics = generateICS({
      title: 'Test; with, special',
      description: 'Line 1\nLine 2',
      startDate: new Date(2026, 3, 4),
    })
    expect(ics).toContain('SUMMARY:Test\\; with\\, special')
    expect(ics).toContain('DESCRIPTION:Line 1\\nLine 2')
  })

  it('includes URL when provided', () => {
    const ics = generateICS({
      title: 'Test',
      description: 'Test',
      startDate: new Date(2026, 3, 4),
      url: 'https://lawyerfree.app/case/123/deadlines',
    })
    expect(ics).toContain('URL:https://lawyerfree.app/case/123/deadlines')
  })
})

describe('googleCalendarUrl', () => {
  it('returns a valid Google Calendar URL', () => {
    const url = googleCalendarUrl({
      title: 'Answer Deadline',
      description: 'Must respond by this date',
      startDate: new Date(2026, 3, 4),
    })
    expect(url).toContain('calendar.google.com')
    expect(url).toContain('text=Answer+Deadline')
  })
})
