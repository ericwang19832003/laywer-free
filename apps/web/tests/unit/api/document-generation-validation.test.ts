import { describe, it, expect } from 'vitest'
import { aiResponseSchema } from '@/app/api/document-generation/route'

/**
 * Tests for AI response validation schema used in document generation.
 * The schema ensures we never return empty, malformed, or gibberish
 * legal documents to users.
 */

// Helper: build a realistic legal document string
function makeLegalDoc(paragraphs = 3, wordsPerParagraph = 50): string {
  const words = [
    'the', 'plaintiff', 'hereby', 'requests', 'that', 'this', 'court',
    'grant', 'relief', 'pursuant', 'to', 'applicable', 'law', 'and',
    'facts', 'presented', 'herein', 'demonstrate', 'defendant', 'failed',
    'to', 'perform', 'obligations', 'under', 'the', 'agreement', 'dated',
    'January', 'fifteenth', 'two', 'thousand', 'twenty', 'six', 'between',
    'the', 'parties', 'regarding', 'property', 'located', 'in', 'Travis',
    'County', 'Texas', 'therefore', 'damages', 'are', 'sought', 'including',
    'compensatory', 'amounts',
  ]

  const paras: string[] = []
  for (let p = 0; p < paragraphs; p++) {
    const sentence: string[] = []
    for (let w = 0; w < wordsPerParagraph; w++) {
      sentence.push(words[w % words.length])
    }
    paras.push(sentence.join(' '))
  }
  return paras.join('\n\n')
}

describe('aiResponseSchema', () => {
  describe('accepts valid documents', () => {
    it('accepts a well-formed legal document', () => {
      const doc = makeLegalDoc(3, 50)
      const result = aiResponseSchema.safeParse(doc)
      expect(result.success).toBe(true)
    })

    it('accepts a long document with many paragraphs', () => {
      const doc = makeLegalDoc(10, 80)
      const result = aiResponseSchema.safeParse(doc)
      expect(result.success).toBe(true)
    })
  })

  describe('rejects too-short responses', () => {
    it('rejects empty string', () => {
      const result = aiResponseSchema.safeParse('')
      expect(result.success).toBe(false)
      expect(result.error!.issues[0].message).toMatch(/too short/i)
    })

    it('rejects string under 100 chars', () => {
      const result = aiResponseSchema.safeParse('This is a short response.')
      expect(result.success).toBe(false)
      expect(result.error!.issues[0].message).toMatch(/too short/i)
    })
  })

  describe('rejects AI refusal patterns', () => {
    it('rejects "I cannot" refusal', () => {
      const text = makeLegalDoc(3, 50).replace(
        'the plaintiff hereby',
        'I cannot generate legal documents because'
      )
      const result = aiResponseSchema.safeParse(text)
      expect(result.success).toBe(false)
      expect(result.error!.issues.some((i) => i.message.includes('refusal'))).toBe(true)
    })

    it('rejects "as an AI" refusal', () => {
      const text = makeLegalDoc(3, 50).replace(
        'the plaintiff hereby',
        'As an AI language model I must inform'
      )
      const result = aiResponseSchema.safeParse(text)
      expect(result.success).toBe(false)
      expect(result.error!.issues.some((i) => i.message.includes('refusal'))).toBe(true)
    })

    it('rejects "I\'m unable to" refusal', () => {
      const text = makeLegalDoc(3, 50).replace(
        'the plaintiff hereby',
        "I'm unable to provide legal documents"
      )
      const result = aiResponseSchema.safeParse(text)
      expect(result.success).toBe(false)
    })
  })

  describe('rejects lack of paragraph structure', () => {
    it('rejects a single long line with no line breaks', () => {
      const words = Array(80).fill('the plaintiff hereby requests relief pursuant to applicable law').join(' ')
      // Ensure it's long enough but has zero line breaks
      expect(words.length).toBeGreaterThan(100)
      const result = aiResponseSchema.safeParse(words)
      expect(result.success).toBe(false)
      expect(result.error!.issues.some((i) => i.message.includes('paragraph structure'))).toBe(true)
    })

    it('rejects text with only one line break', () => {
      const text = 'A'.repeat(60) + '\n' + 'B'.repeat(60)
      const result = aiResponseSchema.safeParse(text)
      expect(result.success).toBe(false)
      expect(result.error!.issues.some((i) => i.message.includes('paragraph structure'))).toBe(true)
    })

    it('accepts text with exactly two line breaks', () => {
      const para = 'The plaintiff hereby requests that this court grant relief pursuant to applicable law and facts presented herein'
      const text = para + '\n' + para + '\n' + para
      expect(text.length).toBeGreaterThan(100)
      const result = aiResponseSchema.safeParse(text)
      expect(result.success).toBe(true)
    })
  })

  describe('rejects repetitive gibberish', () => {
    it('rejects text where one word dominates', () => {
      // Build a string that is 100+ chars, has line breaks, but is just one word repeated
      const lines = Array(5).fill(Array(20).fill('lorem').join(' ')).join('\n')
      expect(lines.length).toBeGreaterThan(100)
      const result = aiResponseSchema.safeParse(lines)
      expect(result.success).toBe(false)
      expect(result.error!.issues.some((i) => i.message.includes('repetitive'))).toBe(true)
    })

    it('accepts text with normal word distribution', () => {
      const doc = makeLegalDoc(4, 40)
      const result = aiResponseSchema.safeParse(doc)
      expect(result.success).toBe(true)
    })
  })

  describe('combined validation', () => {
    it('reports multiple issues when several checks fail', () => {
      // Empty string fails min length; other refinements don't run (Zod short-circuits on min)
      const result = aiResponseSchema.safeParse('')
      expect(result.success).toBe(false)
      expect(result.error!.issues.length).toBeGreaterThanOrEqual(1)
    })

    it('a realistic AI-generated demand letter passes', () => {
      const demandLetter = `RE: Demand for Payment — Smith v. Jones
Date: March 24, 2026

Dear Mr. Jones,

I am writing on behalf of myself, John Smith, regarding the outstanding debt of $5,000 arising from our agreement dated January 15, 2026, for home renovation services at 123 Main Street, Austin, Texas.

Despite repeated requests for payment, you have failed to remit the agreed-upon amount for the completed work. The renovation was completed on February 28, 2026, and was accepted by you without objection at the time of completion.

I hereby demand payment in full of $5,000 within fourteen (14) days of receipt of this letter. If payment is not received by April 7, 2026, I intend to pursue all available remedies, which may include filing a claim in small claims court.

Please direct payment to the address above or contact me to discuss a payment arrangement.

Sincerely,
John Smith
123 Oak Avenue
Austin, TX 78701`

      const result = aiResponseSchema.safeParse(demandLetter)
      expect(result.success).toBe(true)
    })
  })
})
