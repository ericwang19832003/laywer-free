import { describe, it, expect } from 'vitest'
import {
  OBJECTION_LABELS,
  ITEM_TYPES,
  classificationItemSchema,
  classificationOutputSchema,
  confirmItemSchema,
  confirmReviewSchema,
} from '@/lib/schemas/objection-classification'

// ── Constants ────────────────────────────────────

describe('OBJECTION_LABELS', () => {
  it('has exactly 13 labels', () => {
    expect(OBJECTION_LABELS).toHaveLength(13)
  })

  it('includes all expected labels', () => {
    const expected = [
      'relevance', 'overbroad', 'vague_ambiguous', 'undue_burden',
      'privilege', 'confidentiality', 'not_in_possession', 'already_produced',
      'premature', 'general_objection', 'non_responsive', 'incomplete', 'other',
    ]
    expect([...OBJECTION_LABELS]).toEqual(expected)
  })
})

describe('ITEM_TYPES', () => {
  it('has exactly 4 types', () => {
    expect(ITEM_TYPES).toHaveLength(4)
  })

  it('includes rfp, rog, rfa, unknown', () => {
    expect([...ITEM_TYPES]).toEqual(['rfp', 'rog', 'rfa', 'unknown'])
  })
})

// ── classificationItemSchema ─────────────────────

describe('classificationItemSchema', () => {
  const validItem = {
    item_type: 'rfp',
    item_no: 1,
    labels: ['relevance'],
    neutral_summary: 'Respondent objects on relevance grounds.',
    follow_up_flag: false,
    confidence: 0.85,
  }

  it('accepts valid item with all fields', () => {
    const result = classificationItemSchema.safeParse(validItem)
    expect(result.success).toBe(true)
  })

  it('accepts null item_no (unnumbered section)', () => {
    const result = classificationItemSchema.safeParse({ ...validItem, item_no: null })
    expect(result.success).toBe(true)
  })

  it('accepts unknown item_type', () => {
    const result = classificationItemSchema.safeParse({ ...validItem, item_type: 'unknown' })
    expect(result.success).toBe(true)
  })

  it('accepts multiple labels', () => {
    const result = classificationItemSchema.safeParse({
      ...validItem,
      labels: ['relevance', 'overbroad', 'privilege'],
    })
    expect(result.success).toBe(true)
  })

  it('accepts confidence at exact boundaries (0 and 1)', () => {
    expect(classificationItemSchema.safeParse({ ...validItem, confidence: 0 }).success).toBe(true)
    expect(classificationItemSchema.safeParse({ ...validItem, confidence: 1 }).success).toBe(true)
  })

  it('rejects empty labels array', () => {
    const result = classificationItemSchema.safeParse({ ...validItem, labels: [] })
    expect(result.success).toBe(false)
  })

  it('rejects invalid label', () => {
    const result = classificationItemSchema.safeParse({ ...validItem, labels: ['made_up'] })
    expect(result.success).toBe(false)
  })

  it('rejects invalid item_type', () => {
    const result = classificationItemSchema.safeParse({ ...validItem, item_type: 'subpoena' })
    expect(result.success).toBe(false)
  })

  it('rejects negative item_no', () => {
    const result = classificationItemSchema.safeParse({ ...validItem, item_no: -1 })
    expect(result.success).toBe(false)
  })

  it('rejects zero item_no', () => {
    const result = classificationItemSchema.safeParse({ ...validItem, item_no: 0 })
    expect(result.success).toBe(false)
  })

  it('rejects fractional item_no', () => {
    const result = classificationItemSchema.safeParse({ ...validItem, item_no: 1.5 })
    expect(result.success).toBe(false)
  })

  it('rejects confidence below 0', () => {
    const result = classificationItemSchema.safeParse({ ...validItem, confidence: -0.1 })
    expect(result.success).toBe(false)
  })

  it('rejects confidence above 1', () => {
    const result = classificationItemSchema.safeParse({ ...validItem, confidence: 1.1 })
    expect(result.success).toBe(false)
  })

  it('rejects empty neutral_summary', () => {
    const result = classificationItemSchema.safeParse({ ...validItem, neutral_summary: '' })
    expect(result.success).toBe(false)
  })

  it('rejects missing follow_up_flag', () => {
    const { follow_up_flag, ...rest } = validItem
    const result = classificationItemSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })
})

