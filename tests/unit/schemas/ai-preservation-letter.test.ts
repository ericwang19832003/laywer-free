import { describe, it, expect } from 'vitest'
import {
  aiPreservationLetterRequestSchema,
  aiPreservationLetterResponseSchema,
} from '@/lib/schemas/ai-preservation-letter'

describe('aiPreservationLetterRequestSchema', () => {
  it('accepts valid minimal request', () => {
    const result = aiPreservationLetterRequestSchema.safeParse({
      summary: 'Contractor did not finish kitchen renovation.',
      tone: 'polite',
    })
    expect(result.success).toBe(true)
  })

  it('accepts valid full request', () => {
    const result = aiPreservationLetterRequestSchema.safeParse({
      summary: 'Contractor did not finish kitchen renovation.',
      incident_date: '2026-01-15',
      evidence_categories: ['Emails and text messages', 'Photographs and videos'],
      tone: 'firm',
      opponent_name: 'Acme Corp',
    })
    expect(result.success).toBe(true)
  })

  it('strips unknown fields like opponent_email', () => {
    const result = aiPreservationLetterRequestSchema.safeParse({
      summary: 'Dispute over work.',
      tone: 'neutral',
      opponent_email: 'secret@example.com',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect('opponent_email' in result.data).toBe(false)
    }
  })

  it('rejects empty summary', () => {
    const result = aiPreservationLetterRequestSchema.safeParse({
      summary: '',
      tone: 'polite',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid tone', () => {
    const result = aiPreservationLetterRequestSchema.safeParse({
      summary: 'Some dispute.',
      tone: 'aggressive',
    })
    expect(result.success).toBe(false)
  })
})

describe('aiPreservationLetterResponseSchema', () => {
  it('accepts valid AI response', () => {
    const result = aiPreservationLetterResponseSchema.safeParse({
      subject: 'Request to Preserve Records',
      body: 'Dear Jane,\n\nPlease preserve documents...',
      evidenceBullets: ['Emails', 'Photos'],
      disclaimers: ['This is not legal advice.'],
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing body', () => {
    const result = aiPreservationLetterResponseSchema.safeParse({
      subject: 'Request to Preserve Records',
      evidenceBullets: [],
      disclaimers: [],
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty subject', () => {
    const result = aiPreservationLetterResponseSchema.safeParse({
      subject: '',
      body: 'Letter body here.',
      evidenceBullets: [],
      disclaimers: [],
    })
    expect(result.success).toBe(false)
  })
})
