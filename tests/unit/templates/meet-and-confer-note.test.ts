import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  generateMeetAndConferNote,
  type MeetAndConferInput,
} from '@/lib/templates/meet-and-confer-note'

// Pin date for deterministic output
beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-03-01T12:00:00Z'))
})

afterEach(() => {
  vi.useRealTimers()
})

const baseInput: MeetAndConferInput = {
  pack_title: 'First Set of Interrogatories',
  response_date: '2026-02-20T10:00:00Z',
  items: [
    {
      item_type: 'rfp',
      item_no: 1,
      labels: ['relevance', 'overbroad'],
      neutral_summary: 'Respondent objects on relevance and overbreadth grounds.',
    },
    {
      item_type: 'rog',
      item_no: 3,
      labels: ['vague_ambiguous'],
      neutral_summary: 'Objects as vague and ambiguous.',
    },
  ],
}

describe('generateMeetAndConferNote', () => {
  it('returns subject and body', () => {
    const result = generateMeetAndConferNote(baseInput)
    expect(result.subject).toBeTruthy()
    expect(result.body).toBeTruthy()
  })

  it('subject includes pack title', () => {
    const result = generateMeetAndConferNote(baseInput)
    expect(result.subject).toContain('First Set of Interrogatories')
  })

  it('body includes today date', () => {
    const result = generateMeetAndConferNote(baseInput)
    expect(result.body).toContain('March 1, 2026')
  })

  it('body includes response date when provided', () => {
    const result = generateMeetAndConferNote(baseInput)
    expect(result.body).toContain('February 20, 2026')
  })

  it('body omits response date clause when null', () => {
    const result = generateMeetAndConferNote({
      ...baseInput,
      response_date: null,
    })
    expect(result.body).not.toContain('received on')
  })

  it('body references the pack title', () => {
    const result = generateMeetAndConferNote(baseInput)
    expect(result.body).toContain('First Set of Interrogatories')
  })

  it('lists items by type and number', () => {
    const result = generateMeetAndConferNote(baseInput)
    expect(result.body).toContain('RFP #1')
    expect(result.body).toContain('ROG #3')
  })

  it('includes label descriptions', () => {
    const result = generateMeetAndConferNote(baseInput)
    expect(result.body).toContain('relevance and overbreadth')
    expect(result.body).toContain('vagueness or ambiguity')
  })

  it('includes neutral summaries', () => {
    const result = generateMeetAndConferNote(baseInput)
    expect(result.body).toContain('Respondent objects on relevance and overbreadth grounds.')
    expect(result.body).toContain('Objects as vague and ambiguous.')
  })

  it('requests a phone call or email', () => {
    const result = generateMeetAndConferNote(baseInput)
    expect(result.body).toContain('phone or email')
  })

  it('asks for supplemental responses', () => {
    const result = generateMeetAndConferNote(baseInput)
    expect(result.body).toContain('supplemental responses')
  })

  it('ends with disclaimer footer', () => {
    const result = generateMeetAndConferNote(baseInput)
    expect(result.body).toContain('FOR REFERENCE ONLY')
    expect(result.body).toContain('not legal advice')
  })

  it('includes sign-off with placeholder', () => {
    const result = generateMeetAndConferNote(baseInput)
    expect(result.body).toContain('[Your Name]')
  })

  // ── Forbidden language ─────────────────────────

  const FORBIDDEN = [
    'sanctions',
    'motion to compel',
    'file a motion',
    'court order',
    'penalties',
    'you must',
    'you are required',
    'failure to comply',
    'contempt',
    'spoliation',
  ]

  for (const word of FORBIDDEN) {
    it(`does NOT contain forbidden phrase: "${word}"`, () => {
      const result = generateMeetAndConferNote(baseInput)
      expect(result.body.toLowerCase()).not.toContain(word.toLowerCase())
    })
  }

  // ── Edge cases ─────────────────────────────────

  it('handles single item correctly', () => {
    const result = generateMeetAndConferNote({
      ...baseInput,
      items: [baseInput.items[0]],
    })
    expect(result.body).toContain('an item')
    expect(result.body).not.toContain('2 items')
  })

  it('handles unnumbered items', () => {
    const result = generateMeetAndConferNote({
      ...baseInput,
      items: [
        { item_type: 'unknown', item_no: null, labels: ['other'], neutral_summary: 'General objection.' },
      ],
    })
    expect(result.body).toContain('(unnumbered)')
  })

  it('handles three or more labels with Oxford comma', () => {
    const result = generateMeetAndConferNote({
      ...baseInput,
      items: [
        {
          item_type: 'rfp',
          item_no: 5,
          labels: ['relevance', 'overbroad', 'privilege'],
          neutral_summary: 'Multiple objections.',
        },
      ],
    })
    expect(result.body).toContain('relevance, overbreadth, and privilege')
  })

  it('handles missing pack title with fallback', () => {
    const result = generateMeetAndConferNote({
      pack_title: 'Discovery Pack',
      response_date: null,
      items: baseInput.items,
    })
    expect(result.subject).toContain('Discovery Pack')
  })
})