// ── classificationOutputSchema ───────────────────

describe('classificationOutputSchema', () => {
  const validOutput = {
    items: [
      {
        item_type: 'rfp',
        item_no: 1,
        labels: ['relevance', 'overbroad'],
        neutral_summary: 'Objects on relevance and overbreadth.',
        follow_up_flag: true,
        confidence: 0.9,
      },
      {
        item_type: 'rog',
        item_no: 3,
        labels: ['vague_ambiguous'],
        neutral_summary: 'Objects as vague.',
        follow_up_flag: false,
        confidence: 0.7,
      },
    ],
  }

  it('accepts valid output with multiple items', () => {
    const result = classificationOutputSchema.safeParse(validOutput)
    expect(result.success).toBe(true)
  })

  it('accepts empty items array', () => {
    const result = classificationOutputSchema.safeParse({ items: [] })
    expect(result.success).toBe(true)
  })

  it('accepts single item', () => {
    const result = classificationOutputSchema.safeParse({
      items: [validOutput.items[0]],
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing items key', () => {
    const result = classificationOutputSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('rejects if any item is invalid', () => {
    const result = classificationOutputSchema.safeParse({
      items: [
        validOutput.items[0],
        { ...validOutput.items[1], labels: [] }, // invalid: empty labels
      ],
    })
    expect(result.success).toBe(false)
  })
})

// ── confirmItemSchema ────────────────────────────

describe('confirmItemSchema', () => {
  const validConfirmItem = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    labels: ['privilege', 'confidentiality'],
    neutral_summary: 'Asserts attorney-client privilege.',
    follow_up_flag: true,
  }

  it('accepts valid confirm item', () => {
    const result = confirmItemSchema.safeParse(validConfirmItem)
    expect(result.success).toBe(true)
  })

  it('rejects non-UUID id', () => {
    const result = confirmItemSchema.safeParse({ ...validConfirmItem, id: 'not-a-uuid' })
    expect(result.success).toBe(false)
  })

  it('rejects empty labels', () => {
    const result = confirmItemSchema.safeParse({ ...validConfirmItem, labels: [] })
    expect(result.success).toBe(false)
  })

  it('rejects invalid label values', () => {
    const result = confirmItemSchema.safeParse({ ...validConfirmItem, labels: ['bogus'] })
    expect(result.success).toBe(false)
  })

  it('rejects empty neutral_summary', () => {
    const result = confirmItemSchema.safeParse({ ...validConfirmItem, neutral_summary: '' })
    expect(result.success).toBe(false)
  })

  it('rejects missing follow_up_flag', () => {
    const { follow_up_flag, ...rest } = validConfirmItem
    const result = confirmItemSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it('rejects string follow_up_flag', () => {
    const result = confirmItemSchema.safeParse({ ...validConfirmItem, follow_up_flag: 'yes' })
    expect(result.success).toBe(false)
  })
})

// ── confirmReviewSchema ──────────────────────────

describe('confirmReviewSchema', () => {
  const validPayload = {
    items: [
      {
        id: '550e8400-e29b-41d4-a716-446655440000',
        labels: ['relevance'],
        neutral_summary: 'Objects on relevance grounds.',
        follow_up_flag: false,
      },
    ],
  }

  it('accepts valid single-item payload', () => {
    const result = confirmReviewSchema.safeParse(validPayload)
    expect(result.success).toBe(true)
  })

  it('accepts multi-item payload', () => {
    const result = confirmReviewSchema.safeParse({
      items: [
        validPayload.items[0],
        {
          id: '660e8400-e29b-41d4-a716-446655440001',
          labels: ['privilege', 'confidentiality'],
          neutral_summary: 'Claims privilege.',
          follow_up_flag: true,
        },
      ],
    })
    expect(result.success).toBe(true)
  })

  it('accepts empty items array (zero-objection reviews)', () => {
    const result = confirmReviewSchema.safeParse({ items: [] })
    expect(result.success).toBe(true)
  })

  it('rejects missing items key', () => {
    const result = confirmReviewSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('rejects if any item has invalid id', () => {
    const result = confirmReviewSchema.safeParse({
      items: [{ ...validPayload.items[0], id: 'bad' }],
    })
    expect(result.success).toBe(false)
  })
})
