import { describe, it, expect } from 'vitest'
import {
  buildDebtValidationLetterPrompt,
  debtValidationLetterFactsSchema,
  type DebtValidationLetterFacts,
} from '@lawyer-free/shared/rules/debt-validation-letter-prompts'

function makeFacts(overrides: Partial<DebtValidationLetterFacts> = {}): DebtValidationLetterFacts {
  return debtValidationLetterFactsSchema.parse({
    your_info: { full_name: 'Jane Doe' },
    creditor_name: 'Acme Collections LLC',
    original_amount: 5000,
    current_amount_claimed: 7500,
    ...overrides,
  })
}

describe('debtValidationLetterFactsSchema', () => {
  it('accepts valid facts', () => {
    const result = debtValidationLetterFactsSchema.safeParse({
      your_info: { full_name: 'Jane Doe' },
      creditor_name: 'Acme Collections LLC',
      original_amount: 5000,
      current_amount_claimed: 7500,
    })
    expect(result.success).toBe(true)
  })

  it('accepts valid facts with all optional fields', () => {
    const result = debtValidationLetterFactsSchema.safeParse({
      your_info: { full_name: 'Jane Doe', address: '123 Main St', city: 'Houston', state: 'TX', zip: '77001' },
      creditor_name: 'Acme Collections LLC',
      debt_buyer_name: 'Portfolio Recovery Associates',
      account_last4: '4321',
      original_amount: 5000,
      current_amount_claimed: 7500,
      service_date: '2025-12-01',
      county: 'Harris',
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing creditor_name', () => {
    const result = debtValidationLetterFactsSchema.safeParse({
      your_info: { full_name: 'Jane Doe' },
      original_amount: 5000,
      current_amount_claimed: 7500,
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty creditor_name', () => {
    const result = debtValidationLetterFactsSchema.safeParse({
      your_info: { full_name: 'Jane Doe' },
      creditor_name: '',
      original_amount: 5000,
      current_amount_claimed: 7500,
    })
    expect(result.success).toBe(false)
  })

  it('rejects zero original_amount', () => {
    const result = debtValidationLetterFactsSchema.safeParse({
      your_info: { full_name: 'Jane Doe' },
      creditor_name: 'Acme Collections LLC',
      original_amount: 0,
      current_amount_claimed: 7500,
    })
    expect(result.success).toBe(false)
  })

  it('rejects negative current_amount_claimed', () => {
    const result = debtValidationLetterFactsSchema.safeParse({
      your_info: { full_name: 'Jane Doe' },
      creditor_name: 'Acme Collections LLC',
      original_amount: 5000,
      current_amount_claimed: -100,
    })
    expect(result.success).toBe(false)
  })
})

describe('buildDebtValidationLetterPrompt', () => {
  it('returns object with system and user strings', () => {
    const result = buildDebtValidationLetterPrompt(makeFacts())
    expect(typeof result.system).toBe('string')
    expect(typeof result.user).toBe('string')
    expect(result.system.length).toBeGreaterThan(0)
    expect(result.user.length).toBeGreaterThan(0)
  })

  it('system prompt includes "FDCPA"', () => {
    const result = buildDebtValidationLetterPrompt(makeFacts())
    expect(result.system).toContain('FDCPA')
  })

  it('system prompt includes "1692g"', () => {
    const result = buildDebtValidationLetterPrompt(makeFacts())
    expect(result.system).toContain('1692g')
  })

  it('system prompt includes "DRAFT"', () => {
    const result = buildDebtValidationLetterPrompt(makeFacts())
    expect(result.system).toContain('DRAFT')
  })

  it('system prompt includes 30-day validation period', () => {
    const result = buildDebtValidationLetterPrompt(makeFacts())
    expect(result.system).toContain('30')
  })

  it('system prompt includes chain of title / proof of ownership demand', () => {
    const result = buildDebtValidationLetterPrompt(makeFacts())
    const systemLower = result.system.toLowerCase()
    expect(systemLower).toContain('chain of title')
  })

  it('system prompt includes ANNOTATIONS section instruction', () => {
    const result = buildDebtValidationLetterPrompt(makeFacts())
    expect(result.system).toContain('---ANNOTATIONS---')
  })

  it('user prompt includes creditor name', () => {
    const result = buildDebtValidationLetterPrompt(makeFacts())
    expect(result.user).toContain('Acme Collections LLC')
  })

  it('user prompt includes original and claimed amounts', () => {
    const result = buildDebtValidationLetterPrompt(makeFacts())
    expect(result.user).toContain('5,000')
    expect(result.user).toContain('7,500')
  })

  it('user prompt includes sender name', () => {
    const result = buildDebtValidationLetterPrompt(makeFacts())
    expect(result.user).toContain('Jane Doe')
  })

  it('user prompt includes debt buyer name when provided', () => {
    const result = buildDebtValidationLetterPrompt(makeFacts({
      debt_buyer_name: 'Portfolio Recovery Associates',
    }))
    expect(result.user).toContain('Portfolio Recovery Associates')
  })

  it('user prompt includes account last4 when provided', () => {
    const result = buildDebtValidationLetterPrompt(makeFacts({
      account_last4: '9876',
    }))
    expect(result.user).toContain('9876')
  })

  it('user prompt includes service date when provided', () => {
    const result = buildDebtValidationLetterPrompt(makeFacts({
      service_date: '2025-11-15',
    }))
    expect(result.user).toContain('2025-11-15')
  })

  it('user prompt includes county when provided', () => {
    const result = buildDebtValidationLetterPrompt(makeFacts({
      county: 'Travis',
    }))
    expect(result.user).toContain('Travis')
  })
})
