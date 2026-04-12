import { describe, it, expect } from 'vitest'
import { reviewFilingRequestSchema } from '@lawyer-free/shared/schemas/review-filing'

describe('reviewFilingRequestSchema', () => {
  it('accepts valid request', () => {
    const result = reviewFilingRequestSchema.safeParse({
      petitionDraft: 'IN THE JUSTICE COURT...',
      state: 'TX',
      disputeType: 'debt_collection',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty draft', () => {
    const result = reviewFilingRequestSchema.safeParse({
      petitionDraft: '',
      state: 'TX',
      disputeType: 'debt_collection',
    })
    expect(result.success).toBe(false)
  })

  it('rejects unsupported state', () => {
    const result = reviewFilingRequestSchema.safeParse({
      petitionDraft: 'draft',
      state: 'XX',
      disputeType: 'debt_collection',
    })
    expect(result.success).toBe(false)
  })

  it('accepts optional subType', () => {
    const result = reviewFilingRequestSchema.safeParse({
      petitionDraft: 'draft text here',
      state: 'TX',
      disputeType: 'debt_collection',
      subType: 'credit_card',
    })
    expect(result.success).toBe(true)
  })
})
