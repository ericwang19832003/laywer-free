import { describe, it, expect } from 'vitest'
import {
  buildExhibitSuggestionPrompt,
  exhibitSuggestionSchema,
  EXHIBIT_SUGGESTION_SYSTEM_PROMPT,
  isExhibitSuggestionSafe,
} from '@/lib/ai/exhibit-suggestions'

describe('buildExhibitSuggestionPrompt', () => {
  it('includes evidence IDs in the output', () => {
    const prompt = buildExhibitSuggestionPrompt({
      dispute_type: 'debt',
      state: 'TX',
      existing_exhibits: [],
      unexhibited_evidence: [
        { id: 'ev-abc-123', file_name: 'contract.pdf', category: 'Contract', notes: null },
      ],
    })
    expect(prompt).toContain('ev-abc-123')
  })

  it('includes file names in the output', () => {
    const prompt = buildExhibitSuggestionPrompt({
      dispute_type: 'landlord-tenant',
      state: 'CA',
      existing_exhibits: [],
      unexhibited_evidence: [
        { id: 'ev-1', file_name: 'lease_agreement.pdf', category: null, notes: null },
      ],
    })
    expect(prompt).toContain('lease_agreement.pdf')
  })

  it('shows existing exhibit numbers and titles', () => {
    const prompt = buildExhibitSuggestionPrompt({
      dispute_type: 'debt',
      state: 'TX',
      existing_exhibits: [
        { exhibit_no: 1, title: 'Original Complaint' },
        { exhibit_no: 2, title: 'Signed Agreement' },
      ],
      unexhibited_evidence: [
        { id: 'ev-2', file_name: 'photo.jpg', category: 'Photo', notes: null },
      ],
    })
    expect(prompt).toContain('Exhibit 1')
    expect(prompt).toContain('Original Complaint')
    expect(prompt).toContain('Exhibit 2')
    expect(prompt).toContain('Signed Agreement')
  })

  it('shows "None yet" when there are no existing exhibits', () => {
    const prompt = buildExhibitSuggestionPrompt({
      dispute_type: 'debt',
      state: 'TX',
      existing_exhibits: [],
      unexhibited_evidence: [
        { id: 'ev-3', file_name: 'doc.pdf', category: null, notes: null },
      ],
    })
    expect(prompt).toContain('None yet')
  })

  it('shows no-unexhibited-evidence message when list is empty', () => {
    const prompt = buildExhibitSuggestionPrompt({
      dispute_type: 'debt',
      state: 'TX',
      existing_exhibits: [],
      unexhibited_evidence: [],
    })
    expect(prompt).toContain('No unexhibited evidence items')
  })

  it('includes dispute_type and state in case context', () => {
    const prompt = buildExhibitSuggestionPrompt({
      dispute_type: 'personal-injury',
      state: 'FL',
      existing_exhibits: [],
      unexhibited_evidence: [],
    })
    expect(prompt).toContain('personal-injury')
    expect(prompt).toContain('FL')
  })

  it('falls back to "general" for null dispute_type', () => {
    const prompt = buildExhibitSuggestionPrompt({
      dispute_type: null,
      state: null,
      existing_exhibits: [],
      unexhibited_evidence: [],
    })
    expect(prompt).toContain('general')
    expect(prompt).toContain('unknown')
  })

  it('includes category when provided', () => {
    const prompt = buildExhibitSuggestionPrompt({
      dispute_type: 'debt',
      state: 'TX',
      existing_exhibits: [],
      unexhibited_evidence: [
        { id: 'ev-4', file_name: 'bank_statement.pdf', category: 'Financial', notes: null },
      ],
    })
    expect(prompt).toContain('Financial')
  })

  it('includes notes when provided', () => {
    const prompt = buildExhibitSuggestionPrompt({
      dispute_type: 'debt',
      state: 'TX',
      existing_exhibits: [],
      unexhibited_evidence: [
        { id: 'ev-5', file_name: 'email.pdf', category: null, notes: 'Key email from creditor' },
      ],
    })
    expect(prompt).toContain('Key email from creditor')
  })

  it('handles multiple unexhibited evidence items', () => {
    const prompt = buildExhibitSuggestionPrompt({
      dispute_type: 'debt',
      state: 'TX',
      existing_exhibits: [],
      unexhibited_evidence: [
        { id: 'ev-a', file_name: 'doc1.pdf', category: null, notes: null },
        { id: 'ev-b', file_name: 'doc2.pdf', category: null, notes: null },
        { id: 'ev-c', file_name: 'doc3.pdf', category: null, notes: null },
      ],
    })
    expect(prompt).toContain('ev-a')
    expect(prompt).toContain('ev-b')
    expect(prompt).toContain('ev-c')
  })
})

