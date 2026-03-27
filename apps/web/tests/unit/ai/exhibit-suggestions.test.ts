import { describe, it, expect } from 'vitest'
import {
  buildExhibitSuggestionPrompt,
  exhibitSuggestionSchema,
  isExhibitSuggestionSafe,
  EXHIBIT_SUGGESTION_SYSTEM_PROMPT,
} from '@/lib/ai/exhibit-suggestions'

describe('buildExhibitSuggestionPrompt', () => {
  it('builds prompt containing dispute type, file names, and existing exhibit numbers', () => {
    const prompt = buildExhibitSuggestionPrompt({
      dispute_type: 'landlord_tenant',
      state: 'TX',
      existing_exhibits: [
        { exhibit_no: 1, title: 'Lease Agreement' },
        { exhibit_no: 2, title: 'Move-in Photos' },
      ],
      unexhibited_evidence: [
        { id: 'ev-1', file_name: 'repair_request.pdf', category: 'Emails', notes: null },
        { id: 'ev-2', file_name: 'damage_photo.jpg', category: 'Photos', notes: 'Kitchen ceiling' },
      ],
    })

    expect(prompt).toContain('landlord_tenant')
    expect(prompt).toContain('repair_request.pdf')
    expect(prompt).toContain('damage_photo.jpg')
    expect(prompt).toContain('Exhibit 1')
    expect(prompt).toContain('Exhibit 2')
  })
})

describe('exhibitSuggestionSchema', () => {
  it('validates suggestion response schema with valid data', () => {
    const result = exhibitSuggestionSchema.safeParse({
      suggestions: [
        {
          evidence_id: 'ev-1',
          suggested_title: 'Repair Request Email',
          reason: 'This email documents the tenant notifying the landlord of needed repairs.',
        },
      ],
    })
    expect(result.success).toBe(true)
  })

  it('rejects suggestion with empty title', () => {
    const result = exhibitSuggestionSchema.safeParse({
      suggestions: [
        {
          evidence_id: 'ev-1',
          suggested_title: '',
          reason: 'Some valid reason for this exhibit.',
        },
      ],
    })
    expect(result.success).toBe(false)
  })
})

describe('isExhibitSuggestionSafe', () => {
  it('blocks unsafe text', () => {
    expect(isExhibitSuggestionSafe('You must file this as Exhibit A')).toBe(false)
    expect(isExhibitSuggestionSafe('This is legal advice')).toBe(false)
    expect(isExhibitSuggestionSafe('As your attorney, I suggest...')).toBe(false)
  })

  it('allows safe text', () => {
    expect(isExhibitSuggestionSafe('This document shows the timeline of events')).toBe(true)
    expect(isExhibitSuggestionSafe('Consider designating this as an exhibit')).toBe(true)
  })
})

describe('EXHIBIT_SUGGESTION_SYSTEM_PROMPT', () => {
  it('exports system prompt containing "exhibit"', () => {
    expect(EXHIBIT_SUGGESTION_SYSTEM_PROMPT.toLowerCase()).toContain('exhibit')
  })
})
