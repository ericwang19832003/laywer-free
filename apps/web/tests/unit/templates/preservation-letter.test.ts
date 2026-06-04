import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import {
  generatePreservationLetter,
  type PreservationLetterInput,
} from '@/lib/templates/preservation-letter'

// Pin the date so tests are deterministic
const FIXED_NOW = new Date('2026-03-01T12:00:00Z')

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(FIXED_NOW)
})

afterEach(() => {
  vi.useRealTimers()
})

// Phrases that must never appear in any tone.
// Note: 'sanctions', 'adverse inference', 'spoliation', and 'you must'
// were removed — the neutral/firm tones now include them intentionally
// as part of the consequences and scope sections.
const FORBIDDEN_PHRASES = [
  'violation of law',
  'penalties',
  'legal consequences',
  'court order',
  'contempt',
  'liable',
  'obligated',
]

function assertNoForbiddenLanguage(body: string) {
  const lower = body.toLowerCase()
  for (const phrase of FORBIDDEN_PHRASES) {
    expect(lower).not.toContain(phrase)
  }
}

describe('generatePreservationLetter', () => {
  // ── Minimal inputs ──────────────────────────────────────
  it('produces a complete letter with minimal inputs', () => {
    const result = generatePreservationLetter({
      summary: 'A dispute over unpaid invoices.',
      evidence_categories: [],
      tone: 'neutral',
    })

    expect(result.subject).toBe('Re: Evidence Preservation Request')
    expect(result.body).toContain('March 1, 2026')
    expect(result.body).toContain('To Whom It May Concern')
    expect(result.body).toContain('A dispute over unpaid invoices.')
    expect(result.body).toContain('Re: Evidence Preservation Request')
    expect(result.body).toContain('Sincerely')
    expect(result.body).toContain('[Your Name]')
    expect(result.body).toContain('FOR REFERENCE ONLY')
    expect(result.evidenceBullets).toEqual([
      'All documents and materials relevant to this matter',
    ])
    assertNoForbiddenLanguage(result.body)
  })

  // ── Full inputs ─────────────────────────────────────────
  it('produces a complete letter with all fields populated', () => {
    const result = generatePreservationLetter({
      opponent_name: 'Acme Corp',
      incident_date: '2026-01-15',
      summary: 'Breach of contract for construction services.',
      evidence_categories: [
        'Emails and text messages',
        'Contracts and agreements',
        'Financial records',
      ],
      custom_evidence_text: 'Building inspection reports',
      tone: 'neutral',
    })

    expect(result.subject).toBe('Re: Evidence Preservation Request')
    expect(result.body).toContain('Dear Acme Corp')
    expect(result.body).toContain('Acme Corp')
    expect(result.body).toContain('January 15, 2026')
    expect(result.body).toContain('Breach of contract for construction services.')
    expect(result.evidenceBullets).toEqual([
      'Emails and text messages',
      'Contracts and agreements',
      'Financial records',
      'Building inspection reports',
    ])
    // All bullets appear in body
    for (const bullet of result.evidenceBullets) {
      expect(result.body).toContain(bullet)
    }
    assertNoForbiddenLanguage(result.body)
  })

  // ── Tone: polite ────────────────────────────────────────
  it('uses warm, cooperative language for polite tone', () => {
    const result = generatePreservationLetter({
      opponent_name: 'Jane Smith',
      summary: 'Property damage from a fallen tree.',
      evidence_categories: ['Photographs and videos'],
      tone: 'polite',
    })

    expect(result.body).toContain('respectfully request')
    expect(result.body).toContain('appreciate')
    assertNoForbiddenLanguage(result.body)
  })

  // ── Tone: neutral ───────────────────────────────────────
  it('uses direct, professional language for neutral tone', () => {
    const result = generatePreservationLetter({
      summary: 'Employment dispute regarding final paycheck.',
      evidence_categories: ['Financial records'],
      tone: 'neutral',
    })

    expect(result.body).toContain('This letter constitutes formal notice')
    expect(result.body).toContain('confirm in writing')
    assertNoForbiddenLanguage(result.body)
  })

  // ── Tone: firm ──────────────────────────────────────────
  it('uses slightly stronger but non-threatening language for firm tone', () => {
    const result = generatePreservationLetter({
      opponent_name: 'BigCo LLC',
      summary: 'Product defect caused property damage.',
      evidence_categories: ['Surveillance footage', 'Repair invoices'],
      tone: 'firm',
    })

    expect(result.body).toContain('formal notice')
    expect(result.body).toContain('immediately implement a litigation hold')
    expect(result.body).toContain('within seven (7) calendar days')
    // Firm tone still must NOT use forbidden language
    assertNoForbiddenLanguage(result.body)
  })

  // ── Bullet list rendering ───────────────────────────────
  it('renders bullet list correctly with multiple categories', () => {
    const categories = [
      'Emails',
      'Text messages',
      'Phone records',
    ]
    const result = generatePreservationLetter({
      summary: 'Harassment claim.',
      evidence_categories: categories,
      tone: 'neutral',
    })

    // Each category appears as a numbered list item
    categories.forEach((cat, i) => {
      expect(result.body).toContain(`  ${i + 1}. ${cat}`)
    })
    expect(result.evidenceBullets).toEqual(categories)
  })

  it('renders custom evidence text as an additional bullet', () => {
    const result = generatePreservationLetter({
      summary: 'Noise complaint dispute.',
      evidence_categories: ['Photographs and videos'],
      custom_evidence_text: 'Sound level measurement logs',
      tone: 'polite',
    })

    expect(result.evidenceBullets).toEqual([
      'Photographs and videos',
      'Sound level measurement logs',
    ])
    expect(result.body).toContain('  2. Sound level measurement logs')
  })

  it('uses default bullet when no categories provided', () => {
    const result = generatePreservationLetter({
      summary: 'General dispute.',
      evidence_categories: [],
      tone: 'neutral',
    })

    expect(result.evidenceBullets).toEqual([
      'All documents and materials relevant to this matter',
    ])
    expect(result.body).toContain(
      '  1. All documents and materials relevant to this matter'
    )
  })

  // ── No opponent name ────────────────────────────────────
  it('uses "To Whom It May Concern" when no name provided', () => {
    const result = generatePreservationLetter({
      summary: 'Insurance claim dispute.',
      evidence_categories: [],
      tone: 'neutral',
    })

    expect(result.body).toContain('To Whom It May Concern')
    expect(result.body).not.toContain('Dear [')
  })

  // ── No incident date ────────────────────────────────────
  it('omits date reference when no incident date provided', () => {
    const result = generatePreservationLetter({
      summary: 'Ongoing landlord-tenant dispute.',
      evidence_categories: [],
      tone: 'neutral',
    })

    expect(result.body).not.toContain('on or around')
  })

  // ── Disclaimer always present ───────────────────────────
  it('always includes the reference-only disclaimer', () => {
    const result = generatePreservationLetter({
      summary: 'Any dispute.',
      evidence_categories: [],
      tone: 'polite',
    })

    expect(result.body).toContain('FOR REFERENCE ONLY')
    expect(result.body).toContain('not legal advice')
    expect(result.body).toContain('attorney-client relationship')
  })

  // ── Structured output ───────────────────────────────────
  it('returns subject, body, and evidenceBullets', () => {
    const result = generatePreservationLetter({
      summary: 'Test.',
      evidence_categories: ['Item A'],
      tone: 'neutral',
    })

    expect(result).toHaveProperty('subject')
    expect(result).toHaveProperty('body')
    expect(result).toHaveProperty('evidenceBullets')
    expect(typeof result.subject).toBe('string')
    expect(typeof result.body).toBe('string')
    expect(Array.isArray(result.evidenceBullets)).toBe(true)
  })
})