describe('exhibitSuggestionSchema', () => {
  it('validates a response with suggestions', () => {
    const valid = {
      suggestions: [
        {
          evidence_id: 'ev-abc-123',
          suggested_title: 'Original Signed Contract',
          reason: 'Establishes the terms agreed upon by both parties.',
        },
      ],
    }
    expect(exhibitSuggestionSchema.safeParse(valid).success).toBe(true)
  })

  it('validates an empty suggestions array', () => {
    const valid = { suggestions: [] }
    expect(exhibitSuggestionSchema.safeParse(valid).success).toBe(true)
  })

  it('validates multiple suggestions', () => {
    const valid = {
      suggestions: [
        { evidence_id: 'ev-1', suggested_title: 'Bank Statement', reason: 'Shows payment history.' },
        { evidence_id: 'ev-2', suggested_title: 'Email Correspondence', reason: 'Documents communications.' },
      ],
    }
    const result = exhibitSuggestionSchema.safeParse(valid)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.suggestions).toHaveLength(2)
    }
  })

  it('rejects a suggestion with an empty title', () => {
    const invalid = {
      suggestions: [
        { evidence_id: 'ev-1', suggested_title: '', reason: 'Some reason here.' },
      ],
    }
    expect(exhibitSuggestionSchema.safeParse(invalid).success).toBe(false)
  })

  it('rejects a suggestion with an empty reason', () => {
    const invalid = {
      suggestions: [
        { evidence_id: 'ev-1', suggested_title: 'Valid Title', reason: '' },
      ],
    }
    expect(exhibitSuggestionSchema.safeParse(invalid).success).toBe(false)
  })

  it('rejects a suggestion with a title exceeding 200 characters', () => {
    const invalid = {
      suggestions: [
        { evidence_id: 'ev-1', suggested_title: 'A'.repeat(201), reason: 'Valid reason.' },
      ],
    }
    expect(exhibitSuggestionSchema.safeParse(invalid).success).toBe(false)
  })

  it('rejects a suggestion with a reason exceeding 500 characters', () => {
    const invalid = {
      suggestions: [
        { evidence_id: 'ev-1', suggested_title: 'Valid Title', reason: 'B'.repeat(501) },
      ],
    }
    expect(exhibitSuggestionSchema.safeParse(invalid).success).toBe(false)
  })

  it('accepts a suggestion with title at exactly 200 characters', () => {
    const valid = {
      suggestions: [
        { evidence_id: 'ev-1', suggested_title: 'A'.repeat(200), reason: 'Valid reason.' },
      ],
    }
    expect(exhibitSuggestionSchema.safeParse(valid).success).toBe(true)
  })

  it('accepts a suggestion with reason at exactly 500 characters', () => {
    const valid = {
      suggestions: [
        { evidence_id: 'ev-1', suggested_title: 'Valid Title', reason: 'B'.repeat(500) },
      ],
    }
    expect(exhibitSuggestionSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects response missing suggestions field', () => {
    expect(exhibitSuggestionSchema.safeParse({}).success).toBe(false)
  })

  it('rejects response where suggestions is not an array', () => {
    expect(exhibitSuggestionSchema.safeParse({ suggestions: 'not an array' }).success).toBe(false)
  })
})

