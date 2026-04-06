import { describe, it, expect } from 'vitest'
import { validateAnswerCitations, sanitizeDirectiveLanguage } from '@/lib/courtlistener/validators'

describe('validateAnswerCitations', () => {
  it('flags sentences missing citations', () => {
    const answer = 'The court requires notice. This is supported. [Smith v. Jones, 5th Cir. (2019)]'
    const result = validateAnswerCitations(answer)

    expect(result.ok).toBe(false)
    expect(result.missing.length).toBeGreaterThan(0)
  })

  it('passes when each sentence has a citation', () => {
    const answer = 'Notice is required. [Smith v. Jones, 5th Cir. (2019)]\nService must be proper. [Doe v. State, Tex. App. (2020)]'
    const result = validateAnswerCitations(answer)

    expect(result.ok).toBe(true)
    expect(result.missing).toEqual([])
  })
})

describe('sanitizeDirectiveLanguage', () => {
  it('softens directive language', () => {
    const text = 'You must file within 20 days.'
    const sanitized = sanitizeDirectiveLanguage(text)

    expect(sanitized).not.toContain('must file')
    expect(sanitized).toContain('may need to consider')
  })
})