describe('isExhibitSuggestionSafe', () => {
  it('returns true for safe neutral text', () => {
    expect(isExhibitSuggestionSafe('This document may be useful as an exhibit.')).toBe(true)
  })

  it('blocks "you must"', () => {
    expect(isExhibitSuggestionSafe('You must file this document immediately.')).toBe(false)
  })

  it('blocks "you should"', () => {
    expect(isExhibitSuggestionSafe('You should include this as an exhibit.')).toBe(false)
  })

  it('blocks "file immediately"', () => {
    expect(isExhibitSuggestionSafe('File immediately to preserve your rights.')).toBe(false)
  })

  it('blocks "urgent"', () => {
    expect(isExhibitSuggestionSafe('This is urgent and requires prompt action.')).toBe(false)
  })

  it('blocks "sanctions"', () => {
    expect(isExhibitSuggestionSafe('Failure to comply may result in sanctions.')).toBe(false)
  })

  it('blocks "legal advice"', () => {
    expect(isExhibitSuggestionSafe('This constitutes legal advice for your case.')).toBe(false)
  })

  it('blocks "guaranteed"', () => {
    expect(isExhibitSuggestionSafe('Including this exhibit is guaranteed to help.')).toBe(false)
  })

  it('blocks "winning"', () => {
    expect(isExhibitSuggestionSafe('This exhibit is key to winning your case.')).toBe(false)
  })

  it('blocks "losing"', () => {
    expect(isExhibitSuggestionSafe('Without this, you risk losing the case.')).toBe(false)
  })

  it('blocks "i recommend that you"', () => {
    expect(isExhibitSuggestionSafe('I recommend that you include this document.')).toBe(false)
  })

  it('blocks "as your attorney"', () => {
    expect(isExhibitSuggestionSafe('As your attorney, I advise including this.')).toBe(false)
  })

  it('blocks "in my legal opinion"', () => {
    expect(isExhibitSuggestionSafe('In my legal opinion, this document is critical.')).toBe(false)
  })

  it('is case-insensitive for blocked phrases', () => {
    expect(isExhibitSuggestionSafe('YOU MUST include this document.')).toBe(false)
    expect(isExhibitSuggestionSafe('YOU SHOULD designate this exhibit.')).toBe(false)
    expect(isExhibitSuggestionSafe('WINNING the case depends on this.')).toBe(false)
  })

  it('returns true for empty string', () => {
    expect(isExhibitSuggestionSafe('')).toBe(true)
  })

  it('returns true for text discussing organizational value without blocked phrases', () => {
    expect(
      isExhibitSuggestionSafe(
        'This document provides context for the timeline of events and may help organize the case binder chronologically.'
      )
    ).toBe(true)
  })

  it('blocks text containing blocked phrase embedded in larger context', () => {
    expect(
      isExhibitSuggestionSafe(
        'This exhibit is important — in my legal opinion it establishes the key facts.'
      )
    ).toBe(false)
  })
})

describe('EXHIBIT_SUGGESTION_SYSTEM_PROMPT', () => {
  it('contains the word "exhibit"', () => {
    expect(EXHIBIT_SUGGESTION_SYSTEM_PROMPT.toLowerCase()).toContain('exhibit')
  })

  it('does not contain "as your attorney"', () => {
    expect(EXHIBIT_SUGGESTION_SYSTEM_PROMPT.toLowerCase()).not.toContain('as your attorney')
  })

  it('does not contain "i recommend that you"', () => {
    expect(EXHIBIT_SUGGESTION_SYSTEM_PROMPT.toLowerCase()).not.toContain('i recommend that you')
  })

  it('does not contain "in my legal opinion"', () => {
    expect(EXHIBIT_SUGGESTION_SYSTEM_PROMPT.toLowerCase()).not.toContain('in my legal opinion')
  })

  it('mentions JSON response format', () => {
    expect(EXHIBIT_SUGGESTION_SYSTEM_PROMPT).toContain('JSON')
  })

  it('mentions evidence_id in the response template', () => {
    expect(EXHIBIT_SUGGESTION_SYSTEM_PROMPT).toContain('evidence_id')
  })

  it('is a non-empty string', () => {
    expect(EXHIBIT_SUGGESTION_SYSTEM_PROMPT.length).toBeGreaterThan(0)
  })
})
